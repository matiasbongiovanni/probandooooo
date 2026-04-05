import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function hashSourceId(date: string, amount: string, desc: string) {
  return crypto.createHash("md5").update(`${date}|${amount}|${desc}`).digest("hex")
}

function parseCSV(text: string): Array<{ date: string; description: string; amount: number; type: "income" | "expense" }> {
  const lines = text.trim().split("\n").filter(Boolean)
  const results: any[] = []

  // Try to detect header and skip it
  let startRow = 0
  const firstLine = lines[0]?.toLowerCase() ?? ""
  if (firstLine.includes("fecha") || firstLine.includes("date") || firstLine.includes("descripcion")) {
    startRow = 1
  }

  for (let i = startRow; i < lines.length; i++) {
    const cols = lines[i].split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ""))
    if (cols.length < 2) continue

    // Try common BNA CSV formats: Date, Description, Debit, Credit  OR  Date, Description, Amount
    const dateStr = cols[0]
    const description = cols[1] ?? ""

    if (cols.length >= 4) {
      // Debit / Credit split columns
      const debit = parseFloat(cols[2]?.replace(/\./g, "").replace(",", ".") || "0") || 0
      const credit = parseFloat(cols[3]?.replace(/\./g, "").replace(",", ".") || "0") || 0
      if (debit > 0) results.push({ date: dateStr, description, amount: debit, type: "expense" })
      if (credit > 0) results.push({ date: dateStr, description, amount: credit, type: "income" })
    } else if (cols.length === 3) {
      // Date, Description, Amount (negative = expense)
      const raw = parseFloat(cols[2]?.replace(/\./g, "").replace(",", ".") || "0") || 0
      if (raw !== 0) {
        results.push({ date: dateStr, description, amount: Math.abs(raw), type: raw < 0 ? "expense" : "income" })
      }
    }
  }
  return results
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const context = (formData.get("context") as string) ?? "personal"

  if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })

  const text = await file.text()
  let rows: ReturnType<typeof parseCSV> = []

  if (file.name.endsWith(".csv") || file.type === "text/csv") {
    rows = parseCSV(text)
  } else {
    return NextResponse.json({ error: "Formato no soportado. Usá CSV por ahora." }, { status: 400 })
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: "No se pudieron parsear transacciones del archivo." }, { status: 400 })
  }

  let imported = 0
  let skipped = 0

  for (const row of rows) {
    const sourceId = hashSourceId(row.date, String(row.amount), row.description)
    // Normalize date
    let isoDate: string
    try {
      // Try DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD
      const parts = row.date.split(/[-/]/)
      if (parts[0].length === 4) {
        isoDate = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`).toISOString()
      } else if (parseInt(parts[0]) > 12) {
        isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).toISOString()
      } else {
        isoDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`).toISOString()
      }
      if (isNaN(new Date(isoDate).getTime())) throw new Error("Invalid date")
    } catch {
      skipped++
      continue
    }

    const { error } = await supabase.from("transactions").upsert({
      user_id: user.id,
      type: row.type,
      amount: row.amount,
      currency: "ARS",
      description: row.description,
      source: "bna",
      source_id: sourceId,
      date: isoDate,
      context,
    }, { onConflict: "user_id,source,source_id", ignoreDuplicates: true })

    if (error) skipped++
    else imported++
  }

  return NextResponse.json({ success: true, imported, skipped, total: rows.length })
}

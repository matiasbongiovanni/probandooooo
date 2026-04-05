import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const context = searchParams.get("context") ?? "personal"
  const type = searchParams.get("type")
  const source = searchParams.get("source")
  const category = searchParams.get("category")
  const currency = searchParams.get("currency")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const page = parseInt(searchParams.get("page") ?? "1")
  const limit = parseInt(searchParams.get("limit") ?? "20")
  const offset = (page - 1) * limit

  let query = supabase
    .from("transactions")
    .select("*, finance_categories(name, color)", { count: "exact" })
    .eq("user_id", user.id)
    .eq("context", context)
    .order("date", { ascending: false })
    .range(offset, offset + limit - 1)

  if (type && type !== "all") query = query.eq("type", type)
  if (source && source !== "all") query = query.eq("source", source)
  if (category && category !== "all") query = query.eq("category_id", category)
  if (currency && currency !== "all") query = query.eq("currency", currency)
  if (from) query = query.gte("date", from)
  if (to) query = query.lte("date", to)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data, total: count, page, limit })
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { type, amount, currency, description, category_id, source, date, context, metadata } = body

  if (!type || !amount || !source || !date) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type,
      amount: parseFloat(amount),
      currency: currency ?? "ARS",
      description,
      category_id: category_id || null,
      source: source ?? "manual",
      date,
      context: context ?? "personal",
      metadata,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

const IOL_BASE = "https://api.invertironline.com"

async function getIOLToken(username: string, password: string) {
  const res = await fetch(`${IOL_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password, grant_type: "password" }),
  })
  if (!res.ok) throw new Error("IOL auth failed")
  return res.json()
}

export async function POST(_req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "iol")
    .single()

  if (!integration?.extra?.username || !integration?.extra?.password) {
    return NextResponse.json({ error: "IOL no configurado. Agregá usuario y contraseña en Integraciones." }, { status: 400 })
  }

  try {
    // Authenticate
    const tokenData = await getIOLToken(integration.extra.username, integration.extra.password)
    const token = tokenData.access_token

    // Fetch portfolio (mercados: bCBA, nYSE, nASDAQ, etc.)
    const markets = ["bCBA"]
    let totalAssets = 0

    for (const market of markets) {
      const res = await fetch(`${IOL_BASE}/api/v2/portafolio/${market}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) continue
      const data = await res.json()

      for (const position of data.activos ?? []) {
        await supabase.from("portfolio_assets").upsert({
          user_id: user.id,
          provider: "iol",
          asset: position.titulo?.simbolo ?? position.descripcion,
          quantity: position.cantidad,
          avg_price: position.precioPromedio,
          current_price: position.ultimoPrecio,
          currency: market === "bCBA" ? "ARS" : "USD",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,provider,asset" })
        totalAssets++
      }
    }

    // Save token for reuse
    await supabase.from("integrations").update({
      access_token: token,
      last_sync: new Date().toISOString(),
      status: "active",
    }).eq("user_id", user.id).eq("provider", "iol")

    return NextResponse.json({ success: true, assetsUpdated: totalAssets })
  } catch (err: any) {
    await supabase.from("integrations")
      .update({ status: "error" })
      .eq("user_id", user.id)
      .eq("provider", "iol")
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

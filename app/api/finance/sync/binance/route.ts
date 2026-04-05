import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

function sign(queryString: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(queryString).digest("hex")
}

async function binanceFetch(path: string, apiKey: string, apiSecret: string, params: Record<string, string> = {}) {
  const timestamp = Date.now().toString()
  const queryString = new URLSearchParams({ ...params, timestamp }).toString()
  const signature = sign(queryString, apiSecret)
  const url = `https://api.binance.com${path}?${queryString}&signature=${signature}`
  const res = await fetch(url, { headers: { "X-MBX-APIKEY": apiKey } })
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`)
  return res.json()
}

export async function POST(_req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Get stored credentials
  const { data: integration } = await supabase
    .from("integrations")
    .select("api_key, api_secret")
    .eq("user_id", user.id)
    .eq("provider", "binance")
    .single()

  if (!integration?.api_key || !integration?.api_secret) {
    return NextResponse.json({ error: "Binance no configurado. Agregá tus API keys en Integraciones." }, { status: 400 })
  }

  try {
    // Fetch account balances
    const account = await binanceFetch("/api/v3/account", integration.api_key, integration.api_secret)
    const balances = (account.balances ?? []).filter((b: any) => parseFloat(b.free) + parseFloat(b.locked) > 0)

    // Upsert portfolio assets
    for (const b of balances) {
      const total = parseFloat(b.free) + parseFloat(b.locked)
      await supabase.from("portfolio_assets").upsert({
        user_id: user.id,
        provider: "binance",
        asset: b.asset,
        quantity: total,
        currency: "USD",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,provider,asset" })
    }

    // Update last_sync
    await supabase.from("integrations")
      .update({ last_sync: new Date().toISOString(), status: "active" })
      .eq("user_id", user.id)
      .eq("provider", "binance")

    return NextResponse.json({ success: true, assetsUpdated: balances.length })
  } catch (err: any) {
    await supabase.from("integrations")
      .update({ status: "error" })
      .eq("user_id", user.id)
      .eq("provider", "binance")
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabase
    .from("integrations")
    .select("id, provider, last_sync, status, extra")
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { provider, api_key, api_secret, extra } = body

  if (!provider) return NextResponse.json({ error: "provider requerido" }, { status: 400 })

  const { data, error } = await supabase
    .from("integrations")
    .upsert({
      user_id: user.id,
      provider,
      api_key: api_key ?? null,
      api_secret: api_secret ?? null,
      extra: extra ?? null,
      status: "active",
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider" })
    .select("id, provider, status, last_sync")
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

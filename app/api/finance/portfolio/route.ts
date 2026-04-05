import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const provider = req.nextUrl.searchParams.get("provider")

  let query = supabase
    .from("portfolio_assets")
    .select("*")
    .eq("user_id", user.id)
    .order("provider")
    .order("asset")

  if (provider && provider !== "all") query = query.eq("provider", provider)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

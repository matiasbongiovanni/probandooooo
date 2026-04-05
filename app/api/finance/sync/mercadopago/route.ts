import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(_req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const accessToken = process.env.MP_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ error: "MP_ACCESS_TOKEN no configurado" }, { status: 400 })
  }

  try {
    // Fetch approved payments from MercadoPago
    const res = await fetch(
      "https://api.mercadopago.com/v1/payments/search?status=approved&limit=100",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!res.ok) throw new Error(`MP API error: ${res.status}`)
    const data = await res.json()

    let imported = 0
    for (const payment of data.results ?? []) {
      const { error } = await supabase.from("transactions").upsert({
        user_id: user.id,
        type: "income",
        amount: payment.transaction_amount,
        currency: payment.currency_id ?? "ARS",
        description: payment.description ?? `Pago MP #${payment.id}`,
        source: "mercadopago",
        source_id: String(payment.id),
        date: payment.date_approved ?? payment.date_created,
        context: "personal",
        metadata: {
          payment_method: payment.payment_method_id,
          payer: payment.payer?.email,
          external_reference: payment.external_reference,
        },
      }, { onConflict: "user_id,source,source_id", ignoreDuplicates: true })

      if (!error) imported++
    }

    return NextResponse.json({ success: true, imported, total: data.results?.length ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

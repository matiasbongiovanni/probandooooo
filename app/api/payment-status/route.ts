import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const paymentId = request.nextUrl.searchParams.get("payment_id")
    const externalReference = request.nextUrl.searchParams.get("external_reference")

    if (!paymentId || !externalReference) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Check payment status in our database
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("external_reference", externalReference)
      .single()

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // If payment is still pending, check with MercadoPago
    if (payment.status === "pending") {
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      })

      if (paymentResponse.ok) {
        const mpPayment = await paymentResponse.json()

        // Update our database with the latest status
        if (mpPayment.status !== payment.status) {
          await supabase.from("payments").update({ status: mpPayment.status }).eq("id", payment.id)
        }

        return NextResponse.json({
          status: mpPayment.status,
          payment_id: paymentId,
          external_reference: externalReference,
        })
      }
    }

    return NextResponse.json({
      status: payment.status,
      payment_id: paymentId,
      external_reference: externalReference,
    })
  } catch (error) {
    console.error("Payment status check error:", error)
    return NextResponse.json({ error: "Error checking payment status" }, { status: 500 })
  }
}

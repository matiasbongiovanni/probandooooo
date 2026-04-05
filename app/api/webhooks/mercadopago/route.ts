import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createRouteHandlerClient({ cookies })

    console.log("Webhook received:", body)

    if (body.type === "payment") {
      const paymentId = body.data.id

      // Get payment details from MercadoPago using REST API
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        },
      })

      if (!paymentResponse.ok) {
        throw new Error(`Failed to fetch payment: ${paymentResponse.status}`)
      }

      const payment = await paymentResponse.json()

      if (payment.status === "approved") {
        const externalReference = payment.external_reference
        const [eventId, userId] = externalReference.split("-")

        // Update payment status
        await supabase
          .from("payments")
          .update({
            status: "completed",
            mp_payment_id: paymentId,
          })
          .eq("external_reference", externalReference)

        // Create unique ticket
        const ticketId = uuidv4()
        await supabase.from("tickets").insert({
          id: ticketId,
          user_id: userId,
          event_id: eventId,
          status: "active",
          created_at: new Date().toISOString(),
        })

        console.log(`Ticket created: ${ticketId} for user ${userId} and event ${eventId}`)

        // ── Finance Dashboard: record income transaction ──
        if (userId) {
          await supabase.from("transactions").upsert({
            user_id: userId,
            type: "income",
            amount: payment.transaction_amount,
            currency: payment.currency_id ?? "ARS",
            description: payment.description ?? `Pago MP #${paymentId}`,
            source: "mercadopago",
            source_id: String(paymentId),
            date: payment.date_approved ?? payment.date_created ?? new Date().toISOString(),
            context: "personal",
            metadata: {
              payment_method: payment.payment_method_id,
              payer: payment.payer?.email,
              external_reference: externalReference,
              event_id: eventId,
            },
          }, { onConflict: "user_id,source,source_id", ignoreDuplicates: true })
          console.log(`Finance transaction recorded for payment ${paymentId}`)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

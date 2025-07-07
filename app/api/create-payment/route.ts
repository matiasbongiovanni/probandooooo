import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { eventId, eventTitle, price, userId } = await request.json()

    console.log("Creating payment for:", { eventId, eventTitle, price, userId })

    const supabase = createRouteHandlerClient({ cookies })

    // Verify user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      console.log("Unauthorized access attempt:", { userId, user: user?.id })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has a ticket
    const { data: existingTicket } = await supabase
      .from("tickets")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (existingTicket) {
      console.log("User already has ticket:", existingTicket.id)
      return NextResponse.json({ error: "Ya tienes acceso a este evento" }, { status: 400 })
    }

    // Validate environment variables
    const accessToken = process.env.MP_ACCESS_TOKEN
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!accessToken) {
      console.error("Missing MP_ACCESS_TOKEN environment variable")
      return NextResponse.json({ error: "Configuración de pago incompleta" }, { status: 500 })
    }

    if (!publicKey) {
      console.error("Missing NEXT_PUBLIC_MP_PUBLIC_KEY environment variable")
      return NextResponse.json({ error: "Configuración de pago incompleta" }, { status: 500 })
    }

    // Create payment preference using MercadoPago REST API
    const preferenceData = {
      items: [
        {
          title: eventTitle,
          unit_price: price,
          quantity: 1,
          currency_id: "ARS",
        },
      ],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${siteUrl || "http://localhost:3000"}/payment/success`,
        failure: `${siteUrl || "http://localhost:3000"}/payment/failure`,
        pending: `${siteUrl || "http://localhost:3000"}/payment/pending`,
      },
      auto_return: "approved",
      external_reference: `${eventId}-${userId}`,
      notification_url: `${siteUrl || "http://localhost:3000"}/api/webhooks/mercadopago`,
    }

    console.log("Creating MercadoPago preference with data:", preferenceData)

    // Make direct API call to MercadoPago
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferenceData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("MercadoPago API error:", response.status, errorText)
      throw new Error(`MercadoPago API error: ${response.status} - ${errorText}`)
    }

    const preference = await response.json()
    console.log("MercadoPago preference created:", preference.id)

    // Store payment intent in database
    const { error: dbError } = await supabase.from("payments").insert({
      user_id: userId,
      event_id: eventId,
      amount: price,
      currency: "ARS",
      payment_id: preference.id,
      status: "pending",
      external_reference: `${eventId}-${userId}`,
    })

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Error al guardar el pago" }, { status: 500 })
    }

    return NextResponse.json({
      id: preference.id,
      init_point: preference.init_point,
      preference_id: preference.id,
      mercadopago_public_key: publicKey,
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ 
      error: "Error al crear el pago",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test MercadoPago configuration
    const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
    const accessToken = process.env.MP_ACCESS_TOKEN
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    return NextResponse.json({
      publicKey: publicKey ? "Configured" : "Missing",
      accessToken: accessToken ? "Configured" : "Missing",
      siteUrl: siteUrl || "Missing",
      testPublicKey: publicKey,
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({ error: "Test failed" }, { status: 500 })
  }
} 
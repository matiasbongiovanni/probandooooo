"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ConfigData {
  publicKey?: string
  accessToken?: string
  siteUrl?: string
  testPublicKey?: string
  error?: string
}

export function DebugPayment() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(false)

  const testConfig = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-mercadopago")
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error("Test failed:", error)
      setConfig({ error: "Test failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Debug Payment Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConfig} disabled={loading}>
          {loading ? "Testing..." : "Test Configuration"}
        </Button>
        
        {config && (
          <div className="text-sm space-y-2">
            <div><strong>Public Key:</strong> {config.publicKey}</div>
            <div><strong>Access Token:</strong> {config.accessToken}</div>
            <div><strong>Site URL:</strong> {config.siteUrl}</div>
            {config.testPublicKey && (
              <div><strong>Test Key:</strong> {config.testPublicKey.substring(0, 20)}...</div>
            )}
            {config.error && (
              <div className="text-red-600"><strong>Error:</strong> {config.error}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
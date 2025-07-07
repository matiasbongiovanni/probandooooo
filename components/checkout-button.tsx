"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"

// Simple toast fallback if useToast is missing
function useToast() {
  return {
    toast: ({ title, description }: { title: string; description: string }) => {
      if (typeof window !== "undefined") {
        window.alert(`${title}\n${description}`)
      }
    },
  }
}

interface CheckoutButtonProps {
  eventId: string
  eventTitle: string
  price: number
  userId: string
}

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: { locale: string }) => {
      checkout: (options: {
        preference: { id: string }
        autoOpen: boolean
        theme: { elementsColor: string; headerColor: string }
      }) => void
    }
  }
}

export function CheckoutButton({ eventId, eventTitle, price, userId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Load MercadoPago SDK if not already loaded
  const loadMercadoPago = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.MercadoPago) {
        resolve()
        return
      }
      const script = document.createElement("script")
      script.src = "https://sdk.mercadopago.com/js/v2"
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("No se pudo cargar MercadoPago"))
      document.body.appendChild(script)
    })
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      // 1. Create payment preference on backend
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          eventTitle,
          price,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al crear el pago")
      }

      const data = await response.json()

      if (!data.id || !data.mercadopago_public_key) {
        throw new Error("Error al crear el pago: datos incompletos")
      }

      // 2. Load MercadoPago SDK
      await loadMercadoPago()

      // 3. Initialize MercadoPago Checkout Pro
      const mp = new window.MercadoPago(data.mercadopago_public_key, {
        locale: "es-AR",
      })

      // Use the init_point URL directly for redirect
      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        // Fallback to checkout method
        mp.checkout({
          preference: {
            id: data.id,
          },
          autoOpen: true,
          theme: {
            elementsColor: "#111827",
            headerColor: "#111827",
          },
        })
      }
    } catch (e) {
      console.error("Checkout error:", e)
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "No se pudo procesar el pago. Intenta nuevamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} className="w-full" size="lg">
      <CreditCard className="w-4 h-4 mr-2" />
      {loading ? "Procesando..." : "Comprar Acceso"}
    </Button>
  )
}

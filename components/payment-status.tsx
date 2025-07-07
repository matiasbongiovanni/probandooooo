"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

interface PaymentStatusProps {
  status: "success" | "failure" | "pending"
  paymentId?: string
  eventId?: string
}

export function PaymentStatus({ status, paymentId, eventId }: PaymentStatusProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState(status)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (paymentId && status === "pending") {
        try {
          const response = await fetch(`/api/payment-status?payment_id=${paymentId}&external_reference=${eventId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.status === "approved") {
              setCurrentStatus("success")
            } else if (data.status === "rejected") {
              setCurrentStatus("failure")
            }
          }
        } catch (error) {
          console.error("Error checking payment status:", error)
        }
      }
      setIsLoading(false)
    }

    const timer = setTimeout(checkPaymentStatus, 1000)
    return () => clearTimeout(timer)
  }, [paymentId, status, eventId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Verificando estado del pago...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = {
    success: {
      icon: <CheckCircle className="w-8 h-8 text-green-600" />,
      title: "¡Pago Exitoso!",
      description: "Tu pago ha sido procesado correctamente. Ya tienes acceso al evento.",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    failure: {
      icon: <XCircle className="w-8 h-8 text-red-600" />,
      title: "Pago Fallido",
      description: "Hubo un problema procesando tu pago. Por favor, intenta nuevamente.",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
    pending: {
      icon: <Clock className="w-8 h-8 text-yellow-600" />,
      title: "Pago Pendiente",
      description: "Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
  }

  const config = statusConfig[currentStatus]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className={`mx-auto w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mb-4`}>
            {config.icon}
          </div>
          <CardTitle className={`text-2xl ${config.textColor}`}>{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentId && <p className="text-sm text-muted-foreground">ID de pago: {paymentId}</p>}

          <div className="flex flex-col space-y-2">
            {currentStatus === "success" && (
              <Button asChild>
                <Link href="/dashboard">Ver Mis Tickets</Link>
              </Button>
            )}

            {currentStatus === "failure" && eventId && (
              <Button asChild>
                <Link href={`/events/${eventId}`}>Intentar Nuevamente</Link>
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link href="/">Volver a Eventos</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CheckoutButton } from "@/components/checkout-button"
import { DebugPayment } from "@/components/debug-payment"

interface EventPageProps {
  params: {
    id: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Fetch event by id
  const { data: event } = await supabase.from("events").select("*").eq("id", params.id).single()

  if (!event) {
    notFound()
  }

  // Check if user already has a ticket for this event
  const { data: existingTicket } = await supabase
    .from("tickets")
    .select("*")
    .eq("event_id", params.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Eventos
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Image */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={event.thumbnail_url || "/placeholder.svg?height=400&width=600"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{event.category}</Badge>
                <Badge variant="outline">{event.status}</Badge>
              </div>
              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
              <p className="text-muted-foreground text-lg">{event.description}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detalles del Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {/* Fix: Use event_date as string, fallback to empty if missing */}
                      {event.event_date
                        ? new Date(event.event_date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Fecha no disponible"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {event.event_date
                        ? new Date(event.event_date).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {/* Fix: Show 0 if null/undefined */}
                      {(event.current_viewers ?? 0)}/{event.max_viewers ?? 0} espectadores
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Acceso al Evento
                  <span className="text-2xl font-bold text-primary">
                    {/* Fix: Show $0 if price is null/undefined */}
                    ${typeof event.price === "number" ? event.price.toLocaleString("es-AR") : "0"}
                  </span>
                </CardTitle>
                <CardDescription>Obtén acceso completo a la transmisión en vivo</CardDescription>
              </CardHeader>
              <CardContent>
                {existingTicket ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-medium">¡Ya tienes acceso a este evento!</p>
                      <p className="text-green-600 text-sm">Ticket ID: {existingTicket.id}</p>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/stream/${event.id}?ticket=${existingTicket.id}`}>Ver Transmisión</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <CheckoutButton
                      eventId={event.id}
                      eventTitle={event.title}
                      price={typeof event.price === "number" ? event.price : 0}
                      userId={user.id}
                    />
                    <DebugPayment />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

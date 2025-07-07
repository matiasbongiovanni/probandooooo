import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StreamPlayer } from "@/components/stream-player"

interface StreamPageProps {
  params: {
    id: string
  }
  searchParams: {
    ticket?: string
  }
}

export default async function StreamPage({ params, searchParams }: StreamPageProps) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Verify ticket access
  const { data: ticket } = await supabase
    .from("tickets")
    .select("*, events(*)")
    .eq("id", searchParams.ticket)
    .eq("user_id", user.id)
    .eq("event_id", params.id)
    .eq("status", "active")
    .single()

  if (!ticket) {
    redirect(`/events/${params.id}`)
  }

  const event = ticket.events

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-4">
        {/* Event Info Bar */}
        <div className="mb-4 flex items-center justify-between bg-background/10 backdrop-blur-sm rounded-lg p-4">
          <div>
            <h1 className="text-white text-xl font-bold">{event.title}</h1>
            <p className="text-white/70">{event.category}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">EN VIVO</Badge>
            <Badge variant="outline" className="text-white border-white/20">
              Ticket: {ticket.id.slice(0, 8)}...
            </Badge>
          </div>
        </div>

        {/* Stream Player */}
        <Card className="bg-black border-white/10">
          <CardContent className="p-0">
            <StreamPlayer eventId={params.id} ticketId={ticket.id} streamUrl={event.stream_url} />
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card className="mt-4 bg-background/10 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Información del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/80">{event.description}</p>
            <div className="mt-4 text-sm text-white/60">
              <p>Fecha: {new Date(event.event_date).toLocaleString("es-ES")}</p>
              <p>
                Espectadores: {event.current_viewers}/{event.max_viewers}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

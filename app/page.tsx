import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users } from "lucide-react"
import { AuthButton } from "@/components/auth-button"

export const dynamic = "force-dynamic"

interface Event {
  id: string
  title: string
  description: string
  price: number
  event_date: string
  thumbnail_url: string
  category: string
  max_viewers: number
  current_viewers: number
}

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "active")
    .order("event_date", { ascending: true })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold">SportStream</h1>
          </div>
          <AuthButton user={user} />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Vive los Mejores Eventos Deportivos</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Accede a transmisiones en vivo de alta calidad. Paga solo por los eventos que quieres ver.
          </p>
          {!user && (
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth">Comenzar Ahora</Link>
            </Button>
          )}
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold mb-8 text-center">Próximos Eventos</h3>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: Event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={event.thumbnail_url || "/placeholder.svg?height=200&width=400"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2">{event.category}</Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{event.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.event_date).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {new Date(event.event_date).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {event.current_viewers}/{event.max_viewers} espectadores
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-primary">${event.price.toLocaleString("es-AR")}</div>
                    <Button asChild>
                      <Link href={`/events/${event.id}`}>Ver Detalles</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No hay eventos disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

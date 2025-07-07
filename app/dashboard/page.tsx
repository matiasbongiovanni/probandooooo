import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Ticket } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  // Get user's tickets
  const { data: tickets } = await supabase
    .from("tickets")
    .select(`
      *,
      events (
        id,
        title,
        description,
        event_date,
        category,
        thumbnail_url,
        price
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mi Dashboard</h1>
          <p className="text-muted-foreground">Gestiona tus tickets y accede a tus eventos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Activos</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets?.filter((t) => t.status === "active").length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
              <span className="text-lg">$</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${tickets?.reduce((sum, ticket) => sum + (ticket.events?.price || 0), 0).toLocaleString("es-AR") || "0"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos Vistos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Tickets</CardTitle>
            <CardDescription>Todos tus tickets de eventos deportivos</CardDescription>
          </CardHeader>
          <CardContent>
            {tickets && tickets.length > 0 ? (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <img
                        src={ticket.events?.thumbnail_url || "/placeholder.svg?height=60&width=80"}
                        alt={ticket.events?.title}
                        className="w-20 h-15 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold">{ticket.events?.title}</h3>
                        <p className="text-sm text-muted-foreground">{ticket.events?.category}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(ticket.events?.event_date).toLocaleDateString("es-ES")}
                          <Clock className="w-4 h-4 ml-3 mr-1" />
                          {new Date(ticket.events?.event_date).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant={ticket.status === "active" ? "default" : "secondary"}>
                          {ticket.status === "active" ? "Activo" : "Usado"}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${ticket.events?.price.toLocaleString("es-AR")}
                        </p>
                      </div>

                      {ticket.status === "active" && (
                        <Button asChild>
                          <Link href={`/stream/${ticket.events?.id}?ticket=${ticket.id}`}>Ver Evento</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tienes tickets aún. ¡Explora nuestros eventos!</p>
                <Button asChild className="mt-4">
                  <Link href="/">Ver Eventos</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

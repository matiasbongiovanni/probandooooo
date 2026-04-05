"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Upload, Settings, LogOut } from "lucide-react"
import { ContextToggle } from "./ContextToggle"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/finance", label: "Dashboard", icon: LayoutDashboard },
  { href: "/finance/transactions", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/finance/investments", label: "Inversiones", icon: TrendingUp },
  { href: "/finance/import", label: "Importar BNA+", icon: Upload },
  { href: "/finance/settings", label: "Integraciones", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth")
  }

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-slate-900 border-r border-slate-800 px-4 py-6">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-xl font-bold text-white">💰 Finanzas</h1>
        <p className="text-xs text-slate-400 mt-1">Dashboard personal</p>
      </div>

      {/* Context toggle */}
      <div className="mb-6 px-2">
        <ContextToggle />
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/finance" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors mt-4"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </aside>
  )
}

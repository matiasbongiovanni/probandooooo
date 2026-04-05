"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Settings } from "lucide-react"

const navItems = [
  { href: "/finance", label: "Inicio", icon: LayoutDashboard },
  { href: "/finance/transactions", label: "Movimientos", icon: ArrowLeftRight },
  { href: "/finance/investments", label: "Inversiones", icon: TrendingUp },
  { href: "/finance/settings", label: "Config", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-800 bg-slate-900 px-2 pb-safe">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/finance" && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-3 py-3 text-xs font-medium transition-colors ${
              isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

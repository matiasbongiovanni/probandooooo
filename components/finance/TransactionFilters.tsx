"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"

const SOURCES = [
  { value: "all", label: "Todas las fuentes" },
  { value: "mercadopago", label: "MercadoPago" },
  { value: "binance", label: "Binance" },
  { value: "bna", label: "BNA+" },
  { value: "iol", label: "IOL" },
  { value: "cocos", label: "Cocos" },
  { value: "manual", label: "Manual" },
]

const TYPES = [
  { value: "all", label: "Todos" },
  { value: "income", label: "Ingresos" },
  { value: "expense", label: "Egresos" },
]

const CURRENCIES = [
  { value: "all", label: "Todas" },
  { value: "ARS", label: "ARS" },
  { value: "USD", label: "USD" },
  { value: "USDT", label: "USDT" },
]

const PERIODS = [
  { value: "this_month", label: "Este mes" },
  { value: "last_month", label: "Mes anterior" },
  { value: "last_3", label: "Últimos 3 meses" },
  { value: "last_year", label: "Último año" },
  { value: "all", label: "Todo" },
]

function periodToDates(period: string) {
  const now = new Date()
  const pad = (d: Date) => d.toISOString()
  if (period === "this_month") {
    return { from: pad(new Date(now.getFullYear(), now.getMonth(), 1)), to: pad(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)) }
  }
  if (period === "last_month") {
    return { from: pad(new Date(now.getFullYear(), now.getMonth() - 1, 1)), to: pad(new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)) }
  }
  if (period === "last_3") {
    const d = new Date(now); d.setMonth(d.getMonth() - 3)
    return { from: pad(d), to: pad(now) }
  }
  if (period === "last_year") {
    const d = new Date(now); d.setFullYear(d.getFullYear() - 1)
    return { from: pad(d), to: pad(now) }
  }
  return { from: undefined, to: undefined }
}

export function TransactionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === "all" || !value) {
        params.delete(key)
      } else {
        params.set(key, value)
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const handlePeriod = (period: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const { from, to } = periodToDates(period)
    if (from) params.set("from", from); else params.delete("from")
    if (to) params.set("to", to); else params.delete("to")
    router.replace(`${pathname}?${params.toString()}`)
  }

  const selectClass = "rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select className={selectClass} onChange={(e) => handlePeriod(e.target.value)} defaultValue="this_month">
        {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>

      <select className={selectClass} onChange={(e) => update("type", e.target.value)} value={searchParams.get("type") ?? "all"}>
        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      <select className={selectClass} onChange={(e) => update("source", e.target.value)} value={searchParams.get("source") ?? "all"}>
        {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>

      <select className={selectClass} onChange={(e) => update("currency", e.target.value)} value={searchParams.get("currency") ?? "all"}>
        {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
      </select>
    </div>
  )
}

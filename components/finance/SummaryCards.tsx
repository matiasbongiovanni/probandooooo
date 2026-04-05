"use client"

import { ArrowDownCircle, ArrowUpCircle, Wallet, TrendingUp } from "lucide-react"

interface SummaryCardsProps {
  income: number
  expenses: number
  balance: number
  invested: number
  currency?: string
}

function formatCurrency(amount: number, currency = "ARS") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function SummaryCards({ income, expenses, balance, invested, currency = "ARS" }: SummaryCardsProps) {
  const cards = [
    {
      label: "Ingresos",
      value: formatCurrency(income, currency),
      icon: ArrowUpCircle,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      label: "Egresos",
      value: formatCurrency(expenses, currency),
      icon: ArrowDownCircle,
      color: "text-rose-400",
      bg: "bg-rose-400/10",
      border: "border-rose-400/20",
    },
    {
      label: "Balance",
      value: formatCurrency(balance, currency),
      icon: Wallet,
      color: balance >= 0 ? "text-indigo-400" : "text-rose-400",
      bg: "bg-indigo-400/10",
      border: "border-indigo-400/20",
    },
    {
      label: "Invertido",
      value: formatCurrency(invested, "USD"),
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
      border: "border-violet-400/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className={`rounded-xl border ${border} ${bg} p-4`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">{label}</span>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}

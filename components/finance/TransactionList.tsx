"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Trash2, Pencil } from "lucide-react"
import { CurrencyBadge } from "./CurrencyBadge"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  currency: string
  description: string | null
  source: string
  date: string
  finance_categories?: { name: string; color: string } | null
}

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  loading?: boolean
}

const SOURCE_LABELS: Record<string, string> = {
  mercadopago: "MercadoPago",
  binance: "Binance",
  bna: "BNA+",
  iol: "IOL",
  cocos: "Cocos",
  manual: "Manual",
}

export function TransactionList({ transactions, onDelete, loading }: TransactionListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta transacción?")) return
    setDeleting(id)
    await fetch(`/api/finance/transactions/${id}`, { method: "DELETE" })
    onDelete(id)
    setDeleting(null)
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg bg-slate-800 animate-pulse" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-12 text-center">
        <p className="text-slate-500">No hay transacciones con los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
      <ul className="divide-y divide-slate-800">
        {transactions.map((tx) => (
          <li key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800/40 group">
            <span className={`h-2 w-2 rounded-full flex-shrink-0 mt-0.5 ${tx.type === "income" ? "bg-emerald-400" : "bg-rose-400"}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 truncate">{tx.description ?? "Sin descripción"}</p>
              <p className="text-xs text-slate-500">
                {tx.finance_categories?.name
                  ? <span style={{ color: tx.finance_categories.color }}>{tx.finance_categories.name}</span>
                  : null}
                {tx.finance_categories?.name ? " · " : ""}
                {SOURCE_LABELS[tx.source] ?? tx.source} · {format(new Date(tx.date), "dd/MM/yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CurrencyBadge currency={tx.currency} />
              <span className={`text-sm font-semibold ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                {tx.type === "income" ? "+" : "-"}
                {new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(tx.amount)}
              </span>
              <button
                onClick={() => handleDelete(tx.id)}
                disabled={deleting === tx.id}
                className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

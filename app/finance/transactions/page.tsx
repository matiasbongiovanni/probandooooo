"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useFinanceContext } from "@/lib/finance-context"
import { TransactionFilters } from "@/components/finance/TransactionFilters"
import { TransactionList } from "@/components/finance/TransactionList"
import Link from "next/link"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"

function TransactionsContent() {
  const { context } = useFinanceContext()
  const searchParams = useSearchParams()
  const [transactions, setTransactions] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const LIMIT = 20

  useEffect(() => {
    setPage(1)
  }, [searchParams, context])

  useEffect(() => {
    loadTransactions()
  }, [context, searchParams, page])

  async function loadTransactions() {
    setLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set("context", context)
    params.set("page", String(page))
    params.set("limit", String(LIMIT))

    const res = await fetch(`/api/finance/transactions?${params.toString()}`)
    const json = await res.json()
    setTransactions(json.data ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="px-4 py-6 md:px-8 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Transacciones</h1>
          <p className="text-sm text-slate-400">{total} registros</p>
        </div>
        <Link
          href="/finance/transactions/new"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva</span>
        </Link>
      </div>

      {/* Filters */}
      <TransactionFilters />

      {/* List */}
      <TransactionList
        transactions={transactions}
        onDelete={(id) => setTransactions((prev) => prev.filter((t) => t.id !== id))}
        loading={loading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-slate-500 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-slate-400">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-700 p-2 text-slate-400 hover:border-slate-500 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Cargando...</div>}>
      <TransactionsContent />
    </Suspense>
  )
}

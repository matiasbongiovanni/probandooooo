"use client"

import { useEffect, useState } from "react"
import { useFinanceContext } from "@/lib/finance-context"
import { supabase } from "@/lib/supabase"
import { SummaryCards } from "@/components/finance/SummaryCards"
import { IncomeExpenseChart } from "@/components/finance/IncomeExpenseChart"
import { CategoryPieChart } from "@/components/finance/CategoryPieChart"
import { ContextToggle } from "@/components/finance/ContextToggle"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { Plus } from "lucide-react"

const CATEGORY_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
]

export default function FinanceDashboardPage() {
  const { context } = useFinanceContext()
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0, invested: 0 })
  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [context])

  async function loadDashboardData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Current month range
    const now = new Date()
    const from = startOfMonth(now).toISOString()
    const to = endOfMonth(now).toISOString()

    // Summary: income & expenses for current month
    const { data: txs } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("context", context)
      .gte("date", from)
      .lte("date", to)

    const income = (txs ?? []).filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
    const expenses = (txs ?? []).filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)

    // Portfolio total (USD)
    const { data: portfolio } = await supabase
      .from("portfolio_assets")
      .select("quantity, current_price, currency")
      .eq("user_id", user.id)

    const invested = (portfolio ?? []).reduce((s, a) => s + Number(a.quantity) * Number(a.current_price || 0), 0)

    setSummary({ income, expenses, balance: income - expenses, invested })

    // Monthly data for last 6 months
    const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i))
    const monthlyRows = await Promise.all(
      months.map(async (m) => {
        const mFrom = startOfMonth(m).toISOString()
        const mTo = endOfMonth(m).toISOString()
        const { data } = await supabase
          .from("transactions")
          .select("type, amount")
          .eq("user_id", user.id)
          .eq("context", context)
          .gte("date", mFrom)
          .lte("date", mTo)
        const inc = (data ?? []).filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
        const exp = (data ?? []).filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)
        return { month: format(m, "MMM", { locale: es }), income: inc, expenses: exp }
      })
    )
    setMonthlyData(monthlyRows)

    // Category breakdown for current month (expenses)
    const { data: cats } = await supabase
      .from("transactions")
      .select("amount, finance_categories(name, color)")
      .eq("user_id", user.id)
      .eq("context", context)
      .eq("type", "expense")
      .gte("date", from)
      .lte("date", to)

    const catMap: Record<string, { value: number; color: string }> = {}
    ;(cats ?? []).forEach((t: any, i: number) => {
      const name = t.finance_categories?.name ?? "Sin categoría"
      const color = t.finance_categories?.color ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length]
      catMap[name] = {
        value: (catMap[name]?.value ?? 0) + Number(t.amount),
        color,
      }
    })
    setCategoryData(Object.entries(catMap).map(([name, { value, color }]) => ({ name, value, color })))

    // Recent transactions
    const { data: recent } = await supabase
      .from("transactions")
      .select("*, finance_categories(name, color)")
      .eq("user_id", user.id)
      .eq("context", context)
      .order("date", { ascending: false })
      .limit(5)
    setRecentTransactions(recent ?? [])

    setLoading(false)
  }

  const currentMonth = format(new Date(), "MMMM yyyy", { locale: es })

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 capitalize">
            {context === "personal" ? "Mis Finanzas" : "Agencia"}
          </h1>
          <p className="text-sm text-slate-400 capitalize">{currentMonth}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <ContextToggle />
          </div>
          <Link
            href="/finance/transactions/new"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva transacción</span>
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <SummaryCards
          income={summary.income}
          expenses={summary.expenses}
          balance={summary.balance}
          invested={summary.invested}
        />
      )}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <>
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 h-64 animate-pulse" />
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 h-64 animate-pulse" />
          </>
        ) : (
          <>
            <IncomeExpenseChart data={monthlyData} />
            <CategoryPieChart data={categoryData} title="Egresos por categoría" />
          </>
        )}
      </div>

      {/* Recent transactions */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-300">Últimas transacciones</h3>
          <Link href="/finance/transactions" className="text-xs text-indigo-400 hover:text-indigo-300">
            Ver todas →
          </Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-500 text-sm">No hay transacciones aún.</p>
            <Link href="/finance/transactions/new" className="mt-2 text-sm text-indigo-400 hover:text-indigo-300">
              Agregar la primera →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {recentTransactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${tx.type === "income" ? "bg-emerald-400" : "bg-rose-400"}`} />
                  <div>
                    <p className="text-sm text-slate-200 truncate max-w-[200px]">{tx.description ?? "Sin descripción"}</p>
                    <p className="text-xs text-slate-500">
                      {tx.finance_categories?.name ?? tx.source} · {format(new Date(tx.date), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${tx.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                  {tx.type === "income" ? "+" : "-"}
                  {new Intl.NumberFormat("es-AR", { style: "currency", currency: tx.currency ?? "ARS", maximumFractionDigits: 0 }).format(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

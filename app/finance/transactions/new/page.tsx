"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useFinanceContext } from "@/lib/finance-context"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewTransactionPage() {
  const router = useRouter()
  const { context } = useFinanceContext()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    currency: "ARS",
    description: "",
    category_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
  })

  useEffect(() => {
    loadCategories()
  }, [context, form.type])

  async function loadCategories() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("finance_categories")
      .select("*")
      .eq("user_id", user.id)
      .eq("context", context)
      .eq("type", form.type)
    setCategories(data ?? [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/finance/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, source: "manual", context }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? "Error al guardar")
      setLoading(false)
      return
    }

    router.push("/finance/transactions")
  }

  const inputClass = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
  const labelClass = "block text-xs font-medium text-slate-400 mb-1.5"

  return (
    <div className="px-4 py-6 md:px-8 max-w-lg mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/finance/transactions" className="text-slate-400 hover:text-slate-200">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold text-slate-100">Nueva transacción</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        {/* Type */}
        <div>
          <label className={labelClass}>Tipo</label>
          <div className="flex gap-2">
            {["expense", "income"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...form, type: t, category_id: "" })}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                  form.type === t
                    ? t === "income"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-rose-500 bg-rose-500/10 text-rose-400"
                    : "border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                {t === "income" ? "Ingreso" : "Egreso"}
              </button>
            ))}
          </div>
        </div>

        {/* Amount + Currency */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Monto</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="w-28">
            <label className={labelClass}>Moneda</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className={inputClass}
            >
              {["ARS", "USD", "USDT", "BTC", "ETH"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Descripción</label>
          <input
            type="text"
            placeholder="Ej: Proyecto web cliente X"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Categoría</label>
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className={inputClass}
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className={labelClass}>Fecha</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Guardando..." : "Guardar transacción"}
        </button>
      </form>
    </div>
  )
}

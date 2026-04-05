"use client"

import { useEffect, useState } from "react"
import { IntegrationCard } from "@/components/finance/IntegrationCard"
import { supabase } from "@/lib/supabase"
import { Plus } from "lucide-react"

const PROVIDERS = ["mercadopago", "binance", "iol", "cocos"] as const

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<Record<string, any>>({})
  const [categories, setCategories] = useState<any[]>([])
  const [newCat, setNewCat] = useState({ name: "", type: "expense", context: "personal", color: "#6366f1" })
  const [addingCat, setAddingCat] = useState(false)

  useEffect(() => {
    loadIntegrations()
    loadCategories()
  }, [])

  async function loadIntegrations() {
    const res = await fetch("/api/finance/integrations")
    const json = await res.json()
    const map: Record<string, any> = {}
    for (const i of json.data ?? []) map[i.provider] = i
    setIntegrations(map)
  }

  async function loadCategories() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("finance_categories").select("*").eq("user_id", user.id)
    setCategories(data ?? [])
  }

  const handleSave = async (provider: string, data: Record<string, string>) => {
    await fetch("/api/finance/integrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, ...data }),
    })
    await loadIntegrations()
  }

  const handleSync = async (provider: string) => {
    if (provider === "cocos") return
    await fetch(`/api/finance/sync/${provider}`, { method: "POST" })
    await loadIntegrations()
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddingCat(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from("finance_categories").insert({ ...newCat, user_id: user.id })
      await loadCategories()
      setNewCat({ name: "", type: "expense", context: "personal", color: "#6366f1" })
    }
    setAddingCat(false)
  }

  const handleDeleteCategory = async (id: string) => {
    await supabase.from("finance_categories").delete().eq("id", id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
  }

  const inputClass = "rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"

  return (
    <div className="px-4 py-6 md:px-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Configuración</h1>
        <p className="text-sm text-slate-400 mt-1">Conectá tus plataformas y administrá categorías</p>
      </div>

      {/* Integrations */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Integraciones</h2>
        {PROVIDERS.map((provider) => (
          <IntegrationCard
            key={provider}
            provider={provider}
            status={integrations[provider]?.status}
            lastSync={integrations[provider]?.last_sync}
            onSave={(data) => handleSave(provider, data)}
            onSync={() => handleSync(provider)}
          />
        ))}
      </section>

      {/* Categories */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Categorías</h2>

        {/* Add category */}
        <form onSubmit={handleAddCategory} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
          <p className="text-xs font-medium text-slate-400">Nueva categoría</p>
          <div className="flex gap-2 flex-wrap">
            <input
              required
              placeholder="Nombre"
              value={newCat.name}
              onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              className={`${inputClass} flex-1 min-w-32`}
            />
            <select
              value={newCat.type}
              onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}
              className={inputClass}
            >
              <option value="expense">Egreso</option>
              <option value="income">Ingreso</option>
            </select>
            <select
              value={newCat.context}
              onChange={(e) => setNewCat({ ...newCat, context: e.target.value })}
              className={inputClass}
            >
              <option value="personal">Personal</option>
              <option value="agency">Agencia</option>
            </select>
            <input
              type="color"
              value={newCat.color}
              onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
              className="h-9 w-12 rounded-lg border border-slate-700 bg-slate-800 cursor-pointer"
            />
            <button
              type="submit"
              disabled={addingCat}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </form>

        {/* Category list */}
        {categories.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <ul className="divide-y divide-slate-800">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between px-4 py-2.5 group">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-slate-200">{cat.name}</span>
                    <span className={`text-xs rounded-full px-2 py-0.5 ${cat.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {cat.type === "income" ? "Ingreso" : "Egreso"}
                    </span>
                    <span className="text-xs text-slate-500">{cat.context}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-slate-500 hover:text-rose-400 transition-all"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  )
}

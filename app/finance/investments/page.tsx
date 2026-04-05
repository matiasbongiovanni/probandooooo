"use client"

import { useEffect, useState } from "react"
import { PortfolioCard } from "@/components/finance/PortfolioCard"
import { CategoryPieChart } from "@/components/finance/CategoryPieChart"

const PROVIDERS = ["binance", "iol", "cocos"] as const
const PROVIDER_COLORS: Record<string, string> = {
  binance: "#f59e0b",
  iol: "#3b82f6",
  cocos: "#10b981",
}

export default function InvestmentsPage() {
  const [portfolio, setPortfolio] = useState<Record<string, any[]>>({ binance: [], iol: [], cocos: [] })
  const [integrations, setIntegrations] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolio()
    loadIntegrations()
  }, [])

  async function loadPortfolio() {
    setLoading(true)
    const res = await fetch("/api/finance/portfolio")
    const json = await res.json()
    const grouped: Record<string, any[]> = { binance: [], iol: [], cocos: [] }
    for (const asset of json.data ?? []) {
      if (grouped[asset.provider]) grouped[asset.provider].push(asset)
    }
    setPortfolio(grouped)
    setLoading(false)
  }

  async function loadIntegrations() {
    const res = await fetch("/api/finance/integrations")
    const json = await res.json()
    const map: Record<string, any> = {}
    for (const i of json.data ?? []) map[i.provider] = i
    setIntegrations(map)
  }

  const handleSync = async (provider: string) => {
    await fetch(`/api/finance/sync/${provider}`, { method: "POST" })
    await loadPortfolio()
    await loadIntegrations()
  }

  // Build allocation chart data
  const allocationData = PROVIDERS.map((p) => {
    const total = portfolio[p].reduce((s, a) => s + a.quantity * (a.current_price ?? a.avg_price ?? 0), 0)
    return { name: p === "iol" ? "IOL" : p.charAt(0).toUpperCase() + p.slice(1), value: total, color: PROVIDER_COLORS[p] }
  }).filter((d) => d.value > 0)

  return (
    <div className="px-4 py-6 md:px-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Inversiones</h1>
        <p className="text-sm text-slate-400">Portfolio consolidado</p>
      </div>

      {/* Allocation chart */}
      {allocationData.length > 0 && (
        <div className="max-w-sm">
          <CategoryPieChart data={allocationData} title="Distribución por broker" />
        </div>
      )}

      {/* Portfolio cards */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {PROVIDERS.map((provider) => (
          <PortfolioCard
            key={provider}
            provider={provider}
            assets={loading ? [] : portfolio[provider]}
            lastSync={integrations[provider]?.last_sync}
            status={integrations[provider]?.status}
            onSync={() => handleSync(provider)}
          />
        ))}
      </div>

      <p className="text-xs text-slate-500">
        * Los precios actuales se obtienen al sincronizar. Binance requiere API keys read-only. IOL requiere usuario y contraseña. Cocos Capital importa por CSV.
      </p>
    </div>
  )
}

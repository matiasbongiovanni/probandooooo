"use client"

import { RefreshCw } from "lucide-react"
import { useState } from "react"

interface Asset {
  asset: string
  quantity: number
  avg_price?: number
  current_price?: number
  currency: string
}

interface PortfolioCardProps {
  provider: "binance" | "iol" | "cocos"
  assets: Asset[]
  lastSync?: string
  status?: string
  onSync: () => Promise<void>
}

const PROVIDER_LABELS: Record<string, { label: string; color: string }> = {
  binance: { label: "Binance", color: "text-yellow-400" },
  iol: { label: "InvertirOnline", color: "text-blue-400" },
  cocos: { label: "Cocos Capital", color: "text-emerald-400" },
}

export function PortfolioCard({ provider, assets, lastSync, status, onSync }: PortfolioCardProps) {
  const [syncing, setSyncing] = useState(false)
  const { label, color } = PROVIDER_LABELS[provider] ?? { label: provider, color: "text-slate-400" }

  const handleSync = async () => {
    setSyncing(true)
    await onSync()
    setSyncing(false)
  }

  const totalValue = assets.reduce((s, a) => {
    return s + a.quantity * (a.current_price ?? a.avg_price ?? 0)
  }, 0)

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h3 className={`text-sm font-semibold ${color}`}>{label}</h3>
          {lastSync && (
            <p className="text-xs text-slate-500">
              Sync: {new Date(lastSync).toLocaleDateString("es-AR")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status === "error" && (
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs text-rose-400">Error</span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-slate-500 hover:text-slate-200 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-slate-500">
          Sin activos. Sincronizá para cargar el portfolio.
        </div>
      ) : (
        <>
          <ul className="divide-y divide-slate-800">
            {assets.map((a) => {
              const value = a.quantity * (a.current_price ?? a.avg_price ?? 0)
              return (
                <li key={a.asset} className="flex items-center justify-between px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{a.asset}</p>
                    <p className="text-xs text-slate-500">{a.quantity.toFixed(8).replace(/\.?0+$/, "")} unidades</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-200">
                      {new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value)} {a.currency}
                    </p>
                    {a.current_price && (
                      <p className="text-xs text-slate-500">@ {a.current_price} {a.currency}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-slate-800 px-4 py-2.5 flex justify-between items-center">
            <span className="text-xs text-slate-400">Total estimado</span>
            <span className="text-sm font-semibold text-slate-200">
              {new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(totalValue)} {assets[0]?.currency ?? "USD"}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

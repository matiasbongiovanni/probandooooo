"use client"

import { useState } from "react"
import { CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"

interface IntegrationCardProps {
  provider: "binance" | "iol" | "cocos" | "mercadopago"
  status?: string
  lastSync?: string
  onSave: (data: Record<string, string>) => Promise<void>
  onSync?: () => Promise<void>
}

const PROVIDER_CONFIG: Record<string, {
  label: string
  description: string
  fields: { key: string; label: string; type: "text" | "password"; placeholder: string }[]
  syncable: boolean
  docsUrl?: string
}> = {
  binance: {
    label: "Binance",
    description: "API read-only para obtener balances y trades",
    fields: [
      { key: "api_key", label: "API Key", type: "text", placeholder: "Tu Binance API Key" },
      { key: "api_secret", label: "API Secret", type: "password", placeholder: "Tu Binance API Secret" },
    ],
    syncable: true,
    docsUrl: "https://www.binance.com/en/my/settings/api-management",
  },
  iol: {
    label: "InvertirOnline",
    description: "Usuario y contraseña de tu cuenta IOL",
    fields: [
      { key: "username", label: "Usuario / Email", type: "text", placeholder: "usuario@email.com" },
      { key: "password", label: "Contraseña", type: "password", placeholder: "••••••••" },
    ],
    syncable: true,
  },
  cocos: {
    label: "Cocos Capital",
    description: "Sin API pública. Importá el CSV desde la app.",
    fields: [],
    syncable: false,
  },
  mercadopago: {
    label: "MercadoPago",
    description: "Sincroniza pagos aprobados como ingresos",
    fields: [],
    syncable: true,
  },
}

export function IntegrationCard({ provider, status, lastSync, onSave, onSync }: IntegrationCardProps) {
  const config = PROVIDER_CONFIG[provider]
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload: Record<string, string> = {}
    if (provider === "iol") {
      payload.extra = JSON.stringify({ username: fields.username, password: fields.password })
    } else {
      if (fields.api_key) payload.api_key = fields.api_key
      if (fields.api_secret) payload.api_secret = fields.api_secret
    }
    await onSave(payload)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setOpen(false)
  }

  const handleSync = async () => {
    if (!onSync) return
    setSyncing(true)
    await onSync()
    setSyncing(false)
  }

  const isConnected = status === "active"
  const isError = status === "error"

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {isConnected ? (
            <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          ) : isError ? (
            <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
          ) : (
            <div className="h-4 w-4 rounded-full border-2 border-slate-600 flex-shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-200">{config.label}</p>
            <p className="text-xs text-slate-500">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSync && (
            <span className="text-xs text-slate-500 hidden sm:block">
              {new Date(lastSync).toLocaleDateString("es-AR")}
            </span>
          )}
          {config.syncable && onSync && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-slate-500 hover:text-slate-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            </button>
          )}
          {config.fields.length > 0 && (
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg border border-slate-700 p-1.5 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            >
              {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>

      {open && config.fields.length > 0 && (
        <form onSubmit={handleSave} className="border-t border-slate-800 px-4 py-3 space-y-3">
          {config.fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-400 mb-1">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={fields[f.key] ?? ""}
                onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ))}
          {config.docsUrl && (
            <p className="text-xs text-slate-500">
              Generá las API keys en{" "}
              <a href={config.docsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                {config.docsUrl}
              </a>
              {" "}con permisos de solo lectura.
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar credenciales"}
          </button>
        </form>
      )}
    </div>
  )
}

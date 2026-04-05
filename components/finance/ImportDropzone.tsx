"use client"

import { useRef, useState } from "react"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { useFinanceContext } from "@/lib/finance-context"

export function ImportDropzone() {
  const { context } = useFinanceContext()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; total: number } | null>(null)
  const [error, setError] = useState("")

  const handleFile = async (file: File) => {
    setLoading(true)
    setError("")
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("context", context)

    const res = await fetch("/api/finance/import/bna", { method: "POST", body: formData })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? "Error al importar")
    } else {
      setResult(json)
    }
    setLoading(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
          dragging
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/30"
        }`}
      >
        <Upload className="h-8 w-8 text-slate-400 mb-3" />
        <p className="text-sm text-slate-300 font-medium">Arrastrá tu archivo CSV aquí</p>
        <p className="text-xs text-slate-500 mt-1">o hacé click para seleccionar</p>
        <p className="text-xs text-slate-600 mt-2">.CSV soportado</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Procesando archivo...
        </div>
      )}

      {result && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-emerald-400">Importación exitosa</p>
            <p className="text-emerald-400/80 text-xs mt-0.5">
              {result.imported} importadas · {result.skipped} omitidas · {result.total} total
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}
    </div>
  )
}

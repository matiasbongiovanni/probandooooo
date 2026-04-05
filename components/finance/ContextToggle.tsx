"use client"

import { useFinanceContext } from "@/lib/finance-context"

export function ContextToggle() {
  const { context, setContext } = useFinanceContext()

  return (
    <div className="flex items-center gap-1 rounded-full bg-slate-800 p-1 text-sm">
      <button
        onClick={() => setContext("personal")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          context === "personal"
            ? "bg-indigo-600 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Personal
      </button>
      <button
        onClick={() => setContext("agency")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          context === "agency"
            ? "bg-violet-600 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Agencia
      </button>
    </div>
  )
}

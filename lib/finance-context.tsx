"use client"

import { createContext, useContext, useState, useEffect } from "react"

type FinanceContext = "personal" | "agency"

interface FinanceContextValue {
  context: FinanceContext
  setContext: (ctx: FinanceContext) => void
}

const FinanceCtx = createContext<FinanceContextValue>({
  context: "personal",
  setContext: () => {},
})

export function FinanceContextProvider({ children }: { children: React.ReactNode }) {
  const [context, setContextState] = useState<FinanceContext>("personal")

  useEffect(() => {
    const stored = localStorage.getItem("finance_context") as FinanceContext | null
    if (stored === "personal" || stored === "agency") {
      setContextState(stored)
    }
  }, [])

  const setContext = (ctx: FinanceContext) => {
    setContextState(ctx)
    localStorage.setItem("finance_context", ctx)
  }

  return <FinanceCtx.Provider value={{ context, setContext }}>{children}</FinanceCtx.Provider>
}

export function useFinanceContext() {
  return useContext(FinanceCtx)
}

import { FinanceContextProvider } from "@/lib/finance-context"
import { Sidebar } from "@/components/finance/Sidebar"
import { BottomNav } from "@/components/finance/BottomNav"

export const metadata = {
  title: "Finance Dashboard",
  description: "Dashboard personal de ingresos, gastos e inversiones",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <FinanceContextProvider>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <Sidebar />
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </FinanceContextProvider>
  )
}

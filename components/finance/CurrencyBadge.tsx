interface CurrencyBadgeProps {
  currency: string
}

const currencyConfig: Record<string, { label: string; className: string }> = {
  ARS: { label: "ARS", className: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  USD: { label: "USD", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  USDT: { label: "USDT", className: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
  BTC: { label: "BTC", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  ETH: { label: "ETH", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
}

export function CurrencyBadge({ currency }: CurrencyBadgeProps) {
  const config = currencyConfig[currency] ?? {
    label: currency,
    className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }

  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

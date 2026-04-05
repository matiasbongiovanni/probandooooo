"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface CategoryData {
  name: string
  value: number
  color: string
}

interface CategoryPieChartProps {
  data: CategoryData[]
  title?: string
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm shadow-xl">
        <p className="font-medium text-slate-200">{payload[0].name}</p>
        <p className="text-xs text-slate-400">
          {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export function CategoryPieChart({ data, title = "Por categoría" }: CategoryPieChartProps) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 flex items-center justify-center h-[280px]">
        <p className="text-slate-500 text-sm">Sin datos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

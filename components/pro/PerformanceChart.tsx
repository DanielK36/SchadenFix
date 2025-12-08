"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

// Enhanced chart component using recharts for better interactivity
export function PerformanceChart({ data }: { data: { month: string; value: number }[] }) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-white text-sm font-semibold">{payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full" style={{ height: "256px", minHeight: "256px" }}>
      <ResponsiveContainer width="100%" height={256} minHeight={256}>
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <XAxis dataKey="month" hide />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#D4AF37"
            strokeWidth={2}
            dot={{ r: 4, fill: "#D4AF37", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#D4AF37" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

"use client"

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts"

interface TeamSparklineProps {
  data: { day: string; value: number }[]
  color?: string
  height?: number
}

export function TeamSparkline({ data, color = "#10B981", height = 60 }: TeamSparklineProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-lg">
          <p className="text-white text-sm font-semibold">
            {payload[0].value.toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full" style={{ height: `${height}px`, minHeight: `${height}px` }}>
      <ResponsiveContainer width="100%" height={height} minHeight={height}>
        <LineChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


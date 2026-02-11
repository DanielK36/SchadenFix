"use client"

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface RevenueChartProps {
  data: { day: string; revenue: number }[]
  height?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1A] border border-[#B8903A]/30 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-[#B8903A] text-sm font-semibold">
          {payload[0].value.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          })}
        </p>
      </div>
    )
  }
  return null
}

export function RevenueChart({ data, height = 80 }: RevenueChartProps) {
  return (
    <div className="w-full" style={{ height: `${height}px`, minHeight: `${height}px` }}>
      <ResponsiveContainer width="100%" height={height} minHeight={height}>
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8903A" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#B8903A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" hide />
          <YAxis hide />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#B8903A"
            strokeWidth={2}
            fill="url(#colorRevenue)"
            dot={false}
            activeDot={{ r: 4, fill: "#B8903A", strokeWidth: 0 }}
          />
          <Tooltip content={<CustomTooltip />} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}


"use client"

import { useState } from "react"

interface DailyRevenueChartProps {
  data: { day: string; revenue: number }[]
}

export function DailyRevenueChart({ data }: DailyRevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxRevenue = Math.max(...data.map((d) => d.revenue))
  const minRevenue = Math.min(...data.map((d) => d.revenue))
  const range = maxRevenue - minRevenue || 1

  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.revenue - minRevenue) / range) * 80 // Leave 10% margin top/bottom
    return { x, y, ...item }
  })

  // Create path for the line
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")

  // Area path (close the shape)
  const areaPath = `${pathData} L 100 100 L 0 100 Z`

  return (
    <div className="relative w-full h-full">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Area under line */}
        <path
          d={areaPath}
          fill="url(#dailyGradient)"
          opacity="0.3"
        />
        {/* Line - Gold für Modern Clean SaaS */}
        <path
          d={pathData}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? "3" : "2"}
              fill="#D4AF37"
              className="transition-all cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(index)}
              onTouchEnd={() => setTimeout(() => setHoveredIndex(null), 2000)}
            />
            {hoveredIndex === index && (
              <g>
                <rect
                  x={point.x - 15}
                  y={point.y - 12}
                  width="30"
                  height="8"
                  rx="2"
                  fill="#0F172A"
                  stroke="#D4AF37"
                  strokeWidth="0.5"
                />
                <text
                  x={point.x}
                  y={point.y - 6}
                  textAnchor="middle"
                  fontSize="3"
                  fill="#D4AF37"
                  fontWeight="600"
                >
                  {point.revenue.toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  })}
                </text>
              </g>
            )}
          </g>
        ))}
        <defs>
          <linearGradient id="dailyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {/* Tooltip for touch devices - Modern Clean SaaS */}
      {hoveredIndex !== null && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-white font-semibold whitespace-nowrap shadow-lg">
          {data[hoveredIndex].day}: {data[hoveredIndex].revenue.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
          })}
        </div>
      )}
    </div>
  )
}


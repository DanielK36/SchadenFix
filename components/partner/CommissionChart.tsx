"use client"

import { useState } from "react"

interface CommissionChartProps {
  data: { day: string; revenue: number }[]
}

export function CommissionChart({ data }: CommissionChartProps) {
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
          fill="url(#commissionGradient)"
          opacity="0.3"
        />
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="#B8903A"
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
              fill="#B8903A"
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
                  fill="#1A1A1A"
                  stroke="#B8903A"
                  strokeWidth="0.5"
                />
                <text
                  x={point.x}
                  y={point.y - 6}
                  textAnchor="middle"
                  fontSize="3"
                  fill="#B8903A"
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
          <linearGradient id="commissionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B8903A" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#B8903A" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {/* Tooltip for touch devices */}
      {hoveredIndex !== null && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1A1A1A] border border-[#B8903A] rounded px-3 py-1.5 text-sm text-[#B8903A] font-semibold whitespace-nowrap">
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



"use client"

interface SparklineChartProps {
  data: { day: string; revenue: number }[]
  height?: number
}

export function SparklineChart({ data, height = 40 }: SparklineChartProps) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue))
  const minRevenue = Math.min(...data.map((d) => d.revenue))
  const range = maxRevenue - minRevenue || 1

  // Calculate points for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.revenue - minRevenue) / range) * 80
    return { x, y }
  })

  // Create path for the line
  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")

  return (
    <div className="relative w-full" style={{ height: `${height}px` }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={pathData}
          fill="none"
          stroke="#B8903A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />
      </svg>
    </div>
  )
}


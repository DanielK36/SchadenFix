"use client"

interface ProgressProps {
  current: number
  total: number
}

export function Progress({ current, total }: ProgressProps) {
  const progress = (current / total) * 100

  return (
    <div aria-label="Fortschritt" className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
      <div
        style={{ width: `${progress}%` }}
        className="h-full animate-[progress_0.6s_ease-out] rounded-full bg-amber-500"
      />
    </div>
  )
}


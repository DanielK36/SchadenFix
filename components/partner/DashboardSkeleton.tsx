"use client"

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-24">
      {/* Row 1: Hero + Link kopieren */}
      <div className="grid grid-cols-3 gap-6">
        {/* Hero Section - Monatseinnahmen (2/3) */}
        <div className="col-span-2 bg-[#1A1A1A] rounded-2xl p-8 flex flex-col min-h-[200px] h-full">
          <div className="mb-4">
            <div className="h-4 w-32 bg-neutral-800/50 rounded animate-pulse mb-2"></div>
            <div className="h-16 w-48 bg-neutral-800/50 rounded animate-pulse"></div>
          </div>
          <div className="mt-auto w-full pt-6">
            <div className="h-20 w-full bg-neutral-800/50 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Link Box (1/3) */}
        <div className="col-span-1 bg-[#1A1A1A] rounded-2xl p-8 flex flex-col min-h-[200px] h-full">
          <div className="h-4 w-32 bg-neutral-800/50 rounded animate-pulse mb-2"></div>
          <div className="mt-6 flex flex-col gap-3">
            <div className="w-full h-12 bg-neutral-800/50 rounded-lg animate-pulse"></div>
            <div className="w-full h-12 bg-neutral-800/50 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Row 2: Stats (3 Spalten) */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-[#1A1A1A] rounded-2xl p-6">
          <div className="h-4 w-32 bg-neutral-800/50 rounded animate-pulse mb-2"></div>
          <div className="h-10 w-24 bg-neutral-800/50 rounded animate-pulse"></div>
        </div>
        <div className="bg-[#1A1A1A] rounded-2xl p-6">
          <div className="h-4 w-32 bg-neutral-800/50 rounded animate-pulse mb-2"></div>
          <div className="h-10 w-24 bg-neutral-800/50 rounded animate-pulse"></div>
        </div>
        <div className="bg-[#1A1A1A] rounded-2xl p-6">
          <div className="h-4 w-32 bg-neutral-800/50 rounded animate-pulse mb-2"></div>
          <div className="h-10 w-24 bg-neutral-800/50 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6">
        <div className="h-6 w-24 bg-neutral-800/50 rounded animate-pulse mb-4"></div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 py-2">
              <div className="w-8 h-8 bg-neutral-800/50 rounded-full animate-pulse flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 w-3/4 bg-neutral-800/50 rounded animate-pulse mb-1"></div>
                <div className="h-3 w-1/2 bg-neutral-800/50 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


"use client"

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Desktop Skeleton */}
      <div className="hidden md:grid md:grid-cols-[65%_35%] gap-4">
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
            <div className="h-12 w-48 bg-slate-200 rounded mb-4"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="h-6 w-40 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="h-4 w-16 bg-slate-200 rounded mb-4"></div>
              <div className="h-8 w-12 bg-slate-200 rounded"></div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="h-4 w-16 bg-slate-200 rounded mb-4"></div>
              <div className="h-8 w-12 bg-slate-200 rounded"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className="md:hidden space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
          <div className="h-10 w-36 bg-slate-200 rounded mb-3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
            <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-slate-200 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-12 bg-slate-200 rounded-xl"></div>
          <div className="h-12 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  )
}


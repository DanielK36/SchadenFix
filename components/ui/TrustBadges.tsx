"use client";

export const TrustBadges = () => {
  return (
    <div className="flex items-center justify-center gap-3 mt-3 opacity-60">
      <span className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">Unverbindlich</span>
      <span className="w-1 h-1 rounded-full bg-stone-300"></span>
      <span className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">Kostenfrei</span>
      <span className="w-1 h-1 rounded-full bg-stone-300"></span>
      <span className="text-[11px] font-medium text-stone-500 tracking-wider uppercase">2 Min. Dauer</span>
    </div>
  );
};

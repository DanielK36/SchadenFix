"use client";

import React from "react";

interface ProgressBarProps {
  step: number;
  total: number;
}

export const ProgressBar = ({ step, total }: ProgressBarProps) => {
  // ProgressBar zeigt nur an, wenn step > 0 (nicht beim Grid)
  if (step === 0) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-[max(env(safe-area-inset-top),20px)] pb-2 pointer-events-none">
      <div className="w-full flex gap-1.5">
        {Array.from({ length: total }).map((_, index) => {
          // index 0 = Schritt 1, index 1 = Schritt 2, etc.
          const isActive = index < step;
          return (
            <div
              key={index}
              className={`
                flex-1 h-1 rounded-full transition-all duration-300
                ${isActive ? 'bg-stone-900' : 'bg-stone-300/50'}
              `}
            />
          );
        })}
      </div>
    </div>
  );
};

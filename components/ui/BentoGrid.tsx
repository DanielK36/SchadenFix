"use client";

import React from "react";
import { Droplets, Flame, CarFront, Scale, ArrowRight, SquareStack } from "lucide-react";

interface BentoCardProps {
  icon: any;
  title: string;
  sub?: string;
  className?: string;
  delay: number;
  onClick?: () => void;
  highlight?: boolean;
}

const BentoCard = ({ icon: Icon, title, sub, className, delay, onClick, highlight }: BentoCardProps) => (
  <div
    onClick={onClick}
    className={`group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex flex-col justify-between cursor-pointer 
      border border-white/60 backdrop-blur-xl transition-all duration-300
      shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05),inset_0_1px_0_0_rgba(255,255,255,0.8)]
      ${highlight 
        ? 'bg-gradient-to-br from-white via-white to-stone-100 ring-1 ring-black/5 shadow-lg' 
        : 'bg-white/40 hover:bg-white/60'
      }
      ${className}`}
  >
    <div className="flex justify-between items-start z-10">
        <div className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl border transition-colors duration-300
            ${highlight 
                ? 'bg-stone-900 text-white border-stone-800 shadow-xl' 
                : 'bg-white/80 text-stone-600 border-white/50 shadow-sm'
            }
        `}>
            <Icon size={20} className="md:w-6 md:h-6" strokeWidth={highlight ? 2.5 : 2} />
        </div>
        
        {highlight && (
             <div className="bg-stone-100 rounded-full p-1.5 md:p-2">
                <ArrowRight size={14} className="md:w-4 md:h-4 text-stone-400" />
             </div>
        )}
    </div>
    
    <div className="mt-3 md:mt-4 z-10">
        <h3 className={`text-base md:text-lg font-bold leading-tight tracking-tight mb-0.5 md:mb-1
             ${highlight ? 'text-stone-900' : 'text-stone-800'}
        `}>
            {title}
        </h3>
        <p className={`text-[10px] md:text-xs font-medium tracking-wide
            ${highlight ? 'text-stone-500' : 'text-stone-400'}
        `}>
            {sub || "Sofort-Hilfe"}
        </p>
    </div>
  </div>
);

export const DamageBentoGrid = ({ onSelect }: { onSelect?: (type: string) => void }) => {
  const categories = [
    { icon: Droplets, title: "Wasserschaden", sub: "Häufigste Meldung", type: "wasser", className: "col-span-2 min-h-[130px]", delay: 0.1, highlight: true },
    { icon: Flame, title: "Feuer", type: "feuer", className: "min-h-[120px]", delay: 0.2 },
    { icon: SquareStack, title: "Glas", type: "glas", className: "min-h-[120px]", delay: 0.3 },
    { icon: CarFront, title: "KFZ", type: "kfz", className: "min-h-[120px]", delay: 0.4 },
    { icon: Scale, title: "Recht", type: "recht", className: "min-h-[120px]", delay: 0.5 },
  ];

  return (
    <div className="w-full px-4 md:px-12 lg:px-16 xl:px-24 mx-auto pb-40 max-w-2xl md:max-w-none"> 
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {categories.map((category) => (
          <BentoCard
            key={category.type}
            icon={category.icon}
            title={category.title}
            sub={category.sub}
            className={category.className}
            delay={category.delay}
            highlight={category.highlight}
            onClick={() => onSelect?.(category.title)}
          />
        ))}
      </div>
    </div>
  );
};

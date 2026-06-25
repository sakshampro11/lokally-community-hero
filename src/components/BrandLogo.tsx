import React from "react";
import { MapPin } from "lucide-react";

export function BrandLogo({ size = "md", light = false }: { size?: "sm" | "md" | "lg"; light?: boolean }) {
  const iconWrapperSizes = {
    sm: "h-8 w-8 rounded-xl",
    md: "h-10 w-10 rounded-2xl",
    lg: "h-12 w-12 rounded-2xl"
  };

  const pinSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  const textSizes = {
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl"
  };

  const textTheme = light ? "text-white" : "text-slate-900";
  const dotColor = light ? "bg-white" : "bg-blue-600";

  return (
    <div className="flex items-center gap-2.5 select-none group shrink-0">
      {/* Interactive bouncing map pin logo */}
      <div className={`relative ${iconWrapperSizes[size]} flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 shadow-md`}>
        {/* Background inner layer */}
        <div className="absolute inset-0.5 rounded-[10px] sm:rounded-[14px] bg-slate-900 opacity-90 transition-all duration-300 group-hover:opacity-75" />
        
        {/* Bouncing animation wrapper */}
        <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1 animate-bounce" style={{ animationDuration: "2s" }}>
          <MapPin size={pinSizes[size]} className="text-blue-500 transition-colors duration-300 group-hover:text-indigo-400" />
        </div>

        {/* Pulse effect background */}
        <div className="absolute h-6 w-6 rounded-full bg-blue-500/10 border border-blue-500/20 animate-ping z-0" style={{ animationDuration: "3s" }} />
        
        {/* Status dot */}
        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-500 border border-slate-900 z-20 animate-pulse" />
      </div>

      {/* Typography Styled Wordmark */}
      <div className="flex items-baseline font-display">
        <span className={`${textSizes[size]} font-black tracking-tight ${textTheme} leading-none`}>
          Lokally
        </span>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ml-0.5 self-end mb-1`} />
      </div>
    </div>
  );
}


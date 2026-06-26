import React from "react";
import logoImage from "./logo.png";

export function BrandLogo({
  size = "md",
  light = false
}: {
  size?: "sm" | "md" | "lg";
  light?: boolean;
}) {
  const iconWrapperSizes = {
    sm: "h-5.5 w-5.5 sm:h-6 sm:w-6",
    md: "h-7 w-7",
    lg: "h-8 w-8"
  };

  const textSizes = {
    sm: "text-base sm:text-lg",
    md: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl"
  };

  const textTheme = light ? "text-white" : "text-slate-900";
  const dotColor = light ? "bg-white" : "bg-blue-600";

  return (
    <div className="flex items-center gap-2 select-none group shrink-0">
      <div className={`${iconWrapperSizes[size]} flex items-center justify-center shrink-0`}>
        <img
          src={logoImage}
          alt="Lokally Logo"
          className="w-full h-full object-contain drop-shadow-[0_1px_2px_rgba(37,99,235,0.1)] transition-transform duration-200 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Typography Styled Wordmark */}
      <div className="flex items-baseline font-display">
        <span className={`${textSizes[size]} font-black tracking-tight ${textTheme} leading-none`}>
          Lokally
        </span>
        <span className={`h-1 w-1 rounded-full ${dotColor} ml-0.5 self-end mb-1`} />
      </div>
    </div>
  );
}

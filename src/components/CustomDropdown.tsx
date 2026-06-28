import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string | React.ReactNode;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
  size?: "normal" | "compact";
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  placeholder = "Select option",
  className = "",
  leftIcon,
  required = false,
  size = "normal",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const isCompact = size === "compact";

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100/50 transition-all outline-none text-left cursor-pointer shadow-xs ${
          isCompact ? "px-2.5 py-2 text-[11px] font-extrabold text-slate-700" : "px-4 py-2.5 text-sm font-medium text-slate-700"
        }`}
      >
        <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0">
          {leftIcon && <div className="shrink-0 text-slate-400">{leftIcon}</div>}
          <span className="truncate flex-1">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          size={isCompact ? 11 : 14}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="absolute left-0 z-[999] mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-fade-in outline-none">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

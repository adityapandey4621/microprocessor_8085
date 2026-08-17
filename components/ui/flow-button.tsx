"use client";
import { ArrowRight } from "lucide-react";

export function FlowButton({ text = "Modern Button", className = "" }: { text?: string; className?: string }) {
  return (
    <button className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white cursor-pointer backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.97] ${className}`}>
      {/* Left arrow (arr-2) */}
      <ArrowRight 
        className="absolute w-4 h-4 left-[-25%] stroke-current fill-none z-[9] group-hover:left-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-2 group-hover:translate-x-3 transition-all duration-500 ease-out font-space tracking-wide">
        {text}
      </span>

      {/* Circle expand effect */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/20 rounded-full opacity-0 group-hover:w-[300px] group-hover:h-[300px] group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className="absolute w-4 h-4 right-4 stroke-current fill-none z-[9] group-hover:right-[-25%] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />
    </button>
  );
}

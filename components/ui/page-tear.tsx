"use client"

import React from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface PageTearProps {
  position?: "top" | "bottom"
  variant?: "paper" | "metallic" | "glitch"
  className?: string
  color?: string
}

export function PageTear({ position = "bottom", variant = "metallic", className = "", color = "#050508" }: PageTearProps) {
  const { scrollYProgress } = useScroll()
  const tearX = useTransform(scrollYProgress, [0, 1], [-20, 20])
  const tearScale = useTransform(scrollYProgress, [0, 1], [1, 1.05])

  // Custom jagged torn-paper / torn-metal path
  const tearPath = "M0,0 Q120,35 240,12 T480,45 T720,15 T960,50 T1200,20 T1440,40 L1440,120 L0,120 Z"
  const tearPathTop = "M0,120 Q120,85 240,108 T480,75 T720,105 T960,70 T1200,100 T1440,80 L1440,0 L0,0 Z"

  return (
    <div 
      className={`relative w-full overflow-hidden pointer-events-none z-20 select-none ${
        position === "top" ? "-mb-1 md:-mb-2" : "-mt-1 md:-mt-2"
      } ${className}`}
      style={{ height: "60px" }}
    >
      <motion.div 
        style={{ x: tearX, scaleX: tearScale }}
        className="w-full h-full relative flex items-center justify-center"
      >
        <svg 
          viewBox="0 0 1440 120" 
          preserveAspectRatio="none" 
          className="w-full h-full block drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]"
        >
          {/* Background torn shadow line */}
          <path 
            d={position === "top" ? tearPathTop : tearPath} 
            fill="rgba(0,0,0,0.6)" 
            transform="translate(0, 4)"
          />
          {/* Solid fill for the next section */}
          <path 
            d={position === "top" ? tearPathTop : tearPath} 
            fill={color} 
          />

          <defs>
            <linearGradient id="tearGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C89B3C" stopOpacity="0.8" />
              <stop offset="30%" stopColor="#00D4FF" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#E6B85C" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#A66CFF" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </svg>

        {/* Small torn paper glitch particles along the seam */}
        {variant === "glitch" && (
          <div className="absolute inset-0 flex justify-around items-center opacity-40">
            <span className="w-2 h-0.5 bg-cyan-400 rotate-12 animate-pulse" />
            <span className="w-3 h-0.5 bg-amber-400 -rotate-45 animate-ping" />
            <span className="w-1.5 h-0.5 bg-purple-400 rotate-6" />
            <span className="w-2.5 h-0.5 bg-yellow-400 -rotate-12" />
          </div>
        )}
      </motion.div>
    </div>
  )
}

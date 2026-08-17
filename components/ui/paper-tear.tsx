"use client"

import { useScroll, useTransform, motion } from "framer-motion"
import { useRef } from "react"

export default function PaperTear() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  })

  // The top and bottom halves split apart
  const yTop = useTransform(scrollYProgress, [0, 1], [0, -200])
  const yBottom = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0])

  return (
    <div ref={containerRef} className="relative w-full h-[300px] flex items-center justify-center -my-[150px] z-50 pointer-events-none">
      
      {/* Top Tear */}
      <motion.div 
        className="absolute top-0 w-full h-1/2 overflow-hidden flex items-end"
        style={{ y: yTop, opacity }}
      >
        <svg 
          viewBox="0 0 100 10" 
          preserveAspectRatio="none" 
          className="w-full h-12 fill-[#050505] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
        >
          <path d="M0,0 L0,5 L5,2 L10,8 L15,3 L20,7 L25,1 L30,6 L35,2 L40,8 L45,3 L50,9 L55,4 L60,8 L65,1 L70,7 L75,2 L80,9 L85,3 L90,6 L95,1 L100,5 L100,0 Z" />
        </svg>
      </motion.div>

      {/* Bottom Tear */}
      <motion.div 
        className="absolute bottom-0 w-full h-1/2 overflow-hidden flex items-start"
        style={{ y: yBottom, opacity }}
      >
        <svg 
          viewBox="0 0 100 10" 
          preserveAspectRatio="none" 
          className="w-full h-12 fill-[#050505] drop-shadow-[0_-10px_10px_rgba(0,0,0,0.5)]"
        >
          <path d="M0,10 L0,5 L5,2 L10,8 L15,3 L20,7 L25,1 L30,6 L35,2 L40,8 L45,3 L50,9 L55,4 L60,8 L65,1 L70,7 L75,2 L80,9 L85,3 L90,6 L95,1 L100,5 L100,10 Z" />
        </svg>
      </motion.div>

    </div>
  )
}

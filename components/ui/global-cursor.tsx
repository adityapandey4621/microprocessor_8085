"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

export default function GlobalCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      const percentX = (e.clientX / window.innerWidth) * 100
      const percentY = (e.clientY / window.innerHeight) * 100
      document.documentElement.style.setProperty("--mouse-x", `${percentX.toFixed(2)}%`)
      document.documentElement.style.setProperty("--mouse-y", `${percentY.toFixed(2)}%`)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Check if hovering over interactive elements or text we want to highlight
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.closest('a') ||
        target.closest('button') ||
        target.tagName.toLowerCase() === 'h1' ||
        target.tagName.toLowerCase() === 'h2' ||
        target.closest('.magnetic-hover')
      ) {
        setIsHovering(true)
      } else {
        setIsHovering(false)
      }
    }

    window.addEventListener("mousemove", updateMousePosition)
    window.addEventListener("mouseover", handleMouseOver)

    return () => {
      window.removeEventListener("mousemove", updateMousePosition)
      window.removeEventListener("mouseover", handleMouseOver)
    }
  }, [])

  return (
    <motion.div
      ref={cursorRef}
      className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[9999] mix-blend-difference bg-white flex items-center justify-center overflow-hidden"
      animate={{
        x: mousePosition.x - (isHovering ? 64 : 16),
        y: mousePosition.y - (isHovering ? 64 : 16),
        width: isHovering ? 128 : 32,
        height: isHovering ? 128 : 32,
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 15,
        mass: 0.1,
      }}
    />
  )
}

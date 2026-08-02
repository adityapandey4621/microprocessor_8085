"use client"

import React, { useEffect, useState, useRef } from "react"

interface TrailDot {
  id: number
  x: number
  y: number
  alpha: number
}

export function FuturisticCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [hovered, setHovered] = useState(false)
  const [clicking, setClicking] = useState(false)
  const [trails, setTrails] = useState<TrailDot[]>([])

  const requestRef = useRef<number | null>(null)
  const targetPos = useRef({ x: -100, y: -100 })
  const currentPos = useRef({ x: -100, y: -100 })
  const dotIdCounter = useRef(0)
  const isTouchDevice = useRef(false)

  useEffect(() => {
    // Hide on touch devices
    if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
      isTouchDevice.current = true
      return
    }

    const onMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY }
      
      // Add a trail dot occasionally
      dotIdCounter.current += 1
      if (dotIdCounter.current % 3 === 0) {
        setTrails((prev) => [
          ...prev.slice(-12),
          { id: dotIdCounter.current, x: e.clientX, y: e.clientY, alpha: 0.8 },
        ])
      }
    }

    const onMouseDown = () => setClicking(true)
    const onMouseUp = () => setClicking(false)

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button" ||
        target.classList.contains("interactive-hover")
      ) {
        setHovered(true)
      } else {
        setHovered(false)
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)
    window.addEventListener("mouseover", onMouseOver)

    // Smooth lerp loop for the orbital ring
    const animate = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.18
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.18
      setPos({ x: currentPos.current.x, y: currentPos.current.y })

      // Fade trails
      setTrails((prev) =>
        prev
          .map((dot) => ({ ...dot, alpha: dot.alpha - 0.04 }))
          .filter((dot) => dot.alpha > 0.05)
      )

      requestRef.current = requestAnimationFrame(animate)
    }
    requestRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mouseup", onMouseUp)
      window.removeEventListener("mouseover", onMouseOver)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [])

  if (isTouchDevice.current) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Electronic particle trails */}
      {trails.map((dot) => (
        <div
          key={dot.id}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00E5FF] transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-75"
          style={{
            left: dot.x,
            top: dot.y,
            opacity: dot.alpha,
          }}
        />
      ))}

      {/* Main center core dot */}
      <div
        className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
          hovered ? "w-2.5 h-2.5 bg-orange-400 shadow-[0_0_12px_#FF9F43]" : "w-2 h-2 bg-cyan-300 shadow-[0_0_10px_#00E5FF]"
        }`}
        style={{
          left: targetPos.current.x,
          top: targetPos.current.y,
        }}
      />

      {/* Outer magnetic orbital ring */}
      <div
        className={`absolute rounded-full border transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out ${
          clicking
            ? "w-8 h-8 border-orange-400 scale-75 bg-orange-500/10"
            : hovered
            ? "w-12 h-12 border-cyan-400/80 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,229,255,0.3)] rotate-45"
            : "w-9 h-9 border-cyan-400/50 bg-white/[0.01]"
        }`}
        style={{
          left: pos.x,
          top: pos.y,
        }}
      />
    </div>
  )
}

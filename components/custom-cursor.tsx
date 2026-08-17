"use client"

import React, { useEffect, useState, useRef } from "react"

export function FuturisticCursor() {
  const [hovered, setHovered] = useState(false)
  const [clicking, setClicking] = useState(false)

  const requestRef = useRef<number | null>(null)
  const targetPos = useRef({ x: -100, y: -100 })
  const currentPos = useRef({ x: -100, y: -100 })
  const isTouchDevice = useRef(false)

  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
      isTouchDevice.current = true
      return
    }

    const onMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
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

    const animate = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.2
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.2
      
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`
      }

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
      {/* Precision outer ring */}
      <div
        ref={ringRef}
        className={`absolute left-0 top-0 rounded-full border transition-all duration-200 ease-out ${
          clicking
            ? "w-7 h-7 border-amber-400 scale-90 bg-amber-500/10"
            : hovered
            ? "w-10 h-10 border-amber-400/80 bg-amber-500/10 scale-110"
            : "w-8 h-8 border-white/20 bg-transparent"
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Main core dot */}
      <div
        ref={dotRef}
        className={`absolute left-0 top-0 rounded-full transition-colors duration-150 ${
          hovered ? "w-2 h-2 bg-amber-400" : "w-1.5 h-1.5 bg-white/80"
        }`}
        style={{ willChange: 'transform' }}
      />
    </div>
  )
}

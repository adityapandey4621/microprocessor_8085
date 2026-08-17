"use client"

import { MotionValue, useMotionValueEvent } from "framer-motion"
import { useEffect, useRef } from "react"

export default function SequenceCanvas({ progress }: { progress: MotionValue<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const lastDrawnFrameRef = useRef<number>(-1)
  
  const frameCount = 299

  useEffect(() => {
    const images: HTMLImageElement[] = new Array(frameCount)
    let isCancelled = false
    
    // Step 1: Immediately load initial 25 frames for immediate hero rendering
    for (let i = 1; i <= 25; i++) {
      const img = new Image()
      img.src = `/sequence/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`
      img.onload = () => {
        if (!isCancelled && i === 1 && canvasRef.current) {
          drawFrame(1)
        }
      }
      images[i - 1] = img
    }
    imagesRef.current = images

    // Step 2: Progressively queue remaining frames (26 to 299) in background batches
    let currentBatchStart = 26
    const batchSize = 25

    const loadNextBatch = () => {
      if (isCancelled || currentBatchStart > frameCount) return
      
      const batchEnd = Math.min(frameCount, currentBatchStart + batchSize - 1)
      for (let i = currentBatchStart; i <= batchEnd; i++) {
        const img = new Image()
        img.src = `/sequence/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`
        images[i - 1] = img
      }
      
      currentBatchStart += batchSize
      if (currentBatchStart <= frameCount) {
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          window.requestIdleCallback(loadNextBatch)
        } else {
          setTimeout(loadNextBatch, 50)
        }
      }
    }

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(loadNextBatch)
    } else {
      setTimeout(loadNextBatch, 50)
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
        lastDrawnFrameRef.current = -1
        drawFrame(Math.max(1, Math.floor(progress.get() * frameCount)))
      }
    }
    
    window.addEventListener("resize", handleResize)
    handleResize()
    
    return () => {
      isCancelled = true
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const drawFrame = (index: number) => {
    if (!canvasRef.current || index === lastDrawnFrameRef.current) return
    const canvas = canvasRef.current
    const img = imagesRef.current[index - 1]
    
    if (img && img.complete) {
      const ctx = canvas.getContext("2d", { alpha: false })
      if (ctx) {
        const canvasRatio = canvas.width / canvas.height
        const imgRatio = img.width / img.height
        
        let drawWidth = canvas.width
        let drawHeight = canvas.height
        let offsetX = 0
        let offsetY = 0

        if (canvasRatio > imgRatio) {
          drawHeight = canvas.width / imgRatio
          offsetY = (canvas.height - drawHeight) / 2
        } else {
          drawWidth = canvas.height * imgRatio
          offsetX = (canvas.width - drawWidth) / 2
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
        lastDrawnFrameRef.current = index
      }
    }
  }

  useMotionValueEvent(progress, "change", (latest) => {
    const frameIndex = Math.max(1, Math.min(frameCount, Math.floor(latest * frameCount)))
    requestAnimationFrame(() => drawFrame(frameIndex))
  })

  return (
    <div className="w-full h-full relative bg-[#030308]">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover pointer-events-none"
      />
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at center, #1a1a2e 0%, transparent 70%)"
        }}
      />
    </div>
  )
}


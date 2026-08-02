"use client"

import React, { ReactNode } from "react"
import { Rnd } from "react-rnd"
import { X, GripHorizontal } from "lucide-react"

interface FloatingWindowProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  defaultWidth?: number | string
  defaultHeight?: number | string
  defaultX?: number
  defaultY?: number
  minWidth?: number
  minHeight?: number
}

export function FloatingWindow({
  isOpen,
  onClose,
  title,
  children,
  defaultWidth = 400,
  defaultHeight = 500,
  defaultX,
  defaultY,
  minWidth = 300,
  minHeight = 400
}: FloatingWindowProps) {
  if (!isOpen) return null

  // Calculate safe coordinates to ensure the window is always grab-able and stays inside bounds
  let x = 10
  let y = 10

  if (typeof window !== 'undefined') {
    const w = typeof defaultWidth === 'number' ? defaultWidth : parseInt(String(defaultWidth)) || 400
    const h = typeof defaultHeight === 'number' ? defaultHeight : parseInt(String(defaultHeight)) || 500

    // Fallback coordinates if not specified
    const targetX = defaultX !== undefined ? defaultX : window.innerWidth - w - 20
    const targetY = defaultY !== undefined ? defaultY : window.innerHeight / 2 - h / 2

    x = Math.max(10, Math.min(targetX, window.innerWidth - w - 20))
    y = Math.max(10, Math.min(targetY, window.innerHeight - h - 20))
  }

  return (
    <Rnd
      style={{ display: "flex", flexDirection: "column", zIndex: 50 }}
      default={{
        x,
        y,
        width: defaultWidth,
        height: defaultHeight,
      }}
      minWidth={minWidth}
      minHeight={minHeight}
      dragHandleClassName="drag-handle"
      className="flex flex-col bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden"
    >
      {/* Header / Drag Handle */}
      <div className="drag-handle flex items-center justify-between p-3 border-b border-border/50 bg-muted/30 cursor-move shrink-0 group">
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-semibold text-sm select-none">{title}</h3>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden min-h-0 bg-background/50 flex flex-col">
        {children}
      </div>
    </Rnd>
  )
}

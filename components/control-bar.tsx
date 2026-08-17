"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Play, Pause, StepForward, StepBack as StepBackIcon,
  RotateCcw, Trash2, Hammer, Save, Share2, Download, FolderOpen, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ControlBarProps {
  onAssemble: () => void
  onRun: () => void
  onPause?: () => void
  onStep: () => void
  onStepBack: () => void
  onReset: () => void
  onClear: () => void
  onSave: () => void
  onOpen: (content: string) => void
  onShare: () => void
  onDownload: () => void
  isRunning?: boolean
  executionSpeed?: number
  setExecutionSpeed?: (speed: number) => void
}

function IconBtn({
  onClick,
  title,
  children,
  className,
}: {
  onClick?: () => void
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
        "text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-95",
        className
      )}
    >
      {children}
    </button>
  )
}

export default function ControlBar({
  onAssemble, onRun, onPause, onStep, onStepBack,
  onReset, onClear, onSave, onOpen, onShare, onDownload,
  isRunning, executionSpeed, setExecutionSpeed,
}: ControlBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      onOpen(event.target?.result as string)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
    reader.readAsText(file)
  }

  const [freqText, setFreqText] = useState("3 MHz")
  useEffect(() => {
    if (executionSpeed === 0)        setFreqText("3 MHz")
    else if (executionSpeed === 1000) setFreqText("1 kHz")
    else if (executionSpeed === 100)  setFreqText("100 Hz")
    else if (executionSpeed === 10)   setFreqText("10 Hz")
    else if (executionSpeed === 1)    setFreqText("1 Hz")
    else if (executionSpeed)
      setFreqText(executionSpeed >= 1000 ? `${executionSpeed / 1000} kHz` : `${executionSpeed} Hz`)
  }, [executionSpeed])

  const parseAndSetSpeed = () => {
    const text = freqText.toLowerCase().trim()
    if (text === "3 mhz" || text === "0" || text.includes("real")) {
      setExecutionSpeed?.(0); setFreqText("3 MHz"); return
    }
    let multiplier = 1
    if (text.includes("k")) multiplier = 1000
    if (text.includes("m")) multiplier = 1_000_000
    const num = parseFloat(text.replace(/[^0-9.]/g, ""))
    if (!isNaN(num)) {
      const speed = num * multiplier
      if (speed >= 3_000_000) { setExecutionSpeed?.(0); setFreqText("3 MHz") }
      else {
        const final = Math.max(1, Math.round(speed))
        setExecutionSpeed?.(final)
        setFreqText(final >= 1000 ? `${final / 1000} kHz` : `${final} Hz`)
      }
    } else {
      setFreqText(executionSpeed === 0 ? "3 MHz" : `${executionSpeed} Hz`)
    }
  }

  return (
    <div className="flex items-center flex-wrap gap-2 px-4 py-2.5 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">

      {/* ── PRIMARY ACTIONS ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Assemble */}
        <button
          onClick={onAssemble}
          title="Assemble (Ctrl+Enter)"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
        >
          <Hammer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Assemble</span>
        </button>

        {/* Run / Pause */}
        {isRunning ? (
          <button
            onClick={onPause}
            title="Pause"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-300 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Pause</span>
          </button>
        ) : (
          <button
            onClick={onRun}
            title="Run (F5)"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Run</span>
          </button>
        )}
      </div>

      {/* Speed input */}
      <div className="flex items-center gap-1.5 bg-muted/60 hover:bg-muted rounded-full px-3 py-1 border border-border h-8 transition-colors">
        <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
        <input
          type="text"
          value={freqText}
          onChange={(e) => setFreqText(e.target.value)}
          onBlur={parseAndSetSpeed}
          onKeyDown={(e) => e.key === "Enter" && parseAndSetSpeed()}
          className="bg-transparent text-foreground text-xs font-mono font-semibold focus:outline-none w-14 text-center placeholder:text-muted-foreground"
          title="Execution Speed (e.g., 100Hz, 1kHz, 3MHz)"
        />
      </div>

      {/* Step / Step Back */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onStep}
          title="Step (F10)"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <StepForward className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Step</span>
        </button>
        <button
          onClick={onStepBack}
          title="Step Back (F9)"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 bg-blue-500/15 hover:bg-blue-500/25 text-blue-700 dark:text-blue-300 border border-blue-500/30"
        >
          <StepBackIcon className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Step Back</span>
        </button>
      </div>

      {/* ── DIVIDER ───────────────────────────────────────────────── */}
      <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

      {/* ── FILE ACTIONS ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <input
          type="file"
          accept=".asm,.txt"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <IconBtn onClick={() => fileInputRef.current?.click()} title="Open file" className="rounded-full px-3">
          <FolderOpen className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Open</span>
        </IconBtn>
        <IconBtn onClick={onSave} title="Save to cloud" className="rounded-full px-3">
          <Save className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Save</span>
        </IconBtn>
        <IconBtn onClick={onShare} title="Copy share link" className="rounded-full px-3">
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Share</span>
        </IconBtn>
        <IconBtn onClick={onDownload} title="Download .asm" className="rounded-full px-3">
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Download</span>
        </IconBtn>
      </div>

      {/* ── DIVIDER ───────────────────────────────────────────────── */}
      <div className="w-px h-5 bg-border mx-1 hidden sm:block" />

      {/* ── RESET / CLEAR ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        <IconBtn onClick={onReset} title="Reset CPU (Ctrl+R)" className="rounded-full px-3">
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset</span>
        </IconBtn>
        <IconBtn
          onClick={onClear}
          title="Clear editor"
          className="rounded-full px-3 hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Clear</span>
        </IconBtn>
      </div>

      {/* ── ZERO-LAG WORKER BADGE ─────────────────────────────────── */}
      <div className="hidden xl:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold ml-auto" title="8085 Emulation running in Web Worker (0ms UI lag)">
        <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
        <span>Worker Mode (0ms Lag)</span>
      </div>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Cpu, Zap, Layers, Activity, Sparkles, Terminal, ArrowRight,
  RefreshCw, Play, ShieldCheck, Database, Code2, Eye, Compass
} from "lucide-react"
import { cpuSound } from "./audio-synth"

/* ─────────────────────────────────────────────────────────────────────────────
   1. HOLOGRAPHIC 3D TILT GLASS CARD (Section 3 - "Show Intelligence")
   ───────────────────────────────────────────────────────────────────────────── */
export interface HolographicCardProps {
  title: string
  category: string
  description: string
  icon: React.ReactNode
  accentColor?: string
}

export function HolographicCard({
  title,
  category,
  description,
  icon,
  accentColor = "#00E5FF"
}: HolographicCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -12
    const rotateY = ((x - centerX) / centerX) * 12
    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => cpuSound.playHoverSynth()}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: "transform 0.15s ease-out",
      }}
      className="group relative rounded-2xl border border-cyan-500/20 bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-cyan-400/60 transition-all duration-300"
    >
      {/* Top neon glow bar */}
      <div
        className="absolute top-0 left-6 right-6 h-0.5 rounded-full transition-all duration-300 opacity-60 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/10"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
            boxShadow: `0 0 15px ${accentColor}30`,
          }}
        >
          {icon}
        </div>
        <span
          className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/10"
          style={{ color: accentColor, backgroundColor: `${accentColor}10` }}
        >
          {category}
        </span>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-cyan-300 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Decorative corner indicators */}
      <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 group-hover:scale-125 transition-all" />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. LIVE EXECUTION PIPELINE HUD (Section 2)
   ───────────────────────────────────────────────────────────────────────────── */
const PIPELINE_STEPS = [
  { id: 1, name: "FETCH (IR)", desc: "Reads opcode 3EH from memory address 2000H via Address Bus" },
  { id: 2, name: "DECODE (DEC)", desc: "Instruction Decoder parses mnemonic MVI A, 42H" },
  { id: 3, name: "ALU EXECUTE", desc: "Arithmetic Logic Unit prepares 8-bit immediate value 42H" },
  { id: 4, name: "REG UPDATE", desc: "Accumulator (Reg A) updated to 42H; flags preserved" },
  { id: 5, name: "OUTPUT BUS", desc: "Result latched on Data Bus & visible in monitor UI" },
]

export function ExecutionPipelineHUD() {
  const [activeStep, setActiveStep] = useState(1)
  const [isRunning, setIsRunning] = useState(false)

  const handleNextStep = () => {
    cpuSound.playRegisterTick()
    setActiveStep((prev) => (prev >= 5 ? 1 : prev + 1))
  }

  const handleAutoRun = () => {
    if (isRunning) return
    setIsRunning(true)
    cpuSound.playRelayClick()
    let current = 1
    setActiveStep(1)

    const interval = setInterval(() => {
      current++
      if (current > 5) {
        clearInterval(interval)
        setIsRunning(false)
        cpuSound.playMemoryPing()
      } else {
        setActiveStep(current)
        cpuSound.playRegisterTick()
      }
    }, 700)
  }

  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[rgba(10,18,36,0.75)] backdrop-blur-xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,229,255,0.15)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest block mb-1">
            ⚡ IRON MAN HUD • LIVE CPU CYCLES
          </span>
          <h3 className="text-2xl font-black text-foreground">
            5-Stage Instruction Execution Pipeline
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleNextStep}
            disabled={isRunning}
            className="bg-white/10 hover:bg-white/20 text-cyan-300 font-mono text-xs gap-1.5 border border-cyan-500/40"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Step Cycle
          </Button>
          <Button
            size="sm"
            onClick={handleAutoRun}
            disabled={isRunning}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold font-mono text-xs gap-1.5 shadow-[0_0_20px_rgba(0,229,255,0.4)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Executing..." : "Auto-Run Demo"}
          </Button>
        </div>
      </div>

      {/* Step nodes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {PIPELINE_STEPS.map((step) => {
          const isCurrent = activeStep === step.id
          const isPassed = activeStep > step.id
          return (
            <div
              key={step.id}
              onClick={() => {
                setActiveStep(step.id)
                cpuSound.playRegisterTick()
              }}
              className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 relative overflow-hidden ${
                isCurrent
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_25px_rgba(0,229,255,0.3)] scale-105"
                  : isPassed
                  ? "bg-white/[0.04] border-emerald-500/40 text-emerald-300"
                  : "bg-white/[0.02] border-white/10 text-muted-foreground opacity-60 hover:opacity-100"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="px-2 py-0.5 rounded-md bg-black/40 font-bold">
                  STEP 0{step.id}
                </span>
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
                )}
              </div>
              <div className="font-bold text-sm mb-1">{step.name}</div>
              <p className="text-xs opacity-80 line-clamp-2">{step.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Active step readout panel */}
      <div className="rounded-xl bg-black/50 border border-orange-500/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_10px_#FF9F43] animate-pulse" />
          <span className="font-mono text-sm text-orange-300 font-semibold">
            ACTIVE T-STATE: {PIPELINE_STEPS[activeStep - 1].name}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {PIPELINE_STEPS[activeStep - 1].desc}
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. VOXEL MEMORY INSPECTOR PANEL (Section 4)
   ───────────────────────────────────────────────────────────────────────────── */
export function VoxelMemoryHUD({
  selectedAddr,
  selectedCode,
  selectedMeaning
}: {
  selectedAddr: string
  selectedCode: string
  selectedMeaning: string
}) {
  return (
    <div className="rounded-2xl border border-cyan-500/30 bg-[rgba(10,18,36,0.85)] backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(0,229,255,0.15)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
          3D VOXEL MEMORY INSPECTOR
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          64KB RANDOM ACCESS MEMORY
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-xs text-muted-foreground font-mono mb-1">SELECTED ADDRESS</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400">
            {selectedAddr || "2000H"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-orange-500/30">
          <div className="text-xs text-orange-400 font-mono mb-1">HEX OPCODE BYTE</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-orange-300">
            {selectedCode || "3EH"}
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
        <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-1">
          DECODED INSTRUCTION MEANING
        </div>
        <div className="text-sm sm:text-base font-mono text-foreground font-semibold">
          {selectedMeaning || "MVI A, 42H: Load immediate 42H into Accumulator"}
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className="text-xs text-muted-foreground/80 italic">
          💡 Hover or click any 3D cube in the voxel wall to inspect memory addresses in real-time.
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. REGISTER ENERGY BEAM CONTROL PAD (Section 5)
   ───────────────────────────────────────────────────────────────────────────── */
export function RegisterEnergyHUD({
  onFireBeam
}: {
  onFireBeam: (from: string, to: string, desc: string) => void
}) {
  const [activeInstruction, setActiveInstruction] = useState("MOV A, B")

  const INSTRUCTIONS = [
    { asm: "MOV A, B", from: "B", to: "A", desc: "Transfers 8-bit contents of Reg B into Accumulator A" },
    { asm: "ADD C", from: "C", to: "A", desc: "Adds Reg C to Accumulator A (A = A + C)" },
    { asm: "SUB E", from: "E", to: "A", desc: "Subtracts Reg E from Accumulator A (A = A - E)" },
    { asm: "MOV D, H", from: "H", to: "D", desc: "Transfers high byte Reg H into Reg D" },
    { asm: "XRA L", from: "L", to: "A", desc: "Bitwise XOR between Reg L and Accumulator A" },
  ]

  return (
    <div className="rounded-2xl border border-purple-500/30 bg-[rgba(10,18,36,0.85)] backdrop-blur-xl p-6 shadow-[0_0_40px_rgba(124,58,237,0.2)]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
          ⚡ REGISTER-TO-ALU ENERGY TRANSFERS
        </span>
        <span className="text-xs text-muted-foreground font-mono">
          CLICK TO FIRE ENERGY BEAM
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mb-4">
        {INSTRUCTIONS.map((inst) => {
          const isSelected = activeInstruction === inst.asm
          return (
            <button
              key={inst.asm}
              onClick={() => {
                setActiveInstruction(inst.asm)
                onFireBeam(inst.from, inst.to, inst.desc)
                cpuSound.playRegisterTick()
              }}
              className={`p-3 rounded-xl border text-center font-mono transition-all duration-300 ${
                isSelected
                  ? "bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(124,58,237,0.4)] scale-105"
                  : "bg-white/[0.03] border-white/10 text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
              }`}
            >
              <div className="font-bold text-sm">{inst.asm}</div>
              <div className="text-[10px] opacity-70 mt-1">{inst.from} → {inst.to}</div>
            </button>
          )
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-black/50 border border-purple-500/30 text-xs font-mono text-purple-300">
        <span className="font-bold text-orange-300">ENERGY BEAM ACTIVE:</span>{" "}
        {INSTRUCTIONS.find((i) => i.asm === activeInstruction)?.desc}
      </div>
    </div>
  )
}

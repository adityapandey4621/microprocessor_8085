"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Cpu, Monitor, Database, Cloud, Zap, BarChart3, Code2,
  Layers, ArrowRight, Play, RefreshCw, Terminal, Activity,
  Sparkles, ShieldCheck, CheckCircle2, ChevronRight, Info,
  Bot, HeartHandshake, MessageSquareCode, BrainCircuit,
  Volume2, VolumeX, Power
} from "lucide-react"
import AuthModal from "./auth-modal"
import Link from "next/link"
import * as animejs from "animejs"
import dynamic from "next/dynamic"
import { hardwareAudio } from "@/components/audio-synth"

const HumanAILabScene = dynamic(
  () => import("@/components/3d/human-ai-scene").then((mod) => mod.HumanAILabScene),
  { ssr: false }
)

// Universal animation runner compatible with Anime.js v4 and v3 across all bundlers
function runAnime(targets: any, params: any) {
  const mod: any = animejs
  const v4Fn = mod.animate || mod.default?.animate
  const v3Fn = mod.default || mod
  if (typeof v4Fn === "function") {
    return v4Fn(targets, {
      ...params,
      ease: params.ease || params.easing || "outQuad",
      onUpdate: params.onUpdate || params.update,
    })
  } else if (typeof v3Fn === "function") {
    return v3Fn({
      targets,
      ...params,
    })
  }
}

/* ─── 1. Animated Stat Counters using Anime.js ────────────────────────────── */
function AnimatedCounter({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState("0")
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const obj = { val: 0 }
    runAnime(obj, {
      val: value,
      easing: "easeOutExpo",
      duration: 2200,
      round: decimals === 0 ? 1 : undefined,
      update: () => {
        setDisplayValue(obj.val.toFixed(decimals))
      }
    })
  }, [value, decimals])

  return (
    <span ref={counterRef} className="font-mono font-bold tracking-tight">
      {displayValue}
      {suffix}
    </span>
  )
}

/* ─── 2. Interactive Live 8085 Assembly Execution Preview ─────────────────── */
function LiveAssemblyPreview() {
  const [activeDemo, setActiveDemo] = useState<"add" | "loop" | "int">("add")
  const [running, setRunning] = useState(false)

  // Live emulator preview state
  const [regA, setRegA] = useState("00")
  const [regB, setRegB] = useState("00")
  const [regC, setRegC] = useState("00")
  const [regPC, setRegPC] = useState("2000")
  const [flagZ, setFlagZ] = useState(0)
  const [flagCY, setFlagCY] = useState(0)
  const [flagP, setFlagP] = useState(0)
  const [currentLine, setCurrentLine] = useState(0)

  const regARef = useRef<HTMLDivElement>(null)
  const regBRef = useRef<HTMLDivElement>(null)
  const flagRef = useRef<HTMLDivElement>(null)

  const triggerGlow = (el: HTMLElement | null, color: string = "#00f0ff") => {
    if (!el) return
    runAnime(el, {
      scale: [1, 1.15, 1],
      boxShadow: [`0 0 0px ${color}`, `0 0 20px ${color}`, `0 0 0px ${color}`],
      duration: 600,
      easing: "easeOutQuad"
    })
  }

  const runDemo = (demo: "add" | "loop" | "int") => {
    if (running) return
    setActiveDemo(demo)
    setRunning(true)
    setCurrentLine(0)

    if (demo === "add") {
      setRegA("00"); setRegB("00"); setRegC("00"); setRegPC("2000"); setFlagZ(0); setFlagCY(0); setFlagP(0)
      setTimeout(() => {
        setCurrentLine(1)
        setRegA("42")
        setRegPC("2002")
        triggerGlow(regARef.current, "#00f0ff")
        hardwareAudio.playCapacitorCharge()
      }, 500)
      setTimeout(() => {
        setCurrentLine(2)
        setRegB("15")
        setRegPC("2004")
        triggerGlow(regBRef.current, "#8a2be2")
        hardwareAudio.playCapacitorCharge()
      }, 1200)
      setTimeout(() => {
        setCurrentLine(3)
        setRegA("57") // 42H + 15H = 57H
        setRegPC("2005")
        setFlagP(1) // Parity even for 01010111 ? (4 ones -> even -> P=1)
        triggerGlow(regARef.current, "#00ff66")
        triggerGlow(flagRef.current, "#00ff66")
        hardwareAudio.playCapacitorCharge()
        setRunning(false)
      }, 2000)
    } else if (demo === "loop") {
      setRegA("00"); setRegB("00"); setRegC("05"); setRegPC("2000"); setFlagZ(0); setFlagCY(0); setFlagP(0)
      let count = 5
      const stepLoop = () => {
        if (count > 0) {
          count--
          setRegC(`0${count}`)
          setRegPC("2001")
          if (count === 0) {
            setFlagZ(1)
            triggerGlow(flagRef.current, "#ffaa00")
          }
          hardwareAudio.playCapacitorCharge()
          if (count > 0) {
            setTimeout(stepLoop, 600)
          } else {
            setRunning(false)
          }
        }
      }
      setTimeout(stepLoop, 600)
    } else if (demo === "int") {
      setRegA("FF"); setRegB("00"); setRegC("00"); setRegPC("003C"); setFlagZ(0); setFlagCY(0); setFlagP(1)
      triggerGlow(regARef.current, "#ff0055")
      hardwareAudio.playCapacitorCharge()
      setTimeout(() => {
        setRunning(false)
      }, 1000)
    }
  }

  const demos = {
    add: [
      { line: 0, addr: "2000", code: "MVI A, 42H", comment: "; Load hex 42 into Accumulator" },
      { line: 1, addr: "2002", code: "MVI B, 15H", comment: "; Load hex 15 into Register B" },
      { line: 2, addr: "2004", code: "ADD B", comment: "; A ← A + B (Result: 57H)" },
      { line: 3, addr: "2005", code: "HLT", comment: "; Halt execution & raise parity flag" }
    ],
    loop: [
      { line: 0, addr: "2000", code: "MVI C, 05H", comment: "; Initialize loop counter C = 5" },
      { line: 1, addr: "2002", code: "DCR C", comment: "; Decrement C (sets Zero flag when 0)" },
      { line: 2, addr: "2003", code: "JNZ 2002H", comment: "; Jump back if C ≠ 0" },
      { line: 3, addr: "2006", code: "HLT", comment: "; Loop finished successfully" }
    ],
    int: [
      { line: 0, addr: "003C", code: "RST 7.5", comment: "; Hardware Interrupt Vector" },
      { line: 1, addr: "003D", code: "PUSH PSW", comment: "; Save Processor Status Word" },
      { line: 2, addr: "003E", code: "MVI A, FFH", comment: "; Service routine active" },
      { line: 3, addr: "0040", code: "EI / RET", comment: "; Re-enable interrupts & Return" }
    ]
  }

  return (
    <div className="bg-[#0e141d] border border-cyan-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 animate-pulse" />
            Live 8085 Interactive Hardware Sandbox
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Test Assembly Code Without Installing Anything
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => runDemo("add")}
            disabled={running}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeDemo === "add"
                ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            ⚡ ADD Demo
          </button>
          <button
            onClick={() => runDemo("loop")}
            disabled={running}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeDemo === "loop"
                ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(138,43,226,0.4)]"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            🔄 Loop Demo
          </button>
          <button
            onClick={() => runDemo("int")}
            disabled={running}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeDemo === "int"
                ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            💡 RST 7.5 IRQ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Assembly Code View */}
        <div className="lg:col-span-7 bg-[#090d13] border border-white/10 rounded-xl p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-white/5 pb-2 mb-3">
            <span>ADDR : INSTRUCTION</span>
            <span className="text-cyan-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              CPU READY
            </span>
          </div>
          <div className="space-y-2">
            {demos[activeDemo].map((row, idx) => {
              const isCurrent = currentLine === row.line
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded transition-all ${
                    isCurrent
                      ? "bg-cyan-500/20 border-l-4 border-cyan-400 text-white font-bold"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">{row.addr}</span>
                    <span className={isCurrent ? "text-cyan-300" : "text-slate-200"}>
                      {row.code}
                    </span>
                  </div>
                  <span className="text-slate-500 hidden sm:inline">{row.comment}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Real-time Register & Flag Visualizer */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3">
          <div
            ref={regARef}
            className="bg-[#111722] border border-cyan-500/30 rounded-xl p-3 flex flex-col justify-between"
          >
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
              Accumulator [A]
            </div>
            <div className="text-3xl font-mono font-bold text-white tracking-wider mt-2">
              {regA}
              <span className="text-xs text-cyan-400 ml-1">HEX</span>
            </div>
          </div>

          <div
            ref={regBRef}
            className="bg-[#111722] border border-purple-500/30 rounded-xl p-3 flex flex-col justify-between"
          >
            <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider">
              Register [B]
            </div>
            <div className="text-3xl font-mono font-bold text-white tracking-wider mt-2">
              {regB}
              <span className="text-xs text-purple-400 ml-1">HEX</span>
            </div>
          </div>

          <div className="bg-[#111722] border border-emerald-500/30 rounded-xl p-3 flex flex-col justify-between">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
              Program Counter
            </div>
            <div className="text-2xl font-mono font-bold text-white tracking-wider mt-2">
              {regPC}
              <span className="text-xs text-emerald-400 ml-1">H</span>
            </div>
          </div>

          <div
            ref={flagRef}
            className="bg-[#111722] border border-amber-500/30 rounded-xl p-3 flex flex-col justify-between"
          >
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              PSW Status Flags
            </div>
            <div className="flex items-center gap-2 mt-2 font-mono text-sm font-bold text-white">
              <span className={flagZ ? "text-amber-400 underline" : "text-slate-600"}>Z:{flagZ}</span>
              <span className={flagCY ? "text-amber-400 underline" : "text-slate-600"}>CY:{flagCY}</span>
              <span className={flagP ? "text-amber-400 underline" : "text-slate-600"}>P:{flagP}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── 3. Interactive CPU Architecture Schematic ───────────────────────────── */
function InteractiveCPUDiagram() {
  const [selectedModule, setSelectedModule] = useState<"acc" | "alu" | "flags" | "regs" | "pc" | "int">("acc")

  const modules = {
    acc: {
      title: "Accumulator (Register A)",
      subtitle: "8-Bit Primary Operand & Arithmetic Destination",
      desc: "The Accumulator is the primary 8-bit register in the 8085 CPU. Almost every ALU instruction implicitly reads one operand from A and stores the calculated result back into A.",
      example: "MVI A, 3FH  ; Load 3F hex directly into Accumulator"
    },
    alu: {
      title: "Arithmetic Logic Unit (ALU)",
      subtitle: "High-Speed Hardware Computation Engine",
      desc: "Performs 8-bit addition, subtraction, logical AND, OR, XOR, compare, and rotate operations in a single T-state cycle using two's complement binary arithmetic.",
      example: "ADD B       ; Accumulator = Accumulator + Register B"
    },
    flags: {
      title: "PSW Status Flag Register",
      subtitle: "5 Hardware Flip-Flops (Z, S, P, CY, AC)",
      desc: "Stores the immediate mathematical condition of the last ALU operation. Used by conditional jump instructions (JZ, JC, JM, JPE) to create intelligent branching programs.",
      example: "JZ 2050H    ; Jump to address 2050H if Zero Flag is set (Z=1)"
    },
    regs: {
      title: "General Purpose Register Array",
      subtitle: "B, C, D, E, H, L (6 x 8-Bit or 3 x 16-Bit Pairs)",
      desc: "Fast on-chip storage for temporary variables and memory pointers. H and L pairs are frequently combined as the 16-bit 'M' pointer for direct RAM addressing.",
      example: "LXI H, 3000H ; Point HL register pair to memory address 3000H"
    },
    pc: {
      title: "Program Counter & Stack Pointer",
      subtitle: "16-Bit Address Bus Control Registers",
      desc: "The Program Counter (PC) holds the 16-bit address of the next instruction to fetch from memory. The Stack Pointer (SP) manages subroutine returns and PUSH/POP operations.",
      example: "CALL 4000H  ; Push PC onto stack & branch to subroutine at 4000H"
    },
    int: {
      title: "Hardware Interrupt Controller",
      subtitle: "TRAP, RST 7.5, 6.5, 5.5, INTR Vectors",
      desc: "Real-time asynchronous hardware interrupt handling. TRAP is non-maskable for power-failure detection, while RST vectors provide prioritized vectored interrupts for peripherals.",
      example: "SIM         ; Set Interrupt Mask to enable/disable RST 7.5/6.5/5.5"
    }
  }

  return (
    <div className="bg-[#0d131d] border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider mb-1">
            Interactive Architecture Inspector
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Click Any 8085 Hardware Subsystem to Explore
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          Intel 8085 Silicon Architecture
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clickable Schematic Grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { id: "acc", name: "Accumulator (A)", icon: Cpu, color: "cyan" },
            { id: "alu", name: "ALU Engine", icon: Activity, color: "purple" },
            { id: "flags", name: "PSW Flags", icon: Sparkles, color: "amber" },
            { id: "regs", name: "Registers B-L", icon: Layers, color: "emerald" },
            { id: "pc", name: "PC & SP (16-Bit)", icon: Terminal, color: "blue" },
            { id: "int", name: "Interrupt Control", icon: Zap, color: "rose" },
          ].map((item) => {
            const isSelected = selectedModule === item.id
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedModule(item.id as any)
                  hardwareAudio.playCapacitorCharge()
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-300 flex flex-col justify-between h-28 ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)] scale-[1.02]"
                    : "bg-[#131b27] border-white/10 hover:border-white/25 hover:bg-[#182232]"
                }`}
              >
                <Icon className={`w-6 h-6 ${isSelected ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
                <div>
                  <div className={`text-xs font-bold font-mono ${isSelected ? "text-white" : "text-slate-300"}`}>
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">8085 CORE</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Module Detail Panel */}
        <div className="lg:col-span-5 bg-[#111925] border border-cyan-500/30 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
              {modules[selectedModule].subtitle}
            </div>
            <h4 className="text-lg font-bold text-white mb-3">
              {modules[selectedModule].title}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              {modules[selectedModule].desc}
            </p>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-lg p-3 font-mono text-xs">
            <div className="text-[10px] text-slate-500 mb-1">EXAMPLE ASSEMBLY INSTRUCTION</div>
            <div className="text-cyan-300 font-bold">{modules[selectedModule].example}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── 4. Human-Like AI Mentor Feature Showcase ────────────────────────────── */
function HumanAIMentorShowcase() {
  const [activeQuestion, setActiveQuestion] = useState(0)

  const qaList = [
    {
      question: "Why did the Carry Flag (CY) set after executing ADD B?",
      answer: "The sum of register A (FFH) and B (05H) exceeded 255 (the maximum 8-bit unsigned value). The 8085 automatically sets CY=1 to signify carry-out into the 9th bit, allowing multi-byte arithmetic!",
      tag: "EMPATHETIC ERROR EXPLANATION"
    },
    {
      question: "Generate an 8085 assembly program to sort an array of 5 numbers.",
      answer: "I've written an optimized Bubble Sort loop using HL as the memory pointer, register D as the exchange flag, and CMP M to compare adjacent bytes. Shall I load it directly into your RAM grid?",
      tag: "INSTANT CODE GENERATION"
    },
    {
      question: "What happens during T-State 1 of an Opcode Fetch machine cycle?",
      answer: "During T1, the CPU places the high address byte on A8-A15, and the low address byte on AD0-AD7 while pulsing ALE (Address Latch Enable) HIGH so the external latch can grab the address before data arrives!",
      tag: "TIMING DIAGRAM MENTOR"
    }
  ]

  return (
    <div className="bg-gradient-to-r from-[#121426] via-[#141a2e] to-[#0e1726] border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold mb-3">
          <HeartHandshake className="w-3.5 h-3.5 text-purple-400" />
          HUMAN-CENTERED AI MENTORSHIP
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          An AI Copilot That Speaks Like a Compassionate Senior Engineer
        </h3>
        <p className="text-slate-300 text-sm md:text-base mt-2 leading-relaxed">
          No more cryptic hex dump confusion. Our embedded AI assistant understands your exact register state, explains flags in plain English, and guides you step-by-step through any assembly challenge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {qaList.map((qa, idx) => {
          const isSelected = activeQuestion === idx
          return (
            <div
              key={idx}
              onClick={() => {
                setActiveQuestion(idx)
                hardwareAudio.playCapacitorCharge()
              }}
              className={`cursor-pointer rounded-xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? "bg-purple-500/20 border-purple-400 shadow-[0_0_25px_rgba(138,43,226,0.25)]"
                  : "bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10"
              }`}
            >
              <div>
                <div className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest mb-2">
                  {qa.tag}
                </div>
                <div className="text-sm font-bold text-white mb-3">
                  &ldquo;{qa.question}&rdquo;
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {qa.answer}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-purple-300">
                <span>🤖 AI RESPONSE</span>
                <span>0.1s LATENCY</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── 5. 3D Perspective Tilt Card Component ───────────────────────────────── */
function TiltCard({
  icon: Icon,
  title,
  description,
  badge
}: {
  icon: any
  title: string
  description: string
  badge?: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    cardRef.current.style.transform = `perspective(1000px) rotateY(${x * 0.04}deg) rotateX(${-y * 0.04}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)"
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-[#10151f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col justify-between"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Icon className="w-6 h-6" />
          </div>
          {badge && (
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-cyan-400">
        <span>ACTIVE SYSTEM</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. MAIN LANDING PAGE EXPERIENCE (NO BLACK SCREEN - INSTANT STUNNING RENDERING)
   ───────────────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [isMuted, setIsMuted] = useState(false)

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setAuthOpen(true)
    hardwareAudio.playPowerSwitchClick()
  }

  const handleToggleSound = () => {
    const muted = hardwareAudio.toggleMute()
    setIsMuted(muted)
  }

  return (
    <div className="min-h-screen text-foreground bg-[#0a0f17] select-none font-sans overflow-x-hidden">
      {/* ─── TOP GLASSMORPHIC HEADER ─── */}
      <header className="sticky top-0 z-50 bg-[#0a0f17]/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-black font-extrabold shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              85
            </div>
            <div>
              <div className="font-bold text-white tracking-tight text-sm flex items-center gap-1.5">
                MP8085 <span className="text-cyan-400 font-mono text-xs">// HUMAN-AI LAB</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                INTEL 8085 CYBERNETIC SIMULATOR
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-slate-300">
            <a href="#3d-core" className="hover:text-cyan-400 transition-colors">3D SILICON CORE</a>
            <a href="#live-sandbox" className="hover:text-cyan-400 transition-colors">LIVE EMULATOR</a>
            <a href="#ai-mentor" className="hover:text-purple-400 transition-colors">AI MENTOR</a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">ARCHITECTURE</a>
            <a href="#features" className="hover:text-cyan-400 transition-colors">FEATURES</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Toggle Audio Feedback"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              onClick={() => openAuth("login")}
              className="text-xs font-mono font-semibold px-3.5 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              LOG IN
            </button>
            <Link
              href="/simulator"
              onClick={() => hardwareAudio.playCapacitorCharge()}
              className="text-xs font-mono font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              LAUNCH SIMULATOR
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION: HUMAN-AI LAB EXPERIENCE ─── */}
      <section id="3d-core" className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Text & CTA */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              NEXT-GEN HUMAN-CENTRIC MICROPROCESSOR STUDIO
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Where Human Ingenuity Meets <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">Cybernetic 8085</span> Simulation.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Experience the Intel 8085 like never before. Interactive 3D silicon die inspection, real-time visual assembly execution, and an empathetic AI assistant that speaks your language.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/simulator"
                onClick={() => hardwareAudio.playCapacitorCharge()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 text-black font-mono font-bold text-sm shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.7)] transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-black" />
                OPEN 3D SIMULATOR
              </Link>

              <button
                onClick={() => openAuth("signup")}
                className="px-6 py-3.5 rounded-xl bg-white/5 border border-white/15 text-white font-mono font-semibold text-sm hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Bot className="w-4 h-4 text-purple-400" />
                TRY AI MENTOR
              </button>
            </div>

            {/* Quick Hero Metrics */}
            <div className="grid grid-cols-4 gap-4 pt-6 border-t border-white/10 font-mono">
              <div>
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter value={3.07} decimals={2} suffix=" MHz" />
                </div>
                <div className="text-[11px] text-slate-400">CLOCK SPEED</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyan-400">
                  <AnimatedCounter value={64} suffix=" KB" />
                </div>
                <div className="text-[11px] text-slate-400">RAM ARRAY</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  <AnimatedCounter value={74} />
                </div>
                <div className="text-[11px] text-slate-400">INSTRUCTIONS</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">
                  <AnimatedCounter value={0} suffix=" ms" />
                </div>
                <div className="text-[11px] text-slate-400">AI LATENCY</div>
              </div>
            </div>
          </div>

          {/* Right: Interactive 3D Silicon & Neural Core */}
          <div className="lg:col-span-6">
            <HumanAILabScene
              onInteract={() => {
                hardwareAudio.playCapacitorCharge()
              }}
            />
          </div>
        </div>
      </section>

      {/* ─── LIVE ASSEMBLY SANDBOX (IMMEDIATE USER INTERACTION) ─── */}
      <section id="live-sandbox" className="py-16 px-6 max-w-7xl mx-auto">
        <LiveAssemblyPreview />
      </section>

      {/* ─── HUMAN-LIKE AI MENTOR SHOWCASE ─── */}
      <section id="ai-mentor" className="py-16 px-6 max-w-7xl mx-auto">
        <HumanAIMentorShowcase />
      </section>

      {/* ─── INTERACTIVE CPU ARCHITECTURE SCHEMATIC ─── */}
      <section id="architecture" className="py-16 px-6 max-w-7xl mx-auto">
        <InteractiveCPUDiagram />
      </section>

      {/* ─── 3D PERSPECTIVE TILT FEATURE CARDS ─── */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            Engineered For Humanity
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Features Built For Students, Engineers & Explorers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TiltCard
            icon={Cpu}
            title="40-Pin Hardware Simulation"
            description="Authentic pin-level voltage, address bus multiplexing (AD0-AD7), and control signals (ALE, IO/M, RD, WR) accurately simulated."
            badge="HARDWARE ACCURATE"
          />
          <TiltCard
            icon={Bot}
            title="Human-Like AI Mentor"
            description="Natural language assembly generation, register diff explanations, and empathetic debugging that teaches you why your program works."
            badge="AI COPILOT"
          />
          <TiltCard
            icon={Activity}
            title="Live PSW Flag Inspector"
            description="Real-time visualization of Zero (Z), Sign (S), Parity (P), Carry (CY), and Auxiliary Carry (AC) flip-flops as each opcode executes."
            badge="INSTANT DEBUG"
          />
          <TiltCard
            icon={Terminal}
            title="Visual Assembly Step-by-Step"
            description="Run at 3.072 MHz real speed or step instruction-by-instruction with glowing visual breakpoints and memory watch tables."
            badge="REALTIME STEP"
          />
          <TiltCard
            icon={Layers}
            title="64 KB Memory & Stack Grid"
            description="Inspect and modify all 65,536 bytes of RAM and ROM in real time. Watch stack pointer frames grow and shrink visually."
            badge="FULL RAM GRID"
          />
          <TiltCard
            icon={ShieldCheck}
            title="100% Client-Side Private"
            description="Your assembly code and debugging sessions run entirely in your local browser sandbox for zero latency and absolute privacy."
            badge="ZERO LATENCY"
          />
        </div>
      </section>

      {/* ─── FOOTER & LAUNCH CALL TO ACTION ─── */}
      <footer className="border-t border-white/10 bg-[#070b10] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-black font-extrabold">
              85
            </div>
            <div>
              <div className="text-sm font-bold text-white">MP8085 // HUMAN-AI STUDIO</div>
              <div className="text-xs font-mono text-slate-500">
                © 2026 Advanced Microprocessor Laboratory. All rights reserved.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/simulator"
              onClick={() => hardwareAudio.playCapacitorCharge()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-mono font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_35px_rgba(0,240,255,0.6)] transition-all"
            >
              ⚡ LAUNCH SIMULATOR NOW
            </Link>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        mode={authMode}
        setMode={setAuthMode}
      />
    </div>
  )
}


"use client"

import { useRef } from "react"
import { useScroll, useTransform, motion } from "framer-motion"
import Link from "next/link"
import { SlicedText } from "../ui/sliced-text"
import dynamic from "next/dynamic"
import type { TimelineItem } from "../ui/radial-orbital-timeline"
const RadialOrbitalTimeline = dynamic(() => import("../ui/radial-orbital-timeline"), { ssr: false, loading: () => null })
import { Calendar, FileText, Code, User, Clock, Cpu, Sparkles, Terminal, ShieldAlert, Layers } from "lucide-react"

// Common animation variants
const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
}

// ─── SECTION 1: CINEMATIC INTRO ─────────────────────────────────────────────
export function SectionCinematicIntro() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  
  const yParallax = useTransform(scrollYProgress, [0, 1], [-20, 20])
  const opacityParallax = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])

  return (
    <div ref={ref} id="overview" className="w-full bg-transparent text-[#EAEAEA] min-h-[80vh] flex flex-col items-center justify-center relative py-20">
      {/* Top Bar Header */}
      <div className="absolute top-6 w-full px-12 flex justify-between items-start text-xs font-mono uppercase tracking-widest hidden md:flex">
        <div className="w-1/4">
          <p className="font-bold text-amber-400 mb-1">INTEL 8085 SIMULATOR</p>
          <p className="text-slate-400">Understand Every Cycle</p>
        </div>
        <div className="w-1/4 text-center">
          <p className="font-bold text-cyan-400">Educational Platform</p>
        </div>
        <div className="w-1/4 flex justify-center">
          <div className="border border-white/10 rounded-full px-6 py-1 flex gap-4 bg-[#090b10]/60 backdrop-blur-md">
            <Link href="/" className="font-bold text-amber-400 hover:text-white transition-colors">HOME</Link>
            <Link href="/simulator" className="opacity-70 hover:opacity-100 hover:text-cyan-400 transition-all">STUDIO</Link>
            <Link href="/documentation" className="opacity-70 hover:opacity-100 hover:text-amber-400 transition-all">DOCS</Link>
          </div>
        </div>
        <div className="w-1/4 text-right">
          <p className="font-bold text-cyan-400">WebAssembly Engine</p>
        </div>
      </div>

      <motion.div 
        style={{ y: yParallax, opacity: opacityParallax }}
        variants={slideInLeft}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full flex flex-col items-center justify-center z-10 mt-12 md:mt-0"
      >
        <div className="text-[13vw] leading-none font-bold tracking-tighter uppercase font-space select-none text-amber-400/95">
          <SlicedText text="SIMULATE" />
        </div>
        
        <div className="mt-10 text-center flex flex-col items-center px-4">
          <h3 className="text-2xl md:text-4xl font-bold tracking-widest mb-6 font-space text-amber-400 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-amber-400" />
            8085 MICROPROCESSOR STUDIO
          </h3>
          
          <div className="text-xs font-mono uppercase tracking-widest mb-8 opacity-80 flex gap-6 text-amber-300">
            <span>© MP8085 2026</span>
            <span>INTEL 8085 ARCHITECTURE</span>
            <Link href="/documentation" className="underline underline-offset-4 font-bold text-white hover:text-amber-400 transition-colors">DOCUMENTATION</Link>
          </div>

          <p className="max-w-3xl text-sm md:text-base text-center leading-[1.8] font-sans font-medium tracking-wider px-6 text-slate-300">
            A HIGH-PRECISION 8085 MICROPROCESSOR EMULATION PLATFORM FEATURING REAL-TIME REGISTER MUTATIONS, STEP DEBUGGING, AND HARDWARE MACHINE CYCLE VISUALIZATION.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── SECTION 2: CLEAN TEXT WALL ─────────────────────────────────────────────
export function SectionCinematicTextWall() {
  return (
    <div id="debugger" className="w-full bg-transparent text-[#EAEAEA] min-h-[90vh] flex flex-col items-center justify-center relative py-20">
      <motion.div 
        variants={slideInRight}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col items-center justify-center text-center w-full px-6 z-10 max-w-6xl mx-auto"
      >
        <div className="text-xs font-mono tracking-widest font-bold mb-10 border border-amber-500/30 text-amber-400 rounded-full px-6 py-2 uppercase shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-500/10">
          [01-ARCHITECTURE REVOLUTION]
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[4vw] leading-[1.15] font-extrabold tracking-tight font-space uppercase text-balance text-white">
          WE BRING THE 8085 TO THE <br />
          MODERN WEB SO <span className="text-amber-400 mx-2 inline-block">EVERYONE</span> CAN <br />
          UNDERSTAND EVERY CYCLE <br />
          AND WRITE ASSEMBLY WITH CONFIDENCE
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs uppercase tracking-widest font-bold text-amber-300 pt-8 border-t border-white/10 w-full max-w-3xl">
          <div className="text-left leading-relaxed bg-[#0f131c]/60 p-6 rounded-2xl border border-white/5">
            <span className="text-white block mb-2 text-sm">▶ EXECUTION ENGINE</span>
            <ul className="space-y-1.5 text-slate-300 font-normal">
              <li>• Full 74-Opcode 8085 Instruction Set</li>
              <li>• Visual Step-by-Step Debugger</li>
              <li>• Live Memory Grid & Register Pair Map</li>
            </ul>
          </div>
          <div className="text-left leading-relaxed bg-[#0f131c]/60 p-6 rounded-2xl border border-white/5">
            <span className="text-white block mb-2 text-sm">▶ PERIPHERALS</span>
            <ul className="space-y-1.5 text-slate-300 font-normal">
              <li>• Interactive 8-bit Assembly Code Editor</li>
              <li>• Direct Hex Opcode Inspection</li>
              <li>• Hardware I/O Ports & Interrupt Controller</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── SECTION 3: REFINED 2x2 AI FEATURES GRID ──────────────────────────────
export function SectionAIFeatures() {
  return (
    <div id="ai-features" className="w-full bg-[#090b10] text-white py-28 px-4 md:px-12 relative border-y border-white/5">
      
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center z-10 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono tracking-widest uppercase mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Intelligent Assembly Assistance
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-3xl md:text-5xl font-space font-bold uppercase tracking-tight text-white mb-4"
        >
          Built-in 8085 Intelligence
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-sm md:text-base text-slate-400 font-sans max-w-2xl leading-relaxed"
        >
          Accelerate your microprocessors coursework with opcode synthesis, cycle-by-cycle register explanations, and instant loop detection.
        </motion.p>
      </div>

      {/* Modern 2x2 Grid Layout (Clean, non-sticky, zero overlap) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Feature 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#0f131c] border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover:border-amber-500/40 transition-all group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-space font-bold text-white mb-3">Natural Language Assembly Generator</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Type desired logic in English (e.g. "Add contents of HL to BC and store at 2000H") to generate clean 8085 assembly instructions.
            </p>
          </div>
          <div className="bg-[#090b10] border border-white/10 p-4 rounded-xl font-mono text-xs text-slate-300">
            <div className="text-slate-500 mb-2">// Prompt: "BCD Addition of two numbers"</div>
            <div className="text-amber-300 font-bold space-y-1">
              <div><span className="text-cyan-400">MVI</span> A, 45H</div>
              <div><span className="text-cyan-400">ADI</span> 38H</div>
              <div><span className="text-cyan-400">DAA</span></div>
            </div>
          </div>
        </motion.div>

        {/* Feature 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#0f131c] border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-space font-bold text-white mb-3">Real-time Cycle & Flag Explainer</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Step through assembly code with live explanations of T-states, bus signals, and flag bit mutations (S, Z, AC, P, CY).
            </p>
          </div>
          <div className="bg-[#090b10] border border-white/10 p-4 rounded-xl font-mono text-xs text-slate-300">
            <div className="text-slate-500 mb-2">// Flag Insight:</div>
            <div className="text-cyan-300 leading-relaxed">
              <span className="text-amber-400 font-bold">Carry [CY]</span> set due to 8-bit overflow (0xFF + 0x01). Accumulator resets to <span className="text-white">0x00</span>.
            </div>
          </div>
        </motion.div>

        {/* Feature 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#0f131c] border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover:border-amber-500/40 transition-all group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-space font-bold text-white mb-3">Smart Bug & Loop Fixer</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Detects missing `RET` statements, uninitialized stack pointers, and infinite `JMP` recursion before execution stalls.
            </p>
          </div>
          <div className="bg-[#090b10] border border-white/10 p-4 rounded-xl font-mono text-xs text-slate-300">
            <div className="text-slate-500 mb-2">// AI Warning [Line 14]:</div>
            <div className="text-red-400 leading-relaxed">
              <span className="font-bold">Notice:</span> JNZ LOOP creates infinite recursion because D register is never decremented (`DCR D` missing).
            </div>
          </div>
        </motion.div>

        {/* Feature 4 */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#0f131c] border border-white/10 p-8 rounded-2xl flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-space font-bold text-white mb-3">Opcode T-State Optimizer</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Optimizes machine cycles by recommending faster opcodes (e.g. replacing `MVI A, 00H` (7 T-states) with `XRA A` (4 T-states)).
            </p>
          </div>
          <div className="bg-[#090b10] border border-white/10 p-4 rounded-xl font-mono text-xs text-slate-300">
            <div className="text-slate-500 mb-2">// Optimization Tip:</div>
            <div className="text-emerald-400 leading-relaxed">
              Replaced <span className="line-through opacity-70">MVI A, 00H</span> (7 T) with <span className="font-bold text-white">XRA A</span> (4 T). Saves 42% execution cycles!
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

// ─── SECTION 4: THE STUDIO SHOWCASE ──────────────────────────────────────
export function SectionCinematicStudio() {
  return (
    <div className="w-full bg-transparent text-[#EAEAEA] min-h-[85vh] flex flex-col md:flex-row items-center relative overflow-hidden py-24">
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:pl-16 h-full z-10 py-12 md:py-0">
        <motion.div 
          initial={{ x: -40, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h2 className="text-[18vw] md:text-[14vw] leading-none font-bold tracking-tighter font-syne opacity-15 mb-4 text-amber-400">
            8085
          </h2>
          <div className="mt-[-5vw] md:mt-[-3vw] max-w-md space-y-6 text-sm font-sans tracking-wide leading-relaxed relative z-20 md:ml-6 text-[#EAEAEA]">
            <p className="font-bold text-base md:text-lg leading-[1.8] text-white">
              Zero-lag WebAssembly architecture emulation tailored for microprocessors instruction understanding.
            </p>
            <p className="opacity-90 text-xs leading-[1.8] font-mono text-amber-300">
              Inspect register pairs (BC, DE, HL), track stack pointer pushes/pops, and test I/O devices with microsecond timing fidelity.
            </p>
          </div>
        </motion.div>
      </div>
      
      <div className="w-full md:w-1/2 h-[55vh] md:h-[70vh] flex items-center justify-center p-6 md:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="w-full h-full bg-[#0f131c] text-white rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col border border-amber-500/30"
        >
          {/* Studio Header */}
          <div className="h-12 border-b border-white/10 flex items-center justify-between px-6 bg-white/5 shrink-0">
             <div className="text-xs font-mono text-amber-300 font-bold uppercase tracking-widest flex items-center gap-2">
               <Terminal className="w-4 h-4 text-cyan-400" />
               MP8085 STUDIO SESSION
             </div>
             <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">READY</span>
          </div>

          <div className="flex-1 flex flex-col md:flex-row bg-[#090b10]">
             <div className="w-full md:w-1/2 border-r border-white/10 p-6 flex flex-col justify-center gap-3 font-mono text-sm">
                <div className="text-slate-400 opacity-60">2000H: MVI A, 42H</div>
                <div className="text-slate-400 opacity-60">2002H: MVI B, 15H</div>
                <div className="text-cyan-300 font-bold bg-cyan-500/10 p-3 rounded-lg border-l-4 border-cyan-400 flex justify-between items-center">
                  <span>2004H: ADD B</span>
                  <span className="text-[10px] bg-cyan-400 text-black px-1.5 py-0.5 rounded font-sans">PC &rarr; 2005H</span>
                </div>
                <div className="text-slate-500 opacity-40">2005H: STA 3000H</div>
             </div>

             <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center bg-[#0f131c] relative">
                <div className="text-[4rem] lg:text-[6rem] font-space font-extrabold text-white leading-none">
                  57
                </div>
                <div className="text-xs font-mono uppercase tracking-widest text-amber-300 mt-4 border border-amber-500/30 rounded-full px-4 py-1.5 bg-amber-500/10">
                  ACCUMULATOR [A]
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── SECTION 5: FEATURES CAPABILITIES ─────────────────────────────────────
export function SectionCinematicFeatures() {
  return (
    <div className="w-full bg-transparent text-white min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden py-24">
      <motion.div 
        variants={slideInLeft}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-col items-center text-center z-10 w-full px-4 max-w-5xl mx-auto"
      >
        <div className="flex flex-col items-center font-space font-bold tracking-tighter uppercase leading-[0.9] text-[8vw] md:text-[6.5vw]">
          <SlicedText text="EXECUTE" />
          <span className="text-cyan-400">DEBUG-STEP</span>
          <span className="flex items-center gap-6">
            MEMORY-MAP 
          </span>
          <SlicedText text="REGISTERS" />
          <span className="text-amber-400">INTERRUPTS</span>
          <span>I/O PORTS</span>
        </div>
        
        <div className="text-xs font-mono tracking-widest mt-12 border border-amber-500/30 rounded-full px-6 py-2 text-amber-300 bg-amber-500/10">
          [FULL HARDWARE EMULATION ENGINE]
        </div>
      </motion.div>
    </div>
  )
}

// ─── SECTION 6: SHOWCASE CARD ─────────────────────────────────────────────
export function SectionCinematicShowcase() {
  return (
    <div id="features" className="w-full bg-transparent text-[#EAEAEA] min-h-[85vh] flex items-center justify-center relative py-20">
      <div className="w-full px-6 md:px-12 flex flex-col md:flex-row items-center justify-between z-10 h-full max-w-6xl mx-auto">
        
        <div className="md:w-1/4 text-xs font-mono uppercase tracking-widest font-bold mb-8 md:mb-0 text-center md:text-left flex items-center text-amber-400">
          FEATURED PLATFORM
        </div>
        
        <motion.div 
          variants={slideInRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="md:w-2/4 w-full flex flex-col items-center"
        >
          <div className="w-full aspect-[4/3] bg-[#0f131c] relative overflow-hidden flex items-center justify-center group shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-amber-500/30 rounded-2xl">
            <div className="absolute top-6 right-6 text-[10px] font-mono tracking-widest flex flex-col items-end text-amber-400">
               <span>INTEL 8085</span>
               <span>ARCHITECTURE</span>
            </div>
            
            <div className="text-center z-10 px-6">
               <div className="text-4xl md:text-5xl font-space font-bold mb-3 tracking-tight text-white">
                 8085 CORE STUDIO
               </div>
               <div className="text-xs font-mono tracking-widest opacity-80 uppercase border-t border-white/20 pt-3 inline-block text-amber-300">
                 Microprocessor Platform
               </div>
            </div>
          </div>
        </motion.div>
        
        <div className="md:w-1/4 text-xs font-mono uppercase tracking-widest font-bold text-right hidden md:flex h-full items-center justify-end text-amber-400">
          ASSEMBLY—STUDIO
        </div>

      </div>
    </div>
  )
}

// ─── SECTION 7: ORBITAL TIMELINE ───────────────────────────────────────────
const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: "Core Emulation Engine",
    date: "Phase 1",
    content: "8085 ALU & Register Pair implementation in WebAssembly.",
    category: "Planning",
    icon: Calendar,
    relatedIds: [2],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Visual Debugger UI",
    date: "Phase 2",
    content: "Hex Editor, Memory Map & Interrupt Display.",
    category: "Design",
    icon: FileText,
    relatedIds: [1, 3],
    status: "completed",
    energy: 90,
  },
  {
    id: 3,
    title: "AI Code Assistant",
    date: "Phase 3",
    content: "Natural language opcode synthesis & T-state analysis.",
    category: "Development",
    icon: Code,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 85,
  },
  {
    id: 4,
    title: "3D Hardware Simulator",
    date: "Phase 4",
    content: "Interactive 3D IC Chip Pin Explorer & ALU Arcade.",
    category: "Testing",
    icon: User,
    relatedIds: [3, 5],
    status: "completed",
    energy: 95,
  },
  {
    id: 5,
    title: "Cloud Classroom",
    date: "Phase 5",
    content: "Collaborative Assembly Code Debugging & Assignments.",
    category: "Release",
    icon: Clock,
    relatedIds: [4],
    status: "in-progress",
    energy: 70,
  },
];

export function SectionOrbitalTimeline() {
  return (
    <div className="w-full min-h-[90vh] bg-transparent text-white py-24 flex flex-col items-center overflow-hidden">
      <motion.div 
        variants={slideInLeft}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="w-full max-w-5xl px-6 mb-8 text-center"
      >
        <div className="text-4xl md:text-6xl font-syne font-bold uppercase tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
          <SlicedText text="ROADMAP" />
        </div>
        <p className="text-xs font-mono tracking-widest text-slate-400 uppercase mt-2">
          Evolution of the 8085 Microprocessor Platform
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="w-full h-full min-h-[680px]"
      >
        <RadialOrbitalTimeline timelineData={timelineData} />
      </motion.div>
    </div>
  )
}

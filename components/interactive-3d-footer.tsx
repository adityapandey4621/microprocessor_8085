"use client"

import React, { useRef, useState, useEffect, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Float, Sparkles, MeshWobbleMaterial } from "@react-three/drei"
import * as THREE from "three"
import Link from "next/link"
import { Cpu, Zap, Play, RotateCcw, Trophy, CheckCircle2, Sparkles as SparklesIcon, Github, Mail, BookOpen } from "lucide-react"

// ─── 3D INTEL 8085 DIP-40 MICROCHIP MODEL ──────────────────────────────────
function Chip3DModel({ 
  activePin, 
  onPinClick, 
  aluResult 
}: { 
  activePin: string | null
  onPinClick: (pinName: string) => void 
  aluResult: number 
}) {
  const chipRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (chipRef.current) {
      // Gentle floating animation
      chipRef.current.rotation.y = state.clock.getElapsedTime() * 0.25
    }
  })

  // 40 DIP Pins layout
  const pins = useMemo(() => {
    const list: { name: string; pos: [number, number, number] }[] = []
    const pinNamesLeft = [
      "X1", "X2", "RESET OUT", "SOD", "SID", "TRAP", "RST 7.5", "RST 6.5",
      "RST 5.5", "INTR", "INTA", "AD0", "AD1", "AD2", "AD3", "AD4",
      "AD5", "AD6", "AD7", "VSS"
    ]
    const pinNamesRight = [
      "VCC", "HOLD", "HLDA", "CLK(OUT)", "RESET IN", "READY", "IO/M", "S1",
      "RD", "WR", "ALE", "S0", "A15", "A14", "A13", "A12",
      "A11", "A10", "A9", "A8"
    ]

    // Left side pins
    for (let i = 0; i < 20; i++) {
      list.push({
        name: pinNamesLeft[i],
        pos: [-1.45, 0, -2.4 + i * 0.25]
      })
    }
    // Right side pins
    for (let i = 0; i < 20; i++) {
      list.push({
        name: pinNamesRight[i],
        pos: [1.45, 0, 2.35 - i * 0.25]
      })
    }
    return list
  }, [])

  return (
    <group ref={chipRef}>
      {/* IC Ceramic Main Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 0.4, 5.2]} />
        <meshStandardMaterial 
          color="#121319" 
          roughness={0.2} 
          metalness={0.8}
        />
      </mesh>

      {/* Gold Center Die / Logo Inset */}
      <mesh position={[0, 0.21, 0]}>
        <boxGeometry args={[2.0, 0.02, 4.4]} />
        <meshStandardMaterial 
          color="#1a1812" 
          roughness={0.3} 
          metalness={0.9} 
        />
      </mesh>

      {/* 8085 Gold Text Label on IC */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
        <group position={[0, 0.23, 0]}>
          <Text
            position={[0, 0, -0.8]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.45}
            color="#E6B85C"
            anchorX="center"
            anchorY="middle"
          >
            INTEL 8085A
          </Text>
          <Text
            position={[0, 0, 0.2]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.22}
            color="#00D4FF"
            anchorX="center"
            anchorY="middle"
          >
            ALU OUT: 0x{aluResult.toString(16).toUpperCase().padStart(2, "0")}
          </Text>
          <Text
            position={[0, 0, 1.0]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.16}
            color="#8899ac"
            anchorX="center"
            anchorY="middle"
          >
            8-BIT MICROPROCESSOR
          </Text>
        </group>
      </Float>

      {/* Metallic Pins */}
      {pins.map((pin) => {
        const isActive = activePin === pin.name
        return (
          <group 
            key={pin.name} 
            position={pin.pos}
            onClick={(e) => {
              e.stopPropagation()
              onPinClick(pin.name)
            }}
          >
            <mesh position={[0, -0.15, 0]}>
              <boxGeometry args={[0.25, 0.35, 0.12]} />
              <meshStandardMaterial 
                color={isActive ? "#00D4FF" : "#cbd5e1"} 
                metalness={0.95} 
                roughness={0.1} 
                emissive={isActive ? "#00D4FF" : "#000000"}
                emissiveIntensity={isActive ? 2 : 0}
              />
            </mesh>
          </group>
        )
      })}

      {/* PCB Motherboard Traces around the chip */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[6, 0.1, 8]} />
        <meshStandardMaterial color="#071318" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  )
}

// ─── MAIN INTERACTIVE 3D FOOTER ────────────────────────────────────────────
export default function Interactive3DFooter() {
  const [activePin, setActivePin] = useState<string | null>("ALE")
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const footerRef = useRef<HTMLElement>(null)
  
  // Intersection Observer to pause Three.js rendering when off-screen
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    if (footerRef.current) observer.observe(footerRef.current)
    return () => observer.disconnect()
  }, [])
  
  // 8-bit Binary ALU Game State
  const [regA, setRegA] = useState<number>(0x42) // 01000010
  const [regB, setRegB] = useState<number>(0x15) // 00010101
  const [op, setOp] = useState<"ADD" | "SUB" | "AND" | "OR" | "XOR">("ADD")
  const [score, setScore] = useState<number>(0)
  const [targetAnswer, setTargetAnswer] = useState<{ target: number; desc: string }>({
    target: 0x57,
    desc: "Calculate 0x42 + 0x15 = 0x57"
  })
  const [solved, setSolved] = useState<boolean>(false)

  // Compute ALU Result
  const aluResult = useMemo(() => {
    let res = 0
    if (op === "ADD") res = (regA + regB) & 0xff
    else if (op === "SUB") res = (regA - regB + 256) & 0xff
    else if (op === "AND") res = (regA & regB) & 0xff
    else if (op === "OR") res = (regA | regB) & 0xff
    else if (op === "XOR") res = (regA ^ regB) & 0xff
    return res
  }, [regA, regB, op])

  // Flags calculation
  const flags = useMemo(() => {
    const res = aluResult
    const S = (res & 0x80) !== 0 ? 1 : 0
    const Z = res === 0 ? 1 : 0
    const P = res.toString(2).split("1").length % 2 === 0 ? 1 : 0
    const CY = op === "ADD" && (regA + regB > 0xff) ? 1 : 0
    return { S, Z, P, CY }
  }, [aluResult, regA, regB, op])

  // Check game victory
  const checkAnswer = () => {
    if (aluResult === targetAnswer.target) {
      setSolved(true)
      setScore((prev) => prev + 100)
    }
  }

  const nextChallenge = () => {
    const challenges = [
      { target: 0x57, desc: "Calculate 0x42 + 0x15 (ADD)" },
      { target: 0x2D, desc: "Calculate 0x42 - 0x15 (SUB)" },
      { target: 0x00, desc: "Calculate 0xAA AND 0x55 (AND)" },
      { target: 0xFF, desc: "Calculate 0xAA OR 0x55 (OR)" },
      { target: 0x0F, desc: "Calculate 0xF0 XOR 0xFF (XOR)" },
    ]
    const next = challenges[Math.floor(Math.random() * challenges.length)]
    setTargetAnswer(next)
    setSolved(false)
  }

  const toggleBitA = (bitIndex: number) => {
    setRegA((prev) => prev ^ (1 << bitIndex))
  }

  const toggleBitB = (bitIndex: number) => {
    setRegB((prev) => prev ^ (1 << bitIndex))
  }

  return (
    <footer ref={footerRef} className="w-full bg-[#030308] text-white py-16 px-4 md:px-12 relative border-t border-amber-500/20 overflow-hidden z-20">
      
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] via-cyan-500/[0.02] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col items-center gap-12 relative z-10">
        
        {/* Footer Top Header */}
        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(200,155,60,0.2)]">
            <SparklesIcon className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            3D Interactive Microprocessor Playground
          </div>
          <h2 className="text-3xl md:text-5xl font-space font-bold uppercase tracking-tight text-chrome-liquid mb-4">
            Master 8085 Architecture In 3D
          </h2>
          <p className="text-sm text-slate-400 font-sans leading-relaxed">
            Drag to rotate the Intel 8085 processor, inspect pins, and test the real 8-bit Arithmetic Logic Unit (ALU) interactive arcade.
          </p>
        </div>

        {/* 3D Canvas & Interactive Arcade Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: 3D Interactive Canvas */}
          <div className="lg:col-span-7 h-[420px] bg-[#080910] rounded-2xl border border-white/10 relative overflow-hidden shadow-2xl group">
            {/* Canvas overlay instructions */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-mono text-cyan-300 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>3D Orbit Controls: Drag / Scroll to inspect</span>
            </div>

            {/* Active Pin Info Overlay */}
            {activePin && (
              <div className="absolute bottom-4 left-4 z-10 bg-amber-500/10 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300">
                Active Signal Pin: <span className="font-bold text-white">{activePin}</span>
              </div>
            )}

            <Canvas camera={{ position: [3, 4, 5], fov: 50 }} frameloop={isVisible ? "always" : "never"}>
              <React.Suspense fallback={null}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#E6B85C" />
                <pointLight position={[-10, -10, -5]} intensity={0.8} color="#00D4FF" />
                <Sparkles count={50} scale={10} size={2} speed={0.4} color="#00D4FF" />
                
                <Chip3DModel 
                  activePin={activePin} 
                  onPinClick={(pin) => setActivePin(pin)} 
                  aluResult={aluResult} 
                />
                
                <OrbitControls 
                  enableZoom={true} 
                  maxPolarAngle={Math.PI / 2.1} 
                  minDistance={3} 
                  maxDistance={9} 
                />
              </React.Suspense>
            </Canvas>
          </div>

          {/* Right Column: 8-bit Binary ALU Mini Arcade */}
          <div className="lg:col-span-5 bg-[#0a0c16] rounded-2xl border border-white/10 p-6 flex flex-col gap-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="font-space font-bold text-lg text-white">8-Bit ALU Arcade</h3>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-mono text-amber-300">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Score: {score}</span>
              </div>
            </div>

            {/* Current Target Challenge */}
            <div className="bg-white/[0.03] border border-white/10 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase">Active ALU Challenge</span>
                <span className="text-amber-300 font-bold">{targetAnswer.desc}</span>
              </div>
              <button 
                onClick={nextChallenge}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Shuffle Challenge"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Bit Switches Register A */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Register A (8-Bit): <strong className="text-cyan-400">0x{regA.toString(16).toUpperCase().padStart(2, "0")}</strong></span>
                <span>Bit 7 &rarr; Bit 0</span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                  const isOn = (regA & (1 << bit)) !== 0
                  return (
                    <button
                      key={bit}
                      onClick={() => toggleBitA(bit)}
                      className={`h-9 rounded-lg font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                        isOn 
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,212,255,0.4)]" 
                          : "bg-white/5 border-white/10 text-slate-500 hover:border-white/30"
                      }`}
                    >
                      <span>{isOn ? "1" : "0"}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ALU Operation Selector */}
            <div className="flex items-center gap-2 justify-between bg-white/[0.02] p-2 rounded-xl border border-white/10">
              {(["ADD", "SUB", "AND", "OR", "XOR"] as const).map((operation) => (
                <button
                  key={operation}
                  onClick={() => setOp(operation)}
                  className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                    op === operation
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-[0_0_15px_rgba(230,184,92,0.4)] scale-105"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {operation}
                </button>
              ))}
            </div>

            {/* Bit Switches Register B */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Register B (8-Bit): <strong className="text-purple-400">0x{regB.toString(16).toUpperCase().padStart(2, "0")}</strong></span>
                <span>Bit 7 &rarr; Bit 0</span>
              </div>
              <div className="grid grid-cols-8 gap-1.5">
                {[7, 6, 5, 4, 3, 2, 1, 0].map((bit) => {
                  const isOn = (regB & (1 << bit)) !== 0
                  return (
                    <button
                      key={bit}
                      onClick={() => toggleBitB(bit)}
                      className={`h-9 rounded-lg font-mono text-xs font-bold transition-all flex flex-col items-center justify-center border ${
                        isOn 
                          ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(166,108,255,0.4)]" 
                          : "bg-white/5 border-white/10 text-slate-500 hover:border-white/30"
                      }`}
                    >
                      <span>{isOn ? "1" : "0"}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Output Display & Flags */}
            <div className="bg-black/60 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-slate-400">Accumulator Output</span>
                <span className="text-2xl font-space font-bold text-amber-400">
                  0x{aluResult.toString(16).toUpperCase().padStart(2, "0")} 
                  <span className="text-xs font-mono text-slate-400 font-normal ml-2">({aluResult})</span>
                </span>
              </div>
              
              {/* Flag indicators */}
              <div className="flex gap-2 text-[10px] font-mono">
                <span className={`px-2 py-1 rounded border ${flags.S ? "bg-red-500/20 border-red-500 text-red-400" : "bg-white/5 border-white/10 text-slate-600"}`}>S:{flags.S}</span>
                <span className={`px-2 py-1 rounded border ${flags.Z ? "bg-green-500/20 border-green-500 text-green-400" : "bg-white/5 border-white/10 text-slate-600"}`}>Z:{flags.Z}</span>
                <span className={`px-2 py-1 rounded border ${flags.P ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-white/5 border-white/10 text-slate-600"}`}>P:{flags.P}</span>
                <span className={`px-2 py-1 rounded border ${flags.CY ? "bg-yellow-500/20 border-yellow-500 text-yellow-400" : "bg-white/5 border-white/10 text-slate-600"}`}>CY:{flags.CY}</span>
              </div>
            </div>

            {/* Victory Submit button */}
            <button
              onClick={checkAnswer}
              className={`w-full py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                solved 
                  ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                  : "bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
              }`}
            >
              {solved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Challenge Solved! +100 Points
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-amber-300" />
                  Validate ALU Output
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Bottom Links & Info */}
        <div className="w-full border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="font-space font-bold text-white tracking-wider">8085 MICROPROCESSOR SIMULATOR</span>
            <span>© 2026</span>
          </div>

          <div className="flex gap-8">
            <Link href="#overview" className="hover:text-amber-400 transition-colors">Overview</Link>
            <Link href="/simulator" className="hover:text-cyan-400 transition-colors">Simulator</Link>
            <Link href="/documentation" className="hover:text-white transition-colors flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Documentation
            </Link>
            <a href="https://github.com/adityapandey4621/mp8085-compiler" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}

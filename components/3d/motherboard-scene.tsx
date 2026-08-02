"use client"

import React, { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  Text,
  PerspectiveCamera,
  ContactShadows
} from "@react-three/drei"
import * as THREE from "three"
import { hardwareAudio } from "@/components/audio-synth"

/* ─────────────────────────────────────────────────────────────────────────────
   1. REALISTIC MATERIALS & TOKENS
   ───────────────────────────────────────────────────────────────────────────── */
const PCB_MATTE_COLOR = new THREE.Color("#191E1A") // Matte olive-charcoal PCB
const COPPER_TRACE_COLOR = new THREE.Color("#B87D3B") // Oxidized copper
const COPPER_ACTIVE_COLOR = new THREE.Color("#FFB300") // Warm glowing current
const BRUSHED_ALUMINUM_COLOR = new THREE.Color("#3A3E45")
const GOLD_PIN_COLOR = new THREE.Color("#D4AF37")
const IC_PLASTIC_COLOR = new THREE.Color("#111315")

/* ─────────────────────────────────────────────────────────────────────────────
   2. LASER-ENGRAVED NAMEPLATE COMPONENT (0-5 seconds opening shot hero)
   ───────────────────────────────────────────────────────────────────────────── */
function LaserEngravedPlate({ isPowered }: { isPowered: boolean }) {
  return (
    <group position={[-2.8, 0.22, 1.8]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Brushed aluminum plate base */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[4.2, 2.1, 0.08]} />
        <meshStandardMaterial
          color={BRUSHED_ALUMINUM_COLOR}
          metalness={0.92}
          roughness={0.25}
        />
      </mesh>

      {/* 4 stainless steel hex bolt heads at corners */}
      {[
        [-1.9, -0.85],
        [1.9, -0.85],
        [-1.9, 0.85],
        [1.9, 0.85]
      ].map(([x, y], idx) => (
        <mesh key={idx} position={[x, y, 0.05]}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 6]} />
          <meshStandardMaterial color="#6B7280" metalness={0.95} roughness={0.2} />
        </mesh>
      ))}

      {/* Laser engraved typography (Using built-in font for zero-latency loading) */}
      <Text
        position={[-1.75, 0.35, 0.06]}
        fontSize={0.58}
        color="#0D1117"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.06}
      >
        MP8085
      </Text>

      <Text
        position={[-1.75, -0.32, 0.06]}
        fontSize={0.16}
        color="#374151"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.05}
      >
        Modern 8085 Microprocessor Simulator
      </Text>

      <Text
        position={[-1.75, -0.62, 0.06]}
        fontSize={0.09}
        color="#6B7280"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.12}
      >
        PRECISION HARDWARE SIMULATION ARCHITECTURE • INTEL 8085 CORE
      </Text>
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. COPPER TRACES WITH CURRENT PROPAGATION & AFTERGLOW
   ───────────────────────────────────────────────────────────────────────────── */
function CopperTraceGroup({ scrollProgress }: { scrollProgress: number }) {
  const traces = useMemo(() => {
    const list: { start: [number, number, number]; end: [number, number, number]; wakeProgress: number }[] = []
    // Main power & bus distribution traces across the PCB
    for (let i = 0; i < 28; i++) {
      const z = -4.5 + i * 0.35
      const wake = i / 28 // Progress threshold when current reaches this trace
      list.push({
        start: [-4.2, 0.12, z],
        end: [4.2, 0.12, z],
        wakeProgress: wake * 0.75 // Wakes between scroll 0.0 and 0.75
      })
    }
    return list
  }, [])

  return (
    <group>
      {traces.map((trace, idx) => {
        const isCurrentActive = scrollProgress >= trace.wakeProgress
        const glowIntensity = isCurrentActive
          ? Math.max(0.15, 1.2 - (scrollProgress - trace.wakeProgress) * 2.5)
          : 0

        return (
          <mesh
            key={idx}
            position={[0, trace.start[1], trace.start[2]]}
            rotation={[0, 0, 0]}
          >
            <boxGeometry args={[8.4, 0.015, 0.04]} />
            <meshStandardMaterial
              color={isCurrentActive ? COPPER_ACTIVE_COLOR : COPPER_TRACE_COLOR}
              metalness={0.85}
              roughness={isCurrentActive ? 0.2 : 0.45}
              emissive={isCurrentActive ? COPPER_ACTIVE_COLOR : new THREE.Color("#000000")}
              emissiveIntensity={glowIntensity}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. HARDWARE PHOSPHOR PROJECTIONS (REAL IC OSCILLOSCOPES)
   ───────────────────────────────────────────────────────────────────────────── */
function PhosphorProjection({
  position,
  title,
  sub,
  active,
  color = "#10B981"
}: {
  position: [number, number, number]
  title: string
  sub: string
  active: boolean
  color?: string
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && active) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2.5) * 0.03
    }
  })

  if (!active) return null

  return (
    <group ref={groupRef} position={position}>
      {/* Phosphor hologram beam line extending from IC leg */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1.2, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>

      {/* Phosphor data display screen */}
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[2.4, 1.1]} />
        <meshBasicMaterial
          color="#06120E"
          transparent
          opacity={0.82}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.44, 1.14]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      <Text
        position={[-1.08, 0.32, 0.02]}
        fontSize={0.13}
        color={color}
        anchorX="left"
      >
        {title}
      </Text>

      <Text
        position={[-1.08, 0.05, 0.02]}
        fontSize={0.095}
        color="#E5E7EB"
        anchorX="left"
        maxWidth={2.1}
      >
        {sub}
      </Text>

      <Text
        position={[-1.08, -0.32, 0.02]}
        fontSize={0.075}
        color={color}
        anchorX="left"
      >
        [ HARDWARE BUS STREAM ACTIVE • 60 FPS ]
      </Text>
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. PRECISION ROBOTIC ARM & INTEL 8085 SOCKET CLIMAX (Scroll 0.65 - 0.85)
   ───────────────────────────────────────────────────────────────────────────── */
function CpuSocketAndRoboticArm({ scrollProgress }: { scrollProgress: number }) {
  const armRef = useRef<THREE.Group>(null)
  const cpuRef = useRef<THREE.Group>(null)
  const leverRef = useRef<THREE.Group>(null)
  const [lockedSoundPlayed, setLockedSoundPlayed] = useState(false)

  // Calculate robotic arm descent & socket lock based on scroll
  // Arm descends between 0.62 and 0.76
  const armDescent = Math.min(1, Math.max(0, (scrollProgress - 0.62) / 0.14))
  // Lever locks between 0.77 and 0.82
  const leverLock = Math.min(1, Math.max(0, (scrollProgress - 0.77) / 0.05))

  useEffect(() => {
    if (leverLock >= 0.95 && !lockedSoundPlayed) {
      setLockedSoundPlayed(true)
      hardwareAudio.playSocketLockClick()
      hardwareAudio.playMotherboardBoot()
    } else if (leverLock < 0.2) {
      setLockedSoundPlayed(false)
    }
  }, [leverLock, lockedSoundPlayed])

  useFrame(() => {
    if (armRef.current && cpuRef.current) {
      // Y height: starts at 3.5m above socket, descends to 0.0m
      const yOffset = (1 - armDescent) * 3.2
      armRef.current.position.y = 0.55 + yOffset
      cpuRef.current.position.y = 0.28 + yOffset

      // Small mechanical vibration while lowering
      if (armDescent > 0.05 && armDescent < 0.95) {
        cpuRef.current.position.x = (Math.random() - 0.5) * 0.008
      } else {
        cpuRef.current.position.x = 0
      }
    }
    if (leverRef.current) {
      // Lever rotates from vertical (-PI/4) to horizontal locked (0)
      leverRef.current.rotation.z = -Math.PI / 4 * (1 - leverLock)
    }
  })

  return (
    <group position={[1.4, 0, -0.8]}>
      {/* 40-Pin DIP Socket Housing (Matte Green/Black Thermoplastic) */}
      <mesh position={[0, 0.18, 0]} receiveShadow castShadow>
        <boxGeometry args={[3.4, 0.22, 1.2]} />
        <meshStandardMaterial color="#0F1713" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* 40 Gold-plated pin sockets (20 per side) */}
      {Array.from({ length: 20 }).map((_, i) => {
        const xPos = -1.45 + i * 0.155
        return (
          <group key={i}>
            <mesh position={[xPos, 0.29, -0.42]}>
              <boxGeometry args={[0.05, 0.06, 0.06]} />
              <meshStandardMaterial color={GOLD_PIN_COLOR} metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[xPos, 0.29, 0.42]}>
              <boxGeometry args={[0.05, 0.06, 0.06]} />
              <meshStandardMaterial color={GOLD_PIN_COLOR} metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        )
      })}

      {/* Socket ZIF Clamp Lever */}
      <group ref={leverRef} position={[-1.75, 0.29, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
          <meshStandardMaterial color="#9CA3AF" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Silkscreen socket label on PCB */}
      <Text
        position={[-1.6, 0.11, 0.75]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.16}
        color="#E5E7EB"
      >
        U1 • INTEL 8085 CPU CORE (40-PIN DIP)
      </Text>

      {/* INTEL 8085 PROCESSOR PACKAGE (Lowered by robotic arm) */}
      <group ref={cpuRef} position={[0, 0.28, 0]}>
        {/* Main Ceramic Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.1, 0.18, 0.96]} />
          <meshStandardMaterial color="#1E222A" roughness={0.4} metalness={0.2} />
        </mesh>

        {/* Gold Square Die Cavity Cap */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.1, 0.04, 0.65]} />
          <meshStandardMaterial
            color="#D4AF37"
            metalness={0.95}
            roughness={0.2}
            emissive={leverLock > 0.8 ? new THREE.Color("#FF8F00") : new THREE.Color("#000000")}
            emissiveIntensity={leverLock > 0.8 ? 0.35 : 0}
          />
        </mesh>

        {/* Engraved Intel 8085 Logo on Ceramic */}
        <Text
          position={[-0.9, 0.11, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.19}
          color="#D1D5DB"
        >
          i8085AH
        </Text>

        {/* 40 Gold CPU Legs */}
        {Array.from({ length: 20 }).map((_, i) => {
          const xPos = -1.45 + i * 0.155
          return (
            <group key={i}>
              <mesh position={[xPos, -0.09, -0.42]}>
                <boxGeometry args={[0.04, 0.18, 0.04]} />
                <meshStandardMaterial color={GOLD_PIN_COLOR} metalness={0.95} roughness={0.15} />
              </mesh>
              <mesh position={[xPos, -0.09, 0.42]}>
                <boxGeometry args={[0.04, 0.18, 0.04]} />
                <meshStandardMaterial color={GOLD_PIN_COLOR} metalness={0.95} roughness={0.15} />
              </mesh>
            </group>
          )
        })}
      </group>

      {/* PRECISION ROBOTIC PICK-AND-PLACE ARM (Disappears once clamped) */}
      {leverLock < 0.98 && (
        <group ref={armRef} position={[0, 2.5, 0]}>
          {/* Vertical Stepper Piston */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 2.4, 16]} />
            <meshStandardMaterial color={BRUSHED_ALUMINUM_COLOR} metalness={0.9} roughness={0.25} />
          </mesh>

          {/* Pneumatic Suction Cup Gripper */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.35, 0.22, 0.18, 16]} />
            <meshStandardMaterial color="#262626" roughness={0.7} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. DOCUMENTARY CAMERA RIG (Must live inside Canvas for R3F useFrame)
   ───────────────────────────────────────────────────────────────────────────── */
function MotherboardCameraRig({ scrollProgress }: { scrollProgress: number }) {
  useFrame(({ camera }) => {
    // Scroll progress 0.0: Macro close-up on laser engraved plate & power switch
    // 0.25: Slide across traces toward Quartz Oscillator & RAM IC
    // 0.50: Glide over Debug & ALU Controller
    // 0.75: Framing the CPU socket as the robotic arm descends
    // 1.00: High-angle isometric wide view of the powered motherboard
    const t = scrollProgress

    let targetPos = new THREE.Vector3()
    let targetLookAt = new THREE.Vector3()

    if (t < 0.2) {
      // Opening Shot: Extremely close to laser engraved metal plate & power switch
      const subT = t / 0.2
      targetPos.set(-2.8 + subT * 0.5, 1.8 + subT * 0.4, 3.2 - subT * 0.4)
      targetLookAt.set(-2.8, 0.1, 1.6)
    } else if (t < 0.5) {
      // Traveling along copper traces to RAM IC & Oscillator
      const subT = (t - 0.2) / 0.3
      targetPos.set(-1.8 + subT * 2.2, 2.3 + subT * 0.6, 2.6 - subT * 1.2)
      targetLookAt.set(-0.5 + subT * 1.5, 0.2, 0.5 - subT * 0.8)
    } else if (t < 0.8) {
      // Midpoint: CPU Socket & Robotic Arm lowering the 8085 processor
      const subT = (t - 0.5) / 0.3
      targetPos.set(1.4, 3.2 - subT * 0.5, 1.8 + subT * 0.6)
      targetLookAt.set(1.4, 0.4, -0.8)
    } else {
      // Ending: High-angle full motherboard reveal
      const subT = (t - 0.8) / 0.2
      targetPos.set(0.5 + subT * 0.2, 5.8 + subT * 2.5, 4.2 + subT * 3.5)
      targetLookAt.set(0, 0.1, 0)
    }

    camera.position.lerp(targetPos, 0.08)
    const currentLook = new THREE.Vector3()
    camera.getWorldDirection(currentLook)
    const desiredLook = targetLookAt.clone().sub(camera.position).normalize()
    currentLook.lerp(desiredLook, 0.08)
    camera.lookAt(
      camera.position.clone().add(currentLook)
    )
  })

  return null
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. THE COMPLETE PHYSICAL MOTHERBOARD SCENE
   ───────────────────────────────────────────────────────────────────────────── */
export function Motherboard3DScene({
  scrollProgress,
  isPowered,
  onTogglePower
}: {
  scrollProgress: number
  isPowered: boolean
  onTogglePower: () => void
}) {
  return (
    <div className="fixed inset-0 z-0 bg-[#0A0D10] select-none pointer-events-auto">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }} camera={{ position: [-2.8, 1.8, 3.2], fov: 36 }}>
        <MotherboardCameraRig scrollProgress={scrollProgress} />
        <color attach="background" args={["#0D1115"]} />
        <fog attach="fog" args={["#0D1115", 7, 24]} />

        {/* Subtle Industrial Workshop Lighting */}
        <ambientLight intensity={isPowered ? 0.45 : 0.12} />
        <directionalLight
          position={[6, 9, 5]}
          intensity={isPowered ? 1.4 : 0.3}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        <pointLight position={[-4, 3, 2]} intensity={0.4} color="#FF9F43" />

        {/* ─── PHYSICAL MOTHERBOARD & PRECISION ALUMINUM TABLE ─── */}
        <group position={[0, 0, 0]}>
          {/* Machined Aluminum Laboratory Bench Surface below motherboard */}
          <mesh position={[0, -0.22, 0]} receiveShadow>
            <boxGeometry args={[26, 0.4, 18]} />
            <meshStandardMaterial
              color="#1A1D22"
              roughness={0.7}
              metalness={0.3}
            />
          </mesh>

          {/* Matte Dark Olive PCB Substrate (The Hero Motherboard) */}
          <mesh position={[0, 0, 0]} receiveShadow castShadow>
            <boxGeometry args={[11.6, 0.18, 7.6]} />
            <meshStandardMaterial
              color={PCB_MATTE_COLOR}
              roughness={0.82}
              metalness={0.08}
            />
          </mesh>

          {/* Oxidized Copper Traces with Current Afterglow */}
          <CopperTraceGroup scrollProgress={isPowered ? scrollProgress : 0} />

          {/* 1. Laser Engraved Metal Plate (MP8085 - Opening Shot) */}
          <LaserEngravedPlate isPowered={isPowered} />

          {/* 2. Tactile Hardware POWER SWITCH on PCB */}
          <group position={[-0.7, 0.18, 2.2]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation()
                onTogglePower()
                hardwareAudio.playPowerSwitchClick()
              }}
              position={[0, 0.1, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.38, 0.42, 0.2, 24]} />
              <meshStandardMaterial
                color={isPowered ? "#10B981" : "#DC2626"}
                metalness={0.8}
                roughness={0.2}
                emissive={isPowered ? new THREE.Color("#10B981") : new THREE.Color("#DC2626")}
                emissiveIntensity={isPowered ? 0.6 : 0.25}
              />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.48, 0.5, 0.05, 24]} />
              <meshStandardMaterial color={BRUSHED_ALUMINUM_COLOR} metalness={0.9} roughness={0.2} />
            </mesh>
            <Text
              position={[0, 0.23, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.11}
              color="#FFFFFF"
            >
              {isPowered ? "PWR ON" : "POWER ON"}
            </Text>
          </group>

          {/* 3. Quartz Oscillator Crystal (X1 - 3.072 MHz) */}
          <group position={[-2.4, 0.22, -1.2]}>
            <mesh castShadow>
              <boxGeometry args={[0.85, 0.35, 0.4]} />
              <meshStandardMaterial color="#9CA3AF" metalness={0.95} roughness={0.15} />
            </mesh>
            <Text
              position={[0, 0.19, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.09}
              color="#111827"
            >
              X1 3.072 MHz
            </Text>
          </group>

          {/* 4. Memory IC (64KB RAM/ROM) with Phosphor Oscilloscope Projection */}
          <group position={[-1.2, 0.22, -1.8]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.2, 0.25, 1.1]} />
              <meshStandardMaterial color={IC_PLASTIC_COLOR} roughness={0.5} />
            </mesh>
            <Text
              position={[0, 0.14, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.14}
              color="#D1D5DB"
            >
              IC1 • 64KB MEMORY ARRAY
            </Text>

            {/* Phosphor Projection 1: Memory Execution Timeline (Scroll > 0.22) */}
            <PhosphorProjection
              position={[0, 1.6, 0]}
              title="EXECUTION TIMELINE & INSTRUCTION CYCLES"
              sub="OPCODE 3EH (MVI A, 42H) • T-STATE FETCH: 4 CYCLES • READ/WRITE DATA BUS ACTIVE"
              active={isPowered && scrollProgress > 0.22}
              color="#10B981"
            />
          </group>

          {/* 5. Debug & Interrupt Controller IC with Phosphor Oscilloscope Projection */}
          <group position={[2.1, 0.22, 1.4]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[2.0, 0.25, 0.95]} />
              <meshStandardMaterial color={IC_PLASTIC_COLOR} roughness={0.5} />
            </mesh>
            <Text
              position={[0, 0.14, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.13}
              color="#D1D5DB"
            >
              IC3 • 8259A DEBUG CONTROLLER
            </Text>

            {/* Phosphor Projection 2: Register Diff & Trace (Scroll > 0.44) */}
            <PhosphorProjection
              position={[0, 1.6, 0]}
              title="REGISTER DIFF & STATE INSPECTOR"
              sub="ACCUMULATOR: 00H → 42H • REG B: 05H • REG C: FFH • FLAGS: Z=0, C=0, P=1"
              active={isPowered && scrollProgress > 0.44}
              color="#00E5FF"
            />
          </group>

          {/* 6. CPU Socket U1 & Robotic Arm Assembly (The Climax at Scroll > 0.62) */}
          <CpuSocketAndRoboticArm scrollProgress={isPowered ? scrollProgress : 0} />
        </group>

        <ContactShadows position={[0, -0.21, 0]} opacity={0.65} scale={20} blur={2.4} far={4} />
      </Canvas>
    </div>
  )
}

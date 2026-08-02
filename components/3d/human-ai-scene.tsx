"use client"

import React, { useRef, useState, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, ContactShadows } from "@react-three/drei"
import * as THREE from "three"
import { hardwareAudio } from "@/components/audio-synth"

/* ─────────────────────────────────────────────────────────────────────────────
   1. HOLOGRAPHIC DATA PARTICLES (AI Neural Network Nodes)
   ───────────────────────────────────────────────────────────────────────────── */
function NeuralParticles({ count = 80 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const colorPalette = [
      new THREE.Color("#00f0ff"), // Cyan
      new THREE.Color("#8a2be2"), // Purple/Violet
      new THREE.Color("#00ff66"), // Emerald
      new THREE.Color("#ffaa00"), // Amber
    ]

    for (let i = 0; i < count; i++) {
      const radius = 2.4 + Math.random() * 2.2
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI * 0.8
      pos[i * 3] = Math.cos(theta) * Math.cos(phi) * radius
      pos[i * 3 + 1] = Math.sin(phi) * radius
      pos[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius

      const chosenColor = colorPalette[i % colorPalette.length]
      col[i * 3] = chosenColor.r
      col[i * 3 + 1] = chosenColor.g
      col[i * 3 + 2] = chosenColor.b
    }
    return [pos, col]
  }, [count])

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.15
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        vertexColors
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. ORBITING CYBERNETIC NEURAL RINGS (The "AI Mentor" Halo)
   ───────────────────────────────────────────────────────────────────────────── */
function NeuralRings({ isHovered }: { isHovered: boolean }) {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const speed = isHovered ? 2.2 : 1.0
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.4 * speed
      ring1Ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.5 * speed
      ring2Ref.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.4) * 0.4
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x += delta * 0.3 * speed
      ring3Ref.current.rotation.y += delta * 0.3 * speed
    }
  })

  return (
    <group>
      {/* Outer Cyber Ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[2.7, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={isHovered ? 1.5 : 0.6}
          roughness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Middle Neural Ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.2, 0.02, 16, 80]} />
        <meshStandardMaterial
          color="#8a2be2"
          emissive="#8a2be2"
          emissiveIntensity={isHovered ? 1.8 : 0.7}
          roughness={0.2}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Inner Energy Ring */}
      <mesh ref={ring3Ref} rotation={[0, Math.PI / 3, 0]}>
        <torusGeometry args={[1.75, 0.015, 16, 60]} />
        <meshStandardMaterial
          color="#00ff66"
          emissive="#00ff66"
          emissiveIntensity={isHovered ? 2.0 : 0.8}
          roughness={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. 3D CERAMIC 8085 MICROPROCESSOR CORE WITH 40 PINS
   ───────────────────────────────────────────────────────────────────────────── */
function Microprocessor8085({
  onChipClick,
  isHovered,
  setIsHovered,
}: {
  onChipClick: () => void
  isHovered: boolean
  setIsHovered: (h: boolean) => void
}) {
  const chipRef = useRef<THREE.Group>(null)

  // Subtle pointer tracking & idle floating
  useFrame((state) => {
    if (!chipRef.current) return
    const t = state.clock.elapsedTime
    const mouseX = state.pointer.x * 0.5
    const mouseY = state.pointer.y * 0.5

    // Target rotation based on mouse coordinates + smooth sine wave float
    const targetRotX = 0.35 + mouseY * 0.4 + Math.sin(t * 0.8) * 0.08
    const targetRotY = mouseX * 0.6 + t * 0.18
    const targetRotZ = Math.cos(t * 0.6) * 0.04

    chipRef.current.rotation.x = THREE.MathUtils.lerp(chipRef.current.rotation.x, targetRotX, 0.08)
    chipRef.current.rotation.y = THREE.MathUtils.lerp(chipRef.current.rotation.y, targetRotY, 0.08)
    chipRef.current.rotation.z = THREE.MathUtils.lerp(chipRef.current.rotation.z, targetRotZ, 0.08)
  })

  // 20 pins on each side (40 DIP pins total)
  const leftPins = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const z = -1.35 + i * (2.7 / 19)
      return { id: i + 1, x: -0.95, y: -0.05, z }
    })
  }, [])

  const rightPins = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const z = -1.35 + i * (2.7 / 19)
      return { id: 40 - i, x: 0.95, y: -0.05, z }
    })
  }, [])

  return (
    <group
      ref={chipRef}
      onPointerOver={(e) => {
        e.stopPropagation()
        setIsHovered(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setIsHovered(false)
      }}
      onClick={(e) => {
        e.stopPropagation()
        onChipClick()
        hardwareAudio.playCapacitorCharge()
      }}
      scale={isHovered ? 1.05 : 1.0}
    >
      {/* 1. Main Ceramic DIP Base (Dark slate-grey ceramic) */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.7, 0.22, 3.2]} />
        <meshStandardMaterial
          color="#16181D"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* 2. Gold-Plated Silicon Die Cavity (Center Window) */}
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.05, 0.03, 1.45]} />
        <meshStandardMaterial
          color="#20180B"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* 3. Glowing Cybernetic Core inside the Die (AI Soul of the 8085) */}
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.85, 0.02, 1.25]} />
        <meshStandardMaterial
          color={isHovered ? "#00f0ff" : "#00a8ff"}
          emissive={isHovered ? "#00f0ff" : "#0088cc"}
          emissiveIntensity={isHovered ? 1.5 : 0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 4. Pin 1 Orientation Notch at Top (-Z end) */}
      <mesh position={[0, 0.12, -1.5]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
        <meshStandardMaterial
          color="#0F1115"
          roughness={0.5}
        />
      </mesh>

      {/* 5. Gold-Plated DIP Pins (Left side: pins 1-20, Right side: pins 21-40) */}
      {[...leftPins, ...rightPins].map((pin) => (
        <group key={pin.id} position={[pin.x, pin.y, pin.z]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.06, 0.07]} />
            <meshStandardMaterial
              color="#d4af37"
              metalness={0.95}
              roughness={0.2}
              emissive={isHovered ? "#ffd700" : "#000000"}
              emissiveIntensity={isHovered ? 0.35 : 0}
            />
          </mesh>
          {/* Vertical pin leg leading down */}
          <mesh position={[pin.x > 0 ? 0.1 : -0.1, -0.12, 0]}>
            <boxGeometry args={[0.06, 0.22, 0.06]} />
            <meshStandardMaterial
              color="#c59b27"
              metalness={0.9}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. EXPORTED HUMAN-AI LAB SCENE COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
export function HumanAILabScene({
  onInteract,
}: {
  onInteract?: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="w-full h-[380px] sm:h-[460px] md:h-[540px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#0a0f16] via-[#0d141e] to-[#080c11] border border-cyan-500/20 shadow-[0_0_50px_rgba(0,240,255,0.1)]">
      {/* Glowing atmospheric background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Hero 3D Interactive Canvas */}
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.2, 5.2], fov: 42 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={["#0a0f16"]} />
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-4, -2, 3]} intensity={1.0} color="#00f0ff" />
        <pointLight position={[4, 3, -2]} intensity={0.8} color="#8a2be2" />

        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <Microprocessor8085
            onChipClick={() => {
              if (onInteract) onInteract()
            }}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
          />
          <NeuralRings isHovered={isHovered} />
          <NeuralParticles count={90} />
        </Float>

        <ContactShadows
          position={[0, -2.2, 0]}
          opacity={0.6}
          scale={10}
          blur={2.5}
          far={4}
          color="#00f0ff"
        />
      </Canvas>

      {/* Interactive HUD badge overlay on the 3D scene */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2.5 bg-black/70 backdrop-blur-md border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs text-cyan-300 font-mono shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <span>8085 HOLOGRAPHIC SILICON CORE • POINTER RESPONSIVE</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md border border-purple-500/30 px-3.5 py-1.5 rounded-full text-xs text-purple-300 font-mono shadow-lg">
          <span>🤖 AI MENTOR READY</span>
        </div>
      </div>
    </div>
  )
}

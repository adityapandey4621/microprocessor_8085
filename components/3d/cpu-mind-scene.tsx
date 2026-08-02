"use client"

import React, { useRef, useMemo, useState, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Float, Text, ContactShadows, PerspectiveCamera, Line } from "@react-three/drei"
import * as THREE from "three"
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"

export interface CpuMindSceneProps {
  scrollProgress: number
  activeSection: number
  activeInstruction?: string
  interactiveBeam?: { from: string; to: string } | null
  hoveredMemoryAddress?: string | null
  onSelectMemoryCell?: (addr: string, code: string, meaning: string) => void
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. FLOATING OPCODE & BINARY PARTICLES (TRON / Apple / HUD aesthetic)
   ───────────────────────────────────────────────────────────────────────────── */
const OPCODE_LIST = [
  "MOV A,B", "ADD C", "JMP 2000H", "3E", "FF", "0", "1", "A9", "MVI C", "OUT 01H",
  "STA", "LDA", "00", "01", "8085", "HLT", "CY=1", "Z=0", "SUB E", "XRA L"
]

function FloatingOpcodeParticles({ count = 28 }: { count?: number }) {
  const groupRef = useRef<THREE.Group>(null)

  const items = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const radius = 4 + Math.random() * 5
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 8
      const text = OPCODE_LIST[i % OPCODE_LIST.length]
      const color = i % 3 === 0 ? "#FF9F43" : i % 2 === 0 ? "#00E5FF" : "#7C3AED"
      const scale = 0.22 + Math.random() * 0.15
      const speed = 0.15 + Math.random() * 0.3
      return { id: i, x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius, text, color, scale, speed, theta, radius }
    })
  }, [count])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.08
    groupRef.current.children.forEach((child: any, idx) => {
      const item = items[idx]
      if (item) {
        child.position.y = item.y + Math.sin(state.clock.elapsedTime * item.speed + idx) * 0.4
      }
    })
  })

  return (
    <group ref={groupRef}>
      {items.map((item) => (
        <group key={item.id} position={[item.x, item.y, item.z]}>
          <Text
            fontSize={item.scale}
            color={item.color}
            anchorX="center"
            anchorY="middle"
            fillOpacity={0.75}
            font={undefined} // Default three font
          >
            {item.text}
          </Text>
        </group>
      ))}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. GLOWING PCB BASE WITH PULSING ELECTRICAL TRACES
   ───────────────────────────────────────────────────────────────────────────── */
function PcbBoard() {
  const tracesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!tracesRef.current) return
    tracesRef.current.children.forEach((trace: any, idx) => {
      const mat = trace.material as THREE.MeshBasicMaterial
      if (mat) {
        mat.opacity = 0.3 + Math.abs(Math.sin(state.clock.elapsedTime * 2 + idx)) * 0.7
      }
    })
  })

  return (
    <group position={[0, -2.6, 0]}>
      {/* PCB Main Substrate */}
      <mesh receiveShadow>
        <boxGeometry args={[14, 0.2, 14]} />
        <meshStandardMaterial
          color="#0A1224"
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Emissive PCB Traces */}
      <group ref={tracesRef} position={[0, 0.12, 0]}>
        {[-4, -2, 0, 2, 4].map((x, i) => (
          <mesh key={`trace-x-${i}`} position={[x, 0, 0]}>
            <boxGeometry args={[0.06, 0.02, 12]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#00E5FF" : "#7C3AED"} transparent opacity={0.6} />
          </mesh>
        ))}
        {[-4, -2, 0, 2, 4].map((z, i) => (
          <mesh key={`trace-z-${i}`} position={[0, 0, z]}>
            <boxGeometry args={[12, 0.02, 0.06]} />
            <meshBasicMaterial color={i % 2 === 0 ? "#FF9F43" : "#00E5FF"} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. INTERNAL REGISTERS & ALU (Exploded inside view + Section 5 Orbit)
   ───────────────────────────────────────────────────────────────────────────── */
const REGISTERS = [
  { name: "A (ACC)", hex: "42H", color: "#00E5FF", pos: [-1.8, 0.6, -1.2] },
  { name: "B REG", hex: "15H", color: "#7C3AED", pos: [-0.6, 0.6, -1.5] },
  { name: "C REG", hex: "05H", color: "#7C3AED", pos: [0.6, 0.6, -1.5] },
  { name: "D REG", hex: "80H", color: "#00E5FF", pos: [1.8, 0.6, -1.2] },
  { name: "E REG", hex: "00H", color: "#00E5FF", pos: [1.8, 0.6, 0.5] },
  { name: "H REG", hex: "20H", color: "#FF9F43", pos: [0.6, 0.6, 1.2] },
  { name: "L REG", hex: "50H", color: "#FF9F43", pos: [-0.6, 0.6, 1.2] },
  { name: "SP REG", hex: "FFFFH", color: "#2AFFB3", pos: [-1.8, 0.6, 0.5] },
]

function InternalCore({
  explodedAmount,
  activeSection,
  interactiveBeam
}: {
  explodedAmount: number
  activeSection: number
  interactiveBeam?: { from: string; to: string } | null
}) {
  const aluRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (aluRef.current) {
      aluRef.current.rotation.y += delta * 0.8
      aluRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })

  // Scale up when inside is revealed
  const coreScale = explodedAmount > 0.1 ? 1 : 0.01

  return (
    <group scale={coreScale} position={[0, 0, 0]}>
      {/* Central Glowing ALU Core */}
      <mesh ref={aluRef} position={[0, 0.6, 0]}>
        <octahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial
          color="#00E5FF"
          emissive="#00E5FF"
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.9}
          wireframe={activeSection === 6}
        />
      </mesh>
      <Text position={[0, 1.6, 0]} fontSize={0.24} color="#00E5FF" anchorX="center" anchorY="middle">
        ALU CORE
      </Text>

      {/* Orbiting Registers */}
      {REGISTERS.map((reg, idx) => {
        const isTargeted =
          interactiveBeam &&
          (interactiveBeam.from.includes(reg.name[0]) || interactiveBeam.to.includes(reg.name[0]))

        return (
          <group key={reg.name} position={reg.pos as [number, number, number]}>
            <mesh>
              <boxGeometry args={[0.6, 0.35, 0.5]} />
              <meshStandardMaterial
                color={isTargeted ? "#FF9F43" : reg.color}
                emissive={isTargeted ? "#FF9F43" : reg.color}
                emissiveIntensity={isTargeted ? 2.5 : 0.8}
                roughness={0.3}
                metalness={0.8}
              />
            </mesh>
            <Text position={[0, 0.35, 0]} fontSize={0.15} color="#ffffff" anchorX="center" anchorY="middle">
              {reg.name}
            </Text>
            <Text position={[0, -0.35, 0]} fontSize={0.13} color="#FF9F43" anchorX="center" anchorY="middle">
              {reg.hex}
            </Text>
          </group>
        )
      })}

      {/* Energy Beam if active */}
      {interactiveBeam && (
        <Line
          points={[
            [-1.8, 0.6, -1.2], // Example A to ALU
            [0, 0.6, 0],
          ]}
          color="#FF9F43"
          lineWidth={4}
        />
      )}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. 3D VOXEL MEMORY WALL (Section 4 Visualization)
   ───────────────────────────────────────────────────────────────────────────── */
const MEMORY_CELLS = [
  { addr: "2000H", code: "3EH", asm: "MVI A, 42H", desc: "Load immediate 42H into Accumulator" },
  { addr: "2001H", code: "42H", asm: "42H", desc: "Data byte 42H" },
  { addr: "2002H", code: "06H", asm: "MVI B, 15H", desc: "Load immediate 15H into Register B" },
  { addr: "2003H", code: "15H", asm: "15H", desc: "Data byte 15H" },
  { addr: "2004H", code: "80H", asm: "ADD B", desc: "Add Register B to Accumulator (A = A + B)" },
  { addr: "2005H", code: "32H", asm: "STA 2050H", desc: "Store Accumulator to RAM 2050H" },
  { addr: "2006H", code: "50H", asm: "50H", desc: "Low address byte" },
  { addr: "2007H", code: "20H", asm: "20H", desc: "High address byte" },
  { addr: "2008H", code: "0EH", asm: "MVI C, 05H", desc: "Load loop counter 05H into Reg C" },
  { addr: "2009H", code: "05H", asm: "05H", desc: "Counter byte" },
  { addr: "200AH", code: "0DH", asm: "DCR C", desc: "Decrement Register C by 1" },
  { addr: "200BH", code: "C2H", asm: "JNZ 200AH", desc: "Jump if Zero flag is not set" },
  { addr: "200CH", code: "0AH", asm: "0AH", desc: "Target address low byte" },
  { addr: "200DH", code: "20H", asm: "20H", desc: "Target address high byte" },
  { addr: "200EH", code: "D3H", asm: "OUT 01H", desc: "Output Accumulator to I/O port 01H" },
  { addr: "200FH", code: "76H", asm: "HLT", desc: "Halt processor execution" },
]

function VoxelMemoryWall({
  visible,
  onSelect
}: {
  visible: boolean
  onSelect?: (addr: string, code: string, meaning: string) => void
}) {
  const wallRef = useRef<THREE.Group>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useFrame((state) => {
    if (!wallRef.current) return
    wallRef.current.position.y = visible
      ? THREE.MathUtils.lerp(wallRef.current.position.y, 0, 0.1)
      : THREE.MathUtils.lerp(wallRef.current.position.y, -12, 0.1)
  })

  return (
    <group ref={wallRef} position={[0, -12, 2.5]}>
      {MEMORY_CELLS.map((cell, idx) => {
        const row = Math.floor(idx / 4)
        const col = idx % 4
        const x = (col - 1.5) * 1.5
        const z = (row - 1.5) * 1.2
        const isHovered = hoveredIdx === idx

        return (
          <group
            key={cell.addr}
            position={[x, 0.8 + (isHovered ? 0.3 : 0), z]}
            scale={isHovered ? 1.15 : 1}
          >
            <mesh
              onPointerOver={(e) => {
                e.stopPropagation()
                setHoveredIdx(idx)
                onSelect?.(cell.addr, cell.code, `${cell.asm}: ${cell.desc}`)
              }}
              onPointerOut={() => setHoveredIdx(null)}
            >
              <boxGeometry args={[1.2, 0.6, 0.9]} />
              <meshStandardMaterial
                color={isHovered ? "#FF9F43" : "#0A1224"}
                emissive={isHovered ? "#FF9F43" : "#00E5FF"}
                emissiveIntensity={isHovered ? 2.0 : 0.6}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            <Text position={[0, 0.4, 0]} fontSize={0.16} color="#ffffff" anchorX="center" anchorY="middle">
              {cell.addr}
            </Text>
            <Text position={[0, -0.4, 0]} fontSize={0.18} color="#00E5FF" anchorX="center" anchorY="middle">
              {cell.code}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. THE LIVING 8085 MICROPROCESSOR WITH MECHANICAL PETAL OPENING
   ───────────────────────────────────────────────────────────────────────────── */
function ProcessorModel({
  scrollProgress,
  activeSection,
  interactiveBeam
}: {
  scrollProgress: number
  activeSection: number
  interactiveBeam?: { from: string; to: string } | null
}) {
  const topLidRef = useRef<THREE.Group>(null)
  const cpuGroupRef = useRef<THREE.Group>(null)

  // Determine exploded lid height based on active section
  const targetExplodedAmount =
    activeSection >= 1 && activeSection <= 6 ? 1.8 : 0

  useFrame((state, delta) => {
    // Smooth mechanical petal lid lift
    if (topLidRef.current) {
      topLidRef.current.position.y = THREE.MathUtils.lerp(
        topLidRef.current.position.y,
        targetExplodedAmount,
        delta * 3
      )
      topLidRef.current.rotation.x = THREE.MathUtils.lerp(
        topLidRef.current.rotation.x,
        targetExplodedAmount > 0 ? -0.3 : 0,
        delta * 3
      )
    }

    // Idle rotation
    if (cpuGroupRef.current) {
      if (activeSection === 0 || activeSection === 7) {
        cpuGroupRef.current.rotation.y += delta * 0.25
        cpuGroupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.08
      } else {
        // Oriented towards viewer for architecture inspection
        cpuGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          cpuGroupRef.current.rotation.y,
          0,
          delta * 2
        )
        cpuGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          cpuGroupRef.current.rotation.x,
          0.3,
          delta * 2
        )
      }
    }
  })

  return (
    <group ref={cpuGroupRef}>
      {/* 40 DIP Pins (20 left, 20 right) */}
      {[-2.3, 2.3].map((x, colIdx) =>
        Array.from({ length: 20 }).map((_, idx) => {
          const z = -3.8 + idx * 0.4
          return (
            <group key={`pin-${colIdx}-${idx}`} position={[x, -0.3, z]}>
              <mesh>
                <boxGeometry args={[0.3, 0.6, 0.15]} />
                <meshStandardMaterial
                  color="#ffd700"
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
              {/* Electric Pulse Traveling on Pin */}
              <mesh position={[0, -0.3 + Math.sin(idx + colIdx) * 0.2, 0]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshBasicMaterial
                  color={idx % 4 === 0 ? "#FF9F43" : "#00E5FF"}
                />
              </mesh>
            </group>
          )
        })
      )}

      {/* Main Base Ceramic Substrate */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[4.2, 0.4, 8.2]} />
        <meshStandardMaterial
          color="#111827"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Internal Silicon Die Core & Registers (Visible when top lid separates) */}
      <InternalCore
        explodedAmount={targetExplodedAmount}
        activeSection={activeSection}
        interactiveBeam={interactiveBeam}
      />

      {/* Mechanical Top Lid Petal */}
      <group ref={topLidRef} position={[0, 0, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[4.2, 0.4, 8.2]} />
          <meshStandardMaterial
            color="#1F2937"
            roughness={0.2}
            metalness={0.85}
            wireframe={activeSection === 6}
          />
        </mesh>

        {/* Emissive Gold Edge & Neon Trim */}
        <mesh position={[0, 0.41, 0]}>
          <boxGeometry args={[3.8, 0.05, 7.8]} />
          <meshStandardMaterial
            color="#00E5FF"
            emissive="#00E5FF"
            emissiveIntensity={0.6}
          />
        </mesh>

        {/* Laser Etched Text on Processor Lid */}
        <Text
          position={[0, 0.45, -1.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.45}
          color="#00E5FF"
          font={undefined}
          anchorX="center"
          anchorY="middle"
        >
          8085 CPU
        </Text>
        <Text
          position={[0, 0.45, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.22}
          color="#FF9F43"
          font={undefined}
          anchorX="center"
          anchorY="middle"
        >
          MICROPROCESSOR ARCHITECTURE
        </Text>
        <Text
          position={[0, 0.45, 1.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.16}
          color="#7C3AED"
          font={undefined}
          anchorX="center"
          anchorY="middle"
        >
          3.07 MHz • 64KB BUS • 8-BIT CORE
        </Text>
      </group>
    </group>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. SCROLL-DRIVEN CAMERA CONTROLLER
   ───────────────────────────────────────────────────────────────────────────── */
function CameraRig({
  scrollProgress,
  activeSection
}: {
  scrollProgress: number
  activeSection: number
}) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const { camera } = useThree()

  useFrame((state, delta) => {
    // Determine target camera position based on section
    let targetX = 0
    let targetY = 2
    let targetZ = 12
    let lookY = 0

    if (activeSection === 1) {
      // Exploded petals view
      targetY = 4
      targetZ = 8
      lookY = 0.5
    } else if (activeSection === 2) {
      // Instruction execution pipeline
      targetX = -2
      targetY = 3
      targetZ = 9
      lookY = 0.5
    } else if (activeSection === 3) {
      // Holographic cards
      targetX = 3
      targetY = 2
      targetZ = 10
      lookY = 0
    } else if (activeSection === 4) {
      // 3D Voxel Memory Wall
      targetX = 0
      targetY = -8
      targetZ = 9
      lookY = -12
    } else if (activeSection === 5) {
      // Registers around ALU
      targetX = 0
      targetY = 4
      targetZ = 7
      lookY = 0.5
    } else if (activeSection === 6) {
      // Exploded blueprint
      targetY = 6
      targetZ = 11
      lookY = 0
    } else if (activeSection === 7) {
      // Finale
      targetX = 0
      targetY = 2
      targetZ = 13
      lookY = 0
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 3)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 3)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 3)
    camera.lookAt(0, lookY, 0)
  })

  return null
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. MAIN EXPORTED 3D SCENE (WITH POSTPROCESSING FALLBACK)
   ───────────────────────────────────────────────────────────────────────────── */
export function CpuMindScene({
  scrollProgress,
  activeSection,
  activeInstruction,
  interactiveBeam,
  onSelectMemoryCell
}: CpuMindSceneProps) {
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-auto bg-[#05070D]">
      <Canvas
        camera={{ position: [0, 2, 12], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#05070D"]} />
        <fog attach="fog" args={["#05070D", 10, 28]} />

        <Suspense fallback={null}>
          <CameraRig scrollProgress={scrollProgress} activeSection={activeSection} />

          {/* Cinematic Studio Volumetric Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 15, 10]} intensity={3.0} color="#00E5FF" />
          <directionalLight position={[-10, -10, -5]} intensity={2.0} color="#7C3AED" />
          <pointLight position={[0, 6, 4]} intensity={3.5} color="#FF9F43" />
          <pointLight position={[5, -3, -5]} intensity={2.0} color="#2AFFB3" />

          {/* Floating Opcode & Binary Particles */}
          <FloatingOpcodeParticles count={32} />

          {/* Glowing PCB Substrate */}
          <PcbBoard />

          {/* Living 8085 Processor */}
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
            <ProcessorModel
              scrollProgress={scrollProgress}
              activeSection={activeSection}
              interactiveBeam={interactiveBeam}
            />
          </Float>

          {/* Section 4 Voxel Memory Wall */}
          <VoxelMemoryWall
            visible={activeSection === 4}
            onSelect={onSelectMemoryCell}
          />

          <ContactShadows position={[0, -2.6, 0]} opacity={0.5} scale={18} blur={2.5} far={8} color="#000000" />

          {/* Postprocessing Bloom & Vignette */}
          <EffectComposer>
            <Bloom
              intensity={0.8}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              blendFunction={BlendFunction.ADD}
            />
            <Vignette eskil={false} offset={0.15} darkness={0.7} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}

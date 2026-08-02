"use client"

import { useRef, useMemo, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Text } from "@react-three/drei"
import * as THREE from "three"

// Orbiting holographic data particles around the 8085 processor
function DataParticles({ count = 80 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const cols = new Float32Array(count * 3)
    const colorChoices = [
      new THREE.Color("#00ffff"), // Cyan
      new THREE.Color("#a66cff"), // Purple
      new THREE.Color("#ffd700"), // Gold
      new THREE.Color("#3b82f6"), // Blue
    ]

    for (let i = 0; i < count; i++) {
      const radius = 3.5 + Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 6

      pos[i * 3] = Math.cos(theta) * radius
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = Math.sin(theta) * radius

      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)]
      cols[i * 3] = c.r
      cols[i * 3 + 1] = c.g
      cols[i * 3 + 2] = c.b
    }
    return [pos, cols]
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
        size={0.08}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Glowing energy pulses moving along the pins
function PinPulses() {
  const pulseRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (pulseRef.current) {
      pulseRef.current.children.forEach((child, idx) => {
        const time = state.clock.elapsedTime * 3 + idx
        child.position.y = Math.sin(time) * 0.2 - 0.2
        child.scale.setScalar(0.7 + Math.sin(time * 2) * 0.3)
      })
    }
  })

  return (
    <group ref={pulseRef}>
      {[-1.5, 1.5].map((xPos, groupIdx) =>
        Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={`pulse-${groupIdx}-${i}`}
            position={[xPos, -0.2, -2.5 + i * 1.0]}
          >
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial
              color={groupIdx === 0 ? "#00ffff" : "#ffd700"}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))
      )}
    </group>
  )
}

export function Microchip(props: any) {
  const group = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  // Materials
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: hovered ? "#12121c" : "#0a0a0d",
        metalness: 0.4,
        roughness: 0.7,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
      }),
    [hovered]
  )

  const pinMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: hovered ? "#e0e0ff" : "#c0c0c0",
        metalness: 1.0,
        roughness: 0.15,
        emissive: hovered ? new THREE.Color("#004466") : new THREE.Color("#000000"),
        emissiveIntensity: hovered ? 0.6 : 0,
      }),
    [hovered]
  )

  const goldMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#ffd700",
        metalness: 1.0,
        roughness: 0.2,
        emissive: clicked ? new THREE.Color("#885500") : new THREE.Color("#221100"),
        emissiveIntensity: clicked ? 1.5 : 0.4,
      }),
    [clicked]
  )

  // 40-pin DIP: 20 pins per side
  const pinCount = 20
  const pinSpacing = 0.3
  const totalLength = pinSpacing * (pinCount - 1)
  const startZ = -totalLength / 2

  // Interactive mouse tilt and idle floating
  useFrame((state, delta) => {
    if (group.current) {
      // Idle float animation
      const targetY = Math.sin(state.clock.elapsedTime * 1.5) * 0.15
      group.current.position.y += (targetY - group.current.position.y) * 0.1

      // Interactive tilt towards mouse
      const mouseX = (state.pointer.x * Math.PI) / 10
      const mouseY = (state.pointer.y * Math.PI) / 10

      group.current.rotation.y += (mouseX - group.current.rotation.y) * 0.08
      group.current.rotation.x += (-mouseY - group.current.rotation.x) * 0.08
    }
  })

  return (
    <group {...props} dispose={null}>
      {/* Orbiting holographic data particles */}
      <DataParticles count={100} />

      {/* Main interactive microchip group */}
      <group
        ref={group}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = "pointer"
        }}
        onPointerOut={(e) => {
          setHovered(false)
          document.body.style.cursor = "auto"
        }}
        onClick={() => setClicked(!clicked)}
      >
        {/* Main Ceramic Body */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.4, totalLength + 1]} />
          <primitive object={bodyMaterial} attach="material" />
        </mesh>

        {/* Gold Center Plate (Stylized) */}
        <mesh position={[0, 0.21, 0]} castShadow>
          <boxGeometry args={[1.5, 0.02, 3]} />
          <primitive object={goldMaterial} attach="material" />
        </mesh>

        {/* Indentation (Pin 1 marker) */}
        <mesh position={[0, 0.2, -totalLength / 2 - 0.2]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshPhysicalMaterial color="#050505" metalness={0.1} roughness={0.9} />
        </mesh>

        {/* Text Label */}
        <Text
          position={[0, 0.23, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          fontSize={0.4}
          color={hovered ? "#00ffff" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
        >
          MP8085
        </Text>

        <Text
          position={[0, 0.23, 1.2]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          fontSize={0.15}
          color="#888888"
          anchorX="center"
          anchorY="middle"
        >
          8-BIT MICROPROCESSOR
        </Text>

        {/* Floating holographic badge over the chip */}
        <Text
          position={[0, 0.8, 0]}
          rotation={[0, 0, 0]}
          fontSize={0.18}
          color="#00ffff"
          anchorX="center"
          anchorY="middle"
          fillOpacity={hovered ? 1 : 0.6}
        >
          {hovered ? "CLICK TO PULSE 3.07 MHz" : "INTERACTIVE 8085 CORE"}
        </Text>

        {/* Left Pins */}
        {Array.from({ length: pinCount }).map((_, i) => (
          <group key={`pin-l-${i}`} position={[-1.5, 0, startZ + i * pinSpacing]}>
            <mesh position={[-0.3, -0.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.05, 0.15]} />
              <primitive object={pinMaterial} attach="material" />
            </mesh>
            <mesh position={[-0.575, -0.4, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.05, 0.4, 0.15]} />
              <primitive object={pinMaterial} attach="material" />
            </mesh>
          </group>
        ))}

        {/* Right Pins */}
        {Array.from({ length: pinCount }).map((_, i) => (
          <group key={`pin-r-${i}`} position={[1.5, 0, startZ + i * pinSpacing]}>
            <mesh position={[0.3, -0.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.05, 0.15]} />
              <primitive object={pinMaterial} attach="material" />
            </mesh>
            <mesh position={[0.575, -0.4, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.05, 0.4, 0.15]} />
              <primitive object={pinMaterial} attach="material" />
            </mesh>
          </group>
        ))}

        {/* Glowing Pin Pulses */}
        <PinPulses />
      </group>
    </group>
  )
}

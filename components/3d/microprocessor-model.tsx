"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Float, ContactShadows } from "@react-three/drei"
import * as THREE from "three"

export default function MicroprocessorModel() {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.x = 0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      group.current.rotation.y = state.clock.elapsedTime * 0.5;
      group.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
    }
  })

  // Material definitions for a premium look
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffffff",
    emissive: "#C89B3C",
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.8,
  }), [])

  const pinMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#C89B3C", // Gold
    roughness: 0.2,
    metalness: 0.8,
  }), [])

  // Create 40 pins (20 on each side) for a DIP-40 package like the 8085
  const pins = useMemo(() => {
    const pinGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.05)
    const pinMeshes = []
    
    // Left side pins
    for (let i = 0; i < 20; i++) {
      pinMeshes.push(
        <mesh 
          key={`pin-l-${i}`} 
          geometry={pinGeometry} 
          material={pinMaterial} 
          position={[-1.1, -0.2, -2.85 + (i * 0.3)]}
          rotation={[0, 0, 0.1]}
        />
      )
    }
    
    // Right side pins
    for (let i = 0; i < 20; i++) {
      pinMeshes.push(
        <mesh 
          key={`pin-r-${i}`} 
          geometry={pinGeometry} 
          material={pinMaterial} 
          position={[1.1, -0.2, -2.85 + (i * 0.3)]}
          rotation={[0, 0, -0.1]}
        />
      )
    }
    
    return pinMeshes
  }, [pinMaterial])

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={2.5} color="#E6B85C" />
      <pointLight position={[-5, -5, -5]} intensity={1.5} color="#C89B3C" />

      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={group} scale={2.5}>
          {/* Main IC Body */}
          <mesh material={bodyMaterial} position={[0, 0, 0]}>
            <boxGeometry args={[2, 0.3, 6]} />
          </mesh>

          {/* IC Indentation (Pin 1 marker) */}
          <mesh material={bodyMaterial} position={[0, 0.15, -2.8]}>
            <cylinderGeometry args={[0.2, 0.2, 0.1]} />
          </mesh>



          {/* Pins */}
          {pins}
        </group>
      </Float>

      <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#000" frames={1} resolution={256} />
    </>
  )
}

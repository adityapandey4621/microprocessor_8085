"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, ContactShadows } from "@react-three/drei"
import { useScroll, useTransform } from "framer-motion"
import { Microchip } from "./microchip"
import { Suspense, useRef } from "react"
import * as THREE from "three"

function ScrollRig() {
  const group = useRef<THREE.Group>(null)
  const { scrollYProgress } = useScroll()
  
  const rotationX = useTransform(scrollYProgress, [0, 1], [0.5, Math.PI * 2 + 0.5])
  const rotationY = useTransform(scrollYProgress, [0, 1], [-0.5, Math.PI * 2])

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.x = rotationX.get() + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      group.current.rotation.y = rotationY.get() + state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={group} position={[2, 0, 0]}>
      <Microchip scale={1.5} />
    </group>
  )
}

export function MicrochipScene() {
  return (
    <div className="w-full h-[100vh] fixed top-0 left-0 -z-10 pointer-events-auto">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <Suspense fallback={null}>
          {/* Procedural Studio Lighting (No external HDR fetch required) */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={2.5} color="#4a90e2" />
          <directionalLight position={[-10, -10, -5]} intensity={1.5} color="#a66cff" />
          <directionalLight position={[0, 15, 0]} intensity={1.8} color="#ffffff" />
          <pointLight position={[5, -5, 5]} intensity={2} color="#00ffff" />
          <pointLight position={[-5, 5, -5]} intensity={2} color="#ffd700" />
          
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1} floatingRange={[-0.2, 0.2]}>
            <ScrollRig />
          </Float>

          <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={10} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  )
}

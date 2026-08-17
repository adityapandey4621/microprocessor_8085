"use client"

import dynamic from "next/dynamic"

const Interactive3DFooter = dynamic(() => import("./interactive-3d-footer"), {
  ssr: false,
  loading: () => (
    <footer className="w-full bg-[#030308] text-slate-500 py-16 px-6 text-center font-mono text-xs border-t border-white/10">
      Loading 3D Microprocessor Playground...
    </footer>
  )
})

export default function CinematicFooter() {
  return <Interactive3DFooter />
}

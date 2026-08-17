"use client"

export default function CinematicFooter() {
  return (
    <footer className="w-full bg-[#030308] text-slate-500 py-16 px-6 text-center font-mono text-xs border-t border-white/10">
      <p>© {new Date().getFullYear()} 8085 Microprocessor Simulator</p>
      <p className="mt-2 text-slate-600">Built for educational purposes</p>
    </footer>
  )
}

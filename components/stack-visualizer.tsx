"use client"

import { Layers } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface StackVisualizerProps {
  sp: number
  memory: Uint8Array
  onAddressClick?: (address: number) => void
}

export default function StackVisualizer({ sp, memory, onAddressClick }: StackVisualizerProps) {
  const safeMemory = memory instanceof Uint8Array && memory.length === 0x10000 ? memory : null

  // Show 9 addresses centered on SP, reversed so higher addresses are at bottom
  const stackEntries = Array.from({ length: 9 }).map((_, i) => {
    const offset = i - 4
    const address = (sp + offset) & 0xFFFF
    return {
      address,
      value: safeMemory ? safeMemory[address] : 0,
      isSP: offset === 0,
      isBelow: offset > 0, // below SP (used stack area)
    }
  }).reverse()

  return (
    <div className="bg-[#0a0a0f] border border-white/5 rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium text-gray-300">Stack</span>
        </div>
        <div className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-gray-400 border border-white/5">
          SP:{sp.toString(16).toUpperCase().padStart(4, '0')}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[52px_1fr_32px] text-[10px] text-gray-600 uppercase font-semibold px-3 py-1.5 border-b border-white/5">
        <span>Addr</span>
        <span className="text-center">Val</span>
        <span></span>
      </div>

      {/* Stack rows */}
      <div className="flex-1 overflow-hidden flex flex-col px-1 py-1 gap-0.5">
        <AnimatePresence initial={false}>
          {stackEntries.map((entry) => (
            <motion.div
              key={entry.address}
              layout
              animate={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: entry.isSP ? -8 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={() => onAddressClick?.(entry.address)}
              className={`grid grid-cols-[52px_1fr_32px] items-center px-2 py-1 rounded cursor-pointer font-mono text-[11px] transition-colors
                ${entry.isSP
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25'
                  : entry.isBelow
                    ? 'text-slate-400 border border-transparent hover:bg-white/5'
                    : 'text-gray-600 border border-transparent hover:bg-white/3'
                }
              `}
            >
              <span className="text-[10px]">{entry.address.toString(16).toUpperCase().padStart(4, '0')}</span>
              <span className={`text-center ${entry.isSP ? 'text-emerald-300 font-bold' : entry.isBelow ? 'text-slate-300' : 'text-gray-700'}`}>
                {entry.value.toString(16).toUpperCase().padStart(2, '0')}
              </span>
              <span className="text-[9px] text-right text-emerald-500 font-bold">
                {entry.isSP ? "◀SP" : ""}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

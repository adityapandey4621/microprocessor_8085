"use client"

import { BarChart3, Clock, Cpu, Database, Layers, ArrowUp } from "lucide-react"
import { ExecutionStatistics } from "@/lib/trace-engine"

interface ExecutionStatisticsProps {
  stats: ExecutionStatistics | null
}

export default function ExecutionStatisticsPanel({ stats }: ExecutionStatisticsProps) {
  const s = stats ?? {
    instructionsExecuted: 0,
    machineCycles: 0,
    tStates: 0,
    memoryReads: 0,
    memoryWrites: 0,
    stackOperations: 0,
  }

  return (
    <div className="bg-[#0a0a0f] border border-white/5 rounded-lg flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
        <BarChart3 className="w-4 h-4 text-emerald-400 mr-2" />
        <span className="text-sm font-medium text-gray-300">Statistics</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-2.5 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          <StatBox
            label="Instructions"
            value={s.instructionsExecuted}
            icon={<Cpu className="w-3 h-3 text-blue-400" />}
            color="text-blue-400"
          />
          <StatBox
            label="T-States"
            value={s.tStates}
            icon={<Clock className="w-3 h-3 text-amber-400" />}
            color="text-amber-400"
          />
          <StatBox
            label="M-Cycles"
            value={s.machineCycles}
            icon={<Clock className="w-3 h-3 text-orange-400" />}
            color="text-orange-400"
          />
          <StatBox
            label="Mem Reads"
            value={s.memoryReads}
            icon={<Database className="w-3 h-3 text-purple-400" />}
            color="text-purple-400"
          />
          <StatBox
            label="Mem Writes"
            value={s.memoryWrites}
            icon={<ArrowUp className="w-3 h-3 text-rose-400" />}
            color="text-rose-400"
          />
          <StatBox
            label="Stack Ops"
            value={s.stackOperations}
            icon={<Layers className="w-3 h-3 text-indigo-400" />}
            color="text-indigo-400"
          />
        </div>
      </div>
    </div>
  )
}

function StatBox({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded p-2 flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-base font-mono font-semibold text-right ${color}`}>
        {value.toLocaleString()}
      </div>
    </div>
  )
}

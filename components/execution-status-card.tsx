"use client"

import { Cpu, Play, Pause, Square, AlertCircle, Clock } from "lucide-react"

export interface ExecutionState {
  pc: number;
  instructionSource: string | null;
  opcode: string | null;
  instructionLength: number;
  status: 'Idle' | 'Running' | 'Paused' | 'Halted' | 'Error';
  instructionCount: number;
  activeLine: number | null;
}

interface ExecutionStatusCardProps {
  executionState: ExecutionState;
}

export default function ExecutionStatusCard({ executionState }: ExecutionStatusCardProps) {
  const { pc, instructionSource, opcode, instructionLength, status, instructionCount } = executionState;

  const StatusIcon = () => {
    switch (status) {
      case 'Running': return <Play className="w-4 h-4 text-green-400" />;
      case 'Paused': return <Pause className="w-4 h-4 text-amber-400" />;
      case 'Halted': return <Square className="w-4 h-4 text-blue-400" />;
      case 'Error': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  }

  const statusColor = () => {
    switch (status) {
      case 'Running': return 'text-green-400';
      case 'Paused': return 'text-amber-400';
      case 'Halted': return 'text-blue-400';
      case 'Error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }

  return (
    <div className="rounded-lg bg-[#0a0a0f] border border-white/5 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
        <Cpu className="w-4 h-4 text-purple-400" />
        <span className="text-sm font-medium text-gray-300">Execution State</span>
        <div className="ml-auto flex items-center gap-1.5">
          <StatusIcon />
          <span className={`text-xs font-mono font-medium ${statusColor()}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Instruction</span>
          <span className="text-sm font-mono text-gray-200 truncate" title={instructionSource || "None"}>
            {instructionSource || "None"}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Opcode</span>
          <span className="text-sm font-mono text-orange-400">
            {opcode ? `${opcode}H` : "--"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">PC</span>
          <span className="text-sm font-mono text-blue-400 transition-all duration-200">
            {pc.toString(16).toUpperCase().padStart(4, "0")}H
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Length</span>
          <span className="text-sm font-mono text-gray-300">
            {instructionLength > 0 ? `${instructionLength} byte${instructionLength > 1 ? 's' : ''}` : "--"}
          </span>
        </div>

        <div className="flex flex-col col-span-2 mt-1 pt-3 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Instructions Executed</span>
            <span className="text-sm font-mono text-gray-300 transition-all duration-200">
              {instructionCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

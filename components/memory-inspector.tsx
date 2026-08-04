"use client"

import { InspectorDialog } from "./inspector-dialog"

interface MemoryInspectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: number | null
  value: number | null
}

export function MemoryInspector({ open, onOpenChange, address, value }: MemoryInspectorProps) {
  if (address === null || value === null) return null

  const addressHex = address.toString(16).toUpperCase().padStart(4, "0") + "H"
  const valueHex = value.toString(16).toUpperCase().padStart(2, "0") + "H"
  const valueBin = value.toString(2).padStart(8, "0").match(/.{1,4}/g)?.join(" ") + "B"
  const valueDec = value.toString(10)
  
  // Printable ASCII or '.'
  const valueAscii = (value >= 32 && value <= 126) ? String.fromCharCode(value) : "."

  return (
    <InspectorDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={`Memory Address: ${addressHex}`}
      description="Inspect memory cell value representations."
    >
      <div className="flex flex-col gap-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Hexadecimal</span>
            <span className="font-mono text-orange-400 text-lg">{valueHex}</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Binary</span>
            <span className="font-mono text-emerald-400 text-lg">{valueBin}</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Decimal</span>
            <span className="font-mono text-blue-400 text-lg">{valueDec}</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">ASCII</span>
            <span className="font-mono text-purple-400 text-lg">'{valueAscii}'</span>
          </div>
        </div>
      </div>
    </InspectorDialog>
  )
}

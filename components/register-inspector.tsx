"use client"

import { InspectorDialog } from "./inspector-dialog"

interface RegisterInspectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registerName: string | null
  value: number | null
}

export function RegisterInspector({ open, onOpenChange, registerName, value }: RegisterInspectorProps) {
  if (registerName === null || value === null) return null

  // Determine if it's a 16-bit register pair or PC/SP vs 8-bit register
  const is16Bit = registerName.length > 1 && registerName !== "PSW"
  const bits = is16Bit ? 16 : 8
  const padHex = is16Bit ? 4 : 2

  const valueHex = value.toString(16).toUpperCase().padStart(padHex, "0") + "H"
  
  // Format binary with spaces every 4 bits
  let binStr = value.toString(2).padStart(bits, "0")
  const valueBin = (binStr.match(/.{1,4}/g)?.join(" ") || binStr) + "B"
  
  const valueDec = value.toString(10)

  // Descriptions for context
  const getRegDescription = (reg: string) => {
    switch (reg) {
      case 'A': return "Accumulator: Primary 8-bit register used for arithmetic, logic, and I/O operations."
      case 'B': case 'C': case 'D': case 'E': case 'H': case 'L':
        return `General Purpose Register ${reg}: Can be used for 8-bit operations or paired for 16-bit operations.`
      case 'BC': return "Register Pair BC: Often used as a 16-bit counter or data pointer."
      case 'DE': return "Register Pair DE: Often used as a 16-bit destination pointer for data transfers."
      case 'HL': return "Register Pair HL: The primary 16-bit memory pointer (M). Used for indirect addressing."
      case 'SP': return "Stack Pointer: 16-bit register pointing to the top of the stack in memory."
      case 'PC': return "Program Counter: 16-bit register holding the address of the next instruction to execute."
      default: return "Internal CPU Register."
    }
  }

  return (
    <InspectorDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={`Register ${registerName}`}
      description={getRegDescription(registerName)}
    >
      <div className="flex flex-col gap-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Hexadecimal</span>
            <span className="font-mono text-orange-400 text-lg">{valueHex}</span>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Decimal</span>
            <span className="font-mono text-blue-400 text-lg">{valueDec}</span>
          </div>
          <div className="col-span-2 p-3 bg-white/[0.02] border border-white/5 rounded-lg flex flex-col gap-1">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Binary</span>
            <span className="font-mono text-emerald-400 text-lg text-center tracking-widest">{valueBin}</span>
          </div>
        </div>
      </div>
    </InspectorDialog>
  )
}

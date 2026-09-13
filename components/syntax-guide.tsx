import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle, Code, Info } from "lucide-react"

export function SyntaxGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors text-gray-400 hover:text-white hover:bg-[#37373d]">
          <HelpCircle className="w-3.5 h-3.5" />
          Syntax Guide
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-[#1e1e1e] border-[#333] text-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2 text-white">
            <Code className="w-5 h-5 text-blue-500" />
            8085 Assembler Conventions
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            A quick reference for the syntax and conventions supported by our 8085 emulator.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="space-y-2">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Number Formats
            </h3>
            <div className="bg-[#252526] p-3 rounded-lg border border-[#333] text-sm text-gray-300">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong className="text-blue-400">Hexadecimal:</strong> Must end with <code className="bg-[#1e1e1e] px-1 py-0.5 rounded text-gray-300">H</code>. E.g., <code className="text-emerald-400">2000H</code>, <code className="text-emerald-400">0FFH</code>. If it starts with a letter, prefix with <code className="bg-[#1e1e1e] px-1 py-0.5 rounded text-gray-300">0</code> (e.g., <code className="text-emerald-400">0A4H</code> instead of <code className="text-red-400">A4H</code>).</li>
                <li><strong className="text-blue-400">Decimal:</strong> Written normally or with <code className="bg-[#1e1e1e] px-1 py-0.5 rounded text-gray-300">D</code>. E.g., <code className="text-emerald-400">255</code>, <code className="text-emerald-400">255D</code>.</li>
                <li><strong className="text-blue-400">Binary:</strong> Must end with <code className="bg-[#1e1e1e] px-1 py-0.5 rounded text-gray-300">B</code>. E.g., <code className="text-emerald-400">11001100B</code>.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Labels & Variables
            </h3>
            <div className="bg-[#252526] p-3 rounded-lg border border-[#333] text-sm text-gray-300">
              <ul className="list-disc list-inside space-y-1.5">
                <li>Labels must end with a colon <code className="bg-[#1e1e1e] px-1 py-0.5 rounded text-gray-300">:</code> when defined. E.g., <code className="text-emerald-400">LOOP:</code></li>
                <li>When jumping or calling, omit the colon. E.g., <code className="text-blue-400">JMP</code> <code className="text-emerald-400">LOOP</code></li>
                <li>Valid label names can contain letters, numbers, and underscores, but cannot start with a number.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Comments
            </h3>
            <div className="bg-[#252526] p-3 rounded-lg border border-[#333] text-sm text-gray-300">
              <p className="mb-2">Comments start with a semicolon <code className="bg-[#1e1e1e] px-1 py-0.5 rounded text-gray-300">;</code> and extend to the end of the line.</p>
              <code className="block bg-[#1e1e1e] p-2 rounded text-emerald-400/80">
                MVI A, 05H ; This is a comment
              </code>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              Emulator Specifics
            </h3>
            <div className="bg-[#252526] p-3 rounded-lg border border-[#333] text-sm text-gray-300">
              <ul className="list-disc list-inside space-y-1.5">
                <li><strong className="text-gray-100">Origin:</strong> Code execution usually begins at <code className="text-emerald-400">2000H</code> unless an <code className="text-blue-400">ORG</code> directive is used.</li>
                <li><strong className="text-gray-100">Halting:</strong> Always end your program with <code className="text-blue-400">HLT</code> to tell the emulator when to stop execution.</li>
                <li><strong className="text-gray-100">Directives:</strong> Supported directives include <code className="text-blue-400">DB</code>, <code className="text-blue-400">DW</code>, <code className="text-blue-400">ORG</code>, and <code className="text-blue-400">EQU</code>.</li>
              </ul>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import SimulatorNav from '@/components/simulator-nav'
import { ChallengesSidebar } from '@/components/challenges-sidebar'
import { FileCode, Terminal, Lightbulb, Zap } from 'lucide-react'

export default function CheatSheetPage() {
  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
      <SimulatorNav />

      <div className="flex flex-1 overflow-hidden">
        <ChallengesSidebar />

        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#1e1e1e]">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <FileCode className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Syntax & Tricks</h1>
                <p className="text-gray-400">Master the 8085 assembler with these quick tips.</p>
              </div>
            </div>

            <div className="space-y-10">
              
              {/* Syntax Rules */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" /> Essential Syntax Rules
                </h2>
                <div className="bg-[#121212] p-6 rounded-xl border border-[#1e1e1e] space-y-5 text-sm text-gray-300">
                  <div>
                    <h3 className="font-semibold text-white mb-1">1. Hexadecimal Numbers</h3>
                    <p className="mb-2 text-gray-400">All hex numbers must end with <code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">H</code>. If they start with a letter, they must be prefixed with <code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">0</code>.</p>
                    <div className="bg-[#0c0c0c] p-3 rounded border border-[#1e1e1e] font-mono text-xs">
                      MVI A, 0FFH   <span className="text-emerald-500">; CORRECT</span><br/>
                      MVI A, FFH    <span className="text-red-500">; WRONG (Starts with letter)</span><br/>
                      MVI A, 05H    <span className="text-emerald-500">; CORRECT</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-white mb-1">2. Labels</h3>
                    <p className="mb-2 text-gray-400">Labels must end with a colon <code className="text-blue-400 bg-blue-400/10 px-1 rounded">:</code> when defined, but NOT when referenced.</p>
                    <div className="bg-[#0c0c0c] p-3 rounded border border-[#1e1e1e] font-mono text-xs">
                      LOOP:         <span className="text-emerald-500">; CORRECT (Definition)</span><br/>
                      JMP LOOP      <span className="text-emerald-500">; CORRECT (Reference)</span><br/>
                      JMP LOOP:     <span className="text-red-500">; WRONG</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-1">3. Halting</h3>
                    <p className="text-gray-400">Always end your executable logic with the <code className="text-amber-400 bg-amber-400/10 px-1 rounded">HLT</code> instruction to stop the emulator.</p>
                  </div>
                </div>
              </section>

              {/* Pro Tricks */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" /> Pro Tricks & Shortcuts
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="bg-[#121212] p-5 rounded-xl border border-[#1e1e1e]">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-400" /> Clearing the Accumulator
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">Instead of using <code className="text-blue-400">MVI A, 00H</code> (which takes 7 T-States and 2 bytes), use Exclusive-OR with itself.</p>
                    <div className="bg-[#0c0c0c] p-3 rounded border border-[#1e1e1e] font-mono text-xs text-emerald-400">
                      XRA A   ; A = A ⊕ A = 0
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Takes only 1 byte and 4 T-States! Also clears the Carry flag.</p>
                  </div>

                  <div className="bg-[#121212] p-5 rounded-xl border border-[#1e1e1e]">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-400" /> Clearing the Carry Flag
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">If you only need to clear the carry flag without affecting the accumulator, use boolean logic.</p>
                    <div className="bg-[#0c0c0c] p-3 rounded border border-[#1e1e1e] font-mono text-xs text-emerald-400">
                      ANA A   ; OR ORA A
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">Performs A AND A. Result is A (unchanged), but Carry and Aux Carry are reset to 0.</p>
                  </div>

                  <div className="bg-[#121212] p-5 rounded-xl border border-[#1e1e1e]">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-400" /> 16-bit Addition
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">Adding two 16-bit numbers? Use the <code className="text-blue-400">DAD</code> instruction which adds a register pair to HL.</p>
                    <div className="bg-[#0c0c0c] p-3 rounded border border-[#1e1e1e] font-mono text-xs text-emerald-400">
                      LXI H, 1000H<br/>
                      LXI D, 2000H<br/>
                      DAD D   ; HL = HL + DE
                    </div>
                  </div>

                  <div className="bg-[#121212] p-5 rounded-xl border border-[#1e1e1e]">
                    <h3 className="font-semibold text-white mb-2 flex items-center gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 text-amber-400" /> Setting the Carry Flag
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">There is a specific instruction to set the Carry flag to 1, which is useful for subtraction or rotates.</p>
                    <div className="bg-[#0c0c0c] p-3 rounded border border-[#1e1e1e] font-mono text-xs text-emerald-400">
                      STC     ; Set Carry Flag
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">To toggle it, use CMC (Complement Carry).</p>
                  </div>

                </div>
              </section>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

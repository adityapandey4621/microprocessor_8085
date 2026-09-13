'use client'

import SimulatorNav from '@/components/simulator-nav'
import { ChallengesSidebar } from '@/components/challenges-sidebar'
import { FileText, Cpu, Server, Hash } from 'lucide-react'

export default function ManualPage() {
  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
      <SimulatorNav />

      <div className="flex flex-1 overflow-hidden">
        <ChallengesSidebar />

        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-[#1e1e1e]">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">8085 Reference Manual</h1>
                <p className="text-gray-400">Architecture, Registers, and Instruction Set Overview</p>
              </div>
            </div>

            <div className="space-y-12">
              
              {/* Architecture */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" /> Architecture Overview
                </h2>
                <div className="bg-[#121212] p-6 rounded-xl border border-[#1e1e1e] text-sm text-gray-300 leading-relaxed space-y-4">
                  <p>
                    The Intel 8085 is an 8-bit microprocessor introduced in 1976. It has an 8-bit data bus, a 16-bit address bus (allowing it to address 64 KB of memory), and a 16-bit program counter.
                  </p>
                  <p>
                    It operates on a single +5V power supply and uses an internal clock generator. Our emulator assumes execution starts at memory address <code className="text-blue-400 font-mono">0x2000</code>.
                  </p>
                </div>
              </section>

              {/* Registers */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-amber-400" /> Registers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#121212] p-5 rounded-xl border border-[#1e1e1e]">
                    <h3 className="font-semibold text-white mb-2 text-sm">Accumulator (A)</h3>
                    <p className="text-xs text-gray-400">The 8-bit primary register used for most arithmetic and logical operations.</p>
                  </div>
                  <div className="bg-[#121212] p-5 rounded-xl border border-[#1e1e1e]">
                    <h3 className="font-semibold text-white mb-2 text-sm">General Purpose (B, C, D, E, H, L)</h3>
                    <p className="text-xs text-gray-400">Six 8-bit registers that can be paired as BC, DE, and HL for 16-bit operations. HL is primarily used as a memory pointer (M).</p>
                  </div>
                  <div className="bg-[#121212] p-5 rounded-xl border border-[#1e1e1e]">
                    <h3 className="font-semibold text-white mb-2 text-sm">Stack Pointer (SP)</h3>
                    <p className="text-xs text-gray-400">A 16-bit register that points to the top of the stack in memory.</p>
                  </div>
                  <div className="bg-[#121212] p-5 rounded-xl border border-[#1e1e1e]">
                    <h3 className="font-semibold text-white mb-2 text-sm">Program Counter (PC)</h3>
                    <p className="text-xs text-gray-400">A 16-bit register holding the address of the next instruction to be executed.</p>
                  </div>
                </div>
              </section>

              {/* Flags */}
              <section>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-400" /> Flags Register
                </h2>
                <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#1a1a1a] border-b border-[#1e1e1e]">
                        <th className="px-4 py-3 font-semibold text-gray-300">Flag</th>
                        <th className="px-4 py-3 font-semibold text-gray-300">Name</th>
                        <th className="px-4 py-3 font-semibold text-gray-300">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e1e1e] text-gray-400">
                      <tr>
                        <td className="px-4 py-3 font-mono text-white">S</td>
                        <td className="px-4 py-3">Sign</td>
                        <td className="px-4 py-3 text-xs">Set if the result is negative (MSB is 1).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-white">Z</td>
                        <td className="px-4 py-3">Zero</td>
                        <td className="px-4 py-3 text-xs">Set if the result of an operation is 0.</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-white">AC</td>
                        <td className="px-4 py-3">Auxiliary Carry</td>
                        <td className="px-4 py-3 text-xs">Set if there's a carry from bit 3 to bit 4 (used for BCD).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-white">P</td>
                        <td className="px-4 py-3">Parity</td>
                        <td className="px-4 py-3 text-xs">Set if the result has an even number of 1s (even parity).</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-white">CY</td>
                        <td className="px-4 py-3">Carry</td>
                        <td className="px-4 py-3 text-xs">Set if there is a carry/borrow out of the MSB during addition/subtraction.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

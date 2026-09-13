'use client'

import SimulatorNav from '@/components/simulator-nav'
import { ChallengesSidebar } from '@/components/challenges-sidebar'
import { PlayCircle, Sparkles } from 'lucide-react'

export default function TutorialsPage() {
  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
      <SimulatorNav />

      <div className="flex flex-1 overflow-hidden">
        <ChallengesSidebar />

        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a] flex flex-col items-center justify-center">
          <div className="max-w-md mx-auto animate-in fade-in zoom-in duration-500 text-center">
            
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <PlayCircle className="w-10 h-10 text-blue-500" />
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">Tutorials Coming Soon</h1>
            <p className="text-gray-400 leading-relaxed mb-8">
              We are working hard to bring you comprehensive video tutorials, interactive walkthroughs, and step-by-step guides for mastering the 8085 Microprocessor.
            </p>
            
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full">
              Stay tuned! 🚀
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

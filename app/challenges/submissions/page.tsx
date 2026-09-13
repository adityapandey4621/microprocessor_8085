'use client'

import { useState, useEffect } from 'react'
import SimulatorNav from '@/components/simulator-nav'
import { ChallengesSidebar } from '@/components/challenges-sidebar'
import { Loader2, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/submissions')
      .then(r => r.json())
      .then(d => {
        setSubmissions(d.submissions || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a0a] flex flex-col font-sans text-gray-200">
      <SimulatorNav />

      <div className="flex flex-1 overflow-hidden">
        <ChallengesSidebar />

        <main className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">My Submissions</h1>
                <p className="text-sm text-gray-400">View your execution history and past attempts.</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-[#121212] rounded-xl border border-[#1e1e1e] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e1e1e] bg-[#0c0c0c]">
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider">CPU Cycles</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider text-right">Run Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e1e1e]">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading submissions...
                          </div>
                        </td>
                      </tr>
                    ) : submissions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 text-sm">
                          No submissions found. Start solving challenges!
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-[#1a1a1a] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {new Date(sub.createdAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {sub.status === 'SUCCESS' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md">
                                <XCircle className="w-3.5 h-3.5" /> Failed
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-400">
                            {sub.cycles} T-States
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-400">
                            {sub.executionTimeMs} ms
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}

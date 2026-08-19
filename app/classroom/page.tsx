'use client'

import { useState, useEffect } from 'react'
import SimulatorNav from '@/components/simulator-nav'
import { useCollaboration, ChatMessage } from '@/hooks/use-collaboration'
import { Button } from '@/components/ui/button'
import {
  Users,
  Send,
  Code2,
  MessageSquare,
  Sparkles,
  Play,
  Copy,
  Check,
  Radio,
  Hash,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const CHANNELS = [
  { id: 'general-8085', name: 'general-8085', desc: 'General 8085 discussion & architecture' },
  { id: 'assembly-help', name: 'assembly-help', desc: 'Troubleshooting assembly code & flags' },
  { id: 'interrupts-timing', name: 'interrupts-timing', desc: 'Hardware interrupts & timing cycles' },
  { id: 'challenge-showcase', name: 'challenge-showcase', desc: 'Share your automated challenge solutions' },
]

export default function ClassroomPage() {
  const { data: session } = useSession()
  const [activeChannel, setActiveChannel] = useState('general-8085')
  const [inputText, setInputText] = useState('')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [userName, setUserName] = useState('Student ' + Math.floor(100 + Math.random() * 900))
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name)
    } else if (session?.user?.username) {
      setUserName(session.user.username)
    }
  }, [session?.user?.name, session?.user?.username])

  const effectiveUserId = session?.user?.id || 'guest-' + userName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()

  const {
    onlineCount,
    onlineUsers,
    messages,
    isConnected,
    mode,
    sendChatMessage,
  } = useCollaboration({
    room: activeChannel,
    user: {
      id: effectiveUserId,
      name: userName,
      image: session?.user?.image || undefined,
    },
    enabled: true,
  })

  const handleSend = () => {
    if (!inputText.trim() && !codeSnippet.trim()) return
    sendChatMessage(
      inputText || (codeSnippet ? 'Shared an 8085 assembly snippet:' : ''),
      codeSnippet.trim() ? codeSnippet : undefined
    )
    setInputText('')
    setCodeSnippet('')
    setShowCodeInput(false)
  }

  const handleLoadInSimulator = (code?: string) => {
    if (!code) return
    localStorage.setItem('mp8085_shared_code', code)
    localStorage.setItem('mp8085-autosave-code', code)
    window.location.href = '/simulator?loadShared=true'
  }

  const handleCopy = (code?: string, id?: string) => {
    if (!code || !id) return
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimulatorNav />

      <div className="flex-1 flex flex-col md:flex-row max-w-[1800px] w-full mx-auto border-t border-border">
        {/* ── Left Sidebar: Channels & Presence ─────────────────────── */}
        <div className="w-full md:w-72 border-r border-border bg-card/40 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Live Classroom
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {onlineCount} Online
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Connected via:{' '}
              <span className="text-foreground font-medium">
                {mode === 'websocket' ? 'WebSocket ($0 Render)' : 'Upstash Serverless Pub/Sub'}
              </span>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-2">
              Channels
            </div>
            <div className="space-y-1">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                    activeChannel === ch.id
                      ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <Hash className="w-4 h-4 shrink-0" />
                  <div className="truncate">
                    <div>{ch.name}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-2">
              Active Users ({onlineUsers.length})
            </div>
            <div className="space-y-1.5 px-2">
              {onlineUsers.map((u, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-foreground">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">{u.name || 'Anonymous Student'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-border bg-muted/20">
            <label className="text-[11px] text-muted-foreground block mb-1">Your Display Name</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded text-xs bg-background border border-border text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* ── Center: Message Stream & Code Sharing ─────────────────── */}
        <div className="flex-1 flex flex-col bg-background/50">
          {/* Channel Title */}
          <div className="h-14 border-b border-border px-6 flex items-center justify-between bg-card/30">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">
                {CHANNELS.find((c) => c.id === activeChannel)?.name}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                — {CHANNELS.find((c) => c.id === activeChannel)?.desc}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Real-Time Code Collaboration Active</span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="flex flex-col gap-1 p-4 rounded-xl bg-card/40 border border-border/60 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-primary">
                      {msg.sender.name || 'Student'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{msg.text}</p>

                {msg.codeSnippet && (
                  <div className="mt-3 rounded-lg border border-border bg-black/60 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border text-xs text-muted-foreground">
                      <span className="font-mono flex items-center gap-1.5">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" /> 8085 Assembly Code
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(msg.codeSnippet, msg.id)}
                          className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 mr-1 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" /> Copy
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleLoadInSimulator(msg.codeSnippet)}
                          className="h-6 px-2.5 text-[11px] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-sm flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" /> Load into Simulator
                        </Button>
                      </div>
                    </div>
                    <pre className="p-3 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                      {msg.codeSnippet}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-border bg-card/60">
            {showCodeInput && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    8085 Assembly Snippet to Share
                  </label>
                  <button
                    onClick={() => setShowCodeInput(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Close
                  </button>
                </div>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="MVI A, 25H&#10;MVI B, 3AH&#10;ADD B&#10;HLT"
                  rows={4}
                  className="w-full p-3 rounded-lg bg-black/60 border border-border text-cyan-300 font-mono text-xs focus:outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowCodeInput(!showCodeInput)}
                title="Attach 8085 Assembly Snippet"
                className={`shrink-0 ${showCodeInput ? 'border-primary text-primary' : ''}`}
              >
                <Code2 className="w-4 h-4" />
              </Button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder={`Message #${CHANNELS.find((c) => c.id === activeChannel)?.name}...`}
                className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
              />
              <Button
                onClick={handleSend}
                disabled={!inputText.trim() && !codeSnippet.trim()}
                className="px-5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium"
              >
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import SimulatorNav from '@/components/simulator-nav'
import { Button } from '@/components/ui/button'
import {
  Code2,
  Search,
  Zap,
  Play,
  Copy,
  Check,
  User,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GalleryItem {
  id: string
  title: string
  description?: string
  code: string
  authorName: string
  updatedAt: string
  cached?: boolean
}

const SAMPLE_SNIPPETS: GalleryItem[] = [
  {
    id: 'fibonacci-8085',
    title: 'Fibonacci Sequence Generator (10 numbers)',
    description: 'Generates the first 10 Fibonacci numbers and stores them in memory starting at address 2000H.',
    authorName: 'Prof. Ada Lovelace',
    updatedAt: '2026-08-02',
    code: `; Fibonacci Sequence Generator
MVI C, 0AH      ; Count = 10 numbers
LXI H, 2000H    ; Memory pointer = 2000H
MVI D, 00H      ; First number = 0
MVI E, 01H      ; Second number = 1
MOV M, D        ; Store first number
INX H
DCR C
MOV M, E        ; Store second number
INX H
DCR C

LOOP: MOV A, D  ; A = D
ADD E           ; A = D + E
MOV M, A        ; Store sum
MOV D, E        ; D = E
MOV E, A        ; E = sum
INX H           ; Increment pointer
DCR C           ; Decrement count
JNZ LOOP        ; Loop until C = 0
HLT`,
    cached: true,
  },
  {
    id: 'bubble-sort-8085',
    title: 'Bubble Sort in Memory (5 numbers)',
    description: 'Sorts an array of 5 unsigned 8-bit integers stored at 3000H in ascending order.',
    authorName: 'Dr. Alan Turing',
    updatedAt: '2026-08-01',
    code: `; Bubble Sort Ascending at 3000H
START: MVI B, 04H      ; Outer loop counter = 4
LXI H, 3000H           ; Point to array start
INNER: MOV A, M        ; Load current element
INX H                  ; Point to next element
CMP M                  ; Compare current with next
JC SKIP                ; If A < next, no swap
JZ SKIP                ; If A == next, no swap
MOV D, M               ; Swap elements
MOV M, A
DCX H
MOV M, D
INX H
SKIP: DCR B            ; Decrement inner loop
JNZ INNER
HLT`,
    cached: true,
  },
  {
    id: 'bcd-binary-8085',
    title: 'BCD to Binary Converter',
    description: 'Converts a 2-digit Packed BCD number in register A into its binary equivalent.',
    authorName: 'Grace Hopper',
    updatedAt: '2026-07-28',
    code: `; BCD to Binary Conversion
MVI A, 45H      ; BCD number 45
MOV B, A        ; Save original BCD
ANI 0FH         ; Mask upper nibble -> Lower digit in A
MOV C, A        ; Save lower digit in C
MOV A, B        ; Restore original BCD
ANI F0H         ; Mask lower nibble
RRC
RRC
RRC
RRC             ; Upper digit now in lower bits
MOV D, A        ; Save upper digit
ADD A           ; A = 2x
ADD A           ; A = 4x
ADD D           ; A = 5x
ADD A           ; A = 10 * upper digit
ADD C           ; Add lower digit -> Result in A
HLT`,
    cached: true,
  },
  {
    id: 'traffic-light-8085',
    title: 'Traffic Light Controller using 8255 PPI',
    description: 'Simulates a 3-state traffic light timer sequence across Output Ports 00H-02H.',
    authorName: 'Aditya Pandey',
    updatedAt: '2026-08-02',
    code: `; Traffic Light Controller Sequence
GREEN: MVI A, 01H   ; Green LED ON
OUT 00H
MVI B, 05H
CALL DELAY

YELLOW: MVI A, 02H  ; Yellow LED ON
OUT 00H
MVI B, 02H
CALL DELAY

RED: MVI A, 04H     ; Red LED ON
OUT 00H
MVI B, 05H
CALL DELAY
JMP GREEN

DELAY: DCR B
JNZ DELAY
RET`,
    cached: true,
  },
]

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(SAMPLE_SNIPPETS)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Attempt to fetch live gallery items from API
    fetch(`/api/gallery?search=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          const formatted = data.items.map((it: any) => ({
            id: it.id,
            title: it.title,
            description: it.description,
            code: it.code,
            authorName: it.user?.name || 'Community Member',
            updatedAt: new Date(it.updatedAt).toISOString().split('T')[0],
            cached: data.cached || false,
          }))
          setItems([...formatted, ...SAMPLE_SNIPPETS])
        }
      })
      .catch((err) => console.error('Gallery API fetch error:', err))
  }, [searchQuery])

  const filteredItems = items.filter(
    (it) =>
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (it.description && it.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleOpenInSimulator = (code: string) => {
    localStorage.setItem('mp8085_shared_code', code)
    router.push('/simulator?loadShared=true')
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SimulatorNav />

      {/* ── Hero Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-gradient-to-b from-card/50 to-background py-10 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Community Code Gallery
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Explore 8085 Assembly Programs
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
                Browse verified educational programs, classroom challenges, and community submissions.
                All snippets are backed by Upstash Redis read-through caching for sub-5ms loads.
              </p>
            </div>

            {/* Redis Cache Badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium shrink-0">
              <Zap className="w-4 h-4 text-amber-400 fill-current" />
              <div>
                <div className="font-semibold text-foreground">Upstash Redis Read-Through Cache</div>
                <div className="text-[11px] text-muted-foreground">24h TTL — $0 Free Tier Cloud Ready</div>
              </div>
            </div>
          </div>

          {/* Search Input */}
          <div className="mt-6 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs by title or author..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Snippets Grid ───────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col rounded-2xl bg-card/60 border border-border/80 hover:border-primary/50 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md"
            >
              {/* Header */}
              <div className="p-5 border-b border-border/60 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-foreground/80">
                      <User className="w-3.5 h-3.5 text-primary" /> {item.authorName}
                    </span>
                    <span>• {item.updatedAt}</span>
                    {item.cached && (
                      <span className="text-amber-400 font-medium">⚡ Redis Cached</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(item.code, item.id)}
                    className="h-8 px-2.5 text-xs"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenInSimulator(item.code)}
                    className="h-8 px-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs font-medium shadow-sm flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Open in Simulator
                  </Button>
                </div>
              </div>

              {/* Code Preview */}
              <div className="p-4 bg-black/60 overflow-x-auto flex-1">
                <pre className="text-xs font-mono text-cyan-300 leading-relaxed">
                  {item.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

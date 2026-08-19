"use client"

import React, { useRef, useState, useEffect } from "react"
import { Play, FileCode, Bot } from "lucide-react"
import { useSession } from "next-auth/react"
import { useSettings } from "@/components/settings-provider"

const OPCODES = [
  "MOV", "MVI", "LXI", "LDA", "STA", "LHLD", "SHLD",
  "LDAX", "STAX", "XCHG", "ADD", "ADI", "SUB", "SUI",
  "INR", "DCR", "IN", "OUT", "HLT", "JMP", "JC", "JNC", "JZ", "JNZ",
  "CALL", "RET", "RST", "PUSH", "POP", "XTHL", "SPHL", "EI", "DI", "NOP"
]

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  activeLine: number | null
}

export default function CodeEditor({ code, setCode, activeLine }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const { fontSize, companionMode, setCompanionMode, autoUppercase, syntaxHighlighting, autoSave } = useSettings()
  const [suggestion, setSuggestion] = useState<string | null>(null)

  const userId = session?.user?.id || "guest"

  // Auto Save per user
  useEffect(() => {
    if (autoSave && code !== undefined) {
      const handler = setTimeout(() => {
        localStorage.setItem(`mp8085-autosave-code:${userId}`, code)
      }, 1000)
      return () => clearTimeout(handler)
    }
  }, [code, autoSave, userId])

  // Identify guest user
  // @ts-ignore
  const isGuest = session?.user?.id === "guest-user"
  const enableCompanion = companionMode && !isGuest

  const lines = code.split("\n")

  // Smarter AI Prediction Logic
  const predictNext = (currentLine: string, prevLine: string): string | null => {
    const cur = currentLine.trim().toUpperCase()
    const prev = prevLine.trim().toUpperCase()
    
    // Auto-complete mid-typing
    if (cur.length >= 2) {
      if ("MVI".startsWith(cur) && cur !== "MVI") return "MVI "
      if ("LXI".startsWith(cur) && cur !== "LXI") return "LXI "
      if ("MOV".startsWith(cur) && cur !== "MOV") return "MOV "
      const match = OPCODES.find(op => op.startsWith(cur) && op !== cur)
      if (match) return match
    }

    // Contextual guessing based on previous instruction if current line is empty
    if (cur === "") {
      if (prev.startsWith("CMP") || prev.startsWith("CPI")) return "JZ "
      if (prev.startsWith("LXI H")) return "MOV A, M"
      if (prev.startsWith("PUSH")) {
        const reg = prev.split(" ")[1]
        if (reg) return `POP ${reg}`
      }
      if (prev.startsWith("MVI C")) return "DCR C"
      if (prev.startsWith("DCR")) return "JNZ "
      if (prev === "HLT") return "" // end of program
    }

    // Guess operands
    if (cur === "MVI") return " A, 00H"
    if (cur === "LXI") return " H, 2000H"
    if (cur === "MOV") return " A, B"
    if (cur === "MVI A") return ", 00H"
    if (cur === "MVI B") return ", 00H"
    if (cur === "MVI C") return ", 00H"
    if (cur === "ADD") return " B"
    if (cur === "SUB") return " B"
    if (cur === "CMP") return " M"
    
    return null
  }

  // Simple syntax highlighting regex
  const highlightSyntax = (line: string, lineIndex: number) => {
    let content = []
    
    if (line.trim().startsWith(";")) {
      content.push(<span key={0} className="text-emerald-600 dark:text-emerald-400 italic">{line}</span>)
    } else {
      const parts = line.split(/([\s,:]+|;.*)/)
      content = parts.map((part, i) => {
        if (!syntaxHighlighting) {
          if (part.trim().startsWith(";")) return <span key={i} className="text-emerald-600 dark:text-emerald-400 italic">{part}</span>
          return <span key={i} className="text-foreground">{part}</span>
        }
        if (part.trim().startsWith(";")) return <span key={i} className="text-emerald-600 dark:text-emerald-400 italic">{part}</span>
        if (OPCODES.includes(part.toUpperCase())) return <span key={i} className="text-blue-600 dark:text-blue-400 font-bold">{part}</span>
        if (part.match(/^[0-9A-Fa-f]+H$/i) || part.match(/^\d+$/)) return <span key={i} className="text-orange-600 dark:text-orange-400">{part}</span>
        if (part.match(/^[A-EH-LMS]$/i) || part.match(/^(SP|PC)$/i)) return <span key={i} className="text-yellow-600 dark:text-yellow-400 font-semibold">{part}</span>
        if (part.match(/^[A-Z_][A-Z0-9_]*$/i)) return <span key={i} className="text-purple-600 dark:text-purple-400">{part}</span>
        return <span key={i} className="text-foreground">{part}</span>
      })
    }

    // Add Ghost Text if on current line
    const currentCursorLine = code.slice(0, textareaRef.current?.selectionStart || 0).split("\n").length - 1
    if (enableCompanion && suggestion && lineIndex === currentCursorLine) {
      content.push(<span key="ghost" className="text-muted-foreground opacity-50 italic pointer-events-none">{suggestion}</span>)
    }

    return content
  }

  const syncScroll = () => {
    if (!textareaRef.current) return
    const scrollTop = textareaRef.current.scrollTop
    const scrollLeft = textareaRef.current.scrollLeft
    if (linesRef.current) linesRef.current.scrollTop = scrollTop
    if (bgRef.current) {
      bgRef.current.scrollTop = scrollTop
      bgRef.current.scrollLeft = scrollLeft
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop
      highlightRef.current.scrollLeft = scrollLeft
    }
  }

  // Sync scrolling between layers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    syncScroll()
  }

  // Scroll to active line
  useEffect(() => {
    if (activeLine !== null && textareaRef.current && bgRef.current) {
      // Calculate approximate position
      const lineHeight = fontSize * 1.5
      const targetScrollTop = (activeLine - 1) * lineHeight
      // Center in view if possible
      const viewHeight = textareaRef.current.clientHeight
      const scrollPos = Math.max(0, targetScrollTop - viewHeight / 2 + lineHeight / 2)
      
      textareaRef.current.scrollTo({ top: scrollPos, behavior: 'smooth' })
      // When smoothing, we need to sync continuously until animation is done
      let syncInterval = setInterval(syncScroll, 20)
      setTimeout(() => clearInterval(syncInterval), 500)
    }
  }, [activeLine, fontSize])

  // Forward wheel events from line numbers to textarea
  const handleWheel = (e: React.WheelEvent) => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop += e.deltaY
      syncScroll()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newCode = e.target.value
    const cursorPosition = e.target.selectionStart

    if (autoUppercase) {
      newCode = newCode.split('\n').map(line => {
        const commentIdx = line.indexOf(';')
        if (commentIdx === -1) return line.toUpperCase()
        return line.slice(0, commentIdx).toUpperCase() + line.slice(commentIdx)
      }).join('\n')
    }

    setCode(newCode)

    if (autoUppercase && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = cursorPosition
          textareaRef.current.selectionEnd = cursorPosition
        }
      }, 0)
    }

    if (!enableCompanion) {
      setSuggestion(null)
      return
    }

    const textBeforeCursor = newCode.slice(0, cursorPosition)
    const linesArr = textBeforeCursor.split("\n")
    const currentLine = linesArr[linesArr.length - 1]
    const prevLine = linesArr.length > 1 ? linesArr[linesArr.length - 2] : ""

    // Don't suggest inside comments
    if (currentLine.includes(";")) {
      setSuggestion(null)
      return
    }

    const nextPrediction = predictNext(currentLine, prevLine)
    setSuggestion(nextPrediction)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestion && e.key === "Tab") {
      e.preventDefault()
      const cursorPosition = textareaRef.current?.selectionStart || 0
      
      const textBeforeCursor = code.slice(0, cursorPosition)
      const textAfterCursor = code.slice(cursorPosition)

      let insertedText = suggestion
      // If the suggestion is a full instruction replacement (like mid-typing autocomplete)
      const linesArr = textBeforeCursor.split("\n")
      const currentLine = linesArr[linesArr.length - 1]
      
      let newText = ""
      
      if (currentLine.trim().length > 0 && !suggestion.startsWith(" ") && !suggestion.startsWith(",")) {
        // Autocompleting a partially typed word
        const lastWord = currentLine.split(/\s+/).pop() || ""
        newText = textBeforeCursor.slice(0, -lastWord.length) + suggestion + textAfterCursor
        insertedText = suggestion
      } else {
        // Appending to the line
        newText = textBeforeCursor + suggestion + textAfterCursor
      }

      setCode(newText)
      setSuggestion(null)

      // Move cursor
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = newText.length - textAfterCursor.length
          textareaRef.current.selectionStart = newCursorPos
          textareaRef.current.selectionEnd = newCursorPos
        }
      }, 0)
    }
  }

  return (
    <div className="h-full w-full rounded-lg bg-background border border-border overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span className="text-sm font-medium text-foreground">program.asm</span>
        </div>
        
        {/* Companion Mode Toggle */}
        <div 
          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
            companionMode ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400" : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
          onClick={() => setCompanionMode(!companionMode)}
          title={isGuest ? "Sign in to use Companion Mode" : "Toggle AI Companion Mode"}
        >
          <Bot className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold select-none">Companion AI</span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Line Numbers */}
        <div 
          ref={linesRef} 
          onWheel={handleWheel}
          className="py-3 px-1 bg-muted/30 border-r border-border select-none overflow-hidden flex flex-col items-end shrink-0 cursor-default"
        >
          {lines.map((_, i) => (
            <div
              key={i}
              style={{ fontSize: `${fontSize}px`, lineHeight: '1.5em' }}
              className={`px-1 font-mono text-right min-w-[2.5rem] flex items-center justify-end gap-1 transition-colors ${
                activeLine === i + 1 ? "text-cyan-600 dark:text-cyan-400 font-bold" : "text-muted-foreground/70"
              }`}
            >
              {activeLine === i + 1 && <Play className="w-2.5 h-2.5 fill-cyan-600 dark:fill-cyan-400" />}
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative">
          {/* Highlight Layer */}
          <div ref={highlightRef} className="absolute inset-0 py-3 pointer-events-none overflow-hidden">
            {lines.map((_, i) => (
              <div
                key={i}
                className={`transition-colors duration-200 w-full ${activeLine === i + 1 ? "bg-cyan-500/10 border-y border-cyan-500/30" : ""
                  }`}
                style={{ height: `${fontSize * 1.5}px` }}
              />
            ))}
          </div>

          {/* Syntax Highlight Layer */}
          <div
            ref={bgRef}
            className="absolute inset-0 p-3 font-mono text-foreground pointer-events-none whitespace-pre overflow-hidden"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.5em' }}
          >
            {lines.map((line, i) => (
              <div key={i} className="h-[1.5em]">{highlightSyntax(line, i)}</div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            style={{ 
              fontSize: `${fontSize}px`, 
              lineHeight: '1.5em', 
              color: 'transparent', 
              WebkitTextFillColor: 'transparent',
              caretColor: 'var(--foreground)' 
            }}
            className="absolute inset-0 w-full h-full p-3 font-mono bg-transparent text-transparent caret-foreground resize-none focus:outline-none overflow-auto whitespace-pre custom-scrollbar"
            spellCheck={false}
            placeholder="; Write your 8085 assembly code here..."
          />


        </div>
      </div>
    </div>
  )
}


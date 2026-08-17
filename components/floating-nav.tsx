"use client"

import { useState } from "react"
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Menu, X, Sparkles, Terminal, BookOpen, Github, Play } from "lucide-react"

export default function FloatingNav() {
  const { scrollY } = useScroll()
  const [glass, setGlass] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setGlass(true)
    } else {
      setGlass(false)
    }
  })

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        glass 
          ? "bg-[#050508]/85 backdrop-blur-2xl border-b border-amber-500/20 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]" 
          : "bg-gradient-to-b from-black/80 via-black/40 to-transparent border-b-0 py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Original Logo from Image 1 as requested */}
        <Link href="/" className="flex items-center gap-3 group">
          <img 
            src="/latch-logo.svg" 
            alt="LATCH Logo" 
            className="h-6 md:h-7 w-auto object-contain group-hover:scale-105 transition-transform" 
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full px-5 py-1.5 backdrop-blur-md">
          <button 
            onClick={() => scrollToSection("overview")}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-all"
          >
            Overview
          </button>
          
          <Link 
            href="/simulator" 
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Simulator
          </Link>

          <button 
            onClick={() => scrollToSection("debugger")}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition-all"
          >
            Debugger
          </button>

          <button 
            onClick={() => scrollToSection("ai-features")}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider text-amber-300 hover:text-amber-400 hover:bg-amber-500/10 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI Assistant
          </button>

          <button 
            onClick={() => scrollToSection("features")}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider text-slate-300 hover:text-amber-400 hover:bg-white/5 transition-all"
          >
            Features
          </button>

          <Link 
            href="/documentation" 
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            Documentation
          </Link>

          <a 
            href="https://github.com/adityapandey4621/mp8085-compiler" 
            target="_blank" 
            rel="noreferrer" 
            className="px-3.5 py-1.5 rounded-full text-xs font-mono tracking-wider text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
        </nav>

        {/* CTA Launch Button */}
        <div className="flex items-center gap-4">
          <Link 
            href="/simulator"
            className="btn-chrome px-5 py-2 rounded-full text-xs font-semibold font-mono tracking-wider flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(200,155,60,0.25)] border-amber-500/40 text-amber-300"
          >
            <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Launch Studio
          </Link>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg bg-white/5 border border-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#0a0a10]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 overflow-hidden flex flex-col gap-4 font-mono text-sm"
          >
            <button 
              onClick={() => scrollToSection("overview")}
              className="text-left py-2 text-slate-300 hover:text-amber-400 transition-colors border-b border-white/5"
            >
              Overview
            </button>
            <Link 
              href="/simulator" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-cyan-400 hover:text-cyan-300 transition-colors border-b border-white/5 flex items-center justify-between"
            >
              <span>Simulator</span>
              <Terminal className="w-4 h-4" />
            </Link>
            <button 
              onClick={() => scrollToSection("debugger")}
              className="text-left py-2 text-slate-300 hover:text-cyan-400 transition-colors border-b border-white/5"
            >
              Debugger
            </button>
            <button 
              onClick={() => scrollToSection("ai-features")}
              className="text-left py-2 text-purple-400 hover:text-purple-300 transition-colors border-b border-white/5 flex items-center justify-between"
            >
              <span>AI Assistant</span>
              <Sparkles className="w-4 h-4" />
            </button>
            <button 
              onClick={() => scrollToSection("features")}
              className="text-left py-2 text-slate-300 hover:text-amber-400 transition-colors border-b border-white/5"
            >
              Features
            </button>
            <Link 
              href="/docs" 
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-slate-300 hover:text-white transition-colors border-b border-white/5"
            >
              Documentation
            </Link>
            <a 
              href="https://github.com/adityapandey4621/mp8085-compiler" 
              target="_blank" 
              rel="noreferrer" 
              className="py-2 text-slate-300 hover:text-white transition-colors flex items-center justify-between"
            >
              <span>GitHub</span>
              <Github className="w-4 h-4" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

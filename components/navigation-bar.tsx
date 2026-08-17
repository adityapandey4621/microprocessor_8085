"use client"

import { Cpu, Github, Settings, HelpCircle } from "lucide-react"

export default function NavigationBar() {
  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50 animate-slide-down">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/latch-logo.svg" alt="LATCH Logo" className="h-6" />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { name: "Simulator", href: "/simulator" },
            { name: "Classroom", href: "/classroom" },
            { name: "Gallery", href: "/gallery" },
            { name: "Challenges", href: "/challenges" },
            { name: "Documentation", href: "/documentation" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-[#00F5FF] transition-all duration-200 hover:scale-105 relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00F5FF] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-[#1a1a2e] text-muted-foreground hover:text-[#4A90E2] transition-all duration-200 hover:scale-110 active:scale-95">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#1a1a2e] text-muted-foreground hover:text-[#4A90E2] transition-all duration-200 hover:scale-110 active:scale-95">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-[#1a1a2e] text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95">
            <Github className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  )
}


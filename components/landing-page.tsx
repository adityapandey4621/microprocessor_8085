"use client"

import { useRef } from "react"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform } from "framer-motion"
import Link from "next/link"
import SequenceCanvas from "./sequence-canvas"
import SmoothScroll from "./smooth-scroll"
import FloatingNav from "./floating-nav"
import { 
  SectionCinematicIntro,
  SectionCinematicTextWall,
  SectionAIFeatures,
  SectionCinematicStudio,
  SectionCinematicFeatures,
  SectionOrbitalTimeline,
  SectionCinematicShowcase
} from "./sections/sections"
import CinematicFooter from "./cinematic-footer"
import { FlowButton } from "./ui/flow-button"

const InteractiveBackground = dynamic(() => import("./3d/interactive-background"), { ssr: false, loading: () => null })

export default function LandingPage() {
  const animationContainerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: animationProgress } = useScroll({
    target: animationContainerRef,
    offset: ["start start", "end end"]
  })

  // Global scroll for smooth hero text fade & parallax motion
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return (
    <SmoothScroll>
      <div className="relative min-h-screen text-white font-sans selection:bg-amber-500/30 selection:text-amber-300 bg-transparent">
        <InteractiveBackground />
        
        <FloatingNav />
        
        {/* Hero Section with Sticky Background Animation */}
        <div ref={animationContainerRef} className="relative h-[160vh] z-0">
          <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Background 3D Sequence Canvas */}
            <SequenceCanvas progress={animationProgress} />
            
            {/* Hero Overlay Text (Visible Immediately on Load at y=0) */}
            <motion.div 
              style={{ y: heroY, opacity: heroOpacity }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto pointer-events-auto"
            >
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-6 drop-shadow-2xl font-space"
              >
                Understand <br />
                <span className="text-chrome-dynamic font-extrabold">
                  Every Cycle.
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-lg md:text-2xl text-slate-200 font-light max-w-2xl mx-auto drop-shadow-md mb-10 font-sans"
              >
                The Next-Generation Intel 8085 Microprocessor Platform with Built-in AI.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Link href="/simulator">
                  <FlowButton text="Launch MP8085 Studio" className="bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/10 text-white border-amber-500/40 hover:border-amber-400 shadow-[0_0_30px_rgba(200,155,60,0.3)]" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="relative z-10 bg-transparent flex flex-col items-center overflow-hidden w-full">
          
          {/* Section 1: Overview */}
          <SectionCinematicIntro />
          
          {/* Section 2: Chrome Text Wall */}
          <SectionCinematicTextWall />
          
          {/* Section 3: AI Assistant Deep Dive */}
          <SectionAIFeatures />
          
          {/* Section 4: Studio Debugger Showcase */}
          <SectionCinematicStudio />

          {/* Section 5: Features Capabilities Word Cloud */}
          <SectionCinematicFeatures />

          {/* Section 6: Orbital Roadmap Timeline */}
          <SectionOrbitalTimeline />

          {/* Final Call To Action */}
          <div className="w-full bg-transparent border-t border-white/10">
            <div className="min-h-[55vh] flex flex-col items-center justify-center text-center px-6 w-full max-w-5xl mx-auto py-28">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-7xl font-bold tracking-tight mb-12 font-syne uppercase text-chrome-dynamic"
              >
                Master Every Cycle.
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center gap-6"
              >
                <Link href="/simulator">
                  <FlowButton text="Launch MP8085 Studio" className="bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-white border-amber-500/40 hover:border-amber-400" />
                </Link>
                <Link href="/documentation" className="hover:opacity-90">
                  <FlowButton text="Explore Documentation" className="bg-white/5 text-slate-200 border-white/20 hover:text-white hover:border-white/50" />
                </Link>
              </motion.div>
            </div>
          </div>
          
          {/* Interactive 3D Footer */}
          <CinematicFooter />
        </div>
      </div>
    </SmoothScroll>
  )
}

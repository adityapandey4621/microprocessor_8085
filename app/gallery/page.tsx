'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SimulatorNav from '@/components/simulator-nav'
import { Button } from '@/components/ui/button'
import { Play, Copy, Check, User, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { BUILTIN_GALLERY_ITEMS, GalleryItem } from '@/lib/builtin-gallery'

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

// CapCut style easing: starts fast, then glides slowly to the end (easeOutQuint)
const capcutEase = [0.22, 1, 0.36, 1];

const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
    rotateY: direction > 0 ? 15 : -15,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    rotateY: 0,
    boxShadow: "0px 10px 40px -10px rgba(255, 255, 255, 0.1)"
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
    rotateY: direction < 0 ? 15 : -15,
  })
};

const innerVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { delay: 0.1, duration: 0.6, ease: capcutEase }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    transition: { duration: 0.3 }
  })
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(BUILTIN_GALLERY_ITEMS)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Carousel state
  const [[page, direction], setPage] = useState([0, 0]);

  // Wrap around index
  const itemIndex = items.length > 0 ? ((page % items.length) + items.length) % items.length : 0;
  const currentItem = items[itemIndex];

  useEffect(() => {
    // Fetch live gallery items from API
    fetch(`/api/gallery?search=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.items && data.items.length > 0) {
          setItems(data.items)
          setPage([0, 0]) // Reset to first item on search
        } else {
          setItems(BUILTIN_GALLERY_ITEMS)
        }
      })
      .catch((err) => {
        console.error('Gallery API fetch error, using system items:', err)
        setItems(BUILTIN_GALLERY_ITEMS)
      })
  }, [searchQuery])

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleOpenInSimulator = (code: string) => {
    localStorage.setItem('mp8085_shared_code', code)
    localStorage.setItem('mp8085-autosave-code', code)
    window.location.href = '/simulator?loadShared=true'
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden" style={{ perspective: 1000 }}>
      <SimulatorNav />

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-8">
        
        {/* Minimal Search Bar at top */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-10">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary shadow-sm"
            />
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative w-full max-w-3xl h-[70vh] md:h-[600px] flex items-center justify-center mt-10">
          
          {items.length > 0 ? (
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={page}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", ease: capcutEase, duration: 0.8 },
                  opacity: { duration: 0.4 },
                  scale: { type: "tween", ease: capcutEase, duration: 0.8 },
                  rotateY: { type: "tween", ease: capcutEase, duration: 0.8 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                className="absolute w-full h-full flex flex-col rounded-xl bg-card border border-border overflow-hidden cursor-grab active:cursor-grabbing transform-gpu"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Inner stagger layer */}
                <motion.div 
                  className="flex flex-col w-full h-full"
                  variants={innerVariants}
                  custom={direction}
                >
                  {/* Card Header (Grey Metallic theme) */}
                  <div className="p-5 md:p-6 border-b border-border bg-muted/30 flex flex-col gap-2 pointer-events-none">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl md:text-2xl font-bold text-foreground">
                        {currentItem.title}
                      </h2>
                      <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded-md border border-border">
                        {itemIndex + 1} / {items.length}
                      </span>
                    </div>
                    {currentItem.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {currentItem.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 pointer-events-auto">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-4 h-4 text-primary" />
                        <span>{currentItem.authorName}</span>
                      </div>
                      
                      <div className="flex items-center gap-2" onPointerDownCapture={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => { e.preventDefault(); handleCopy(currentItem.code, currentItem.id); }}
                          className="h-8 text-xs bg-background"
                        >
                          {copiedId === currentItem.id ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => { e.preventDefault(); handleOpenInSimulator(currentItem.code); }}
                          className="h-8 text-xs flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" /> Apply to IDE
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Code Preview */}
                  <div 
                    className="flex-1 p-5 md:p-6 bg-background/50 overflow-y-auto"
                    onPointerDownCapture={(e) => e.stopPropagation()} 
                  >
                    <pre className="text-sm font-mono text-cyan-300 leading-relaxed">
                      {currentItem.code}
                    </pre>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-muted-foreground">No programs found.</div>
          )}

          {/* Navigation Arrows (Desktop) */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-16 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 bg-card border border-border shadow-sm hover:bg-muted text-muted-foreground"
              onClick={() => paginate(-1)}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-16 hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 bg-card border border-border shadow-sm hover:bg-muted text-muted-foreground"
              onClick={() => paginate(1)}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile helper text */}
        <p className="mt-8 text-sm text-muted-foreground flex items-center gap-2 md:hidden">
          Swipe left or right to explore
        </p>
      </div>
    </div>
  )
}

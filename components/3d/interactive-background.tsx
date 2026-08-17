"use client"

export default function InteractiveBackground() {
  return (
    <div 
      className="fixed inset-0 z-0 pointer-events-none bg-[#090b10] overflow-hidden"
    >
      {/* 1. Seamless Full-bleed Tech Grid */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(245, 158, 11, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245, 158, 11, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
        }}
      />

      {/* 2. Top-Center Soft Ambient Accent */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] pointer-events-none opacity-25"
        style={{
          background: `radial-gradient(ellipse at top, rgba(245, 158, 11, 0.15) 0%, rgba(6, 182, 212, 0.05) 50%, transparent 80%)`,
        }}
      />

      {/* 3. Bottom Vignette to transition smoothly into footer */}
      <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-[#090b10] via-[#090b10]/80 to-transparent pointer-events-none" />
    </div>
  )
}

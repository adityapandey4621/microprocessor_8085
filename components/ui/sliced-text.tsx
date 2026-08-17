"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface SlicedTextProps {
  text: string;
  className?: string;
}

export function SlicedText({ text, className = "" }: SlicedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topHalfRef = useRef<HTMLDivElement>(null);
  const bottomHalfRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 3,
        defaults: { ease: "power2.inOut" }
      });

      // The glitch sequence
      tl.to([topHalfRef.current, bottomHalfRef.current], {
        x: (index) => (index === 0 ? -15 : 15),
        duration: 0.15,
      })
      .to(backgroundRef.current, {
        opacity: 1,
        x: 5,
        duration: 0.1,
      }, "<")
      .to([topHalfRef.current, bottomHalfRef.current], {
        x: (index) => (index === 0 ? 5 : -5),
        duration: 0.1,
      })
      .to(backgroundRef.current, {
        x: -5,
        duration: 0.1,
      }, "<")
      .to([topHalfRef.current, bottomHalfRef.current, backgroundRef.current], {
        x: 0,
        opacity: 0, // hide background again
        duration: 0.15,
      })
      // Subtle hovering/shifting
      .to(topHalfRef.current, { x: -2, duration: 2, ease: "sine.inOut" }, "+=0.5")
      .to(bottomHalfRef.current, { x: 2, duration: 2, ease: "sine.inOut" }, "<")
      .to([topHalfRef.current, bottomHalfRef.current], { x: 0, duration: 1, ease: "power2.out" });

      // Add a hover effect
      if (containerRef.current) {
        containerRef.current.addEventListener('mouseenter', () => {
          gsap.to(topHalfRef.current, { x: -10, duration: 0.3, ease: "power3.out" });
          gsap.to(bottomHalfRef.current, { x: 10, duration: 0.3, ease: "power3.out" });
          gsap.to(backgroundRef.current, { opacity: 1, duration: 0.2 });
        });
        
        containerRef.current.addEventListener('mouseleave', () => {
          gsap.to(topHalfRef.current, { x: 0, duration: 0.5, ease: "power3.out" });
          gsap.to(bottomHalfRef.current, { x: 0, duration: 0.5, ease: "power3.out" });
          gsap.to(backgroundRef.current, { opacity: 0, duration: 0.4 });
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`relative inline-block select-none ${className}`}
    >
      {/* Background layer (blue/purple) */}
      <div 
        ref={backgroundRef}
        className="absolute top-0 left-0 w-full h-full text-blue-600 opacity-0 font-bold"
        style={{ zIndex: 0 }}
      >
        {text}
      </div>

      {/* Top half */}
      <div 
        ref={topHalfRef}
        className="absolute top-0 left-0 w-full h-full text-white font-bold"
        style={{ 
          clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)",
          zIndex: 2
        }}
      >
        {text}
      </div>

      {/* Bottom half */}
      <div 
        ref={bottomHalfRef}
        className="relative text-white font-bold"
        style={{ 
          clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)",
          zIndex: 1
        }}
      >
        {text}
      </div>
    </div>
  );
}

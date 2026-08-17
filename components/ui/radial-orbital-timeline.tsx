"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Link as LinkIcon, Zap, X, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const [isRotating, setIsRotating] = useState<boolean>(true);

  // Orbit Radius
  const ORBIT_RADIUS = 240;

  const handleContainerClick = () => {
    setActiveNodeId(null);
    setIsRotating(true);
  };

  const toggleItem = (id: number) => {
    if (activeNodeId === id) {
      setActiveNodeId(null);
      setIsRotating(true);
    } else {
      setActiveNodeId(id);
      setIsRotating(false);
    }
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-emerald-300 bg-emerald-500/10 border-emerald-500/30";
      case "in-progress":
        return "text-cyan-300 bg-cyan-500/10 border-cyan-500/30";
      case "pending":
        return "text-amber-300 bg-amber-500/10 border-amber-500/30";
      default:
        return "text-slate-300 bg-white/5 border-white/10";
    }
  };

  const activeItem = timelineData.find((item) => item.id === activeNodeId);

  return (
    <div
      className="w-full h-full min-h-[680px] flex flex-col items-center justify-center bg-transparent relative select-none"
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-[620px] flex items-center justify-center">
        
        {/* Center Glowing Core - Refined Enterprise Microprocessor Badge */}
        <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 via-slate-900 to-cyan-500/20 border border-amber-500/30 flex flex-col items-center justify-center z-10 shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-md">
          <div className="absolute w-32 h-32 rounded-full border border-amber-500/20 animate-ping opacity-30 pointer-events-none" />
          <Cpu className="w-7 h-7 text-amber-400 mb-1" />
          <span className="text-[9px] font-mono font-bold tracking-widest text-amber-300 uppercase">8085 CORE</span>
        </div>

        {/* Orbit Path Ring */}
        <div className="absolute w-[480px] h-[480px] rounded-full border border-amber-500/20 border-dashed opacity-60 pointer-events-none" />

        {/* Revolving Orbit Container */}
        <motion.div
          className="absolute w-full h-full flex items-center justify-center pointer-events-none"
          animate={{ rotate: isRotating ? 360 : 0 }}
          transition={{
            rotate: {
              repeat: Infinity,
              duration: 50,
              ease: "linear",
            },
          }}
        >
          {timelineData.map((item, index) => {
            const isActive = activeNodeId === item.id;
            const isRelated = isRelatedToActive(item.id);
            const Icon = item.icon;

            const angle = (index / timelineData.length) * 360;
            const radian = (angle * Math.PI) / 180;
            const x = ORBIT_RADIUS * Math.cos(radian);
            const y = ORBIT_RADIUS * Math.sin(radian);

            return (
              <div
                key={item.id}
                className="absolute pointer-events-auto transition-all duration-300 cursor-pointer z-20"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Counter-Rotating Container to keep Icons & Text Upright */}
                <motion.div
                  className="relative flex flex-col items-center justify-center"
                  animate={{ rotate: isRotating ? -360 : 0 }}
                  transition={{
                    rotate: {
                      repeat: Infinity,
                      duration: 50,
                      ease: "linear",
                    },
                  }}
                >
                  {/* Energy Aura */}
                  <div
                    className={`absolute rounded-full -inset-2 transition-all duration-500 pointer-events-none ${
                      isActive ? "opacity-100 scale-125" : "opacity-30"
                    }`}
                    style={{
                      background: `radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)`,
                    }}
                  />

                  {/* Node Button */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-300 transform border-2
                      ${
                        isActive
                          ? "bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.8)] scale-110 z-30"
                          : isRelated
                          ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-pulse z-20"
                          : "bg-[#0f131c] text-slate-200 border-amber-500/30 hover:border-amber-400 hover:text-amber-300 hover:scale-105 shadow-lg"
                      }
                    `}
                  >
                    {/* @ts-ignore */}
                    <Icon size={18} />
                  </div>

                  {/* Node Title */}
                  <div
                    className={`
                      mt-2 whitespace-nowrap text-[10px] font-mono font-bold tracking-widest uppercase
                      px-2.5 py-0.5 rounded-full transition-all duration-300
                      ${
                        isActive
                          ? "text-amber-300 bg-amber-500/20 border border-amber-500/40 shadow-lg"
                          : "text-slate-300 bg-slate-950/80 border border-white/10"
                      }
                    `}
                  >
                    {item.title}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Clean, Non-Clipping Detail Card Overlay (Positioned outside orbit rotation) */}
        <AnimatePresence>
          {activeItem && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-[#0f131c]/95 backdrop-blur-2xl border border-amber-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex justify-between items-center">
                    <Badge
                      className={`px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest border ${getStatusStyles(
                        activeItem.status
                      )}`}
                    >
                      {activeItem.status === "completed"
                        ? "COMPLETE"
                        : activeItem.status === "in-progress"
                        ? "IN PROGRESS"
                        : "PENDING"}
                    </Badge>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
                        {activeItem.date}
                      </span>
                      <button
                        onClick={handleContainerClick}
                        className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2 font-space font-bold uppercase tracking-wider text-amber-400">
                    {activeItem.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-4 text-xs font-sans text-slate-300 leading-relaxed">
                  <p>{activeItem.content}</p>

                  <div className="mt-4 pt-3 border-t border-white/10">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest mb-1.5 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Zap size={12} className="text-cyan-400" />
                        Phase Progress
                      </span>
                      <span className="text-amber-300 font-bold">{activeItem.energy}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-cyan-400"
                        style={{ width: `${activeItem.energy}%` }}
                      />
                    </div>
                  </div>

                  {activeItem.relatedIds.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="flex items-center mb-2">
                        <LinkIcon size={10} className="text-slate-400 mr-1" />
                        <h4 className="text-[10px] uppercase tracking-widest font-mono text-slate-400">
                          Connected Milestones
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeItem.relatedIds.map((relatedId) => {
                          const relatedItem = timelineData.find(
                            (i) => i.id === relatedId
                          );
                          return (
                            <Button
                              key={relatedId}
                              variant="outline"
                              size="sm"
                              className="flex items-center h-6 px-2.5 py-0 text-[10px] font-mono uppercase tracking-widest rounded-full border-white/10 bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleItem(relatedId);
                              }}
                            >
                              {relatedItem?.title}
                              <ArrowRight
                                size={8}
                                className="ml-1 opacity-60"
                              />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

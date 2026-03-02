"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function VoiceRecorder({ isRecording, onStart, onStop }: VoiceRecorderProps) {
  // Explicitly type the refs as HTMLDivElements
  const rippleRef1 = useRef<HTMLDivElement>(null);
  const rippleRef2 = useRef<HTMLDivElement>(null);
  const animationRef1 = useRef<any>(null);
  const animationRef2 = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      // Safe check before animating ripple 1
      if (rippleRef1.current) {
        animationRef1.current = animate(rippleRef1.current, {
          scale: [1, 2.5],
          opacity: [0.8, 0],
          duration: 1500,
          loop: true,
          ease: "outSine"
        });
      }
      
      // Safe check before animating ripple 2
      if (rippleRef2.current) {
        animationRef2.current = animate(rippleRef2.current, {
          scale: [1, 2],
          opacity: [0.5, 0],
          duration: 1500,
          delay: 400,
          loop: true,
          ease: "outSine"
        });
      }
    } else {
      if (animationRef1.current) animationRef1.current.pause();
      if (animationRef2.current) animationRef2.current.pause();
      
      // Reset scales safely
      if (rippleRef1.current) {
        rippleRef1.current.style.transform = 'scale(1)';
      }
      if (rippleRef2.current) {
        rippleRef2.current.style.transform = 'scale(1)';
      }
    }
  }, [isRecording]);

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      {/* Anime.js Pulsating Ripples */}
      <div ref={rippleRef1} className="absolute inset-0 bg-radium-mint rounded-full opacity-0 pointer-events-none" />
      <div ref={rippleRef2} className="absolute inset-0 bg-radium-mint rounded-full opacity-0 pointer-events-none" />
      
      <button
        type="button"
        onClick={isRecording ? onStop : onStart}
        className={cn(
          "relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-2",
          isRecording 
            ? "bg-abyss-900 border-radium-mint text-radium-mint shadow-[0_0_20px_rgba(0,240,255,0.4)]" 
            : "bg-abyss-800 border-glass-border text-paper-100 hover:border-radium-mint/50 hover:text-radium-mint"
        )}
      >
        {isRecording ? <Square size={24} className="animate-pulse" /> : <Mic size={28} />}
      </button>
    </div>
  );
}
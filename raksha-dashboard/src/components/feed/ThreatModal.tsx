"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { ShieldAlert, X, ShieldCheck, Zap } from "lucide-react";
import { ThreatMessage } from "@/types/threat";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ThreatModalProps {
  threat: ThreatMessage;
  onClose: () => void;
}

export function ThreatModal({ threat, onClose }: ThreatModalProps) {
  // Explicitly type the refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const isHighRisk = threat.riskScore === "HIGH";

  const handleLearnMore = () => {
    // Pass the scam type as a query parameter
    const topic = encodeURIComponent(threat.culturalContextFlag || "Phishing Scam");
    router.push(`/dashboard/literacy/dynamic?threat_id=${threat.id}`);
  };

  useEffect(() => {
    // Safe check for overlay animation
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: 300,
        ease: "linear"
      });
    }

    // Safe check for modal animation
    if (modalRef.current) {
      animate(modalRef.current, {
        scale: [0.8, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        ease: "outElastic(1, .6)"
      });
    }
  }, []);

  const handleClose = () => {
    // Safe check for modal close animation
    if (modalRef.current) {
      animate(modalRef.current, {
        scale: [1, 0.95],
        opacity: [1, 0],
        duration: 200,
        ease: "inQuart"
      });
    }
    
    // Safe check for overlay close animation and triggering onClose
    if (overlayRef.current) {
      animate(overlayRef.current, {
        opacity: [1, 0],
        duration: 200,
        ease: "linear",
        onComplete: onClose
      });
    } else {
      // Fallback in case the ref is missing
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-abyss-900/80 backdrop-blur-md opacity-0"
    >
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-lg p-6 sm:p-8 rounded-3xl opacity-0 shadow-2xl border",
          "max-h-[90vh] overflow-y-auto",
          isHighRisk
            ? "bg-abyss-800 border-neon-coral shadow-[0_0_50px_rgba(255,42,77,0.15)]"
            : "bg-abyss-800 border-glass-border"
        )}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-paper-100/50 hover:text-paper-100 transition-colors rounded-full hover:bg-white/5 z-10"
        >
          <X size={20} />
        </button>

        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner mt-2",
          isHighRisk ? "bg-neon-coral/20 text-neon-coral" : "bg-solar-flare/20 text-solar-flare"
        )}>
          {isHighRisk ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
        </div>

        <h2 className={cn(
          "text-2xl font-black text-center mb-2 tracking-wide uppercase",
          isHighRisk ? "text-neon-coral" : "text-paper-100"
        )}>
          {isHighRisk ? "Critical Scam Blocked" : "Threat Analysis"}
        </h2>

        <div className="bg-abyss-900/50 border border-glass-border rounded-xl p-5 mb-6 relative overflow-hidden mt-6">
          <div className="absolute top-0 left-0 w-1 h-full bg-radium-mint" />
          <h4 className="text-xs font-mono tracking-widest text-radium-mint uppercase mb-2 flex items-center gap-2">
            <Zap size={14} /> AI Context Engine
          </h4>
          <p className="text-paper-100/90 text-sm leading-relaxed font-medium">
            {threat.culturalContextFlag
              ? `Pattern match identified: ${threat.culturalContextFlag}. This is a known social engineering vector exploiting urgency and cultural events.`
              : "Standard technical parameters analyzed. Proceed with standard caution."}
          </p>
        </div>

        <div className="mb-8">
          <h4 className="text-xs text-paper-100/40 uppercase tracking-wider mb-2 font-semibold">Intercepted Payload</h4>
          <div className="p-4 bg-abyss-900 rounded-lg border border-glass-border text-paper-100/70 text-sm font-mono opacity-80 border-l-2 border-l-glass-border break-words">
            <span className="text-paper-100 font-bold">{threat.sender}: </span>
            {threat.content}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isHighRisk && (
            <button
              onClick={handleClose}
              className="w-full py-4 bg-neon-coral text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,42,77,0.3)] hover:shadow-[0_0_30px_rgba(255,42,77,0.5)] hover:scale-[1.02] transition-all"
            >
              Quarantine Vector & Block Sender
            </button>
          )}
          <button
            onClick={handleLearnMore}
            className="w-full py-4 bg-transparent border border-radium-mint text-radium-mint font-bold rounded-xl hover:bg-radium-mint/10 transition-colors"
          >
            Learn How This Scam Works (+10 pts)
          </button>
        </div>
      </div>
    </div>
  );
}
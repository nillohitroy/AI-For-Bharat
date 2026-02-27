"use client";

import { useState, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ShieldQuestion
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";

const initialQueue = [
  {
    id: "req_01",
    sender: "+91 98765 43210",
    content: "Beta, I am in hospital. Need ₹10,000 urgently for admission. Send to this UPI...",
    aiConfidence: 45,
    contextFlag: "Potential Family Emergency Exploit",
    timestamp: "10 mins ago"
  },
  {
    id: "req_02",
    sender: "HDFC-REWARDS",
    content: "Your account KYC is expiring today. Click here to update via Aadhar link: http://bit.ly/hdfc-kyc-updt",
    aiConfidence: 60,
    contextFlag: "Banking Urgency / Suspicious URL",
    timestamp: "22 mins ago"
  },
  {
    id: "req_03",
    sender: "Local Grocery",
    content: "Diwali special: 1kg sweets free on orders above Rs 500. Reply YES to book.",
    aiConfidence: 55,
    contextFlag: "Festival Offer - Ambiguous",
    timestamp: "1 hour ago"
  }
];

export default function GuardianPortal() {
  const [queue, setQueue] = useState(initialQueue);
  const [selectedItem, setSelectedItem] = useState<typeof initialQueue[0] | null>(null);
  const listRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      animate('.queue-item', {
        x: [-20, 0],
        opacity: [0, 1],
        delay: stagger(100),
        duration: 800,
        ease: "outExpo"
      });
    }
  }, []);

  useEffect(() => {
    if (selectedItem && panelRef.current) {
      animate(panelRef.current, {
        y: [20, 0],
        opacity: [0, 1],
        duration: 400,
        ease: "outQuart"
      });
    }
  }, [selectedItem]);

  const handleVote = (vote: "SCAM" | "SAFE") => {
    if (!selectedItem) return;
    
    animate(panelRef.current, {
      scale: [1, 0.95],
      opacity: [1, 0],
      duration: 300,
      ease: "inOutQuad",
      onComplete: () => {
        setQueue(prev => prev.filter(item => item.id !== selectedItem.id));
        setSelectedItem(null);
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto w-full"> {/* FIX: Aligned with main dashboard width */}
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink-900 dark:text-paper-100 tracking-wide flex items-center gap-3">
            <Users className="text-solar-flare" size={32} />
            Guardian Network
          </h1>
          <p className="text-ink-900/60 dark:text-paper-100/60 mt-2">
            Peer-to-peer threat verification. Review ambiguous payloads and train the AI ecosystem.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-4 bg-abyss-800/50 border border-glass-border px-5 py-2.5 rounded-xl w-fit">
          <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Your Rating:</span>
          <span className="text-radium-mint font-black text-lg">Trust Level 4</span>
        </div>
      </div>

      {/* FIX: Changed to a responsive grid layout that stacks naturally on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: The Queue */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-solar-flare flex items-center gap-2">
            <AlertTriangle size={16} /> Needs Verification ({queue.length})
          </h3>
          
          <div ref={listRef} className="space-y-3">
            {queue.length === 0 ? (
              <div className="text-center p-8 opacity-50 border border-dashed border-glass-border rounded-xl">
                No pending threats in your region.
              </div>
            ) : (
              queue.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "queue-item cursor-pointer p-4 rounded-xl border transition-all duration-300",
                    selectedItem?.id === item.id 
                      ? "bg-solar-flare/10 border-solar-flare shadow-[0_0_15px_rgba(255,179,0,0.1)]" 
                      : "bg-paper-200/50 dark:bg-abyss-800/50 border-glass-border hover:border-solar-flare/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm truncate pr-2">{item.sender}</span>
                    <span className="text-xs font-mono opacity-50 whitespace-nowrap">{item.timestamp}</span>
                  </div>
                  <p className="text-xs opacity-70 line-clamp-2">{item.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: The Verification Panel */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <div ref={panelRef} className="opacity-0">
              <GlassPanel className="border-solar-flare/30 shadow-2xl p-6 sm:p-8">
                
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-glass-border">
                  <ShieldQuestion className="text-solar-flare" size={28} />
                  <h2 className="text-xl sm:text-2xl font-black">Analyze Payload</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1 block">Sender Identity</span>
                    <div className="text-base sm:text-lg font-mono bg-paper-200 dark:bg-abyss-900 p-3 rounded-lg border border-glass-border break-words">
                      {selectedItem.sender}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1 block">Intercepted Content</span>
                    <div className="text-base sm:text-lg bg-paper-200 dark:bg-abyss-900 p-4 sm:p-5 rounded-lg border border-glass-border leading-relaxed border-l-4 border-l-solar-flare break-words">
                      {selectedItem.content}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-abyss-900/40 p-4 rounded-xl border border-glass-border">
                      <span className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1 block">AI Confidence Score</span>
                      <div className="flex items-end gap-2 text-solar-flare">
                        <span className="text-3xl font-black">{selectedItem.aiConfidence}%</span>
                        <span className="text-sm font-medium mb-1">Needs Human Context</span>
                      </div>
                    </div>
                    <div className="bg-abyss-900/40 p-4 rounded-xl border border-glass-border">
                      <span className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1 block">Suspected Context</span>
                      <span className="text-sm font-medium text-paper-100/90">{selectedItem.contextFlag}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-glass-border flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleVote("SCAM")}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-neon-coral/10 border border-neon-coral text-neon-coral font-bold rounded-xl hover:bg-neon-coral hover:text-white transition-all group"
                  >
                    <XCircle size={20} className="group-hover:scale-110 transition-transform" />
                    Verify as Scam
                  </button>
                  <button 
                    onClick={() => handleVote("SAFE")}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-radium-mint/10 border border-radium-mint text-radium-mint font-bold rounded-xl hover:bg-radium-mint hover:text-abyss-900 transition-all group"
                  >
                    <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                    Mark as Safe
                  </button>
                </div>

              </GlassPanel>
            </div>
          ) : (
            <GlassPanel className="flex flex-col items-center justify-center min-h-[400px] opacity-60 border-dashed">
              <Users size={64} className="mb-4 text-ink-900/40 dark:text-paper-100/40" />
              <p className="text-lg font-medium text-center">Select a payload from the queue to review.</p>
            </GlassPanel>
          )}
        </div>

      </div>
    </div>
  );
}
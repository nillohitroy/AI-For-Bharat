"use client";

import { useState } from "react";
import { useWebSockets } from "@/hooks/useWebSockets";
import { ThreatCard } from "@/components/feed/ThreatCard";
import { ThreatMessage } from "@/types/threat";
import { Activity } from "lucide-react";

export default function DashboardFeed() {
  // Connect to the local FastAPI backend (or use mock injection)
  const { messages, isConnected, injectMockThreat } = useWebSockets("ws://localhost:8000/ws/feed");
  const [selectedThreat, setSelectedThreat] = useState<ThreatMessage | null>(null);

  // Demo Function: Triggers the "Diwali Bumper Offer" scam for the judges
  const triggerDemoScam = () => {
    injectMockThreat({
      id: Math.random().toString(),
      sender: "VK-OFFERS",
      content: "Diwali Bumper Offer! Congrats! You won ₹5000. Click the link to claim your festive reward before midnight...",
      riskScore: "HIGH",
      timestamp: new Date().toLocaleTimeString(),
      culturalContextFlag: "Festival Urgency / Financial Fraud",
    });
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-ink-900 dark:text-paper-100 tracking-wide">
            Live Scan Feed
          </h1>
          <p className="text-ink-900/60 dark:text-paper-100/60 mt-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-radium-mint' : 'bg-solar-flare'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-radium-mint' : 'bg-solar-flare'}`}></span>
            </span>
            {isConnected ? "Engine Active: Auto-scanning incoming vectors." : "Awaiting Engine Connection..."}
          </p>
        </div>

        {/* Secret Demo Trigger Button - Remove before production! */}
        <button 
          onClick={triggerDemoScam}
          className="px-4 py-2 text-xs font-mono bg-abyss-800 border border-glass-border rounded hover:bg-abyss-700 transition"
        >
          [ Trigger Demo Payload ]
        </button>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-glass-border rounded-2xl bg-paper-200/50 dark:bg-abyss-800/20">
          <Activity size={48} className="text-ink-900/20 dark:text-paper-100/20 mb-4 animate-pulse" />
          <p className="text-ink-900/50 dark:text-paper-100/50">No recent threats detected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((msg) => (
            <ThreatCard 
              key={msg.id} 
              message={msg} 
              onClick={() => setSelectedThreat(msg)} 
            />
          ))}
        </div>
      )}

      {/* TODO: Add ThreatModal here when selectedThreat is active */}
    </div>
  );
}
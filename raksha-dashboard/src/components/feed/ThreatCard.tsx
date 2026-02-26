import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { ThreatMessage } from "@/types/threat";
import { GlassPanel } from "../ui/GlassPanel";
import { cn } from "@/lib/utils";

interface ThreatCardProps {
  message: ThreatMessage;
  onClick: () => void;
}

export function ThreatCard({ message, onClick }: ThreatCardProps) {
  const isHighRisk = message.riskScore === "HIGH";
  const isMediumRisk = message.riskScore === "MEDIUM";
  const isSafe = message.riskScore === "LOW";

  return (
    <GlassPanel 
      variant={isHighRisk ? "alert" : isSafe ? "safe" : "default"}
      className="cursor-pointer group hover:scale-[1.01] transition-transform duration-300"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-ink-900 dark:text-paper-100 flex items-center gap-2">
            {message.sender}
            {isHighRisk && <span className="text-xs px-2 py-0.5 rounded-full bg-neon-coral/20 text-neon-coral border border-neon-coral/50 animate-pulse">CRITICAL</span>}
          </h3>
          <span className="text-xs opacity-60 font-mono tracking-widest">{message.timestamp}</span>
        </div>
        
        {/* Dynamic Risk Icon */}
        <div className={cn(
          "p-2 rounded-xl backdrop-blur-md shadow-inner",
          isHighRisk ? "bg-neon-coral/10 text-neon-coral" : 
          isMediumRisk ? "bg-solar-flare/10 text-solar-flare" : 
          "bg-radium-mint/10 text-radium-mint"
        )}>
          {isHighRisk && <ShieldAlert size={24} />}
          {isMediumRisk && <AlertTriangle size={24} />}
          {isSafe && <ShieldCheck size={24} />}
        </div>
      </div>

      <p className="text-sm text-ink-900/80 dark:text-paper-100/80 line-clamp-2 mb-4">
        {message.content}
      </p>

      {/* Cultural Context Tag - The USP */}
      {message.culturalContextFlag && (
        <div className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-md bg-abyss-700/50 border border-glass-border text-paper-200">
          <span className="w-1.5 h-1.5 rounded-full bg-solar-flare mr-2" />
          Pattern Detected: {message.culturalContextFlag}
        </div>
      )}
    </GlassPanel>
  );
}
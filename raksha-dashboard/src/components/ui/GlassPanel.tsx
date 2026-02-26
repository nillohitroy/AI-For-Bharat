import { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "alert" | "safe";
}

export function GlassPanel({ children, className, variant = "default", ...props }: GlassPanelProps) {
  // Dynamic border and glow colors based on the state of the panel
  const variants = {
    default: "border-glass-border hover:border-radium-mint/30",
    alert: "border-neon-coral/50 shadow-[0_0_15px_rgba(255,42,77,0.15)]",
    safe: "border-radium-mint/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl transition-all duration-300",
        "bg-white/60 dark:bg-abyss-800/60 backdrop-blur-xl", // The glass effect
        "border shadow-lg",
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Subtle top-light reflection effect for that premium glass feel */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="relative z-10 p-6">
        {children}
      </div>
    </div>
  );
}
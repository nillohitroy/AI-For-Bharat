"use client";

import { Bell, ShieldCheck } from "lucide-react";

export function Topbar() {
  return (
    <header className="h-20 w-full border-b border-glass-border bg-paper-100/80 dark:bg-abyss-900/80 backdrop-blur-md flex items-center justify-between px-8 z-10 sticky top-0 transition-colors duration-500">
      
      <div className="flex items-center">
        <h2 className="text-lg font-bold text-ink-900 dark:text-paper-100">
          Command Center
        </h2>
      </div>

      <div className="flex items-center space-x-6">
        {/* Digital Literacy Score Badge  */}
        <div className="flex items-center bg-radium-mint/10 border border-radium-mint/20 px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(0,240,255,0.1)]">
          <ShieldCheck className="text-radium-mint mr-2" size={18} />
          <span className="text-sm font-bold text-ink-900 dark:text-paper-100">
            Literacy Score: <span className="text-radium-mint">450 pts</span>
          </span>
        </div>

        {/* Alerts */}
        <button className="relative p-2 rounded-full hover:bg-paper-200 dark:hover:bg-abyss-800 transition-colors text-ink-900 dark:text-paper-100">
          <Bell size={20} />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-neon-coral rounded-full shadow-[0_0_5px_rgba(255,42,77,0.8)] animate-pulse" />
        </button>

        {/* User Profile Mock */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-solar-flare to-neon-coral flex items-center justify-center text-white font-bold shadow-md cursor-pointer">
          NR
        </div>
      </div>
    </header>
  );
}
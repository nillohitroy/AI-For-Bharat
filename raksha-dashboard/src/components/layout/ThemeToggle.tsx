"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by ensuring it only renders after mounting on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full bg-paper-200 dark:bg-abyss-700 animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle Dark Mode"
      className={cn(
        "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500",
        "bg-paper-200 hover:bg-paper-100 dark:bg-abyss-800 dark:hover:bg-abyss-700",
        "border border-transparent dark:border-glass-border shadow-sm",
        className
      )}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <Sun 
          className={cn(
            "absolute text-solar-flare transition-all duration-500",
            isDark ? "opacity-0 rotate-[-90deg] scale-50" : "opacity-100 rotate-0 scale-100"
          )} 
          size={22} 
        />
        <Moon 
          className={cn(
            "absolute text-radium-mint transition-all duration-500",
            isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-[90deg] scale-50"
          )} 
          size={22} 
        />
      </div>
    </button>
  );
}
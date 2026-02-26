"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Radio, Mic, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Live Scan Feed", href: "/dashboard", icon: Radio },
    { name: "Report a Threat", href: "/dashboard/report", icon: Mic }, // Voice/Text input [cite: 71]
    { name: "Digital Literacy", href: "/dashboard/literacy", icon: BookOpen }, // Learning module [cite: 38]
    { name: "Guardian Portal", href: "/portal", icon: Users }, // Community Network [cite: 34]
  ];

  return (
    <aside className="w-64 h-screen border-r border-glass-border bg-paper-100 dark:bg-abyss-900/50 backdrop-blur-2xl flex flex-col transition-colors duration-500 hidden md:flex">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-glass-border">
        <Shield className="text-solar-flare mr-3" size={28} />
        <h1 className="text-xl font-black tracking-wider text-ink-900 dark:text-paper-100 uppercase">
          Raksha <span className="text-radium-mint">AI</span>
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-xl transition-all duration-300 font-medium",
                isActive 
                  ? "bg-radium-mint/10 text-radium-mint shadow-[inset_0_0_10px_rgba(0,240,255,0.05)] border border-radium-mint/20" 
                  : "text-ink-900/70 dark:text-paper-100/60 hover:bg-paper-200 dark:hover:bg-abyss-800 hover:text-ink-900 dark:hover:text-paper-100"
              )}
            >
              <Icon className={cn("mr-3", isActive ? "text-radium-mint" : "")} size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Theme Toggle */}
      <div className="p-4 border-t border-glass-border flex justify-between items-center">
        <span className="text-xs font-semibold text-ink-900/50 dark:text-paper-100/40 uppercase tracking-widest">System Settings</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
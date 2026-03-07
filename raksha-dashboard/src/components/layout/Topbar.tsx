"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, Settings, LogOut, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function Topbar() {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // --- SUPABASE AUTH LISTENER ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- DROPDOWN OUTSIDE CLICK LISTENER ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HELPER FUNCTIONS ---
  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      return name.substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return "US";
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    router.push("/"); // Route back to landing page securely
  };

  return (
    <header className="h-20 border-b border-glass-border bg-paper-100/80 dark:bg-abyss-900/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
      
      {/* Left Side: Search Bar */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-paper-200 dark:bg-abyss-800 px-4 py-2 rounded-xl border border-glass-border">
          <Search size={16} className="text-ink-900/40 dark:text-paper-100/40" />
          <input 
            type="text" 
            placeholder="Search network vectors..." 
            className="bg-transparent border-none outline-none text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-900/40 dark:placeholder:text-paper-100/40 w-64"
          />
        </div>
      </div>

      {/* Right Side: Tools & Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        
        <button className="relative p-2 text-ink-900/60 dark:text-paper-100/60 hover:text-ink-900 dark:hover:text-paper-100 transition-colors rounded-full hover:bg-ink-900/5 dark:hover:bg-white/5">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-coral rounded-full border border-paper-100 dark:border-abyss-900"></span>
        </button>

        {/* Profile Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          {/* Avatar Trigger */}
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-10 h-10 rounded-full bg-radium-mint text-abyss-900 font-black flex items-center justify-center hover:scale-105 transition-all shadow-md border-2 border-transparent hover:border-solar-flare focus:outline-none"
          >
            {user ? getInitials(user.user_metadata?.full_name, user.email) : "US"}
          </button>

          {/* Glassmorphism Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-paper-100 dark:bg-abyss-800 border border-glass-border rounded-xl shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-glass-border mb-1">
                <p className="text-sm font-bold text-ink-900 dark:text-paper-100 truncate">
                  {user?.user_metadata?.full_name || "Guardian Node"}
                </p>
                <p className="text-xs text-ink-900/60 dark:text-paper-100/60 truncate mt-0.5">
                  {user?.email || "Authenticating..."}
                </p>
              </div>
              
              {/* Action Buttons */}
              <button 
                onClick={() => { setIsDropdownOpen(false); /* Route to profile logic */ }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-900 dark:text-paper-100 hover:bg-paper-200 dark:hover:bg-abyss-900 transition-colors w-full text-left font-medium"
              >
                <User size={16} className="text-ink-900/60 dark:text-paper-100/60" /> 
                Edit Profile
              </button>

              <button 
                onClick={() => { setIsDropdownOpen(false); /* Route to settings logic */ }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-900 dark:text-paper-100 hover:bg-paper-200 dark:hover:bg-abyss-900 transition-colors w-full text-left font-medium"
              >
                <Settings size={16} className="text-ink-900/60 dark:text-paper-100/60" /> 
                System Settings
              </button>
              
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neon-coral hover:bg-neon-coral/10 transition-colors w-full text-left font-medium mt-1 border-t border-glass-border pt-3"
              >
                <LogOut size={16} /> 
                Disconnect Node
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
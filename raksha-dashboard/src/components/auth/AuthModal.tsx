"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { X, Mail, Lock, User, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"register" | "signin">("register");
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const router = useRouter();

  // Entrance Animation
  useEffect(() => {
    if (isOpen) {
      animate(overlayRef.current, { opacity: [0, 1], duration: 300, ease: "linear" });
      animate(modalRef.current, {
        scale: [0.8, 1],
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        ease: "outElastic(1, .6)"
      });
    }
  }, [isOpen]);

  // Exit Animation Wrapper
  const handleClose = () => {
    animate(modalRef.current, {
      scale: [1, 0.95],
      opacity: [1, 0],
      duration: 200,
      ease: "inQuart"
    });
    animate(overlayRef.current, {
      opacity: [1, 0],
      duration: 200,
      ease: "linear",
      onComplete: onClose
    });
  };

  // Mock Login Handler
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    handleClose();
    setTimeout(() => router.push("/dashboard"), 300); // Route to dashboard after "login"
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-abyss-900/80 backdrop-blur-md opacity-0"
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-md p-8 rounded-3xl opacity-0 shadow-2xl bg-paper-100 dark:bg-abyss-800 border border-glass-border overflow-hidden"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-ink-900/50 dark:text-paper-100/50 hover:text-ink-900 dark:hover:text-paper-100 transition-colors rounded-full hover:bg-ink-900/5 dark:hover:bg-white/5 z-10"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6 mt-2">
          <Shield className="text-radium-mint mb-3" size={32} />
          <h2 className="text-2xl font-black text-ink-900 dark:text-paper-100 uppercase tracking-wide">
            {activeTab === "register" ? "Join the Network" : "Welcome Back"}
          </h2>
          <p className="text-sm text-ink-900/60 dark:text-paper-100/60 font-medium mt-1">
            Access the Cultural Context AI Sandbox
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex relative bg-paper-200 dark:bg-abyss-900 rounded-xl p-1 mb-8 border border-glass-border">
          <button 
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 z-10",
              activeTab === "register" ? "text-abyss-900 bg-radium-mint shadow-md" : "text-ink-900/60 dark:text-paper-100/60 hover:text-ink-900 dark:hover:text-paper-100"
            )}
          >
            Register
          </button>
          <button 
            onClick={() => setActiveTab("signin")}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-300 z-10",
              activeTab === "signin" ? "text-abyss-900 bg-radium-mint shadow-md" : "text-ink-900/60 dark:text-paper-100/60 hover:text-ink-900 dark:hover:text-paper-100"
            )}
          >
            Sign In
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {activeTab === "register" && (
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-ink-900/40 dark:text-paper-100/40" size={20} />
              <input 
                type="text" 
                placeholder="Full Name" 
                required
                className="w-full bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-radium-mint focus:ring-1 focus:ring-radium-mint text-ink-900 dark:text-paper-100 transition-all"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-ink-900/40 dark:text-paper-100/40" size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              className="w-full bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-radium-mint focus:ring-1 focus:ring-radium-mint text-ink-900 dark:text-paper-100 transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-ink-900/40 dark:text-paper-100/40" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-radium-mint focus:ring-1 focus:ring-radium-mint text-ink-900 dark:text-paper-100 transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-ink-900 dark:bg-paper-100 text-paper-100 dark:text-ink-900 font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-6"
          >
            {activeTab === "register" ? "Create Account" : "Access Command Center"}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 h-px bg-glass-border"></div>
          <span className="px-4 text-xs font-bold uppercase tracking-widest text-ink-900/40 dark:text-paper-100/40">Or continue with</span>
          <div className="flex-1 h-px bg-glass-border"></div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleAuth} type="button" className="flex items-center justify-center gap-2 py-3 bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl hover:bg-paper-200/50 dark:hover:bg-abyss-900/50 transition-colors text-sm font-bold text-ink-900 dark:text-paper-100 group">
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          
          <button onClick={handleAuth} type="button" className="flex items-center justify-center gap-2 py-3 bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl hover:bg-paper-200/50 dark:hover:bg-abyss-900/50 transition-colors text-sm font-bold text-ink-900 dark:text-paper-100 group">
            <svg className="w-5 h-5 dark:fill-white fill-black group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.437.987 3.96.948 1.56-.025 2.582-1.479 3.565-2.924 1.139-1.666 1.606-3.284 1.631-3.364-.038-.016-3.15-1.21-3.181-4.838-.027-3.038 2.483-4.508 2.597-4.582-1.423-2.079-3.64-2.316-4.44-2.368-2.022-.162-4.045 1.014-4.457 1.014zM14.98 4.242c.843-1.025 1.411-2.454 1.258-3.882-1.228.05-2.73.82-3.596 1.835-.783.896-1.442 2.366-1.258 3.753 1.365.105 2.753-.679 3.596-1.706z"/>
            </svg>
            Apple
          </button>
        </div>

      </div>
    </div>
  );
}
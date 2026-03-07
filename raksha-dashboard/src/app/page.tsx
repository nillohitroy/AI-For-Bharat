"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { animate } from "animejs";
import {
  Shield, ChevronRight, Globe, Users, Mic, Zap, BookOpen,
  LogOut, LayoutDashboard, Smartphone, Download, AlertTriangle
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { AuthModal } from "@/components/auth/AuthModal";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false); // <-- ADDED DOWNLOAD STATE
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Animation Refs
  const heroRef = useRef(null);
  const featureTitleRef = useRef(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef(null);

  // --- SUPABASE AUTH LISTENER ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      }
    });

    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      router.push("/dashboard");
    }

    return () => subscription.unsubscribe();
  }, [router]);

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
  };

  const handleCtaClick = () => {
    if (user) router.push("/dashboard");
    else setIsAuthModalOpen(true);
  };

  // --- SCROLL ANIMATIONS ---
  useEffect(() => {
    if (heroRef.current) {
      animate(heroRef.current, {
        translateY: [30, 0], opacity: [0, 1], duration: 1200, ease: "outExpo",
      });
    }

    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target, {
            translateY: [50, 0], opacity: [0, 1], duration: 1000, ease: "outQuart",
          });
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (featureTitleRef.current) observer.observe(featureTitleRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);
    featureRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });

    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: Globe, title: "Cultural Context Analyzer", description: "Proprietary AI that detects scams exploiting Indian festivals, family hierarchies, and religious sentiments that generic global security platforms miss.", color: "text-radium-mint", bg: "bg-radium-mint/10", border: "border-radium-mint/20" },
    { icon: Users, title: "Community Guardian Network", description: "A peer-to-peer defense system empowering trusted local users to verify threats and support less tech-savvy members of their community.", color: "text-solar-flare", bg: "bg-solar-flare/10", border: "border-solar-flare/20" },
    { icon: Mic, title: "Voice-First Accessibility", description: "Breaks literacy barriers by offering full functionality through voice commands and supporting 10 Indian languages.", color: "text-neon-coral", bg: "bg-neon-coral/10", border: "border-neon-coral/20" },
    { icon: BookOpen, title: "Adaptive Digital Literacy", description: "Converts real-time threats into personalized micro-lessons. The system assesses user skills and unlocks content as they learn.", color: "text-radium-mint", bg: "bg-radium-mint/10", border: "border-radium-mint/20" }
  ];

  return (
    <>
      <div className="min-h-screen flex flex-col bg-paper-100 dark:bg-abyss-900 overflow-x-hidden">

        {/* Opaque Landing Navbar */}
        <nav className="fixed top-0 w-full h-20 bg-paper-100 dark:bg-abyss-900 border-b border-glass-border flex items-center justify-between px-8 z-50 transition-colors duration-500">
          <div className="flex items-center gap-3">
            <Shield className="text-solar-flare w-8 h-8" />
            <h1 className="text-xl font-black tracking-wider text-ink-900 dark:text-paper-100 uppercase">
              Raksha <span className="text-radium-mint">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-full bg-radium-mint text-abyss-900 font-black flex items-center justify-center hover:scale-105 transition-all shadow-md border-2 border-transparent hover:border-solar-flare focus:outline-none"
                >
                  {getInitials(user.user_metadata?.full_name, user.email)}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-paper-100 dark:bg-abyss-800 border border-glass-border rounded-xl shadow-2xl py-2 flex flex-col z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-glass-border mb-1">
                      <p className="text-sm font-bold text-ink-900 dark:text-paper-100 truncate">
                        {user.user_metadata?.full_name || "Guardian"}
                      </p>
                      <p className="text-xs text-ink-900/60 dark:text-paper-100/60 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <button
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-900 dark:text-paper-100 hover:bg-paper-200 dark:hover:bg-abyss-900 transition-colors w-full text-left font-medium"
                    >
                      <LayoutDashboard size={16} className="text-radium-mint" />
                      Command Center
                    </button>

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-neon-coral hover:bg-neon-coral/10 transition-colors w-full text-left font-medium mt-1"
                    >
                      <LogOut size={16} />
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-6 py-2.5 bg-ink-900 dark:bg-paper-100 text-paper-100 dark:text-ink-900 font-bold rounded-xl hover:scale-105 transition-transform shadow-lg"
                  >
                    Register
                  </button>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="sm:hidden px-4 py-2 bg-ink-900 dark:bg-paper-100 text-paper-100 dark:text-ink-900 font-bold rounded-lg text-sm"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center px-6 min-h-[90vh]">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-radium-mint/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-neon-coral/10 rounded-full blur-[120px] pointer-events-none" />

          <div ref={heroRef} className="opacity-0 relative z-10 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-abyss-800/5 dark:bg-paper-100/5 border border-glass-border mb-8 backdrop-blur-md">
              <Zap className="text-solar-flare w-4 h-4" />
              <span className="text-sm font-semibold text-ink-900/80 dark:text-paper-100/80">
                Real-time merchant verification in &lt;3s
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-tight">
              Cultural Context <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-radium-mint to-solar-flare">
                Cybersecurity.
              </span>
            </h2>
            <p className="text-lg md:text-2xl font-medium text-ink-900/70 dark:text-paper-100/70 mb-12 max-w-2xl mx-auto leading-relaxed">
              Bridging digital literacy gaps to protect communities from sophisticated social engineering and localized financial threats.
            </p>

            <button
              onClick={handleCtaClick}
              className="group relative px-8 py-4 md:px-10 md:py-5 bg-ink-900 dark:bg-paper-100 text-paper-100 dark:text-ink-900 font-bold text-lg rounded-2xl shadow-2xl transition-all hover:scale-[1.02]"
            >
              <span className="flex items-center gap-3">
                {user ? "Enter Command Center" : "Initialize Command Center"}
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="relative py-24 px-6 bg-paper-200/30 dark:bg-abyss-800/30 border-y border-glass-border">
          <div className="max-w-7xl mx-auto">
            <div ref={featureTitleRef} className="opacity-0 text-center mb-16">
              <h3 className="text-3xl md:text-5xl font-black text-ink-900 dark:text-paper-100 mb-4">
                Enterprise-Grade Protection. <br /> Designed for the Masses.
              </h3>
              <p className="text-ink-900/60 dark:text-paper-100/60 max-w-2xl mx-auto text-lg">
                Unlike generic global security platforms, Raksha AI shifts from "individual defense" to a collective, culturally-aware safety net.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} ref={(el) => { featureRefs.current[index] = el; }} className="opacity-0">
                    <GlassPanel className={cn("h-full hover:-translate-y-2 transition-transform duration-500", feature.border)}>
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", feature.bg, feature.color)}>
                        <Icon size={28} />
                      </div>
                      <h4 className="text-2xl font-bold text-ink-900 dark:text-paper-100 mb-3">
                        {feature.title}
                      </h4>
                      <p className="text-ink-900/70 dark:text-paper-100/70 leading-relaxed">
                        {feature.description}
                      </p>
                    </GlassPanel>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* App Download Section */}
        <section className="relative py-24 px-6 border-b border-glass-border flex justify-center">
          <div className="max-w-4xl w-full">
            <GlassPanel className="text-center p-10 md:p-16 border-radium-mint/30 bg-radium-mint/5">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-radium-mint/20 flex items-center justify-center text-radium-mint shadow-[0_0_30px_rgba(0,240,255,0.15)]">
                  <Smartphone size={40} />
                </div>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-ink-900 dark:text-paper-100 mb-6">
                Take Raksha With You
              </h2>
              <p className="text-lg text-ink-900/70 dark:text-paper-100/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                Get real-time AI protection on your phone. Download the Raksha Android app to automatically scan incoming SMS messages for phishing links and scams.
              </p>

              {/* UPDATED: Download Trigger Button */}
              <button 
                onClick={() => setIsDownloadModalOpen(true)}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 font-bold text-lg rounded-xl text-abyss-900 bg-radium-mint hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_40px_rgba(0,240,255,0.5)]"
              >
                <Download size={24} />
                Download APK
              </button>
              
              <p className="text-sm font-medium text-ink-900/50 dark:text-paper-100/50 mt-6">
                *Requires Android 8.0+. SMS scanning requires explicit user permission.
              </p>
            </GlassPanel>
          </div>
        </section>
        
        {/* Bottom CTA Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div ref={ctaRef} className="opacity-0 max-w-4xl mx-auto text-center relative z-10">
            <Shield className="w-20 h-20 text-radium-mint mx-auto mb-8 opacity-50" />
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-ink-900 dark:text-paper-100">
              Ready to deploy the <br />Guardian Network?
            </h2>
            <button
              onClick={handleCtaClick}
              className="px-10 py-5 bg-radium-mint text-abyss-900 font-bold text-lg rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.5)] transition-all hover:scale-105"
            >
              Access Live Demo
            </button>
          </div>
        </section>

        <footer className="py-8 border-t border-glass-border text-center text-sm font-mono text-ink-900/40 dark:text-paper-100/40">
          <p>Raksha AI &bull; AI for Bharat Hackathon &bull; Powered by AWS</p>
        </footer>
      </div>

      {/* Render the Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* NEW: Download Instruction Modal */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-abyss-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-paper-100 dark:bg-abyss-800 border-2 border-radium-mint/50 rounded-2xl max-w-md w-full p-6 text-left shadow-[0_0_50px_rgba(0,240,255,0.15)] relative">
            
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-solar-flare w-8 h-8" />
              <h3 className="text-2xl font-black text-ink-900 dark:text-paper-100">
                Before you install...
              </h3>
            </div>
            
            <p className="text-ink-900/70 dark:text-paper-100/70 text-sm mb-6 leading-relaxed">
              Because this is an exclusive hackathon build and not on the Play Store yet, Google Play Protect might try to block it. Here is the 10-second bypass:
            </p>

            <div className="bg-paper-200 dark:bg-abyss-900 p-4 rounded-xl mb-6 border border-glass-border">
              <ol className="list-decimal list-inside text-ink-900 dark:text-paper-100 space-y-3 text-sm font-medium">
                <li>Download and open the APK file below.</li>
                <li>If prompted, tap <strong>Settings</strong> and allow installations from this source.</li>
                <li>When the Play Protect warning appears, tap the tiny <strong className="text-radium-mint">More details</strong> button.</li>
                <li>Tap <strong className="text-neon-coral">Install anyway (unsafe)</strong>.</li>
              </ol>
            </div>

            <div className="flex flex-col space-y-3">
              {/* THE ACTUAL DOWNLOAD LINK */}
              <a
                href="/raksha-release.apk"
                download="Raksha_AI.apk"
                onClick={() => setIsDownloadModalOpen(false)}
                className="flex items-center justify-center gap-2 bg-radium-mint text-abyss-900 text-center font-bold py-3 px-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
              >
                <Download size={20} />
                Acknowledge & Download
              </a>
              
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="text-ink-900/60 dark:text-paper-100/60 hover:text-ink-900 dark:hover:text-paper-100 py-2 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
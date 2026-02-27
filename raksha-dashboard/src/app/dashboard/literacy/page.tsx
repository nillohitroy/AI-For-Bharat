"use client";

import { useState, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { 
  BookOpen, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Zap, 
  Award,
  CheckCircle,
  PlayCircle
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";

// Mock Data for the Micro-Lessons
const lessons = [
  {
    id: 1,
    title: "The Festival Urgency Trap",
    category: "Financial Fraud",
    description: "Learn how scammers use fake Diwali or Eid offers to steal OTPs.",
    pointsEarned: 50,
    status: "completed",
    icon: Zap
  },
  {
    id: 2,
    title: "Family Emergency Spoofing",
    category: "Social Engineering",
    description: "Understand how attackers mimic family members in distress to extract funds.",
    pointsEarned: 0,
    reward: 100,
    status: "available",
    icon: PlayCircle
  },
  {
    id: 3,
    title: "Aadhar & KYC Panic Links",
    category: "Phishing Vectors",
    description: "Master the art of identifying fake banking alerts and malicious URLs.",
    pointsEarned: 0,
    reward: 150,
    status: "locked",
    icon: Lock
  },
  {
    id: 4,
    title: "Job Offer Traps",
    category: "Employment Fraud",
    description: "Identify fake recruiters asking for 'processing fees' via WhatsApp.",
    pointsEarned: 0,
    reward: 200,
    status: "locked",
    icon: Lock
  }
];

export default function LiteracyModule() {
  const [activeLesson, setActiveLesson] = useState<number | null>(null);
  const progressRef = useRef(null);

  // User Stats Mock
  const currentScore = 450;
  const nextLevelScore = 1000;
  const progressPercentage = (currentScore / nextLevelScore) * 100;

  useEffect(() => {
    // 1. Animate the progress bar filling up
    if (progressRef.current) {
      animate(progressRef.current, {
        width: ["0%", `${progressPercentage}%`],
        duration: 1500,
        ease: "outCubic",
        delay: 300
      });
    }

    // 2. Stagger the entrance of the lesson cards
    animate('.lesson-card', {
      y: [30, 0],
      opacity: [0, 1],
      delay: stagger(150),
      duration: 800,
      ease: "outExpo"
    });
  }, [progressPercentage]);

  return (
    <div className="max-w-5xl mx-auto w-full">
      
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-ink-900 dark:text-paper-100 tracking-wide flex items-center gap-3">
          <BookOpen className="text-radium-mint" size={32} />
          Digital Literacy Sandbox
        </h1>
        <p className="text-ink-900/60 dark:text-paper-100/60 mt-2">
          Turn threats into training. Complete micro-lessons to level up your Guardian rank.
        </p>
      </div>

      {/* Gamified Progress Tracker */}
      <GlassPanel className="mb-12 p-6 sm:p-8 border-radium-mint/30 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-radium-mint to-solar-flare flex items-center justify-center text-abyss-900 shadow-lg">
              <Award size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">Level 4 Guardian</h2>
              <p className="text-ink-900/60 dark:text-paper-100/60 font-medium">Protecting your local network.</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-black text-radium-mint">{currentScore} <span className="text-lg text-ink-900/40 dark:text-paper-100/40">/ {nextLevelScore} XP</span></div>
            <p className="text-xs uppercase tracking-widest opacity-60 font-bold mt-1">Next rank: Cyber Sentinel</p>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-4 bg-paper-200 dark:bg-abyss-900 rounded-full overflow-hidden border border-glass-border">
          <div 
            ref={progressRef}
            className="h-full bg-radium-mint rounded-full shadow-[0_0_15px_rgba(0,240,255,0.8)] w-0 relative"
          >
            {/* Animated shimmer effect inside the bar */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </GlassPanel>

      {/* Micro-Lessons Grid */}
      <h3 className="text-lg font-bold uppercase tracking-widest text-ink-900/80 dark:text-paper-100/80 mb-6 flex items-center gap-2">
        <ShieldCheck size={20} className="text-solar-flare" /> Recommended Training
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map((lesson) => {
          const isLocked = lesson.status === "locked";
          const isCompleted = lesson.status === "completed";
          const isAvailable = lesson.status === "available";
          const Icon = lesson.icon;

          return (
            <GlassPanel 
              key={lesson.id}
              className={cn(
                "lesson-card opacity-0 transition-all duration-300",
                isLocked ? "opacity-60 grayscale-[50%] bg-paper-200/20 dark:bg-abyss-900/20" : "hover:-translate-y-1 cursor-pointer",
                isAvailable ? "border-radium-mint/40 hover:border-radium-mint shadow-[0_0_20px_rgba(0,240,255,0.05)]" : "",
                isCompleted ? "border-solar-flare/20" : ""
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-xl",
                  isLocked ? "bg-ink-900/10 dark:bg-paper-100/10 text-ink-900/50 dark:text-paper-100/50" : 
                  isCompleted ? "bg-solar-flare/10 text-solar-flare" : 
                  "bg-radium-mint/10 text-radium-mint"
                )}>
                  <Icon size={24} />
                </div>
                
                {/* Status Badges */}
                {isLocked && <span className="flex items-center gap-1 text-xs font-bold uppercase text-ink-900/50 dark:text-paper-100/50 bg-paper-200 dark:bg-abyss-900 px-3 py-1 rounded-full"><Lock size={12}/> Locked</span>}
                {isCompleted && <span className="flex items-center gap-1 text-xs font-bold uppercase text-solar-flare bg-solar-flare/10 px-3 py-1 rounded-full"><CheckCircle size={12}/> Mastered</span>}
                {isAvailable && <span className="flex items-center gap-1 text-xs font-bold uppercase text-abyss-900 bg-radium-mint px-3 py-1 rounded-full animate-pulse"><Unlock size={12}/> Ready</span>}
              </div>

              <h4 className="text-xl font-bold mb-1 text-ink-900 dark:text-paper-100">{lesson.title}</h4>
              <p className="text-xs uppercase tracking-widest font-bold text-ink-900/40 dark:text-paper-100/40 mb-3">{lesson.category}</p>
              <p className="text-sm text-ink-900/70 dark:text-paper-100/70 leading-relaxed mb-6 h-10">
                {lesson.description}
              </p>

              <div className="pt-4 border-t border-glass-border flex justify-between items-center">
                <span className="text-sm font-bold opacity-70">
                  {isCompleted ? "Earned:" : "Reward:"}
                </span>
                <span className={cn(
                  "font-black text-lg",
                  isLocked ? "text-ink-900/40 dark:text-paper-100/40" : "text-radium-mint"
                )}>
                  +{isCompleted ? lesson.pointsEarned : lesson.reward} XP
                </span>
              </div>
            </GlassPanel>
          );
        })}
      </div>
      
    </div>
  );
}
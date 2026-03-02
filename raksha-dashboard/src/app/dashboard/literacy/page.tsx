"use client";

import { useState, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { 
  BookOpen, ShieldCheck, Lock, Unlock, Zap, Award, 
  CheckCircle, PlayCircle, Bot, ArrowRight, Loader2, Sparkles 
} from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const baseLessons = [
  { id: 1, title: "The Festival Urgency Trap", category: "Financial Fraud", description: "Learn how scammers use fake Diwali or Eid offers to steal OTPs.", reward: 50, requiredXp: 0, icon: Zap },
  { id: 2, title: "Family Emergency Spoofing", category: "Social Engineering", description: "Understand how attackers mimic family members in distress.", reward: 100, requiredXp: 50, icon: PlayCircle },
  { id: 3, title: "Aadhar & KYC Panic Links", category: "Phishing Vectors", description: "Master the art of identifying fake banking alerts.", reward: 150, requiredXp: 150, icon: Lock },
  { id: 4, title: "Job Offer Traps", category: "Employment Fraud", description: "Identify fake recruiters asking for 'processing fees' via WhatsApp.", reward: 200, requiredXp: 300, icon: Lock }
];

export default function LiteracyModule() {
  const [userXp, setUserXp] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [customLessons, setCustomLessons] = useState<any[]>([]); 
  const [isExpanding, setIsExpanding] = useState(false);
  const progressRef = useRef(null);

  // --- SAFE DATA MERGE ---
  // We explicitly handle customLessons as an array to prevent "map of undefined" crashes
  const safeCustomLessons = Array.isArray(customLessons) ? customLessons : [];
  const allLessons = [...baseLessons, ...safeCustomLessons.map(l => ({ ...l, icon: Sparkles }))];

  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [aiState, setAiState] = useState<"idle" | "generating" | "ready" | "evaluating" | "success" | "failed">("idle");
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const xp = user.user_metadata?.xp || 0;
      const completed = user.user_metadata?.completed_lessons || [];
      const custom = user.user_metadata?.custom_lessons || [];
      
      setUserXp(xp);
      setCompletedLessons(completed);
      setCustomLessons(custom);

      // FIX: Check if we need to generate a new module immediately upon login
      const currentTotal = baseLessons.length + custom.length;
      if (completed.length >= currentTotal) {
        expandSyllabus(xp, custom);
      }
    }
  };

  const expandSyllabus = async (currentXp: number, existingCustom: any[]) => {
    if (isExpanding) return;
    setIsExpanding(true);
    
    try {
      console.log("Ceiling hit. Requesting AI to generate next-gen module...");
      const res = await fetch(`http://localhost:8000/api/literacy/generate-syllabus?current_xp=${currentXp}`);
      
      if (res.ok) {
        const newModule = await res.json();
        const updatedCustom = [...existingCustom, newModule];
        
        // Update local state
        setCustomLessons(updatedCustom);
        
        // Save to Supabase
        await supabase.auth.updateUser({ 
          data: { custom_lessons: updatedCustom } 
        });
        console.log("New module added to your curriculum.");
      }
    } catch (e) {
      console.error("AI expansion failed. Ensure Python backend is running.", e);
    } finally {
      setIsExpanding(false);
    }
  };

  const handleStartSimulation = async (lesson: any) => {
    setActiveLesson(lesson);
    setAiState("generating");
    
    try {
      const res = await fetch(`http://localhost:8000/api/literacy/generate-quiz?title=${encodeURIComponent(lesson.title)}&category=${encodeURIComponent(lesson.category)}`);
      if (!res.ok) throw new Error("AI generation failed");
      
      const data = await res.json();
      setQuiz(data);
      setAiState("ready");
      setTimeout(() => animate('.ai-content', { opacity: [0, 1], y: [20, 0], duration: 600 }), 50);
    } catch (e) {
      console.error(e);
      setAiState("failed");
    }
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || !quiz) return;
    setAiState("evaluating");

    setTimeout(async () => {
      if (selectedAnswer === quiz.correctIndex) {
        setAiState("success");
        const newXp = userXp + activeLesson.reward;
        const newCompleted = [...completedLessons, activeLesson.id];
        
        setUserXp(newXp);
        setCompletedLessons(newCompleted);
        
        await supabase.auth.updateUser({
          data: { xp: newXp, completed_lessons: newCompleted }
        });

        // Check if this completion triggers another expansion
        if (newCompleted.length >= allLessons.length) {
          expandSyllabus(newXp, customLessons);
        }
      } else {
        setAiState("failed");
      }
    }, 1200);
  };

  // UI Animations
  useEffect(() => {
    const progressPercentage = Math.min(((userXp % 500) / 500) * 100, 100);
    if (progressRef.current && !activeLesson) {
      animate(progressRef.current, { width: ["0%", `${progressPercentage}%`], duration: 1500, ease: "outCubic" });
    }
  }, [userXp, activeLesson]);

  useEffect(() => {
    if (!activeLesson) {
      animate('.lesson-card', { y: [30, 0], opacity: [0, 1], delay: stagger(100), duration: 800, ease: "outExpo" });
    }
  }, [userXp, customLessons, activeLesson]);

  if (activeLesson) {
    return (
      <div className="max-w-3xl mx-auto w-full">
        <button onClick={() => { setActiveLesson(null); setAiState("idle"); setSelectedAnswer(null); }} className="mb-6 text-sm font-bold opacity-60 hover:text-radium-mint transition-colors">
          ← Exit Simulation
        </button>

        <GlassPanel className="p-8 border-radium-mint/30 shadow-2xl relative min-h-[500px]">
          <div className="flex items-center gap-3 mb-8 border-b border-glass-border pb-4">
            <Bot className="text-radium-mint" size={28} />
            <h2 className="text-2xl font-black">{activeLesson.title}</h2>
          </div>

          {aiState === "generating" && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="text-radium-mint animate-spin w-12 h-12 mb-4" />
              <p className="font-mono text-sm opacity-70">Bedrock is weaving a custom threat vector...</p>
            </div>
          )}

          {aiState === "ready" && quiz && (
            <div className="ai-content opacity-0 space-y-8">
              <div className="p-6 bg-paper-200 dark:bg-abyss-900 border-l-4 border-l-solar-flare rounded-r-2xl">
                <p className="text-xs font-bold uppercase tracking-widest text-solar-flare mb-3">Intercepted Scenario</p>
                <p className="text-lg leading-relaxed font-medium">{quiz.scenario}</p>
              </div>

              <div className="space-y-4">
                <p className="font-black text-lg">{quiz.question}</p>
                <div className="grid gap-3">
                  {quiz.options.map((opt: string, i: number) => (
                    <button 
                      key={i} onClick={() => setSelectedAnswer(i)}
                      className={cn("w-full text-left p-4 rounded-xl border transition-all font-bold text-sm", 
                        selectedAnswer === i ? "border-radium-mint bg-radium-mint/10 text-radium-mint shadow-[0_0_20px_rgba(0,240,255,0.1)]" : "border-glass-border bg-paper-200/50 dark:bg-abyss-800/50 hover:border-radium-mint/50")}
                    >
                      <span className="opacity-40 mr-3">0{i+1}.</span> {opt}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAnswerSubmit} disabled={selectedAnswer === null}
                className="w-full py-4 bg-ink-900 dark:bg-paper-100 text-paper-100 dark:text-ink-900 font-black rounded-xl disabled:opacity-50"
              >
                Evaluate Logic
              </button>
            </div>
          )}

          {(aiState === "evaluating") && (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-radium-mint w-10 h-10 mb-4" />
              <p className="font-mono text-xs font-bold opacity-60">ANALYZING RESPONSE VECTORS...</p>
            </div>
          )}

          {aiState === "success" && (
            <div className="py-12 text-center animate-in zoom-in">
              <CheckCircle className="text-radium-mint w-20 h-20 mx-auto mb-4" />
              <h3 className="text-3xl font-black mb-2">Neutralized!</h3>
              <div className="text-5xl font-black text-radium-mint">+{activeLesson.reward} XP</div>
              <button onClick={() => { setActiveLesson(null); setAiState("idle"); }} className="mt-8 px-8 py-3 bg-paper-200 dark:bg-abyss-900 font-bold rounded-xl border border-glass-border">Return to Academy</button>
            </div>
          )}

          {aiState === "failed" && (
            <div className="py-12 text-center animate-in zoom-in">
              <ShieldCheck className="text-neon-coral w-20 h-20 mx-auto mb-4" />
              <h3 className="text-3xl font-black mb-2 text-neon-coral">Vector Breach</h3>
              <p className="mb-6 opacity-60">Your analysis was incomplete. Review the scenario red flags.</p>
              <button 
                onClick={() => { 
                  setAiState("ready"); 
                  setSelectedAnswer(null); 
                  // Trigger the fade-in animation again!
                  setTimeout(() => animate('.ai-content', { opacity: [0, 1], y: [20, 0], duration: 600 }), 50);
                }} 
                className="mt-4 px-8 py-3 bg-neon-coral text-white font-bold rounded-xl"
              >
                Retry Simulation
              </button>
            </div>
          )}
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pb-20">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-ink-900 dark:text-paper-100 tracking-wide flex items-center gap-3">
          <BookOpen className="text-radium-mint" size={32} />
          Digital Literacy Academy
        </h1>
        <p className="text-ink-900/60 dark:text-paper-100/60 mt-2">
          Master the vectors of localized social engineering.
        </p>
      </div>

      <GlassPanel className="mb-12 p-8 border-radium-mint/30 shadow-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-radium-mint to-solar-flare flex items-center justify-center text-abyss-900 shadow-xl">
              <Award size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">Guardian Rank {Math.floor(userXp/500) + 1}</h2>
              <p className="text-sm font-bold opacity-60">Total Expertise: {userXp} XP</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-black text-radium-mint">{userXp % 500} <span className="text-lg opacity-40">/ 500 XP</span></div>
            <p className="text-xs uppercase tracking-widest opacity-60 font-black mt-1">Level Progress</p>
          </div>
        </div>

        <div className="w-full h-3 bg-paper-200 dark:bg-abyss-900 rounded-full overflow-hidden border border-glass-border">
          <div ref={progressRef} className="h-full bg-radium-mint rounded-full shadow-[0_0_20px_rgba(0,240,255,0.6)] w-0 relative" />
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allLessons.map((lesson, idx) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isLocked = !isCompleted && userXp < lesson.requiredXp;
          const isAvailable = !isCompleted && userXp >= lesson.requiredXp;
          const Icon = lesson.icon;

          return (
            <GlassPanel 
              key={idx}
              className={cn(
                "lesson-card opacity-0 transition-all duration-300",
                isLocked ? "opacity-50 grayscale bg-paper-200/20 dark:bg-abyss-900/20" : "hover:-translate-y-2",
                isAvailable ? "border-radium-mint/40" : "",
                isCompleted ? "border-solar-flare/30 bg-solar-flare/5" : ""
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl", isLocked ? "bg-ink-900/10 dark:bg-white/10" : isCompleted ? "bg-solar-flare/10 text-solar-flare" : "bg-radium-mint/10 text-radium-mint")}>
                  <Icon size={24} />
                </div>
                {isLocked && <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-abyss-900 text-white px-3 py-1 rounded-full"><Lock size={10}/> Locked</span>}
                {isCompleted && <span className="flex items-center gap-1 text-[10px] font-black uppercase text-solar-flare bg-solar-flare/10 px-3 py-1 rounded-full border border-solar-flare/20">Mastered</span>}
              </div>

              <h4 className="text-xl font-black mb-1">{lesson.title}</h4>
              <p className="text-[10px] uppercase tracking-tighter font-black opacity-40 mb-3">{lesson.category}</p>
              <p className="text-sm opacity-70 leading-relaxed mb-6 h-12 line-clamp-2">{lesson.description}</p>

              <div className="pt-4 border-t border-glass-border flex justify-between items-center">
                {isAvailable ? (
                  <button onClick={() => handleStartSimulation(lesson)} className="w-full py-3 bg-radium-mint text-abyss-900 font-black rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                    Start Simulation <Sparkles size={16} />
                  </button>
                ) : (
                  <div className="flex justify-between w-full items-center">
                    <span className="text-xs font-black uppercase opacity-40">{isCompleted ? "Earned" : "Reward"}</span>
                    <span className={cn("font-black text-xl", isLocked ? "opacity-30" : "text-radium-mint")}>+{lesson.reward} XP</span>
                  </div>
                )}
              </div>
            </GlassPanel>
          );
        })}

        {isExpanding && (
          <GlassPanel className="p-6 flex flex-col items-center justify-center border-dashed border-radium-mint animate-pulse">
            <Loader2 className="animate-spin text-radium-mint mb-3" />
            <p className="text-[10px] font-black uppercase opacity-60">Drafting Advanced Curriculum...</p>
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, ShieldAlert, ArrowLeft, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

function LiteracyModuleContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const threatId = searchParams.get("threat_id");

  const [moduleData, setModuleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!threatId) return;

    const generateModule = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/literacy/contextual?threat_id=${threatId}`);
        const data = await res.json();
        setModuleData(data);
      } catch (error) {
        console.error("Failed to fetch module:", error);
      } finally {
        setLoading(false);
      }
    };
    generateModule();
  }, [threatId]);

  const handleCompleteAndEarn = async () => {
    setClaiming(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user && moduleData) {
      // 1. Mark module as completed (CHANGED .table TO .from)
      await supabase.from('saved_modules')
        .update({ is_completed: true })
        .eq('id', moduleData.id);

      // 2. Add 50 EXP to the user's profile (CHANGED .table TO .from)
      const { data: profile } = await supabase.from('profiles').select('total_exp').eq('id', user.id).single();
      const newExp = (profile?.total_exp || 0) + 50;
      
      await supabase.from('profiles').update({ total_exp: newExp }).eq('id', user.id);

      // 3. Fire Confetti and Redirect
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => router.push('/dashboard/literacy'), 1500);
    }
  };

  // 1. The Real Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 border border-dashed rounded-[2rem] border-glass-border">
        <Loader2 className="animate-spin text-radium-mint mb-6" size={48} />
        <h2 className="text-xl font-bold animate-pulse">Raksha AI is writing a lesson...</h2>
        <p className="opacity-60 mt-2">Analyzing the specific mechanics of this threat</p>
      </div>
    );
  }

  // 2. The Error State
  if (!moduleData || moduleData.error || moduleData.detail) {
    return (
      <div className="text-center py-20 text-neon-coral flex flex-col items-center">
        <ShieldAlert size={48} className="mb-4 opacity-50" />
        <p>{moduleData?.error || moduleData?.detail || "Failed to generate the module."}</p>
        <button onClick={() => router.back()} className="mt-6 px-4 py-2 border border-neon-coral/50 rounded-lg hover:bg-neon-coral/10 transition">
          Go Back
        </button>
      </div>
    );
  }

  // 3. The Main UI (Fully Assembled)
  return (
    <div className="max-w-3xl mx-auto w-full p-4 sm:p-8 animate-fade-in-up">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-ink-900/60 hover:text-radium-mint transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="space-y-8">
        {/* Header */}
        <div className="bg-radium-mint/10 border border-radium-mint/20 p-8 rounded-3xl">
          <h1 className="text-3xl font-black text-radium-mint mb-4">{moduleData.title}</h1>
          <p className="text-lg opacity-80 leading-relaxed">{moduleData.overview}</p>
        </div>

        {/* Steps */}
        <div className="grid gap-4">
          {moduleData.steps?.map((step: any) => (
            <div key={step.stepNumber} className="bg-paper-200/10 dark:bg-abyss-900/20 p-6 rounded-2xl border border-glass-border flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-radium-mint text-abyss-900 flex items-center justify-center font-black text-xl">
                {step.stepNumber}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="opacity-70 leading-relaxed">{step.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Golden Rule */}
        <div className="flex items-center gap-4 bg-neon-coral/10 border border-neon-coral/20 p-6 rounded-2xl">
          <ShieldAlert className="text-neon-coral flex-shrink-0" size={32} />
          <div>
            <p className="text-xs uppercase tracking-widest text-neon-coral font-bold mb-1">Golden Rule</p>
            {/* Using an OR operator here in case the AI uses different casing */}
            <p className="font-medium">{moduleData.warning_rule || moduleData.warningRule}</p>
          </div>
        </div>
        
        {/* EXP CLAIM BUTTON */}
        {!moduleData.is_completed && (
          <button 
            onClick={handleCompleteAndEarn}
            disabled={claiming}
            className="w-full mt-12 bg-radium-mint text-abyss-900 font-black py-4 rounded-2xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            {claiming ? <Loader2 className="animate-spin" /> : <Trophy />}
            I Understand This Scam (+50 EXP)
          </button>
        )}
      </div>
    </div>
  );
}

export default function DynamicModulePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-32">
        <Loader2 className="animate-spin text-radium-mint" size={32} />
      </div>
    }>
      <LiteracyModuleContent />
    </Suspense>
  );
}
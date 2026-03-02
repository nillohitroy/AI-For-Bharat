"use client";

import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { Mic, Square, Play, Send, ShieldAlert, CheckCircle, AlertTriangle, X } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function ReportThreat() {
  const [content, setContent] = useState("");
  const [sender, setSender] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const formRef = useRef(null);

  // --- AUDIO RECORDING LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop()); // Turn off mic
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
      alert("Please allow microphone access to record voice notes.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const clearAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content && !audioBlob) return;
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    let uploadedAudioUrl = null;

    // 1. Upload Audio if it exists
    if (audioBlob) {
      const fileName = `${user?.id || 'anon'}_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('voice_reports')
        .upload(fileName, audioBlob);
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('voice_reports').getPublicUrl(fileName);
        uploadedAudioUrl = publicUrl;
      }
    }

    // 2. Insert into Database
    const { error } = await supabase.from('threats').insert({
      guardian_id: user?.id,
      sender: sender || "Unknown Source",
      content: content || "Audio-only report",
      audio_url: uploadedAudioUrl,
      risk_score: "MEDIUM", // Routes to Guardian Portal
      confidence: 50,
      cultural_context_flag: "User Reported Vector",
      status: "pending"
    });

    setIsSubmitting(false);

    if (!error) {
      setIsSuccess(true);
      setContent("");
      setSender("");
      clearAudio();
      
      animate('.success-icon', { scale: [0, 1], rotate: [90, 0], duration: 800, ease: "outElastic(1, .5)" });
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  useEffect(() => {
    animate(formRef.current, { y: [30, 0], opacity: [0, 1], duration: 800, ease: "outExpo" });
  }, []);

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink-900 dark:text-paper-100 tracking-wide flex items-center gap-3">
          <ShieldAlert className="text-neon-coral" size={32} />
          Report a Threat
        </h1>
        <p className="text-ink-900/60 dark:text-paper-100/60 mt-2">
          Help train the AI. Paste text or record a voice note of suspicious calls/messages.
        </p>
      </div>

      <GlassPanel ref={formRef} className="opacity-0 border-neon-coral/20 p-6 sm:p-8">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="success-icon text-radium-mint w-20 h-20 mb-4" />
            <h2 className="text-2xl font-black text-ink-900 dark:text-paper-100">Threat Logged!</h2>
            <p className="text-ink-900/60 dark:text-paper-100/60 mt-2">
              Routed to the Guardian Portal for peer verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="text-xs uppercase tracking-widest font-bold opacity-60 mb-2 block">Suspect Identity (Optional)</label>
              <input 
                type="text" value={sender} onChange={(e) => setSender(e.target.value)}
                placeholder="Phone number, UPI ID, or sender name"
                className="w-full bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl py-4 px-5 focus:outline-none focus:border-neon-coral text-ink-900 dark:text-paper-100"
              />
            </div>

            {/* Multimedia Input Area */}
            <div className="space-y-4">
              <label className="text-xs uppercase tracking-widest font-bold opacity-60 block">Payload Data (Text or Audio)</label>
              
              <textarea 
                value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the suspicious text message here..."
                rows={3}
                className="w-full bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl py-4 px-5 focus:outline-none focus:border-neon-coral text-ink-900 dark:text-paper-100 resize-none"
              />

              <div className="p-4 bg-paper-200/50 dark:bg-abyss-800/50 border border-glass-border rounded-xl flex items-center justify-between">
                {audioUrl ? (
                  <div className="flex items-center gap-4 w-full">
                    <audio src={audioUrl} controls className="h-10 w-full" />
                    <button type="button" onClick={clearAudio} className="p-2 text-neon-coral hover:bg-neon-coral/10 rounded-full">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium text-ink-900/60 dark:text-paper-100/60">Or record a voice note / suspicious call...</span>
                    <button 
                      type="button" 
                      onClick={isRecording ? stopRecording : startRecording}
                      className={cn("flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-all", isRecording ? "bg-neon-coral text-white animate-pulse" : "bg-ink-900 dark:bg-paper-100 text-paper-100 dark:text-ink-900")}
                    >
                      {isRecording ? <><Square size={16} /> Stop</> : <><Mic size={16} /> Record</>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || (!content && !audioBlob)}
              className="w-full py-4 bg-neon-coral text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,42,77,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Uploading..." : "Submit to Guardian Network"} <Send size={18} />
            </button>
          </form>
        )}
      </GlassPanel>
    </div>
  );
}
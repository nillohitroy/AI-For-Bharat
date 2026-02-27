"use client";

import { useVoiceReporting } from "@/hooks/useVoiceReporting";
import { VoiceRecorder } from "@/components/reporting/VoiceRecorder";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Send, AlertTriangle, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ReportPage() {
  const { isRecording, transcript, setTranscript, startRecording, stopRecording, error } = useVoiceReporting();
  const [senderId, setSenderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript) return;
    
    setIsSubmitting(true);
    // TODO: Send `transcript` and `senderId` to FastAPI/AWS backend for AI analysis
    setTimeout(() => {
      setIsSubmitting(false);
      setTranscript("");
      setSenderId("");
      alert("Report successfully submitted to the Guardian Network for analysis.");
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink-900 dark:text-paper-100 tracking-wide">
          Submit Threat Report
        </h1>
        <p className="text-ink-900/60 dark:text-paper-100/60 mt-2">
          Encountered a suspicious message or call? Report it here. Our AI will analyze the cultural context and update the community defense grid.
        </p>
      </div>

      <GlassPanel className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Sender Information */}
          <div>
            <label className="block text-sm font-bold text-ink-900 dark:text-paper-100 mb-2 uppercase tracking-wider opacity-80">
              Sender ID / Phone Number
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-3.5 text-ink-900/40 dark:text-paper-100/40" size={20} />
              <input 
                type="text"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                placeholder="e.g., VK-OFFERS or +91 98765..."
                className="w-full bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-radium-mint focus:ring-1 focus:ring-radium-mint text-ink-900 dark:text-paper-100 transition-all"
              />
            </div>
          </div>

          {/* Message Content & Voice Recording */}
          <div>
            <label className="block text-sm font-bold text-ink-900 dark:text-paper-100 mb-2 uppercase tracking-wider opacity-80 flex justify-between items-end">
              Message Content
              <span className="text-xs font-normal text-radium-mint">Voice Input Active</span>
            </label>
            
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <textarea 
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste the suspicious text here, or tap the microphone to dictate the scam..."
                className="flex-1 w-full h-40 bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl p-4 focus:outline-none focus:border-radium-mint focus:ring-1 focus:ring-radium-mint text-ink-900 dark:text-paper-100 transition-all resize-none"
              />
              
              <div className="flex flex-col items-center justify-center md:w-32 py-4">
                <VoiceRecorder 
                  isRecording={isRecording} 
                  onStart={startRecording} 
                  onStop={stopRecording} 
                />
                <span className="text-xs font-mono mt-4 opacity-60">
                  {isRecording ? "Listening..." : "Tap to Speak"}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-neon-coral bg-neon-coral/10 p-3 rounded-lg text-sm border border-neon-coral/20">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-glass-border flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting || !transcript}
              className="flex items-center gap-2 px-8 py-4 bg-radium-mint text-abyss-900 font-bold rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isSubmitting ? "Analyzing Context..." : "Submit to Analyzer"}
              <Send size={18} />
            </button>
          </div>
        </form>
      </GlassPanel>
    </div>
  );
}
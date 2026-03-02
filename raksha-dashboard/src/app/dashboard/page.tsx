"use client";

import { useState, useEffect } from "react";
import { ThreatCard } from "@/components/feed/ThreatCard";
import { ThreatModal } from "@/components/feed/ThreatModal";
import { Activity, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { animate } from "animejs";

export default function LiveScanFeed() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: any;

    const initializeFeed = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch historical data (Now including 'pending' to ensure visibility)
      const { data: initialData, error } = await supabase
        .from('threats')
        .select('*, peers(name)')
        .eq('guardian_id', user.id)
        // Removed .neq('status', 'pending') so all AI analysis shows up immediately
        .order('created_at', { ascending: false })
        .limit(10);

      if (initialData) setMessages(initialData);
      setLoading(false);

      // 2. Subscribe to REAL-TIME updates
      channel = supabase
        .channel('realtime_threats')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'threats',
            filter: `guardian_id=eq.${user.id}` 
          },
          async (payload) => {
            console.log("Incoming Vector Intercepted:", payload.new);
            
            // Enrich the real-time payload with the Peer Name
            // Realtime payloads are 'flat', so we fetch the relation manually
            const { data: peerInfo } = await supabase
              .from('peers')
              .select('name')
              .eq('id', payload.new.peer_id)
              .single();

            const enrichedMessage = {
              ...payload.new,
              peers: peerInfo // Injects the name so the card displays correctly
            };

            setMessages((prev) => [enrichedMessage, ...prev]);
            
            // Pulse animation for the live indicator
            animate('.scan-ping', { 
              scale: [1, 2.5], 
              opacity: [1, 0], 
              duration: 1200, 
              easing: 'easeOutExpo' 
            });
          }
        )
        .subscribe((status) => {
          console.log("Realtime Status:", status);
        });
    };

    initializeFeed();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="max-w-5xl mx-auto w-full">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="scan-ping absolute inline-flex h-full w-full rounded-full bg-neon-coral opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-coral"></span>
            </div>
            Live Scan Feed
          </h1>
          <p className="text-ink-900/60 dark:text-paper-100/60 mt-2 font-medium">
            Real-time cultural threat detection across your network.
          </p>
        </div>
        
        <div className="flex items-center gap-2 self-start px-4 py-2 bg-radium-mint/10 border border-radium-mint/20 rounded-full text-radium-mint text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck size={14} /> Neural Ingestion Active
        </div>
      </header>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-radium-mint mb-4" size={32} />
          <p className="font-mono text-xs opacity-50 uppercase tracking-tighter">Synchronizing with Raksha Core...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-glass-border rounded-[2rem] bg-paper-200/20 dark:bg-abyss-900/10">
          <Activity size={48} className="text-ink-900/10 dark:text-paper-100/10 mb-6" />
          <p className="text-ink-900/40 dark:text-paper-100/40 font-bold text-center px-6">
            No vectors detected yet. <br/> 
            <span className="text-xs font-normal opacity-60">Incoming scams from tracked peers will appear here.</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((msg) => (
            <ThreatCard 
              key={msg.id} 
              message={{
                id: msg.id,
                sender: msg.sender,
                content: msg.content,
                riskScore: msg.risk_score,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                culturalContextFlag: msg.cultural_context_flag,
                peerName: msg.peers?.name || "Unidentified Peer"
              }} 
              onClick={() => setSelectedThreat(msg)} 
            />
          ))}
        </div>
      )}

      {selectedThreat && (
        <ThreatModal 
          threat={{
            ...selectedThreat,
            timestamp: new Date(selectedThreat.created_at).toLocaleString(),
            riskScore: selectedThreat.risk_score,
            culturalContextFlag: selectedThreat.cultural_context_flag,
            peerName: selectedThreat.peers?.name || "Unidentified Peer"
          }}
          onClose={() => setSelectedThreat(null)} 
        />
      )}
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Users, AlertTriangle, ShieldQuestion, UserPlus, Phone, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function GuardianPortal() {
  const [activeTab, setActiveTab] = useState<"queue" | "network">("queue");
  const [queue, setQueue] = useState<any[]>([]);
  const [peers, setPeers] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Add Peer Form State
  const [newPeerName, setNewPeerName] = useState("");
  const [newPeerPhone, setNewPeerPhone] = useState("");
  const [newPeerRelation, setNewPeerRelation] = useState("");

  const listRef = useRef(null);
  const panelRef = useRef(null);

  // --- DYNAMIC DATA FETCHING ---
  useEffect(() => {
    fetchData();

    // Listen for live updates
    const subscription = supabase
      .channel('portal_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'threats' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'peers' }, fetchData)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch Peers
    const { data: peerData } = await supabase.from('peers').select('*').eq('guardian_id', user.id);
    setPeers(peerData || []);

    // Fetch Pending Threats linked to those peers
    const { data: threatData } = await supabase
      .from('threats')
      .select('*, peers(name, relation)')
      .eq('guardian_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    setQueue(threatData || []);
  };

  // --- ADD A TRUSTED PEER ---
  const handleAddPeer = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('peers').insert({
      guardian_id: user.id,
      name: newPeerName,
      phone_number: newPeerPhone,
      relation: newPeerRelation
    });

    setNewPeerName(""); setNewPeerPhone(""); setNewPeerRelation("");
    fetchData();
  };

  // --- AI THREAT ANALYSIS ---
  const handleAnalyze = async (threat: any) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Call your fast Gemini-powered Python backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/literacy/contextual?threat_id=${threat.id}`);
      
      if (!res.ok) throw new Error("Failed to generate analysis");
      
      const data = await res.json();
      setAnalysisResult(data);
      
      // Automatically mark the threat as processed so it leaves the pending queue on the next refresh
      await supabase.from('threats').update({ status: 'analyzed' }).eq('id', threat.id);
      
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- ENTRY ANIMATIONS ---
  useEffect(() => {
    if (listRef.current && activeTab === "queue") {
      animate('.queue-item', { x: [-20, 0], opacity: [0, 1], delay: stagger(100), duration: 800, ease: "outExpo" });
    }
  }, [queue, activeTab]);

  useEffect(() => {
    if (selectedItem && panelRef.current) {
      animate(panelRef.current, { y: [20, 0], opacity: [0, 1], duration: 400, ease: "outQuart" });
    }
  }, [selectedItem]);

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink-900 dark:text-paper-100 tracking-wide flex items-center gap-3">
            <Users className="text-solar-flare" size={32} />
            Guardian Network
          </h1>
          <p className="text-ink-900/60 dark:text-paper-100/60 mt-2">
            Protect your trusted peers. Review suspicious payloads forwarded from their devices.
          </p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-paper-200 dark:bg-abyss-800 p-1 rounded-xl border border-glass-border">
          <button 
            onClick={() => { setActiveTab("queue"); setSelectedItem(null); setAnalysisResult(null); setIsAnalyzing(false); }}
            className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-all", activeTab === "queue" ? "bg-solar-flare text-abyss-900 shadow-md" : "text-ink-900/60 dark:text-paper-100/60")}
          >
            Verification Queue
          </button>
          <button 
            onClick={() => { setActiveTab("network"); setSelectedItem(null); setAnalysisResult(null); setIsAnalyzing(false); }}
            className={cn("px-4 py-2 text-sm font-bold rounded-lg transition-all", activeTab === "network" ? "bg-radium-mint text-abyss-900 shadow-md" : "text-ink-900/60 dark:text-paper-100/60")}
          >
            Trusted Peers
          </button>
        </div>
      </div>

      {activeTab === "queue" ? (
        // --- TAB 1: VERIFICATION QUEUE ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-solar-flare flex items-center gap-2">
              <AlertTriangle size={16} /> Needs Review ({queue.length})
            </h3>
            
            <div ref={listRef} className="space-y-3">
              {queue.length === 0 ? (
                <div className="text-center p-8 opacity-50 border border-dashed border-glass-border rounded-xl text-sm">
                  No pending threats from your peers.
                </div>
              ) : (
                queue.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => { setSelectedItem(item); setAnalysisResult(null); setIsAnalyzing(false); }}
                    className={cn("queue-item cursor-pointer p-4 rounded-xl border transition-all duration-300", selectedItem?.id === item.id ? "bg-solar-flare/10 border-solar-flare shadow-[0_0_15px_rgba(255,179,0,0.1)]" : "bg-paper-200/50 dark:bg-abyss-800/50 border-glass-border hover:border-solar-flare/50")}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm truncate pr-2 flex items-center gap-2">
                        <Phone size={14} className="opacity-50" /> {item.peers?.name || "Unknown Peer"}
                      </span>
                      <span className="text-xs font-mono opacity-50 whitespace-nowrap text-neon-coral">AI Unsure</span>
                    </div>
                    <p className="text-xs opacity-70 line-clamp-2">{item.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedItem ? (
              <div ref={panelRef} className="opacity-0">
                <GlassPanel className="border-solar-flare/30 shadow-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-glass-border">
                    <ShieldQuestion className="text-solar-flare" size={28} />
                    <h2 className="text-xl sm:text-2xl font-black">Analyze Payload</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <span className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1 block">Targeted Peer</span>
                      <div className="text-base sm:text-lg font-mono bg-paper-200 dark:bg-abyss-900 p-3 rounded-lg border border-glass-border text-radium-mint">
                        {selectedItem.peers?.name || "Unknown"} ({selectedItem.peers?.relation || "Peer"})
                      </div>
                    </div>

                    <div>
                      <span className="text-xs uppercase tracking-widest font-bold opacity-50 mb-1 block">Intercepted Content</span>
                      <div className="text-base sm:text-lg bg-paper-200 dark:bg-abyss-900 p-4 sm:p-5 rounded-lg border border-glass-border leading-relaxed border-l-4 border-l-solar-flare">
                        "{selectedItem.content}"
                      </div>
                    </div>

                    {/* --- THE AI ANALYSIS SECTION --- */}
                    {!analysisResult && !isAnalyzing ? (
                       <button 
                         onClick={() => handleAnalyze(selectedItem)}
                         className="w-full py-4 mt-4 bg-radium-mint text-abyss-900 font-black rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2"
                       >
                         Trigger Raksha Threat Analysis
                       </button>
                    ) : isAnalyzing ? (
                      <div className="py-8 flex flex-col items-center justify-center text-center bg-abyss-900/40 rounded-xl border border-glass-border">
                        <Loader2 className="w-8 h-8 text-radium-mint animate-spin mb-4" />
                        <h3 className="font-bold text-radium-mint">Raksha is dissecting the threat...</h3>
                        <p className="text-xs opacity-50 mt-1 uppercase tracking-widest">Extracting psychological hooks</p>
                      </div>
                    ) : analysisResult ? (
                      <div className="space-y-4 mt-6 pt-6 border-t border-glass-border animate-in slide-in-from-bottom-4">
                        <h3 className="text-xl font-black text-radium-mint">{analysisResult.title}</h3>
                        <p className="text-sm opacity-80 leading-relaxed mb-4">{analysisResult.overview}</p>
                        
                        <div className="grid gap-3">
                          {analysisResult.steps?.map((step: any, idx: number) => (
                            <div key={idx} className="p-4 bg-paper-200/50 dark:bg-abyss-800/50 rounded-xl border border-glass-border">
                              <h4 className="font-bold text-sm mb-1 text-radium-mint">Step {step.stepNumber}: {step.title}</h4>
                              <p className="text-sm opacity-70 leading-relaxed">{step.content}</p>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-neon-coral/10 border border-neon-coral/30 rounded-xl mt-4">
                          <p className="text-sm font-black text-neon-coral flex items-center gap-2">
                            <AlertTriangle size={16} /> Golden Rule
                          </p>
                          <p className="text-sm font-bold mt-1 opacity-90">{analysisResult.warning_rule || analysisResult.warningRule}</p>
                        </div>

                        <button 
                          onClick={() => {
                             // Dismiss from the queue after resolving
                             setQueue(prev => prev.filter(item => item.id !== selectedItem.id));
                             setSelectedItem(null);
                             setAnalysisResult(null);
                          }}
                          className="w-full py-4 mt-4 bg-solar-flare text-abyss-900 font-black rounded-xl hover:scale-[1.02] transition-transform"
                        >
                          Push Lesson to {selectedItem.peers?.name || "Peer"}'s Device
                        </button>
                      </div>
                    ) : null}
                  </div>
                </GlassPanel>
              </div>
            ) : (
              <GlassPanel className="flex flex-col items-center justify-center min-h-[400px] opacity-60 border-dashed border-glass-border">
                <Users size={64} className="mb-4 text-ink-900/40 dark:text-paper-100/40" />
                <p className="text-lg font-medium text-center">Select a payload from the queue to analyze.</p>
              </GlassPanel>
            )}
          </div>
        </div>
      ) : (
        // --- TAB 2: TRUSTED NETWORK MANAGEMENT ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <GlassPanel className="lg:col-span-1 p-6 border-radium-mint/30">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2"><UserPlus size={20} className="text-radium-mint" /> Add New Peer</h3>
            <form onSubmit={handleAddPeer} className="space-y-4">
              <input type="text" value={newPeerName} onChange={(e)=>setNewPeerName(e.target.value)} placeholder="Full Name (e.g., Anjali Sharma)" required className="w-full bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl py-3 px-4 focus:border-radium-mint outline-none text-sm" />
              <input type="tel" value={newPeerPhone} onChange={(e)=>setNewPeerPhone(e.target.value)} placeholder="Phone Number (+91...)" required className="w-full bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl py-3 px-4 focus:border-radium-mint outline-none text-sm" />
              <input type="text" value={newPeerRelation} onChange={(e)=>setNewPeerRelation(e.target.value)} placeholder="Relation (e.g., Mother)" required className="w-full bg-paper-200 dark:bg-abyss-900 border border-glass-border rounded-xl py-3 px-4 focus:border-radium-mint outline-none text-sm" />
              <button type="submit" className="w-full py-3 bg-radium-mint text-abyss-900 font-bold rounded-xl hover:scale-[1.02] transition-transform">Register Peer Device</button>
            </form>
          </GlassPanel>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-radium-mint mb-2">My Protected Nodes ({peers.length})</h3>
            {peers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-glass-border rounded-xl opacity-60">You haven't added any peers to your network yet.</div>
            ) : (
              peers.map(peer => (
                <div key={peer.id} className="flex items-center justify-between p-4 bg-paper-200/50 dark:bg-abyss-800/50 border border-glass-border rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-radium-mint/20 text-radium-mint rounded-full flex items-center justify-center font-black">
                      {peer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-ink-900 dark:text-paper-100">{peer.name}</p>
                      <p className="text-xs text-ink-900/60 dark:text-paper-100/60 font-mono">{peer.phone_number} &bull; {peer.relation}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-radium-mint/10 text-radium-mint text-xs font-bold rounded-full border border-radium-mint/20">Active Shield</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
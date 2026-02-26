"use client";

import { useState, useEffect } from "react";
import { ThreatMessage } from "@/types/threat";

export function useWebSockets(url: string) {
  const [messages, setMessages] = useState<ThreatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // In a real scenario, this connects to your Python FastAPI WebSocket URL.
    // For local testing, we initialize it safely.
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(url);

      ws.onopen = () => setIsConnected(true);
      
      ws.onmessage = (event) => {
        const newMessage: ThreatMessage = JSON.parse(event.data);
        // Add new message to the top of the feed
        setMessages((prev) => [newMessage, ...prev]);
      };

      ws.onclose = () => setIsConnected(false);
    } catch (error) {
      console.error("WebSocket connection failed:", error);
    }

    // Cleanup on unmount
    return () => {
      if (ws) ws.close();
    };
  }, [url]);

  // Hackathon fallback: A function to manually inject a mock threat for demo purposes
  const injectMockThreat = (mockMessage: ThreatMessage) => {
    setMessages((prev) => [mockMessage, ...prev]);
  };

  return { messages, isConnected, injectMockThreat };
}
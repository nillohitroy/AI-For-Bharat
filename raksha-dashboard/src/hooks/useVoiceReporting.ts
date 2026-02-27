"use client";

import { useState, useEffect, useCallback } from "react";

// Fallback for TypeScript to recognize the Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoiceReporting() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = true;
        reco.interimResults = true;
        reco.lang = "en-IN"; // Default to Indian English, can be swapped to 'hi-IN', 'ta-IN', etc.

        reco.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        reco.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setError("Microphone access denied or audio not detected.");
          setIsRecording(false);
        };

        reco.onend = () => {
          setIsRecording(false);
        };

        setRecognition(reco);
      } else {
        setError("Voice reporting is not supported in this browser.");
      }
    }
  }, []);

  const startRecording = useCallback(() => {
    if (recognition) {
      setError(null);
      setTranscript("");
      recognition.start();
      setIsRecording(true);
    }
  }, [recognition]);

  const stopRecording = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  }, [recognition]);

  return { isRecording, transcript, setTranscript, startRecording, stopRecording, error };
}
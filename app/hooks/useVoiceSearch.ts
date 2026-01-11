"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ALL_TOOLS } from "@/app/lib/tools-data";
import { showToast } from "@/app/shared/Toast";

export function useVoiceSearch() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const router = useRouter();

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      showToast("Voice search is not supported in this browser.", "error");
      return;
    }

    // @ts-ignore
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleCommand(text);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  }, []);

  const handleCommand = (text: string) => {
    const lower = text.toLowerCase();
    
    // 1. Navigation Commands
    const tool = ALL_TOOLS.find(t => 
      lower.includes(t.name.toLowerCase()) || 
      lower.includes(t.desc.toLowerCase())
    );

    if (tool) {
      // "Opening Smart Budget..." effect could go here
      router.push(tool.href);
    } else if (lower.includes("dashboard") || lower.includes("home")) {
      router.push("/dashboard");
    }
  };

  return { isListening, transcript, startListening };
}

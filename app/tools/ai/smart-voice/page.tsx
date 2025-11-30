"use client";
import React, { useState, useEffect } from "react";
import { Mic, Play, Square, Volume2 } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function SmartVoice() {
  const [text, setText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  useEffect(() => {
    const loadVoices = () => {
       setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speak = () => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
       utterance.voice = voices.find(v => v.name === selectedVoice) || null;
    }
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Smart Voice</h1>
        <p className="text-slate-500">Offline Text-to-Speech Engine.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
         <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            className="w-full h-64 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500/50 text-lg" 
            placeholder="Type something to speak..."
         />
         
         <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <select 
               value={selectedVoice} 
               onChange={e => setSelectedVoice(e.target.value)} 
               className="w-full md:w-1/2 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
               <option value="">Default Voice</option>
               {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
            </select>

            <div className="flex gap-3 w-full md:w-auto">
               {isSpeaking ? (
                 <Button onClick={stop} variant="danger" className="flex-1 md:w-32"><Square size={18} className="mr-2"/> Stop</Button>
               ) : (
                 <Button onClick={speak} className="flex-1 md:w-32"><Volume2 size={18} className="mr-2"/> Speak</Button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}

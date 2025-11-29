"use client";
import React, { useState, useEffect } from "react";
import { Mic, Play, Pause, StopCircle, Volume2 } from "lucide-react";
import Toast, { showToast } from "../../../shared/Toast";

export default function SmartVoice() {
  const [text, setText] = useState("Welcome to Smart Voice. I can read any text you type here using advanced neural speech synthesis directly in your browser.");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
        const v = window.speechSynthesis.getVoices();
        setVoices(v);
        if(v.length > 0) setSelectedVoice(v[0].name);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = () => {
    if (isPaused) { window.speechSynthesis.resume(); setIsPaused(false); setIsSpeaking(true); return; }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if(voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); };
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    showToast("Speaking...");
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-fuchsia-600 text-white  "><Mic size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Voice</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Text-to-Speech</p></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x overflow-hidden">
        
        {/* Editor */}
        <div className="col-span-2 p-6 flex flex-col">
            <textarea 
                value={text} 
                onChange={e=>setText(e.target.value)} 
                className="flex-1 w-full p-6 bg-surface dark:bg-slate-800 dark:bg-surface border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-fuchsia-200 resize-none text-lg leading-relaxed text-main dark:text-slate-300 shadow-lg shadow-slate-200/50 dark:shadow-none"
                placeholder="Type something to speak..."
            />
        </div>

        {/* Controls */}
        <div className="col-span-1 bg-surface dark:bg-slate-800 dark:bg-surface p-8 space-y-8 overflow-auto">
            <div className="space-y-4">
                <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase block">Voice Selection</label>
                <select value={selectedVoice} onChange={e=>setSelectedVoice(e.target.value)} className="w-full p-3 border rounded-xl text-sm font-medium outline-none focus:border-fuchsia-500">
                    {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </select>
            </div>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Speed</label><span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400">{rate}x</span></div>
                    <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full accent-fuchsia-600"/>
                </div>
                <div>
                    <div className="flex justify-between mb-2"><label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Pitch</label><span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400">{pitch}</span></div>
                    <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={e=>setPitch(Number(e.target.value))} className="w-full accent-fuchsia-600"/>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                {isSpeaking && !isPaused ? (
                    <button onClick={pause} className="py-4 bg-amber-100 text-amber-700 rounded-xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-amber-200 transition"><Pause size={24}/> Pause</button>
                ) : (
                    <button onClick={speak} className="py-4 bg-fuchsia-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-fuchsia-700 transition shadow-lg shadow-fuchsia-200"><Play size={24}/> Speak</button>
                )}
                <button onClick={stop} className="py-4 bg-slate-100 text-muted dark:text-muted/70 dark:text-muted/70 rounded-xl font-bold flex flex-col items-center justify-center gap-2 hover:bg-slate-200 transition"><StopCircle size={24}/> Stop</button>
            </div>
            
            <div className="bg-fuchsia-50 p-4 rounded-xl flex items-center gap-3 text-fuchsia-800">
                <Volume2 size={20}/>
                <span className="text-xs font-bold">100% Offline Synthesis</span>
            </div>
        </div>
      </div>
    </div>
  );
}

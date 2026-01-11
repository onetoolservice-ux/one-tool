#!/bin/bash

echo "í±ï¸  Deploying Voice Command & Computer Vision..."

# 1. CREATE GLOBAL VOICE SEARCH HOOK
# Uses the Web Speech API (Native Browser Feature)
mkdir -p app/hooks
cat > app/hooks/useVoiceSearch.ts << 'HOOK_EOF'
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ALL_TOOLS } from "@/app/lib/tools-data";

export function useVoiceSearch() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const router = useRouter();

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice search is not supported in this browser.");
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
HOOK_EOF

# 2. UPDATE COMMAND MENU (Add Mic Icon)
cat > app/components/layout/CommandMenu.tsx << 'MENU_EOF'
"use client";

import { Search, Mic, Loader2 } from "lucide-react";
import { useUI } from "@/app/lib/ui-context";
import { useEffect, useRef } from "react";
import { useVoiceSearch } from "@/app/hooks/useVoiceSearch";

export default function CommandMenu() {
  const { searchQuery, setSearchQuery } = useUI();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening } = useVoiceSearch();

  // Sync voice result to search
  useEffect(() => {
    if (transcript) setSearchQuery(transcript);
  }, [transcript, setSearchQuery]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
      <div className="relative flex items-center bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500">
        <div className="pl-5 text-slate-400 group-hover:text-indigo-500 transition-colors">
           <Search size={20} />
        </div>
        <input 
          ref={inputRef}
          type="text" 
          placeholder={isListening ? "Listening..." : "Search tools or say 'Open Budget'..."}
          className="w-full h-12 md:h-14 px-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-base md:text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="pr-4 flex items-center gap-2">
           <button 
             onClick={startListening}
             className={\`p-2 rounded-full transition-all \${isListening ? 'bg-rose-500 text-white animate-pulse' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}\`}
             title="Voice Search"
           >
             {isListening ? <Loader2 size={18} className="animate-spin"/> : <Mic size={18}/>}
           </button>
           
           <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-[10px]">CTRL</span> K
           </div>
        </div>
      </div>
    </div>
  );
}
MENU_EOF


# 3. BUILD SMART VOICE (Text-to-Speech Tool)
mkdir -p app/tools/ai/smart-voice
cat > app/tools/ai/smart-voice/VoiceClient.tsx << 'VOICE_EOF'
"use client";
import React, { useState, useEffect } from "react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Mic, Play, Pause, Volume2, Download } from "lucide-react";

export default function VoiceClient() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  useEffect(() => {
    const loadVoices = () => {
      const vs = window.speechSynthesis.getVoices();
      setVoices(vs);
      if (vs.length > 0) setSelectedVoice(vs[0].name);
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const speak = () => {
    if (!text) return;
    if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setSpeaking(true);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <ToolShell title="Smart Voice TTS" description="Convert text to lifelike speech using browser's neural engine." category="AI" icon={<Mic className="w-5 h-5 text-fuchsia-500" />}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-1">
             <textarea 
               value={text} 
               onChange={(e) => setText(e.target.value)}
               className="w-full h-[300px] p-6 bg-transparent outline-none resize-none text-lg placeholder:text-slate-300 dark:text-white"
               placeholder="Paste text here to listen..."
             />
          </Card>
          <div className="flex gap-3">
             <Button onClick={speak} disabled={speaking} icon={<Play size={20}/>}>{speaking ? "Speaking..." : "Play Audio"}</Button>
             <Button variant="secondary" onClick={stop} disabled={!speaking} icon={<Pause size={20}/>}>Stop</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-6">
             <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Volume2 size={18}/> Voice Settings</h3>
             
             <div>
               <label className="text-xs font-bold text-slate-500 mb-2 block">VOICE</label>
               <select 
                 value={selectedVoice} 
                 onChange={(e) => setSelectedVoice(e.target.value)}
                 className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none"
               >
                 {voices.map(v => (
                   <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                 ))}
               </select>
             </div>

             <div>
               <label className="text-xs font-bold text-slate-500 mb-2 block">SPEED: {rate}x</label>
               <input type="range" min="0.5" max="2" step="0.1" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))} className="w-full accent-fuchsia-500"/>
             </div>

             <div>
               <label className="text-xs font-bold text-slate-500 mb-2 block">PITCH: {pitch}</label>
               <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))} className="w-full accent-fuchsia-500"/>
             </div>
          </Card>
        </div>
      </div>
    </ToolShell>
  );
}
VOICE_EOF

cat > app/tools/ai/smart-voice/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import VoiceClient from "./VoiceClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
export const metadata: Metadata = { title: "Text to Speech Online - Free TTS | One Tool" };
export default function Page() {
  return <><ToolSchema name="Text to Speech" description="Convert text to audio." path="/tools/ai/smart-voice" category="WebApplication" /><VoiceClient /></>;
}
PAGE_EOF


# 4. BUILD SMART VISION (Object Detection with Transformers.js)
mkdir -p app/tools/ai/vision
cat > app/tools/ai/vision/VisionClient.tsx << 'VISION_EOF'
"use client";
import React, { useState, useRef } from "react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { Eye, Upload, Loader2 } from "lucide-react";
import Script from "next/script";

export default function VisionClient() {
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState("Ready to inspect.");
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const detectorRef = useRef<any>(null);

  const handleScriptLoad = async () => {
    setStatus("AI Vision Engine Loaded.");
  };

  const detectObjects = async () => {
    if (!image || !imgRef.current) return;
    setLoading(true);
    setBoxes([]);
    
    try {
      // @ts-ignore
      const transformers = window.transformers;
      if (!transformers) throw new Error("AI Engine not loaded.");

      if (!detectorRef.current) {
        setStatus("Downloading Vision Model (80MB)...");
        transformers.env.allowLocalModels = false;
        transformers.env.useBrowserCache = true;
        detectorRef.current = await transformers.pipeline('object-detection', 'Xenova/detr-resnet-50');
      }

      setStatus("Scanning image...");
      const output = await detectorRef.current(image);
      setBoxes(output);
      setStatus(\`Found \${output.length} objects.\`);

    } catch (e: any) {
      console.error(e);
      setStatus("Error: " + e.message);
    }
    setLoading(false);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
      setBoxes([]);
      setStatus("Image loaded. Click 'Detect'.");
    }
  };

  return (
    <ToolShell title="AI Object Detection" description="Identify objects in images using local AI." category="AI" icon={<Eye className="w-5 h-5 text-blue-500" />}>
      <Script 
        src="https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2" 
        strategy="lazyOnload"
        onLoad={handleScriptLoad}
      />
      
      <div className="grid gap-6 max-w-4xl mx-auto">
        <div className="flex gap-4 justify-center">
           <label className="cursor-pointer bg-white dark:bg-slate-800 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition flex items-center gap-2">
             <Upload size={20}/> <span>Upload Image</span>
             <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
           </label>
           <Button onClick={detectObjects} disabled={!image || loading} icon={loading ? <Loader2 className="animate-spin"/> : <Eye/>}>
             {loading ? "Scanning..." : "Detect Objects"}
           </Button>
        </div>

        <Card className="relative overflow-hidden min-h-[400px] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
           {image ? (
             <div className="relative inline-block">
                <img ref={imgRef} src={image} alt="Analysis" className="max-w-full max-h-[600px] rounded-lg" />
                {boxes.map((box, i) => (
                  <div 
                    key={i}
                    className="absolute border-2 border-rose-500 bg-rose-500/20"
                    style={{
                      left: box.box.xmin,
                      top: box.box.ymin,
                      width: box.box.xmax - box.box.xmin,
                      height: box.box.ymax - box.box.ymin,
                    }}
                  >
                    <span className="absolute -top-6 left-0 bg-rose-500 text-white text-xs px-2 py-1 rounded font-bold">
                      {box.label} ({Math.round(box.score * 100)}%)
                    </span>
                  </div>
                ))}
             </div>
           ) : (
             <p className="text-slate-400">Upload an image to see AI vision in action.</p>
           )}
        </Card>
        <p className="text-center text-sm text-slate-500 font-mono">{status}</p>
      </div>
    </ToolShell>
  );
}
VISION_EOF

cat > app/tools/ai/vision/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import VisionClient from "./VisionClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
export const metadata: Metadata = { title: "AI Object Detection - Computer Vision | One Tool" };
export default function Page() {
  return <><ToolSchema name="AI Vision" description="Detect objects in images client-side." path="/tools/ai/vision" category="WebApplication" /><VisionClient /></>;
}
PAGE_EOF

echo "âœ… Voice & Vision Deployed."
echo "í±‰ Restart 'npm run dev' and test the Microphone in the search bar!"

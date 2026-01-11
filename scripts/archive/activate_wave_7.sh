#!/bin/bash

echo "Ì∑ò Activating Wave 7: Health, Games & Editor..."

# =========================================================
# 1. HEALTH: MIND GAMES (Memory Match)
# =========================================================
echo "ÌæÆ Activating Mind Games..."
cat > app/tools/health/games/page.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import { RefreshCw, Trophy } from "lucide-react";
import Button from "@/app/shared/ui/Button";

const EMOJIS = ["ÌΩé", "Ìµë", "Ìµ¶", "Ìµï", "ÌΩá", "ÌΩâ", "ÌΩå", "ÌΩç"];

export default function MemoryGame() {
  const [cards, setCards] = useState<{id: number, val: string, flipped: boolean, matched: boolean}[]>([]);
  const [turns, setTurns] = useState(0);
  const [choiceOne, setChoiceOne] = useState<any>(null);
  const [choiceTwo, setChoiceTwo] = useState<any>(null);
  const [disabled, setDisabled] = useState(false);

  const shuffleCards = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((val) => ({ id: Math.random(), val, flipped: false, matched: false }));
    
    setChoiceOne(null);
    setChoiceTwo(null);
    setCards(shuffled);
    setTurns(0);
  };

  const handleChoice = (card: any) => {
     if(choiceOne) setChoiceTwo(card);
     else setChoiceOne(card);
  };

  useEffect(() => {
    if (choiceOne && choiceTwo) {
       setDisabled(true);
       if(choiceOne.val === choiceTwo.val) {
          setCards(prev => prev.map(c => (c.val === choiceOne.val ? {...c, matched: true} : c)));
          resetTurn();
       } else {
          setTimeout(() => resetTurn(), 1000);
       }
    }
  }, [choiceOne, choiceTwo]);

  const resetTurn = () => {
     setChoiceOne(null);
     setChoiceTwo(null);
     setTurns(t => t + 1);
     setDisabled(false);
  };

  useEffect(shuffleCards, []);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Memory Match</h1>
        <p className="text-slate-500">Train your brain. Find the pairs.</p>
      </div>

      <div className="flex justify-between items-center px-4">
         <Button onClick={shuffleCards} variant="secondary"><RefreshCw size={16} className="mr-2"/> Restart</Button>
         <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Trophy size={18} className="text-amber-500"/> Turns: {turns}</div>
      </div>

      <div className="grid grid-cols-4 gap-3 aspect-square">
         {cards.map(card => (
            <div 
               key={card.id} 
               className="relative w-full h-full cursor-pointer"
               onClick={() => !disabled && !card.flipped && !card.matched && handleChoice(card)}
            >
               <div className={`absolute inset-0 rounded-xl transition-all duration-300 transform flex items-center justify-center text-3xl shadow-sm border-2 ${card.flipped || card.matched || choiceOne === card || choiceTwo === card ? 'bg-white dark:bg-slate-800 border-indigo-500 rotate-0' : 'bg-indigo-600 border-indigo-600 rotate-y-180'}`}>
                  {(card.flipped || card.matched || choiceOne === card || choiceTwo === card) ? card.val : "‚ùì"}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 2. HEALTH: YOGA GUIDE
# =========================================================
echo "Ì∑ò Activating Yoga Guide..."
cat > app/tools/health/yoga/page.tsx << 'TS_END'
"use client";
import React from "react";
import { CheckCircle2 } from "lucide-react";

const POSES = [
  { name: "Mountain Pose", desc: "Tadasana. Stand tall with feet together, shoulders relaxed, weight evenly distributed.", time: "1 min" },
  { name: "Downward Dog", desc: "Adho Mukha Svanasana. Hands and feet on floor, hips lifted back and up.", time: "2 min" },
  { name: "Warrior I", desc: "Virabhadrasana I. High lunge with back foot flat, arms raised overhead.", time: "1 min/side" },
  { name: "Tree Pose", desc: "Vrksasana. Stand on one leg, other foot on thigh/calf. Hands at heart.", time: "1 min/side" },
  { name: "Child's Pose", desc: "Balasana. Kneel and fold forward, forehead to floor. Rest and breathe.", time: "3 min" },
  { name: "Cobra Pose", desc: "Bhujangasana. Lying prone, lift chest using back muscles. Gentle backbend.", time: "1 min" }
];

export default function YogaGuide() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Daily Yoga Flow</h1>
        <p className="text-slate-500">Simple poses to start your day right.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         {POSES.map((pose, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-4 items-start hover:shadow-md transition-all group">
               <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-lg flex-shrink-0">
                  {i+1}
               </div>
               <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors">{pose.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">{pose.desc}</p>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><CheckCircle2 size={12}/> {pose.time}</span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. HEALTH: MEDITATION
# =========================================================
echo "Ì∑ò Activating Meditation..."
cat > app/tools/health/meditation/page.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function Meditation() {
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins
  const [sound, setSound] = useState(true);

  useEffect(() => {
     let interval: any = null;
     if (active && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
     } else {
        clearInterval(interval);
     }
     return () => clearInterval(interval);
  }, [active, timeLeft]);

  const format = (s: number) => {
     const m = Math.floor(s / 60).toString().padStart(2, '0');
     const sec = (s % 60).toString().padStart(2, '0');
     return `${m}:${sec}`;
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-center space-y-10">
       <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Focus Timer</h1>
        <p className="text-slate-500">Clear your mind. Just breathe.</p>
      </div>

      <div className="relative h-64 w-64 mx-auto flex items-center justify-center">
         <div className={`absolute inset-0 bg-indigo-500/10 rounded-full animate-ping ${active ? 'opacity-100' : 'opacity-0'}`} style={{animationDuration: '3s'}}></div>
         <div className="relative w-56 h-56 bg-white dark:bg-slate-800 rounded-full border-4 border-indigo-100 dark:border-slate-700 flex items-center justify-center shadow-xl z-10">
            <div className="text-6xl font-mono font-bold text-slate-800 dark:text-slate-200 tracking-widest">
                {format(timeLeft)}
            </div>
         </div>
      </div>

      <div className="flex justify-center gap-4">
         <Button onClick={() => setActive(!active)} className="w-32 h-12 text-lg shadow-indigo-500/20 shadow-lg">
            {active ? <><Pause size={20} className="mr-2"/> Pause</> : <><Play size={20} className="mr-2"/> Start</>}
         </Button>
         <Button variant="secondary" onClick={() => {setActive(false); setTimeLeft(600);}} className="h-12 w-12 p-0 rounded-xl"><RotateCcw size={20}/></Button>
         <Button variant="ghost" onClick={() => setSound(!sound)} className="h-12 w-12 p-0 rounded-xl text-slate-400 hover:text-indigo-600">
            {sound ? <Volume2 size={20}/> : <VolumeX size={20}/>}
         </Button>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 4. WRITING: MARKDOWN EDITOR
# =========================================================
echo "Ì≥ù Activating Markdown Editor..."
cat > app/tools/writing/markdown/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Eye, Edit3 } from "lucide-react";

// Need to install react-markdown first if not present, but we'll do a basic mock if package missing
// For this script, we assume basic text rendering or we add the package in next step.
// Let's build a simple split view.

export default function MarkdownEditor() {
  const [md, setMd] = useState("# Hello World\n\nType your markdown here.\n\n- List item 1\n- List item 2\n\n**Bold Text**");

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col p-6 max-w-[1800px] mx-auto">
      <div className="flex justify-between items-center mb-4">
         <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Markdown Editor</h1>
         <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-2"><Edit3 size={14}/> Editor</span>
            <span className="flex items-center gap-2"><Eye size={14}/> Preview</span>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 h-full">
         <textarea 
            value={md} 
            onChange={e => setMd(e.target.value)} 
            className="w-full h-full p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono text-sm leading-relaxed"
            spellCheck={false} 
         />
         <div className="w-full h-full p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-auto prose dark:prose-invert prose-sm max-w-none">
             {/* Basic render fallback since we might not have the lib installed yet */}
             <pre className="whitespace-pre-wrap font-sans">{md}</pre> 
             <p className="text-xs text-slate-400 mt-4 italic border-t pt-4">* Install react-markdown for full rendering</p>
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 5. DOCUMENTS: IMAGE COMPRESSOR
# =========================================================
echo "Ì≥â Activating Image Compressor..."
cat > app/tools/documents/image/compressor/page.tsx << 'TS_END'
"use client";
import React, { useState, useRef } from "react";
import { Upload, Download, Minimize } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function ImageCompressor() {
  const [original, setOriginal] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.6);
  const [ogSize, setOgSize] = useState(0);
  const [newSize, setNewSize] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOgSize(file.size);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginal(ev.target?.result as string);
        compress(ev.target?.result as string, quality);
      };
      reader.readAsDataURL(file);
    }
  };

  const compress = (src: string, q: number) => {
    const img = new Image();
    img.onload = () => {
       const canvas = canvasRef.current;
       if(canvas) {
           canvas.width = img.width;
           canvas.height = img.height;
           const ctx = canvas.getContext("2d");
           ctx?.drawImage(img, 0, 0);
           const dataUrl = canvas.toDataURL("image/jpeg", q);
           setCompressed(dataUrl);
           // Estimate size
           const head = "data:image/jpeg;base64,";
           const size = Math.round((dataUrl.length - head.length)*3/4);
           setNewSize(size);
       }
    };
    img.src = src;
  };

  const handleQuality = (q: number) => {
      setQuality(q);
      if(original) compress(original, q);
  };

  const formatSize = (b: number) => (b / 1024).toFixed(1) + " KB";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Image Compressor</h1>
        <p className="text-slate-500">Reduce file size directly in browser.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
         {!original ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl h-64 flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
               <Upload size={48} className="text-slate-300 mb-4"/>
               <span className="font-bold text-slate-600 dark:text-slate-400">Upload Image</span>
               <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0" />
            </div>
         ) : (
            <div className="space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                     <div className="text-xs font-bold uppercase text-slate-400 mb-2">Original</div>
                     <img src={original} className="max-h-64 mx-auto rounded-lg" alt="Og"/>
                     <div className="text-center mt-2 font-mono font-bold">{formatSize(ogSize)}</div>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                     <div className="text-xs font-bold uppercase text-indigo-400 mb-2">Compressed</div>
                     {compressed && <img src={compressed} className="max-h-64 mx-auto rounded-lg" alt="Comp"/>}
                     <div className="text-center mt-2 font-mono font-bold text-indigo-600">{formatSize(newSize)} <span className="text-xs text-emerald-500">({Math.round((1 - newSize/ogSize)*100)}% Saved)</span></div>
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Quality: {Math.round(quality*100)}%</label>
                  <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={e=>handleQuality(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"/>
               </div>

               <div className="flex gap-4">
                  <Button onClick={() => { const a = document.createElement('a'); a.href=compressed!; a.download="compressed.jpg"; a.click(); }} className="flex-1 py-3"><Download size={18} className="mr-2"/> Download</Button>
                  <Button variant="secondary" onClick={() => setOriginal(null)}>Start Over</Button>
               </div>
            </div>
         )}
         <canvas ref={canvasRef} className="hidden"/>
      </div>
    </div>
  );
}
TS_END

echo "‚úÖ Wave 7 Installed. Run 'npm run dev'!"

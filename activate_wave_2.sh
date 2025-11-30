#!/bin/bash

echo "í¼Š Activating Wave 2: Documents & Media Tools..."

# =========================================================
# 1. DOCUMENTS: IMAGE RESIZER
# =========================================================
echo "í¶¼ï¸ Activating Image Resizer..."
cat > app/tools/documents/image/resizer/page.tsx << 'TS_END'
"use client";
import React, { useState, useRef } from "react";
import { Upload, Download, Image as ImageIcon } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [ogRatio, setOgRatio] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(event.target?.result as string);
          setWidth(img.width);
          setHeight(img.height);
          setOgRatio(img.width / img.height);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (lockRatio) setHeight(Math.round(w / ogRatio));
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (lockRatio) setWidth(Math.round(h * ogRatio));
  };

  const download = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = new Image();
    if (image && canvas && ctx) {
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const link = document.createElement("a");
        link.download = "resized-image.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = image;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Image Resizer</h1>
        <p className="text-slate-500">Resize images pixel-perfectly directly in your browser.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
          {!image ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl h-64 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition relative">
              <Upload size={32} className="mb-2" />
              <span className="text-sm font-bold">Click to Upload Image</span>
              <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          ) : (
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Width (px)</label>
                    <input type="number" value={width} onChange={e => handleWidthChange(Number(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Height (px)</label>
                    <input type="number" value={height} onChange={e => handleHeightChange(Number(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono" />
                  </div>
               </div>
               <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <input type="checkbox" checked={lockRatio} onChange={e => setLockRatio(e.target.checked)} className="rounded text-indigo-600" />
                  Lock Aspect Ratio
               </label>
               <Button onClick={download} className="w-full py-3"><Download size={18} className="mr-2"/> Download Resized</Button>
               <button onClick={() => setImage(null)} className="w-full text-xs text-rose-500 hover:underline">Remove Image</button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 overflow-hidden relative min-h-[300px]">
           {image ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img src={image} alt="Preview" className="max-w-full max-h-[400px] rounded shadow-lg" />
           ) : (
             <div className="text-slate-300 flex flex-col items-center"><ImageIcon size={48} /><span className="text-sm mt-2">Preview</span></div>
           )}
           <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 2. DOCUMENTS: JSON FORMATTER
# =========================================================
echo "headers: JSON Formatter..."
cat > app/tools/documents/json/formatter/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { Copy, AlertTriangle, CheckCircle2 } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const format = (minify = false) => {
    try {
      if (!input.trim()) return;
      const obj = JSON.parse(input);
      setInput(JSON.stringify(obj, null, minify ? 0 : 2));
      setError("");
      showToast(minify ? "Minified!" : "Prettified!", "success");
    } catch (e) {
      setError("Invalid JSON: " + (e as Error).message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">JSON Formatter</h1>
           <p className="text-xs text-slate-500">Validate, Prettify, and Minify.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => format(false)} variant="secondary" className="text-xs">Prettify</Button>
           <Button onClick={() => format(true)} variant="secondary" className="text-xs">Minify</Button>
           <Button onClick={() => { navigator.clipboard.writeText(input); showToast("Copied!"); }} className="text-xs"><Copy size={14} className="mr-1"/> Copy</Button>
        </div>
      </div>

      <div className="flex-1 relative">
        <textarea 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          className={`w-full h-full p-4 font-mono text-sm bg-white dark:bg-slate-900 border rounded-xl outline-none resize-none ${error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'} focus:ring-4 transition-all`}
          placeholder="Paste JSON here..."
          spellCheck={false}
        />
        {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 p-3 rounded-lg text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2">
                <AlertTriangle size={16} /> {error}
            </div>
        )}
        {!error && input && (
            <div className="absolute bottom-4 right-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 size={14} /> Valid JSON
            </div>
        )}
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. HEALTH: SMART WORKOUT
# =========================================================
echo "í²ª Activating Smart Workout..."
cat > app/tools/health/smart-workout/page.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function SmartWorkout() {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [set, setSet] = useState(1);
  const [phase, setPhase] = useState<"Work" | "Rest">("Work");

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const reset = () => { setIsActive(false); setTime(0); setSet(1); setPhase("Work"); };
  
  const switchPhase = () => {
      setTime(0);
      if (phase === "Work") setPhase("Rest");
      else {
          setPhase("Work");
          setSet(s => s + 1);
      }
  };

  const formatTime = (s: number) => {
      const mins = Math.floor(s / 60).toString().padStart(2, '0');
      const secs = (s % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
  };

  return (
    <div className="max-w-lg mx-auto p-6 text-center space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">HIIT Timer</h1>
        <p className="text-slate-500">High Intensity Interval Training Assistant.</p>
      </div>

      <div className={`p-10 rounded-3xl border-4 transition-all duration-500 ${phase === 'Work' ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'}`}>
         <div className={`text-sm font-bold uppercase tracking-widest mb-2 ${phase === 'Work' ? 'text-rose-600' : 'text-emerald-600'}`}>Current Phase</div>
         <div className="text-5xl font-black mb-4 text-slate-900 dark:text-white">{phase}</div>
         <div className="text-7xl font-mono font-bold tabular-nums text-slate-800 dark:text-slate-200 mb-6">{formatTime(time)}</div>
         
         <div className="flex justify-center gap-4">
             <div className="text-xs font-bold text-slate-400 uppercase">Set <span className="text-xl text-slate-800 dark:text-slate-200 block">{set}</span></div>
         </div>
      </div>

      <div className="flex justify-center gap-4">
         <Button onClick={toggleTimer} className="w-32 h-12 text-lg shadow-lg">
            {isActive ? <><Pause size={20} className="mr-2"/> Pause</> : <><Play size={20} className="mr-2"/> Start</>}
         </Button>
         <Button onClick={switchPhase} variant="secondary" className="h-12 px-6">Next Phase</Button>
         <Button onClick={reset} variant="ghost" className="h-12 w-12 p-0"><RotateCcw size={20}/></Button>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 4. DEVELOPER: LOREM IPSUM
# =========================================================
echo "í³ Activating Lorem Ipsum..."
cat > app/tools/developer/smart-lorem/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartLorem() {
  const [count, setCount] = useState(3);
  const [type, setType] = useState<"paragraphs" | "sentences">("paragraphs");
  const [text, setText] = useState("");

  const LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

  const generate = () => {
    let result = [];
    for(let i=0; i<count; i++) {
        if(type === 'paragraphs') result.push(LOREM);
        else result.push(LOREM.split('.')[0] + ".");
    }
    setText(result.join("\n\n"));
  };

  React.useEffect(generate, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
       <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Lorem Ipsum</h1>
        <p className="text-slate-500">Generate placeholder text.</p>
      </div>

      <div className="flex gap-4 items-end bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
         <div className="flex-1 space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Count</label>
            <input type="number" min="1" max="20" value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg"/>
         </div>
         <div className="flex-1 space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
            <select value={type} onChange={e=>setType(e.target.value as any)} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg">
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
            </select>
         </div>
         <Button onClick={generate} className="h-[42px]">Generate</Button>
      </div>

      <div className="relative group">
         <textarea readOnly value={text} className="w-full h-96 p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none outline-none text-slate-600 dark:text-slate-300 leading-relaxed" />
         <Button onClick={()=>{navigator.clipboard.writeText(text); showToast("Copied!");}} className="absolute top-4 right-4 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Copy size={16} className="mr-2"/> Copy
         </Button>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 5. DEVELOPER: UUID GENERATOR
# =========================================================
echo "í¶” Activating UUID Generator..."
cat > app/tools/developer/smart-uuid/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartUUID() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);

  const generate = () => {
    const arr = Array.from({length: count}, () => crypto.randomUUID());
    setUuids(arr);
  };

  React.useEffect(generate, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">UUID v4 Generator</h1>
        <p className="text-slate-500">Cryptographically strong unique identifiers.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex gap-4 items-end">
         <div className="flex-1">
             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Quantity</label>
             <input type="range" min="1" max="50" value={count} onChange={e=>setCount(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"/>
             <div className="text-right text-xs font-bold text-indigo-600 mt-1">{count} UUIDs</div>
         </div>
         <Button onClick={generate} className="h-10">Generate</Button>
      </div>

      <div className="space-y-2">
         {uuids.map((id, i) => (
             <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-indigo-500 transition-colors">
                 <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{id}</span>
                 <button onClick={()=>{navigator.clipboard.writeText(id); showToast("Copied!");}} className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Copy size={16} />
                 </button>
             </div>
         ))}
      </div>
    </div>
  );
}
TS_END

echo "âœ… Wave 2 Installed. Run 'npm run dev' to check!"

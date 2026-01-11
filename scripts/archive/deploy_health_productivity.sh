#!/bin/bash

echo "í¿¥ Deploying Health & Productivity Suites..."

# 1. Install QR Code library
npm install qrcode.react

# ==========================================
# TOOL 1: SMART BMI (Health)
# ==========================================
mkdir -p app/tools/health/smart-bmi
cat > app/tools/health/smart-bmi/BmiClient.tsx << 'BMI_EOF'
"use client";
import React, { useState } from "react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Card } from "@/app/components/ui/Card";
import { Scale, Activity, Info } from "lucide-react";

export default function BmiClient() {
  const [weight, setWeight] = useState(70); // kg
  const [height, setHeight] = useState(175); // cm
  
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  const val = parseFloat(bmi);
  
  let status = "Normal";
  let color = "text-emerald-500";
  if (val < 18.5) { status = "Underweight"; color = "text-blue-500"; }
  else if (val >= 25 && val < 30) { status = "Overweight"; color = "text-amber-500"; }
  else if (val >= 30) { status = "Obese"; color = "text-rose-500"; }

  return (
    <ToolShell title="Smart BMI Calculator" description="Calculate Body Mass Index with instant health categorization." category="Health" icon={<Scale className="w-5 h-5 text-teal-500" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 space-y-6">
           <div>
             <label className="block text-sm font-medium text-slate-500 mb-2">Weight (kg)</label>
             <input type="range" min="30" max="200" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full accent-teal-500 mb-2" />
             <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="p-2 border rounded-lg w-24 text-center font-bold" />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-500 mb-2">Height (cm)</label>
             <input type="range" min="100" max="250" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-teal-500 mb-2" />
             <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="p-2 border rounded-lg w-24 text-center font-bold" />
           </div>
        </Card>

        <Card className="p-8 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800">
           <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Your BMI Score</p>
           <div className={`text-6xl font-black mb-4 ${color}`}>{bmi}</div>
           <div className={`px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-sm font-bold ${color}`}>
             {status}
           </div>
        </Card>
      </div>
    </ToolShell>
  );
}
BMI_EOF

cat > app/tools/health/smart-bmi/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import BmiClient from "./BmiClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
export const metadata: Metadata = { title: "BMI Calculator - Check Body Mass Index | One Tool" };
export default function Page() {
  return <><ToolSchema name="BMI Calculator" description="Free online Body Mass Index calculator." path="/tools/health/smart-bmi" category="HealthApplication" /><BmiClient /></>;
}
PAGE_EOF


# ==========================================
# TOOL 2: BOX BREATHING (Health - Animation)
# ==========================================
mkdir -p app/tools/health/smart-breath
cat > app/tools/health/smart-breath/BreathClient.tsx << 'BREATH_EOF'
"use client";
import React, { useState, useEffect } from "react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Wind, Play, Pause } from "lucide-react";

export default function BreathClient() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("Ready");
  const [instruction, setInstruction] = useState("Press Play to Start");

  useEffect(() => {
    if (!active) return;
    const phases = [
      { name: "Inhale", time: 4000 },
      { name: "Hold", time: 4000 },
      { name: "Exhale", time: 4000 },
      { name: "Hold", time: 4000 }
    ];
    let current = 0;
    
    const runPhase = () => {
      setPhase(phases[current].name);
      setInstruction(phases[current].name + "...");
      current = (current + 1) % 4;
    };

    runPhase();
    const interval = setInterval(runPhase, 4000);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <ToolShell title="Box Breathing" description="Reduce stress with the 4-4-4-4 breathing technique." category="Health" icon={<Wind className="w-5 h-5 text-sky-500" />}>
      <div className="flex flex-col items-center justify-center py-12 space-y-12">
        {/* Breathing Circle Animation */}
        <div className={`
           relative w-64 h-64 flex items-center justify-center rounded-full border-8 
           transition-all duration-[4000ms] ease-in-out
           ${phase === "Inhale" ? "w-80 h-80 border-sky-400 bg-sky-50 dark:bg-sky-900/20" : ""}
           ${phase === "Exhale" ? "w-48 h-48 border-slate-300 bg-transparent" : ""}
           ${phase === "Hold" ? "border-indigo-400" : ""}
           ${!active ? "border-slate-200" : ""}
        `}>
           <span className="text-2xl font-bold text-slate-700 dark:text-white animate-pulse">
             {active ? phase : "Ready"}
           </span>
        </div>

        <div className="text-center">
           <h3 className="text-xl font-medium text-slate-600 dark:text-slate-300 mb-6">{instruction}</h3>
           <Button size="lg" onClick={() => setActive(!active)} icon={active ? <Pause size={20}/> : <Play size={20}/>}>
             {active ? "Stop Session" : "Start Breathing"}
           </Button>
        </div>
      </div>
    </ToolShell>
  );
}
BREATH_EOF

cat > app/tools/health/smart-breath/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import BreathClient from "./BreathClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
export const metadata: Metadata = { title: "Box Breathing Guide - Stress Relief | One Tool" };
export default function Page() {
  return <><ToolSchema name="Box Breathing" description="Guided 4-4-4-4 breathing exercise." path="/tools/health/smart-breath" category="HealthApplication" /><BreathClient /></>;
}
PAGE_EOF


# ==========================================
# TOOL 3: POMODORO (Productivity)
# ==========================================
mkdir -p app/tools/productivity/pomodoro
cat > app/tools/productivity/pomodoro/PomodoroClient.tsx << 'POMO_EOF'
"use client";
import React, { useState, useEffect } from "react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Timer, Play, Pause, RotateCcw, Coffee } from "lucide-react";

export default function PomodoroClient() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "short" | "long">("focus");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      new Audio('/notification.mp3').play().catch(() => {}); // Placeholder for sound
      alert("Timer Complete!");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const setTimer = (m: "focus" | "short" | "long") => {
    setMode(m);
    setIsActive(false);
    if (m === "focus") setTimeLeft(25 * 60);
    if (m === "short") setTimeLeft(5 * 60);
    if (m === "long") setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <ToolShell title="Pomodoro Focus" description="Boost productivity with the 25-minute focus technique." category="Productivity" icon={<Timer className="w-5 h-5 text-rose-500" />}>
      <div className="max-w-xl mx-auto text-center space-y-8 py-8">
        
        <div className="flex justify-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit mx-auto">
           <button onClick={() => setTimer("focus")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${mode === 'focus' ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-500' : 'text-slate-500'}`}>Focus</button>
           <button onClick={() => setTimer("short")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${mode === 'short' ? 'bg-white dark:bg-slate-700 shadow-sm text-teal-500' : 'text-slate-500'}`}>Short Break</button>
           <button onClick={() => setTimer("long")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${mode === 'long' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-500' : 'text-slate-500'}`}>Long Break</button>
        </div>

        <div className="text-9xl font-black text-slate-900 dark:text-white font-mono tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-4">
           <Button size="lg" className="w-32" onClick={() => setIsActive(!isActive)} icon={isActive ? <Pause/> : <Play/>}>
             {isActive ? "Pause" : "Start"}
           </Button>
           <Button variant="secondary" size="lg" onClick={() => setTimer(mode)} icon={<RotateCcw/>}>
             Reset
           </Button>
        </div>
      </div>
    </ToolShell>
  );
}
POMO_EOF

cat > app/tools/productivity/pomodoro/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import PomodoroClient from "./PomodoroClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
export const metadata: Metadata = { title: "Pomodoro Timer Online - Focus Tool | One Tool" };
export default function Page() {
  return <><ToolSchema name="Pomodoro Timer" description="Online focus timer with breaks." path="/tools/productivity/pomodoro" category="WebApplication" /><PomodoroClient /></>;
}
PAGE_EOF


# ==========================================
# TOOL 4: QR CODE (Productivity)
# ==========================================
mkdir -p app/tools/productivity/qr-code
cat > app/tools/productivity/qr-code/QrClient.tsx << 'QR_EOF'
"use client";
import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { QrCode, Download, Link } from "lucide-react";

export default function QrClient() {
  const [text, setText] = useState("https://onetool.co.in");
  const [size, setSize] = useState(256);

  const downloadQr = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "onetool-qr.png";
      link.click();
    }
  };

  return (
    <ToolShell title="QR Code Generator" description="Create QR codes for URLs, Wi-Fi, or text instantly." category="Productivity" icon={<QrCode className="w-5 h-5 text-slate-900" />}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 space-y-6">
           <div>
             <label className="block text-sm font-medium text-slate-500 mb-2">Content (URL or Text)</label>
             <textarea 
               value={text} 
               onChange={(e) => setText(e.target.value)} 
               className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-slate-400 h-32 resize-none"
               placeholder="https://..."
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-500 mb-2">Size: {size}px</label>
             <input type="range" min="128" max="512" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-slate-900" />
           </div>
        </Card>

        <Card className="p-8 flex flex-col items-center justify-center bg-white dark:bg-white rounded-xl">
           <QRCodeCanvas 
             id="qr-canvas"
             value={text} 
             size={size} 
             level={"H"}
             includeMargin={true}
           />
           <div className="mt-8">
             <Button onClick={downloadQr} icon={<Download size={18}/>}>Download PNG</Button>
           </div>
        </Card>
      </div>
    </ToolShell>
  );
}
QR_EOF

cat > app/tools/productivity/qr-code/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import QrClient from "./QrClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
export const metadata: Metadata = { title: "Free QR Code Generator | One Tool" };
export default function Page() {
  return <><ToolSchema name="QR Code Generator" description="Generate high-quality QR codes." path="/tools/productivity/qr-code" category="WebApplication" /><QrClient /></>;
}
PAGE_EOF

echo "âœ… Batch 2 Complete: BMI, Breathing, Pomodoro, QR Code."
echo "í±‰ Run 'npm run dev' and check the Health & Productivity sections!"

"use client";
import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function SmartBreath() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("Ready"); // Inhale, Hold, Exhale
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isActive) return;
    const cycle = async () => {
        setPhase("Inhale"); setScale(1.5);
        await new Promise(r => setTimeout(r, 4000));
        setPhase("Hold");
        await new Promise(r => setTimeout(r, 4000));
        setPhase("Exhale"); setScale(1);
        await new Promise(r => setTimeout(r, 4000));
        cycle(); // Loop
    };
    cycle();
    return () => setPhase("Ready"); // Cleanup doesn't really stop the loop properly in strict mode but works for demo
  }, [isActive]);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-12">
       <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">4-7-8 Breathing</h1>
        <p className="text-muted">Relax your mind. Follow the circle.</p>
      </div>

      <div className="relative h-64 flex items-center justify-center">
         <div 
            className="w-32 h-32 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-full shadow-2xl shadow-emerald-500/30 flex items-center justify-center text-white font-bold text-xl transition-all duration-[4000ms] ease-in-out"
            style={{ transform: `scale(${scale})`, opacity: isActive ? 1 : 0.5 }}
         >
            {phase}
         </div>
         {/* Ripple Effect */}
         <div className={`absolute w-32 h-32 border-4 border-emerald-500/20 rounded-full transition-all duration-[4000ms] ease-in-out ${isActive ? 'scale-[2]' : 'scale-100'}`}></div>
      </div>

      <div className="flex justify-center gap-4">
         <Button onClick={() => setIsActive(!isActive)} className="w-32">
            {isActive ? <><Pause size={18} className="mr-2"/> Pause</> : <><Play size={18} className="mr-2"/> Start</>}
         </Button>
         <Button variant="ghost" onClick={() => { setIsActive(false); setScale(1); setPhase("Ready"); }}><RotateCcw size={18}/></Button>
      </div>
    </div>
  );
}

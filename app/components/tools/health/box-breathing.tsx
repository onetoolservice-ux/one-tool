"use client";
import React, { useState, useEffect } from 'react';
import { Wind, Play, Pause, Settings } from 'lucide-react';

export const BoxBreathing = () => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("Ready"); 
  const [scale, setScale] = useState(1);
  
  // Custom Configuration
  const [config, setConfig] = useState({ inhale: 4, hold1: 4, exhale: 4, hold2: 4 });

  const PRESETS = [
    { name: "Box (Balance)", conf: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 } },
    { name: "Relax (4-7-8)", conf: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 } },
    { name: "Energy (5-0-5)", conf: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 } },
  ];

  useEffect(() => {
    if (!active) return;
    
    let isCancelled = false;
    const cycle = async () => {
      while(active && !isCancelled) {
        if(config.inhale > 0) { setPhase("Inhale"); setScale(1.5); await wait(config.inhale * 1000); }
        if(config.hold1 > 0) { setPhase("Hold"); await wait(config.hold1 * 1000); }
        if(config.exhale > 0) { setPhase("Exhale"); setScale(1); await wait(config.exhale * 1000); }
        if(config.hold2 > 0) { setPhase("Hold"); await wait(config.hold2 * 1000); }
      }
    };
    cycle();
    
    return () => { isCancelled = true; setPhase("Ready"); setScale(1); };
  }, [active, config]);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col lg:flex-row items-center justify-center gap-12 p-6">
       
       {/* VISUALIZER */}
       <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-80 h-80 flex items-center justify-center">
             <div 
                className="absolute inset-0 bg-sky-100 dark:bg-sky-900/30 rounded-full blur-3xl transition-all duration-[4000ms]"
                style={{ transform: `scale(${scale * 1.2})`, opacity: active ? 0.8 : 0.2 }}
             />
             <div 
                className="w-48 h-48 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl transition-all duration-[4000ms] ease-in-out relative z-10 text-white"
                style={{ transform: `scale(${scale})` }}
             >
                <Wind size={48} className="animate-pulse"/>
             </div>
          </div>
          
          <h1 className="text-4xl font-black text-slate-800 dark:text-white mt-8 uppercase tracking-widest">{phase}</h1>
          <button 
             onClick={() => setActive(!active)} 
             className="mt-8 px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-xl"
          >
             {active ? <Pause size={20}/> : <Play size={20}/>} {active ? "Pause" : "Start"}
          </button>
       </div>

       {/* CONTROLS */}
       <div className="w-full lg:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-400 uppercase text-xs mb-4">Technique Presets</h3>
          <div className="flex flex-col gap-2 mb-8">
             {PRESETS.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => { setActive(false); setConfig(p.conf); }}
                  className={`p-3 rounded-xl text-left text-sm font-bold border transition-all ${JSON.stringify(config) === JSON.stringify(p.conf) ? 'bg-sky-50 border-sky-200 text-sky-600 dark:bg-sky-900/20 dark:border-sky-800' : 'bg-transparent border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                >
                   {p.name}
                </button>
             ))}
          </div>

          <h3 className="font-bold text-slate-400 uppercase text-xs mb-4">Custom Timing (Sec)</h3>
          <div className="grid grid-cols-2 gap-4">
             {Object.keys(config).map((key) => (
                <div key={key} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                   <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">{key}</label>
                   <input 
                     type="number" 
                     value={(config as any)[key]} 
                     onChange={e => { setActive(false); setConfig({...config, [key]: +e.target.value}); }}
                     className="w-full bg-transparent font-bold text-lg outline-none"
                   />
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
"use client";
import React, { useState, useEffect } from "react";
import { Battery, Wifi, HardDrive, Zap } from "lucide-react";

export default function SystemMonitor() {
  const [battery, setBattery] = useState<any>(null);
  const [online, setOnline] = useState(true);
  const [storage, setStorage] = useState("0 KB");

  useEffect(() => {
    // Network Status
    setOnline(navigator.onLine);
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));

    // Battery Status (Chrome/Edge only)
    // @ts-ignore
    if (navigator.getBattery) {
        // @ts-ignore
        navigator.getBattery().then((bat) => {
            setBattery(bat);
            bat.addEventListener('levelchange', () => setBattery({...bat}));
        });
    }

    // Storage Calculation
    let total = 0;
    for(let x in localStorage) {
        if(localStorage.hasOwnProperty(x)) total += ((localStorage[x].length + x.length) * 2);
    }
    setStorage((total / 1024).toFixed(0) + " KB");

  }, []);

  const batLevel = battery ? Math.round(battery.level * 100) : 100;

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
        {/* Battery */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:border-emerald-500/30 transition-colors group">
            <div className={`mb-2 ${batLevel > 20 ? 'text-emerald-500' : 'text-rose-500'}`}>
                <Battery size={24} className="group-hover:scale-110 transition-transform"/>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{batLevel}%</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Power</div>
        </div>

        {/* Network */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:border-blue-500/30 transition-colors group">
            <div className={`mb-2 ${online ? 'text-blue-500' : 'text-slate-400'}`}>
                <Wifi size={24} className="group-hover:scale-110 transition-transform"/>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{online ? 'ON' : 'OFF'}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Network</div>
        </div>

        {/* Storage */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm hover:border-amber-500/30 transition-colors group">
            <div className="mb-2 text-amber-500">
                <HardDrive size={24} className="group-hover:scale-110 transition-transform"/>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">{storage}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Local Data</div>
        </div>
    </div>
  );
}

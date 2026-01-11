#!/bin/bash

echo "íº€ Upgrading Dashboard to V2 (Pro Clock & System Monitor)..."

# =========================================================
# 1. UPGRADE CLOCK (The "Cool" Card)
# =========================================================
echo "âŒš Installing Holographic Clock..."
cat > app/components/dashboard/LiveClock.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Calendar, Globe } from "lucide-react";

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="h-48 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-3xl w-full"></div>;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Greeting Logic
  const hrs = time.getHours();
  let greeting = "Good Evening";
  if (hrs < 12) greeting = "Good Morning";
  else if (hrs < 17) greeting = "Good Afternoon";

  return (
    <Link href="/tools/developer/timestamp" className="group block h-full">
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-indigo-500/30 h-full flex flex-col justify-center">
        
        {/* Cool Background Glows */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-500"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
             <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest text-xs mb-2">
                <Globe size={14} className="animate-spin-slow" /> Local Time
             </div>
             <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter font-mono tabular-nums">
                {formatTime(time)}
             </h2>
             <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mt-2 flex items-center gap-2">
                <Calendar size={18} className="text-slate-400"/> {formatDate(time)}
             </p>
          </div>
          
          <div className="hidden xl:block text-right">
             <div className="inline-block px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {greeting}
                </span>
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
TS_END

# =========================================================
# 2. CREATE SYSTEM MONITOR WIDGET
# =========================================================
echo "í´‹ Installing System Monitor..."
cat > app/components/dashboard/SystemMonitor.tsx << 'TS_END'
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
TS_END

# =========================================================
# 3. UPDATE HOME LAYOUT
# =========================================================
echo "í¿  Arranging Dashboard Widgets..."
cat > app/page.tsx << 'TS_END'
"use client";
import { Search, History } from "lucide-react";
import ToolTile from "@/app/shared/ToolTile";
import { useState } from "react";
import { ALL_TOOLS, Tool } from "@/app/lib/tools-data";
import { useUI } from "@/app/lib/ui-context";
import { useHistory } from "@/app/utils/hooks/useHistory";
import LiveClock from "@/app/components/dashboard/LiveClock";
import SmartWidgets from "@/app/components/dashboard/SmartWidgets";
import SystemMonitor from "@/app/components/dashboard/SystemMonitor";

export default function Home() {
  const { searchQuery, setSearchQuery } = useUI();
  const { recentIds } = useHistory();

  const filtered = ALL_TOOLS.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const grouped = filtered.reduce((acc, tool) => {
    const cat = tool.category.charAt(0).toUpperCase() + tool.category.slice(1);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  const recentTools = recentIds.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean) as Tool[];
  const order = ["Finance", "Developer", "Documents", "Health", "Productivity", "Design"];

  return (
    <div className="p-6 md:p-10 w-full space-y-10 animate-in fade-in duration-700">
      
      {/* TOP WIDGET ROW */}
      {!searchQuery && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Clock takes 2 slots */}
            <div className="xl:col-span-2">
                <LiveClock />
            </div>
            {/* System Monitor takes 1 slot */}
            <div className="xl:col-span-1">
                <SystemMonitor />
            </div>
        </div>
      )}
      
      {/* MISSION CONTROL WIDGETS (Net Worth etc) */}
      {!searchQuery && (
         <SmartWidgets />
      )}

      {/* RECENT APPS */}
      {!searchQuery && recentTools.length > 0 && (
        <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <History size={18} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Jump Back In</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {recentTools.map(tool => (
                    <ToolTile key={'recent-'+tool.id} {...tool} />
                ))}
            </div>
        </div>
      )}

      {/* TOOL GRIDS */}
      <div className="space-y-20 pb-20">
        {searchQuery ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filtered.map(tool => <ToolTile key={tool.id} {...tool} />)}
                {filtered.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        No tools found for "{searchQuery}"
                    </div>
                )}
             </div>
        ) : (
            order.map((cat, i) => grouped[cat] && (
                <div key={cat} className="space-y-6" style={{animationDelay: `${i * 50}ms`}}>
                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            {cat}
                        </h2>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-full">{grouped[cat].length}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {grouped[cat].map(tool => <ToolTile key={tool.id} {...tool} />)}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
TS_END

echo "âœ… Dashboard V2 Activated. Run 'npm run dev'!"

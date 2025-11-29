"use client";
import React, { useState, useEffect } from "react";
import { Trophy, Star, Zap, Crown, Shield, Award } from "lucide-react";

export default function Achievements() {
  const [stats, setStats] = useState({ totalActions: 0, level: "Noob", progress: 0 });

  useEffect(() => {
    // Calculate Total Actions from LocalStorage
    let count = 0;
    
    // 1. Finance
    const debts = JSON.parse(localStorage.getItem("smart-debt-data-v1") || "[]");
    const budget = JSON.parse(localStorage.getItem("smart-budget-data-v1") || "[]"); // Assuming future key
    // (For now we just count debts + a mock number for demo if budget isn't saved yet)
    count += debts.length;
    
    // 2. Mocking usage for other tools (In a real app, we'd track 'clicks' or 'saves')
    // Let's assume every key in localStorage counts as an "action" or setting tweak
    count += Object.keys(localStorage).length;

    // Determine Level
    let level = "Visitor";
    let progress = 0;
    let nextTarget = 5;

    if (count >= 100) { level = "Ultimate"; progress = 100; nextTarget = 100; }
    else if (count >= 50) { level = "Pro"; progress = ((count-50)/50)*100; nextTarget = 100; }
    else if (count >= 10) { level = "Hunn"; progress = ((count-10)/40)*100; nextTarget = 50; }
    else if (count >= 5) { level = "Noob"; progress = ((count-5)/5)*100; nextTarget = 10; }
    else { progress = (count/5)*100; }

    setStats({ totalActions: count, level, progress });
  }, []);

  const badges = [
    { name: "Noob", threshold: 5, icon: <Star size={20}/>, color: "bg-slate-100 text-muted", desc: "5 Actions" },
    { name: "Hunn", threshold: 10, icon: <Zap size={20}/>, color: "bg-blue-100 text-blue-600", desc: "10 Actions" },
    { name: "Pro", threshold: 50, icon: <Shield size={20}/>, color: "bg-violet-100 text-violet-600", desc: "50 Actions" },
    { name: "Ultimate", threshold: 100, icon: <Crown size={20}/>, color: "bg-amber-100 text-amber-600", desc: "100+ Actions" },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-line   p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-lg font-bold text-main flex items-center gap-2">
                <Trophy size={18} className="text-amber-500"/> Your Achievements
            </h2>
            <p className="text-xs text-muted mt-1">Level up by using more tools!</p>
        </div>
        <div className="text-right">
            <div className="text-2xl font-black text-main">{stats.totalActions}</div>
            <div className="text-[10px] font-bold text-muted/70 uppercase tracking-wider">Total Score</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-muted">
            <span>Current: {stats.level}</span>
            <span>{Math.round(stats.progress)}% to next</span>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all duration-1000" style={{width: `${stats.progress}%`}}></div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-4 gap-2">
        {badges.map((b) => {
            const unlocked = stats.totalActions >= b.threshold;
            return (
                <div key={b.name} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${unlocked ? 'border-line bg-background' : 'border-transparent opacity-40 grayscale'}`}>
                    <div className={`p-2 rounded-full mb-2 ${unlocked ? b.color : 'bg-slate-200 text-muted/70'}`}>
                        {b.icon}
                    </div>
                    <div className="text-xs font-bold text-main">{b.name}</div>
                    <div className="text-[9px] text-muted/70 uppercase">{b.desc}</div>
                </div>
            );
        })}
      </div>
    </div>
  );
}

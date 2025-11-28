"use client";

import React, { useState, useMemo } from "react";
import { Briefcase, TrendingUp } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function Retirement() {
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [currentSaved, setCurrentSaved] = useState(50000);
  const [monthlyContrib, setMonthlyContrib] = useState(1000);
  const [rate, setRate] = useState(7);

  const result = useMemo(() => {
    const years = retireAge - age;
    if (years <= 0) return { total: 0, interest: 0 };
    const n = years * 12;
    const r = rate / 100 / 12;
    
    // Future Value of Lump Sum
    const fvLump = currentSaved * Math.pow(1 + r, n);
    // Future Value of Monthly Contributions
    const fvContrib = monthlyContrib * ((Math.pow(1 + r, n) - 1) / r);
    
    const total = fvLump + fvContrib;
    const invested = currentSaved + (monthlyContrib * n);
    const interest = total - invested;

    return { total: Math.round(total), interest: Math.round(interest), invested: Math.round(invested) };
  }, [age, retireAge, currentSaved, monthlyContrib, rate]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <ToolHeader title="Retirement Planner" desc="Compound Growth Projector" icon={<Briefcase size={20}/>} />
      
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-slate-300 shadow-sm">
            <div><label className="text-xs font-bold text-slate-500 uppercase">Current Age</label><input type="number" value={age} onChange={e=>setAge(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold"/></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Retire Age</label><input type="number" value={retireAge} onChange={e=>setRetireAge(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold"/></div>
            <div className="col-span-2"><input type="range" min="18" max="80" value={age} onChange={e=>setAge(Number(e.target.value))} className="w-full accent-indigo-600"/></div>

            <div><label className="text-xs font-bold text-slate-500 uppercase">Current Savings</label><input type="number" value={currentSaved} onChange={e=>setCurrentSaved(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold"/></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Monthly Add</label><input type="number" value={monthlyContrib} onChange={e=>setMonthlyContrib(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold"/></div>
            
            <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Expected Return (%)</label><input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold"/></div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-[#1E293B] border-l border-slate-800 p-8 flex flex-col gap-6 shadow-xl text-white">
           <div className="p-6 bg-indigo-600 rounded-2xl shadow-lg border border-indigo-500">
             <div className="text-xs font-bold text-indigo-200 uppercase mb-1">Projected Wealth</div>
             <div className="text-4xl font-extrabold tracking-tight">${result.total.toLocaleString()}</div>
             <div className="text-xs text-indigo-200 mt-2">At age {retireAge}</div>
           </div>

           <div className="space-y-4">
             <div className="flex justify-between text-sm border-b border-slate-700 pb-2"><span className="text-slate-400">Principal</span><span className="font-bold">${result.invested.toLocaleString()}</span></div>
             <div className="flex justify-between text-sm border-b border-slate-700 pb-2"><span className="text-slate-400">Interest Earned</span><span className="font-bold text-emerald-400">+${result.interest.toLocaleString()}</span></div>
           </div>
        </div>
      </div>
    </div>
  );
}

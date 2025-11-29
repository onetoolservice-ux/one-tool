"use client";
import React, { useState, useMemo } from "react";
import { Briefcase, TrendingUp, Calendar, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Toast from "@/app/shared/Toast";

export default function SmartRetirement() {
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [currentCorpus, setCurrentCorpus] = useState(500000);
  const [monthlyInvest, setMonthlyInvest] = useState(25000);
  const [rate, setRate] = useState(12);
  const [expense, setExpense] = useState(50000); // Current monthly expense

  const { projection, corpusNeeded, finalCorpus } = useMemo(() => {
    const years = retireAge - age;
    const months = years * 12;
    const r = rate / 12 / 100;
    const inflation = 0.06 / 12; // 6% annual inflation
    
    // Corpus needed (25x annual expense rule adjusted for inflation)
    const futureMonthlyExpense = expense * Math.pow(1 + inflation, months);
    const corpusNeeded = futureMonthlyExpense * 12 * 25;

    let balance = currentCorpus;
    const data = [];
    for(let i=0; i<=years; i++) {
        data.push({ year: age + i, balance: Math.round(balance), needed: Math.round(corpusNeeded * (i/years)) }); // Linear guide
        balance = (balance * Math.pow(1+r, 12)) + (monthlyInvest * ((Math.pow(1+r, 12) - 1)/r));
    }
    return { projection: data, corpusNeeded, finalCorpus: balance };
  }, [age, retireAge, currentCorpus, monthlyInvest, rate, expense]);

  const shortfall = finalCorpus - corpusNeeded;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]/30 overflow-hidden font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 shadow-lg shadow-slate-200/50 dark:shadow-none shrink-0 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-orange-600 text-white  "><Briefcase size={22} /></div>
        <div><h1 className="text-lg font-extrabold text-main dark:text-slate-100 dark:text-slate-200">Smart Retirement</h1><p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted font-bold uppercase">FIRE Calculator</p></div>
      </div>

      <div className="grid grid-cols-3 divide-x bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b sticky top-[60px] z-40">
        <div className="p-4 pl-6"><div className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted mb-1">Corpus Needed</div><div className="text-xl font-bold text-main dark:text-slate-100 dark:text-slate-200">₹{(corpusNeeded/10000000).toFixed(2)} Cr</div></div>
        <div className="p-4"><div className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted mb-1">Projected Corpus</div><div className={`text-xl font-bold ${shortfall >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>₹{(finalCorpus/10000000).toFixed(2)} Cr</div></div>
        <div className="p-4"><div className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted mb-1">Result</div><div className={`text-lg font-bold ${shortfall >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{shortfall >= 0 ? 'Goal Met 🎉' : 'Shortfall ⚠️'}</div></div>
      </div>

      <div className="flex-1 overflow-auto bg-surface dark:bg-slate-800 dark:bg-surface p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6 lg:col-span-1 bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-6 rounded-xl border">
            <h3 className="font-bold text-main dark:text-slate-100 dark:text-slate-200">Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted">Current Age</label><input type="number" className="w-full border p-2 rounded" value={age} onChange={e=>setAge(Number(e.target.value))}/></div>
                <div><label className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted">Retire Age</label><input type="number" className="w-full border p-2 rounded" value={retireAge} onChange={e=>setRetireAge(Number(e.target.value))}/></div>
            </div>
            <div><label className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted">Current Monthly Expense</label><input type="number" className="w-full border p-2 rounded" value={expense} onChange={e=>setExpense(Number(e.target.value))}/></div>
            <div><label className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted">Existing Corpus</label><input type="number" className="w-full border p-2 rounded" value={currentCorpus} onChange={e=>setCurrentCorpus(Number(e.target.value))}/></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted">Monthly SIP</label><input type="number" className="w-full border p-2 rounded" value={monthlyInvest} onChange={e=>setMonthlyInvest(Number(e.target.value))}/></div>
                <div><label className="text-xs font-bold uppercase tracking-wide text-muted dark:text-muted dark:text-muted dark:text-muted">Return Rate %</label><input type="number" className="w-full border p-2 rounded" value={rate} onChange={e=>setRate(Number(e.target.value))}/></div>
            </div>
        </div>

        <div className="lg:col-span-2 h-[400px]">
            <h3 className="font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-4">Growth Projection</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection}>
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(val)=>`${(val/10000000).toFixed(1)}Cr`} />
                    <Tooltip formatter={(val:number)=>`₹${(val/100000).toFixed(2)}L`} />
                    <Area type="monotone" dataKey="balance" stroke="#ea580c" fill="#fff7ed" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

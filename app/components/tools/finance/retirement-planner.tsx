"use client";
import React, { useState } from 'react';
import { Briefcase, Calendar, TrendingUp, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const RetirementPlanner = () => {
  const [currentAge, setCurrentAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlySavings, setMonthlySavings] = useState(25000);
  const [rate, setRate] = useState(12);
  const [expense, setExpense] = useState(50000); // Monthly expense today

  // Calc
  const years = retireAge - currentAge;
  const months = years * 12;
  const ratePerMonth = rate / 1200;
  
  // Future Value of Current Savings
  const fvLumpsum = currentSavings * Math.pow(1 + rate/100, years);
  
  // Future Value of SIP
  const fvSip = monthlySavings * ((Math.pow(1 + ratePerMonth, months) - 1) / ratePerMonth) * (1 + ratePerMonth);
  
  const totalCorpus = Math.round(fvLumpsum + fvSip);
  
  // Required Corpus (Simple Rule: 25x Annual Expenses adjusted for inflation @ 6%)
  const inflation = 0.06;
  const futureMonthlyExpense = expense * Math.pow(1 + inflation, years);
  const requiredCorpus = Math.round(futureMonthlyExpense * 12 * 25);

  const gap = totalCorpus - requiredCorpus;

  // Chart Data
  const data = [];
  for(let i=0; i<=years; i++) {
     const year = currentAge + i;
     const val = Math.round(currentSavings * Math.pow(1 + rate/100, i) + (monthlySavings * 12 * i * Math.pow(1 + rate/100, i/2))); // Approx
     data.push({ age: year, value: val });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)] p-4 overflow-hidden">
       
       {/* LEFT: INPUTS */}
       <div className="w-full lg:w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-y-auto custom-scrollbar shadow-sm">
          <div className="mb-6 border-b pb-4">
             <h2 className="text-lg font-bold flex items-center gap-2"><Briefcase className="text-teal-600"/> Retirement Planner</h2>
          </div>
          
          <div className="space-y-6">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase flex justify-between"><span>Current Age</span><span>{currentAge}</span></label>
                <input type="range" min="18" max="60" value={currentAge} onChange={e=>setCurrentAge(+e.target.value)} className="w-full accent-teal-600"/>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase flex justify-between"><span>Retire At</span><span>{retireAge}</span></label>
                <input type="range" min="40" max="80" value={retireAge} onChange={e=>setRetireAge(+e.target.value)} className="w-full accent-teal-600"/>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
                <div><label className="text-[10px] font-bold uppercase text-slate-400">Current Savings</label><input type="number" value={currentSavings} onChange={e=>setCurrentSavings(+e.target.value)} className="w-full p-3 border rounded-xl font-bold"/></div>
                <div><label className="text-[10px] font-bold uppercase text-slate-400">Monthly Investment</label><input type="number" value={monthlySavings} onChange={e=>setMonthlySavings(+e.target.value)} className="w-full p-3 border rounded-xl font-bold"/></div>
                <div><label className="text-[10px] font-bold uppercase text-slate-400">Monthly Expense (Today)</label><input type="number" value={expense} onChange={e=>setExpense(+e.target.value)} className="w-full p-3 border rounded-xl font-bold"/></div>
                <div><label className="text-[10px] font-bold uppercase text-slate-400">Exp. Return (%)</label><input type="number" value={rate} onChange={e=>setRate(+e.target.value)} className="w-full p-3 border rounded-xl font-bold"/></div>
             </div>
          </div>
       </div>

       {/* RIGHT: PROJECTION */}
       <div className="flex-1 bg-slate-50 dark:bg-black/20 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Projected Corpus</p>
                <h2 className="text-3xl font-black text-emerald-600">₹ {(totalCorpus/10000000).toFixed(2)} Cr</h2>
             </div>
             <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Required for Lifestyle</p>
                <h2 className="text-3xl font-black text-slate-800 dark:text-white">₹ {(requiredCorpus/10000000).toFixed(2)} Cr</h2>
             </div>
          </div>

          <div className={`p-4 rounded-xl text-center text-sm font-bold mb-6 ${gap >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
             {gap >= 0 ? "🎉 You are on track to retire comfortably!" : `⚠️ You need ₹ ${Math.abs(gap/100000).toFixed(0)} Lakhs more. Increase SIP.`}
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border relative">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                   <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                   <XAxis dataKey="age" tick={{fontSize: 10}} axisLine={false} tickLine={false}/>
                   <YAxis hide/>
                   <Tooltip formatter={(v) => `₹ ${Number(v).toLocaleString()}`} contentStyle={{borderRadius:'10px', border:'none'}}/>
                   <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={3} fill="url(#colorVal)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};
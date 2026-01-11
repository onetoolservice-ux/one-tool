"use client";
import React, { useState, useMemo } from 'react';
import { 
  Download, ArrowUpDown, IndianRupee, Percent, Calendar, 
  Table as TableIcon, BarChart3, GraduationCap, Coins, Zap, Flag
} from 'lucide-react';

export const FinanceCalculator = () => {
  // --- STATE ---
  const [view, setView] = useState<'table' | 'chart'>('table'); 
  const [amount, setAmount] = useState(5000000); // 50 Lakh default
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'id', direction: 'asc' });

  // --- PRESETS (Indian Context) ---
  const setPreset = (type: string) => {
    switch(type) {
        case 'home': setAmount(5000000); setRate(8.5); setYears(20); break; // 50L
        case 'car': setAmount(1200000); setRate(9.0); setYears(7); break;   // 12L
        case 'personal': setAmount(500000); setRate(11.5); setYears(3); break; // 5L
        case 'edu': setAmount(2000000); setRate(10.0); setYears(10); break; // 20L
        case 'gold': setAmount(300000); setRate(7.5); setYears(1); break;   // 3L
        case 'ev': setAmount(1500000); setRate(8.0); setYears(5); break;    // 15L
    }
  };

  // --- CALCULATION ENGINE ---
  const calculation = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const totalMonths = years * 12;
    const emi = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));

    let balance = amount;
    let totalInterest = 0;
    const rawSchedule = [];
    
    // Milestones
    let halfPaidFound = false;
    let principalCrossFound = false;

    for (let i = 1; i <= totalMonths; i++) {
       const interest = balance * monthlyRate;
       const principal = emi - interest;
       balance -= principal;
       totalInterest += interest;
       if (balance < 0) balance = 0;

       // Detect Wow Factors
       let milestone = null;
       if (!halfPaidFound && balance <= amount / 2) {
         milestone = "50% Paid";
         halfPaidFound = true;
       }
       if (!principalCrossFound && principal > interest) {
          milestone = milestone ? milestone : "Principal > Interest";
          principalCrossFound = true;
       }

       rawSchedule.push({
         id: i,
         principal: principal,
         interest: interest,
         balance: balance,
         milestone: milestone
       });
    }
    
    // Sort Logic
    let sortedSchedule = [...rawSchedule];
    if (sortConfig !== null) {
      sortedSchedule.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const totalPayment = amount + totalInterest;
    const healthScore = totalPayment / amount; // 1.5 means you pay 1.5x

    return { emi, totalInterest, totalPayment, schedule: sortedSchedule, rawSchedule, healthScore };
  }, [amount, rate, years, sortConfig]);

  // Indian Formatting (Lakhs/Crores)
  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  }).format(val);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const exportToCSV = () => {
    const headers = ["Month,Principal,Interest,Balance,Milestone"];
    const rows = calculation.rawSchedule.map(row => `${row.id},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)},${row.milestone || ''}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "loan_schedule_inr.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] animate-in fade-in duration-300">
      
      {/* 1. TOP KPI STRIP (Answers + Health Score) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="grid grid-cols-3 gap-12">
             <div>
                <div className="text-sm font-bold text-slate-500 uppercase mb-1">Monthly EMI</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white">{formatINR(calculation.emi)}</div>
             </div>
             <div>
                <div className="text-sm font-bold text-slate-500 uppercase mb-1">Total Interest</div>
                <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{formatINR(calculation.totalInterest)}</div>
             </div>
             <div>
                <div className="text-sm font-bold text-slate-500 uppercase mb-1">Total Payback</div>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{formatINR(calculation.totalPayment)}</div>
             </div>
          </div>
          
          {/* WOW FEATURE 1: LOAN HEALTH BADGE */}
          <div className={`
             px-4 py-3 rounded-xl border-l-4 shadow-sm max-w-[200px]
             ${calculation.healthScore < 1.2 ? 'bg-[#638c80]/10 border-[#638c80] text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' : 
               calculation.healthScore < 1.5 ? 'bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300' : 
               'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300'}
          `}>
             <div className="text-xs font-bold uppercase opacity-80">Loan Efficiency</div>
             <div className="text-sm font-medium mt-0.5">
               You pay <span className="font-bold">₹{calculation.healthScore.toFixed(2)}</span> for every ₹1 borrowed.
             </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROL BAR (Labels > Inputs) */}
      <div className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
         
         {/* LEFT: Actions & Filters */}
         <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* Extended Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
               {[
                 { id: 'home', label: 'Home' }, { id: 'car', label: 'Car' }, { id: 'personal', label: 'Personal' },
                 { id: 'edu', label: 'Education' }, { id: 'gold', label: 'Gold' }, { id: 'ev', label: 'EV' }
               ].map(f => (
                  <button key={f.id} onClick={() => setPreset(f.id)} className="px-3 py-1 text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full hover:border-blue-500 transition-colors whitespace-nowrap">
                    {f.label}
                  </button>
               ))}
            </div>
            
            <div className="flex items-center gap-2">
               <button onClick={() => setView('table')} className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-colors ${view==='table'?'bg-blue-600 hover:bg-blue-700 text-white shadow-md':'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                 <TableIcon size={16} /> Schedule
               </button>
               <button onClick={exportToCSV} className="px-4 py-2 text-sm font-bold bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                 <Download size={16} /> CSV
               </button>
            </div>
         </div>

         {/* RIGHT: High-Visibility Inputs */}
         <div className="flex items-center gap-6 flex-1 w-full justify-end">
            
            <div className="flex flex-col gap-2 w-full max-w-[220px]">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                 Loan Amount <span className="text-slate-400 font-normal text-xs">(Principal)</span>
               </label>
               <div className="relative group">
                  <IndianRupee className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 h-11 text-lg font-bold bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-600 rounded-xl outline-none transition-all"
                  />
               </div>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[140px]">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Rate (%)</label>
               <div className="relative group">
                  <Percent className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                  <input 
                    type="number" step="0.1" value={rate} onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full pl-10 pr-4 h-11 text-lg font-bold bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-600 rounded-xl outline-none transition-all"
                  />
               </div>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-[140px]">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Years</label>
               <div className="relative group">
                  <Calendar className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                  <input 
                    type="number" value={years} onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full pl-10 pr-4 h-11 text-lg font-bold bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-600 rounded-xl outline-none transition-all"
                  />
               </div>
            </div>

         </div>
      </div>

      {/* 3. TABLE WITH MILESTONES (Zero Scroll Body) */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900 relative">
          <div className="h-full overflow-auto">
             <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950 sticky top-0 z-10 shadow-sm">
                   <tr>
                      {[{id:'id',l:'Month'},{id:'principal',l:'Principal'},{id:'interest',l:'Interest'},{id:'balance',l:'Balance'}].map(c => (
                        <th key={c.id} className="px-6 py-4 font-bold border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100" onClick={()=>requestSort(c.id)}>
                           <div className="flex items-center gap-1">{c.l} <ArrowUpDown size={12} className="opacity-40"/></div>
                        </th>
                      ))}
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                   {calculation.schedule.map((row) => (
                      <tr 
                        key={row.id} 
                        className={`transition-colors ${row.milestone ? 'bg-indigo-50/60 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}
                      >
                         <td className="px-6 py-3 font-mono text-xs text-slate-500">
                           {row.id}
                           {/* WOW FEATURE 2: MILESTONE FLAG */}
                           {row.milestone && (
                             <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                               <Flag size={10} /> {row.milestone}
                             </span>
                           )}
                         </td>
                         <td className="px-6 py-3 font-medium text-slate-700 dark:text-slate-300">{formatINR(row.principal)}</td>
                         <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{formatINR(row.interest)}</td>
                         <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">{formatINR(row.balance)}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
      </div>
    </div>
  );
};

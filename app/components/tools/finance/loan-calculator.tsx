"use client";
import React, { useState, useEffect } from 'react';
import { Calculator, Calendar, DollarSign, PieChart as PieIcon, Table } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const LoanCalculator = () => {
  const [p, setP] = useState(5000000); // Principal
  const [r, setR] = useState(8.5);     // Rate
  const [n, setN] = useState(20);      // Years

  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const monthlyRate = r / 12 / 100;
    const months = n * 12;
    
    // EMI Formula
    const emiVal = (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    
    setEmi(Math.round(emiVal));
    setTotalAmount(Math.round(emiVal * months));
    setTotalInterest(Math.round((emiVal * months) - p));

    // Generate Amortization
    let balance = p;
    const data = [];
    for (let i = 1; i <= months; i++) {
       const interest = balance * monthlyRate;
       const principal = emiVal - interest;
       balance -= principal;
       if (i % 12 === 0) { // Push yearly data for chart
          data.push({ year: `Yr ${i/12}`, Balance: Math.max(0, Math.round(balance)) });
       }
    }
    setSchedule(data);
  }, [p, r, n]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden p-4 bg-slate-50 dark:bg-[#0B1120]">
       
       {/* CONTROLS */}
       <div className="w-full lg:w-[400px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xl z-10 overflow-y-auto">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
             <Calculator className="text-rose-500"/> Smart EMI
          </h2>

          <div className="space-y-8 flex-1">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Loan Amount</label>
                <div className="relative">
                   <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                   <input type="number" value={p} onChange={e=>setP(+e.target.value)} className="w-full pl-8 pr-4 py-2 border rounded-xl font-bold bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 ring-rose-500"/>
                </div>
                <input type="range" min="100000" max="10000000" step="50000" value={p} onChange={e=>setP(+e.target.value)} className="w-full mt-3 accent-rose-500"/>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Interest Rate (%)</label>
                <input type="number" value={r} onChange={e=>setR(+e.target.value)} className="w-full px-4 py-2 border rounded-xl font-bold bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 ring-rose-500"/>
                <input type="range" min="1" max="20" step="0.1" value={r} onChange={e=>setR(+e.target.value)} className="w-full mt-3 accent-rose-500"/>
             </div>

             <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tenure (Years)</label>
                <input type="number" value={n} onChange={e=>setN(+e.target.value)} className="w-full px-4 py-2 border rounded-xl font-bold bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 ring-rose-500"/>
                <input type="range" min="1" max="30" value={n} onChange={e=>setN(+e.target.value)} className="w-full mt-3 accent-rose-500"/>
             </div>
          </div>

          <div className="mt-8 bg-rose-600 text-white p-6 rounded-2xl text-center shadow-lg shadow-rose-500/20">
             <p className="text-xs font-bold text-rose-100 uppercase mb-1">Monthly EMI</p>
             <h1 className="text-4xl font-black">₹ {emi.toLocaleString('en-IN')}</h1>
          </div>
       </div>

       {/* VISUALS */}
       <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Interest</p>
                <p className="text-2xl font-black text-rose-500">₹ {totalInterest.toLocaleString('en-IN')}</p>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase">Total Amount</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">₹ {totalAmount.toLocaleString('en-IN')}</p>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px]">
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Loan Balance Projection</h3>
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={schedule}>
                   <defs>
                      <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                         <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize:10}} />
                   <YAxis hide />
                   <Tooltip contentStyle={{borderRadius:'12px', border:'none'}} formatter={(v) => `₹ ${Number(v).toLocaleString()}`} />
                   <Area type="monotone" dataKey="Balance" stroke="#f43f5e" fillOpacity={1} fill="url(#colorBal)" strokeWidth={3} />
                </AreaChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};
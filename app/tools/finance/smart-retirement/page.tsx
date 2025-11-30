"use client";
import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export default function FireCalc() {
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(55);
  const [current, setCurrent] = useState(1000000);
  const [monthly, setMonthly] = useState(50000);
  const [expense, setExpense] = useState(40000);
  const [roi, setRoi] = useState(10);

  const data = useMemo(() => {
    const result = [];
    let balance = current;
    const years = 90 - age; // Plan until 90
    
    for (let i = 0; i <= years; i++) {
      const year = age + i;
      const isRetired = year >= retireAge;
      if (!isRetired) {
         balance = (balance + (monthly * 12)) * (1 + roi/100);
      } else {
         balance = (balance * (1 + (roi-3)/100)) - (expense * 12); 
      }
      if (balance < 0) balance = 0;
      result.push({ year, balance: Math.round(balance) });
    }
    return result;
  }, [age, retireAge, current, monthly, expense, roi]);

  const freedomNum = expense * 12 * 25; 
  const canRetire = data.find(d => d.year === retireAge)?.balance || 0;
  const status = canRetire > freedomNum ? "Safe" : "At Risk";

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">FIRE Projection</h1>
        <p className="text-slate-500">Financial Independence, Retire Early.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6 h-fit">
            <div><label className="text-xs font-bold uppercase text-slate-500">Current Age: {age}</label><input type="range" min="18" max="70" value={age} onChange={e=>setAge(Number(e.target.value))} className="w-full accent-indigo-600"/></div>
            <div><label className="text-xs font-bold uppercase text-slate-500">Retire At: {retireAge}</label><input type="range" min="40" max="80" value={retireAge} onChange={e=>setRetireAge(Number(e.target.value))} className="w-full accent-emerald-600"/></div>
            
            <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-bold text-slate-500">Savings</label><input type="number" value={current} onChange={e=>setCurrent(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
               <div><label className="text-xs font-bold text-slate-500">Return %</label><input type="number" value={roi} onChange={e=>setRoi(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
            </div>
            <div><label className="text-xs font-bold text-slate-500">Monthly Invest</label><input type="number" value={monthly} onChange={e=>setMonthly(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
            <div><label className="text-xs font-bold text-slate-500">Monthly Expense</label><input type="number" value={expense} onChange={e=>setExpense(Number(e.target.value))} className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-900"/></div>
         </div>

         <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
               <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <div className="text-xs uppercase font-bold text-indigo-500">Freedom Number</div>
                  <div className="text-xl font-black text-indigo-900 dark:text-white">₹{(freedomNum/10000000).toFixed(2)} Cr</div>
               </div>
               <div className={`p-4 rounded-xl border ${status === 'Safe' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  <div className="text-xs uppercase font-bold">Plan Status</div>
                  <div className="text-xl font-black">{status}</div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                     <defs>
                        <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                     <XAxis dataKey="year" />
                     <YAxis tickFormatter={(v) => `₹${v/100000}L`} />
                     <Tooltip contentStyle={{borderRadius: '12px'}} formatter={(v: any) => `₹${v.toLocaleString()}`}/>
                     <Area type="monotone" dataKey="balance" stroke="#4F46E5" fillOpacity={1} fill="url(#colorBal)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}

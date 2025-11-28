"use client";
import React, { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function SIPCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const stats = useMemo(() => {
    const n = years * 12;
    const i = rate / 12 / 100;
    const invested = monthly * n;
    const total = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    return { invested: Math.round(invested), total: Math.round(total), profit: Math.round(total - invested) };
  }, [monthly, rate, years]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <ToolHeader title="SIP Calculator" desc="Estimate Mutual Fund Returns" icon={<TrendingUp size={20}/>} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit">
           <div><label className="text-[11px] font-bold text-slate-500 uppercase">Monthly (₹)</label><input type="number" value={monthly} onChange={e=>setMonthly(Number(e.target.value))} className="w-full mt-1 p-2 text-sm font-bold border rounded-lg outline-none focus:border-violet-500"/></div>
           <div><label className="text-[11px] font-bold text-slate-500 uppercase">Rate (%)</label><input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full mt-1 p-2 text-sm font-bold border rounded-lg outline-none focus:border-violet-500"/></div>
           <div><label className="text-[11px] font-bold text-slate-500 uppercase">Years</label><input type="number" value={years} onChange={e=>setYears(Number(e.target.value))} className="w-full mt-1 p-2 text-sm font-bold border rounded-lg outline-none focus:border-violet-500"/></div>
        </div>
        
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="p-5 border rounded-xl bg-white shadow-sm"><div className="text-xs text-slate-400 uppercase font-bold">Invested Amount</div><div className="text-2xl font-bold text-slate-700 mt-2">₹{stats.invested.toLocaleString()}</div></div>
           <div className="p-5 border rounded-xl bg-violet-600 text-white shadow-md"><div className="text-xs text-violet-200 uppercase font-bold">Total Value</div><div className="text-3xl font-bold mt-2">₹{stats.total.toLocaleString()}</div></div>
           <div className="col-span-full p-5 border rounded-xl bg-emerald-50 border-emerald-100"><div className="text-xs text-emerald-600 uppercase font-bold">Wealth Gained</div><div className="text-2xl font-bold text-emerald-700 mt-2">+ ₹{stats.profit.toLocaleString()}</div></div>
        </div>
      </div>
    </div>
  );
}

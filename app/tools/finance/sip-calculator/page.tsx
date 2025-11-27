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
    <div className="max-w-5xl mx-auto p-6">
      <ToolHeader title="SIP Calculator" desc="Estimate Mutual Fund Returns" icon={<TrendingUp size={20}/>} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div><label className="text-xs font-bold text-slate-500 uppercase">Monthly (₹)</label><input type="number" value={monthly} onChange={e=>setMonthly(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold text-slate-700"/></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Return (%)</label><input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold text-slate-700"/></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Years</label><input type="number" value={years} onChange={e=>setYears(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold text-slate-700"/></div>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
           <div className="p-5 border rounded-xl bg-white"><div className="text-xs text-slate-400 uppercase font-bold">Invested</div><div className="text-2xl font-bold text-slate-700 mt-2">₹{stats.invested.toLocaleString()}</div></div>
           <div className="p-5 border rounded-xl bg-violet-50 border-violet-100"><div className="text-xs text-violet-600 uppercase font-bold">Total Value</div><div className="text-3xl font-bold text-violet-700 mt-2">₹{stats.total.toLocaleString()}</div></div>
           <div className="p-5 border rounded-xl bg-white col-span-2"><div className="text-xs text-emerald-500 uppercase font-bold">Wealth Gained</div><div className="text-2xl font-bold text-emerald-600 mt-2">+ ₹{stats.profit.toLocaleString()}</div></div>
        </div>
      </div>
    </div>
  );
}

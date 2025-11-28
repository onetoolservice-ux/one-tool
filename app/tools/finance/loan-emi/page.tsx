"use client";
import React, { useState, useMemo } from "react";
import { Calculator, DollarSign, Calendar, Percent } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function LoanCalculator() {
  const [amount, setAmount] = useState(50000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);

  const results = useMemo(() => {
    const p = Number(amount), r = Number(rate) / 12 / 100, n = Number(years) * 12;
    if (!p || !r || !n) return { emi: 0, total: 0, interest: 0 };
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return { emi: Math.round(emi), total: Math.round(emi * n), interest: Math.round((emi * n) - p) };
  }, [amount, rate, years]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20">
      <ToolHeader title="Loan Planner" desc="EMI & Amortization" icon={<Calculator size={20}/>} />
      
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4 bg-white p-5 rounded-lg border border-slate-300 shadow-sm">
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Amount</label><input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="w-full mt-1 p-2 text-sm border rounded font-medium"/></div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Rate (%)</label><input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full mt-1 p-2 text-sm border rounded font-medium"/></div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Years</label><input type="number" value={years} onChange={e=>setYears(Number(e.target.value))} className="w-full mt-1 p-2 text-sm border rounded font-medium"/></div>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-600 text-white rounded-lg shadow-sm flex flex-col justify-center"><div className="text-[10px] font-bold opacity-80 uppercase">Monthly EMI</div><div className="text-2xl font-bold mt-1">${results.emi.toLocaleString()}</div></div>
          <div className="p-4 bg-white border border-slate-300 rounded-lg"><div className="text-[10px] font-bold text-slate-400 uppercase">Total Interest</div><div className="text-xl font-bold text-slate-700 mt-1">${results.interest.toLocaleString()}</div></div>
          <div className="p-4 bg-white border border-slate-300 rounded-lg"><div className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</div><div className="text-xl font-bold text-slate-700 mt-1">${results.total.toLocaleString()}</div></div>
        </div>
      </div>
    </div>
  );
}

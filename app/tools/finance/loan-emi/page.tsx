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
    <div className="max-w-5xl mx-auto p-6">
      <ToolHeader title="Loan Planner" desc="Calculate EMI & Amortization" icon={<Calculator size={20}/>} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <label htmlFor="amount" className="text-xs font-bold text-slate-500 uppercase">Amount</label>
            <input id="amount" type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold text-slate-700"/>
          </div>
          <div>
            <label htmlFor="rate" className="text-xs font-bold text-slate-500 uppercase">Rate (%)</label>
            <input id="rate" type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold text-slate-700"/>
          </div>
          <div>
            <label htmlFor="years" className="text-xs font-bold text-slate-500 uppercase">Years</label>
            <input id="years" type="number" value={years} onChange={e=>setYears(Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg font-semibold text-slate-700"/>
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl"><div className="text-xs font-bold text-blue-600 uppercase">Monthly EMI</div><div className="text-3xl font-bold text-blue-700 mt-2">${results.emi.toLocaleString()}</div></div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl"><div className="text-xs font-bold text-slate-400 uppercase">Total Interest</div><div className="text-2xl font-bold text-slate-700 mt-2">${results.interest.toLocaleString()}</div></div>
          <div className="p-5 bg-white border border-slate-200 rounded-xl"><div className="text-xs font-bold text-slate-400 uppercase">Total Amount</div><div className="text-2xl font-bold text-slate-700 mt-2">${results.total.toLocaleString()}</div></div>
        </div>
      </div>
    </div>
  );
}

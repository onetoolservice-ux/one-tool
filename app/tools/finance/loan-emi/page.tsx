"use client";

import React, { useState, useMemo } from "react";
import { Calculator, DollarSign, Calendar, Percent, PieChart, ArrowRight } from "lucide-react";

export default function LoanCalculator() {
  const [amount, setAmount] = useState(50000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(5);

  const results = useMemo(() => {
    const principal = Number(amount);
    const r = Number(rate) / 12 / 100;
    const n = Number(years) * 12;
    
    if (principal <= 0 || r <= 0 || n <= 0) return { emi: 0, total: 0, interest: 0 };

    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - principal;

    return {
      emi: Math.round(emi),
      total: Math.round(totalPayment),
      interest: Math.round(totalInterest)
    };
  }, [amount, rate, years]);

  // Chart sizing
  const total = results.total || 1;
  const pPercent = (amount / total) * 100;
  const iPercent = 100 - pPercent;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex p-3 bg-teal-50 text-teal-600 rounded-2xl mb-4">
          <Calculator size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Loan Planner</h1>
        <p className="text-slate-500 mt-2">Calculate EMIs for Home, Car, or Personal loans.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
          
          <div>
            <label className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span>Loan Amount</span>
              <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded">{amount.toLocaleString()}</span>
            </label>
            <input 
              type="range" min="1000" max="1000000" step="1000" 
              value={amount} onChange={e => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(117,163,163)]"
            />
            <div className="mt-4 relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:border-teal-500 outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span>Interest Rate (%)</span>
              <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded">{rate}%</span>
            </label>
            <input 
              type="range" min="1" max="30" step="0.1" 
              value={rate} onChange={e => setRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(117,163,163)]"
            />
            <div className="mt-4 relative">
              <Percent size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:border-teal-500 outline-none transition-colors" />
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              <span>Tenure (Years)</span>
              <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded">{years} Yr</span>
            </label>
            <input 
              type="range" min="1" max="30" step="1" 
              value={years} onChange={e => setYears(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[rgb(117,163,163)]"
            />
            <div className="mt-4 flex gap-2">
              {[1, 5, 10, 15, 20, 25, 30].map(y => (
                <button key={y} onClick={() => setYears(y)} className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${years === y ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Result Section */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Monthly EMI Card */}
          <div className="bg-[rgb(117,163,163)] text-white p-8 rounded-3xl shadow-lg shadow-teal-900/10 text-center">
            <div className="text-teal-100 text-sm font-bold uppercase tracking-widest mb-2">Monthly EMI</div>
            <div className="text-5xl font-bold tracking-tight">${results.emi.toLocaleString()}</div>
            <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4 text-left">
              <div>
                <div className="text-teal-100 text-xs">Total Interest</div>
                <div className="text-xl font-semibold">${results.interest.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-teal-100 text-xs">Total Amount</div>
                <div className="text-xl font-semibold">${results.total.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><PieChart size={18}/> Breakdown</h3>
            
            <div className="relative h-4 rounded-full w-full flex overflow-hidden mb-6">
              <div style={{ width: `${pPercent}%` }} className="bg-emerald-400 h-full" />
              <div style={{ width: `${iPercent}%` }} className="bg-rose-400 h-full" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" /> Principal
                </div>
                <span className="font-bold text-slate-800">{Math.round(pPercent)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-3 h-3 rounded-full bg-rose-400" /> Interest
                </div>
                <span className="font-bold text-slate-800">{Math.round(iPercent)}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

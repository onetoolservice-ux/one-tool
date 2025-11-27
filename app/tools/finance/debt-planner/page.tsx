"use client";

import React, { useState, useMemo } from "react";
import { Plus, Trash2, TrendingDown, PieChart, ChevronDown } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

interface Debt { id: number; name: string; balance: number; rate: number; minPayment: number; }
const CURRENCIES = ["$", "₹", "€", "£"];

export default function DebtPlanner() {
  const [currency, setCurrency] = useState("$");
  const [debts, setDebts] = useState<Debt[]>([{ id: 1, name: "Credit Card", balance: 5000, rate: 18.5, minPayment: 150 }]);
  const [extra, setExtra] = useState(500);
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("avalanche");

  const addDebt = () => setDebts([...debts, { id: Date.now(), name: "", balance: 0, rate: 0, minPayment: 0 }]);
  const removeDebt = (id: number) => setDebts(debts.filter(d => d.id !== id));
  const updateDebt = (id: number, f: keyof Debt, v: any) => setDebts(debts.map(d => d.id === id ? { ...d, [f]: v } : d));

  const stats = useMemo(() => {
    const totalBalance = debts.reduce((a, d) => a + d.balance, 0);
    const totalMin = debts.reduce((a, d) => a + d.minPayment, 0);
    const totalMonthly = totalMin + extra;
    let months = 0;
    if (totalMonthly > 0 && totalBalance > 0) {
      // Simplified calculation for UI speed
      const avgRate = debts.reduce((a,d)=>a+d.rate,0)/debts.length || 0;
      months = Math.ceil(totalBalance / (totalMonthly - (totalBalance * (avgRate/100)/12)));
      if (months < 0 || months > 600) months = 999;
    }
    const interest = (months * totalMonthly) - totalBalance;
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);
    return { totalBalance, totalMonthly, months, interest, date: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
  }, [debts, extra]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <ToolHeader title="Debt Destroyer" desc="Snowball vs Avalanche" icon={<TrendingDown size={18}/>}>
        <select value={currency} onChange={e=>setCurrency(e.target.value)} className="h-9 px-3 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-50">
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </ToolHeader>
      
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Input Table */}
        <div className="flex-1 overflow-y-auto p-6 border-r border-slate-200">
          <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
            <div className="flex justify-between items-center px-5 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700">Liabilities</h3>
              <button onClick={addDebt} className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-md transition-colors"><Plus size={14}/> Add</button>
            </div>
            <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Balance</div>
              <div className="col-span-2">Rate %</div>
              <div className="col-span-2">Min Pay</div>
              <div className="col-span-1"></div>
            </div>
            <div className="divide-y divide-slate-100">
              {debts.map(d => (
                <div key={d.id} className="grid grid-cols-12 gap-2 px-4 py-2 items-center hover:bg-slate-50">
                  <div className="col-span-4"><input type="text" value={d.name} onChange={e=>updateDebt(d.id, 'name', e.target.value)} className="w-full p-2 text-sm font-semibold text-slate-700 border border-slate-200 rounded focus:border-teal-500 outline-none" placeholder="Debt Name"/></div>
                  <div className="col-span-3 relative"><span className="absolute left-2 top-2 text-xs text-slate-400 font-bold">{currency}</span><input type="number" value={d.balance} onChange={e=>updateDebt(d.id, 'balance', Number(e.target.value))} className="w-full pl-5 p-2 text-sm font-mono text-slate-700 border border-slate-200 rounded focus:border-teal-500 outline-none"/></div>
                  <div className="col-span-2"><input type="number" value={d.rate} onChange={e=>updateDebt(d.id, 'rate', Number(e.target.value))} className="w-full p-2 text-sm font-mono text-slate-700 border border-slate-200 rounded focus:border-teal-500 outline-none"/></div>
                  <div className="col-span-2 relative"><span className="absolute left-2 top-2 text-xs text-slate-400 font-bold">{currency}</span><input type="number" value={d.minPayment} onChange={e=>updateDebt(d.id, 'minPayment', Number(e.target.value))} className="w-full pl-5 p-2 text-sm font-mono text-slate-700 border border-slate-200 rounded focus:border-teal-500 outline-none"/></div>
                  <div className="col-span-1 flex justify-center"><button onClick={()=>removeDebt(d.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"><Trash2 size={14}/></button></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats (Compact) */}
        <div className="w-full lg:w-80 bg-white p-6 flex flex-col gap-6 z-10 shadow-xl">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Strategy</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button onClick={()=>setStrategy('avalanche')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${strategy==='avalanche'?'bg-white shadow text-slate-900':'text-slate-500'}`}>Avalanche</button>
              <button onClick={()=>setStrategy('snowball')} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${strategy==='snowball'?'bg-white shadow text-slate-900':'text-slate-500'}`}>Snowball</button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Monthly Extra</label>
            <div className="relative"><span className="absolute left-3 top-3 text-slate-500 font-bold">{currency}</span><input type="number" value={extra} onChange={e=>setExtra(Number(e.target.value))} className="w-full pl-7 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 outline-none focus:border-teal-500 font-mono"/></div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Debt Free By</div>
            <div className="text-2xl font-bold">{stats.months<999 ? stats.date : 'Never'}</div>
            <div className="text-xs text-slate-400 mt-1">{stats.months} Months away</div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Total Debt</span><span className="font-bold text-slate-800">{currency}{stats.totalBalance.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Monthly Pay</span><span className="font-bold text-slate-800">{currency}{stats.totalMonthly.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm text-rose-600"><span className="font-medium">Est. Interest</span><span className="font-bold">{currency}{Math.max(0, stats.interest).toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

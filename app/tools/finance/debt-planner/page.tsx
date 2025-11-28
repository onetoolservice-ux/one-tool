"use client";
import React, { useState, useMemo } from "react";
import { Plus, Trash2, TrendingDown } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

interface Debt { id: number; name: string; balance: number; rate: number; minPayment: number; }

export default function DebtPlanner() {
  const [debts, setDebts] = useState<Debt[]>([{ id: 1, name: "Credit Card", balance: 5000, rate: 18.5, minPayment: 150 }]);
  const [extra, setExtra] = useState(500);

  const addDebt = () => setDebts([...debts, { id: Date.now(), name: "", balance: 0, rate: 0, minPayment: 0 }]);
  const removeDebt = (id: number) => setDebts(debts.filter(d => d.id !== id));
  const updateDebt = (id: number, f: keyof Debt, v: any) => setDebts(debts.map(d => d.id === id ? { ...d, [f]: v } : d));

  const stats = useMemo(() => {
    const totalBalance = debts.reduce((a, d) => a + d.balance, 0);
    const totalMonthly = debts.reduce((a, d) => a + d.minPayment, 0) + extra;
    const avgRate = debts.length > 0 ? debts.reduce((a,d)=>a+d.rate,0)/debts.length : 0;
    let months = 0;
    if (totalMonthly > 0 && totalBalance > 0) {
      months = Math.ceil(totalBalance / (totalMonthly - (totalBalance * (avgRate/100)/12)));
      if (months < 0 || months > 600) months = 999;
    }
    const d = new Date(); d.setMonth(d.getMonth() + months);
    return { totalBalance, totalMonthly, months, date: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
  }, [debts, extra]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <ToolHeader title="Debt Destroyer" desc="Payoff Calculator" icon={<TrendingDown size={18}/>} />
      <div className="max-w-5xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm">
             <div className="text-[10px] font-bold opacity-70 uppercase">Debt Free By</div>
             <div className="text-2xl font-bold">{stats.months < 999 ? stats.date : "Never"}</div>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
             <div className="text-[10px] font-bold text-slate-400 uppercase">Total Debt</div>
             <div className="text-2xl font-bold text-slate-800">${stats.totalBalance.toLocaleString()}</div>
          </div>
           <div className="p-4 bg-white border border-slate-200 rounded-xl">
             <div className="text-[10px] font-bold text-slate-400 uppercase">Monthly Pay</div>
             <div className="text-2xl font-bold text-slate-800">${stats.totalMonthly.toLocaleString()}</div>
          </div>
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
             <div className="text-[10px] font-bold text-emerald-600 uppercase">Extra Pay</div>
             <input type="number" value={extra} onChange={e=>setExtra(Number(e.target.value))} className="w-full bg-transparent text-2xl font-bold text-emerald-700 outline-none border-b border-emerald-200 focus:border-emerald-500"/>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
            <div className="col-span-4">Debt Name</div><div className="col-span-3">Balance</div><div className="col-span-2">Rate %</div><div className="col-span-2">Min Pay</div><div className="col-span-1"></div>
          </div>
          <div className="divide-y divide-slate-100">
            {debts.map(d => (
              <div key={d.id} className="grid grid-cols-12 gap-2 px-4 py-2 items-center hover:bg-slate-50">
                <div className="col-span-4"><input type="text" value={d.name} onChange={e=>updateDebt(d.id, 'name', e.target.value)} className="w-full p-1.5 text-sm font-medium text-slate-800 border border-slate-200 rounded focus:border-blue-500 outline-none" placeholder="Name"/></div>
                <div className="col-span-3"><input type="number" value={d.balance} onChange={e=>updateDebt(d.id, 'balance', Number(e.target.value))} className="w-full p-1.5 text-sm font-mono text-slate-700 border border-slate-200 rounded focus:border-blue-500 outline-none"/></div>
                <div className="col-span-2"><input type="number" value={d.rate} onChange={e=>updateDebt(d.id, 'rate', Number(e.target.value))} className="w-full p-1.5 text-sm font-mono text-slate-700 border border-slate-200 rounded focus:border-blue-500 outline-none"/></div>
                <div className="col-span-2"><input type="number" value={d.minPayment} onChange={e=>updateDebt(d.id, 'minPayment', Number(e.target.value))} className="w-full p-1.5 text-sm font-mono text-slate-700 border border-slate-200 rounded focus:border-blue-500 outline-none"/></div>
                <div className="col-span-1 flex justify-center"><button onClick={()=>removeDebt(d.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded"><Trash2 size={14}/></button></div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200">
             <button onClick={addDebt} className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"><Plus size={14}/> Add Debt</button>
          </div>
        </div>
      </div>
    </div>
  );
}

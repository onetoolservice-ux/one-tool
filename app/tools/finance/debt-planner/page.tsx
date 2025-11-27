"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, Trash2, TrendingDown, DollarSign, Percent, 
  AlertCircle, ChevronDown, CalendarCheck, HelpCircle
} from "lucide-react";

interface Debt {
  id: number;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

const CURRENCIES = [
  { label: "USD ($)", symbol: "$" },
  { label: "INR (₹)", symbol: "₹" },
  { label: "EUR (€)", symbol: "€" },
  { label: "GBP (£)", symbol: "£" },
];

export default function DebtPlanner() {
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [debts, setDebts] = useState<Debt[]>([
    { id: 1, name: "Credit Card", balance: 5000, rate: 18.5, minPayment: 150 },
    { id: 2, name: "Student Loan", balance: 12000, rate: 6.0, minPayment: 320 },
  ]);
  const [extraPayment, setExtraPayment] = useState(500);
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("avalanche");

  const addDebt = () => setDebts([...debts, { id: Date.now(), name: "", balance: 0, rate: 0, minPayment: 0 }]);
  const removeDebt = (id: number) => setDebts(debts.filter(d => d.id !== id));
  const updateDebt = (id: number, field: keyof Debt, value: any) => setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));

  const stats = useMemo(() => {
    const totalBalance = debts.reduce((acc, d) => acc + d.balance, 0);
    const totalMinPay = debts.reduce((acc, d) => acc + d.minPayment, 0);
    const totalMonthly = totalMinPay + extraPayment;
    let months = 0;
    let interestPaid = 0;
    const avgRate = debts.length > 0 ? debts.reduce((a,b) => a+b.rate,0)/debts.length : 0;

    if (totalMonthly > 0 && totalBalance > 0) {
      months = Math.ceil(totalBalance / (totalMonthly - (totalBalance * (avgRate/100)/12)));
      if (months < 0 || months > 360) months = 999;
      interestPaid = (months * totalMonthly) - totalBalance;
    }

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + months);
    const dateString = targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Chart Data (Mock Projection)
    const chartPoints = Array.from({length: 10}, (_, i) => Math.max(0, totalBalance - ((totalBalance/10) * i)));

    return { totalBalance, totalMinPay, months, interestPaid, totalMonthly, dateString, chartPoints };
  }, [debts, extraPayment]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#F8FAFC]">
      
      {/* HEADER */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg"><TrendingDown size={20} /></div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Debt Destroyer</h1>
            <p className="text-xs text-slate-500">Snowball vs Avalanche Calculator</p>
          </div>
        </div>
        
        {/* Currency Dropdown */}
        <div className="relative">
          <button onClick={() => setIsCurrencyOpen(!isCurrencyOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100">
            {currency.symbol} {currency.label.split(' ')[0]} <ChevronDown size={12}/>
          </button>
          {isCurrencyOpen && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-white border border-slate-200 rounded-lg shadow-xl p-1 z-50">
              {CURRENCIES.map(c => (
                <button key={c.label} onClick={() => { setCurrency(c); setIsCurrencyOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 rounded-md">
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* LEFT: INPUTS */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-sm">Liabilities</h3>
              <button onClick={addDebt} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold uppercase tracking-wider">
                <Plus size={14} strokeWidth={3} /> Add Debt
              </button>
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Name</div>
              <div className="col-span-3">Balance</div>
              <div className="col-span-2">Rate %</div>
              <div className="col-span-2">Min Pay</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-slate-100">
              {debts.map((debt) => (
                <div key={debt.id} className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-slate-50/50 transition-colors">
                  <div className="col-span-4"><input type="text" value={debt.name} onChange={e => updateDebt(debt.id, "name", e.target.value)} className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-sm font-medium focus:border-indigo-500 outline-none" placeholder="Name" /></div>
                  <div className="col-span-3"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currency.symbol}</span><input type="number" value={debt.balance} onChange={e => updateDebt(debt.id, "balance", Number(e.target.value))} className="w-full pl-5 pr-2 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono focus:border-indigo-500 outline-none" /></div></div>
                  <div className="col-span-2"><input type="number" value={debt.rate} onChange={e => updateDebt(debt.id, "rate", Number(e.target.value))} className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono text-right focus:border-indigo-500 outline-none" /></div>
                  <div className="col-span-2"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currency.symbol}</span><input type="number" value={debt.minPayment} onChange={e => updateDebt(debt.id, "minPayment", Number(e.target.value))} className="w-full pl-5 pr-2 py-1.5 bg-white border border-slate-200 rounded text-sm font-mono focus:border-indigo-500 outline-none" /></div></div>
                  <div className="col-span-1 text-center"><button onClick={() => removeDebt(debt.id)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded"><Trash2 size={14}/></button></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: COMPACT RESULTS PANEL */}
        <div className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-6 shadow-2xl text-white overflow-y-auto">
          
          {/* Extra Payment Input */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block flex items-center gap-1">Monthly Extra <HelpCircle size={10}/></label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">{currency.symbol}</span>
              <input type="number" value={extraPayment} onChange={e => setExtraPayment(Number(e.target.value))} className="w-full pl-9 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xl font-bold text-white focus:border-indigo-500 outline-none font-mono" />
            </div>
          </div>

          {/* Strategy Toggle */}
          <div className="bg-slate-800 p-1 rounded-lg flex">
            <button onClick={() => setStrategy("avalanche")} className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${strategy === "avalanche" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"}`}>Avalanche</button>
            <button onClick={() => setStrategy("snowball")} className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${strategy === "snowball" ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"}`}>Snowball</button>
          </div>

          {/* Payoff Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-5 rounded-2xl shadow-lg border border-white/10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider mb-1">Debt Free By</div>
              <div className="text-2xl font-bold text-white flex items-center gap-2">
                <CalendarCheck size={20}/> {stats.months < 999 ? stats.dateString : "Never"}
              </div>
              <div className="text-xs text-indigo-200 mt-1 opacity-80">{stats.months < 999 ? `${stats.months} Months away` : "Increase payment"}</div>
            </div>
            
            {/* Tiny Chart Visualization */}
            <div className="mt-4 flex items-end gap-1 h-12 opacity-50">
              {stats.chartPoints.map((val, i) => (
                <div key={i} style={{ height: `${(val / stats.totalBalance) * 100}%` }} className="flex-1 bg-white/50 rounded-t-sm"></div>
              ))}
            </div>
          </div>

          {/* Key Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
              <span className="text-slate-400">Total Debt</span>
              <span className="font-mono font-bold">{currency.symbol}{stats.totalBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
              <span className="text-slate-400">Monthly Pay</span>
              <span className="font-mono font-bold">{currency.symbol}{stats.totalMonthly.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-rose-400">
              <span>Total Interest</span>
              <span className="font-mono font-bold">{currency.symbol}{Math.max(0, stats.interestPaid).toLocaleString()}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

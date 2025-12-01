#!/bin/bash

echo "í» ï¸ Fixing syntax in SmartWidgets.tsx..."

cat > app/components/dashboard/SmartWidgets.tsx << 'WIDGET_CODE'
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, CreditCard, Wallet, TrendingUp } from "lucide-react";

export default function SmartWidgets() {
  const [show, setShow] = useState(false);
  const [data, setData] = useState({
    netWorth: 0,
    monthlySpend: 0,
    fireYear: "---"
  });

  useEffect(() => {
    try {
      const nwData = localStorage.getItem("ots_net_worth_v1");
      if (nwData) {
        const items = JSON.parse(nwData);
        const total = items.reduce((acc: number, i: any) => 
          i.type === 'Asset' ? acc + i.value : acc - i.value, 0);
        setData(prev => ({ ...prev, netWorth: total }));
      }
      const budgetData = localStorage.getItem("onetool_budget_v2");
      if (budgetData) {
        const txns = JSON.parse(budgetData);
        const currentMonth = new Date().toISOString().slice(0, 7);
        const spend = txns
          .filter((t: any) => t.date.startsWith(currentMonth) && t.type === 'expense')
          .reduce((acc: number, t: any) => acc + t.amount, 0);
        setData(prev => ({ ...prev, monthlySpend: spend }));
      }
      if (localStorage.getItem("ots_net_worth_v1")) {
         const year = new Date().getFullYear() + 12;
         setData(prev => ({ ...prev, fireYear: String(year) }));
      }
    } catch(e) {}
  }, []);

  const fmt = (n: number) => n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const blurClass = show ? "" : "blur-sm select-none";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Net Worth */}
      <div className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-4">
           <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
              <Wallet size={24} />
           </div>
           <button 
             onClick={(e) => { e.preventDefault(); setShow(!show); }} 
             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-indigo-600 transition relative z-20"
             aria-label={show ? "Hide values" : "Show values"}
           >
              {show ? <Eye size={18}/> : <EyeOff size={18}/>}
           </button>
        </div>
        <div className="space-y-1">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Worth</p>
           <h3 className={`text-2xl font-extrabold text-slate-900 dark:text-white transition-all ${blurClass}`}>
              {fmt(data.netWorth)}
           </h3>
        </div>
        <Link href="/tools/finance/smart-net-worth" className="absolute inset-0 z-10" aria-label="Open Net Worth Tool" />
      </div>

      {/* Monthly Spend */}
      <div className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-4">
           <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
              <CreditCard size={24} />
           </div>
        </div>
        <div className="space-y-1">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Spend</p>
           <h3 className={`text-2xl font-extrabold text-slate-900 dark:text-white transition-all ${blurClass}`}>
              {fmt(data.monthlySpend)}
           </h3>
        </div>
        <Link href="/tools/finance/smart-budget" className="absolute inset-0 z-10" aria-label="Open Smart Budget Tool" />
      </div>

      {/* Freedom Widget */}
      <div className="group relative p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-center mb-4">
           <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl">
              <TrendingUp size={24} />
           </div>
           <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-wide">
              Target Year
           </span>
        </div>
        <div className="space-y-1">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Financial Freedom</p>
           <h3 className={`text-2xl font-extrabold text-slate-900 dark:text-white transition-all ${blurClass}`}>
              {data.fireYear}
           </h3>
        </div>
        <Link href="/tools/finance/smart-retirement" className="absolute inset-0 z-10" aria-label="Open Retirement Calculator" />
      </div>

    </div>
  );
}
WIDGET_CODE

echo "âœ… SmartWidgets.tsx fixed."
echo "í±‰ Run 'npm run dev' to confirm."

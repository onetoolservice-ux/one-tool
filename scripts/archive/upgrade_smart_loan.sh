#!/bin/bash

echo "í¿¦ Upgrading Smart Loan to Enterprise V2..."

# 1. Create the directory
mkdir -p app/tools/finance/smart-loan

# 2. Create the Client Component (Logic & UI)
cat > app/tools/finance/smart-loan/LoanClient.tsx << 'CLIENT_EOF'
"use client";

import React, { useState, useMemo } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Calculator, Download, TrendingDown, TrendingUp, DollarSign, Calendar, Percent } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

type LoanData = {
  amount: number;
  rate: number;
  term: number; // in years
};

const COLORS = ['#3B82F6', '#F59E0B']; // Blue (Principal), Amber (Interest)

export default function LoanClient() {
  // Enterprise Feature: Data Persistence
  const [data, setData] = useLocalStorage<LoanData>("onetool_loan_v1", {
    amount: 100000,
    rate: 5.5,
    term: 30
  });

  // Calculation Engine
  const { monthlyPayment, totalPayment, totalInterest, schedule, chartData } = useMemo(() => {
    const r = data.rate / 100 / 12;
    const n = data.term * 12;
    
    // Monthly Payment Formula
    const monthly = data.amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    // Metrics
    const totalPay = monthly * n;
    const totalInt = totalPay - data.amount;

    // Generate Schedule
    let balance = data.amount;
    const scheduleData = [];
    for (let i = 1; i <= n; i++) {
      const interestPayment = balance * r;
      const principalPayment = monthly - interestPayment;
      balance -= principalPayment;
      
      if (i % 12 === 0 || i === 1 || i === n) { // Optimize: Store yearly summary + first/last for table
         scheduleData.push({
            month: i,
            year: Math.ceil(i / 12),
            payment: monthly,
            interest: interestPayment,
            principal: principalPayment,
            balance: balance > 0 ? balance : 0
         });
      }
    }

    // Chart Data
    const chart = [
      { name: 'Principal', value: data.amount },
      { name: 'Interest', value: totalInt }
    ];

    return { 
      monthlyPayment: monthly, 
      totalPayment: totalPay, 
      totalInterest: totalInt, 
      schedule: scheduleData,
      chartData: chart
    };
  }, [data]);

  const handleInput = (field: keyof LoanData, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      setData({ ...data, [field]: num });
    }
  };

  const exportCSV = () => {
    // Re-calculate full schedule for export
    const r = data.rate / 100 / 12;
    const n = data.term * 12;
    let balance = data.amount;
    let csv = "Month,Payment,Principal,Interest,Remaining Balance\n";
    
    for (let i = 1; i <= n; i++) {
      const interestPayment = balance * r;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      csv += `${i},${monthlyPayment.toFixed(2)},${principalPayment.toFixed(2)},${interestPayment.toFixed(2)},${balance.toFixed(2)}\n`;
    }

    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "loan_amortization_schedule.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center gap-3 mb-2 text-blue-600 dark:text-blue-400">
            <div className="p-2 bg-white dark:bg-blue-900/50 rounded-lg shadow-sm"><Calendar size={20}/></div>
            <span className="font-bold text-sm uppercase tracking-wider">Monthly Pay</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {monthlyPayment ? monthlyPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '...'}
          </p>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-100 dark:border-amber-800/50">
          <div className="flex items-center gap-3 mb-2 text-amber-600 dark:text-amber-400">
            <div className="p-2 bg-white dark:bg-amber-900/50 rounded-lg shadow-sm"><TrendingUp size={20}/></div>
            <span className="font-bold text-sm uppercase tracking-wider">Total Interest</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
             {totalInterest ? totalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '...'}
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2 text-slate-600 dark:text-slate-400">
            <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm"><DollarSign size={20}/></div>
            <span className="font-bold text-sm uppercase tracking-wider">Total Cost</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
             {totalPayment ? totalPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '...'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
               <Calculator className="text-blue-500"/> Loan Details
             </h3>
             
             <div className="space-y-6">
               <div>
                 <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Loan Amount</label>
                 <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><DollarSign size={18}/></span>
                    <input 
                      type="number" 
                      value={data.amount}
                      onChange={(e) => handleInput('amount', e.target.value)}
                      className="w-full pl-12 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
                    />
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Interest Rate (%)</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Percent size={18}/></span>
                      <input 
                        type="number" 
                        value={data.rate}
                        onChange={(e) => handleInput('rate', e.target.value)}
                        className="w-full pl-12 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
                      />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Loan Term (Years)</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Calendar size={18}/></span>
                      <input 
                        type="number" 
                        value={data.term}
                        onChange={(e) => handleInput('term', e.target.value)}
                        className="w-full pl-12 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium"
                      />
                   </div>
                 </div>
               </div>
             </div>
          </div>

          {/* Amortization Table Preview */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 dark:text-slate-100">Amortization Schedule (Yearly)</h3>
               <button onClick={exportCSV} className="text-xs font-bold px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 transition flex items-center gap-2">
                  <Download size={14}/> Download Full CSV
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-3">Year</th>
                      <th className="px-6 py-3 text-right">Principal Paid</th>
                      <th className="px-6 py-3 text-right">Interest Paid</th>
                      <th className="px-6 py-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.month} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">Year {row.year}</td>
                        <td className="px-6 py-3 text-right text-emerald-600 dark:text-emerald-400">${row.principal.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        <td className="px-6 py-3 text-right text-amber-600 dark:text-amber-400">${row.interest.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                        <td className="px-6 py-3 text-right font-bold text-slate-700 dark:text-slate-300">${row.balance.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>

        {/* Visual Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-fit">
           <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
             <TrendingDown className="text-blue-500"/> Breakdown
           </h3>
           <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-sm text-slate-500 dark:text-slate-400 text-center leading-relaxed">
              Over <strong>{data.term} years</strong>, you will pay <strong className="text-amber-600">{totalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong> in interest alone.
           </div>
        </div>
      </div>
    </div>
  );
}
CLIENT_EOF

# 3. Create the Server Page (Metadata & SEO)
cat > app/tools/finance/smart-loan/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import LoanClient from "./LoanClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Smart Loan Calculator - Amortization & Interest | One Tool",
  description: "Calculate monthly loan payments, total interest, and amortization schedules. Visualize principal vs interest with interactive charts. Free and secure.",
  keywords: ["loan calculator", "amortization schedule", "mortgage calculator", "interest calculator", "loan payoff"],
  alternates: {
    canonical: "https://onetool.co.in/tools/finance/smart-loan",
  }
};

export default function SmartLoanPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 min-h-screen">
      {/* Enterprise SEO: Rich Snippets */}
      <ToolSchema 
        name="Smart Loan Calculator" 
        description="Professional loan amortization and interest calculator with visual breakdowns and CSV export."
        path="/tools/finance/smart-loan"
        category="FinanceApplication"
      />

      {/* SEO Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>/</span>
          <Link href="/tools/finance" className="hover:text-blue-600 transition">Finance</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white">Smart Loan</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Smart <span className="text-blue-600">Loan</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
          Visualize your loan payoff journey. See exactly how much goes to principal vs interest and download your full schedule.
        </p>
      </div>

      <LoanClient />
    </div>
  );
}
PAGE_EOF

echo "âœ… Smart Loan V2 Upgrade Complete."
echo "í±‰ Run 'npm run dev' to check the new calculator!"

#!/bin/bash

echo "✨ Polishing Navigation & UI Details..."

# 1. UPGRADE TOOL SHELL (Navigation & Icon Fix)
cat > app/components/layout/ToolShell.tsx << 'SHELL_EOF'
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, LayoutGrid, Star } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

interface ToolShellProps {
  title: string;
  description: string;
  category: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function ToolShell({ title, description, category, icon, children, actions }: ToolShellProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Back Button -> Dashboard */}
            <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Back to Dashboard">
              <ArrowLeft size={20} />
            </Link>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            
            {/* 3-Layer Breadcrumb */}
            <div className="flex flex-col">
               <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <Home size={10} /> Home
                  </Link>
                  <span>/</span>
                  <Link href="/dashboard" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <LayoutGrid size={10} /> Dashboard
                  </Link>
               </div>
               
               {/* Title & Icon */}
               <div className="flex items-center gap-2 mt-0.5">
                  {/* Fixed Icon: Wrapped in a nice box */}
                  {icon && (
                    <div className="p-1 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                      {icon}
                    </div>
                  )}
                  <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-white truncate">
                    {title}
                  </h1>
               </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
      </div>

      {/* Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
           {children}
        </div>
      </main>
    </div>
  );
}
SHELL_EOF

# 2. POLISH SMART BUDGET UI (Bigger Inputs, Clean Table)
cat > app/tools/finance/smart-budget/BudgetClient.tsx << 'BUDGET_EOF'
"use client";

import React, { useState, useMemo } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";

type Transaction = {
  id: string;
  desc: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
};

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6', '#EC4899'];

export default function BudgetClient() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("onetool_budget_v2", []);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");

  const { totalIncome, totalExpense, balance, chartData } = useMemo(() => {
    let income = 0, expense = 0;
    const catMap: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === "income") {
        income += t.amount;
      } else {
        expense += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    });

    const chartData = Object.entries(catMap).map(([name, value]) => ({ name, value }));
    return { totalIncome: income, totalExpense: expense, balance: income - expense, chartData };
  }, [transactions]);

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    
    const newTxn: Transaction = {
      id: Date.now().toString(),
      desc,
      amount: parseFloat(amount),
      type,
      category: type === 'income' ? 'Salary' : 'General',
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([newTxn, ...transactions]);
    setDesc("");
    setAmount("");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const exportCSV = () => {
    const headers = ["Date,Description,Type,Amount"];
    const rows = transactions.map(t => \`\${t.date},\${t.desc},\${t.type},\${t.amount}\`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "onetool_budget.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <ToolShell 
      title="Smart Budget" 
      description="Track income and expenses. Data saved locally."
      category="Finance"
      icon={<Wallet size={18} />}
      actions={
        <Button variant="outline" size="xs" onClick={exportCSV} icon={<Download size={14}/>}>
          Export
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-900">
            <div className="flex items-center gap-2 mb-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={16}/>
              <span className="font-bold text-xs uppercase tracking-wider">Income</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalIncome.toLocaleString()}</p>
          </Card>
          
          <Card className="p-5 border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-900/10 dark:to-slate-900">
            <div className="flex items-center gap-2 mb-1 text-rose-600 dark:text-rose-400">
              <TrendingDown size={16}/>
              <span className="font-bold text-xs uppercase tracking-wider">Expenses</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalExpense.toLocaleString()}</p>
          </Card>

          <Card className="p-5 border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900">
            <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400">
              <Wallet size={16}/>
              <span className="font-bold text-xs uppercase tracking-wider">Balance</span>
            </div>
            <p className={\`text-2xl font-bold \${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}\`}>
              ₹{balance.toLocaleString()}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
                 New Transaction
               </h3>
               <form onSubmit={addTransaction} className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="w-full sm:w-32">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Type</label>
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value as "income" | "expense")}
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Grocery, Rent..." 
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Amount</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <Button type="submit" size="md" className="h-11 w-full sm:w-auto" icon={<Plus size={18}/>}>Add</Button>
               </form>
            </Card>

            {/* List */}
            <Card className="overflow-hidden">
              <div className="max-h-[400px] overflow-y-auto">
                 {transactions.length === 0 ? (
                   <div className="p-12 text-center text-slate-400 text-sm">
                      <div className="inline-flex p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                        <Wallet size={24} className="opacity-50"/>
                      </div>
                      <p>No transactions yet.</p>
                   </div>
                 ) : (
                   <table className="w-full text-sm text-left">
                      <thead className="text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 w-32">Date</th>
                          <th className="px-6 py-3">Description</th>
                          <th className="px-6 py-3 text-right">Amount</th>
                          <th className="px-6 py-3 w-16"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {transactions.map((t) => (
                          <tr key={t.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-3 text-slate-500 text-xs">{t.date}</td>
                            <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{t.desc}</td>
                            <td className={\`px-6 py-3 text-right font-bold \${t.type === 'income' ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}\`}>
                               {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-center">
                               <button onClick={() => deleteTransaction(t.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors">
                                 <Trash2 size={14}/>
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                 )}
              </div>
            </Card>
          </div>

          {/* Chart */}
          <Card className="p-6 flex flex-col bg-white dark:bg-slate-800">
             <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
               <PieIcon size={16} className="text-indigo-500"/> Spending Analysis
             </h3>
             <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                  </PieChart>
                </ResponsiveContainer>
             </div>
          </Card>
        </div>
      </div>
    </ToolShell>
  );
}
BUDGET_EOF

echo "✅ UI & Navigation Polished."
echo "��� Run 'npm run dev'. Check the Smart Budget page for the new look."

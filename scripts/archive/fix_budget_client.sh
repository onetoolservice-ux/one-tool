#!/bin/bash

echo "í²° Fixing syntax error in BudgetClient.tsx..."

cat > app/tools/finance/smart-budget/BudgetClient.tsx << 'CODE_END'
"use client";

import React, { useState, useMemo } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, Download } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

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
    // FIXED LINE BELOW: Removed extra backslashes
    const rows = transactions.map(t => `${t.date},${t.desc},${t.type},${t.amount}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "onetool_budget.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
          <div className="flex items-center gap-3 mb-2 text-emerald-600 dark:text-emerald-400">
            <div className="p-2 bg-white dark:bg-emerald-900/50 rounded-lg shadow-sm"><TrendingUp size={20}/></div>
            <span className="font-bold text-sm uppercase tracking-wider">Income</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">â‚¹{totalIncome.toLocaleString()}</p>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-2xl border border-rose-100 dark:border-rose-800/50">
          <div className="flex items-center gap-3 mb-2 text-rose-600 dark:text-rose-400">
            <div className="p-2 bg-white dark:bg-rose-900/50 rounded-lg shadow-sm"><TrendingDown size={20}/></div>
            <span className="font-bold text-sm uppercase tracking-wider">Expenses</span>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">â‚¹{totalExpense.toLocaleString()}</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center gap-3 mb-2 text-blue-600 dark:text-blue-400">
            <div className="p-2 bg-white dark:bg-blue-900/50 rounded-lg shadow-sm"><Wallet size={20}/></div>
            <span className="font-bold text-sm uppercase tracking-wider">Balance</span>
          </div>
          {/* FIXED LINE BELOW: Removed extra backslashes */}
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-slate-800 dark:text-slate-100' : 'text-rose-600'}`}>â‚¹{balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
               <Plus className="text-indigo-500"/> Add Transaction
             </h3>
             <form onSubmit={addTransaction} className="flex flex-col sm:flex-row gap-4">
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value as "income" | "expense")}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Description (e.g. Rent)" 
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
                <input 
                  type="number" 
                  placeholder="Amount" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full sm:w-32 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl font-bold transition-colors">
                  Add
                </button>
             </form>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 dark:text-slate-100">History</h3>
               <button onClick={exportCSV} className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition">
                  <Download size={14}/> Export CSV
               </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
               {transactions.length === 0 ? (
                 <div className="p-8 text-center text-slate-400">No transactions yet. Add one above!</div>
               ) : (
                 <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Desc</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-4 py-3 text-slate-500">{t.date}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{t.desc}</td>
                          {/* FIXED LINE BELOW: Removed extra backslashes */}
                          <td className={`px-4 py-3 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-300'}`}>
                             {t.type === 'income' ? '+' : '-'}â‚¹{t.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                             <button onClick={() => deleteTransaction(t.id)} className="text-slate-400 hover:text-rose-500 transition">
                               <Trash2 size={16}/>
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
             <PieIcon className="text-violet-500"/> Spending Split
           </h3>
           <div className="flex-1 min-h-[300px]">
              {chartData.length > 0 ? (
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
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center">
                   Add expenses to see<br/>your spending breakdown
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
CODE_END

echo "âœ… BudgetClient.tsx fixed and patched."
echo "í±‰ Run 'npm run dev' to verify."

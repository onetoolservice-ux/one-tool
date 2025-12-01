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
    <ToolShell 
      title="Smart Budget" 
      description="Track income and expenses securely. Data is stored locally on your device."
      category="Finance"
      icon={<Wallet className="w-5 h-5 text-emerald-500" />}
      actions={
        <Button variant="outline" size="sm" onClick={exportCSV} icon={<Download size={16}/>}>
          Export CSV
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3 mb-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={20}/>
              <span className="font-bold text-xs uppercase tracking-wider">Income</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">₹{totalIncome.toLocaleString()}</p>
          </Card>
          
          <Card className="p-6 border-l-4 border-l-rose-500">
            <div className="flex items-center gap-3 mb-2 text-rose-600 dark:text-rose-400">
              <TrendingDown size={20}/>
              <span className="font-bold text-xs uppercase tracking-wider">Expenses</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">₹{totalExpense.toLocaleString()}</p>
          </Card>

          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3 mb-2 text-blue-600 dark:text-blue-400">
              <Wallet size={20}/>
              <span className="font-bold text-xs uppercase tracking-wider">Balance</span>
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600'}`}>
              ₹{balance.toLocaleString()}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 Add Transaction
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
                    placeholder="Description" 
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
                  <Button type="submit" icon={<Plus size={18}/>}>Add</Button>
               </form>
            </Card>

            {/* List */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
                 <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">Transaction History</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                 {transactions.length === 0 ? (
                   <div className="p-12 text-center text-slate-400 text-sm">No transactions found.</div>
                 ) : (
                   <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">
                        <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Desc</th>
                          <th className="px-6 py-3 text-right">Amount</th>
                          <th className="px-6 py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t) => (
                          <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-6 py-3 text-slate-500">{t.date}</td>
                            <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{t.desc}</td>
                            <td className={`px-6 py-3 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>
                               {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-center">
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
            </Card>
          </div>

          {/* Chart */}
          <Card className="p-6 flex flex-col">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
               <PieIcon className="text-violet-500"/> Spending Split
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
             </div>
          </Card>
        </div>
      </div>
    </ToolShell>
  );
}

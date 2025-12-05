"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export const BudgetPlanner = () => {
  const [incomes, setIncomes] = useState([
    { id: 1, name: "Salary", amount: 85000 },
    { id: 2, name: "Freelance", amount: 15000 }
  ]);
  const [expenses, setExpenses] = useState([
    { id: 1, name: "Rent", amount: 22000, type: "Need" },
    { id: 2, name: "Groceries", amount: 8000, type: "Need" },
    { id: 3, name: "SIP", amount: 15000, type: "Savings" },
    { id: 4, name: "Dining", amount: 6000, type: "Want" }
  ]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalIncome = incomes.reduce((a, c) => a + Number(c.amount), 0);
  const totalExpenses = expenses.reduce((a, c) => a + Number(c.amount), 0);
  const balance = totalIncome - totalExpenses;

  const data = [
    { name: 'Needs', value: expenses.filter(e => e.type === 'Need').reduce((a, c) => a + c.amount, 0), color: '#6366f1' },
    { name: 'Wants', value: expenses.filter(e => e.type === 'Want').reduce((a, c) => a + c.amount, 0), color: '#ec4899' },
    { name: 'Savings', value: expenses.filter(e => e.type === 'Savings').reduce((a, c) => a + c.amount, 0) + balance, color: '#10b981' },
  ].filter(x => x.value > 0);

  if (!mounted) return <div className="p-10 text-center">Loading Financial Engine...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden p-2">
       {/* INPUTS */}
       <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-emerald-600 flex items-center gap-2"><TrendingUp size={16}/> Income</h3><button onClick={() => setIncomes([...incomes, {id: Date.now(), name: 'New', amount: 0}])} className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded text-xs font-bold">+ Add</button></div>
             {incomes.map((i, idx) => (
               <div key={i.id} className="flex gap-2 mb-2">
                 <input value={i.name} onChange={e => {const n = [...incomes]; n[idx].name = e.target.value; setIncomes(n);}} className="flex-1 bg-slate-50 dark:bg-slate-900 rounded px-3 py-2 text-sm font-medium outline-none"/>
                 <input type="number" value={i.amount} onChange={e => {const n = [...incomes]; n[idx].amount = Number(e.target.value); setIncomes(n);}} className="w-24 bg-slate-50 dark:bg-slate-900 rounded px-3 py-2 text-sm font-bold text-right outline-none"/>
               </div>
             ))}
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-rose-600 flex items-center gap-2"><TrendingDown size={16}/> Expenses</h3><button onClick={() => setExpenses([...expenses, {id: Date.now(), name: 'New', amount: 0, type: 'Need'}])} className="bg-rose-50 text-rose-600 px-3 py-1 rounded text-xs font-bold">+ Add</button></div>
             {expenses.map((i, idx) => (
               <div key={i.id} className="flex gap-2 mb-2">
                 <input value={i.name} onChange={e => {const n = [...expenses]; n[idx].name = e.target.value; setExpenses(n);}} className="flex-1 bg-slate-50 dark:bg-slate-900 rounded px-3 py-2 text-sm font-medium outline-none"/>
                 <select value={i.type} onChange={e => {const n = [...expenses]; n[idx].type = e.target.value; setExpenses(n);}} className="w-20 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded px-1 outline-none"><option value="Need">Need</option><option value="Want">Want</option><option value="Savings">Save</option></select>
                 <input type="number" value={i.amount} onChange={e => {const n = [...expenses]; n[idx].amount = Number(e.target.value); setExpenses(n);}} className="w-24 bg-slate-50 dark:bg-slate-900 rounded px-3 py-2 text-sm font-bold text-right outline-none"/>
               </div>
             ))}
          </div>
       </div>
       {/* CHARTS */}
       <div className="w-full lg:w-1/2 h-full bg-slate-50 dark:bg-black/20 rounded-3xl p-6 flex flex-col justify-center text-center relative border border-slate-200 dark:border-slate-800">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(value) => `₹ ${Number(value).toLocaleString('en-IN')}`} itemStyle={{color: '#fff'}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border: 'none'}} />
              <Legend verticalAlign="bottom" iconType="circle"/>
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4"><p className="text-xs text-slate-400 font-bold uppercase">Balance</p><h2 className="text-3xl font-black text-slate-900 dark:text-white">₹ {balance.toLocaleString('en-IN')}</h2></div>
       </div>
    </div>
  );
};
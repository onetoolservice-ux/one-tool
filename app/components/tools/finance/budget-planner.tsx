"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

export const BudgetPlanner = () => {
  const [incomes, setIncomes] = useState([{ id: 1, name: "Salary", amount: 85000 }]);
  const [expenses, setExpenses] = useState([
    { id: 1, name: "Rent", amount: 22000, type: "Need" },
    { id: 2, name: "Groceries", amount: 8000, type: "Need" },
    { id: 3, name: "SIP", amount: 15000, type: "Savings" }
  ]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const totalIncome = incomes.reduce((a, c) => a + Number(c.amount), 0);
  const totalExpenses = expenses.reduce((a, c) => a + Number(c.amount), 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const chartData = [
    { name: 'Needs', value: expenses.filter(e => e.type === 'Need').reduce((a, c) => a + Number(c.amount), 0), color: '#6366f1' },
    { name: 'Wants', value: expenses.filter(e => e.type === 'Want').reduce((a, c) => a + Number(c.amount), 0), color: '#f43f5e' },
    { name: 'Savings', value: expenses.filter(e => e.type === 'Savings').reduce((a, c) => a + Number(c.amount), 0), color: '#10b981' },
  ].filter(d => d.value > 0);

  const addInc = () => setIncomes([...incomes, { id: Date.now(), name: "New", amount: 0 }]);
  const upInc = (id, f, v) => setIncomes(incomes.map(i => i.id === id ? { ...i, [f]: v } : i));
  
  const addExp = () => setExpenses([...expenses, { id: Date.now(), name: "New", amount: 0, type: "Need" }]);
  const upExp = (id, f, v) => setExpenses(expenses.map(i => i.id === id ? { ...i, [f]: v } : i));

  if (!mounted) return <div className="h-96 animate-pulse bg-slate-100 rounded-2xl"></div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)] overflow-hidden p-2">
       <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-emerald-600 flex items-center gap-2"><TrendingUp size={16}/> Income</h3><button onClick={addInc} className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded text-xs font-bold">+ Add</button></div>
             {incomes.map((i, idx) => <div key={i.id} className="flex gap-2 mb-2"><input value={i.name} onChange={e=>upInc(i.id,'name',e.target.value)} className="flex-1 bg-slate-50 rounded px-3 py-2 text-sm"/><input type="number" value={i.amount} onChange={e=>upInc(i.id,'amount',Number(e.target.value))} className="w-24 bg-slate-50 rounded px-3 py-2 text-sm text-right"/></div>)}
          </div>
          <div>
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-rose-600 flex items-center gap-2"><TrendingDown size={16}/> Expenses</h3><button onClick={addExp} className="bg-rose-50 text-rose-600 px-3 py-1 rounded text-xs font-bold">+ Add</button></div>
             {expenses.map((i, idx) => <div key={i.id} className="flex gap-2 mb-2"><input value={i.name} onChange={e=>upExp(i.id,'name',e.target.value)} className="flex-1 bg-slate-50 rounded px-3 py-2 text-sm"/><select value={i.type} onChange={e=>upExp(i.id,'type',e.target.value)} className="w-20 bg-slate-50 text-xs"><option value="Need">Need</option><option value="Want">Want</option><option value="Savings">Save</option></select><input type="number" value={i.amount} onChange={e=>upExp(i.id,'amount',Number(e.target.value))} className="w-24 bg-slate-50 rounded px-3 py-2 text-sm text-right"/></div>)}
          </div>
       </div>
       <div className="w-full lg:w-1/2 h-full bg-slate-50 dark:bg-black/20 rounded-3xl p-6 flex flex-col justify-center text-center relative border border-slate-200 dark:border-slate-800">
          <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
          <div className="mt-4"><p className="text-xs text-slate-400 font-bold uppercase">Balance</p><h2 className="text-3xl font-black">₹ {balance.toLocaleString('en-IN')}</h2></div>
       </div>
    </div>
  );
};
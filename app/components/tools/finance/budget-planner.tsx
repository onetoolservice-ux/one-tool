"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';
import { formatCurrency } from '@/app/lib/utils/tool-helpers';

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

  // Validation: Ensure arrays are not empty
  const hasValidIncome = incomes.length > 0 && incomes.some(i => Number(i.amount) > 0);
  const hasValidExpenses = expenses.length > 0 && expenses.some(e => Number(e.amount) > 0);

  const totalIncome = useMemo(() => incomes.reduce((a, c) => a + Number(c.amount), 0), [incomes]);
  const totalExpenses = useMemo(() => expenses.reduce((a, c) => a + Number(c.amount), 0), [expenses]);
  const balance = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses]);

  // Memoize expensive filter/reduce operations
  const needsValue = useMemo(() => 
    expenses.filter(e => e.type === 'Need').reduce((a, c) => a + Number(c.amount), 0),
    [expenses]
  );
  const wantsValue = useMemo(() => 
    expenses.filter(e => e.type === 'Want').reduce((a, c) => a + Number(c.amount), 0),
    [expenses]
  );
  const savingsValue = useMemo(() => 
    expenses.filter(e => e.type === 'Savings').reduce((a, c) => a + Number(c.amount), 0),
    [expenses]
  );

  const data = useMemo(() => [
    { name: 'Needs', value: needsValue, color: '#6366f1' },
    { name: 'Wants', value: wantsValue, color: '#ec4899' },
    { name: 'Savings', value: savingsValue + balance, color: '#10b981' },
  ].filter(x => x.value > 0), [needsValue, wantsValue, savingsValue, balance]);

  if (!mounted) return <div className="p-10 text-center">Loading Financial Engine...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden p-2">
       {/* INPUTS */}
       <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <div>
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-emerald-600 flex items-center gap-2"><TrendingUp size={16}/> Income</h3><button onClick={() => setIncomes([...incomes, {id: Date.now(), name: 'New', amount: 0}])} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-sm">+ Add</button></div>
             {incomes.length === 0 && <p className="text-xs text-slate-400 mb-2 italic">Add at least one income source</p>}
             {incomes.map((i, idx) => (
               <div key={i.id} className="flex gap-2 mb-2 items-center">
                 <input value={i.name} onChange={e => {const n = [...incomes]; n[idx].name = e.target.value; setIncomes(n);}} className="flex-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all"/>
                 <input type="text" inputMode="numeric" pattern="[0-9]*" value={i.amount} onChange={e => {
                   const val = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                   if (val < 0) {
                     showToast('Amount cannot be negative', 'error');
                     return;
                   }
                   const n = [...incomes]; 
                   n[idx].amount = val; 
                   setIncomes(n);
                 }} className="w-24 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-lg px-3 py-2 text-sm font-bold text-right text-slate-900 dark:text-white outline-none transition-all"/>
                 <button onClick={() => setIncomes(incomes.filter(item => item.id !== i.id))} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors" aria-label={`Delete ${i.name || 'income'}`} title={`Delete ${i.name || 'income'}`}>
                   <Trash2 size={14}/>
                 </button>
               </div>
             ))}
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-rose-600 flex items-center gap-2"><TrendingDown size={16}/> Expenses</h3><button onClick={() => setExpenses([...expenses, {id: Date.now(), name: 'New', amount: 0, type: 'Need'}])} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-sm">+ Add</button></div>
             {expenses.length === 0 && <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 italic">Add at least one expense</p>}
             {expenses.map((i, idx) => (
               <div key={i.id} className="flex gap-2 mb-2 items-center">
                 <input value={i.name} onChange={e => {const n = [...expenses]; n[idx].name = e.target.value; setExpenses(n);}} className="flex-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-all"/>
                 <select value={i.type} onChange={e => {const n = [...expenses]; n[idx].type = e.target.value; setExpenses(n);}} className="w-20 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 text-xs font-bold rounded-lg px-2 py-2 outline-none transition-all"><option value="Need">Need</option><option value="Want">Want</option><option value="Savings">Save</option></select>
                 <input type="text" inputMode="numeric" pattern="[0-9]*" value={i.amount} onChange={e => {
                   const val = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                   if (val < 0) {
                     showToast('Amount cannot be negative', 'error');
                     return;
                   }
                   const n = [...expenses]; 
                   n[idx].amount = val; 
                   setExpenses(n);
                 }} className="w-24 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-lg px-3 py-2 text-sm font-bold text-right text-slate-900 dark:text-white outline-none transition-all"/>
                 <button onClick={() => setExpenses(expenses.filter(item => item.id !== i.id))} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors" aria-label={`Delete ${i.name || 'expense'}`} title={`Delete ${i.name || 'expense'}`}>
                   <Trash2 size={14}/>
                 </button>
               </div>
             ))}
          </div>
       </div>
       {/* CHARTS */}
       <div className="w-full lg:w-1/2 h-full bg-slate-50 dark:bg-black/20 rounded-3xl p-6 flex flex-col justify-center text-center relative border border-slate-200 dark:border-slate-800">
          {data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                    {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value), '₹')} itemStyle={{color: '#fff'}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '8px', border: 'none'}} />
                  <Legend verticalAlign="bottom" iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4"><p className="text-xs text-slate-400 font-semibold uppercase">Balance</p><h2 className="text-3xl font-bold text-slate-900 dark:text-white">₹ {balance.toLocaleString('en-IN')}</h2></div>
            </>
          ) : (
            <div className="text-slate-600 dark:text-slate-400">
              <p className="text-sm font-bold mb-2">No data to display</p>
              <p className="text-xs">Add income and expenses to see your budget breakdown</p>
            </div>
          )}
       </div>
    </div>
  );
};
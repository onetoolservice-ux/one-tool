"use client";
import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Plus, Trash2 } from 'lucide-react';

export const BudgetPlanner = () => {
  const [incomes, setIncomes] = useState([{ id: 1, name: "Salary", amount: 85000 }]);
  const [expenses, setExpenses] = useState([{ id: 1, name: "Rent", amount: 22000, type: "Need" }, { id: 2, name: "Groceries", amount: 8000, type: "Need" }]);
  const totalIncome = incomes.reduce((a, c) => a + Number(c.amount), 0);
  const totalExpenses = expenses.reduce((a, c) => a + Number(c.amount), 0);
  const balance = totalIncome - totalExpenses;
  const chartData = [
    { name: 'Needs', value: expenses.filter(e => e.type === 'Need').reduce((a, c) => a + Number(c.amount), 0), color: '#6366f1' },
    { name: 'Wants', value: expenses.filter(e => e.type === 'Want').reduce((a, c) => a + Number(c.amount), 0), color: '#f43f5e' },
    { name: 'Savings', value: expenses.filter(e => e.type === 'Savings').reduce((a, c) => a + Number(c.amount), 0) + balance, color: '#638c80' },
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)] p-4 overflow-hidden">
       <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white dark:bg-slate-950 border border-slate-200 rounded-2xl p-6">
          <h3 className="text-sm font-bold mb-4">Income</h3>
          {incomes.map((i, idx) => <div key={i.id} className="flex gap-2 mb-2"><input value={i.name} onChange={e=>{const n=[...incomes];n[idx].name=e.target.value;setIncomes(n)}} className="border rounded p-2 flex-1"/><input type="number" value={i.amount} onChange={e=>{const n=[...incomes];n[idx].amount=Number(e.target.value);setIncomes(n)}} className="border rounded p-2 w-24"/></div>)}
          <button onClick={()=>setIncomes([...incomes,{id:Date.now(),name:'New',amount:0}])} className="text-xs bg-gray-100 p-2 rounded">+ Add</button>
          <h3 className="text-sm font-bold mt-8 mb-4">Expenses</h3>
          {expenses.map((i, idx) => <div key={i.id} className="flex gap-2 mb-2"><input value={i.name} onChange={e=>{const n=[...expenses];n[idx].name=e.target.value;setExpenses(n)}} className="border rounded p-2 flex-1"/><input type="number" value={i.amount} onChange={e=>{const n=[...expenses];n[idx].amount=Number(e.target.value);setExpenses(n)}} className="border rounded p-2 w-24"/></div>)}
          <button onClick={()=>setExpenses([...expenses,{id:Date.now(),name:'New',amount:0,type:'Need'}])} className="text-xs bg-gray-100 p-2 rounded">+ Add</button>
       </div>
       <div className="w-full lg:w-1/2 h-full bg-slate-50 rounded-2xl p-8"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer><div className="text-center font-bold text-2xl mt-4">₹ {balance}</div></div>
    </div>
  );
};

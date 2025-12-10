"use client";
import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Landmark, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const NetWorthTracker = () => {
  const [assets, setAssets] = useState([
    { id: 1, name: "Home Value", val: 8500000 },
    { id: 2, name: "Investments", val: 1200000 },
    { id: 3, name: "Savings", val: 350000 }
  ]);
  const [liabilities, setLiabilities] = useState([
    { id: 1, name: "Home Loan", val: 4500000 },
    { id: 2, name: "Car Loan", val: 600000 }
  ]);

  const totalA = assets.reduce((a, b) => a + Number(b.val), 0);
  const totalL = liabilities.reduce((a, b) => a + Number(b.val), 0);
  const nw = totalA - totalL;
  const chartData = [{ name: 'Net Worth', value: Math.max(0, nw), color: '#10b981' }, { name: 'Debt', value: totalL, color: '#f43f5e' }];

  const add = (setter, list) => setter([...list, { id: Date.now(), name: "New Item", val: 0 }]);
  const update = (setter, list, id, f, v) => setter(list.map(x => x.id === id ? { ...x, [f]: v } : x));
  const remove = (setter, list, id) => setter(list.filter(x => x.id !== id));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden p-4">
       {/* LEFT: EDITOR */}
       <div className="w-full lg:w-1/2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 overflow-y-auto custom-scrollbar">
          <section className="mb-8">
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-emerald-600 flex items-center gap-2"><TrendingUp size={16}/> Assets</h3><button onClick={()=>add(setAssets, assets)} className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded font-bold">+ Add</button></div>
             {assets.map(item => (
                <div key={item.id} className="flex gap-2 mb-2"><input value={item.name} onChange={e=>update(setAssets, assets, item.id, 'name', e.target.value)} className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 rounded text-sm"/><input type="number" value={item.val} onChange={e=>update(setAssets, assets, item.id, 'val', +e.target.value)} className="w-28 p-2 bg-slate-50 dark:bg-slate-900 rounded text-sm text-right"/><button onClick={()=>remove(setAssets, assets, item.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button></div>
             ))}
          </section>
          <section>
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-rose-600 flex items-center gap-2"><TrendingDown size={16}/> Liabilities</h3><button onClick={()=>add(setLiabilities, liabilities)} className="text-xs bg-rose-50 text-rose-600 px-3 py-1 rounded font-bold">+ Add</button></div>
             {liabilities.map(item => (
                <div key={item.id} className="flex gap-2 mb-2"><input value={item.name} onChange={e=>update(setLiabilities, liabilities, item.id, 'name', e.target.value)} className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 rounded text-sm"/><input type="number" value={item.val} onChange={e=>update(setLiabilities, liabilities, item.id, 'val', +e.target.value)} className="w-28 p-2 bg-slate-50 dark:bg-slate-900 rounded text-sm text-right"/><button onClick={()=>remove(setLiabilities, liabilities, item.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={14}/></button></div>
             ))}
          </section>
       </div>
       {/* RIGHT: DASHBOARD */}
       <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-black/20 rounded-3xl p-8 flex flex-col justify-center text-center border border-slate-200 dark:border-slate-800">
          <div className="mb-8"><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Net Worth</p><h1 className="text-5xl font-black text-slate-900 dark:text-white">₹ {nw.toLocaleString()}</h1></div>
          <div className="h-64"><ResponsiveContainer><PieChart><Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value"><Cell fill="#10b981"/><Cell fill="#f43f5e"/></Pie><Tooltip/><Legend/></PieChart></ResponsiveContainer></div>
       </div>
    </div>
  );
};
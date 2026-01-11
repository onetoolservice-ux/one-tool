"use client";
import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Input, Button } from '@/app/components/shared';
import { formatCurrency } from '@/app/lib/utils/tool-helpers';
import { showToast } from '@/app/shared/Toast';

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
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-slate-900 dark:text-white">
                 <TrendingUp size={16}/> Assets
               </h3>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => add(setAssets, assets)}
                 icon={<Plus size={14} />}
                 className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
               >
                 Add
               </Button>
             </div>
             {assets.map(item => (
                <div key={item.id} className="flex gap-2 mb-2 items-center">
                  <Input
                    value={item.name}
                    onChange={(e) => update(setAssets, assets, item.id, 'name', e.target.value)}
                    className="flex-1 text-sm"
                  />
                  <Input
                    type="number"
                    value={item.val.toString()}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (val < 0) {
                        showToast('Asset value cannot be negative', 'error');
                        return;
                      }
                      if (val > 100000000000) {
                        showToast('Asset value cannot exceed ₹1 lakh crores', 'error');
                        return;
                      }
                      update(setAssets, assets, item.id, 'val', val);
                    }}
                    className="w-28 text-sm text-right"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(setAssets, assets, item.id)}
                    icon={<Trash2 size={14} />}
                    className="text-slate-300 hover:text-rose-500 dark:hover:text-rose-400"
                  />
                </div>
             ))}
          </section>
          <section>
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 text-slate-900 dark:text-white">
                 <TrendingDown size={16}/> Liabilities
               </h3>
               <Button
                 variant="outline"
                 size="sm"
                 onClick={() => add(setLiabilities, liabilities)}
                 icon={<Plus size={14} />}
                 className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
               >
                 Add
               </Button>
             </div>
             {liabilities.map(item => (
                <div key={item.id} className="flex gap-2 mb-2 items-center">
                  <Input
                    value={item.name}
                    onChange={(e) => update(setLiabilities, liabilities, item.id, 'name', e.target.value)}
                    className="flex-1 text-sm"
                  />
                  <Input
                    type="number"
                    value={item.val.toString()}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (val < 0) {
                        showToast('Liability value cannot be negative', 'error');
                        return;
                      }
                      if (val > 100000000000) {
                        showToast('Liability value cannot exceed ₹1 lakh crores', 'error');
                        return;
                      }
                      update(setLiabilities, liabilities, item.id, 'val', val);
                    }}
                    className="w-28 text-sm text-right"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(setLiabilities, liabilities, item.id)}
                    icon={<Trash2 size={14} />}
                    className="text-slate-300 hover:text-rose-500 dark:hover:text-rose-400"
                  />
                </div>
             ))}
          </section>
       </div>
       {/* RIGHT: DASHBOARD */}
       <div className="w-full lg:w-1/2 bg-slate-50 dark:bg-black/20 rounded-3xl p-8 flex flex-col justify-center text-center border border-slate-200 dark:border-slate-800">
          <div className="mb-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Net Worth</p>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white">{formatCurrency(nw)}</h1>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={100} paddingAngle={5} dataKey="value">
                  <Cell fill="#10b981"/>
                  <Cell fill="#f43f5e"/>
                </Pie>
                <Tooltip/>
                <Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};
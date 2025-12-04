"use client";
import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Plus, Trash2, TrendingUp, TrendingDown, 
  Landmark, CreditCard, Wallet, Building2, Coins, IndianRupee
} from 'lucide-react';

export const NetWorthTracker = () => {
  // --- STATE ---
  const [assets, setAssets] = useState([
    { id: 1, name: "Savings Account", value: 150000, type: "Cash" },
    { id: 2, name: "Mutual Funds", value: 500000, type: "Invest" },
    { id: 3, name: "Gold / Jewelry", value: 300000, type: "Gold" },
    { id: 4, name: "PF / PPF", value: 200000, type: "Retire" },
  ]);

  const [liabilities, setLiabilities] = useState([
    { id: 1, name: "Home Loan", value: 2500000, type: "Loan" },
    { id: 2, name: "Car Loan", value: 400000, type: "Loan" },
    { id: 3, name: "Credit Card Due", value: 25000, type: "Credit" },
  ]);

  // --- LOGIC ---
  const totalAssets = assets.reduce((a, c) => a + Number(c.value), 0);
  const totalLiabilities = liabilities.reduce((a, c) => a + Number(c.value), 0);
  const netWorth = totalAssets - totalLiabilities;
  
  const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // Chart Data
  const assetData = [
    { name: 'Cash', value: assets.filter(a => a.type === 'Cash').reduce((a,c)=>a+Number(c.value),0), color: '#638c80' },
    { name: 'Invest', value: assets.filter(a => a.type === 'Invest').reduce((a,c)=>a+Number(c.value),0), color: '#6366f1' },
    { name: 'Property', value: assets.filter(a => a.type === 'Prop').reduce((a,c)=>a+Number(c.value),0), color: '#8b5cf6' },
    { name: 'Gold', value: assets.filter(a => a.type === 'Gold').reduce((a,c)=>a+Number(c.value),0), color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // Actions
  const addAsset = () => setAssets([...assets, { id: Date.now(), name: "New Asset", value: 0, type: "Cash" }]);
  const removeAsset = (id: number) => setAssets(assets.filter(a => a.id !== id));
  const updateAsset = (id: number, field: string, val: any) => setAssets(assets.map(a => a.id === id ? { ...a, [field]: val } : a));

  const addLiability = () => setLiabilities([...liabilities, { id: Date.now(), name: "New Debt", value: 0, type: "Loan" }]);
  const removeLiability = (id: number) => setLiabilities(liabilities.filter(l => l.id !== id));
  const updateLiability = (id: number, field: string, val: any) => setLiabilities(liabilities.map(l => l.id === id ? { ...l, [field]: val } : l));

  const formatINR = (val: number) => val.toLocaleString('en-IN');

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-64px)] animate-in fade-in duration-500 overflow-hidden">
       
       {/* LEFT: EDITOR */}
       <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 space-y-8 custom-scrollbar pb-32">
          
          {/* ASSETS */}
          <section>
             <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-[#4a6b61] uppercase flex items-center gap-2"><TrendingUp size={16}/> Assets</h3>
                <button onClick={addAsset} className="text-xs font-bold text-[#4a6b61] bg-[#638c80]/10 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg hover:bg-[#638c80]/20 flex items-center gap-1"><Plus size={14}/> Add</button>
             </div>
             <div className="space-y-3">
                {assets.map(item => (
                   <div key={item.id} className="flex gap-3 items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 group">
                      <select value={item.type} onChange={e => updateAsset(item.id, 'type', e.target.value)} className="w-12 h-9 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 outline-none cursor-pointer text-xs">
                         <option value="Cash">Cash</option><option value="Invest">Inv</option><option value="Prop">Prop</option><option value="Gold">Gold</option><option value="Retire">Ret</option>
                      </select>
                      <input type="text" value={item.name} onChange={e => updateAsset(item.id, 'name', e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-slate-400 text-slate-700 dark:text-slate-200" />
                      <div className="w-28 relative">
                         <span className="absolute left-2 top-1.5 text-slate-400 text-xs font-bold">₹</span>
                         <input type="number" value={item.value} onChange={e => updateAsset(item.id, 'value', Number(e.target.value))} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-5 pr-2 py-1.5 text-right text-sm font-bold text-[#4a6b61] outline-none focus:ring-1 focus:ring-[#638c80]" />
                      </div>
                      <button onClick={() => removeAsset(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                   </div>
                ))}
             </div>
             <div className="flex justify-end mt-3 text-xs font-bold text-slate-500">
                Total Assets: <span className="text-[#4a6b61] ml-1 text-sm">₹ {formatINR(totalAssets)}</span>
             </div>
          </section>

          {/* LIABILITIES */}
          <section>
             <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-rose-600 uppercase flex items-center gap-2"><TrendingDown size={16}/> Liabilities</h3>
                <button onClick={addLiability} className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg hover:bg-rose-100 flex items-center gap-1"><Plus size={14}/> Add</button>
             </div>
             <div className="space-y-3">
                {liabilities.map(item => (
                   <div key={item.id} className="flex gap-3 items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800 group">
                      <div className="w-8 flex justify-center text-rose-400"><CreditCard size={16}/></div>
                      <input type="text" value={item.name} onChange={e => updateLiability(item.id, 'name', e.target.value)} className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-slate-400 text-slate-700 dark:text-slate-200" />
                      <div className="w-28 relative">
                         <span className="absolute left-2 top-1.5 text-slate-400 text-xs font-bold">₹</span>
                         <input type="number" value={item.value} onChange={e => updateLiability(item.id, 'value', Number(e.target.value))} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg pl-5 pr-2 py-1.5 text-right text-sm font-bold text-rose-600 outline-none focus:ring-1 focus:ring-rose-500" />
                      </div>
                      <button onClick={() => removeLiability(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                   </div>
                ))}
             </div>
             <div className="flex justify-end mt-3 text-xs font-bold text-slate-500">
                Total Debt: <span className="text-rose-600 ml-1 text-sm">₹ {formatINR(totalLiabilities)}</span>
             </div>
          </section>

       </div>

       {/* RIGHT: DASHBOARD */}
       <div className="w-full lg:w-1/2 h-full bg-slate-50 dark:bg-black/20 p-8 overflow-y-auto">
          
          {/* NET WORTH CARD */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center mb-8">
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Net Worth</p>
             <h2 className={`text-5xl font-black ${netWorth >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                ₹ {formatINR(netWorth)}
             </h2>
             <div className="flex justify-center gap-8 mt-6 text-xs font-bold">
                <div className="text-[#4a6b61]">Assets: ₹{formatINR(totalAssets)}</div>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
                <div className="text-rose-600">Liabilities: ₹{formatINR(totalLiabilities)}</div>
             </div>
          </div>

          {/* RATIO CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Debt Ratio</p>
                <div className="relative w-24 h-24 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                      <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * debtRatio) / 100} className={debtRatio > 50 ? 'text-rose-500' : 'text-indigo-500'} />
                   </svg>
                   <span className="absolute text-xl font-black">{debtRatio.toFixed(0)}%</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">{debtRatio > 50 ? 'High Debt' : 'Healthy Level'}</p>
             </div>

             <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">Asset Mix</p>
                <div className="flex-1 w-full min-h-[120px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={assetData} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="value">
                           {assetData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                         </Pie>
                         <Tooltip formatter={(value: number) => `₹ ${formatINR(value)}`} contentStyle={{backgroundColor:'#1e293b', border:'none', borderRadius:'8px', color:'#fff', fontSize:'10px'}} />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
};

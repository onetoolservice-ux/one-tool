"use client";
import React, { useState, useMemo } from "react";
import { Plus, Trash2, Landmark } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

interface Item { id: number; name: string; value: number; }

export default function NetWorth() {
  const [assets, setAssets] = useState<Item[]>([{ id: 1, name: "Savings", value: 15000 }, { id: 2, name: "Investments", value: 45000 }]);
  const [liabilities, setLiabilities] = useState<Item[]>([{ id: 1, name: "Loan", value: 12000 }]);

  const addItem = (t: 'a'|'l') => t==='a' ? setAssets([...assets, {id:Date.now(), name:'', value:0}]) : setLiabilities([...liabilities, {id:Date.now(), name:'', value:0}]);
  const removeItem = (t: 'a'|'l', id: number) => t==='a' ? setAssets(assets.filter(i=>i.id!==id)) : setLiabilities(liabilities.filter(i=>i.id!==id));
  const updateItem = (t: 'a'|'l', id: number, f: keyof Item, v: any) => {
    const up = (l:Item[]) => l.map(i=>i.id===id ? {...i, [f]:v} : i);
    t==='a' ? setAssets(up(assets)) : setLiabilities(up(liabilities));
  };

  const netWorth = useMemo(() => assets.reduce((a,b)=>a+b.value,0) - liabilities.reduce((a,b)=>a+b.value,0), [assets, liabilities]);

  const List = ({ title, items, type, color }: any) => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className={`px-5 py-3 border-b flex justify-between items-center ${color === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
        <h3 className="text-sm font-bold uppercase">{title}</h3>
        <button onClick={()=>addItem(type)} className="text-xs font-bold px-2 py-1 rounded hover:bg-white/50 transition-colors">+ Add</button>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((i:any) => (
          <div key={i.id} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50">
            <input type="text" value={i.name} onChange={e=>updateItem(type,i.id,'name',e.target.value)} className="flex-1 text-sm font-medium bg-transparent outline-none" placeholder="Name"/>
            <input type="number" value={i.value} onChange={e=>updateItem(type,i.id,'value',Number(e.target.value))} className="w-24 text-right text-sm font-mono bg-transparent outline-none"/>
            <button onClick={()=>removeItem(type,i.id)}><Trash2 size={14} className="text-slate-300 hover:text-rose-500"/></button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <ToolHeader title="Net Worth" desc="Assets vs Liabilities" icon={<Landmark size={18}/>} />
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6">
          <List title="Assets" items={assets} type="a" color="emerald" />
          <List title="Liabilities" items={liabilities} type="l" color="rose" />
        </div>
        <div className="w-full lg:w-80 bg-slate-900 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-center items-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Net Worth</div>
          <div className="text-4xl font-bold font-mono">${netWorth.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

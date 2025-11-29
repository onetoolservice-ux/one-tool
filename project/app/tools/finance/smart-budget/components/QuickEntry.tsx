"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";

export function QuickEntry({ onAdd }: { onAdd: (tx: any) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ desc: "", amount: "", category: "General", type: "Expense", date: new Date().toISOString().split('T')[0] });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.desc || !form.amount) return;
    onAdd({
      description: form.desc,
      amount: parseFloat(form.amount),
      category: form.category,
      type: form.type as any,
      date: form.date
    });
    setForm(prev => ({ ...prev, desc: "", amount: "" }));
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
      <Plus size={16} /> New Transaction
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form onSubmit={submit} className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h3 className="font-bold text-lg">Add Transaction</h3>
        
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500">Type</label>
             <select className="w-full border p-2 rounded" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
               <option value="Expense">Expense</option>
               <option value="Income">Income</option>
             </select>
           </div>
           <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500">Date</label>
             <input type="date" className="w-full border p-2 rounded" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
           </div>
        </div>

        <input className="w-full border p-2 rounded" placeholder="Description" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} autoFocus />
        
        <div className="flex gap-2">
          <input className="w-1/2 border p-2 rounded" type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          <input className="w-1/2 border p-2 rounded" placeholder="Category" list="cat-suggestions" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
          <datalist id="cat-suggestions">
            <option value="Food" /><option value="Transport" /><option value="Housing" /><option value="Salary" /><option value="Entertainment" />
          </datalist>
        </div>

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-2 border rounded hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </form>
    </div>
  );
}

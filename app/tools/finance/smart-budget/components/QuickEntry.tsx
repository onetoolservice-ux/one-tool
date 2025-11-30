"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Transaction } from "../types";
import { showToast } from "@/app/shared/Toast";
import Button from "@/app/shared/ui/Button";
import { fireConfetti } from "@/app/utils/confetti";

interface QuickEntryProps {
  onAdd: (t: Omit<Transaction, "id">) => void;
  mode: 'Personal' | 'Enterprise';
}

export function QuickEntry({ onAdd, mode }: QuickEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    desc: "",
    amount: "",
    type: "Expense",
    category: mode === 'Personal' ? "Food" : "Operations"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.desc || !form.amount) {
      showToast("Please fill all fields", "error");
      return;
    }
    
    onAdd({
      date: form.date,
      desc: form.desc,
      amount: Number(form.amount),
      type: form.type as any,
      category: form.category,
      status: "Posted"
    });

    setForm({ ...form, desc: "", amount: "" });
    setIsOpen(false);
    showToast("Transaction Added", "success");
    fireConfetti();
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
        <Plus size={16} /> Add New
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-main dark:text-white">New Entry</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-muted dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Date</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Type</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option>Income</option>
                    <option>Expense</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted uppercase">Description</label>
                <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" placeholder="Details..." value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} autoFocus />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Category</label>
                  <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {mode === 'Personal' ? (
                        <><option>Food</option><option>Transport</option><option>Utilities</option><option>Entertainment</option><option>Health</option><option>Salary</option><option>Investment</option></>
                    ) : (
                        <><option>Operations</option><option>Marketing</option><option>Payroll</option><option>Software</option><option>Office</option><option>Sales</option><option>Revenue</option></>
                    )}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted uppercase">Amount</label>
                  <input type="number" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
              </div>

              <div className="pt-3">
                <Button type="submit" className="w-full py-3 text-sm">Save Transaction</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

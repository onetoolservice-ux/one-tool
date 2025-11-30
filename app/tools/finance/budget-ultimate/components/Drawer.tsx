"use client";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

export interface FormData {
  id?: string;
  name: string;
  amount?: number | string; 
  color?: string;
  type: string;
}

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  defaultData?: FormData | null; 
  onSave: (data: FormData) => void;
}

export default function Drawer({ open, onClose, defaultData, onSave }: DrawerProps) {
  const [form, setForm] = useState<FormData>({ name: "", amount: "", color: "#000000", type: "Expense" });

  useEffect(() => {
    if (defaultData) {
      setForm({
        ...defaultData,
        amount: defaultData.amount ?? "",
        color: defaultData.color ?? "#000000",
        type: defaultData.type || "Expense"
      });
    } else {
      setForm({ name: "", amount: "", color: "#000000", type: "Expense" });
    }
  }, [defaultData, open]);

  const handleSubmit = () => {
    const submissionData = { ...form, amount: form.amount === "" ? 0 : Number(form.amount) };
    onSave(submissionData);
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-surface dark:bg-slate-800 shadow-xl z-50 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{defaultData ? "Edit Item" : "Add Item"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X size={22} /></button>
        </div>
        <div className="space-y-4 flex-1 overflow-y-auto">
          <div><label className="text-sm text-muted">Name</label><input className="w-full mt-1 border px-3 py-2 rounded-lg bg-background" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name..." /></div>
          <div><label className="text-sm text-muted">Type</label><select className="w-full mt-1 border px-3 py-2 rounded-lg bg-background" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="Expense">Expense</option><option value="Income">Income</option></select></div>
          <div><label className="text-sm text-muted">Amount (optional)</label><input type="number" className="w-full mt-1 border px-3 py-2 rounded-lg bg-background" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" /></div>
          <div><label className="text-sm text-muted">Color</label><div className="flex items-center gap-3 mt-1"><input type="color" className="w-16 h-10 border rounded cursor-pointer" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /><span className="text-xs text-muted">{form.color}</span></div></div>
        </div>
        <button onClick={handleSubmit} className="w-full py-3 bg-black dark:bg-slate-100 text-white dark:text-black font-medium rounded-lg mt-4 hover:opacity-90">Save</button>
      </div>
    </>
  );
}

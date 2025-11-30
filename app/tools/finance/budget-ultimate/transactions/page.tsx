"use client";
import { getTransactions, saveTransactions, addTransaction, clearTransactions, getCategories, Txn } from "../utils/sampleData";
import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Drawer from "../components/Drawer";
import { Search, Plus, Download, Upload } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Txn[]>(() => getTransactions());
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { saveTransactions(transactions); }, [transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(t => (t.desc || "").toLowerCase().includes(q) || (t.category || "").toLowerCase().includes(q) || String(t.amount).includes(q));
  }, [transactions, search]);

  const handleAdd = () => {
    const newRow = addTransaction({ date: new Date().toISOString().slice(0,10), type: "Expense", category: getCategories()[0]?.name ?? "Misc", desc: "", amount: 0 });
    setTransactions(prev => [newRow, ...prev]);
    setDrawerOpen(true);
  };

  const handleClear = () => { if (!confirm("Clear all?")) return; clearTransactions(); setTransactions([]); };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Transactions</h1><p className="text-sm text-muted">Showing {filtered.length} items.</p></div>
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative w-full md:w-72"><Search className="absolute left-3 top-2 text-muted/70" size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm" /></div>
          <div className="flex items-center gap-2"><button onClick={handleAdd} className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><Plus size={14}/> Add</button><button onClick={handleClear} className="px-3 py-2 border rounded-lg">Clear</button></div>
        </div>
      </Card>
      <Card><div className="overflow-auto"><table className="min-w-full text-sm"><thead className="bg-background border-b"><tr><th className="p-3">Date</th><th className="p-3">Description</th><th className="p-3">Category</th><th className="p-3">Type</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{filtered.length === 0 ? (<tr><td colSpan={5} className="text-center p-8 text-muted/70">No transactions</td></tr>) : filtered.map(tx => (<tr key={tx.id} className="border-b hover:bg-background"><td className="p-3">{tx.date}</td><td className="p-3">{tx.desc}</td><td className="p-3">{tx.category}</td><td className="p-3">{tx.type}</td><td className={`p-3 text-right font-medium ${tx.type==="Income"?"text-emerald-600":"text-rose-600"}`}>{tx.type==="Expense"?'-':'+'}₹{tx.amount.toLocaleString()}</td></tr>))}</tbody></table></div></Card>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} defaultData={null} onSave={() => setDrawerOpen(false)} />
    </div>
  );
}

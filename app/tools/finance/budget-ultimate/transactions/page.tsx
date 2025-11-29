"use client";
import { getTransactions, saveTransactions, addTransaction, clearTransactions, getCategories, saveCategories, addCategory } from "../utils/sampleData";

import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Drawer from "../components/Drawer";
import { Search, Plus, Download, Upload, Filter } from "lucide-react";

/**
 * Transactions Page - compact, client-only
 * - uses getTransactions / saveTransactions helpers
 */

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Txn[]>(() => getTransactions());
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // whenever local state changes write through helper
    saveTransactions(transactions);
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(t =>
      (t.desc || "").toLowerCase().includes(q) ||
      (t.category || "").toLowerCase().includes(q) ||
      String(t.amount).includes(q)
    );
  }, [transactions, search]);

  const handleAdd = () => {
    const newRow = addTransaction({ date: new Date().toISOString().slice(0,10), type: "Expense", category: getCategories()[0]?.name ?? "Misc", desc: "", amount: 0 });
    setTransactions(prev => [newRow, ...prev]);
    setDrawerOpen(true);
  };

  const handleClear = () => {
    if (!confirm("Clear all transactions? This cannot be undone.")) return;
    clearTransactions();
    setTransactions([]);
  };

  const handleImport = (file?: File) => {
    // keep simple: user can import CSV/XLSX later — placeholder toast
    alert("Import currently only supports simple JSON import in this demo. Paste data or use XLSX upload in full app.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted dark:text-muted dark:text-muted dark:text-muted">View and manage your entries. Showing {filtered.length} items.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2 text-muted/70" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search description, category or amount" className="pl-10 pr-3 py-2 w-full border rounded-lg text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleAdd} className="px-3 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><Plus size={14}/> Add</button>
            <button onClick={handleClear} className="px-3 py-2 border rounded-lg">Clear demo</button>
            <button onClick={() => handleImport()} className="px-3 py-2 border rounded-lg flex items-center gap-2"><Upload size={14}/>Import</button>
            <button onClick={() => { /* export */ const data = transactions; const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="transactions.json"; a.click(); URL.revokeObjectURL(url);} } className="px-3 py-2 border rounded-lg flex items-center gap-2"><Download size={14}/>Export</button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] border-b">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-muted/70">No transactions</td></tr>
              ) : filtered.map(tx => (
                <tr key={tx.id} className="border-b hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
                  <td className="p-3">{tx.date}</td>
                  <td className="p-3">{tx.desc}</td>
                  <td className="p-3">{tx.category}</td>
                  <td className="p-3">{tx.type}</td>
                  <td className={`p-3 text-right font-medium ${tx.type==="Income"?"text-emerald-600 dark:text-emerald-400":"text-rose-600 dark:text-rose-400"}`}>{tx.type==="Expense"?'-':'+'}₹{tx.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] border-t font-semibold">
              <tr>
                <td colSpan={4} className="p-3">Total ({filtered.length} items)</td>
                <td className="p-3 text-right">₹{filtered.reduce((s,t)=> s + (t.type==="Expense"? -t.amount : t.amount), 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} defaultData={null} />
    </div>
  );
}
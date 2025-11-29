"use client";
import { useState } from "react";

export default function FilterBar() {
  const [search, setSearch] = useState("");
  return (
    <div className="bg-surface dark:bg-slate-800 dark:bg-surface border p-4 rounded-lg flex flex-wrap items-center gap-3">
      <input
        className="px-4 py-2 rounded-lg border   bg-surface dark:bg-slate-800 dark:bg-surface focus:ring-2 focus:ring-black/10 border rounded text-sm"
        placeholder="Search categories, description, amount"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select className="px-4 py-2 rounded-lg border   bg-surface dark:bg-slate-800 dark:bg-surface focus:ring-2 focus:ring-black/10 border rounded text-sm">
        <option>All Categories</option>
        <option>Groceries</option>
        <option>Rent</option>
      </select>
      <option>All Types</option>
      <option>Expense</option>
      <option>Income</option>
      <button className="px-4 py-2 rounded-lg border   bg-surface dark:bg-slate-800 dark:bg-surface focus:ring-2 focus:ring-black/10 bg-surface text-white rounded text-sm">
        Apply Filters
      </button>
    </div>
  );
}

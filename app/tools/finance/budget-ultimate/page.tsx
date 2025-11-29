"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AnalyticTile from "./components/AnalyticTile";
import { Search, Filter, BarChart3, LayoutPanelLeft } from "lucide-react";

// ------- Cleaned Utility Import: removed unused persistence functions -------
import {
  getTransactions,
  getCategories,
} from "./utils/sampleData";

export default function OverviewPage() {
  const router = useRouter();

  // ---------- STATE ----------
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  // ---------- LOAD USER DATA ----------
  useEffect(() => {
    setTransactions(getTransactions());
    setCategories(getCategories());
  }, []);

  // ---------- KPI CALCULATIONS ----------
  const income = transactions
    .filter((t) => t.type === "Income")
    .reduce((s, x) => s + x.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "Expense")
    .reduce((s, x) => s + x.amount, 0);

  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  // Filter for search bar
  const filtered = transactions.filter((t) =>
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- NAVIGATION ----------
  const goToKPI = () => router.push("/tools/finance/budget-ultimate/analytics");
  const goToDetailed = () =>
    router.push("/tools/finance/budget-ultimate/analytics?view=detailed");
  const goToGroup = (group) =>
    router.push(`/tools/finance/budget-ultimate/analytics?group=${group}`);

  return (
    <div className="space-y-8">
      {/* -------------------------------------------------------
          KPI DASHBOARD
      -------------------------------------------------------- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

        <AnalyticTile
          title="Income"
          value={`₹${income.toLocaleString()}`}
          colorClass="text-emerald-600 dark:text-emerald-400"
          trendText="+12% vs last month"
          data={[{ amt: 2000 }, { amt: 3500 }, { amt: 5000 }, { amt: 4200 }, { amt: 6000 }]}
          onClick={goToKPI}
        />

        <AnalyticTile
          title="Expense"
          value={`₹${expense.toLocaleString()}`}
          colorClass="text-rose-600 dark:text-rose-400"
          trendText="-5% variance"
          data={[{ amt: 400 }, { amt: 320 }, { amt: 500 }, { amt: 450 }, { amt: 380 }]}
          onClick={goToKPI}
        />

        <AnalyticTile
          title="Balance"
          value={`₹${balance.toLocaleString()}`}
          colorClass="text-blue-600 dark:text-blue-400"
          trendText="Stable"
          data={[{ amt: balance - 2000 }, { amt: balance - 1000 }, { amt: balance }]}
          onClick={goToKPI}
        />

        <AnalyticTile
          title="Categories"
          value={categories?.length || 0}
          colorClass="text-main dark:text-slate-100 dark:text-slate-200"
          trendText="Active"
          data={[{ amt: 3 }, { amt: 4 }, { amt: 5 }, { amt: 3 }, { amt: 4 }]}
          onClick={() => router.push("/tools/finance/budget-ultimate/categories")}
        />

        <AnalyticTile
          title="Savings Rate"
          value={`${savingsRate}%`}
          colorClass="text-indigo-600 dark:text-indigo-400"
          trendText="Income saved"
          data={[{ amt: 5 }, { amt: 8 }, { amt: 10 }, { amt: 7 }, { amt: 11 }]}
          onClick={goToKPI}
        />
      </div>

      {/* -------------------------------------------------------
          TOOLBAR
      -------------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Transactions</h2>

        <div className="flex gap-3 text-sm">
          <button className="px-3 py-2 border rounded-lg flex items-center gap-2" onClick={goToKPI}>
            <BarChart3 size={16} /> KPI Dashboard
          </button>

          <button className="px-3 py-2 border rounded-lg flex items-center gap-2" onClick={goToDetailed}>
            <LayoutPanelLeft size={16} /> Detailed Analytics
          </button>

          <button className="px-3 py-2 border rounded-lg" onClick={() => goToGroup("category")}>
            Group by…
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------
          SEARCH + FILTER BAR
      -------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-muted/70" />
          <input
            className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
            placeholder="Search description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button className="px-3 py-2 rounded-lg bg-blue-600 text-white flex items-center gap-2">
            <Filter size={15} /> Filters
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------
          TRANSACTION TABLE
      -------------------------------------------------------- */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] border-b">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b hover:bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
                <td className="p-3">{t.date}</td>
                <td className="p-3">{t.desc}</td>
                <td className="p-3">{t.category}</td>
                <td className="p-3">{t.type}</td>
                <td className={`p-3 text-right font-medium ${t.type === "Income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {t.type === "Expense" ? "-" : "+"}₹{t.amount}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] border-t font-semibold">
            <tr>
              <td className="p-3" colSpan={4}>
                Total ({filtered.length} items)
              </td>
              <td className="p-3 text-right">
                ₹
                {filtered
                  .reduce((s, x) => s + (x.type === "Expense" ? -x.amount : x.amount), 0)
                  .toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
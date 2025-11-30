"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AnalyticTile from "./components/AnalyticTile";
import { Search, Filter, BarChart3, LayoutPanelLeft } from "lucide-react";
import { getTransactions, getCategories, Txn, Category } from "./utils/sampleData";

export default function OverviewPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Txn[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { setTransactions(getTransactions()); setCategories(getCategories()); }, []);

  const income = transactions.filter((t) => t.type === "Income").reduce((s, x) => s + x.amount, 0);
  const expense = transactions.filter((t) => t.type === "Expense").reduce((s, x) => s + x.amount, 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : "0";
  const filtered = transactions.filter((t) => t.desc.toLowerCase().includes(search.toLowerCase()));

  const goToKPI = () => router.push("/tools/finance/budget-ultimate/analytics");
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <AnalyticTile title="Income" value={`₹${income.toLocaleString()}`} colorClass="text-emerald-600" trendText="+12%" data={[{ amt: 2000 }, { amt: 6000 }]} onClick={goToKPI} />
        <AnalyticTile title="Expense" value={`₹${expense.toLocaleString()}`} colorClass="text-rose-600" trendText="-5%" data={[{ amt: 400 }, { amt: 380 }]} onClick={goToKPI} />
        <AnalyticTile title="Balance" value={`₹${balance.toLocaleString()}`} colorClass="text-blue-600" trendText="Stable" data={[{ amt: balance - 1000 }, { amt: balance }]} onClick={goToKPI} />
        <AnalyticTile title="Categories" value={categories?.length || 0} colorClass="text-main" trendText="Active" data={[{ amt: 3 }, { amt: 4 }]} onClick={() => router.push("/tools/finance/budget-ultimate/categories")} />
        <AnalyticTile title="Savings Rate" value={`${savingsRate}%`} colorClass="text-indigo-600" trendText="Income saved" data={[{ amt: 5 }, { amt: 11 }]} onClick={goToKPI} />
      </div>
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Transactions</h2><div className="flex gap-3 text-sm"><button className="px-3 py-2 border rounded-lg flex items-center gap-2" onClick={goToKPI}><BarChart3 size={16} /> KPI Dashboard</button></div></div>
      <div className="border rounded-lg overflow-hidden"><table className="min-w-full text-sm"><thead className="bg-background border-b"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Description</th><th className="p-3 text-left">Category</th><th className="p-3 text-left">Type</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{filtered.map((t) => (<tr key={t.id} className="border-b hover:bg-background"><td className="p-3">{t.date}</td><td className="p-3">{t.desc}</td><td className="p-3">{t.category}</td><td className="p-3">{t.type}</td><td className={`p-3 text-right font-medium ${t.type === "Income" ? "text-emerald-600" : "text-rose-600"}`}>{t.type === "Expense" ? "-" : "+"}₹{t.amount}</td></tr>))}</tbody></table></div>
    </div>
  );
}

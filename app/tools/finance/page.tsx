import Link from "next/link";
import { CreditCard, Wallet, ArrowRight, Calculator, PieChart, TrendingUp, PiggyBank, Landmark } from "lucide-react";

const TOOLS = [
  {
    name: "Budget Ultimate",
    desc: "Full-featured expense tracker with charts and recurring bills.",
    href: "/tools/finance/budget-tracker",
    icon: <Wallet size={24} />,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    name: "Loan Planner",
    desc: "Calculate EMI, interest, and amortization schedules.",
    href: "/tools/finance/loan-emi",
    icon: <Calculator size={24} />,
    color: "bg-blue-50 text-blue-600"
  },
  {
    name: "Debt Destroyer",
    desc: "Snowball vs Avalanche payoff planner with timeline.",
    href: "/tools/finance/debt-planner",
    icon: <TrendingUp size={24} />,
    color: "bg-rose-50 text-rose-600"
  },
  {
    name: "Savings Goal",
    desc: "Track progress towards big purchases or emergency funds.",
    href: "#",
    icon: <PiggyBank size={24} />,
    color: "bg-amber-50 text-amber-600",
    tag: "Soon"
  },
  {
    name: "Net Worth",
    desc: "Calculate assets vs liabilities over time.",
    href: "#",
    icon: <Landmark size={24} />,
    color: "bg-indigo-50 text-indigo-600",
    tag: "Soon"
  },
  {
    name: "Investment Calc",
    desc: "Compound interest and SIP growth projector.",
    href: "#",
    icon: <PieChart size={24} />,
    color: "bg-violet-50 text-violet-600",
    tag: "Soon"
  }
];

export default function FinanceHub() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-xl text-teal-600"><CreditCard size={28}/></div>
          Finance Tools
        </h1>
        <p className="text-slate-500 mt-2 text-lg max-w-2xl">
          Take control of your money. Privacy-first calculators for every stage of your financial journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((t) => (
          <Link key={t.name} href={t.href} className={`block p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group ${t.tag ? 'opacity-70 pointer-events-none' : 'hover:-translate-y-1'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl ${t.color} flex items-center justify-center`}>
                {t.icon}
              </div>
              {t.tag && <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md">{t.tag}</span>}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{t.name}</h3>
            <p className="text-sm text-slate-500 mt-2 h-10">{t.desc}</p>
            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center text-sm font-semibold text-slate-900">
              {t.tag ? "In Development" : <span className="flex items-center group-hover:gap-2 transition-all text-teal-600">Open Tool <ArrowRight size={16} className="ml-1"/></span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

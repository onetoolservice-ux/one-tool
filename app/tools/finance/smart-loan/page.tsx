import { Metadata } from "next";
import LoanClient from "./LoanClient";
import ToolSchema from "@/app/components/seo/ToolSchema";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Smart Loan Calculator - Amortization & Interest | One Tool",
  description: "Calculate monthly loan payments, total interest, and amortization schedules. Visualize principal vs interest with interactive charts. Free and secure.",
  keywords: ["loan calculator", "amortization schedule", "mortgage calculator", "interest calculator", "loan payoff"],
  alternates: {
    canonical: "https://onetool.co.in/tools/finance/smart-loan",
  }
};

export default function SmartLoanPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 min-h-screen">
      {/* Enterprise SEO: Rich Snippets */}
      <ToolSchema 
        name="Smart Loan Calculator" 
        description="Professional loan amortization and interest calculator with visual breakdowns and CSV export."
        path="/tools/finance/smart-loan"
        category="FinanceApplication"
      />

      {/* SEO Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <span>/</span>
          <Link href="/tools/finance" className="hover:text-blue-600 transition">Finance</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white">Smart Loan</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Smart <span className="text-blue-600">Loan</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
          Visualize your loan payoff journey. See exactly how much goes to principal vs interest and download your full schedule.
        </p>
      </div>

      <LoanClient />
    </div>
  );
}

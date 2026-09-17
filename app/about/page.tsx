import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Upload, ShieldCheck, Wallet, Briefcase, ArrowRight,
  ReceiptText, PiggyBank, TrendingUp, FileText, Users, Boxes,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'One Tool is two connected workspaces — My Finances and My Business — built on one statement import, so you never re-enter the same context twice.',
};

const FINANCE_FEATURES = [
  { icon: ReceiptText, label: 'Transactions, categorised and searchable' },
  { icon: PiggyBank, label: 'Budgets, commitments and recurring payments' },
  { icon: TrendingUp, label: 'Investments and net worth in one place' },
  { icon: FileText, label: 'Tax tools — income tax, GST, advance tax' },
];

const BUSINESS_FEATURES = [
  { icon: FileText, label: 'Invoices, quotations and purchases' },
  { icon: Users, label: 'Parties, outstanding and staff' },
  { icon: Boxes, label: 'Inventory, stock and products' },
  { icon: TrendingUp, label: 'Cash flow, GST and reconciliation' },
];

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="border-b border-slate-200 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ot-fin-accent)]">About One Tool</span>
          <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Two workspaces. One financial picture.
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-gray-400 leading-relaxed max-w-2xl">
            Your bank statement is one continuous dataset, not twenty separate apps. Import it once
            and it becomes your transactions, your budget, your investments and your tax filing — all
            the same numbers, viewed differently. Run your business the same way, right alongside it.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="w-9 h-9 rounded-lg bg-[var(--ot-fin-accent)]/10 flex items-center justify-center mb-3">
              <Upload size={16} className="text-[var(--ot-fin-accent)]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">1. Import once</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Bring in your bank statements. No manual entry, no re-typing every month.</p>
          </div>
          <div>
            <div className="w-9 h-9 rounded-lg bg-[var(--ot-fin-accent)]/10 flex items-center justify-center mb-3">
              <Wallet size={16} className="text-[var(--ot-fin-accent)]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">2. See every view</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Spending, budgets, investments and tax all read from the same data — nothing to reconcile by hand.</p>
          </div>
          <div>
            <div className="w-9 h-9 rounded-lg bg-[var(--ot-fin-accent)]/10 flex items-center justify-center mb-3">
              <ShieldCheck size={16} className="text-[var(--ot-fin-accent)]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">3. Stays on your device</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Statements are processed in your browser. Read our <Link href="/privacy" className="underline hover:text-[var(--ot-fin-accent)]">privacy policy</Link> for the details.</p>
          </div>
        </div>
      </section>

      {/* Workspaces */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Wallet className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">My Finances</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">For managing your own money — one workspace instead of a dozen separate calculators.</p>
            <ul className="space-y-2.5 mb-6 flex-1">
              {FINANCE_FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-gray-300">
                  <Icon size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
            <Link
              href="/my-finance"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:gap-2.5 transition-all"
            >
              Open My Finances <ArrowRight size={15} />
            </Link>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Briefcase className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">My Business</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">For running a small business — invoicing, parties and stock in one connected place.</p>
            <ul className="space-y-2.5 mb-6 flex-1">
              {BUSINESS_FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-gray-300">
                  <Icon size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  {label}
                </li>
              ))}
            </ul>
            <Link
              href="/my-business"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:gap-2.5 transition-all"
            >
              Open My Business <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t border-slate-200 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Questions, or something not working right?</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400">Use the Feedback link in the header — it goes straight to us, with the page you were on attached.</p>
          </div>
          <Link
            href="/privacy"
            className="text-sm font-semibold text-slate-600 dark:text-gray-300 hover:text-[var(--ot-fin-accent)] whitespace-nowrap"
          >
            Read our privacy policy →
          </Link>
        </div>
      </section>
    </div>
  );
}

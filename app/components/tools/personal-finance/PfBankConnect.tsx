'use client';

import { useState, useEffect } from 'react';
import {
  Lock, Link2, MessageSquare, PenLine, FileSpreadsheet,
  ArrowRight, Trash2, AlertCircle, CheckCircle2,
  Smartphone, ChevronRight, Plus, X, TrendingUp, TrendingDown,
} from 'lucide-react';
import Link from 'next/link';

// ── Types & Data helpers ───────────────────────────────────────────────────────

interface Tx { date: string; amount: number; type: 'credit' | 'debit'; description?: string; }
interface DataStatus {
  count: number;
  credits: number;
  debits: number;
  from: string;
  to: string;
}

function getDataStatus(): DataStatus | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('otsd-pf-store');
    if (!raw) return null;
    const store = JSON.parse(raw) as { transactions?: Tx[] };
    const txs = (store.transactions ?? []).filter(t => t.date);
    if (txs.length === 0) return null;
    const dates = txs.map(t => t.date).sort();
    const credits = txs.filter(t => t.type === 'credit').reduce((s, t) => s + (t.amount || 0), 0);
    const debits  = txs.filter(t => t.type === 'debit').reduce((s, t) => s + (t.amount || 0), 0);
    return { count: txs.length, credits, debits, from: dates[0], to: dates[dates.length - 1] };
  } catch { return null; }
}

function clearData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('otsd-pf-store');
  window.dispatchEvent(new Event('onetool-pf-updated'));
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }); }
  catch { return iso; }
}

function fmtCrore(n: number) {
  const a = Math.abs(n);
  if (a >= 1_00_00_000) return `₹${(a / 1_00_00_000).toFixed(1)}Cr`;
  if (a >= 1_00_000)    return `₹${(a / 1_00_000).toFixed(1)}L`;
  if (a >= 1_000)       return `₹${(a / 1_000).toFixed(1)}K`;
  return `₹${Math.round(a)}`;
}

// ── Manual entry form ─────────────────────────────────────────────────────────

interface ManualTx { date: string; description: string; amount: string; type: 'credit' | 'debit'; }

function ManualEntryForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState<ManualTx>({
    date: new Date().toISOString().split('T')[0],
    description: '', amount: '', type: 'debit',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!form.description.trim() || !form.amount || !form.date) return;
    try {
      const raw = localStorage.getItem('otsd-pf-store');
      const store = raw ? JSON.parse(raw) : { transactions: [] };
      if (!Array.isArray(store.transactions)) store.transactions = [];
      store.transactions.push({
        date: form.date,
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        type: form.type,
      });
      localStorage.setItem('otsd-pf-store', JSON.stringify(store));
      window.dispatchEvent(new Event('onetool-pf-updated'));
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setForm({ date: new Date().toISOString().split('T')[0], description: '', amount: '', type: 'debit' });
      }, 1000);
    } catch { /* ignore */ }
  };

  return (
    <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">Add a transaction</p>
        <button onClick={onDone} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><X size={13} /></button>
      </div>

      {/* Type */}
      <div className="grid grid-cols-2 gap-1.5 text-[12px] font-semibold">
        {(['debit', 'credit'] as const).map(t => (
          <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
            className={`py-2 rounded-xl transition-all ${form.type === t
              ? t === 'debit' ? 'bg-rose-500 text-white shadow-sm' : 'bg-emerald-500 text-white shadow-sm'
              : 'bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400'}`}>
            {t === 'debit' ? '↑ Expense' : '↓ Income'}
          </button>
        ))}
      </div>

      {/* Fields */}
      {[
        { label: 'Date', key: 'date', type: 'date', placeholder: '' },
        { label: 'Description', key: 'description', type: 'text', placeholder: 'e.g. Swiggy, Salary, Amazon' },
        { label: 'Amount (₹)', key: 'amount', type: 'number', placeholder: '0' },
      ].map(f => (
        <div key={f.key}>
          <label className="block text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-wide">{f.label}</label>
          <input type={f.type} placeholder={f.placeholder}
            value={(form as any)[f.key]}
            onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
            className="w-full h-9 px-3 text-[13px] rounded-xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.06] focus:outline-none focus:border-[var(--ot-accent,#6366f1)]/60 text-slate-800 dark:text-white placeholder:text-slate-400 transition-colors"
          />
        </div>
      ))}

      <button onClick={handleSave}
        disabled={!form.description.trim() || !form.amount}
        className={`w-full h-10 rounded-xl text-[13px] font-bold transition-all ${saved
          ? 'bg-emerald-500 text-white'
          : 'bg-[var(--ot-accent,#6366f1)] hover:opacity-90 disabled:opacity-40 text-white shadow-sm'}`}>
        {saved ? '✓ Saved' : 'Save Transaction'}
      </button>
    </div>
  );
}

// ── Quick tool links (shown after data loaded) ────────────────────────────────

const QUICK_TOOLS = [
  { label: 'Income',        href: '/tools/personal-finance/pf-cash-flow',         emoji: '💰' },
  { label: 'Expenses',      href: '/tools/personal-finance/pf-expenses',           emoji: '📊' },
  { label: 'Behavior',      href: '/tools/personal-finance/pf-behavior',           emoji: '🧠' },
  { label: 'Health Score',  href: '/tools/personal-finance/pf-health-score',       emoji: '❤️' },
  { label: 'Heatmap',       href: '/tools/personal-finance/pf-heatmap',            emoji: '🗓️' },
  { label: 'Top Merchants', href: '/tools/personal-finance/pf-top-merchants',      emoji: '🏪' },
  { label: 'Savings Trend', href: '/tools/personal-finance/pf-savings-trend',      emoji: '📈' },
  { label: 'Spending DNA',  href: '/tools/personal-finance/pf-spending-dna',       emoji: '🧬' },
];

// ── Main ──────────────────────────────────────────────────────────────────────

export function PfBankConnect() {
  const [status, setStatus] = useState<DataStatus | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const refresh = () => setStatus(getDataStatus());

  useEffect(() => {
    refresh();
    window.addEventListener('onetool-pf-updated', refresh);
    return () => window.removeEventListener('onetool-pf-updated', refresh);
  }, []);

  const handleClear = () => { clearData(); setConfirmClear(false); };

  const total = (status?.credits ?? 0) + (status?.debits ?? 0);
  const creditPct = total > 0 ? Math.round(((status?.credits ?? 0) / total) * 100) : 50;

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0F111A]">
      <div className="max-w-xl mx-auto px-4 pt-10 pb-20">

        {/* ── Trust bar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
          {[
            { icon: <Lock size={10} />, label: '100% Private' },
            { icon: <span className="text-[10px]">🇮🇳</span>, label: 'All Indian Banks' },
            { icon: <CheckCircle2 size={10} />, label: 'No Signup' },
            { icon: <span className="text-[10px]">⚡</span>, label: '27 Tools Unlock' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <span className="text-slate-400 dark:text-slate-500">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>

        {/* ── Hero ───────────────────────────────────────────────────────────── */}
        {!status && (
          <div className="text-center mb-10">
            <h1 className="text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              See exactly where<br />your money goes.
            </h1>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed max-w-sm mx-auto">
              Import your bank statement once. Every transaction, every pattern — analysed instantly on your device.
            </p>
          </div>
        )}

        {/* ── Loaded: Data summary ────────────────────────────────────────────── */}
        {status && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.06] shadow-sm">
            {/* Top: stats */}
            <div className="bg-[#1e1b4b] dark:bg-[#13102e] px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-indigo-300/70 uppercase tracking-widest mb-1">Transactions loaded</p>
                  <p className="text-[36px] font-black text-white tabular-nums leading-none">
                    {status.count.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[12px] text-indigo-200/60 mt-1.5">
                    {fmtDate(status.from)} — {fmtDate(status.to)}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Link
                    href="/tools/personal-finance/pf-statement-manager"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[12px] font-semibold transition-colors border border-white/10"
                  >
                    Analyze <ArrowRight size={13} />
                  </Link>
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-300 border border-white/10 transition-colors"
                    title="Clear data"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Credit / Debit split bar */}
              <div className="mt-5">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="flex items-center gap-1 text-emerald-300/80 font-medium">
                    <TrendingUp size={10} /> Income {fmtCrore(status.credits)}
                  </span>
                  <span className="flex items-center gap-1 text-rose-300/80 font-medium">
                    Expense {fmtCrore(status.debits)} <TrendingDown size={10} />
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${creditPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom: quick tool links */}
            <div className="bg-white dark:bg-[#151827] px-4 py-4">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Jump to</p>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_TOOLS.map(t => (
                  <Link key={t.href} href={t.href}
                    className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl bg-slate-50 dark:bg-white/[0.04] hover:bg-[var(--ot-accent,#6366f1)]/5 dark:hover:bg-[var(--ot-accent,#6366f1)]/10 border border-slate-200 dark:border-white/[0.06] hover:border-[var(--ot-accent,#6366f1)]/30 transition-all group"
                  >
                    <span className="text-[16px] leading-none">{t.emoji}</span>
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-[var(--ot-accent,#6366f1)] text-center leading-tight">{t.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Clear confirm ───────────────────────────────────────────────────── */}
        {confirmClear && (
          <div className="mb-4 p-4 rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/[0.05] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
              <p className="text-[12px] text-rose-700 dark:text-rose-300 font-medium">Delete all transactions? Cannot be undone.</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => setConfirmClear(false)} className="px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleClear} className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        )}

        {/* ── PRIMARY: CSV Upload ──────────────────────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[var(--ot-accent,#6366f1)] bg-white dark:bg-[#151827] shadow-lg shadow-[var(--ot-accent,#6366f1)]/10 mb-3">
          {/* Recommended pill */}
          <div className="absolute top-4 right-4">
            <span className="px-2 py-0.5 rounded-full bg-[var(--ot-accent,#6366f1)] text-white text-[10px] font-bold tracking-wide">
              RECOMMENDED
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-[var(--ot-accent,#6366f1)]/10 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet size={20} className="text-[var(--ot-accent,#6366f1)]" />
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Upload Bank Statement</h2>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">CSV or Excel · Auto-detects format</p>
              </div>
            </div>

            {/* Bank chips */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {['HDFC', 'SBI', 'ICICI', 'Axis', 'Kotak', 'Yes Bank', 'IndusInd', 'IDFC'].map(b => (
                <span key={b} className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  {b}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                + more
              </span>
            </div>

            <Link
              href="/tools/personal-finance/pf-statement-manager"
              className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[var(--ot-accent,#6366f1)] hover:opacity-90 text-white text-[14px] font-bold transition-opacity shadow-sm"
            >
              {status ? 'Import More' : 'Upload Statement'} <ArrowRight size={15} />
            </Link>

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3">
              Columns mapped automatically · Duplicates detected · 100% local
            </p>
          </div>
        </div>

        {/* ── SECONDARY: Coming soon row ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-3">

          {/* Account Aggregator */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#151827] p-4 opacity-70">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Link2 size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
                SOON
              </span>
            </div>
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 mb-1">Account Aggregator</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              RBI-regulated · Zero CSV · Auto-sync via Setu / Finvu
            </p>
          </div>

          {/* SMS Sync */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#151827] p-4 opacity-70">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                <MessageSquare size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-1">
                <Smartphone size={9} className="text-slate-400" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  SOON
                </span>
              </div>
            </div>
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 mb-1">SMS Sync</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Auto-parse bank SMS alerts · Android · Fully offline
            </p>
          </div>
        </div>

        {/* ── Manual entry ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#151827]">
          <button
            onClick={() => setShowManual(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center">
                <PenLine size={14} className="text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Manual Entry</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Add transactions one by one</p>
              </div>
            </div>
            <Plus size={14} className={`text-slate-400 transition-transform duration-200 ${showManual ? 'rotate-45' : ''}`} />
          </button>

          {showManual && (
            <div className="px-4 pb-4">
              <ManualEntryForm onDone={() => { setShowManual(false); refresh(); }} />
            </div>
          )}
        </div>

        {/* ── Privacy note ────────────────────────────────────────────────────── */}
        <div className="mt-6 flex items-start gap-2.5 px-2">
          <Lock size={12} className="text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Your financial data is processed entirely in your browser and stored in localStorage. Nothing is sent to any server. No account required.
          </p>
        </div>

      </div>
    </div>
  );
}

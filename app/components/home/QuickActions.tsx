'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText, Calculator, Layers, QrCode, Braces, TrendingDown,
  ArrowRightLeft, Lock, Upload, Pipette
} from 'lucide-react';

const ACTIONS = [
  { label: 'Merge PDFs',       href: '/tools/documents/smart-pdf-merge',   icon: Layers,        bg: 'from-red-600 to-rose-500' },
  { label: 'Create Invoice',   href: '/tools/business/invoice-generator',  icon: FileText,      bg: 'from-blue-600 to-blue-800' },
  { label: 'Track Expenses',   href: '/tools/analytics/expenses',          icon: TrendingDown,  bg: 'from-rose-500 to-red-600' },
  { label: 'Generate QR',      href: '/tools/productivity/qr-code',        icon: QrCode,        bg: 'from-slate-700 to-slate-900' },
  { label: 'Format JSON',      href: '/tools/developer/smart-json',        icon: Braces,        bg: 'from-orange-500 to-amber-500' },
  { label: 'Loan Calculator',  href: '/tools/finance/smart-loan',          icon: Calculator,    bg: 'from-green-600 to-emerald-500' },
  { label: 'Convert Units',    href: '/tools/converters/unit-convert',     icon: ArrowRightLeft, bg: 'from-cyan-500 to-sky-600' },
  { label: 'Upload Statement', href: '/tools/analytics/managetransaction', icon: Upload,        bg: 'from-indigo-600 to-blue-500' },
  { label: 'Pick Colors',      href: '/tools/design/color-picker',         icon: Pipette,       bg: 'from-pink-500 to-rose-600' },
  { label: 'Password Gen',     href: '/tools/productivity/smart-pass',     icon: Lock,          bg: 'from-emerald-500 to-green-600' },
];

export function QuickActions() {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quick Actions</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ACTIONS.map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all whitespace-nowrap group hover:shadow-md flex-shrink-0"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${a.bg}`}>
              <a.icon size={14} />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              {a.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

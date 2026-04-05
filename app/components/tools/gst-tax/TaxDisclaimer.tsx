"use client";
import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const TaxDisclaimer = () => (
  <div className="mx-4 mt-3 mb-1 flex items-start gap-2.5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
    <ShieldAlert size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
    <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
      <span className="font-semibold">Not professional tax advice.</span> Calculations are based on publicly available tax rules for informational purposes only.
      Tax laws change frequently — consult a qualified CA or tax professional before making financial decisions.
    </p>
  </div>
);

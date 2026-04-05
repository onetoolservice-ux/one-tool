'use client';

/**
 * DemoJourneyBanner
 * Appears after "Load Demo Data" is clicked in Statement Manager.
 * Shows a sticky 5-step guided demo path for the Personal Finance suite.
 * Tracks current step by pathname.
 */

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { X, ChevronRight, CheckCircle2, PlayCircle } from 'lucide-react';

const DEMO_ACTIVE_KEY = 'ot-demo-journey-active';

const JOURNEY_STEPS = [
  {
    label: 'Statement Manager',
    href: '/tools/personal-finance/pf-statement-manager',
    hint: 'Click "✨ Load Demo Data" to start',
  },
  {
    label: 'Financial Snapshot',
    href: '/tools/personal-finance/pf-financial-snapshot',
    hint: '3-month money picture at a glance',
  },
  {
    label: 'Spending Heatmap',
    href: '/tools/personal-finance/pf-heatmap',
    hint: 'See your yearly spend pattern',
  },
  {
    label: 'Health Score',
    href: '/tools/personal-finance/pf-health-score',
    hint: 'Get your financial fitness score',
  },
  {
    label: 'Budget vs Actual',
    href: '/tools/personal-finance/pf-budget-vs-actual',
    hint: 'See how you tracked against budget',
  },
];

export function DemoJourneyBanner() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Activate when statement manager signals demo data was loaded
  useEffect(() => {
    const check = () => {
      setActive(sessionStorage.getItem(DEMO_ACTIVE_KEY) === '1');
    };
    check();
    window.addEventListener('ot-demo-loaded', check);
    return () => window.removeEventListener('ot-demo-loaded', check);
  }, []);

  const currentStepIdx = JOURNEY_STEPS.findIndex(s => pathname?.includes(s.href.split('/').pop()!));
  const nextStep = JOURNEY_STEPS.find((s, i) => i > currentStepIdx) ?? null;

  if (!active || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 animate-in slide-in-from-right-4 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl shadow-2xl shadow-indigo-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-indigo-600">
          <div className="flex items-center gap-2">
            <PlayCircle size={15} className="text-white" />
            <span className="text-xs font-bold text-white">Demo Journey</span>
          </div>
          <button
            onClick={() => { setDismissed(true); sessionStorage.removeItem(DEMO_ACTIVE_KEY); }}
            className="p-0.5 rounded text-indigo-200 hover:text-white transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Steps */}
        <div className="p-3 space-y-1">
          {JOURNEY_STEPS.map((step, i) => {
            const done = currentStepIdx > i;
            const current = currentStepIdx === i;
            return (
              <Link
                key={step.href}
                href={step.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors text-left w-full ${
                  current
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                  done ? 'bg-emerald-500 text-white' : current ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {done ? <CheckCircle2 size={12} /> : i + 1}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${current ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {step.label}
                  </p>
                  {current && (
                    <p className="text-[10px] text-slate-400 truncate">{step.hint}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Next CTA */}
        {nextStep && currentStepIdx >= 0 && (
          <div className="px-3 pb-3">
            <Link
              href={nextStep.href}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              Next: {nextStep.label} <ChevronRight size={12} />
            </Link>
          </div>
        )}
        {currentStepIdx === JOURNEY_STEPS.length - 1 && (
          <div className="px-3 pb-3">
            <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 font-semibold py-2">
              🎉 Tour complete! Explore all 27 tools.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Call this after loading demo data to activate the journey banner */
export function activateDemoJourney() {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(DEMO_ACTIVE_KEY, '1');
  window.dispatchEvent(new Event('ot-demo-loaded'));
}

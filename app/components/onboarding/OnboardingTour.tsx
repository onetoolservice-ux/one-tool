'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

const TOUR_KEY = 'otsd-tour-v1-done';

export interface TourStep {
  title: string;
  description: string;
  detail?: string[]; // bullet points for extra depth
  emoji: string;
  tag?: string;
  cta?: { label: string; href: string };
}

const TOUR_STEPS: TourStep[] = [
  {
    emoji: '👋',
    tag: 'Welcome',
    title: 'Everything you need, in one place.',
    description:
      'OneTool is a free, all-in-one toolkit with 154+ utilities across finance, business, developer tools, writing, health, and more — all running entirely in your browser.',
    detail: [
      'No account or signup required',
      'Your data never leaves your device',
      'Works offline after the first load',
    ],
  },
  {
    emoji: '🔍',
    tag: 'Search',
    title: 'Find any tool in under 2 seconds.',
    description:
      'Use the search bar at the top to instantly find any tool by name or keyword. Try typing "invoice", "loan", "PDF", or "password" — results appear as you type.',
    detail: [
      'Press Ctrl + K (or ⌘K on Mac) from anywhere to open search instantly',
      'Searches across tool names, categories, and descriptions',
      'Pin your most-used tools to your personal Home for one-click access',
    ],
  },
  {
    emoji: '💰',
    tag: 'Personal Finance — 27 tools',
    title: 'Your complete personal finance system.',
    description:
      'Upload your bank or credit card CSV statement once and unlock a full suite of 27 interconnected finance tools — all pre-populated with your real data automatically. Or try it instantly with demo data.',
    detail: [
      'Supports HDFC, SBI, ICICI, Axis, Kotak, and most banks worldwide',
      'Auto-categorizes transactions: Food, Travel, Shopping, EMIs, and more',
      'View cash flow trends, budget vs actual spend, savings rate, and investment tracking',
      'Get a Financial Health Score (0–100) with personalized improvement tips',
      'Detect hidden subscriptions, identify top merchants, analyze spending DNA',
    ],
    cta: { label: 'Go to Statement Manager (try demo data)', href: '/tools/personal-finance/pf-statement-manager' },
  },
  {
    emoji: '🏪',
    tag: 'Business OS — 16 tools',
    title: 'Run your small business from one dashboard.',
    description:
      'Business OS is a complete operating system for small businesses — from recording daily transactions to generating GST-compliant invoices, managing your Khata, and viewing live P&L reports.',
    detail: [
      'Party Register: maintain a digital Khata for every customer and vendor',
      'GST Invoices: auto-calculate CGST/SGST/IGST with HSN codes, download PDF',
      'Inventory: track product stock levels, get low-stock alerts',
      'Daybook: record every income and expense entry in seconds',
      'Dashboard: real-time CEO view — today\'s sales, profit, outstanding dues, alerts',
      'Reports: full Profit & Loss statement for any date range',
    ],
    cta: { label: 'Open Business Dashboard', href: '/tools/business-os/biz-dashboard' },
  },
  {
    emoji: '✍️',
    tag: "Writer's OS — 6 tools",
    title: 'A connected workspace built for writers.',
    description:
      "Writer's OS is not just a text editor — it's a complete writing workflow. Every tool is connected through a shared document, so your work flows seamlessly from idea to publication.",
    detail: [
      'Idea Board: capture story ideas instantly, tag them, develop any idea into a full document',
      'Content Planner: build blog outlines from templates (How-To, Listicle, Case Study) or map story structure with 3-Act / Hero\'s Journey frameworks',
      'Writing Studio: distraction-free editor with auto-save, live word count, reading time, and goal progress',
      'Writing Analyzer: Flesch-Kincaid readability score, passive voice detection, filler word checker — see highlighted issues in your text',
      'Headline Lab: score your title on power words, length, clarity, and sentiment — get 5 alternative headline suggestions',
      'Export: download as Markdown, HTML, or Plain Text — or format for LinkedIn post / Twitter thread in one click',
    ],
    cta: { label: 'Open Writing Studio', href: '/tools/writer/writer-studio' },
  },
  {
    emoji: '⌨️',
    tag: 'Developer Tools — 15+ tools',
    title: 'Every dev utility you reach for, in the browser.',
    description:
      'A comprehensive set of developer utilities that require zero installation — format JSON, debug JWTs, test regex, generate hashes, play with APIs, and more, all without leaving the browser.',
    detail: [
      'Dev Station: JSON formatter/validator, Base64, URL encoder, hash generator — all in one tabbed interface',
      'JWT Debugger: paste any token to decode the header, payload, and check expiry',
      'Regex Tester: live highlighted matches, named groups, and flag support',
      'API Playground: send GET/POST/PUT/DELETE requests with custom headers and body',
      'Diff Studio: compare two code snippets or files line-by-line',
      'Also includes: Cron builder, Git cheatsheet, number converter, timestamp tool',
    ],
    cta: { label: 'Open Dev Station', href: '/tools/developer/dev-station' },
  },
  {
    emoji: '🎓',
    tag: 'Learning Center',
    title: 'Step-by-step guides for every workflow.',
    description:
      'The Learning Center has structured learning paths for every major category — with guided steps, progress tracking, video tutorials, and a full FAQ. Start from zero and become a power user.',
    detail: [
      '5 learning paths: Personal Finance, Business OS, Writer\'s OS, Developer, GST & Tax',
      'Check off each step as you complete it — progress is saved automatically',
      'Video tutorials embedded directly in each path (more being added)',
      'Pro tips, keyboard shortcuts, and common workflow explanations',
    ],
    cta: { label: 'Go to Learning Center', href: '/learn' },
  },
];

export function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && !localStorage.getItem(TOUR_KEY)) {
        setVisible(true);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(TOUR_KEY, '1');
    setVisible(false);
  }, []);

  const goNext = () => {
    if (step >= TOUR_STEPS.length - 1) { dismiss(); return; }
    setAnimating(true);
    setTimeout(() => { setStep((s) => s + 1); setAnimating(false); }, 150);
  };

  const goPrev = () => {
    if (step === 0) return;
    setAnimating(true);
    setTimeout(() => { setStep((s) => s - 1); setAnimating(false); }, 150);
  };

  const goToStep = (i: number) => {
    setAnimating(true);
    setTimeout(() => { setStep(i); setAnimating(false); }, 150);
  };

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Tour card */}
      <div className="fixed z-[9999] inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-150 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
        >
          {/* Progress bar */}
          <div className="h-1 bg-gray-100 dark:bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles size={12} />
                Quick Tour
              </div>
              <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{step + 1} / {TOUR_STEPS.length}</span>
            </div>
            <button
              onClick={dismiss}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 pb-3 pt-1">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl shrink-0">{current.emoji}</span>
              <div>
                {current.tag && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1">
                    {current.tag}
                  </span>
                )}
                <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-snug">
                  {current.title}
                </h2>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              {current.description}
            </p>

            {current.detail && current.detail.length > 0 && (
              <ul className="space-y-1.5 mb-3">
                {current.detail.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-indigo-400 dark:text-indigo-500 mt-0.5 shrink-0">›</span>
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {current.cta && (
              <a
                href={current.cta.href}
                onClick={dismiss}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {current.cta.label} <ArrowRight size={12} />
              </a>
            )}
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 py-2">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`rounded-full transition-all duration-200 ${
                  i === step
                    ? 'w-5 h-2 bg-indigo-500'
                    : i < step
                    ? 'w-2 h-2 bg-indigo-300 dark:bg-indigo-700'
                    : 'w-2 h-2 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={goPrev}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <button
              onClick={dismiss}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Skip tour
            </button>

            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-500/30"
            >
              {isLast ? (
                <><CheckCircle2 size={14} /> Get started!</>
              ) : (
                <>Next <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to manually re-trigger the tour (e.g., from a "Restart Tour" button)
export function useRestartTour() {
  return () => {
    localStorage.removeItem(TOUR_KEY);
    window.location.reload();
  };
}

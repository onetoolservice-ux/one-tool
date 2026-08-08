'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, Zap, Lock, LayoutGrid, Palette, Check, Pin, LayoutDashboard, GraduationCap, TrendingUp, Flame, ChevronRight, PlayCircle } from 'lucide-react';
import { activateDemoJourney } from '@/app/components/ui/DemoJourneyBanner';
import { ALL_TOOLS, CATEGORY_ORDER } from '@/app/lib/tools-data';
import { getIconComponent, type IconName } from '@/app/lib/utils/IconMapper';
import { categoryToSpaceHref } from '@/app/lib/space-config';
import { getCategoryEmoji } from '@/app/lib/category-config';
import { TOOL_ICON_BG } from '@/app/lib/tool-icon-bg';

// Analytics-driven order: top tools by actual views (GA data)
const FEATURED_IDS = [
  'pf-bank-connect',        // #1 entry point — import statements
  'pf-budget-vs-actual',    // #2 most viewed
  'pf-financial-snapshot',  // #3 most viewed
  'gst-calculator',         // India essential
  'dev-station',            // Developer
  'smart-pdf-merge',        // Documents
];

// Tools confirmed popular by analytics — show trending badge
const TRENDING_IDS = new Set(['pf-bank-connect', 'pf-budget-vs-actual', 'pf-financial-snapshot']);

// Short hook descriptions for trending quick-access cards
const TRENDING_DESC: Record<string, string> = {
  'pf-bank-connect':       'Import your bank statement in 3 steps — unlocks 27 Personal Finance tools instantly',
  'pf-budget-vs-actual':   'Set monthly budgets, track actual spend, spot where you overshoot',
  'pf-financial-snapshot': 'All your assets, liabilities & net worth in one clean view',
};


// Emoji per category is now sourced from category-config via getCategoryEmoji()

// Tool icon backgrounds are now imported from tool-icon-bg.ts (single source of truth)

interface Props {
  searchIntent?: string | null;
}

const DEMO_STEPS = [
  { num: '1', label: 'Import Statements', hint: 'Load sample bank data', href: '/tools/personal-finance/pf-bank-connect' },
  { num: '2', label: 'Financial Snapshot', hint: 'See your money picture',  href: '/tools/personal-finance/pf-financial-snapshot' },
  { num: '3', label: 'Spending Heatmap',   hint: 'Spot yearly patterns',    href: '/tools/personal-finance/pf-heatmap' },
  { num: '4', label: 'Health Score',        hint: 'Get a fitness score',     href: '/tools/personal-finance/pf-health-score' },
  { num: '5', label: 'Budget vs Actual',    hint: 'Track your targets',      href: '/tools/personal-finance/pf-budget-vs-actual' },
];

export function LandingPage({ searchIntent }: Props) {
  const TOOL_COUNT = ALL_TOOLS.length;
  const CAT_COUNT = CATEGORY_ORDER.length;
  const router = useRouter();

  const featuredTools = FEATURED_IDS
    .map(id => ALL_TOOLS.find(t => t.id === id))
    .filter(Boolean) as typeof ALL_TOOLS;

  const trendingTools = FEATURED_IDS
    .filter(id => TRENDING_IDS.has(id))
    .map(id => ALL_TOOLS.find(t => t.id === id))
    .filter(Boolean) as typeof ALL_TOOLS;

  const categoryCounts = CATEGORY_ORDER.map(cat => ({
    name: cat,
    count: ALL_TOOLS.filter(t => t.category === cat).length,
    emoji: getCategoryEmoji(cat),
  }));

  // ── Returning-user compact mode ───────────────────────────────────────────
  const [mounted, setMounted] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const returning = localStorage.getItem('otsd-returning') === '1';
      const showFull  = sessionStorage.getItem('otsd-show-full') === '1';
      if (returning && !showFull) setIsCompact(true);
    } catch { /* ignore — incognito / storage blocked */ }
  }, []);

  const showFullIntro = () => {
    try { sessionStorage.setItem('otsd-show-full', '1'); } catch { /* ignore */ }
    setIsCompact(false);
  };

  const handleStartDemo = () => {
    activateDemoJourney();
    router.push('/tools/personal-finance/pf-statement-manager');
  };

  // ── Compact view — returning user (only after mount to avoid blank SSR) ──
  if (mounted && isCompact) return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F111A]">

      {/* SEO block — always present, hidden from UI */}
      <div className="sr-only">
        <h1>OneTool — {TOOL_COUNT}+ Free Online Tools for Finance, Business, Developer, Health &amp; More</h1>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pt-5 pb-10">

        {/* Row: label + show-full link — same visual weight, same line */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {TOOL_COUNT} tools · {CAT_COUNT} categories · free
          </p>
          <button
            onClick={showFullIntro}
            className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Show full intro →
          </button>
        </div>

        {/* Demo Journey CTA */}
        <button
          onClick={handleStartDemo}
          className="w-full mb-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <PlayCircle size={16} className="text-indigo-500 shrink-0" />
            <div className="text-left">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Try Live Demo</span>
              <span className="text-[11px] text-indigo-400 dark:text-indigo-500 ml-2">Personal Finance · 5-step guided tour · sample data pre-loaded</span>
            </div>
          </div>
          <ArrowRight size={14} className="text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* Category grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
          {categoryCounts.map(cat => (
            <Link
              key={cat.name}
              href={categoryToSpaceHref(cat.name)}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-center group"
            >
              <span className="text-2xl leading-none mb-0.5">{cat.emoji}</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                {cat.count} tools
              </span>
            </Link>
          ))}
        </div>

        {/* Catalog fallback */}
        <p className="text-center mt-6">
          <Link
            href="/home"
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Browse all {TOOL_COUNT} tools in catalog →
          </Link>
        </p>

      </div>
    </div>
  );

  // ── Full view — first-time user (existing page below) ─────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F111A]">

      {/* ── SEO content block — hidden from UI, read by Google ───────────── */}
      <div className="sr-only">
        <h1>OneTool — {TOOL_COUNT}+ Free Online Tools for Finance, Business, Developer, Health &amp; More</h1>
        <p>
          OneTool is India&apos;s free all-in-one tool suite with {TOOL_COUNT}+ utilities across {CAT_COUNT} categories.
          No signup. No account. No installation. Everything runs in your browser and your data stays on your device.
        </p>

        <section>
          <h2>Free Personal Finance Tools India</h2>
          <p>
            Upload bank statements, track expenses, analyze spending patterns, view income vs outflow,
            find top merchants, track subscriptions, monitor investments, check financial health score,
            compare month-on-month spending — all free personal finance tools for Indians.
          </p>
        </section>

        <section>
          <h2>Free Finance Calculators India</h2>
          <p>
            EMI calculator, SIP calculator, GST calculator India, retirement planner, net worth calculator,
            budget planner, FIRE calculator, debt planner, FD calculator, NPS calculator, PPF calculator,
            HRA calculator, CTC calculator, gratuity calculator, capital gains calculator, tax saving comparison.
          </p>
        </section>

        <section>
          <h2>Free GST &amp; Tax Tools India</h2>
          <p>
            GST calculator with CGST SGST IGST, reverse GST calculator, income tax calculator India,
            TDS rate finder, deduction tracker 80C 80D, advance tax calculator, ITR checklist,
            tax calendar — free GST and income tax tools for India.
          </p>
        </section>

        <section>
          <h2>Free Business OS — Small Business Management Tools India</h2>
          <p>
            GST invoice generator, party ledger khata, inventory management, daybook income expense entry,
            purchase management, staff payroll, business dashboard, P&amp;L report, outstanding payments,
            quotation maker, business cash flow — free business management tools for small businesses in India.
          </p>
        </section>

        <section>
          <h2>Free Business Document Tools India</h2>
          <p>
            GST invoice maker, salary slip generator, rent receipt for HRA, employee ID card generator,
            legal agreement template, NDA generator, service agreement creator — free business documents India.
          </p>
        </section>

        <section>
          <h2>Free Real Estate Tools India</h2>
          <p>
            Home loan EMI calculator, rent vs buy calculator, rental yield calculator,
            stamp duty calculator India, property budget planner — free real estate calculators.
          </p>
        </section>

        <section>
          <h2>Free Career Tools India</h2>
          <p>
            Job offer comparison tool, freelance rate calculator, full and final settlement calculator,
            work from home savings calculator, salary history tracker, ESOP value calculator,
            career ROI calculator — free career planning tools.
          </p>
        </section>

        <section>
          <h2>Free Startup Tools for Founders</h2>
          <p>
            Burn rate calculator, equity dilution calculator, SaaS metrics dashboard,
            project pricing tool — free startup financial tools for founders and entrepreneurs.
          </p>
        </section>

        <section>
          <h2>Free Travel Planning Tools</h2>
          <p>
            Trip budget planner, road trip cost calculator, forex currency calculator,
            EV vs petrol cost comparison — free travel planning and budgeting tools.
          </p>
        </section>

        <section>
          <h2>Free CRM Tools — Personal &amp; Business</h2>
          <p>
            Personal CRM to manage relationships and contacts, business CRM with sales pipeline tracker,
            lead management — free CRM tools no signup required.
          </p>
        </section>

        <section>
          <h2>Free PDF &amp; Document Tools</h2>
          <p>
            Merge PDF online free, split PDF, compress image, convert image format PNG JPG WebP AVIF,
            OCR image to text, document scanner to PDF, markdown editor, CSV editor online,
            JSON to CSV converter, universal file format converter — free document tools in browser.
          </p>
        </section>

        <section>
          <h2>Free Developer Tools Online</h2>
          <p>
            JSON formatter and validator, JWT decoder, regex tester online, SQL formatter,
            cron expression generator, API playground REST tester, hash generator MD5 SHA256 SHA512,
            text diff checker, number base converter binary hex decimal, Unix timestamp converter,
            git commands cheat sheet — free online developer utilities no signup.
          </p>
        </section>

        <section>
          <h2>Free Productivity Tools Online</h2>
          <p>
            QR code generator free, strong password generator, Pomodoro timer online,
            habit tracker, life OS planner — free productivity tools for daily use.
          </p>
        </section>

        <section>
          <h2>Free Unit Converters Online</h2>
          <p>
            Unit converter for length weight temperature volume speed area,
            text case converter uppercase lowercase camelCase snake_case kebab-case,
            metric to imperial converter — free online converters no signup.
          </p>
        </section>

        <section>
          <h2>Free Design Tools Online</h2>
          <p>
            Color picker HEX RGB HSL, CSS gradient generator linear radial conic,
            color palette maker, contrast ratio checker — free web design tools.
          </p>
        </section>

        <section>
          <h2>Free Health &amp; Fitness Tools</h2>
          <p>
            BMI calculator India, HIIT interval workout timer, box breathing exercise tool,
            calorie calculator, water intake tracker — free health and fitness tools online.
          </p>
        </section>

        <section>
          <h2>Free AI Tools Online</h2>
          <p>
            AI prompt generator for ChatGPT and Claude, AI chat assistant free,
            sentiment analyzer, text emotion detector — free AI tools no signup required.
          </p>
        </section>

        <section>
          <h2>Free Creator &amp; Transcription Tools</h2>
          <p>
            Audio to text transcription free, speech to text browser, live transcription online,
            Hindi multilingual voice transcription — free content creator tools.
          </p>
        </section>

        <p>
          OneTool has {TOOL_COUNT}+ free tools across Personal Finance, Finance, GST &amp; Tax, Business OS,
          Business, Real Estate, Career, Startup, Travel, Personal CRM, Business CRM, Documents,
          Developer, Productivity, Converters, Design, Health, AI, and Creator categories.
          All tools are free, work in your browser, and require no signup. India-focused. Local-first.
        </p>
      </div>

      {/* ── Search intent banner ─────────────────────────────────────────── */}
      {searchIntent && (
        <div className="bg-indigo-600 text-white px-4 py-2.5 text-center text-sm">
          You searched for &ldquo;<strong>{searchIntent}</strong>&rdquo; —
          <Link href={`/home?search=${encodeURIComponent(searchIntent)}`} className="underline ml-1 font-semibold">
            See matching tools →
          </Link>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="px-4 pt-10 pb-8 md:pt-14 md:pb-10 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.07] border border-slate-200 dark:border-white/[0.1] text-slate-600 dark:text-slate-300 text-xs font-semibold mb-4">
          <Zap size={11} className="text-[var(--ot-accent,#6366f1)]" />
          {TOOL_COUNT} tools · {CAT_COUNT} categories · 100% free
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Everything you need,{' '}
          <span className="text-[var(--ot-accent,#6366f1)]">one place.</span>
        </h1>

        <p className="mt-3 text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Finance, business, developer tools, documents, health — all free.
          No login. No cloud. Your data never leaves your device.
        </p>

        {/* Trust pills */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: Lock,        label: 'Data stays on your device' },
            { icon: Shield,      label: 'No account needed' },
            { icon: Zap,         label: 'Instant — no loading' },
            { icon: LayoutGrid,  label: 'Works in any browser' },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400"
            >
              <Icon size={11} className="text-slate-400 dark:text-slate-500 flex-shrink-0" />
              {label}
            </span>
          ))}
        </div>

        {/* India nudge */}
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          GST, INR &amp; tax tools built for India &middot; all other tools work globally
        </p>

        {/* CTAs */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/home"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--ot-accent,#6366f1)] hover:opacity-90 text-white font-semibold text-sm transition-opacity shadow-sm"
          >
            <LayoutGrid size={15} />
            Browse All {TOOL_COUNT} Tools
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/learn"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:border-slate-300 dark:hover:border-white/20 transition-colors"
          >
            <GraduationCap size={14} />
            Learning Center
          </Link>
        </div>

        {/* Skip link */}
        <a
          href="#categories"
          className="mt-4 inline-block text-xs text-slate-400 dark:text-slate-500 hover:text-[var(--ot-accent,#6366f1)] transition-colors"
        >
          Skip to categories ↓
        </a>
      </section>

      {/* ── Personas (HIDDEN — re-enable when needed) ───────────────────
      <section className="px-4 pb-12 max-w-4xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
          Built for
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PERSONAS.map(p => (
            <Link
              key={p.title}
              href={p.href}
              className={`group p-5 rounded-2xl border ${p.bg} ${p.border} hover:shadow-lg transition-all duration-200`}
            >
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h3 className={`font-bold text-sm ${p.text} mb-1`}>{p.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {p.categories.map(c => (
                  <span key={c} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.bg} ${p.text} border ${p.border}`}>
                    {c}
                  </span>
                ))}
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold ${p.text}`}>
                Explore tools <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      ── end Personas ── */}

      {/* ── Trending in India ───────────────────────────────────────────── */}
      <section className="px-4 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={13} className="text-orange-500" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Most popular right now
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {trendingTools.map(tool => {
            const IconComponent = typeof tool.icon === 'string'
              ? getIconComponent(tool.icon as IconName)
              : null;
            const href = tool.href || `/tools/${tool.category.toLowerCase().replace(/ /g, '-')}/${tool.id}`;
            return (
              <Link
                key={tool.id}
                href={href}
                className="group flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-sm transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm ${TOOL_ICON_BG[tool.id] || 'bg-gradient-to-br from-indigo-500 to-blue-600'}`}>
                  {IconComponent ? <IconComponent size={18} /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{tool.name}</span>
                    <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400">Hot</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                    {TRENDING_DESC[tool.id]}
                  </p>
                </div>
                <ChevronRight size={14} className="flex-shrink-0 mt-1 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Demo Journey ───────────────────────────────────────────────── */}
      <section className="px-4 pb-8">
        <div className="rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-500/10 dark:via-[#0F111A] dark:to-blue-500/5">
          <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <PlayCircle size={15} className="text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Live Demo</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                See Personal Finance in 5 minutes
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Sample bank data pre-loaded. No upload needed.
              </p>
            </div>
            <button
              onClick={handleStartDemo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap self-start sm:self-center"
            >
              <PlayCircle size={15} />
              Start Demo
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Steps */}
          <div className="px-6 pb-6 pt-4 grid grid-cols-1 sm:grid-cols-5 gap-2">
            {DEMO_STEPS.map((step, i) => (
              <div key={step.href} className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
                {/* connector line on desktop */}
                <div className="flex items-center gap-2 sm:flex-row w-full">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {step.num}
                  </div>
                  {i < DEMO_STEPS.length - 1 && (
                    <div className="hidden sm:block flex-1 h-px bg-indigo-200 dark:bg-indigo-500/30" />
                  )}
                </div>
                <div className="sm:mt-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{step.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{step.hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="px-4 pb-12 max-w-3xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
          How it works
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { step: '1', title: 'Pick a tool', desc: `Browse ${TOOL_COUNT} tools across ${CAT_COUNT} categories` },
            { step: '2', title: 'Enter your data', desc: 'Everything stays in your browser — private by default' },
            { step: '3', title: 'Get results', desc: 'Instant calculations, charts and insights — no signup ever' },
          ].map(s => (
            <div key={s.step} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">{s.step}</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">{s.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured tools ─────────────────────────────────────────────── */}
      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-indigo-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Most opened
            </p>
          </div>
          <Link href="/home" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            See all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {featuredTools.map(tool => {
            const IconComponent = typeof tool.icon === 'string'
              ? getIconComponent(tool.icon as IconName)
              : null;
            const isTrending = TRENDING_IDS.has(tool.id);
            return (
              <Link
                key={tool.id}
                href={tool.href || `/tools/${tool.category.toLowerCase().replace(/ /g, '-')}/${tool.id}`}
                className="group relative flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all"
              >
                {isTrending && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-orange-400" />
                )}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-110 transition-transform ${TOOL_ICON_BG[tool.id] || 'bg-gradient-to-br from-indigo-500 to-blue-600'}`}>
                  {IconComponent ? <IconComponent size={20} /> : null}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{tool.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Category overview ──────────────────────────────────────────── */}
      <section id="categories" className="px-4 pb-12 max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
          {CAT_COUNT} categories, one place
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {categoryCounts.map(cat => (
            <Link
              key={cat.name}
              href={categoryToSpaceHref(cat.name)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-center group"
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">{cat.name}</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{cat.count} tools</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Make it yours ──────────────────────────────────────────────── */}
      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-500/10 dark:via-[#0F111A] dark:to-blue-500/10">
          <div className="flex flex-col md:flex-row">

            {/* Left: Text */}
            <div className="flex-1 p-6 md:p-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
                <Palette size={11} />
                Fully personalizable
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                Make it yours.
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                This isn&apos;t just a static app. Change the navbar color, pick an accent, switch fonts, pin your tools into custom Spaces — it remembers everything, no account needed.
              </p>

              <ul className="space-y-2.5 mb-6">
                {[
                  { icon: Palette, label: 'Navbar color', desc: '10 presets + any custom hex' },
                  { icon: Check,   label: 'Accent color', desc: 'Buttons, links, active states' },
                  { icon: Check,   label: 'Font style',   desc: 'Sans · Serif · Mono · Rounded' },
                  { icon: Pin,     label: 'Pin tools',    desc: 'Your own Spaces & quick-launch tiles' },
                ].map(item => (
                  <li key={item.label} className="flex items-center gap-2.5 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                      <item.icon size={10} strokeWidth={3} />
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{item.label}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs">— {item.desc}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
              >
                <LayoutDashboard size={14} />
                Open Theme Studio
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Right: Visual preview */}
            <div className="w-full md:w-64 p-6 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-indigo-200 dark:border-indigo-500/20 bg-white/50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Navbar presets</p>
              {[
                { bg: '#096464', text: '#f8fafc', label: 'Teal' },
                { bg: '#6366f1', text: '#f8fafc', label: 'Indigo' },
                { bg: '#0f172a', text: '#f8fafc', label: 'Dark' },
                { bg: '#ffffff', text: '#1e293b', label: 'White' },
                { bg: '#f0f4ff', text: '#1e293b', label: 'Lavender' },
              ].map(p => (
                <div
                  key={p.bg}
                  className="h-8 rounded-lg flex items-center px-3 gap-2 shadow-sm border border-black/5"
                  style={{ backgroundColor: p.bg }}
                >
                  <div className="w-4 h-4 rounded-md flex-shrink-0 font-black text-[8px] flex items-center justify-center" style={{ backgroundColor: p.text + '33', color: p.text }}>O</div>
                  <div className="flex-1 h-1.5 rounded-full opacity-25" style={{ backgroundColor: p.text }} />
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full opacity-40" style={{ backgroundColor: p.text }} />
                    <div className="w-3 h-3 rounded-full opacity-40" style={{ backgroundColor: p.text }} />
                  </div>
                  <span className="text-[9px] font-semibold opacity-50" style={{ color: p.text }}>{p.label}</span>
                </div>
              ))}

              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 mb-1">Accent colors</p>
              <div className="flex flex-wrap gap-1.5">
                {['#6366f1','#3b82f6','#06b6d4','#10b981','#f43f5e','#f97316','#f59e0b','#14b8a6','#64748b','#0ea5e9'].map(c => (
                  <div key={c} className="w-6 h-6 rounded-lg border-2 border-white dark:border-slate-800 shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: String(TOOL_COUNT), label: 'Free tools' },
            { value: String(CAT_COUNT),  label: 'Categories' },
            { value: '0',                label: 'Accounts needed' },
            { value: '100%',             label: 'Client-side & private' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{s.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="px-4 pb-20 text-center">
        <div className="max-w-lg mx-auto p-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-700 shadow-xl shadow-indigo-500/20">
          <h2 className="text-2xl font-black text-white mb-2">Ready to start?</h2>
          <p className="text-indigo-100 text-sm mb-6">No signup. No download. Just open a tool and go.</p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
          >
            <LayoutGrid size={16} />
            Open All Tools
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Play, ArrowRight, CheckCircle2, Circle, BookOpen,
  Lightbulb, ChevronDown, ChevronUp, ExternalLink,
  Sparkles, GraduationCap, Zap, Target, Clock
} from 'lucide-react';
import { useRestartTour } from '@/app/components/onboarding/OnboardingTour';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkflowStep {
  title: string;
  desc: string;
  href: string;
  tool: string;
}

interface LearningPath {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  border: string;
  textColor: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: WorkflowStep[];
  videoId?: string; // YouTube video ID
}

interface FAQ {
  q: string;
  a: string;
}

// ─── Content ──────────────────────────────────────────────────────────────────

const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'personal-finance',
    emoji: '💰',
    title: 'Personal Finance Mastery',
    subtitle: 'From bank statement upload to investment tracking — your complete financial life in one place.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    duration: '10 min setup',
    difficulty: 'Beginner',
    videoId: '',
    steps: [
      {
        title: 'Upload your bank statement',
        desc: 'Export a CSV from your bank\'s net banking portal and upload it in Statement Manager. Transactions are auto-parsed and categorized — this single step unlocks all 19 finance tools.',
        href: '/my-finance/pf-statement-manager',
        tool: 'Statement Manager',
      },
      {
        title: 'Understand where your money goes',
        desc: 'Open Expenditure Distribution to see a live pie chart of your spending — automatically split into categories like Food, Travel, Shopping, Subscriptions, and EMIs.',
        href: '/my-finance/pf-expenditure',
        tool: 'Expenditure Distribution',
      },
      {
        title: 'Track income vs expenses over time',
        desc: 'The Cash Flow tool shows month-by-month income and expense trends with your savings rate calculated automatically. Spot months where spending spiked.',
        href: '/my-finance/pf-cash-flow',
        tool: 'Cash Flow',
      },
      {
        title: 'Compare your budget against reality',
        desc: 'Set a monthly budget for each category, then see exactly how much you overspent or saved versus your plan — with a category-wise breakdown chart.',
        href: '/my-finance/pf-budget-vs-actual',
        tool: 'Budget vs Actual',
      },
      {
        title: 'Check your Financial Health Score',
        desc: 'Get a score from 0–100 based on your savings rate, emergency fund coverage, debt-to-income ratio, and investment consistency — with actionable improvement tips.',
        href: '/my-finance/pf-health-score',
        tool: 'Health Score',
      },
    ],
  },
  {
    id: 'business-os',
    emoji: '🏪',
    title: 'Business OS — Small Business Setup',
    subtitle: 'From your digital Khata to GST invoices, inventory, and P&L — manage everything from one place.',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    textColor: 'text-purple-600 dark:text-purple-400',
    duration: '15 min setup',
    difficulty: 'Beginner',
    videoId: '',
    steps: [
      {
        title: 'Add your customers and vendors',
        desc: 'In the Party Register, add each customer and vendor with their name, phone number, and GSTIN. This becomes your digital ledger — every invoice and transaction is linked to a party automatically.',
        href: '/my-business/biz-parties',
        tool: 'Party Register',
      },
      {
        title: 'Set up your product catalog',
        desc: 'Add products or services in Inventory with HSN/SAC code, unit price, and opening stock. These items appear automatically when you create invoices, saving you time on every bill.',
        href: '/my-business/biz-inventory',
        tool: 'Inventory',
      },
      {
        title: 'Create your first GST invoice',
        desc: 'Select a party, pick your products, enter quantities — CGST, SGST, and IGST are calculated automatically based on the tax rate. Download as a print-ready PDF instantly.',
        href: '/my-business/biz-invoices',
        tool: 'GST Invoices',
      },
      {
        title: 'Record daily income and expenses',
        desc: 'Use the Daybook to log every transaction — cash sales, bank transfers, UPI payments, and expenses. Each entry updates your running balance and feeds into the P&L report.',
        href: '/my-business/biz-daybook',
        tool: 'Daybook',
      },
      {
        title: 'Monitor business health on the Dashboard',
        desc: 'The Dashboard gives you a real-time CEO view — today\'s sales, total expenses, gross profit, outstanding receivables from parties, and low stock alerts. Everything at a glance.',
        href: '/my-business/biz-dashboard',
        tool: 'Dashboard',
      },
    ],
  },
  {
    id: 'writers-os',
    emoji: '✍️',
    title: "Writer's OS — A System for Writers",
    subtitle: 'From idea capture to publishing — a connected workflow for bloggers and content creators.',
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    textColor: 'text-amber-600 dark:text-amber-400',
    duration: '5 min to start',
    difficulty: 'Beginner',
    videoId: '',
    steps: [
      {
        title: 'Capture ideas before they disappear',
        desc: 'The Idea Board is a quick-capture space for story and topic ideas. Add tags, filter by topic, and hit "Develop" on any idea to instantly open it as a new document in the Writing Studio.',
        href: '/tools/writer/writer-ideas',
        tool: 'Idea Board',
      },
      {
        title: 'Build your outline before writing',
        desc: 'Use the Content Planner to structure your article. Choose from 5 templates (How-To, Listicle, Opinion, Case Study, Comparison), set word targets per section, and drag to reorder. Alternatively, map your story with 3-Act or Hero\'s Journey frameworks.',
        href: '/tools/writer/writer-planner',
        tool: 'Content Planner',
      },
      {
        title: 'Write in the distraction-free Studio',
        desc: 'The Writing Studio is a clean, focused editor. It auto-saves every second, tracks your word count, characters, and reading time live, and shows a progress bar toward your word goal. Manage multiple documents from the sidebar.',
        href: '/tools/writer/writer-studio',
        tool: 'Writing Studio',
      },
      {
        title: 'Analyze and improve your writing quality',
        desc: 'The Writing Analyzer scores your content on readability (Flesch-Kincaid), passive voice usage, filler words (like "very", "basically"), and overly long sentences. Switch the highlight mode to visually see exactly which sentences need fixing.',
        href: '/tools/writer/writer-analyzer',
        tool: 'Writing Analyzer',
      },
      {
        title: 'Score your headline and export',
        desc: 'Headline Lab scores your title out of 100 based on power words, length, number usage, clarity, and sentiment — and suggests 5 alternative headlines. Then use Export to download as Markdown/HTML, or format your post for LinkedIn or split it into a Twitter/X thread.',
        href: '/tools/writer/writer-headline',
        tool: 'Headline Lab',
      },
    ],
  },
  {
    id: 'developer',
    emoji: '⌨️',
    title: 'Developer Toolkit',
    subtitle: 'From JSON formatting to JWT debugging, regex testing to API calls — zero installation, all in the browser.',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    duration: '2 min per tool',
    difficulty: 'Intermediate',
    videoId: '',
    steps: [
      {
        title: 'Dev Station — your all-in-one utility hub',
        desc: 'A tabbed interface combining the most-used developer tools: JSON formatter and validator, Base64 encoder/decoder, URL encoder, hash generator (MD5/SHA), and more. Bookmark it — you\'ll reach for it daily.',
        href: '/tools/developer/dev-station',
        tool: 'Dev Station',
      },
      {
        title: 'Debug JWT tokens instantly',
        desc: 'Paste any JWT token to decode the header, payload, and signature in a human-readable format. See the expiry time, check for issues, and verify the algorithm — no external service needed.',
        href: '/tools/developer/smart-jwt',
        tool: 'JWT Debugger',
      },
      {
        title: 'Test and build regex patterns',
        desc: 'Write a regex pattern, paste your test string, and see live highlighted matches as you type. Supports all standard flags (i, g, m), named capture groups, and multiline mode.',
        href: '/tools/developer/regex-tester',
        tool: 'Regex Tester',
      },
      {
        title: 'Make API requests from the browser',
        desc: 'Send GET, POST, PUT, and DELETE requests directly without installing any client. Set custom headers, request body, and authentication — responses are displayed in a formatted, collapsible tree.',
        href: '/tools/developer/api-playground',
        tool: 'API Playground',
      },
      {
        title: 'Compare code or text side-by-side',
        desc: 'Paste two blocks of code or text into Diff Studio to get a clear line-by-line comparison. Added lines are highlighted green, removed lines red — ideal for reviewing changes before committing.',
        href: '/tools/developer/smart-diff',
        tool: 'Diff Studio',
      },
    ],
  },
  {
    id: 'gst-tax',
    emoji: '🧾',
    title: 'GST & Tax — Get ITR Ready',
    subtitle: 'Whether you\'re salaried or running a business — everything you need to stay tax-compliant and stress-free.',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-gray-200 dark:border-gray-800',
    textColor: 'text-orange-600 dark:text-orange-400',
    duration: '20 min to file-ready',
    difficulty: 'Intermediate',
    videoId: '',
    steps: [
      {
        title: 'Calculate your exact tax liability',
        desc: 'Enter your salary, other income sources, and eligible deductions — the Income Tax Calculator shows your tax payable under both the Old and New regimes side-by-side, so you can pick the one that saves you more.',
        href: '/my-finance/income-tax-calc',
        tool: 'Income Tax Calculator',
      },
      {
        title: 'Track every deduction through the year',
        desc: 'The Deduction Tracker helps you log 80C investments (LIC, PPF, ELSS), 80D health insurance premiums, home loan interest, and other eligible deductions — so nothing gets missed at filing time.',
        href: '/my-finance/deduction-tracker',
        tool: 'Deduction Tracker',
      },
      {
        title: 'Calculate advance tax installments',
        desc: 'Freelancers and business owners are required to pay advance tax quarterly. Use the Advance Tax Calculator to figure out how much to pay by each deadline — avoiding the 1% monthly interest penalty.',
        href: '/my-finance/advance-tax-calc',
        tool: 'Advance Tax Calculator',
      },
      {
        title: 'Never miss a tax deadline',
        desc: 'The Tax Calendar shows all critical dates in one view — advance tax quarters, TDS return due dates, GST filing deadlines, and ITR filing cutoffs. Missing these can result in significant penalties.',
        href: '/my-finance/tax-calendar',
        tool: 'Tax Calendar',
      },
      {
        title: 'Run through the ITR filing checklist',
        desc: 'Before you file, go through this checklist to make sure you have everything — Form 16, AIS/26AS, bank statements, investment proofs, and capital gains statements. Check off each item as you gather it.',
        href: '/my-finance/itr-checklist',
        tool: 'ITR Checklist',
      },
    ],
  },
];

const FAQS: FAQ[] = [
  {
    q: 'Is my data safe? Does it get sent to any server?',
    a: 'Completely safe. One Tool is 100% local-first — all your data is stored only in your browser\'s localStorage. There is no server, no database, no cloud sync, and no account required. Close the tab and your data is still there when you come back.',
  },
  {
    q: 'How do the Personal Finance tools work?',
    a: 'Start by uploading your bank statement CSV in the Statement Manager (download it from your bank\'s net banking portal). Once imported, all 19 Personal Finance tools are automatically populated with your real transaction data — no need to enter anything manually again.',
  },
  {
    q: 'What happens if I clear my browser data?',
    a: 'Clearing browser storage (localStorage) will erase your One Tool data. We recommend periodically exporting reports from Business OS (biz-reports) or downloading your data as a backup. Persistent cloud sync is on the roadmap.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes, all tools are mobile-responsive. A few complex tools (Developer utilities, Analytics) are more comfortable on desktop due to screen real estate, but most tools — GST calculator, loan calculator, Writer\'s OS, and all finance calculators — work perfectly on mobile.',
  },
  {
    q: 'How do I suggest a new tool?',
    a: 'Use the feedback link in the footer or visit our GitHub Issues page. We actively review community suggestions and add tools based on real user needs — many existing tools were built from user requests.',
  },
  {
    q: 'Does it work offline?',
    a: 'Most tools work offline once the page has loaded, since all computation happens in the browser. AI-powered tools (like the Chat and Sentiment Analyzer) require an internet connection as they call external APIs.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. One Tool requires zero accounts, zero signups, and zero email addresses. Your preferences, pinned tools, and all data are saved locally in your browser. This is by design — your data is yours.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: LearningPath['difficulty'] }) {
  const map = {
    Beginner: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    Intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    Advanced: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${map[level]}`}>
      {level}
    </span>
  );
}

function VideoPlaceholder({ videoId, title }: { videoId?: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (!videoId) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 py-6 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <Play size={16} className="text-gray-400 ml-0.5" />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Video tutorial coming soon</p>
      </div>
    );
  }

  if (playing) {
    return (
      <div className="rounded-xl overflow-hidden aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="w-full rounded-xl overflow-hidden aspect-video relative group cursor-pointer"
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
        <div className="w-14 h-14 rounded-full bg-red-600 group-hover:bg-red-500 transition-colors flex items-center justify-center shadow-xl">
          <Play size={22} className="text-white ml-1" />
        </div>
      </div>
    </button>
  );
}

function PathCard({ path }: { path: LearningPath }) {
  const [open, setOpen] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem(`otsd-learn-${path.id}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });

  const toggleStep = (i: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      localStorage.setItem(`otsd-learn-${path.id}`, JSON.stringify([...next]));
      return next;
    });
  };

  const progress = Math.round((completedSteps.size / path.steps.length) * 100);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Card header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl shrink-0">{path.emoji}</span>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{path.title}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <DifficultyBadge level={path.difficulty} />
                <span className="text-xs text-gray-400 dark:text-gray-500">{path.duration}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500">{path.steps.length} steps</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Progress */}
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{progress}%</span>
            {/* Expand button */}
            <div className={`flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${
              open
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
            }`}>
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {completedSteps.size > 0 && (
          <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          {/* Subtitle */}
          <p className="px-4 pt-3 pb-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{path.subtitle}</p>

          {/* Video (if available) */}
          {path.videoId !== undefined && (
            <div className="px-4 pb-3">
              <VideoPlaceholder videoId={path.videoId} title={path.title} />
            </div>
          )}

          {/* Steps */}
          <div className="px-4 pb-4 space-y-2">
            {path.steps.map((step, i) => {
              const done = completedSteps.has(i);
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    done
                      ? 'bg-gray-50 dark:bg-gray-800/40 opacity-60'
                      : 'bg-gray-50 dark:bg-gray-800/40'
                  }`}
                >
                  {/* Step number + checkbox */}
                  <button
                    onClick={() => toggleStep(i)}
                    className="shrink-0 mt-0.5 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors"
                    style={{}}
                  >
                    {done
                      ? <CheckCircle2 size={20} className="text-blue-600 dark:text-blue-400 -m-0.5" />
                      : <span className="text-[10px] font-bold text-gray-400">{i + 1}</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className={`text-sm font-semibold text-gray-800 dark:text-gray-100 ${done ? 'line-through' : ''}`}>
                        {step.title}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                        {step.tool}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  <Link
                    href={step.href}
                    className="shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Open <ArrowRight size={11} />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Completion message */}
          {completedSteps.size === path.steps.length && (
            <div className="mx-4 mb-4 rounded-lg p-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900">
              <CheckCircle2 size={15} className="text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Path complete! 🎉 Well done!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FAQItem({ faq }: { faq: FAQ }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{faq.q}</span>
        {open ? <ChevronUp size={15} className="text-gray-400 shrink-0" /> : <ChevronDown size={15} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function LearningCenter() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const restartTour = useRestartTour();

  const filters = [
    { id: 'all', label: 'All Paths' },
    { id: 'personal-finance', label: '💰 Personal Finance' },
    { id: 'business-os', label: '🏪 Business OS' },
    { id: 'writers-os', label: "✍️ Writer's OS" },
    { id: 'developer', label: '⌨️ Developer' },
    { id: 'gst-tax', label: '🧾 GST & Tax' },
  ];

  const visible = activeFilter === 'all'
    ? LEARNING_PATHS
    : LEARNING_PATHS.filter((p) => p.id === activeFilter);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero */}
      <div className="w-full px-4 pt-10 pb-8 border-b border-gray-100 dark:border-gray-800 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-4">
          <GraduationCap size={12} />
          Learning Center
        </span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Learn One Tool
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
          Step-by-step paths, video tutorials, and progress tracking — get the most out of every tool.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={restartTour}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            <Sparkles size={14} /> Take the Guided Tour
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
          >
            <Zap size={14} /> Go to your dashboard
          </Link>
        </div>
      </div>

      <div className="w-full px-4 py-5">

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Learning Paths', value: `${LEARNING_PATHS.length}` },
            { label: 'Guided Steps', value: `${LEARNING_PATHS.reduce((sum, p) => sum + p.steps.length, 0)}` },
            { label: 'Free Forever', value: '100%' },
          ].map((stat) => (
            <div key={stat.label} className="border border-gray-200 dark:border-gray-800 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors shrink-0 ${
                activeFilter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Learning paths */}
        <div className="space-y-3 mb-6">
          {visible.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>

        {/* Tips section */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-blue-600 dark:text-blue-400 text-sm">Pro Tips</h2>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2"><span className="shrink-0 text-gray-300 dark:text-gray-600">·</span> Press <strong className="text-gray-800 dark:text-gray-200">Ctrl + K</strong> (or ⌘K on Mac) from anywhere to instantly open the search bar</li>
            <li className="flex items-start gap-2"><span className="shrink-0 text-gray-300 dark:text-gray-600">·</span> Click the <strong className="text-gray-800 dark:text-gray-200">pin icon</strong> on any tool card to add it to your personal &quot;My Home&quot; for one-click access</li>
            <li className="flex items-start gap-2"><span className="shrink-0 text-gray-300 dark:text-gray-600">·</span> For Personal Finance, start with <strong className="text-gray-800 dark:text-gray-200">Statement Manager</strong> — upload your bank CSV once and all 18 other tools populate automatically</li>
            <li className="flex items-start gap-2"><span className="shrink-0 text-gray-300 dark:text-gray-600">·</span> Toggle dark mode from the header — easier on the eyes for late-night sessions</li>
            <li className="flex items-start gap-2"><span className="shrink-0 text-gray-300 dark:text-gray-600">·</span> Your data is never lost on browser refresh — everything is safely stored in your browser&apos;s localStorage</li>
          </ul>
        </div>

        {/* FAQ */}
        <div className="mb-6">
          <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} faq={faq} />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="py-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Still have questions? Or want to suggest a new tool?
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Zap size={14} /> Go to your dashboard
            </Link>
            <a
              href="https://github.com/anthropics/claude-code/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLink size={13} /> Suggest a tool
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

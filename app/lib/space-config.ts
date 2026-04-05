// ─────────────────────────────────────────────────────────────────────────────
// Space Config — single source of truth for all category Space pages
//
// Adding a new category in the future:
//   1. Add one entry to SPACE_CONFIGS below (slug + emoji + desc, optionally tiers)
//   2. That's it — the dynamic route /space/[category] handles everything else
// ─────────────────────────────────────────────────────────────────────────────

export type TierDef = {
  id: string;
  label: string;
  desc?: string;
  badge?: string;
  tools: string[];   // exact tool IDs from tools-data.tsx
  hero?: boolean;    // renders wider grid (command-center style)
};

export type CategorySpaceConfig = {
  category: string;  // exact match to tools-data category field
  slug: string;      // URL slug — must be unique
  emoji: string;
  desc: string;
  tiers?: TierDef[]; // if omitted → auto-populated flat grid from ALL_TOOLS
};

export const SPACE_CONFIGS: CategorySpaceConfig[] = [

  // ── Personal Finance ──────────────────────────────────────────────────────
  {
    category: 'Personal Finance',
    slug: 'personal-finance',
    emoji: '📊',
    desc: 'Categorise your transactions, spot unnecessary spends, track patterns — customise it to fit how you actually manage money.',
    tiers: [
      {
        id: 'setup',
        label: 'Setup',
        desc: 'Upload your bank statement, set auto-categorisation rules, create custom labels — takes 2 minutes, saves hours every month',
        badge: 'Start here',
        tools: ['pf-statement-manager', 'pf-rules', 'pf-labels'],
      },
      {
        id: 'command-center',
        label: 'Command Center',
        desc: 'Every number that matters — income, expenses, savings, net worth — in one screen so nothing slips through',
        tools: ['pf-financial-snapshot'],
        hero: true,
      },
      {
        id: 'understand',
        label: 'Understand',
        desc: 'See exactly where money comes from, where it goes, and how much you actually keep at the end of the month',
        tools: ['pf-financial-position', 'pf-income-sources', 'pf-cash-flow'],
      },
      {
        id: 'spending',
        label: 'Spending',
        desc: 'Drill into every rupee spent — by category, merchant, or transaction — and find the buys you forgot you were making',
        tools: ['pf-tx-explorer', 'pf-expenses', 'pf-expenditure', 'pf-top-merchants', 'pf-big-spends'],
      },
      {
        id: 'patterns',
        label: 'Patterns',
        desc: 'Spot when you overspend, which days drain your wallet, and habits you didn\'t know you had',
        tools: ['pf-daily-pulse', 'pf-behavior', 'pf-heatmap'],
      },
      {
        id: 'recurring',
        label: 'Recurring Obligations',
        desc: 'Every subscription, EMI and bill in one place — find what you\'re still paying for but no longer using',
        tools: ['pf-commitments', 'pf-recurring', 'pf-subscriptions'],
      },
      {
        id: 'tracking',
        label: 'Tracking',
        desc: 'Set budgets, track actuals, compare months — know if you\'re improving or just hoping you are',
        tools: ['pf-budget-vs-actual', 'pf-savings-trend', 'pf-month-compare'],
      },
      {
        id: 'intelligence',
        label: 'Intelligence',
        desc: 'Your financial health score, AI-driven insights, and a breakdown of your money personality — not just data, direction',
        tools: ['pf-ai-analyst', 'pf-health-score', 'pf-spending-dna'],
      },
      {
        id: 'assets-debt',
        label: 'Assets & Debt',
        desc: 'Track what you own and what you owe — your real net worth, not just what\'s in your account today',
        tools: ['pf-investment-tracker', 'pf-liability'],
      },
    ],
  },

  // ── Finance ───────────────────────────────────────────────────────────────
  {
    category: 'Finance',
    slug: 'finance',
    emoji: '💰',
    desc: 'Calculators and planners for every financial decision — EMI, SIP, tax, retirement and more.',
    tiers: [
      {
        id: 'planning',
        label: 'Planning & Goals',
        desc: 'Long-term financial planning and wealth building',
        tools: ['smart-budget', 'smart-net-worth', 'smart-retirement', 'fire-calc'],
      },
      {
        id: 'loans-debt',
        label: 'Loans & Debt',
        desc: 'EMI calculation and debt management',
        tools: ['smart-loan', 'debt-planner', 'cost-of-delay'],
      },
      {
        id: 'investments',
        label: 'Investments & Returns',
        desc: 'SIP, FD, NPS, PPF and portfolio tools',
        tools: ['smart-sip', 'portfolio-rebalance', 'fd-calculator', 'nps-calculator', 'tax-saving-compare'],
      },
      {
        id: 'salary-tax',
        label: 'Salary & Tax',
        desc: 'Take-home pay, HRA, gratuity and capital gains',
        tools: ['ctc-calc', 'hra-calc', 'gratuity-calc', 'capital-gains-calc', 'gst-calculator'],
      },
      {
        id: 'lifestyle',
        label: 'Lifestyle & Special',
        desc: 'Wedding, subscriptions, freelance and more',
        tools: ['sub-audit', 'wedding-budget', 'salary-nego'],
      },
    ],
  },

  // ── GST & Tax ─────────────────────────────────────────────────────────────
  {
    category: 'GST & Tax',
    slug: 'gst-tax',
    emoji: '🧾',
    desc: 'Income tax, TDS, advance tax, deductions and compliance tools built for India.',
    tiers: [
      {
        id: 'income-tax',
        label: 'Income Tax',
        desc: 'Calculate, plan and file your income tax',
        tools: ['income-tax-calc', 'advance-tax-calc', 'itr-checklist'],
      },
      {
        id: 'deductions-rates',
        label: 'Deductions & Rates',
        desc: 'TDS rates and deduction tracking',
        tools: ['tds-finder', 'deduction-tracker'],
      },
      {
        id: 'planning',
        label: 'Planning',
        desc: 'Stay on top of your tax calendar',
        tools: ['tax-calendar'],
      },
    ],
  },

  // ── Business OS ───────────────────────────────────────────────────────────
  {
    category: 'Business OS',
    slug: 'business-os',
    emoji: '🏪',
    desc: 'A complete operating system for your small business — invoices, inventory, staff, and reports.',
    tiers: [
      {
        id: 'command-center',
        label: 'Command Center',
        desc: 'Your business at a glance',
        tools: ['biz-dashboard'],
        hero: true,
      },
      {
        id: 'parties',
        label: 'Parties',
        desc: 'Customers and vendors — your business relationships',
        tools: ['biz-parties'],
      },
      {
        id: 'sales',
        label: 'Sales',
        desc: 'Invoices, quotations and outstanding payments',
        tools: ['biz-invoices', 'biz-quotations', 'biz-outstanding'],
      },
      {
        id: 'purchases',
        label: 'Purchases',
        desc: 'Purchase orders and vendor payments',
        tools: ['biz-purchases'],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        desc: 'Products, stock and inventory management',
        tools: ['biz-products', 'biz-inventory', 'biz-stock-entry'],
      },
      {
        id: 'daily-finance',
        label: 'Daily Finance',
        desc: 'Day-to-day cash tracking and cash flow',
        tools: ['biz-daybook', 'biz-cashflow'],
      },
      {
        id: 'hr',
        label: 'HR & Payroll',
        desc: 'Staff management and salary processing',
        tools: ['biz-staff'],
      },
      {
        id: 'tax',
        label: 'Tax & Compliance',
        desc: 'GST filing and tax compliance',
        tools: ['biz-gst'],
      },
      {
        id: 'finance',
        label: 'Finance',
        desc: 'Business loans and bank reconciliation',
        tools: ['biz-loans', 'biz-reconcile'],
      },
      {
        id: 'reports',
        label: 'Reports',
        desc: 'P&L, balance sheet and business analytics',
        tools: ['biz-reports'],
      },
    ],
  },

  // ── Documents ─────────────────────────────────────────────────────────────
  {
    category: 'Documents',
    slug: 'documents',
    emoji: '📄',
    desc: 'Merge, split, compress, convert and edit PDFs, images and documents — all in your browser.',
    tiers: [
      {
        id: 'pdf',
        label: 'PDF Tools',
        desc: 'Merge, split and work with PDFs',
        tools: ['smart-pdf-merge', 'smart-pdf-split'],
      },
      {
        id: 'images',
        label: 'Image Tools',
        desc: 'Compress, convert and extract text from images',
        tools: ['smart-img-compress', 'smart-img-convert', 'smart-ocr', 'smart-scan'],
      },
      {
        id: 'editors',
        label: 'Editors & Converters',
        desc: 'Edit and convert common file formats',
        tools: ['smart-word', 'smart-excel', 'json-csv', 'universal-converter'],
      },
    ],
  },

  // ── Developer ─────────────────────────────────────────────────────────────
  {
    category: 'Developer',
    slug: 'developer',
    emoji: '⌨️',
    desc: 'JSON formatter, JWT decoder, API playground, regex tester and 15+ developer utilities.',
    tiers: [
      {
        id: 'workbench',
        label: 'Workbench',
        desc: 'All-in-one developer station and API testing',
        tools: ['dev-station', 'api-playground', 'self-serve-analytics'],
      },
      {
        id: 'data-format',
        label: 'Data & Format',
        desc: 'Format, validate and transform code and data',
        tools: ['smart-json', 'smart-sql', 'regex-tester', 'smart-diff', 'cron-gen'],
      },
      {
        id: 'auth-security',
        label: 'Auth & Security',
        desc: 'JWT, hashing and password tools',
        tools: ['smart-jwt', 'hash-gen'],
      },
      {
        id: 'utilities',
        label: 'Utilities',
        desc: 'Number base conversion, timestamps and references',
        tools: ['num-convert', 'timestamp-tool', 'git-cheats'],
      },
    ],
  },

  // ── Writer's OS ───────────────────────────────────────────────────────────
  {
    category: "Writer's OS",
    slug: 'writers-os',
    emoji: '✍️',
    desc: 'A complete writing workspace — from ideas to final draft. Plan, write, analyze and publish.',
    tiers: [
      {
        id: 'ideate',
        label: 'Ideate',
        desc: 'Generate and develop ideas',
        tools: ['writer-ideas', 'writer-headline'],
      },
      {
        id: 'write',
        label: 'Write & Plan',
        desc: 'Structure and write your content',
        tools: ['writer-studio', 'writer-planner'],
      },
      {
        id: 'refine',
        label: 'Refine & Publish',
        desc: 'Analyze, improve and export your work',
        tools: ['writer-analyzer', 'writer-export'],
      },
    ],
  },

  // ── Bio Data & Resume ─────────────────────────────────────────────────────
  {
    category: 'Bio Data & Resume',
    slug: 'biodata-resume',
    emoji: '📋',
    desc: 'Free Indian bio data maker, resume builder and cover letter — multiple templates, no signup, no watermark, 100% browser-based.',
    tiers: [
      {
        id: 'biodata',
        label: 'Bio Data',
        desc: 'Create matrimonial or job bio data — fill the form, pick a template, download PDF in seconds',
        badge: 'Most popular',
        tools: ['biodata-maker'],
      },
      {
        id: 'resume',
        label: 'Resume & Cover Letter',
        desc: 'Professional resume and cover letter for corporate and government job applications',
        tools: ['resume-builder', 'cover-letter'],
      },
    ],
  },

  // ── Simple categories — auto-populated flat grid (no tiers needed) ────────
  { category: 'Business',     slug: 'business',      emoji: '💼', desc: 'GST invoices, salary slips, agreements, ID cards and rent receipts — business documents ready in seconds.' },
  { category: 'Real Estate',  slug: 'real-estate',   emoji: '🏠', desc: 'Home loan EMI, rent vs buy, rental yield, stamp duty — property calculators built for India.' },
  { category: 'Career',       slug: 'career',        emoji: '🎯', desc: 'Job offer comparison, freelance rate, ESOP value, F&F settlement — career planning tools.' },
  { category: 'Startup',      slug: 'startup',       emoji: '🚀', desc: 'Burn rate, equity dilution, SaaS metrics, project pricing — tools built for founders.' },
  { category: 'Travel',       slug: 'travel',        emoji: '✈️', desc: 'Trip budget planner, road trip cost, forex calculator — plan and track every journey.' },
  { category: 'Personal CRM', slug: 'personal-crm',  emoji: '👥', desc: 'Manage your relationships and contacts — a private CRM that stays in your browser.' },
  { category: 'Business CRM', slug: 'business-crm',  emoji: '🤝', desc: 'Sales pipeline, lead tracking, follow-ups — a lightweight CRM for small teams.' },
  { category: 'Productivity', slug: 'productivity',  emoji: '⚡', desc: 'QR codes, password generator, Pomodoro timer, habit tracker, task planner and more.' },
  { category: 'Converters',   slug: 'converters',    emoji: '🔄', desc: 'Unit converter, text case converter — instant conversions for everyday use.' },
  { category: 'Design',       slug: 'design',        emoji: '🎨', desc: 'Color picker, gradient generator, palette maker — free web design tools.' },
  { category: 'Health',       slug: 'health',        emoji: '❤️', desc: 'BMI, workout timer, breathing exercises, calorie and water trackers — simple health tools.' },
  { category: 'AI',           slug: 'ai',            emoji: '🤖', desc: 'AI prompt generator, chat assistant, sentiment analyzer — free AI tools, no signup.' },
  { category: 'Creator',      slug: 'creator',       emoji: '🎬', desc: 'Audio transcription, speech to text, multilingual voice tools — for content creators.' },

  // ── Daily Utility ─────────────────────────────────────────────────────────
  {
    category: 'Daily Utility',
    slug: 'daily-utility',
    emoji: '🛒',
    desc: 'Tools for everyday life — plan your shopping, track what you need vs want, and stay on top of daily spend.',
    tiers: [
      {
        id: 'shopping',
        label: 'Shopping',
        desc: 'Plan your grocery run, tag items by priority, and track actual vs estimated spend',
        badge: 'New',
        tools: ['smart-cart'],
      },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getSpaceConfig(slug: string): CategorySpaceConfig | undefined {
  return SPACE_CONFIGS.find(c => c.slug === slug);
}

/** Returns the Space href for a category name, or falls back to catalog search */
export function categoryToSpaceHref(category: string): string {
  const config = SPACE_CONFIGS.find(c => c.category === category);
  return config ? `/space/${config.slug}` : `/home?search=${encodeURIComponent(category)}`;
}

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
    desc: 'Upload your bank statement once — unlock 27 tools that show exactly where your money goes, what you owe, and how to improve.',
    tiers: [
      {
        id: 'entry',
        label: 'Import Data',
        desc: 'Import your bank statements to unlock all tools — CSV upload, manual entry, or Account Aggregator (coming soon).',
        badge: 'Start here',
        tools: ['pf-bank-connect', 'pf-statement-manager'],
      },
      {
        id: 'transaction-layer',
        label: 'Manage Transactions',
        desc: 'Every transaction from all your accounts — explore, filter, categorize, and export the full ledger.',
        tools: ['pf-tx-explorer', 'pf-cash-flow', 'pf-expenses', 'pf-expenditure'],
      },
      {
        id: 'primary-dashboard',
        label: 'Primary Dashboard',
        desc: 'Your complete financial position, cross-store overview, and fitness score — the three screens you check first.',
        tools: ['pf-financial-position', 'pf-financial-snapshot', 'pf-health-score'],
      },
      {
        id: 'income',
        label: 'Income',
        desc: 'Break down all money coming in — salary, freelance, UPI receipts, interest, and refunds by source.',
        tools: ['pf-income-sources'],
      },
      {
        id: 'pattern-analysis',
        label: 'Pattern Analysis',
        desc: 'Spot when you overspend, which days drain your wallet, which merchants cost the most, and whether your savings are trending up.',
        tools: ['pf-daily-pulse', 'pf-behavior', 'pf-big-spends', 'pf-heatmap', 'pf-top-merchants', 'pf-savings-trend', 'pf-month-compare'],
      },
      {
        id: 'recurring-subs',
        label: 'Recurring & Subs',
        desc: 'Every EMI, fixed obligation, recurring debit, and subscription auto-detected from your transactions — find what you are still paying for.',
        tools: ['pf-commitments', 'pf-recurring', 'pf-subscriptions'],
      },
      {
        id: 'liability',
        label: 'Liability',
        desc: 'Loan EMIs, debt burden ratio, and credit obligations identified directly from your bank statement patterns.',
        tools: ['pf-liability'],
      },
      {
        id: 'management',
        label: 'Management',
        desc: 'Custom labels for tagging transactions, auto-categorization rules, and manual investment portfolio tracking.',
        tools: ['pf-labels', 'pf-rules', 'pf-investment-tracker'],
      },
      {
        id: 'budget-planner',
        label: 'Budget Planner',
        desc: 'Zero-based budgeting with envelope tracking, savings goals, year-overview, cash flow calendar — and budget vs actual from your real statements.',
        tools: ['pf-budget-planner', 'pf-budget-vs-actual'],
      },
      {
        id: 'ai',
        label: 'AI',
        desc: 'AI analyst that reads your real transactions to surface anomalies, predictions, and recommendations — plus your money personality profile.',
        tools: ['pf-ai-analyst', 'pf-spending-dna'],
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
        id: 'wealth-planning',
        label: 'Wealth & Goals',
        desc: 'Build long-term wealth — track net worth, plan retirement, calculate FIRE number, and set a budget.',
        badge: 'Start here',
        tools: ['smart-net-worth', 'smart-retirement', 'fire-calc', 'smart-budget'],
      },
      {
        id: 'loans-debt',
        label: 'Loans & Debt',
        desc: 'EMI breakdown, debt payoff order, and the real cost of delaying a payment.',
        tools: ['smart-loan', 'debt-planner', 'cost-of-delay'],
      },
      {
        id: 'investments',
        label: 'Investments',
        desc: 'SIP projections, FD/RD returns, NPS corpus, PPF growth, portfolio rebalancing, and tax-saving instrument comparison.',
        tools: ['smart-sip', 'fd-calculator', 'nps-calculator', 'ppf-calculator', 'portfolio-rebalance', 'tax-saving-compare'],
      },
      {
        id: 'salary-tax',
        label: 'Salary & Tax',
        desc: 'In-hand salary from CTC, HRA exemption, gratuity, capital gains tax, and GST calculation.',
        tools: ['ctc-calc', 'hra-calc', 'gratuity-calc', 'capital-gains-calc', 'gst-calculator'],
      },
      {
        id: 'lifestyle',
        label: 'Life Events',
        desc: 'Wedding budget, subscription audit, and salary negotiation — financial tools for life decisions.',
        tools: ['wedding-budget', 'sub-audit', 'salary-nego'],
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
        desc: 'Calculate your tax liability, check advance tax instalments, and get a filing checklist.',
        badge: 'Start here',
        tools: ['income-tax-calc', 'advance-tax-calc', 'itr-checklist'],
      },
      {
        id: 'deductions-tds',
        label: 'Deductions & TDS',
        desc: 'Find the right TDS rate for any payment and track all your 80C/80D deductions.',
        tools: ['tds-finder', 'deduction-tracker'],
      },
      {
        id: 'calendar',
        label: 'Tax Calendar',
        desc: 'Never miss a due date — all ITR, TDS, advance tax, and GST deadlines in one view.',
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
        desc: 'Your business at a glance — sales, purchases, stock, and cash all in one screen.',
        tools: ['biz-dashboard'],
        hero: true,
      },
      {
        id: 'parties',
        label: 'Parties',
        desc: 'Manage all your customers and vendors — contact details, balances, and transaction history.',
        tools: ['biz-parties'],
      },
      {
        id: 'sales',
        label: 'Sales',
        desc: 'Create invoices and quotations, track what is owed to you, and follow up on outstanding payments.',
        tools: ['biz-invoices', 'biz-quotations', 'biz-outstanding'],
      },
      {
        id: 'purchases',
        label: 'Purchases',
        desc: 'Record supplier bills, track payments, and manage your purchase pipeline.',
        tools: ['biz-purchases'],
      },
      {
        id: 'inventory',
        label: 'Inventory',
        desc: 'Maintain your product catalog, track stock levels, and record inward/outward stock movements.',
        tools: ['biz-products', 'biz-inventory', 'biz-stock-entry'],
      },
      {
        id: 'daily-finance',
        label: 'Daily Finance',
        desc: 'Day-to-day cash entries in your daybook and a rolling cash flow view.',
        tools: ['biz-daybook', 'biz-cashflow'],
      },
      {
        id: 'hr',
        label: 'HR & Payroll',
        desc: 'Add staff, track attendance, process salaries, and generate salary slips.',
        tools: ['biz-staff'],
      },
      {
        id: 'tax',
        label: 'GST & Compliance',
        desc: 'Classify transactions by GST rate, prepare GSTR summaries, and stay compliant.',
        tools: ['biz-gst'],
      },
      {
        id: 'finance',
        label: 'Finance',
        desc: 'Track business loans and EMIs, and reconcile your bank statement with your books.',
        tools: ['biz-loans', 'biz-reconcile'],
      },
      {
        id: 'reports',
        label: 'Reports',
        desc: 'P&L statement, balance sheet, and business analytics — know your numbers.',
        tools: ['biz-reports'],
      },
    ],
  },

  // ── Business ──────────────────────────────────────────────────────────────
  {
    category: 'Business',
    slug: 'business',
    emoji: '💼',
    desc: 'GST invoices, salary slips, agreements, ID cards and rent receipts — business documents ready in seconds.',
    tiers: [
      {
        id: 'billing',
        label: 'Billing & Invoices',
        desc: 'Create professional GST invoices and quotations — download as PDF instantly.',
        badge: 'Most used',
        tools: ['invoice-generator'],
      },
      {
        id: 'hr-docs',
        label: 'HR Documents',
        desc: 'Salary slips and ID cards for your team — fill the form, get the PDF.',
        tools: ['salary-slip', 'id-card'],
      },
      {
        id: 'legal',
        label: 'Legal & Rental',
        desc: 'Legal contracts and rent receipts with your own terms — no lawyer needed for standard documents.',
        tools: ['smart-agreement', 'rent-receipt'],
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
        label: 'PDF',
        desc: 'Merge multiple PDFs into one or split a PDF into individual pages — no upload, no server.',
        tools: ['smart-pdf-merge', 'smart-pdf-split'],
      },
      {
        id: 'images',
        label: 'Images',
        desc: 'Compress images for web, convert between formats, extract text via OCR, and scan documents.',
        tools: ['smart-img-compress', 'smart-img-convert', 'smart-ocr', 'smart-scan'],
      },
      {
        id: 'data-editors',
        label: 'Data & Editors',
        desc: 'Edit Markdown, work with CSV data, convert JSON to CSV, build charts, and convert file formats.',
        tools: ['smart-word', 'smart-excel', 'json-csv', 'self-serve-analytics', 'universal-converter'],
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
        desc: 'All-in-one developer station and live API testing — your browser-based dev environment.',
        badge: 'Power tools',
        tools: ['dev-station', 'api-playground'],
      },
      {
        id: 'data-format',
        label: 'Data & Format',
        desc: 'Format JSON, write and test SQL, diff text, test regex, and generate cron expressions.',
        tools: ['smart-json', 'smart-sql', 'smart-diff', 'regex-tester', 'cron-gen'],
      },
      {
        id: 'auth-security',
        label: 'Auth & Security',
        desc: 'Decode and verify JWTs, generate hashes (MD5, SHA-256), and create secure passwords.',
        tools: ['smart-jwt', 'hash-gen'],
      },
      {
        id: 'utilities',
        label: 'Utilities',
        desc: 'Convert number bases, work with Unix timestamps, and get a quick Git command reference.',
        tools: ['num-convert', 'timestamp-tool', 'git-cheats'],
      },
    ],
  },

  // ── Productivity ──────────────────────────────────────────────────────────
  {
    category: 'Productivity',
    slug: 'productivity',
    emoji: '⚡',
    desc: 'QR codes, password generator, Pomodoro timer, habit tracker, task planner and more.',
    tiers: [
      {
        id: 'planning',
        label: 'Planning & Goals',
        desc: 'Capture everything in your second brain, run your life with a structured OS, and manage your tasks.',
        badge: 'Start here',
        tools: ['second-brain', 'life-os', 'task-planner', 'habit-tracker'],
      },
      {
        id: 'focus',
        label: 'Focus',
        desc: 'Work in focused sprints with the Pomodoro technique.',
        tools: ['pomodoro'],
      },
      {
        id: 'utilities',
        label: 'Utilities',
        desc: 'Generate QR codes, create strong passwords, and translate text to any language.',
        tools: ['qr-code', 'smart-pass', 'lang-translate'],
      },
    ],
  },

  // ── Health ────────────────────────────────────────────────────────────────
  {
    category: 'Health',
    slug: 'health',
    emoji: '❤️',
    desc: 'BMI, workout timer, breathing exercises, calorie and water trackers — simple health tools.',
    tiers: [
      {
        id: 'body',
        label: 'Body & Nutrition',
        desc: 'Check your BMI, calculate daily calorie and macro needs, and track water intake.',
        badge: 'Start here',
        tools: ['smart-bmi', 'calorie-calculator', 'water-tracker'],
      },
      {
        id: 'fitness',
        label: 'Fitness & Mindfulness',
        desc: 'Run HIIT workouts with an interval timer and practice box breathing for stress relief.',
        tools: ['smart-workout', 'smart-breath'],
      },
    ],
  },

  // ── Career ────────────────────────────────────────────────────────────────
  {
    category: 'Career',
    slug: 'career',
    emoji: '🎯',
    desc: 'Job offer comparison, freelance rate, ESOP value, F&F settlement — career planning tools.',
    tiers: [
      {
        id: 'decisions',
        label: 'Career Decisions',
        desc: 'Compare job offers side by side, negotiate salary confidently, and calculate your real WFH savings.',
        badge: 'Start here',
        tools: ['job-offer-compare', 'salary-nego', 'wfh-savings'],
      },
      {
        id: 'income',
        label: 'Income & Compensation',
        desc: 'Set your freelance rate, value your ESOPs/RSUs, and calculate full & final settlement.',
        tools: ['freelance-rate', 'esop-value-calc', 'fnf-calculator'],
      },
      {
        id: 'growth',
        label: 'Career Growth',
        desc: 'Track your salary history over time and measure the ROI of courses, certifications, and MBA.',
        tools: ['salary-history', 'career-roi-calc'],
      },
    ],
  },

  // ── Real Estate ───────────────────────────────────────────────────────────
  {
    category: 'Real Estate',
    slug: 'real-estate',
    emoji: '🏠',
    desc: 'Home loan EMI, rent vs buy, rental yield, stamp duty — property calculators built for India.',
    tiers: [
      {
        id: 'buying',
        label: 'Buying a Home',
        desc: 'Know how much you can afford, break down your home loan EMI with prepayment scenarios, and estimate stamp duty.',
        badge: 'Start here',
        tools: ['property-budget', 'home-loan-emi', 'stamp-duty'],
      },
      {
        id: 'renting',
        label: 'Renting vs Buying',
        desc: 'Decide whether to rent or buy based on your city, income, and long-term plans.',
        tools: ['rent-vs-buy'],
      },
      {
        id: 'investment',
        label: 'Property Investment',
        desc: 'Calculate gross and net rental yield to know if a property investment makes sense.',
        tools: ['rental-yield'],
      },
    ],
  },

  // ── Startup ───────────────────────────────────────────────────────────────
  {
    category: 'Startup',
    slug: 'startup',
    emoji: '🚀',
    desc: 'Burn rate, equity dilution, SaaS metrics, project pricing — tools built for founders.',
    tiers: [
      {
        id: 'financials',
        label: 'Startup Financials',
        desc: 'Know your burn rate, runway, and when you will run out of money.',
        badge: 'Critical',
        tools: ['burn-rate'],
      },
      {
        id: 'equity',
        label: 'Equity & Funding',
        desc: 'Model equity dilution across funding rounds — see how ownership changes.',
        tools: ['equity-dilution'],
      },
      {
        id: 'metrics',
        label: 'Metrics & Pricing',
        desc: 'Track SaaS metrics (MRR, churn, LTV, CAC) and price your projects and services correctly.',
        tools: ['saas-metrics', 'project-pricing'],
      },
    ],
  },

  // ── Travel ────────────────────────────────────────────────────────────────
  {
    category: 'Travel',
    slug: 'travel',
    emoji: '✈️',
    desc: 'Trip budget planner, road trip cost, forex calculator — plan and track every journey.',
    tiers: [
      {
        id: 'trip-planning',
        label: 'Trip Planning',
        desc: 'Budget your vacation by category and split costs across the group.',
        badge: 'Start here',
        tools: ['trip-budget'],
      },
      {
        id: 'road-drive',
        label: 'Road & Drive',
        desc: 'Calculate road trip fuel cost and compare EV vs petrol for your drive.',
        tools: ['road-trip', 'ev-vs-petrol'],
      },
      {
        id: 'money',
        label: 'Travel Money',
        desc: 'Convert currencies and plan your forex budget before you fly.',
        tools: ['forex-calc'],
      },
    ],
  },

  // ── Personal CRM ──────────────────────────────────────────────────────────
  {
    category: 'Personal CRM',
    slug: 'personal-crm',
    emoji: '👥',
    desc: 'Manage your relationships and contacts — a private CRM that stays in your browser.',
    tiers: [
      {
        id: 'contacts',
        label: 'People & Relationships',
        desc: 'Track your network — contacts, last touchpoints, notes, and follow-up reminders. Fully offline.',
        badge: 'New',
        tools: ['crm-people'],
      },
    ],
  },

  // ── Business CRM ──────────────────────────────────────────────────────────
  {
    category: 'Business CRM',
    slug: 'business-crm',
    emoji: '🤝',
    desc: 'Sales pipeline, lead tracking, follow-ups — a lightweight CRM for small teams.',
    tiers: [
      {
        id: 'pipeline',
        label: 'Sales Pipeline',
        desc: 'Manage leads, deals, and follow-ups through a Kanban-style sales pipeline.',
        badge: 'New',
        tools: ['biz-crm-pipeline'],
      },
    ],
  },

  // ── Converters ────────────────────────────────────────────────────────────
  {
    category: 'Converters',
    slug: 'converters',
    emoji: '🔄',
    desc: 'Unit converter, text case converter — instant conversions for everyday use.',
    tiers: [
      {
        id: 'units',
        label: 'Units',
        desc: 'Convert length, weight, temperature, area, speed, and 50+ other units instantly.',
        tools: ['unit-convert'],
      },
      {
        id: 'text',
        label: 'Text',
        desc: 'Transform text between camelCase, snake_case, UPPER CASE, Title Case and more.',
        tools: ['case-convert'],
      },
    ],
  },

  // ── Design ────────────────────────────────────────────────────────────────
  {
    category: 'Design',
    slug: 'design',
    emoji: '🎨',
    desc: 'Color picker, gradient generator, palette maker — free web design tools.',
    tiers: [
      {
        id: 'color',
        label: 'Color Tools',
        desc: 'Pick colors, generate CSS gradients, and build complete color palettes.',
        tools: ['color-picker', 'color-studio'],
      },
    ],
  },

  // ── AI ────────────────────────────────────────────────────────────────────
  {
    category: 'AI',
    slug: 'ai',
    emoji: '🤖',
    desc: 'AI prompt generator, chat assistant, sentiment analyzer — free AI tools, no signup.',
    tiers: [
      {
        id: 'create',
        label: 'Create & Chat',
        desc: 'Generate powerful prompts for any AI model and chat with an AI assistant.',
        badge: 'Free',
        tools: ['prompt-generator', 'smart-chat'],
      },
      {
        id: 'analyze',
        label: 'Analyze',
        desc: 'Run sentiment analysis on reviews, feedback, and social media text.',
        tools: ['smart-analyze'],
      },
    ],
  },

  // ── Creator ───────────────────────────────────────────────────────────────
  {
    category: 'Creator',
    slug: 'creator',
    emoji: '🎬',
    desc: 'Audio transcription, speech to text, multilingual voice tools — for content creators.',
    tiers: [
      {
        id: 'transcribe',
        label: 'Transcription',
        desc: 'Transcribe audio recordings and extract transcripts from video content.',
        badge: 'New',
        tools: ['audio-transcription', 'instagram-transcript'],
      },
      {
        id: 'download',
        label: 'Download',
        desc: 'Download videos from social platforms for offline use or repurposing.',
        tools: ['video-downloader'],
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
        desc: 'Generate content ideas and craft headlines that get clicks.',
        tools: ['writer-ideas', 'writer-headline'],
      },
      {
        id: 'write',
        label: 'Write & Plan',
        desc: 'Structure your content calendar and write in a distraction-free studio.',
        tools: ['writer-studio', 'writer-planner'],
      },
      {
        id: 'refine',
        label: 'Refine & Publish',
        desc: 'Analyze readability, tone, and word count — then export your finished piece.',
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
        desc: 'Create matrimonial or job bio data — fill the form, pick a template, download PDF in seconds.',
        badge: 'Most popular',
        tools: ['biodata-maker'],
      },
      {
        id: 'resume',
        label: 'Resume & Cover Letter',
        desc: 'Professional resume and cover letter for corporate and government job applications.',
        tools: ['resume-builder', 'cover-letter'],
      },
    ],
  },

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
        desc: 'Plan your grocery run, tag items by priority, and track actual vs estimated spend.',
        badge: 'New',
        tools: ['smart-cart', 'grocery-items'],
      },
    ],
  },

  // ── Time Management ───────────────────────────────────────────────────────
  {
    category: 'Time Management',
    slug: 'time-management',
    emoji: '⏱️',
    desc: 'Time blocking, weekly timetable, deep focus timer, deadline tracker, sprint timer, and time audit — tools to take full control of your day.',
    tiers: [
      {
        id: 'schedule',
        label: 'Schedule',
        desc: 'Plan your day and week visually — block time, build timetables, and see your whole schedule at a glance.',
        badge: 'Start here',
        tools: ['time-blocks', 'week-grid'],
      },
      {
        id: 'focus',
        label: 'Focus & Sprints',
        desc: 'Run focused work sessions and keep every meeting on track.',
        tools: ['deep-focus', 'sprint-timer'],
      },
      {
        id: 'track',
        label: 'Track & Analyse',
        desc: 'Stay on top of deadlines and understand where your time really goes.',
        tools: ['deadline-board', 'time-audit'],
      },
    ],
  },

  // ── Astrology ─────────────────────────────────────────────────────────────
  {
    category: 'Astrology',
    slug: 'astrology',
    emoji: '🔮',
    desc: 'Kundali, Panchang, Choghadiya, Muhurta, Graha, and Vedic timekeeping — ancient wisdom in a modern tool.',
    tiers: [
      {
        id: 'kundali',
        label: 'Kundali',
        desc: 'Generate your birth chart with full planetary positions and house placements.',
        badge: 'Popular',
        tools: ['kundali-generator'],
      },
      {
        id: 'panchang',
        label: 'Panchang',
        desc: 'Today\'s Panchang, monthly calendar, and auspicious timing — Tithi, Nakshatra, Yoga, Karan.',
        tools: ['panchang-today', 'panchang-calendar'],
      },
      {
        id: 'muhurta',
        label: 'Muhurta & Timing',
        desc: 'Find the right moment — Choghadiya, Muhurta finder, and Grahan (eclipse) tracker.',
        tools: ['choghadiya', 'muhurta-finder', 'grahan-tracker'],
      },
      {
        id: 'grahas',
        label: 'Grahas & Transits',
        desc: 'Current planetary positions (Graha Sthiti), transits (Gochar), and the Vedic clock.',
        tools: ['graha-sthiti', 'gochar', 'vedic-clock'],
      },
      {
        id: 'festivals',
        label: 'Festivals & Vrats',
        desc: 'Calendar of Hindu festivals, vrats, and tyohars for the year.',
        tools: ['vrat-tyohar'],
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

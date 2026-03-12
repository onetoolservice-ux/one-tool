import type { IconName } from "./utils/icon-mapper";

export interface Tool {
  id: string;
  name: string;
  category: string;
  href: string;
  icon: IconName;
  popular?: boolean;
  color: string;
  desc: string;
  status?: string;
}

// Category order for display
export const CATEGORY_ORDER = [
  "Personal Finance",
  "Personal CRM",
  "Business CRM",
  "Business OS",
  "Finance",
  "GST & Tax",
  "Real Estate",
  "Career",
  "Startup",
  "Travel",
  "Business",
  "Documents",
  "Developer",
  "Productivity",
  "Converters",
  "Design",
  "Health",
  "AI",
  "Creator"
] as const;

export const ALL_TOOLS: Tool[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONAL FINANCE - Statement-based financial record system
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pf-statement-manager",
    name: "Statement Manager",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-statement-manager",
    icon: "FileSpreadsheet",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Upload bank and credit card statements. Manage accounts, view parsing confidence, and monitor data quality."
  },
  {
    id: "pf-financial-position",
    name: "Financial Position",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-financial-position",
    icon: "Wallet",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Period-level snapshot: income, outflow, net surplus, savings rate, commitment ratio, and debt servicing ratio."
  },
  {
    id: "pf-cash-flow",
    name: "Income",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-cash-flow",
    icon: "TrendingUp",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Structured income and outflow statement with period comparison. Income → Outflows → Net Closing Position."
  },
  {
    id: "pf-tx-explorer",
    name: "Transaction Explorer",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-tx-explorer",
    icon: "Table",
    color: "text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400",
    desc: "Full searchable ledger. Filter, sort, paginate, reclassify categories inline, and bulk-export transactions."
  },
  {
    id: "pf-expenses",
    name: "Expenses",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-expenses",
    icon: "TrendingDown",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Full searchable expense ledger. Filter by statement, date, name, amount, and category. Reclassify, bulk-tag, and export."
  },
  {
    id: "pf-expenditure",
    name: "Manage Expenses",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-expenditure",
    icon: "BarChart3",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Category-wise spend breakdown with MoM comparison. Rename, merge, and add categories. View by category, merchant, or month."
  },
  {
    id: "pf-commitments",
    name: "Commitments Register",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-commitments",
    icon: "RefreshCw",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Auto-detected recurring obligations (EMIs, rent, subscriptions). Confirm, dismiss, or add manual commitments."
  },
  {
    id: "pf-recurring",
    name: "Recurring Payments",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-recurring",
    icon: "Repeat2",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "All auto-detected repetitive debits grouped by merchant. Assign or change categories in bulk."
  },
  {
    id: "pf-top-merchants",
    name: "Top Merchants",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-top-merchants",
    icon: "Trophy",
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    desc: "Merchant leaderboard ranked by total spend. See where your money goes most, with inline category assignment."
  },
  {
    id: "pf-big-spends",
    name: "Big Spends",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-big-spends",
    icon: "Zap",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "All transactions above a custom threshold. Quickly review large one-off expenses by period or category."
  },
  {
    id: "pf-rules",
    name: "Category Rules",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-rules",
    icon: "Wand2",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Create auto-categorization rules. Merchant contains, amount range, or type-based conditions applied to all transactions."
  },
  {
    id: "pf-income-sources",
    name: "Income Sources",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-income-sources",
    icon: "CircleDollarSign",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Credit transactions broken down by category — salary, interest, refunds, freelance income and more."
  },
  {
    id: "pf-behavior",
    name: "Spending Behavior",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-behavior",
    icon: "Activity",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "When do you spend most? Day-of-week and day-of-month spending patterns to reveal behavioral trends."
  },
  {
    id: "pf-savings-trend",
    name: "Savings Trend",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-savings-trend",
    icon: "TrendingUp",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "Month-by-month savings rate and surplus/deficit. See if your financial discipline is improving over time."
  },
  {
    id: "pf-month-compare",
    name: "Month Comparison",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-month-compare",
    icon: "ArrowLeftRight",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Side-by-side category breakdown for any two periods. Instantly see what changed and by how much."
  },
  {
    id: "pf-heatmap",
    name: "Spending Heatmap",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-heatmap",
    icon: "CalendarDays",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Calendar heatmap of daily spend intensity. Spot high-spend days instantly and drill into transactions."
  },
  {
    id: "pf-subscriptions",
    name: "Subscription Finder",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-subscriptions",
    icon: "Radio",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Detects fixed-amount recurring payments — subscriptions, SIPs, insurance premiums. Shows monthly and annual cost."
  },
  {
    id: "pf-labels",
    name: "Label Manager",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-labels",
    icon: "Tags",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Create custom color-coded tags and assign them to transactions. Filter and group your data any way you want."
  },
  {
    id: "pf-liability",
    name: "Liability Ledger",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-liability",
    icon: "Landmark",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Loan/EMI groupings, estimated monthly burden, and EMI burden ratio derived from your transaction patterns."
  },
  {
    id: "pf-ai-analyst",
    name: "AI Financial Analyst",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-ai-analyst",
    icon: "Brain",
    popular: true,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Auto-generated insights, anomaly detection, spending predictions, and personalised recommendations from your statements."
  },
  {
    id: "pf-health-score",
    name: "Financial Health Score",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-health-score",
    icon: "ShieldCheck",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Score your financial fitness across 5 dimensions — savings, debt, emergency fund, insurance, and investments."
  },
  {
    id: "pf-spending-dna",
    name: "Spending DNA",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-spending-dna",
    icon: "Dna",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Decode your money personality from spending patterns. Discover your archetype and get actionable insights."
  },
  {
    id: "pf-investment-tracker",
    name: "Investment Portfolio Tracker",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-investment-tracker",
    icon: "TrendingUp",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Track all your investments (equity, debt, gold, crypto) with XIRR, asset allocation pie chart, and gain/loss."
  },
  {
    id: "pf-budget-vs-actual",
    name: "Budget vs Actual",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-budget-vs-actual",
    icon: "BarChart3",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Compare planned budget against actual spending by category. Spot overspends with progress bars and charts."
  },
  {
    id: "pf-financial-snapshot",
    name: "Financial Snapshot",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-financial-snapshot",
    icon: "LayoutDashboard",
    popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "One-screen view of your entire financial life — spending, investments, budget, and health score with deep-links."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE (Emerald/Green) - Financial calculators and planners
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "smart-budget",
    name: "Budget Planner Pro",
    category: "Finance",
    href: "/tools/finance/smart-budget",
    icon: "Wallet",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Create detailed monthly budgets with income tracking, expense categories, and savings goals."
  },
  {
    id: "smart-loan",
    name: "Smart Loan Calculator",
    category: "Finance",
    href: "/tools/finance/smart-loan",
    icon: "Calculator",
    popular: true,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "Calculate EMI, total interest, and amortization schedules for home, car, or personal loans."
  },
  {
    id: "smart-sip",
    name: "SIP Calculator",
    category: "Finance",
    href: "/tools/finance/smart-sip",
    icon: "TrendingUp",
    color: "text-lime-600 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-400",
    desc: "Plan systematic investments with projected returns, wealth accumulation, and goal tracking."
  },
  {
    id: "smart-net-worth",
    name: "Net Worth Tracker",
    category: "Finance",
    href: "/tools/finance/smart-net-worth",
    icon: "Landmark",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "Track assets and liabilities to monitor your net worth growth over time."
  },
  {
    id: "smart-retirement",
    name: "Retirement Planner",
    category: "Finance",
    href: "/tools/finance/smart-retirement",
    icon: "Briefcase",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Plan retirement corpus with inflation adjustment, pension estimates, and withdrawal strategies."
  },
  {
    id: "gst-calculator",
    name: "GST Calculator",
    category: "Finance",
    href: "/tools/finance/gst-calculator",
    icon: "Percent",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Calculate GST amounts, inclusive/exclusive prices, and tax breakdowns for Indian businesses."
  },
  {
    id: "fire-calc",
    name: "FIRE Calculator",
    category: "Finance",
    href: "/tools/finance/fire-calc",
    icon: "Flame",
    popular: true,
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Calculate your Financial Independence number, FIRE age, and how much corpus you need to retire early."
  },
  {
    id: "cost-of-delay",
    name: "Cost of Delay",
    category: "Finance",
    href: "/tools/finance/cost-of-delay",
    icon: "Clock",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "See exactly how much wealth you lose by delaying investments. Powerful motivator to start today."
  },
  {
    id: "debt-planner",
    name: "Debt Planner",
    category: "Finance",
    href: "/tools/finance/debt-planner",
    icon: "CreditCard",
    popular: true,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Snowball vs Avalanche — find your fastest, cheapest path to becoming debt-free."
  },
  {
    id: "portfolio-rebalance",
    name: "Portfolio Rebalancer",
    category: "Finance",
    href: "/tools/finance/portfolio-rebalance",
    icon: "BarChart3",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Track asset allocation drift and get exact buy/sell instructions to rebalance your portfolio."
  },
  {
    id: "ctc-calc",
    name: "CTC to In-hand",
    category: "Finance",
    href: "/tools/finance/ctc-calc",
    icon: "IndianRupee",
    popular: true,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "Exact take-home salary from CTC — old vs new regime, EPF, HRA, all deductions included."
  },
  {
    id: "hra-calc",
    name: "HRA Exemption",
    category: "Finance",
    href: "/tools/finance/hra-calc",
    icon: "Home",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "Calculate exact HRA exempt from income tax under Sec 10(13A). Three-condition method."
  },
  {
    id: "gratuity-calc",
    name: "Gratuity & Leave Encashment",
    category: "Finance",
    href: "/tools/finance/gratuity-calc",
    icon: "Award",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Calculate gratuity and leave encashment when leaving a job. Know what your employer owes you."
  },
  {
    id: "capital-gains-calc",
    name: "Capital Gains Tax",
    category: "Finance",
    href: "/tools/finance/capital-gains-calc",
    icon: "TrendingUp",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "STCG & LTCG tax across stocks, mutual funds, gold, and property. FY 2024-25 rates."
  },
  {
    id: "tax-saving-compare",
    name: "NPS vs PPF vs ELSS",
    category: "Finance",
    href: "/tools/finance/tax-saving-compare",
    icon: "Scale",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Side-by-side comparison of 80C instruments — corpus, tax savings, liquidity, and exit rules."
  },
  {
    id: "sub-audit",
    name: "Subscription Audit",
    category: "Finance",
    href: "/tools/finance/sub-audit",
    icon: "Radio",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Track all subscriptions, flag rarely-used ones, and see your true annual subscription cost."
  },
  {
    id: "wedding-budget",
    name: "Wedding Budget Planner",
    category: "Finance",
    href: "/tools/finance/wedding-budget",
    icon: "Heart",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Plan every rupee of your wedding across all categories. Track budgeted vs actual spend."
  },
  {
    id: "salary-nego",
    name: "Salary Negotiation",
    category: "Finance",
    href: "/tools/finance/salary-nego",
    icon: "Briefcase",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Is that hike really worth it? See actual take-home difference after tax for any CTC offer."
  },
  {
    id: "fd-calculator",
    name: "FD / RD Calculator",
    category: "Finance",
    href: "/tools/finance/fd-calculator",
    icon: "PiggyBank",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Calculate maturity amount for Fixed Deposits and Recurring Deposits. Includes TDS, senior citizen rates, and year-wise growth chart."
  },
  {
    id: "nps-calculator",
    name: "NPS Calculator",
    category: "Finance",
    href: "/tools/finance/nps-calculator",
    icon: "Coins",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Project NPS corpus at retirement. Choose equity/debt allocation, see annuity income, and 80CCD tax benefit."
  },
  {
    id: "ppf-calculator",
    name: "PPF Calculator",
    category: "Finance",
    href: "/tools/finance/ppf-calculator",
    icon: "Droplets",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "Calculate PPF maturity with yearly deposits, extension blocks, and EEE tax status. Year-by-year growth chart."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GST & TAX HUB - Indian tax compliance and planning tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "tds-finder",
    name: "TDS Rate Finder",
    category: "GST & Tax",
    href: "/tools/gst-tax/tds-finder",
    icon: "Percent",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Find TDS rates for any payment type — salary, rent, professional fees, contracts. Section-wise thresholds."
  },
  {
    id: "deduction-tracker",
    name: "Deduction Tracker",
    category: "GST & Tax",
    href: "/tools/gst-tax/deduction-tracker",
    icon: "ShieldCheck",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Track 80C, 80D, 80CCD, HRA, and all deductions to plan your ITR and maximize tax savings."
  },
  {
    id: "tax-calendar",
    name: "Tax Calendar",
    category: "GST & Tax",
    href: "/tools/gst-tax/tax-calendar",
    icon: "CalendarDays",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Never miss a tax deadline. Advance tax, TDS, GST returns, ITR filing — all dates in one place."
  },
  {
    id: "advance-tax-calc",
    name: "Advance Tax Calculator",
    category: "GST & Tax",
    href: "/tools/gst-tax/advance-tax-calc",
    icon: "Calculator",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Calculate advance tax instalments due in June, September, December, and March quarters."
  },
  {
    id: "income-tax-calc",
    name: "Income Tax Calculator",
    category: "GST & Tax",
    href: "/tools/gst-tax/income-tax-calc",
    icon: "IndianRupee",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Old vs New regime comparison for FY 2024-25. HRA, 80C/D/CCD deductions, 87A rebate, surcharge, and cess."
  },
  {
    id: "itr-checklist",
    name: "ITR Filing Checklist",
    category: "GST & Tax",
    href: "/tools/gst-tax/itr-checklist",
    icon: "ListChecks",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Personalised ITR document checklist. Select your income types, track what you have, and get the right ITR form."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REAL ESTATE - Property buying, renting, and investment tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "home-loan-emi",
    name: "Home Loan & Prepayment",
    category: "Real Estate",
    href: "/tools/real-estate/home-loan-emi",
    icon: "Building2",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "EMI breakdown, amortisation schedule, and prepayment impact — see how extra payments slash your loan tenure."
  },
  {
    id: "rent-vs-buy",
    name: "Rent vs Buy",
    category: "Real Estate",
    href: "/tools/real-estate/rent-vs-buy",
    icon: "Home",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "10-year breakeven analysis comparing renting vs buying. Includes opportunity cost of down payment."
  },
  {
    id: "rental-yield",
    name: "Rental Yield Calculator",
    category: "Real Estate",
    href: "/tools/real-estate/rental-yield",
    icon: "TrendingUp",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Calculate gross and net rental yield. Compare against FD / equity returns to evaluate property investment."
  },
  {
    id: "stamp-duty",
    name: "Stamp Duty Calculator",
    category: "Real Estate",
    href: "/tools/real-estate/stamp-duty",
    icon: "MapPin",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "State-wise stamp duty and registration charges. Know the full cost of buying property in any Indian state."
  },
  {
    id: "property-budget",
    name: "Property Affordability",
    category: "Real Estate",
    href: "/tools/real-estate/property-budget",
    icon: "Wallet",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "How much property can you afford? EMI-to-income ratio, down payment, and stamp duty all factored in."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CAREER - Job, salary, and work-life tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "job-offer-compare",
    name: "Job Offer Comparator",
    category: "Career",
    href: "/tools/career/job-offer-compare",
    icon: "Briefcase",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Compare two job offers side-by-side — CTC, take-home, growth, perks, and a final score card."
  },
  {
    id: "freelance-rate",
    name: "Freelance Rate Calculator",
    category: "Career",
    href: "/tools/career/freelance-rate",
    icon: "CircleDollarSign",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Calculate your minimum viable hourly/daily rate as a freelancer, accounting for taxes and expenses."
  },
  {
    id: "fnf-calculator",
    name: "Full & Final Settlement",
    category: "Career",
    href: "/tools/career/fnf-calculator",
    icon: "FileCheck",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Calculate your FnF payout — notice period pay, gratuity eligibility, leave balance, and deductions."
  },
  {
    id: "wfh-savings",
    name: "WFH Savings Estimator",
    category: "Career",
    href: "/tools/career/wfh-savings",
    icon: "Laptop",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "See how much you save working from home vs office — commute, food, wardrobe, and time."
  },
  {
    id: "salary-history",
    name: "Salary Growth Tracker",
    category: "Career",
    href: "/tools/career/salary-history",
    icon: "TrendingUp",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Log your salary history and see real growth after inflation. Are you actually earning more?"
  },
  {
    id: "esop-value-calc",
    name: "ESOP / RSU Calculator",
    category: "Career",
    href: "/tools/career/esop-value-calc",
    icon: "Gauge",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Value your ESOPs and RSUs. Vesting schedule, cliff, pre/post-tax value, and expected value at exit."
  },
  {
    id: "career-roi-calc",
    name: "Career Investment ROI",
    category: "Career",
    href: "/tools/career/career-roi-calc",
    icon: "GraduationCap",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Should you do an MBA or certification? Calculate payback period, NPV, and 10-year earnings difference."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STARTUP - Founder & freelancer financial tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "burn-rate",
    name: "Burn Rate & Runway",
    category: "Startup",
    href: "/tools/startup/burn-rate",
    icon: "Rocket",
    popular: true,
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Track monthly burn, runway, and when you'll run out of cash. Plan your next fundraise."
  },
  {
    id: "equity-dilution",
    name: "Equity Dilution Simulator",
    category: "Startup",
    href: "/tools/startup/equity-dilution",
    icon: "Users",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Simulate cap table dilution across funding rounds. See founder, investor, and ESOP stakes."
  },
  {
    id: "saas-metrics",
    name: "SaaS Metrics Dashboard",
    category: "Startup",
    href: "/tools/startup/saas-metrics",
    icon: "BarChart3",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "MRR, ARR, LTV, CAC, churn, and payback period — all key SaaS metrics in one dashboard."
  },
  {
    id: "project-pricing",
    name: "Project Pricing Calculator",
    category: "Startup",
    href: "/tools/startup/project-pricing",
    icon: "CircleDollarSign",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Price any project or freelance engagement — time + costs + margin + GST, with client quote output."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRAVEL - Trip planning and vehicle cost tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "trip-budget",
    name: "Trip Budget Planner",
    category: "Travel",
    href: "/tools/travel/trip-budget",
    icon: "Plane",
    popular: true,
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "Plan your trip budget by category — flights, stays, food, activities, and shopping. Per-person split."
  },
  {
    id: "road-trip",
    name: "Road Trip Cost Calculator",
    category: "Travel",
    href: "/tools/travel/road-trip",
    icon: "Car",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Calculate fuel cost for any road trip. Distance, mileage, fuel price — exact cost per person."
  },
  {
    id: "forex-calc",
    name: "Forex & Travel Money",
    category: "Travel",
    href: "/tools/travel/forex-calc",
    icon: "Globe",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Convert travel budget to foreign currency. Compare card vs cash vs forex card with fees."
  },
  {
    id: "ev-vs-petrol",
    name: "EV vs Petrol Cost",
    category: "Travel",
    href: "/tools/travel/ev-vs-petrol",
    icon: "Fuel",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Total cost of ownership comparison — purchase price, fuel/electricity, maintenance over 5 years."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONAL CRM - Local-first relationship manager
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "crm-people",
    name: "People & Relationships",
    category: "Personal CRM",
    href: "/tools/personal-crm/crm-people",
    icon: "Users",
    popular: false,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Track your relationships, log interactions, and never lose touch with the people who matter. Local, private, no accounts."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS CRM - Deal pipeline and follow-up tracker
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "biz-crm-pipeline",
    name: "Business CRM",
    category: "Business CRM",
    href: "/tools/business-crm/biz-crm-pipeline",
    icon: "Briefcase",
    popular: false,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Track deals, follow-ups, and client relationships. Pipeline board with deal stages and dated action items."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS OS - Operating system for small businesses (3-anchor model)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "biz-dashboard",
    name: "Business Dashboard",
    category: "Business OS",
    href: "/tools/business-os/biz-dashboard",
    icon: "LayoutDashboard",
    popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "CEO view: daily sales, expenses, profit, pending payments, and low-stock alerts in one place."
  },
  {
    id: "biz-daybook",
    name: "Daybook",
    category: "Business OS",
    href: "/tools/business-os/biz-daybook",
    icon: "BookOpen",
    popular: false,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Quick income and expense entry. Log every rupee in seconds, linked to customers and vendors."
  },
  {
    id: "biz-parties",
    name: "Party Register",
    category: "Business OS",
    href: "/tools/business-os/biz-parties",
    icon: "Users",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Khata-style ledger for all customers, vendors, and employees with running balances."
  },
  {
    id: "biz-inventory",
    name: "Inventory Manager",
    category: "Business OS",
    href: "/tools/business-os/biz-inventory",
    icon: "Package",
    popular: false,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Product catalog with live stock levels, low-stock alerts, and supplier tracking."
  },
  {
    id: "biz-invoices",
    name: "Invoice Manager",
    category: "Business OS",
    href: "/tools/business-os/biz-invoices",
    icon: "Receipt",
    popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Create GST invoices, track payment status, and auto-record payments in your daybook."
  },
  {
    id: "biz-reports",
    name: "Business Reports",
    category: "Business OS",
    href: "/tools/business-os/biz-reports",
    icon: "BarChart3",
    popular: false,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "P&L statement, expense breakdown, top customers, top products, and monthly trends."
  },
  {
    id: "biz-products",
    name: "Product Catalog",
    category: "Business OS",
    href: "/tools/business-os/biz-products",
    icon: "Package",
    popular: false,
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Manage your full product catalog. Add products manually or bulk-import from a CSV spreadsheet."
  },
  {
    id: "biz-stock-entry",
    name: "Stock Entry",
    category: "Business OS",
    href: "/tools/business-os/biz-stock-entry",
    icon: "ArrowRightLeft",
    popular: false,
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Record goods received and dispatched. Auto-updates stock and posts to your Daybook."
  },
  {
    id: "biz-outstanding",
    name: "Outstanding Tracker",
    category: "Business OS",
    href: "/tools/business-os/biz-outstanding",
    icon: "Clock",
    popular: true,
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Track who owes you money. Aging analysis, overdue alerts, and WhatsApp reminder generator."
  },
  {
    id: "biz-purchases",
    name: "Purchase Bills",
    category: "Business OS",
    href: "/tools/business-os/biz-purchases",
    icon: "ShoppingBag",
    popular: false,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Record vendor invoices, track payables, and monitor input tax credit (ITC) for GST filing."
  },
  {
    id: "biz-quotations",
    name: "Quotations",
    category: "Business OS",
    href: "/tools/business-os/biz-quotations",
    icon: "FileCheck",
    popular: false,
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "Create estimates and quotations. Track win/loss rate and convert accepted quotes to invoices."
  },
  {
    id: "biz-staff",
    name: "Staff & Payroll",
    category: "Business OS",
    href: "/tools/business-os/biz-staff",
    icon: "Users",
    popular: false,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Manage employees, mark daily attendance, calculate monthly salary with PF/ESI deductions."
  },
  {
    id: "biz-gst",
    name: "GST Helper",
    category: "Business OS",
    href: "/tools/business-os/biz-gst",
    icon: "FileText",
    popular: false,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "Prepare GSTR-1 and GSTR-3B data. Track output tax, ITC, and net GST payable each month."
  },
  {
    id: "biz-cashflow",
    name: "Cash Flow",
    category: "Business OS",
    href: "/tools/business-os/biz-cashflow",
    icon: "TrendingUp",
    popular: false,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "30/60/90-day cash flow forecast based on outstanding invoices and pending purchase bills."
  },
  {
    id: "biz-loans",
    name: "Loans & EMI",
    category: "Business OS",
    href: "/tools/business-os/biz-loans",
    icon: "CreditCard",
    popular: false,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Track all business loans, view full EMI schedules, and mark monthly payments."
  },
  {
    id: "biz-reconcile",
    name: "Bank Reconciliation",
    category: "Business OS",
    href: "/tools/business-os/biz-reconcile",
    icon: "GitMerge",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Match bank statement entries to daybook records. Identify missing transactions and reconcile discrepancies."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS (Blue/Indigo) - Professional document generators
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "invoice-generator",
    name: "Pro Invoice Studio",
    category: "Business",
    href: "/tools/business/invoice-generator",
    icon: "FileText",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Create professional GST invoices with customizable templates, auto-calculations, and PDF export."
  },
  {
    id: "salary-slip",
    name: "Salary Slip Studio",
    category: "Business",
    href: "/tools/business/salary-slip",
    icon: "FileText",
    popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Generate detailed salary slips with earnings, deductions, and compliance-ready formatting."
  },
  {
    id: "smart-agreement",
    name: "Legal Contract Studio",
    category: "Business",
    href: "/tools/business/smart-agreement",
    icon: "Shield",
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Create NDAs, service agreements, and legal contracts with customizable templates."
  },
  {
    id: "id-card",
    name: "ID Card Creator",
    category: "Business",
    href: "/tools/business/id-card",
    icon: "User",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Design professional employee ID cards with photo upload, QR codes, and custom branding."
  },
  {
    id: "rent-receipt",
    name: "Rent Receipt Generator",
    category: "Business",
    href: "/tools/business/rent-receipt",
    icon: "Home",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Generate rent receipts for HRA claims with landlord details and revenue stamps."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOCUMENTS (Amber/Rose) - File conversion and processing
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "universal-converter",
    name: "Universal Converter",
    category: "Documents",
    href: "/tools/documents/universal-converter",
    icon: "RefreshCw",
    popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Convert between 50+ file formats including documents, images, audio, and video files."
  },
  {
    id: "smart-scan",
    name: "Smart Scan",
    category: "Documents",
    href: "/tools/documents/smart-scan",
    icon: "ScanLine",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300",
    desc: "Scan documents with your camera, auto-crop, enhance quality, and save as PDF."
  },
  {
    id: "smart-pdf-merge",
    name: "PDF Workbench",
    category: "Documents",
    href: "/tools/documents/smart-pdf-merge",
    icon: "Layers",
    popular: true,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Merge, combine, and organize multiple PDFs into a single document with page reordering."
  },
  {
    id: "smart-pdf-split",
    name: "PDF Splitter",
    category: "Documents",
    href: "/tools/documents/smart-pdf-split",
    icon: "Scissors",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Split PDFs by page ranges, extract specific pages, or separate into individual files."
  },
  {
    id: "smart-img-compress",
    name: "Image Compressor",
    category: "Documents",
    href: "/tools/documents/smart-img-compress",
    icon: "Minimize",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Compress images up to 90% smaller while maintaining quality. Batch process multiple files."
  },
  {
    id: "smart-img-convert",
    name: "Image Converter",
    category: "Documents",
    href: "/tools/documents/smart-img-convert",
    icon: "Image",
    color: "text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-400",
    desc: "Convert images between PNG, JPG, WebP, GIF, and other formats with quality control."
  },
  {
    id: "smart-ocr",
    name: "Smart OCR",
    category: "Documents",
    href: "/tools/documents/smart-ocr",
    icon: "FileType",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Extract text from images and scanned documents with high accuracy OCR technology."
  },
  {
    id: "smart-word",
    name: "Markdown Studio",
    category: "Documents",
    href: "/tools/documents/smart-word",
    icon: "Code2",
    color: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Write and preview Markdown with live rendering, export to HTML, PDF, or Word."
  },
  {
    id: "smart-excel",
    name: "Data Studio (CSV)",
    category: "Documents",
    href: "/tools/documents/smart-excel",
    icon: "Grid",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Edit, filter, and transform CSV data with spreadsheet-like interface and formulas."
  },
  {
    id: "json-csv",
    name: "JSON ↔ CSV Converter",
    category: "Documents",
    href: "/tools/documents/json-csv",
    icon: "Table",
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    desc: "Convert between JSON and CSV formats with nested object support and custom mapping."
  },
  {
    id: "self-serve-analytics",
    name: "CSV Chart Builder",
    category: "Documents",
    href: "/tools/documents/self-serve-analytics",
    icon: "BarChart3",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Paste any CSV data and instantly visualize with bar, line, pie, and area charts. Stats, summaries, and exports included."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEVELOPER (Violet/Purple) - Coding and development utilities
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "dev-station",
    name: "DevStation Pro",
    category: "Developer",
    href: "/tools/developer/dev-station",
    icon: "Terminal",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "All-in-one developer toolkit with encoders, formatters, generators, and debugging tools."
  },
  {
    id: "api-playground",
    name: "API Playground",
    category: "Developer",
    href: "/tools/developer/api-playground",
    icon: "Globe",
    popular: true,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300",
    desc: "Test REST APIs with custom headers, authentication, and response visualization."
  },
  {
    id: "smart-jwt",
    name: "JWT Debugger",
    category: "Developer",
    href: "/tools/developer/smart-jwt",
    icon: "Key",
    color: "text-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300",
    desc: "Decode, verify, and debug JWT tokens with payload inspection and signature validation."
  },
  {
    id: "smart-json",
    name: "JSON Editor",
    category: "Developer",
    href: "/tools/developer/smart-json",
    icon: "Braces",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "Format, validate, and edit JSON with syntax highlighting, tree view, and error detection."
  },
  {
    id: "smart-sql",
    name: "SQL Formatter",
    category: "Developer",
    href: "/tools/developer/smart-sql",
    icon: "Database",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Format and beautify SQL queries with customizable indentation and keyword casing."
  },
  {
    id: "cron-gen",
    name: "Cron Generator",
    category: "Developer",
    href: "/tools/developer/cron-gen",
    icon: "Clock",
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Build cron expressions with visual editor, preview next run times, and expression explanation."
  },
  {
    id: "git-cheats",
    name: "Git Commands",
    category: "Developer",
    href: "/tools/developer/git-cheats",
    icon: "Laptop",
    color: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Quick reference for Git commands with examples, explanations, and copy-to-clipboard."
  },
  {
    id: "smart-diff",
    name: "Text Diff",
    category: "Developer",
    href: "/tools/developer/smart-diff",
    icon: "Split",
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Compare two texts side-by-side with highlighted differences and merge suggestions."
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    category: "Developer",
    href: "/tools/developer/regex-tester",
    icon: "SearchCode",
    popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Test regular expressions live with match highlighting, group capture, and replace mode."
  },
  {
    id: "hash-gen",
    name: "Hash Generator",
    category: "Developer",
    href: "/tools/developer/hash-gen",
    icon: "Hash",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes for text or files."
  },
  {
    id: "num-convert",
    name: "Number Converter",
    category: "Developer",
    href: "/tools/developer/num-convert",
    icon: "Binary",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Convert between Binary, Octal, Decimal, and Hexadecimal with bitwise operations."
  },
  {
    id: "timestamp-tool",
    name: "Timestamp Converter",
    category: "Developer",
    href: "/tools/developer/timestamp-tool",
    icon: "Timer",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Convert Unix timestamps to human dates and vice versa with multi-timezone support."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCTIVITY (Rose/Slate) - Daily productivity tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "life-os",
    name: "Life OS Planner",
    category: "Productivity",
    href: "/tools/productivity/life-os",
    icon: "Calendar",
    popular: true,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Organize your life with goals, habits, tasks, and calendar integration in one place."
  },
  {
    id: "qr-code",
    name: "QR Code Generator",
    category: "Productivity",
    href: "/tools/productivity/qr-code",
    icon: "QrCode",
    color: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Generate QR codes for URLs, text, WiFi, contacts, and more with custom styling."
  },
  {
    id: "smart-pass",
    name: "Password Generator",
    category: "Productivity",
    href: "/tools/productivity/smart-pass",
    icon: "Lock",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300",
    desc: "Create strong, secure passwords with customizable length, complexity, and character sets."
  },
  {
    id: "pomodoro",
    name: "Pomodoro Timer",
    category: "Productivity",
    href: "/tools/productivity/pomodoro",
    icon: "Timer",
    color: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-300",
    desc: "Boost focus with 25-minute work sessions, breaks, and productivity tracking."
  },
  {
    id: "habit-tracker",
    name: "Habit Tracker",
    category: "Productivity",
    href: "/tools/productivity/habit-tracker",
    icon: "Target",
    popular: true,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "Build habits with a 21-day calendar grid. Track streaks, daily completion rate, and 7-day average."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERTERS (Cyan/Orange) - Unit and format conversion
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "unit-convert",
    name: "Unit Converter",
    category: "Converters",
    href: "/tools/converters/unit-convert",
    icon: "ArrowRightLeft",
    popular: true,
    color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-300",
    desc: "Convert length, weight, temperature, volume, area, and 20+ other measurement types."
  },
  {
    id: "case-convert",
    name: "Case Converter",
    category: "Converters",
    href: "/tools/converters/case-convert",
    icon: "Type",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "Transform text to uppercase, lowercase, title case, sentence case, and more."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DESIGN (Pink) - Visual design tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "color-picker",
    name: "Color Picker",
    category: "Design",
    href: "/tools/design/color-picker",
    icon: "Pipette",
    popular: true,
    color: "text-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300",
    desc: "Pick colors with HEX, RGB, HSL support, generate palettes, and check contrast ratios."
  },
  {
    id: "color-studio",
    name: "Gradient Studio",
    category: "Design",
    href: "/tools/design/color-studio",
    icon: "Layers",
    popular: false,
    color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300",
    desc: "Create beautiful linear, radial, and conic gradients with live preview, presets, and CSS export."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HEALTH (Teal/Sky) - Fitness and wellness tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "smart-bmi",
    name: "BMI Calculator",
    category: "Health",
    href: "/tools/health/smart-bmi",
    icon: "Scale",
    popular: true,
    color: "text-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-300",
    desc: "Calculate Body Mass Index with health category, ideal weight range, and recommendations."
  },
  {
    id: "smart-breath",
    name: "Box Breathing",
    category: "Health",
    href: "/tools/health/smart-breath",
    icon: "Wind",
    color: "text-sky-500 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-300",
    desc: "Guided breathing exercises for relaxation, stress relief, and improved focus."
  },
  {
    id: "smart-workout",
    name: "HIIT Timer",
    category: "Health",
    href: "/tools/health/smart-workout",
    icon: "Dumbbell",
    color: "text-lime-500 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-300",
    desc: "Customizable interval training timer with work/rest periods and audio cues."
  },
  {
    id: "calorie-calculator",
    name: "Calorie & Macro Calculator",
    category: "Health",
    href: "/tools/health/calorie-calculator",
    icon: "Utensils",
    popular: true,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "Calculate BMR, TDEE, and daily calorie target for weight loss/gain. With BMI and macro split (protein/carbs/fat)."
  },
  {
    id: "water-tracker",
    name: "Water Intake Tracker",
    category: "Health",
    href: "/tools/health/water-tracker",
    icon: "Droplets",
    color: "text-sky-500 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-300",
    desc: "Track daily water intake with a visual progress ring and 7-day streak chart. Set glass size and daily goals."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI (Violet/Purple) - AI-powered tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "prompt-generator",
    name: "AI Prompt Generator",
    category: "AI",
    href: "/tools/ai/prompt-generator",
    icon: "FileCode",
    popular: true,
    color: "text-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-300",
    desc: "Generate effective AI prompts for ChatGPT, Claude, and other LLMs with templates."
  },
  {
    id: "smart-chat",
    name: "AI Chat Assistant",
    category: "AI",
    href: "/tools/ai/smart-chat",
    icon: "Sparkles",
    color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300",
    desc: "Chat with AI for writing, coding, research, and creative tasks with conversation history."
  },
  {
    id: "smart-analyze",
    name: "Sentiment Analyzer",
    category: "AI",
    href: "/tools/ai/smart-analyze",
    icon: "BrainCircuit",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300",
    desc: "Analyze text sentiment, emotions, and tone for reviews, feedback, and social media."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATOR (Purple) - Content creation tools
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "audio-transcription",
    name: "Audio Transcription",
    category: "Creator",
    href: "/tools/creator/audio-transcription",
    icon: "Mic",
    popular: true,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Convert audio/video to text with speaker detection, timestamps, and content ideas."
  },
  {
    id: "video-downloader",
    name: "Video Downloader",
    category: "Creator",
    href: "/tools/creator/video-downloader",
    icon: "Download",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Download videos from YouTube, Instagram, Twitter/X, TikTok, Facebook, Reddit, Vimeo and more."
  },
  {
    id: "instagram-transcript",
    name: "Video to Transcript",
    category: "Creator",
    href: "/tools/creator/instagram-transcript",
    icon: "Video",
    popular: true,
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Upload a video or audio file — AI transcribes it with timestamps. Works with any downloaded video."
  }
];

// Helper to get tools by category
export function getToolsByCategory(category: string): Tool[] {
  return ALL_TOOLS.filter(tool => tool.category === category);
}

// Helper to get popular tools
export function getPopularTools(): Tool[] {
  return ALL_TOOLS.filter(tool => tool.popular);
}

// Helper to get all categories in order
export function getCategories(): string[] {
  return CATEGORY_ORDER.filter(cat =>
    ALL_TOOLS.some(tool => tool.category === cat)
  );
}

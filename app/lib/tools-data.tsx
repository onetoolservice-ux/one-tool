import type { IconName } from "./utils/icon-mapper";

export interface ToolHelpStep {
  title: string;
  description: string;
}

export interface ToolHelpTip {
  text: string;
}

export interface ToolHelpConfig {
  title: string;
  description: string;
  steps: ToolHelpStep[];
  tips?: ToolHelpTip[];
}

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
  helpConfig?: ToolHelpConfig;
}

// Category order for display
export const CATEGORY_ORDER = [
  "Personal Finance",
  "Finance",
  "GST & Tax",
  "Business OS",
  "Business",
  "Developer",
  "Productivity",
  "Documents",
  "Health",
  "Career",
  "Bio Data & Resume",
  "Real Estate",
  "Startup",
  "Travel",
  "Personal CRM",
  "Business CRM",
  "Converters",
  "Design",
  "AI",
  "Creator",
  "Writer's OS",
  "Daily Utility"
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
    desc: "Free bank statement analyzer — upload CSV from HDFC, SBI, ICICI, Axis, Kotak. Auto-parse transactions, map columns, and unlock all Personal Finance tools. No signup, 100% local.",
    helpConfig: {
      title: "Statement Manager",
      description: "Import your bank and credit card statements to unlock all Personal Finance tools. All data stays in your browser — nothing is sent to any server.",
      steps: [
        { title: "Add an Account", description: "Click 'Add Account' and give it a name (e.g. HDFC Salary), type (Bank / Credit Card / Cash), and currency." },
        { title: "Select Account & Upload", description: "Select your account from the dropdown, then upload a CSV or Excel file exported from your bank's net banking portal." },
        { title: "Map Columns", description: "Tell the tool which column is the Date, Amount, and Description. Required fields are marked with *." },
        { title: "Check Data Integrity", description: "Review the integrity score. Below 80% means some transactions may have missing dates or invalid amounts." },
        { title: "Preview & Import", description: "See the first 10 rows. If everything looks right, click Import. Duplicates are skipped automatically." },
      ],
      tips: [
        { text: "Export your bank statement as CSV/Excel from net banking → Account Statement section." },
        { text: "Enable 'Skip Duplicates' when uploading overlapping date ranges to avoid counting the same transaction twice." },
        { text: "If dates parse incorrectly, try re-exporting as CSV (not Excel) from your bank portal." },
      ],
    },
  },
  {
    id: "pf-financial-position",
    name: "Financial Position",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-financial-position",
    icon: "Wallet",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Personal net financial position for any period — total income, total outflows, net surplus, savings rate, commitment ratio, and debt servicing ratio from your bank statements."
  },
  {
    id: "pf-cash-flow",
    name: "Income",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-cash-flow",
    icon: "TrendingUp",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Structured income and outflow statement from your bank statements. Compare any two periods, track net closing position, and understand cash inflows vs total outflows at a glance."
  },
  {
    id: "pf-tx-explorer",
    name: "Transaction Explorer",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-tx-explorer",
    icon: "Table",
    color: "text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400",
    desc: "Full searchable transaction ledger from all your bank accounts. Filter by date, merchant, amount, or category. Reclassify and bulk-tag transactions, then export to CSV."
  },
  {
    id: "pf-expenses",
    name: "Expenses",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-expenses",
    icon: "TrendingDown",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Searchable expense ledger from your bank statements. Filter by statement, date, amount, and category. Reclassify transactions, bulk-tag, and export to CSV. Free, no signup."
  },
  {
    id: "pf-expenditure",
    name: "Manage Expenses",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-expenditure",
    icon: "BarChart3",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Category-wise spending breakdown with month-on-month comparison. Rename, merge, and add custom categories. Identify exactly where your money goes — by category, merchant, or month."
  },
  {
    id: "pf-commitments",
    name: "Commitments Register",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-commitments",
    icon: "RefreshCw",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Auto-detect all fixed monthly obligations — EMIs, rent, SIPs, and subscriptions — directly from your bank statements. Confirm, dismiss, or add manual commitments. Know your real monthly commitment burden."
  },
  {
    id: "pf-recurring",
    name: "Recurring Payments",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-recurring",
    icon: "Repeat2",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Identify all recurring debits grouped by merchant from your bank statements. Auto-detect subscriptions, SIPs, standing instructions, and regular payments. Bulk-assign categories instantly."
  },
  {
    id: "pf-top-merchants",
    name: "Top Merchants",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-top-merchants",
    icon: "Trophy",
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    desc: "Merchant leaderboard ranked by total spend from your bank statements. Instantly see which stores, apps, and vendors cost you the most — with inline category assignment."
  },
  {
    id: "pf-big-spends",
    name: "Big Spends",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-big-spends",
    icon: "Zap",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Spot all large transactions above a custom threshold in your bank statements. Review high-value one-off purchases by period, category, or merchant — identify unusual big spends at a glance."
  },
  {
    id: "pf-rules",
    name: "Category Rules",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-rules",
    icon: "Wand2",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Create keyword-based auto-categorization rules that apply to all your bank statement transactions. Set conditions by merchant name, amount range, or transaction type — categorize automatically, permanently."
  },
  {
    id: "pf-income-sources",
    name: "Income Sources",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-income-sources",
    icon: "CircleDollarSign",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Break down all credit transactions by income source — salary, freelance income, UPI receipts, interest, and refunds. Understand exactly what money is coming in and from where."
  },
  {
    id: "pf-daily-pulse",
    name: "Daily Transaction Pulse",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-daily-pulse",
    icon: "BarChart3",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Analyze daily spending habits from bank statements — average daily spend, transactions per day, weekday vs weekend patterns, monthly trends, and top 5 highest-spend days. Understand your daily money pulse.",
    helpConfig: {
      title: "Daily Transaction Pulse",
      description: "Understand your daily spending habits — average spend per day, busiest day of the week, and month-level breakdowns.",
      steps: [
        { title: "Upload statements first", description: "Go to Statement Manager and import at least one bank or credit card statement." },
        { title: "Select a period", description: "Use the Period filter to choose a time range — Last 3 Months is a good starting point." },
        { title: "Explore daily patterns", description: "See your average daily spend, most active day of the week, and top 5 highest-spend days." },
        { title: "Compare months", description: "Scroll to the Monthly Breakdown table to compare spending across months side-by-side." },
      ],
      tips: [
        { text: "Set a budget in Budget vs Actual to see your daily budget target shown alongside actual spend." },
        { text: "Click a row in 'Top 5 Highest Spend Days' to see every transaction from that day." },
        { text: "Rest Days (₹0 spend) are tracked as a KPI — useful for no-spend day streaks." },
      ],
    },
  },
  {
    id: "pf-behavior",
    name: "Spending Behavior",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-behavior",
    icon: "Activity",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Discover when you spend the most — day-of-week and day-of-month spending heatmaps reveal behavioral patterns hidden in your bank data. Understand impulse vs planned spending habits."
  },
  {
    id: "pf-savings-trend",
    name: "Savings Trend",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-savings-trend",
    icon: "TrendingUp",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "Track your savings rate month by month from actual bank statement data. See surplus vs deficit trends over time and find out if your financial discipline is genuinely improving."
  },
  {
    id: "pf-month-compare",
    name: "Month Comparison",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-month-compare",
    icon: "ArrowLeftRight",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Compare spending between any two months side-by-side — full category breakdown, MoM change in rupees and percentage. Instantly see which expense categories went up or down."
  },
  {
    id: "pf-heatmap",
    name: "Spending Heatmap",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-heatmap",
    icon: "CalendarDays",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "GitHub-style calendar heatmap of your daily spending intensity. Spot high-spend days at a glance and drill into every transaction from that date. Visual spending history at scale."
  },
  {
    id: "pf-subscriptions",
    name: "Subscription Finder",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-subscriptions",
    icon: "Radio",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Auto-detect all subscriptions in your bank statements — Netflix, Spotify, Amazon Prime, SIPs, insurance premiums. See total monthly and annual subscription cost. Find subscriptions you forgot you're paying for."
  },
  {
    id: "pf-labels",
    name: "Label Manager",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-labels",
    icon: "Tags",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Create custom color-coded labels and assign them to any bank transactions. Build your own tagging system — tag trips, business expenses, medical costs — and filter your data any way you want."
  },
  {
    id: "pf-liability",
    name: "Liability Ledger",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-liability",
    icon: "Landmark",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Identify all loan EMI obligations from your bank statement transactions. See estimated monthly debt burden, EMI-to-income ratio, and grouped loan ledger — without entering data manually."
  },
  {
    id: "pf-ai-analyst",
    name: "AI Financial Analyst",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-ai-analyst",
    icon: "Brain",
    popular: true,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "AI-powered financial analyst that reads your bank statements — automatically detects spending anomalies, predicts next month's expenses, and delivers personalized money-saving recommendations. No data leaves your browser."
  },
  {
    id: "pf-health-score",
    name: "Financial Health Score",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-health-score",
    icon: "ShieldCheck",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Score your financial fitness across 5 dimensions — savings rate, debt burden, emergency fund, insurance coverage, and investment discipline. Get a personalized financial health score with actionable improvement tips."
  },
  {
    id: "pf-spending-dna",
    name: "Spending DNA",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-spending-dna",
    icon: "Dna",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Decode your money personality from real bank statement spending patterns. Discover your financial archetype — Spender, Saver, Investor, or Avoider — and get targeted insights to reshape your financial habits."
  },
  {
    id: "pf-investment-tracker",
    name: "Investment Portfolio Tracker",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-investment-tracker",
    icon: "TrendingUp",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Track all investments — stocks, mutual funds, gold, and crypto — with XIRR returns, asset allocation pie chart, and gain/loss analysis. No broker login needed. Free, local, no signup."
  },
  {
    id: "pf-budget-planner",
    name: "Monthly Budget Planner",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-budget-planner",
    icon: "Layers",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Zero-based monthly budget planner — allocate every rupee intentionally. Envelope system with traffic lights, spending velocity, savings goals with what-if simulator, day-by-day cash flow calendar, and 12-month year view. Plan your money, track your goals.",
    helpConfig: {
      title: "Monthly Budget Planner",
      description: "A zero-based budget planner where every rupee of income gets assigned a purpose. Plan envelopes, track live spend, set savings goals, and view your year at a glance.",
      steps: [
        { title: "Set Your Income", description: "Enter your expected monthly income in the Canvas tab. Enable Variable Income mode if your earnings fluctuate each month." },
        { title: "Choose a Template or Add Envelopes", description: "Pick from built-in templates (Balanced 50/30/20, Conservative Saver, Debt Destroyer) or add envelopes manually. Each envelope is one spending category." },
        { title: "Achieve Zero-Based", description: "Allocate until the Unallocated number reaches ₹0. Every rupee must have a job — including savings and investments." },
        { title: "Track in Envelopes Tab", description: "Import bank statements and sync actuals. Watch each envelope's traffic light — green (safe), amber (at risk), red (overspent). Move money between envelopes mid-month." },
        { title: "Set Savings Goals", description: "Create goals for your Emergency Fund, vacation, gadgets, or down payment. Use the What-If Simulator to see how different monthly contributions affect your ETA." },
      ],
      tips: [
        { text: "Use Smart Suggestions to auto-fill envelope budgets based on your last 3 months of actual spending." },
        { text: "Enable rollover on irregular envelopes (groceries, fuel) — unspent budget carries to next month." },
        { text: "The Breathing Room number shows what's truly discretionary after all committed expenses. This is your real financial freedom indicator." },
        { text: "Mark festival months (Diwali, Holi) with a flag to set context for higher shopping or travel budgets." },
        { text: "The Year View shows 12-month health scores at a glance — spot your best and worst months instantly." },
      ],
    },
  },
  {
    id: "pf-budget-vs-actual",
    name: "Budget vs Actual",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-budget-vs-actual",
    icon: "BarChart3",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Set monthly budgets per category and track actual spending from your bank statements. Progress bars, overspend alerts, and monthly variance charts. Know exactly which categories are over budget."
  },
  {
    id: "pf-financial-snapshot",
    name: "Financial Snapshot",
    category: "Personal Finance",
    href: "/tools/personal-finance/pf-financial-snapshot",
    icon: "LayoutDashboard",
    popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Single-screen overview of your complete financial life — income, expenses, investment portfolio, budget performance, and financial health score — all linked for instant drill-down. Your personal finance command center."
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
    desc: "Free monthly budget planner — set income, allocate to expense categories, track savings goals. Supports 50/30/20 budget rule. No signup, works entirely in your browser."
  },
  {
    id: "smart-loan",
    name: "Smart Loan Calculator",
    category: "Finance",
    href: "/tools/finance/smart-loan",
    icon: "Calculator",
    popular: true,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "EMI calculator for home, car, and personal loans — monthly payment, total interest payable, and full amortization schedule. Compare loan options and prepayment scenarios. Free, instant, India-ready."
  },
  {
    id: "smart-sip",
    name: "SIP Calculator",
    category: "Finance",
    href: "/tools/finance/smart-sip",
    icon: "TrendingUp",
    color: "text-lime-600 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-400",
    desc: "SIP calculator India — project mutual fund corpus at any monthly amount, expected return rate, and investment tenure. Compare lump sum vs SIP, plan wealth accumulation, and set goal-based SIP targets."
  },
  {
    id: "smart-net-worth",
    name: "Net Worth Tracker",
    category: "Finance",
    href: "/tools/finance/smart-net-worth",
    icon: "Landmark",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "Calculate and track your personal net worth — add bank balances, investments, property, loans, and credit card debt. Monitor total assets vs liabilities and watch your net worth grow over time."
  },
  {
    id: "smart-retirement",
    name: "Retirement Planner",
    category: "Finance",
    href: "/tools/finance/smart-retirement",
    icon: "Briefcase",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Retirement corpus calculator India — find how much you need to retire, monthly SIP required, and inflation-adjusted corpus target. Includes pension income, withdrawal rate strategy, and FIRE-age projection."
  },
  {
    id: "gst-calculator",
    name: "GST Calculator",
    category: "Finance",
    href: "/tools/finance/gst-calculator",
    icon: "Percent",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Free GST calculator India — add or remove 5%, 12%, 18%, 28% GST. Calculate CGST, SGST, IGST, inclusive and exclusive prices, and total tax amount. Instant results, no signup."
  },
  {
    id: "fire-calc",
    name: "FIRE Calculator",
    category: "Finance",
    href: "/tools/finance/fire-calc",
    icon: "Flame",
    popular: true,
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "FIRE calculator India — calculate your Financial Independence number, target retirement corpus, FIRE age, and monthly savings needed to retire early. Supports Lean FIRE, Fat FIRE, and Barista FIRE scenarios."
  },
  {
    id: "cost-of-delay",
    name: "Cost of Delay",
    category: "Finance",
    href: "/tools/finance/cost-of-delay",
    icon: "Clock",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "See the real compounding cost of delaying your investments — exact wealth lost for every year you wait. The most powerful motivator to start SIP or lump sum investing today, not tomorrow."
  },
  {
    id: "debt-planner",
    name: "Debt Planner",
    category: "Finance",
    href: "/tools/finance/debt-planner",
    icon: "CreditCard",
    popular: true,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Debt repayment planner — compare Snowball vs Avalanche strategy across all loans. Find the fastest, cheapest path to debt-free, total interest saved, and month-by-month payoff timeline."
  },
  {
    id: "portfolio-rebalance",
    name: "Portfolio Rebalancer",
    category: "Finance",
    href: "/tools/finance/portfolio-rebalance",
    icon: "BarChart3",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Portfolio rebalancer — track asset allocation drift across equity, debt, gold, and international. Get exact buy/sell amounts to restore your target allocation and keep your investment strategy on track."
  },
  {
    id: "ctc-calc",
    name: "CTC to In-hand",
    category: "Finance",
    href: "/tools/finance/ctc-calc",
    icon: "IndianRupee",
    popular: true,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "CTC to in-hand salary calculator India — convert annual CTC to exact monthly take-home. Old vs new tax regime comparison, EPF, HRA, standard deduction, 87A rebate, and all deductions included."
  },
  {
    id: "hra-calc",
    name: "HRA Exemption",
    category: "Finance",
    href: "/tools/finance/hra-calc",
    icon: "Home",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "HRA exemption calculator India — compute exact HRA amount exempt from income tax under Section 10(13A). Uses the three-condition minimum method with metro/non-metro rates. Free, instant."
  },
  {
    id: "gratuity-calc",
    name: "Gratuity & Leave Encashment",
    category: "Finance",
    href: "/tools/finance/gratuity-calc",
    icon: "Award",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Gratuity calculator India — compute your gratuity payout under the Payment of Gratuity Act based on salary and years of service. Also calculates leave encashment for your notice period or resignation."
  },
  {
    id: "capital-gains-calc",
    name: "Capital Gains Tax",
    category: "Finance",
    href: "/tools/finance/capital-gains-calc",
    icon: "TrendingUp",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Capital gains tax calculator India FY 2024-25 — compute STCG and LTCG on stocks, mutual funds, gold, and property. Includes indexation benefit, surcharge, and updated Budget 2024 tax rates."
  },
  {
    id: "tax-saving-compare",
    name: "NPS vs PPF vs ELSS",
    category: "Finance",
    href: "/tools/finance/tax-saving-compare",
    icon: "Scale",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Compare NPS vs PPF vs ELSS side-by-side — projected corpus, 80C tax savings, lock-in period, liquidity, and exit conditions. Find the best 80C investment for your tax planning goals."
  },
  {
    id: "sub-audit",
    name: "Subscription Audit",
    category: "Finance",
    href: "/tools/finance/sub-audit",
    icon: "Radio",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Subscription audit tool — list all your paid apps, OTT platforms, and tools. Flag rarely-used subscriptions, calculate true monthly and annual cost, and identify what to cancel immediately."
  },
  {
    id: "wedding-budget",
    name: "Wedding Budget Planner",
    category: "Finance",
    href: "/tools/finance/wedding-budget",
    icon: "Heart",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Wedding budget planner India — plan every rupee across venue, catering, photography, decoration, and outfits. Track budgeted vs actual spend per category. No surprise overspend on your big day."
  },
  {
    id: "salary-nego",
    name: "Salary Negotiation",
    category: "Finance",
    href: "/tools/finance/salary-nego",
    icon: "Briefcase",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Salary negotiation calculator India — compare two CTC offers and see the exact take-home difference after taxes, EPF, and deductions. Know the real rupee value of any salary hike before you negotiate."
  },
  {
    id: "fd-calculator",
    name: "FD / RD Calculator",
    category: "Finance",
    href: "/tools/finance/fd-calculator",
    icon: "PiggyBank",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "FD and RD maturity calculator India — compute Fixed Deposit and Recurring Deposit returns with TDS deduction, senior citizen preferential rates, and year-wise growth chart. Compare bank FD options."
  },
  {
    id: "nps-calculator",
    name: "NPS Calculator",
    category: "Finance",
    href: "/tools/finance/nps-calculator",
    icon: "Coins",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "NPS calculator India — project National Pension Scheme corpus at retirement based on monthly contribution, equity/debt allocation, and expected returns. See annuity income and 80CCD(1B) tax benefit calculation."
  },
  {
    id: "ppf-calculator",
    name: "PPF Calculator",
    category: "Finance",
    href: "/tools/finance/ppf-calculator",
    icon: "Droplets",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "PPF calculator India — compute Public Provident Fund maturity amount over 15 years with optional extension blocks. EEE tax-exempt status, year-by-year balance chart, and partial withdrawal projections."
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
    desc: "TDS rate finder India — look up TDS percentage for salary, rent, professional fees, commission, contracts, and interest. Section-wise thresholds and applicable limits for FY 2024-25. Free, instant."
  },
  {
    id: "deduction-tracker",
    name: "Deduction Tracker",
    category: "GST & Tax",
    href: "/tools/gst-tax/deduction-tracker",
    icon: "ShieldCheck",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Income tax deduction tracker India — log investments and expenses under 80C, 80D, 80CCD(1B), HRA, NPS, and all sections. Track limit utilization, remaining 80C headroom, and maximize ITR savings for FY 2024-25."
  },
  {
    id: "tax-calendar",
    name: "Tax Calendar",
    category: "GST & Tax",
    href: "/tools/gst-tax/tax-calendar",
    icon: "CalendarDays",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Indian tax compliance calendar FY 2024-25 — advance tax due dates, TDS deposit deadlines, GST return dates (GSTR-1, GSTR-3B), and ITR filing last date. Never miss a tax deadline again."
  },
  {
    id: "advance-tax-calc",
    name: "Advance Tax Calculator",
    category: "GST & Tax",
    href: "/tools/gst-tax/advance-tax-calc",
    icon: "Calculator",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Advance tax calculator India — calculate installments due in June (15%), September (45%), December (75%), and March (100%) quarters. Avoid interest under Section 234B/234C with accurate quarterly estimates."
  },
  {
    id: "income-tax-calc",
    name: "Income Tax Calculator",
    category: "GST & Tax",
    href: "/tools/gst-tax/income-tax-calc",
    icon: "IndianRupee",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Income tax calculator India FY 2024-25 — old vs new tax regime comparison with HRA, 80C, 80D, 80CCD, standard deduction, 87A rebate, surcharge, and cess. Know your exact tax liability before filing ITR."
  },
  {
    id: "itr-checklist",
    name: "ITR Filing Checklist",
    category: "GST & Tax",
    href: "/tools/gst-tax/itr-checklist",
    icon: "ListChecks",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Personalised ITR filing checklist India — select your income sources (salary, freelance, capital gains, rental) to get the correct ITR form, complete document checklist, and track what you've gathered."
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
    desc: "Home loan EMI calculator India with prepayment analysis — full amortization schedule, total interest cost, and impact of lump sum or monthly prepayments. See exactly how extra payments reduce your loan tenure."
  },
  {
    id: "rent-vs-buy",
    name: "Rent vs Buy",
    category: "Real Estate",
    href: "/tools/real-estate/rent-vs-buy",
    icon: "Home",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Rent vs buy calculator India — 10-year financial breakeven analysis comparing renting vs buying a property. Accounts for EMI, opportunity cost of down payment, property appreciation, and rent escalation."
  },
  {
    id: "rental-yield",
    name: "Rental Yield Calculator",
    category: "Real Estate",
    href: "/tools/real-estate/rental-yield",
    icon: "TrendingUp",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Rental yield calculator India — compute gross and net rental yield for any property. Compare rental returns against FD interest rates and equity market returns to evaluate whether property investment makes sense."
  },
  {
    id: "stamp-duty",
    name: "Stamp Duty Calculator",
    category: "Real Estate",
    href: "/tools/real-estate/stamp-duty",
    icon: "MapPin",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Stamp duty calculator India — state-wise stamp duty and registration charges for property purchase. Covers Maharashtra, Delhi, Karnataka, UP, Tamil Nadu, and all major Indian states. Know your full property buying cost."
  },
  {
    id: "property-budget",
    name: "Property Affordability",
    category: "Real Estate",
    href: "/tools/real-estate/property-budget",
    icon: "Wallet",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Property affordability calculator India — find the maximum property you can realistically buy based on income, savings, EMI-to-income ratio, required down payment, stamp duty, and registration charges."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BIO DATA & RESUME - Bio data maker, resume builder, cover letter
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "biodata-maker",
    name: "Bio Data Maker",
    category: "Bio Data & Resume",
    href: "/tools/biodata/biodata-maker",
    icon: "User",
    popular: true,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Free Indian bio data maker — matrimonial bio data and job bio data with multiple templates, photo upload, and instant PDF download. 100% browser-based, no signup, no watermark."
  },
  {
    id: "resume-builder",
    name: "Resume Builder",
    category: "Bio Data & Resume",
    href: "/tools/biodata/resume-builder",
    icon: "FileText",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Free resume builder India — create a professional ATS-friendly resume with multiple templates, work experience, skills, projects and PDF export. No signup, no watermark."
  },
  {
    id: "cover-letter",
    name: "Cover Letter",
    category: "Bio Data & Resume",
    href: "/tools/biodata/cover-letter",
    icon: "Mail",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Free cover letter builder — write a professional job application cover letter in minutes with templates and instant PDF download."
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
    desc: "Job offer comparison tool India — compare two offers side-by-side on CTC, actual take-home salary, growth potential, perks, location, and work culture. Get a weighted score card to make a confident decision."
  },
  {
    id: "freelance-rate",
    name: "Freelance Rate Calculator",
    category: "Career",
    href: "/tools/career/freelance-rate",
    icon: "CircleDollarSign",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Freelance rate calculator India — find your minimum viable hourly and daily rate based on desired income, billable days, tax liability, and operating expenses. Price your freelance work with confidence."
  },
  {
    id: "fnf-calculator",
    name: "Full & Final Settlement",
    category: "Career",
    href: "/tools/career/fnf-calculator",
    icon: "FileCheck",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Full and Final settlement calculator India — compute your FnF payout including notice period pay or deduction, gratuity eligibility, earned leave encashment, and PF settlement. Know exactly what you're owed."
  },
  {
    id: "wfh-savings",
    name: "WFH Savings Estimator",
    category: "Career",
    href: "/tools/career/wfh-savings",
    icon: "Laptop",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "WFH savings estimator India — calculate annual savings from working at home vs office: commute costs, food, clothing, and time value. Use the numbers to negotiate better hybrid or remote work terms."
  },
  {
    id: "salary-history",
    name: "Salary Growth Tracker",
    category: "Career",
    href: "/tools/career/salary-history",
    icon: "TrendingUp",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Salary growth tracker India — log your salary history across jobs and see real purchasing power growth after inflation. Find out if you're actually earning more or just keeping up with rising prices."
  },
  {
    id: "esop-value-calc",
    name: "ESOP / RSU Calculator",
    category: "Career",
    href: "/tools/career/esop-value-calc",
    icon: "Gauge",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "ESOP and RSU calculator India — value your employee stock options with vesting schedule, cliff date, strike price, and current company valuation. See pre-tax and post-tax value, and expected payout at exit."
  },
  {
    id: "career-roi-calc",
    name: "Career Investment ROI",
    category: "Career",
    href: "/tools/career/career-roi-calc",
    icon: "GraduationCap",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Career investment ROI calculator India — compute payback period, NPV, and 10-year earnings difference for an MBA, certification, or course. Answer definitively: is further education worth the cost and opportunity cost?"
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
    desc: "Startup burn rate and runway calculator — track monthly cash burn, compute runway in months, and forecast your zero-cash date. Plan fundraising timelines with best/worst case scenarios. Essential for founders."
  },
  {
    id: "equity-dilution",
    name: "Equity Dilution Simulator",
    category: "Startup",
    href: "/tools/startup/equity-dilution",
    icon: "Users",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Equity dilution simulator for startups — model cap table across seed, Series A, and B rounds. See founder dilution percentage, investor stake, ESOP pool impact, and pre/post-money valuation at each stage."
  },
  {
    id: "saas-metrics",
    name: "SaaS Metrics Dashboard",
    category: "Startup",
    href: "/tools/startup/saas-metrics",
    icon: "BarChart3",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "SaaS metrics calculator — compute MRR, ARR, LTV, CAC, LTV:CAC ratio, churn rate, and payback period in one dashboard. Know your unit economics and identify which metrics to improve for sustainable growth."
  },
  {
    id: "project-pricing",
    name: "Project Pricing Calculator",
    category: "Startup",
    href: "/tools/startup/project-pricing",
    icon: "CircleDollarSign",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Project pricing calculator for freelancers and agencies — factor in time, direct costs, profit margin, and GST to arrive at the right client quote. Includes project estimate summary you can share with clients."
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
    desc: "Trip budget planner India — plan vacation expenses by category: flights, accommodation, food, activities, and shopping. Per-person cost split for group trips. Track budgeted vs actual spend on the go."
  },
  {
    id: "road-trip",
    name: "Road Trip Cost Calculator",
    category: "Travel",
    href: "/tools/travel/road-trip",
    icon: "Car",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Road trip fuel cost calculator India — enter distance, vehicle mileage, and petrol/diesel price to get exact total fuel cost and cost per person. Plan long drives from Mumbai, Delhi, Bangalore, or anywhere in India."
  },
  {
    id: "forex-calc",
    name: "Forex & Travel Money",
    category: "Travel",
    href: "/tools/travel/forex-calc",
    icon: "Globe",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Travel money calculator India — convert your INR travel budget to USD, EUR, GBP, or any currency. Compare credit card, cash, and forex card costs with fees and exchange rates to maximize every rupee abroad."
  },
  {
    id: "ev-vs-petrol",
    name: "EV vs Petrol Cost",
    category: "Travel",
    href: "/tools/travel/ev-vs-petrol",
    icon: "Fuel",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "EV vs petrol car cost comparison India — total cost of ownership over 5 years including purchase price, fuel vs electricity cost, maintenance, insurance, and resale value. Find out if an electric vehicle is worth buying in India."
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
    desc: "Personal CRM for relationship management — track contacts, log every interaction, set follow-up reminders, and add notes. Never lose touch with important people. 100% local, private, no account needed."
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
    desc: "Free business CRM for small teams — manage deals, client follow-ups, and relationships in a visual pipeline board. Track deal stages, expected value, and next action dates. No monthly fee, no login required."
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
    desc: "Business dashboard for small businesses India — real-time CEO view of today's sales, total expenses, gross profit, outstanding receivables, and low-stock alerts. Complete business pulse in one screen. Free, no login."
  },
  {
    id: "biz-daybook",
    name: "Daybook",
    category: "Business OS",
    href: "/tools/business-os/biz-daybook",
    icon: "BookOpen",
    popular: false,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Digital daybook for small businesses India — quickly log every income and expense entry in seconds, linked to customers and vendors. Works like a digital cash book (Roznamcha). Local, private, no server."
  },
  {
    id: "biz-parties",
    name: "Party Register",
    category: "Business OS",
    href: "/tools/business-os/biz-parties",
    icon: "Users",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Khata-style party ledger for small businesses India — track all customers, vendors, and employees with running balances. See total receivables and payables at a glance. Know exactly who owes you and who you owe.",
    helpConfig: {
      title: "Party Register",
      description: "Your Khata-style ledger for every customer, vendor, and employee. Track who owes you and who you owe — all in one place.",
      steps: [
        { title: "Add a Party", description: "Click 'Add Party' and enter the name, type (Customer / Vendor / Employee), phone, and GSTIN if available." },
        { title: "Open a Party's Ledger", description: "Click any party in the list to open their ledger — see all transactions, invoice history, and the running balance." },
        { title: "Record a Payment or Receipt", description: "Use 'Add Transaction' inside a party's ledger to log a payment you made or a receipt you collected." },
        { title: "Track Balances", description: "The Receivable and Payable KPIs at the top show total money owed to you and owed by you across all parties." },
      ],
      tips: [
        { text: "Add the GSTIN for customers and vendors to auto-populate it in GST invoices." },
        { text: "Use the search bar to find a party instantly by name or phone number." },
        { text: "A positive balance (green) means the party owes you; negative (red) means you owe them." },
      ],
    },
  },
  {
    id: "biz-inventory",
    name: "Inventory Manager",
    category: "Business OS",
    href: "/tools/business-os/biz-inventory",
    icon: "Package",
    popular: false,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Inventory management for small businesses India — product catalog with live stock levels, low-stock threshold alerts, supplier tracking, and cost/selling price management. No expensive software needed."
  },
  {
    id: "biz-invoices",
    name: "Invoice Manager",
    category: "Business OS",
    href: "/tools/business-os/biz-invoices",
    icon: "Receipt",
    popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "GST invoice manager for small businesses India — create GST-compliant invoices, track payment status (paid/pending/overdue), and auto-record received payments in your Daybook. Linked to Party Register and Inventory."
  },
  {
    id: "biz-reports",
    name: "Business Reports",
    category: "Business OS",
    href: "/tools/business-os/biz-reports",
    icon: "BarChart3",
    popular: false,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Business P&L and analytics for small businesses India — profit and loss statement, category-wise expense breakdown, top customers by revenue, top-selling products, and month-on-month income trends."
  },
  {
    id: "biz-products",
    name: "Product Catalog",
    category: "Business OS",
    href: "/tools/business-os/biz-products",
    icon: "Package",
    popular: false,
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Product catalog manager for small businesses India — add and manage all products with HSN codes, GST rates, unit of measure, and pricing. Bulk import from CSV. Linked to Inventory, Invoices, and Stock Entry."
  },
  {
    id: "biz-stock-entry",
    name: "Stock Entry",
    category: "Business OS",
    href: "/tools/business-os/biz-stock-entry",
    icon: "ArrowRightLeft",
    popular: false,
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Stock entry management India — record goods received (GRN) from vendors and goods dispatched to customers. Auto-updates live stock levels in Inventory and posts corresponding entries in your Daybook."
  },
  {
    id: "biz-outstanding",
    name: "Outstanding Tracker",
    category: "Business OS",
    href: "/tools/business-os/biz-outstanding",
    icon: "Clock",
    popular: true,
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Outstanding receivables tracker India — see all unpaid invoices with aging analysis (0-30, 30-60, 60+ days overdue). One-click WhatsApp payment reminder generator. Stop chasing payments manually."
  },
  {
    id: "biz-purchases",
    name: "Purchase Bills",
    category: "Business OS",
    href: "/tools/business-os/biz-purchases",
    icon: "ShoppingBag",
    popular: false,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Purchase bill management India — record vendor invoices, track accounts payable, and monitor eligible Input Tax Credit (ITC) for monthly GSTR-3B filing. Know exactly what you owe and what GST you can claim back."
  },
  {
    id: "biz-quotations",
    name: "Quotations",
    category: "Business OS",
    href: "/tools/business-os/biz-quotations",
    icon: "FileCheck",
    popular: false,
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "Quotation and estimate maker India — create professional client quotes, track acceptance and rejection rate, and convert approved quotations directly into GST invoices with one click. No duplication of effort."
  },
  {
    id: "biz-staff",
    name: "Staff & Payroll",
    category: "Business OS",
    href: "/tools/business-os/biz-staff",
    icon: "Users",
    popular: false,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Staff and payroll manager for small businesses India — maintain employee records, mark daily attendance, and calculate monthly salary with PF, ESI, and TDS deductions. Generate payslips automatically."
  },
  {
    id: "biz-gst",
    name: "GST Helper",
    category: "Business OS",
    href: "/tools/business-os/biz-gst",
    icon: "FileText",
    popular: false,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "GST filing helper for small businesses India — prepare GSTR-1 outward supply data and GSTR-3B summary from your invoices and purchase bills. Track output tax, ITC credits, and net GST payable each month."
  },
  {
    id: "biz-cashflow",
    name: "Cash Flow",
    category: "Business OS",
    href: "/tools/business-os/biz-cashflow",
    icon: "TrendingUp",
    popular: false,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Business cash flow forecast India — 30, 60, and 90-day projection based on outstanding receivable invoices and pending purchase bills. Know your future cash position and avoid cash crunches before they happen."
  },
  {
    id: "biz-loans",
    name: "Loans & EMI",
    category: "Business OS",
    href: "/tools/business-os/biz-loans",
    icon: "CreditCard",
    popular: false,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Business loan tracker India — record all business loans and credit lines, view complete EMI schedules, mark monthly payments, and track outstanding principal for each loan. Full debt picture for your business."
  },
  {
    id: "biz-reconcile",
    name: "Bank Reconciliation",
    category: "Business OS",
    href: "/tools/business-os/biz-reconcile",
    icon: "GitMerge",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Bank reconciliation tool for small businesses India — match bank statement entries with daybook records. Identify missing transactions, find discrepancies, and keep your books in sync with your actual bank balance."
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
    desc: "Free GST invoice generator India — create professional tax invoices with GSTIN, HSN codes, auto-calculated CGST/SGST/IGST, and PDF download. Multiple templates, no signup, no watermark."
  },
  {
    id: "salary-slip",
    name: "Salary Slip Studio",
    category: "Business",
    href: "/tools/business/salary-slip",
    icon: "FileText",
    popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Salary slip generator India free — create monthly payslips with basic pay, HRA, PF, ESI, TDS, and all allowances and deductions. Compliance-ready format, PDF download, no login required."
  },
  {
    id: "smart-agreement",
    name: "Legal Contract Studio",
    category: "Business",
    href: "/tools/business/smart-agreement",
    icon: "Shield",
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Legal contract generator India free — create NDAs, service agreements, freelance contracts, and rental agreements with India-specific templates. Customize clauses, download as PDF. No lawyer needed for standard documents."
  },
  {
    id: "id-card",
    name: "ID Card Creator",
    category: "Business",
    href: "/tools/business/id-card",
    icon: "User",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Employee ID card maker India free — design professional staff ID cards with photo upload, company logo, designation, QR code, and custom branding. Bulk generate and print-ready export. No design skills needed."
  },
  {
    id: "rent-receipt",
    name: "Rent Receipt Generator",
    category: "Business",
    href: "/tools/business/rent-receipt",
    icon: "Home",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Rent receipt generator India free — create valid rent receipts for HRA tax exemption claims with landlord details, tenant details, monthly rent amount, and revenue stamp placeholder. PDF download, no signup."
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
    desc: "Universal file converter online free — convert between 50+ formats: Word to PDF, PDF to Word, PNG to JPG, audio, video, and more. No file upload limit, no watermark, no signup. Works in your browser."
  },
  {
    id: "smart-scan",
    name: "Smart Scan",
    category: "Documents",
    href: "/tools/documents/smart-scan",
    icon: "ScanLine",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300",
    desc: "Document scanner online free — use your phone camera or webcam to scan documents, auto-crop borders, enhance contrast and brightness, and save as PDF. No app download, no signup, works in any browser."
  },
  {
    id: "smart-pdf-merge",
    name: "PDF Workbench",
    category: "Documents",
    href: "/tools/documents/smart-pdf-merge",
    icon: "Layers",
    popular: true,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Merge PDF files online free — combine multiple PDFs into one document, reorder pages with drag-and-drop, and download instantly. No signup, no watermark, no file size limit. Works entirely in your browser."
  },
  {
    id: "smart-pdf-split",
    name: "PDF Splitter",
    category: "Documents",
    href: "/tools/documents/smart-pdf-split",
    icon: "Scissors",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Split PDF online free — extract specific pages, split by custom page ranges, or separate every page into individual files. No signup, no watermark, instant download. Runs entirely in your browser."
  },
  {
    id: "smart-img-compress",
    name: "Image Compressor",
    category: "Documents",
    href: "/tools/documents/smart-img-compress",
    icon: "Minimize",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Image compressor online free — reduce JPG, PNG, and WebP file sizes by up to 90% without visible quality loss. Batch compress multiple images at once. No signup, no upload limit, instant download."
  },
  {
    id: "smart-img-convert",
    name: "Image Converter",
    category: "Documents",
    href: "/tools/documents/smart-img-convert",
    icon: "Image",
    color: "text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/20 dark:text-fuchsia-400",
    desc: "Image format converter online free — convert PNG to JPG, JPG to WebP, AVIF, GIF, and more. Batch convert multiple images with quality control. No signup, no watermark, instant browser-based conversion."
  },
  {
    id: "smart-ocr",
    name: "Smart OCR",
    category: "Documents",
    href: "/tools/documents/smart-ocr",
    icon: "FileType",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "OCR tool online free — extract text from images and scanned PDFs with high accuracy. Supports printed text, handwriting, and multiple languages including Hindi. No signup, no file upload to server."
  },
  {
    id: "smart-word",
    name: "Markdown Studio",
    category: "Documents",
    href: "/tools/documents/smart-word",
    icon: "Code2",
    color: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Markdown editor with live preview online free — write in Markdown and see rendered output in real time. Export to HTML, PDF, or copy formatted text. Great for README files, documentation, and blog drafts."
  },
  {
    id: "smart-excel",
    name: "Data Studio (CSV)",
    category: "Documents",
    href: "/tools/documents/smart-excel",
    icon: "Grid",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Online CSV editor free — view, edit, filter, sort, and transform CSV files in a spreadsheet-like interface. No Excel or Google Sheets needed. Works entirely in your browser with no file size limits."
  },
  {
    id: "json-csv",
    name: "JSON ↔ CSV Converter",
    category: "Documents",
    href: "/tools/documents/json-csv",
    icon: "Table",
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    desc: "JSON to CSV and CSV to JSON converter online free — paste JSON and get a formatted CSV table instantly. Handles nested objects, arrays, and custom field mapping. No signup, works in your browser."
  },
  {
    id: "self-serve-analytics",
    name: "CSV Chart Builder",
    category: "Documents",
    href: "/tools/documents/self-serve-analytics",
    icon: "BarChart3",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "CSV chart builder online free — paste any CSV data and instantly create bar, line, pie, and area charts. Summary statistics, trend analysis, and shareable exports included. No code, no signup required."
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
    desc: "All-in-one developer toolkit online free — Base64 encoder/decoder, URL encoder, HTML entities, UUID generator, color converter, string utilities, and 20+ coding tools in one browser tab. No install, no signup."
  },
  {
    id: "api-playground",
    name: "API Playground",
    category: "Developer",
    href: "/tools/developer/api-playground",
    icon: "Globe",
    popular: true,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300",
    desc: "REST API client online free — test GET, POST, PUT, DELETE requests with custom headers, Bearer auth tokens, and JSON body. Visualize formatted JSON responses. Free Postman alternative, no install required."
  },
  {
    id: "smart-jwt",
    name: "JWT Debugger",
    category: "Developer",
    href: "/tools/developer/smart-jwt",
    icon: "Key",
    color: "text-pink-500 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-300",
    desc: "JWT decoder and debugger online free — paste any JWT token to instantly decode header, payload, and signature. Inspect claims, expiry date, issuer, and token structure. No signup, nothing sent to server."
  },
  {
    id: "smart-json",
    name: "JSON Editor",
    category: "Developer",
    href: "/tools/developer/smart-json",
    icon: "Braces",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "JSON formatter and validator online free — paste messy JSON to beautify, validate syntax, view as collapsible tree, and minify. Detects and highlights errors with line numbers. Instant, no signup."
  },
  {
    id: "smart-sql",
    name: "SQL Formatter",
    category: "Developer",
    href: "/tools/developer/smart-sql",
    icon: "Database",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "SQL query formatter online free — paste any SQL to format with proper indentation, uppercase keywords, and consistent line breaks. Supports MySQL, PostgreSQL, SQL Server, and SQLite syntax. Instant, no signup."
  },
  {
    id: "cron-gen",
    name: "Cron Generator",
    category: "Developer",
    href: "/tools/developer/cron-gen",
    icon: "Clock",
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "Cron expression generator online free — build cron job schedules with a visual editor. Preview the next 10 run times, get a plain English explanation of any cron string. No more guessing cron syntax."
  },
  {
    id: "git-cheats",
    name: "Git Commands",
    category: "Developer",
    href: "/tools/developer/git-cheats",
    icon: "Laptop",
    color: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Git command reference and cheat sheet online — quick-access guide for the most used Git commands with examples, explanations, and one-click copy. Bookmark it and stop Googling the same commands."
  },
  {
    id: "smart-diff",
    name: "Text Diff",
    category: "Developer",
    href: "/tools/developer/smart-diff",
    icon: "Split",
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Text diff tool online free — paste two text versions to see side-by-side differences with line-level highlighting. Compare code changes, config files, document revisions, or any two blocks of text."
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    category: "Developer",
    href: "/tools/developer/regex-tester",
    icon: "SearchCode",
    popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Regex tester online free — write regular expressions and test against input with real-time match highlighting, group capture display, and replace mode. Supports all flags. No signup, instant results."
  },
  {
    id: "hash-gen",
    name: "Hash Generator",
    category: "Developer",
    href: "/tools/developer/hash-gen",
    icon: "Hash",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Hash generator online free — compute MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for any text string or file. Verify file checksums, test password hashing, or generate integrity signatures instantly."
  },
  {
    id: "num-convert",
    name: "Number Converter",
    category: "Developer",
    href: "/tools/developer/num-convert",
    icon: "Binary",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Number base converter online free — instantly convert between Binary, Octal, Decimal, and Hexadecimal. Step-by-step conversion display and bitwise operations. Essential tool for programmers and CS students."
  },
  {
    id: "timestamp-tool",
    name: "Timestamp Converter",
    category: "Developer",
    href: "/tools/developer/timestamp-tool",
    icon: "Timer",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Unix timestamp converter online free — convert epoch timestamps to human-readable dates and vice versa. Supports seconds, milliseconds, IST, UTC, and 20+ time zones. Debug API responses and log timestamps instantly."
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
    desc: "Life OS planner online free — organize your life with goals, daily habits, tasks, and weekly reviews in one browser-based productivity system. Local data storage, no account required, no subscription."
  },
  {
    id: "qr-code",
    name: "QR Code Generator",
    category: "Productivity",
    href: "/tools/productivity/qr-code",
    icon: "QrCode",
    color: "text-slate-700 bg-slate-100 dark:bg-slate-800 dark:text-slate-300",
    desc: "QR code generator free online — create QR codes for URLs, WiFi credentials, UPI payments, contacts (vCard), and plain text. Custom colors, logo overlay, and PNG download. No signup, instant generation."
  },
  {
    id: "smart-pass",
    name: "Password Generator",
    category: "Productivity",
    href: "/tools/productivity/smart-pass",
    icon: "Lock",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300",
    desc: "Secure password generator online free — create cryptographically random passwords with custom length (up to 64 chars), uppercase, lowercase, numbers, and special characters. Bulk generate and save locally. Nothing sent to server.",
    helpConfig: {
      title: "Password Generator",
      description: "Generate cryptographically random passwords locally — nothing leaves your browser. Fine-grained control over length, character sets, and bulk generation.",
      steps: [
        { title: "Set length & character sets", description: "Use the length slider and toggles to choose uppercase, lowercase, numbers, and symbols." },
        { title: "Copy the password", description: "Click Copy to copy the generated password to your clipboard instantly." },
        { title: "Bulk generate", description: "Set a count and click 'Generate Bulk', then download all passwords as a text file." },
        { title: "Save to vault", description: "Click the + button next to any password to save it to your local vault for reference." },
      ],
      tips: [
        { text: "16+ characters with all sets enabled gives a 'Very Strong' rating — recommended for email, banking, and admin accounts." },
        { text: "Enable 'Exclude Ambiguous' to avoid characters like I, l, 1, O, 0 that look similar when typed manually." },
        { text: "The vault is stored in your browser's localStorage — nothing is sent to any server." },
      ],
    }
  },
  {
    id: "pomodoro",
    name: "Pomodoro Timer",
    category: "Productivity",
    href: "/tools/productivity/pomodoro",
    icon: "Timer",
    color: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-300",
    desc: "Pomodoro timer online free — 25-minute focused work sessions with short and long break intervals. Session counter, customizable durations, and browser tab notifications. No app install, works instantly."
  },
  {
    id: "task-planner",
    name: "Task Planner",
    category: "Productivity",
    href: "/tools/productivity/task-planner",
    icon: "ClipboardCheck",
    popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Personal task manager with GTD methodology — capture tasks into inbox, organize by projects and areas, plan your daily work list, and track waiting items. Private, browser-based, no subscription required."
  },
  {
    id: "habit-tracker",
    name: "Habit Tracker",
    category: "Productivity",
    href: "/tools/productivity/habit-tracker",
    icon: "Target",
    popular: true,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "Habit tracker online free — build new habits with a 21-day calendar grid, daily check-in, streak counter, and completion rate chart. No app download, no signup, data stored locally in your browser."
  },
  {
    id: "lang-translate",
    name: "Language Translator",
    category: "Productivity",
    href: "/tools/productivity/lang-translate",
    icon: "Languages",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Language translator online free — translate text, documents, and web pages across 35+ languages. Voice input, auto-detect language, and file translation support. Free Google Translate alternative, no signup."
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
    desc: "Unit converter online free — convert length, weight, temperature, volume, area, speed, pressure, and 20+ measurement types instantly. Metric to imperial, kg to lbs, Celsius to Fahrenheit, cm to inches, and more."
  },
  {
    id: "case-convert",
    name: "Case Converter",
    category: "Converters",
    href: "/tools/converters/case-convert",
    icon: "Type",
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "Text case converter online free — transform text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case, PascalCase, and more. Instant, paste-and-convert, no signup."
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
    desc: "Color picker online free — pick and convert colors in HEX, RGB, and HSL. Generate complementary, triadic, and analogous palettes. Check WCAG accessibility contrast ratios. Essential tool for web designers."
  },
  {
    id: "color-studio",
    name: "Gradient Studio",
    category: "Design",
    href: "/tools/design/color-studio",
    icon: "Layers",
    popular: false,
    color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300",
    desc: "CSS gradient generator online free — create linear, radial, and conic gradients with a live preview editor. Choose from curated presets, customize color stops, and copy production-ready CSS code instantly."
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
    desc: "BMI calculator India free — enter height and weight to get Body Mass Index, weight category (underweight/normal/overweight/obese), ideal weight range, and personalized health recommendations. Metric and imperial units."
  },
  {
    id: "smart-breath",
    name: "Box Breathing",
    category: "Health",
    href: "/tools/health/smart-breath",
    icon: "Wind",
    color: "text-sky-500 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-300",
    desc: "Box breathing exercise online free — guided 4-4-4-4 breathing technique with animated visual cue. Reduces stress and anxiety in minutes, improves focus before meetings or exams. No app download needed."
  },
  {
    id: "smart-workout",
    name: "HIIT Timer",
    category: "Health",
    href: "/tools/health/smart-workout",
    icon: "Dumbbell",
    color: "text-lime-500 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-300",
    desc: "HIIT interval timer online free — set custom work and rest durations, number of rounds, and exercise names. Audio cues, rest countdown, and session summary. Free workout timer, no app required."
  },
  {
    id: "calorie-calculator",
    name: "Calorie & Macro Calculator",
    category: "Health",
    href: "/tools/health/calorie-calculator",
    icon: "Utensils",
    popular: true,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300",
    desc: "Calorie and macro calculator India free — compute BMR (Basal Metabolic Rate), TDEE (Total Daily Energy Expenditure), and daily calorie target for weight loss, gain, or maintenance. Includes protein, carbs, and fat macro split."
  },
  {
    id: "water-tracker",
    name: "Water Intake Tracker",
    category: "Health",
    href: "/tools/health/water-tracker",
    icon: "Droplets",
    color: "text-sky-500 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-300",
    desc: "Water intake tracker online free — log glasses of water through the day with a visual progress ring. Set daily hydration goals, track 7-day streaks, and build consistent drinking habits. No app download needed."
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
    desc: "AI prompt generator online free — build effective prompts for ChatGPT, Claude, Gemini, and other LLMs. Templates for writing, coding, summarization, analysis, and creative tasks. Get better AI outputs instantly."
  },
  {
    id: "smart-chat",
    name: "AI Chat Assistant",
    category: "AI",
    href: "/tools/ai/smart-chat",
    icon: "Sparkles",
    color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-300",
    desc: "AI chat assistant online free — write, code, summarize, analyze, and brainstorm with AI. Multi-turn conversation history, multiple topics, no login required. Free ChatGPT alternative that works in your browser."
  },
  {
    id: "smart-analyze",
    name: "Sentiment Analyzer",
    category: "AI",
    href: "/tools/ai/smart-analyze",
    icon: "BrainCircuit",
    color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300",
    desc: "Text sentiment analyzer online free — detect positive, negative, or neutral tone in any text. Analyze customer reviews, social media posts, survey responses, and feedback at scale. NLP-powered, no signup."
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
    desc: "Audio to text transcription online free — upload audio or video files and get accurate transcription with timestamps and speaker detection. Supports Hindi and 30+ languages. No signup, runs in your browser."
  },
  {
    id: "video-downloader",
    name: "Video Downloader",
    category: "Creator",
    href: "/tools/creator/video-downloader",
    icon: "Download",
    popular: true,
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Video downloader online free — download videos from YouTube, Instagram, Twitter/X, TikTok, Facebook, Reddit, and Vimeo. Fast, no watermark, no signup. Save social media videos to your device instantly."
  },
  {
    id: "instagram-transcript",
    name: "Video to Transcript",
    category: "Creator",
    href: "/tools/creator/instagram-transcript",
    icon: "Video",
    popular: true,
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Video to transcript converter online free — upload any video or audio file and get AI-generated text transcript with timestamps. Works with downloaded social media videos, lectures, podcasts, and meetings."
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WRITER'S OS — Connected writing workspace for bloggers & content creators
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "writer-ideas",
    name: "Idea Board",
    category: "Writer's OS",
    href: "/tools/writer/writer-ideas",
    icon: "Lightbulb",
    popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Free writing idea capture board for bloggers and content creators — save ideas instantly, tag them, and develop any idea directly into a full document in the Writer's Studio. Never lose a story idea again. No signup, 100% local."
  },
  {
    id: "writer-planner",
    name: "Content Planner",
    category: "Writer's OS",
    href: "/tools/writer/writer-planner",
    icon: "LayoutDashboard",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Blog outline builder and story canvas for writers — choose from 5 templates (how-to, listicle, opinion, case study, comparison), plan H2 sections with word targets, or map your story with 3-Act or Hero's Journey frameworks. Free, no login."
  },
  {
    id: "writer-studio",
    name: "Writing Studio",
    category: "Writer's OS",
    href: "/tools/writer/writer-studio",
    icon: "PenLine",
    popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Distraction-free writing app online — manage multiple documents, auto-save every second, track word count and reading time live, set word goals, and add tags and status. Export or analyze when ready. Free, no account needed."
  },
  {
    id: "writer-analyzer",
    name: "Writing Analyzer",
    category: "Writer's OS",
    href: "/tools/writer/writer-analyzer",
    icon: "BarChart3",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Free writing quality analyzer — get Flesch-Kincaid readability score, detect passive voice sentences, find filler words like 'very' and 'basically', flag long sentences, and get an overall writing score out of 100. Highlight issues in your text. No signup."
  },
  {
    id: "writer-headline",
    name: "Headline Lab",
    category: "Writer's OS",
    href: "/tools/writer/writer-headline",
    icon: "Sparkles",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Free headline score tool for bloggers — score your blog post title on power words, length, clarity, sentiment, and numbers. Get 5 alternative headline suggestions with individual scores. Improve click-through rate before publishing. Free, instant results."
  },
  {
    id: "writer-export",
    name: "Export & Publish",
    category: "Writer's OS",
    href: "/tools/writer/writer-export",
    icon: "Download",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Export blog posts and articles online free — download as Markdown, Plain Text, or HTML, or format for LinkedIn post and Twitter/X thread. Preview before downloading. Print to PDF with one click. No watermark, no signup required."
  },
  // ═══════════════════════════════════════════════════════════════════════════
  // DAILY UTILITY — Everyday tools for managing what you buy, need & spend
  // Designed by Claude
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "smart-cart",
    name: "Smart Cart",
    category: "Daily Utility",
    href: "/tools/daily-utility/smart-cart",
    icon: "ShoppingBag",
    popular: false,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "Your daily shopping & items tracker — add grocery or anything to buy, tag as Need / Want / Luxury, see estimated spend, and compare against your PF budget in real time.",
    helpConfig: {
      title: "Smart Cart",
      description: "Plan your shopping before you step out. Add items, classify them by priority, and see exactly how much you're about to spend — split by needs vs wants vs luxuries.",
      steps: [
        { title: "Pick or create a list", description: "Choose 'Weekly Grocery' or create a custom list (e.g. Monthly Essentials, Festive Shopping). Each list is independent." },
        { title: "Add items fast", description: "Type the item name and press Enter. Set category and priority (Need / Want / Luxury) inline. Use 'More' to expand quantity, price and store fields." },
        { title: "Mark as Bought", description: "Tap the circle next to any item while shopping. Enter the actual price — Smart Cart will show you if you saved or overspent vs your estimate." },
        { title: "Check Budget Pulse", description: "Switch to the Budget Pulse tab to see how your cart compares to your monthly grocery or category budget set in the Personal Finance Budget Planner." },
        { title: "Clone recurring items", description: "Mark staple items as 'Recurring' and use Clone to auto-populate a fresh list next week — without adding everything from scratch." },
      ],
      tips: [
        { text: "Need = must-buy, Want = nice-to-have, Luxury = optional splurge. Use this to make smarter trade-offs at the store." },
        { text: "Set an estimated price for every item before you leave — the Budget Pulse tab will show live vs budget comparison." },
        { text: "Tap Export to copy the list as plain text and share it with family on WhatsApp or Notes." },
      ],
    },
  },
  {
    id: "grocery-items",
    name: "Grocery Items",
    category: "Daily Utility",
    href: "/tools/daily-utility/grocery-items",
    icon: "ShoppingCart",
    popular: false,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Quick grocery list organised by store section — Produce, Dairy, Bakery, Meat & more. Add items with qty & price, check them off as you shop, save frequent items as templates for one-tap re-add.",
    helpConfig: {
      title: "Grocery Items",
      description: "Build your grocery list organised by store section so you move through the aisles efficiently. Save frequently-bought items as templates to re-add with one tap.",
      steps: [
        { title: "Add an item", description: "Type the item name and press Enter. Pick its store section, quantity, and unit — expand to also add brand, estimated price, and a note." },
        { title: "Shop aisle by aisle", description: "Items are grouped by section — Produce, Dairy, Bakery, etc. Tap the circle to check off an item; you can enter the actual price as you go." },
        { title: "Track your spend", description: "The summary bar shows items remaining and a running estimated vs actual spend total so you never go over budget at the checkout." },
        { title: "Save as template", description: "Hover over any item and click the bookmark icon to save it. Next time, open the Saved Items tab and tap to instantly re-add it to your list." },
        { title: "Export the list", description: "Tap Export to download the remaining items as a plain text file — handy for sharing with family via WhatsApp or Notes." },
      ],
      tips: [
        { text: "Add an estimated price per unit before you leave — the summary bar will show live spend vs estimate as you check items off." },
        { text: "Save your weekly staples (milk, eggs, bread…) as templates once and reuse them every week without retyping." },
        { text: "Use 'Add all to list' on the Saved Items tab to populate your full regular list in one tap." },
      ],
    },
  },
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

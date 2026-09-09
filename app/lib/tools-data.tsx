import type { IconName } from "./utils/IconMapper";

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
  "My Finance",
  "My Business",
] as const;

export const ALL_TOOLS: Tool[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONAL FINANCE - Statement-based financial record system
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "pf-bank-connect",
    name: "Import Statements",
    category: "My Finance",
    href: "/my-finance/pf-bank-connect",
    icon: "Download",
    popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Your data gateway — import bank statements via CSV, manual entry, or (coming soon) Account Aggregator & SMS sync. Load once, unlock all 27 Personal Finance tools.",
  },
  {
    id: "pf-statement-manager",
    name: "Statement Manager",
    category: "My Finance",
    href: "/my-finance/pf-statement-manager",
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
    category: "My Finance",
    href: "/my-finance/pf-financial-position",
    icon: "Wallet",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Personal net financial position for any period — total income, total outflows, net surplus, savings rate, commitment ratio, and debt servicing ratio from your bank statements."
  },
  {
    id: "pf-cash-flow",
    name: "Income",
    category: "My Finance",
    href: "/my-finance/pf-cash-flow",
    icon: "TrendingUp",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "All credit transactions from your bank statements — salary, freelance, refunds, interest. Filter by account, date range, category, or merchant. Export to CSV."
  },
  {
    id: "pf-tx-explorer",
    name: "Transaction Explorer",
    category: "My Finance",
    href: "/my-finance/pf-tx-explorer",
    icon: "Table",
    color: "text-slate-600 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-400",
    desc: "Full searchable transaction ledger from all your bank accounts. Filter by date, merchant, amount, or category. Reclassify and bulk-tag transactions, then export to CSV."
  },
  {
    id: "pf-expenses",
    name: "Expenses",
    category: "My Finance",
    href: "/my-finance/pf-expenses",
    icon: "TrendingDown",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Searchable expense ledger from your bank statements. Filter by statement, date, amount, and category. Reclassify transactions, bulk-tag, and export to CSV. Free, no signup."
  },
  {
    id: "pf-expenditure",
    name: "Spend by Category",
    category: "My Finance",
    href: "/my-finance/pf-expenditure",
    icon: "BarChart3",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Category-wise spending breakdown with month-on-month comparison. Rename, merge, and add custom categories. Identify exactly where your money goes — by category, merchant, or month."
  },
  {
    id: "pf-commitments",
    name: "Commitments Register",
    category: "My Finance",
    href: "/my-finance/pf-commitments",
    icon: "RefreshCw",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Auto-detect all fixed monthly obligations — EMIs, rent, SIPs, and subscriptions — directly from your bank statements. Confirm, dismiss, or add manual commitments. Know your real monthly commitment burden."
  },
  {
    id: "pf-recurring",
    name: "Recurring Payments",
    category: "My Finance",
    href: "/my-finance/pf-recurring",
    icon: "Repeat2",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Identify all recurring debits grouped by merchant from your bank statements. Auto-detect subscriptions, SIPs, standing instructions, and regular payments. Bulk-assign categories instantly."
  },
  {
    id: "pf-top-merchants",
    name: "Top Merchants",
    category: "My Finance",
    href: "/my-finance/pf-top-merchants",
    icon: "Trophy",
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
    desc: "Merchant leaderboard ranked by total spend from your bank statements. Instantly see which stores, apps, and vendors cost you the most — with inline category assignment."
  },
  {
    id: "pf-big-spends",
    name: "Big Spends",
    category: "My Finance",
    href: "/my-finance/pf-big-spends",
    icon: "Zap",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Spot all large transactions above a custom threshold in your bank statements. Review high-value one-off purchases by period, category, or merchant — identify unusual big spends at a glance."
  },
  {
    id: "pf-rules",
    name: "Category Rules",
    category: "My Finance",
    href: "/my-finance/pf-rules",
    icon: "Wand2",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Create keyword-based auto-categorization rules that apply to all your bank statement transactions. Set conditions by merchant name, amount range, or transaction type — categorize automatically, permanently."
  },
  {
    id: "pf-income-sources",
    name: "Income Sources",
    category: "My Finance",
    href: "/my-finance/pf-income-sources",
    icon: "CircleDollarSign",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Break down all credit transactions by income source — salary, freelance income, UPI receipts, interest, and refunds. Understand exactly what money is coming in and from where."
  },
  {
    id: "pf-daily-pulse",
    name: "Daily Transaction Pulse",
    category: "My Finance",
    href: "/my-finance/pf-daily-pulse",
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
    category: "My Finance",
    href: "/my-finance/pf-behavior",
    icon: "Activity",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Discover when you spend the most — day-of-week and day-of-month spending heatmaps reveal behavioral patterns hidden in your bank data. Understand impulse vs planned spending habits."
  },
  {
    id: "pf-savings-trend",
    name: "Savings Trend",
    category: "My Finance",
    href: "/my-finance/pf-savings-trend",
    icon: "TrendingUp",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "Track your savings rate month by month from actual bank statement data. See surplus vs deficit trends over time and find out if your financial discipline is genuinely improving."
  },
  {
    id: "pf-month-compare",
    name: "Month Comparison",
    category: "My Finance",
    href: "/my-finance/pf-month-compare",
    icon: "ArrowRightLeft",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Compare spending between any two months side-by-side — full category breakdown, MoM change in rupees and percentage. Instantly see which expense categories went up or down."
  },
  {
    id: "pf-heatmap",
    name: "Spending Heatmap",
    category: "My Finance",
    href: "/my-finance/pf-heatmap",
    icon: "CalendarDays",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "GitHub-style calendar heatmap of your daily spending intensity. Spot high-spend days at a glance and drill into every transaction from that date. Visual spending history at scale."
  },
  {
    id: "pf-subscriptions",
    name: "Subscription Finder",
    category: "My Finance",
    href: "/my-finance/pf-subscriptions",
    icon: "Radio",
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Auto-detect all subscriptions in your bank statements — Netflix, Spotify, Amazon Prime, SIPs, insurance premiums. See total monthly and annual subscription cost. Find subscriptions you forgot you're paying for."
  },
  {
    id: "pf-labels",
    name: "Label Manager",
    category: "My Finance",
    href: "/my-finance/pf-labels",
    icon: "Tags",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Create custom color-coded labels and assign them to any bank transactions. Build your own tagging system — tag trips, business expenses, medical costs — and filter your data any way you want."
  },
  {
    id: "pf-liability",
    name: "Liability Ledger",
    category: "My Finance",
    href: "/my-finance/pf-liability",
    icon: "Landmark",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
    desc: "Identify all loan EMI obligations from your bank statement transactions. See estimated monthly debt burden, EMI-to-income ratio, and grouped loan ledger — without entering data manually."
  },
  {
    id: "pf-ai-analyst",
    name: "AI Financial Analyst",
    category: "My Finance",
    href: "/my-finance/pf-ai-analyst",
    icon: "Brain",
    popular: true,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "AI-powered financial analyst that reads your bank statements — automatically detects spending anomalies, predicts next month's expenses, and delivers personalized money-saving recommendations. No data leaves your browser."
  },
  {
    id: "pf-health-score",
    name: "Financial Health Score",
    category: "My Finance",
    href: "/my-finance/pf-health-score",
    icon: "ShieldCheck",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Score your financial fitness across 5 dimensions — savings rate, debt burden, emergency fund, insurance coverage, and investment discipline. Get a personalized financial health score with actionable improvement tips."
  },
  {
    id: "pf-spending-dna",
    name: "Money Personality",
    category: "My Finance",
    href: "/my-finance/pf-spending-dna",
    icon: "Dna",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Decode your money personality from real bank statement spending patterns. Discover your financial archetype — Spender, Saver, Investor, or Avoider — and get targeted insights to reshape your financial habits."
  },
  {
    id: "pf-investment-tracker",
    name: "Investment Tracker",
    category: "My Finance",
    href: "/my-finance/pf-investment-tracker",
    icon: "TrendingUp",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Track all investments — stocks, mutual funds, gold, and crypto — with XIRR returns, asset allocation pie chart, and gain/loss analysis. No broker login needed. Free, local, no signup."
  },
  {
    id: "pf-budget-planner",
    name: "Monthly Budget Planner",
    category: "My Finance",
    href: "/my-finance/pf-budget-planner",
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
    category: "My Finance",
    href: "/my-finance/pf-budget-vs-actual",
    icon: "BarChart3",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Set monthly budgets per category and track actual spending from your bank statements. Progress bars, overspend alerts, and monthly variance charts. Know exactly which categories are over budget."
  },
  {
    id: "pf-financial-snapshot",
    name: "Financial Snapshot",
    category: "My Finance",
    href: "/my-finance/pf-financial-snapshot",
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
    name: "Budget Planner",
    category: "My Finance",
    href: "/my-finance/smart-budget",
    icon: "Wallet",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Free monthly budget planner — set income, allocate to expense categories, track savings goals. Supports 50/30/20 budget rule. No signup, works entirely in your browser."
  },
  {
    id: "smart-loan",
    name: "Loan Calculator",
    category: "My Finance",
    href: "/my-finance/smart-loan",
    icon: "Calculator",
    popular: true,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "EMI calculator for home, car, and personal loans — monthly payment, total interest payable, and full amortization schedule. Compare loan options and prepayment scenarios. Free, instant, India-ready."
  },
  {
    id: "smart-sip",
    name: "SIP Calculator",
    category: "My Finance",
    href: "/my-finance/smart-sip",
    icon: "TrendingUp",
    color: "text-lime-600 bg-lime-50 dark:bg-lime-900/20 dark:text-lime-400",
    desc: "SIP calculator India — project mutual fund corpus at any monthly amount, expected return rate, and investment tenure. Compare lump sum vs SIP, plan wealth accumulation, and set goal-based SIP targets."
  },
  {
    id: "smart-net-worth",
    name: "Net Worth Tracker",
    category: "My Finance",
    href: "/my-finance/smart-net-worth",
    icon: "Landmark",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "Calculate and track your personal net worth — add bank balances, investments, property, loans, and credit card debt. Monitor total assets vs liabilities and watch your net worth grow over time."
  },
  {
    id: "smart-retirement",
    name: "Retirement Planner",
    category: "My Finance",
    href: "/my-finance/smart-retirement",
    icon: "Briefcase",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Retirement corpus calculator India — find how much you need to retire, monthly SIP required, and inflation-adjusted corpus target. Includes pension income, withdrawal rate strategy, and FIRE-age projection."
  },
  {
    id: "gst-calculator",
    name: "GST Calculator",
    category: "My Finance",
    href: "/my-finance/gst-calculator",
    icon: "Percent",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Free GST calculator India — add or remove 5%, 12%, 18%, 28% GST. Calculate CGST, SGST, IGST, inclusive and exclusive prices, and total tax amount. Instant results, no signup."
  },
  {
    id: "fire-calc",
    name: "FIRE Calculator",
    category: "My Finance",
    href: "/my-finance/fire-calc",
    icon: "Flame",
    popular: true,
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "FIRE calculator India — calculate your Financial Independence number, target retirement corpus, FIRE age, and monthly savings needed to retire early. Supports Lean FIRE, Fat FIRE, and Barista FIRE scenarios."
  },
  {
    id: "cost-of-delay",
    name: "Cost of Delay",
    category: "My Finance",
    href: "/my-finance/cost-of-delay",
    icon: "Clock",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "See the real compounding cost of delaying your investments — exact wealth lost for every year you wait. The most powerful motivator to start SIP or lump sum investing today, not tomorrow."
  },
  {
    id: "debt-planner",
    name: "Debt Planner",
    category: "My Finance",
    href: "/my-finance/debt-planner",
    icon: "CreditCard",
    popular: true,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Debt repayment planner — compare Snowball vs Avalanche strategy across all loans. Find the fastest, cheapest path to debt-free, total interest saved, and month-by-month payoff timeline."
  },
  {
    id: "portfolio-rebalance",
    name: "Portfolio Rebalancer",
    category: "My Finance",
    href: "/my-finance/portfolio-rebalance",
    icon: "BarChart3",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Portfolio rebalancer — track asset allocation drift across equity, debt, gold, and international. Get exact buy/sell amounts to restore your target allocation and keep your investment strategy on track."
  },
  {
    id: "ctc-calc",
    name: "CTC to In-hand",
    category: "My Finance",
    href: "/my-finance/ctc-calc",
    icon: "IndianRupee",
    popular: true,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "CTC to in-hand salary calculator India — convert annual CTC to exact monthly take-home. Old vs new tax regime comparison, EPF, HRA, standard deduction, 87A rebate, and all deductions included."
  },
  {
    id: "hra-calc",
    name: "HRA Exemption",
    category: "My Finance",
    href: "/my-finance/hra-calc",
    icon: "Home",
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "HRA exemption calculator India — compute exact HRA amount exempt from income tax under Section 10(13A). Uses the three-condition minimum method with metro/non-metro rates. Free, instant."
  },
  {
    id: "gratuity-calc",
    name: "Gratuity & Leave Encashment",
    category: "My Finance",
    href: "/my-finance/gratuity-calc",
    icon: "Award",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Gratuity calculator India — compute your gratuity payout under the Payment of Gratuity Act based on salary and years of service. Also calculates leave encashment for your notice period or resignation."
  },
  {
    id: "capital-gains-calc",
    name: "Capital Gains Tax",
    category: "My Finance",
    href: "/my-finance/capital-gains-calc",
    icon: "TrendingUp",
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Capital gains tax calculator India FY 2024-25 — compute STCG and LTCG on stocks, mutual funds, gold, and property. Includes indexation benefit, surcharge, and updated Budget 2024 tax rates."
  },
  {
    id: "tax-saving-compare",
    name: "Tax Saving Compare",
    category: "My Finance",
    href: "/my-finance/tax-saving-compare",
    icon: "Scale",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Compare NPS vs PPF vs ELSS side-by-side — projected corpus, 80C tax savings, lock-in period, liquidity, and exit conditions. Find the best 80C investment for your tax planning goals."
  },
  {
    id: "sub-audit",
    name: "Subscription Audit",
    category: "My Finance",
    href: "/my-finance/sub-audit",
    icon: "Radio",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-900/20 dark:text-pink-400",
    desc: "Subscription audit tool — list all your paid apps, OTT platforms, and tools. Flag rarely-used subscriptions, calculate true monthly and annual cost, and identify what to cancel immediately."
  },
  {
    id: "wedding-budget",
    name: "Wedding Budget Planner",
    category: "My Finance",
    href: "/my-finance/wedding-budget",
    icon: "Heart",
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Wedding budget planner India — plan every rupee across venue, catering, photography, decoration, and outfits. Track budgeted vs actual spend per category. No surprise overspend on your big day."
  },
  {
    id: "salary-nego",
    name: "Salary Negotiation",
    category: "My Finance",
    href: "/my-finance/salary-nego",
    icon: "Briefcase",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Salary negotiation calculator India — compare two CTC offers and see the exact take-home difference after taxes, EPF, and deductions. Know the real rupee value of any salary hike before you negotiate."
  },
  {
    id: "fd-calculator",
    name: "FD / RD Calculator",
    category: "My Finance",
    href: "/my-finance/fd-calculator",
    icon: "PiggyBank",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "FD and RD maturity calculator India — compute Fixed Deposit and Recurring Deposit returns with TDS deduction, senior citizen preferential rates, and year-wise growth chart. Compare bank FD options."
  },
  {
    id: "nps-calculator",
    name: "NPS Calculator",
    category: "My Finance",
    href: "/my-finance/nps-calculator",
    icon: "Coins",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "NPS calculator India — project National Pension Scheme corpus at retirement based on monthly contribution, equity/debt allocation, and expected returns. See annuity income and 80CCD(1B) tax benefit calculation."
  },
  {
    id: "ppf-calculator",
    name: "PPF Calculator",
    category: "My Finance",
    href: "/my-finance/ppf-calculator",
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
    category: "My Finance",
    href: "/my-finance/tds-finder",
    icon: "Percent",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "TDS rate finder India — look up TDS percentage for salary, rent, professional fees, commission, contracts, and interest. Section-wise thresholds and applicable limits for FY 2024-25. Free, instant."
  },
  {
    id: "deduction-tracker",
    name: "Deduction Tracker",
    category: "My Finance",
    href: "/my-finance/deduction-tracker",
    icon: "ShieldCheck",
    popular: true,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Income tax deduction tracker India — log investments and expenses under 80C, 80D, 80CCD(1B), HRA, NPS, and all sections. Track limit utilization, remaining 80C headroom, and maximize ITR savings for FY 2024-25."
  },
  {
    id: "tax-calendar",
    name: "Tax Calendar",
    category: "My Finance",
    href: "/my-finance/tax-calendar",
    icon: "CalendarDays",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20 dark:text-violet-400",
    desc: "Indian tax compliance calendar FY 2024-25 — advance tax due dates, TDS deposit deadlines, GST return dates (GSTR-1, GSTR-3B), and ITR filing last date. Never miss a tax deadline again."
  },
  {
    id: "advance-tax-calc",
    name: "Advance Tax Calculator",
    category: "My Finance",
    href: "/my-finance/advance-tax-calc",
    icon: "Calculator",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "Advance tax calculator India — calculate installments due in June (15%), September (45%), December (75%), and March (100%) quarters. Avoid interest under Section 234B/234C with accurate quarterly estimates."
  },
  {
    id: "income-tax-calc",
    name: "Income Tax Calculator",
    category: "My Finance",
    href: "/my-finance/income-tax-calc",
    icon: "IndianRupee",
    popular: true,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Income tax calculator India FY 2024-25 — old vs new tax regime comparison with HRA, 80C, 80D, 80CCD, standard deduction, 87A rebate, surcharge, and cess. Know your exact tax liability before filing ITR."
  },
  {
    id: "itr-checklist",
    name: "ITR Filing Checklist",
    category: "My Finance",
    href: "/my-finance/itr-checklist",
    icon: "ListChecks",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Personalised ITR filing checklist India — select your income sources (salary, freelance, capital gains, rental) to get the correct ITR form, complete document checklist, and track what you've gathered."
  },

  // BUSINESS OS - Operating system for small businesses (3-anchor model)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: "biz-dashboard",
    name: "Business Dashboard",
    category: "My Business",
    href: "/my-business/biz-dashboard",
    icon: "LayoutDashboard",
    popular: true,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Business dashboard for small businesses India — real-time CEO view of today's sales, total expenses, gross profit, outstanding receivables, and low-stock alerts. Complete business pulse in one screen. Free, no login."
  },
  {
    id: "biz-daybook",
    name: "Daybook",
    category: "My Business",
    href: "/my-business/biz-daybook",
    icon: "BookOpen",
    popular: false,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    desc: "Digital daybook for small businesses India — quickly log every income and expense entry in seconds, linked to customers and vendors. Works like a digital cash book (Roznamcha). Local, private, no server."
  },
  {
    id: "biz-parties",
    name: "Party Register",
    category: "My Business",
    href: "/my-business/biz-parties",
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
    category: "My Business",
    href: "/my-business/biz-inventory",
    icon: "Package",
    popular: false,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Inventory management for small businesses India — product catalog with live stock levels, low-stock threshold alerts, supplier tracking, and cost/selling price management. No expensive software needed."
  },
  {
    id: "biz-invoices",
    name: "Invoice Manager",
    category: "My Business",
    href: "/my-business/biz-invoices",
    icon: "Receipt",
    popular: true,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400",
    desc: "GST invoice manager for small businesses India — create GST-compliant invoices, track payment status (paid/pending/overdue), and auto-record received payments in your Daybook. Linked to Party Register and Inventory."
  },
  {
    id: "biz-reports",
    name: "Business Reports",
    category: "My Business",
    href: "/my-business/biz-reports",
    icon: "BarChart3",
    popular: false,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Business P&L and analytics for small businesses India — profit and loss statement, category-wise expense breakdown, top customers by revenue, top-selling products, and month-on-month income trends."
  },
  {
    id: "biz-products",
    name: "Product Catalog",
    category: "My Business",
    href: "/my-business/biz-products",
    icon: "Package",
    popular: false,
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    desc: "Product catalog manager for small businesses India — add and manage all products with HSN codes, GST rates, unit of measure, and pricing. Bulk import from CSV. Linked to Inventory, Invoices, and Stock Entry."
  },
  {
    id: "biz-stock-entry",
    name: "Stock Entry",
    category: "My Business",
    href: "/my-business/biz-stock-entry",
    icon: "ArrowRightLeft",
    popular: false,
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Stock entry management India — record goods received (GRN) from vendors and goods dispatched to customers. Auto-updates live stock levels in Inventory and posts corresponding entries in your Daybook."
  },
  {
    id: "biz-outstanding",
    name: "Outstanding Tracker",
    category: "My Business",
    href: "/my-business/biz-outstanding",
    icon: "Clock",
    popular: true,
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    desc: "Outstanding receivables tracker India — see all unpaid invoices with aging analysis (0-30, 30-60, 60+ days overdue). One-click WhatsApp payment reminder generator. Stop chasing payments manually."
  },
  {
    id: "biz-purchases",
    name: "Purchase Bills",
    category: "My Business",
    href: "/my-business/biz-purchases",
    icon: "ShoppingBag",
    popular: false,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    desc: "Purchase bill management India — record vendor invoices, track accounts payable, and monitor eligible Input Tax Credit (ITC) for monthly GSTR-3B filing. Know exactly what you owe and what GST you can claim back."
  },
  {
    id: "biz-quotations",
    name: "Quotations",
    category: "My Business",
    href: "/my-business/biz-quotations",
    icon: "FileCheck",
    popular: false,
    color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-400",
    desc: "Quotation and estimate maker India — create professional client quotes, track acceptance and rejection rate, and convert approved quotations directly into GST invoices with one click. No duplication of effort."
  },
  {
    id: "biz-staff",
    name: "Staff & Payroll",
    category: "My Business",
    href: "/my-business/biz-staff",
    icon: "Users",
    popular: false,
    color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400",
    desc: "Staff and payroll manager for small businesses India — maintain employee records, mark daily attendance, and calculate monthly salary with PF, ESI, and TDS deductions. Generate payslips automatically."
  },
  {
    id: "biz-gst",
    name: "GST Helper",
    category: "My Business",
    href: "/my-business/biz-gst",
    icon: "FileText",
    popular: false,
    color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    desc: "GST filing helper for small businesses India — prepare GSTR-1 outward supply data and GSTR-3B summary from your invoices and purchase bills. Track output tax, ITC credits, and net GST payable each month."
  },
  {
    id: "biz-cashflow",
    name: "Cash Flow",
    category: "My Business",
    href: "/my-business/biz-cashflow",
    icon: "TrendingUp",
    popular: false,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    desc: "Business cash flow forecast India — 30, 60, and 90-day projection based on outstanding receivable invoices and pending purchase bills. Know your future cash position and avoid cash crunches before they happen."
  },
  {
    id: "biz-loans",
    name: "Loans & EMI",
    category: "My Business",
    href: "/my-business/biz-loans",
    icon: "CreditCard",
    popular: false,
    color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400",
    desc: "Business loan tracker India — record all business loans and credit lines, view complete EMI schedules, mark monthly payments, and track outstanding principal for each loan. Full debt picture for your business."
  },
  {
    id: "biz-reconcile",
    name: "Bank Reconciliation",
    category: "My Business",
    href: "/my-business/biz-reconcile",
    icon: "GitMerge",
    color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20 dark:text-cyan-400",
    desc: "Bank reconciliation tool for small businesses India — match bank statement entries with daybook records. Identify missing transactions, find discrepancies, and keep your books in sync with your actual bank balance."
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

// ─────────────────────────────────────────────────────────────────────────────
// Space Config — single source of truth for the 2 workspaces' section/tier structure.
//
// Reused by:
//   - app/my-finance/layout.tsx and app/my-business/layout.tsx (sidebar nav groups)
//   - app/components/layout/GlobalHeader.tsx (search result routing)
// ─────────────────────────────────────────────────────────────────────────────

export type TierDef = {
  id: string;
  label: string;
  desc?: string;
  badge?: string;
  tools: string[];   // exact tool IDs from tools-data.tsx
  hero?: boolean;    // renders wider grid (command-center style)
  advanced?: boolean; // collapsed behind "Show more" in the sidebar nav — for back-office/less-frequent tools
};

export type CategorySpaceConfig = {
  category: string;  // exact match to tools-data category field
  slug: string;      // URL slug — must be unique
  emoji: string;
  desc: string;
  tiers?: TierDef[]; // if omitted → auto-populated flat grid from ALL_TOOLS
};

export const SPACE_CONFIGS: CategorySpaceConfig[] = [

  // ── My Finance (Personal Finance + Finance + GST & Tax, merged) ────────────
  {
    category: 'My Finance',
    slug: 'my-finance',
    emoji: '📊',
    desc: 'Upload your bank statement once — unlock every tool that shows exactly where your money goes, what you owe, and how to improve.',
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
        tools: ['pf-commitments', 'pf-recurring', 'pf-subscriptions', 'sub-audit'],
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
        desc: 'Custom labels for tagging transactions, auto-categorization rules, AI insights, and money-personality analysis.',
        tools: ['pf-labels', 'pf-rules', 'pf-ai-analyst', 'pf-spending-dna'],
      },
      {
        id: 'budget-planner',
        label: 'Budget Planner',
        desc: 'Zero-based budgeting with envelope tracking, savings goals, year-overview, cash flow calendar — and budget vs actual from your real statements.',
        tools: ['pf-budget-planner', 'pf-budget-vs-actual', 'smart-budget'],
      },
      {
        id: 'wealth-planning',
        label: 'Wealth & Goals',
        desc: 'Build long-term wealth — track net worth, plan retirement, and calculate your FIRE number.',
        tools: ['pf-investment-tracker', 'smart-net-worth', 'smart-retirement', 'fire-calc'],
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
        desc: 'Wedding budget and salary negotiation — financial tools for life decisions.',
        tools: ['wedding-budget', 'salary-nego'],
      },
      {
        id: 'income-tax',
        label: 'Income Tax',
        desc: 'Calculate your tax liability, check advance tax instalments, and get a filing checklist.',
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

  // ── My Business (Business OS) ──────────────────────────────────────────────
  {
    category: 'My Business',
    slug: 'my-business',
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
        advanced: true,
      },
      {
        id: 'inventory',
        label: 'Inventory',
        desc: 'Maintain your product catalog, track stock levels, and record inward/outward stock movements.',
        tools: ['biz-products', 'biz-inventory', 'biz-stock-entry'],
        advanced: true,
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
        advanced: true,
      },
      {
        id: 'tax',
        label: 'GST & Compliance',
        desc: 'Classify transactions by GST rate, prepare GSTR summaries, and stay compliant.',
        tools: ['biz-gst'],
        advanced: true,
      },
      {
        id: 'finance',
        label: 'Finance',
        desc: 'Track business loans and EMIs, and reconcile your bank statement with your books.',
        tools: ['biz-loans', 'biz-reconcile'],
        advanced: true,
      },
      {
        id: 'reports',
        label: 'Reports',
        desc: 'P&L statement, balance sheet, and business analytics — know your numbers.',
        tools: ['biz-reports'],
        advanced: true,
      },
    ],
  },

];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getSpaceConfig(slug: string): CategorySpaceConfig | undefined {
  return SPACE_CONFIGS.find(c => c.slug === slug);
}

/** Returns the workspace href for a category name, or "/" if the category is unrecognized */
export function categoryToSpaceHref(category: string): string {
  const config = SPACE_CONFIGS.find(c => c.category === category);
  return config ? `/${config.slug}` : '/';
}

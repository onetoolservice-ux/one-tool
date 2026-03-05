/**
 * pf-data-bridge.ts
 * Bridges Personal Finance store data → Finance tools.
 * Aggregates monthly averages by category and provides
 * pre-fill values for SIP, Budget, Retirement, Loan tools.
 */
import { getPFTransactions } from '../personal-finance/finance-store';
import type { PFTransaction } from '../personal-finance/finance-store';

export type BudgetCatType = 'need' | 'want' | 'saving' | 'investment';

// ── PF category → Budget Planner bucket ───────────────────────────────────────
export const PF_TO_BUDGET_CAT: Record<string, BudgetCatType> = {
  // Needs
  'Housing':      'need',
  'Utilities':    'need',
  'Grocery':      'need',
  'Health':       'need',
  'Education':    'need',
  'Transport':    'need',
  'Insurance':    'need',
  'Loan/EMI':     'need',
  // Wants
  'Food & Dining':'want',
  'Shopping':     'want',
  'Travel':       'want',
  'Miscellaneous':'want',
  'Personal Care':'want',
  'Subscriptions':'want',
  // Investment / Saving
  'Investment':   'investment',
  'Returns':      'saving',
  'Refund':       'saving',
};

/** Categories that should never appear as expenses */
const SKIP_DEBIT_CATS = new Set(['Transfer', 'Self Transfer']);
/** Categories that count as income credits */
const SKIP_CREDIT_CATS = new Set(['Transfer', 'Self Transfer']);

// ── Row types ─────────────────────────────────────────────────────────────────

export interface ImportIncomeRow {
  id: string;
  name: string;
  avgMonthly: number;
  editedAmount: number;
  txnCount: number;
  selected: boolean;
}

export interface ImportExpenseRow {
  id: string;
  category: string;
  avgMonthly: number;
  editedAmount: number;
  txnCount: number;
  budgetCat: BudgetCatType;
  selected: boolean;
}

export interface PFFinanceSummary {
  hasData: boolean;
  monthCount: number;
  recentMonths: string[];         // ['2024-03', '2024-02'] most recent first

  avgMonthlyIncome:  number;
  avgMonthlyExpense: number;

  incomeRows:  ImportIncomeRow[];
  expenseRows: ImportExpenseRow[];

  // Quick-access pre-fill values
  detectedSIPMonthly:     number;  // Investment category avg
  detectedLoanEMIMonthly: number;  // Loan/EMI category avg
}

// ── Core aggregation ──────────────────────────────────────────────────────────

export function getPFFinanceSummary(monthsBack = 3): PFFinanceSummary {
  const EMPTY: PFFinanceSummary = {
    hasData: false, monthCount: 0, recentMonths: [],
    avgMonthlyIncome: 0, avgMonthlyExpense: 0,
    incomeRows: [], expenseRows: [],
    detectedSIPMonthly: 0, detectedLoanEMIMonthly: 0,
  };

  const txns = getPFTransactions();
  if (txns.length === 0) return EMPTY;

  // Find most-recent N months that have data
  const allMonths = [
    ...new Set(txns.map(t => t.date?.substring(0, 7) || '').filter(Boolean)),
  ].sort().reverse();

  const recentMonths = allMonths.slice(0, monthsBack);
  if (recentMonths.length === 0) return EMPTY;

  const recent = txns.filter(t =>
    recentMonths.includes(t.date?.substring(0, 7) || ''),
  );
  const mc = recentMonths.length;

  // ── Credits → income ──────────────────────────────────────────────────────
  const credits = recent.filter(
    t => t.type === 'credit' && !t.isTransfer && !SKIP_CREDIT_CATS.has(t.category),
  );

  // Group credits by short merchant name
  const incMap: Record<string, { total: number; count: number }> = {};
  credits.forEach(t => {
    const key = t.description.split(/\s+/).slice(0, 3).join(' ').slice(0, 30);
    if (!incMap[key]) incMap[key] = { total: 0, count: 0 };
    incMap[key].total += t.amount;
    incMap[key].count++;
  });

  const incomeRows: ImportIncomeRow[] = Object.entries(incMap)
    .map(([name, { total, count }], i) => ({
      id: `inc-${i}`,
      name,
      avgMonthly: total / mc,
      editedAmount: Math.round(total / mc),
      txnCount: count,
      selected: true,
    }))
    .sort((a, b) => b.avgMonthly - a.avgMonthly)
    .slice(0, 5);

  // ── Debits → expenses by category ────────────────────────────────────────
  const debits = recent.filter(
    t => t.type === 'debit' && !t.isTransfer && !SKIP_DEBIT_CATS.has(t.category),
  );

  const expMap: Record<string, { total: number; count: number }> = {};
  debits.forEach(t => {
    const cat = t.category || 'Miscellaneous';
    if (!expMap[cat]) expMap[cat] = { total: 0, count: 0 };
    expMap[cat].total += t.amount;
    expMap[cat].count++;
  });

  const expenseRows: ImportExpenseRow[] = Object.entries(expMap)
    .map(([category, { total, count }], i) => ({
      id: `exp-${i}`,
      category,
      avgMonthly: total / mc,
      editedAmount: Math.round(total / mc),
      txnCount: count,
      budgetCat: (PF_TO_BUDGET_CAT[category] ?? 'want') as BudgetCatType,
      selected: category !== 'Loan/EMI', // deselect loan by default (it's in Smart Loan)
    }))
    .sort((a, b) => b.avgMonthly - a.avgMonthly);

  const avgMonthlyIncome  = credits.reduce((s, t) => s + t.amount, 0) / mc;
  const avgMonthlyExpense = debits.reduce((s, t) => s + t.amount, 0) / mc;

  const detectedSIPMonthly     = expenseRows.find(e => e.category === 'Investment')?.avgMonthly ?? 0;
  const detectedLoanEMIMonthly = expenseRows.find(e => e.category === 'Loan/EMI')?.avgMonthly ?? 0;

  return {
    hasData: true,
    monthCount: mc,
    recentMonths,
    avgMonthlyIncome,
    avgMonthlyExpense,
    incomeRows,
    expenseRows,
    detectedSIPMonthly,
    detectedLoanEMIMonthly,
  };
}

/** Refresh helper — call in pf-store-updated handler */
export { getPFTransactions };

/**
 * Tile Live Data
 * Reads each tool's localStorage store and returns a compact live value
 * to display on the My Home tile (e.g. "₹12.4K today", "4/6 habits", "₹2.1L portfolio")
 *
 * All operations are:
 *  - Defensive (wrapped in try/catch, returns null on any error)
 *  - Read-only (never writes to stores)
 *  - Fast (simple array/object iteration, no heavy computation)
 */

export interface TileLiveData {
  value: string;   // primary display value, e.g. "₹12.4K"
  label: string;   // context label,          e.g. "this month"
  tone?: 'positive' | 'negative' | 'neutral'; // optional color hint
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function thisMonth(): string {
  return today().slice(0, 7); // YYYY-MM
}

function fmtINR(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 10_00_000) return `${sign}₹${(abs / 10_00_000).toFixed(1)}L`;
  if (abs >= 1_000)     return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return `${sign}₹${Math.round(abs)}`;
}

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ── Business OS ───────────────────────────────────────────────────────────────

interface BizTx { date: string; type: 'income' | 'expense'; amount: number; }
interface BizInvoice { status: string; total: number; dueDate?: string; }
interface BizProduct { stock: number; lowStockAlert: number; }
interface BizStore {
  transactions: BizTx[];
  invoices: Record<string, BizInvoice>;
  products: Record<string, BizProduct>;
  parties: Record<string, unknown>;
  staff: Record<string, unknown>;
  purchases: Record<string, unknown>;
  quotations: Record<string, unknown>;
  loans: Record<string, unknown>;
}

function getBizStore(): BizStore | null {
  const s = safeRead<BizStore | null>('otsd-biz-os-store', null);
  if (!s || !Array.isArray(s.transactions)) return null;
  return s;
}

function bizKPIs(store: BizStore) {
  const t = today();
  const m = thisMonth();
  let todaySales = 0, monthSales = 0, monthExp = 0;

  store.transactions.forEach(tx => {
    if (tx.date === t && tx.type === 'income') todaySales += tx.amount;
    if (tx.date?.startsWith(m)) {
      if (tx.type === 'income') monthSales += tx.amount;
      else monthExp += tx.amount;
    }
  });

  let pending = 0, overdue = 0;
  const now = new Date();
  Object.values(store.invoices ?? {}).forEach(inv => {
    if (inv.status === 'sent' || inv.status === 'draft') pending += inv.total;
    if (inv.status === 'overdue') overdue += inv.total;
    if (inv.status === 'sent' && inv.dueDate && new Date(inv.dueDate) < now) {
      overdue += inv.total;
      pending -= inv.total;
    }
  });

  return {
    todaySales,
    monthNet: monthSales - monthExp,
    pending,
    overdue,
    lowStock: Object.values(store.products ?? {}).filter(p => p.lowStockAlert > 0 && p.stock <= p.lowStockAlert).length,
    parties: Object.keys(store.parties ?? {}).length,
    staff: Object.keys(store.staff ?? {}).length,
    purchases: Object.keys(store.purchases ?? {}).length,
    quotations: Object.keys(store.quotations ?? {}).length,
    loans: Object.keys(store.loans ?? {}).length,
    todayCount: store.transactions.filter(tx => tx.date === today()).length,
  };
}

function getBizTileData(toolId: string): TileLiveData | null {
  const store = getBizStore();
  if (!store) return null;
  const k = bizKPIs(store);

  switch (toolId) {
    case 'biz-dashboard':
      if (k.todaySales > 0) return { value: fmtINR(k.todaySales), label: "today's sales", tone: 'positive' };
      if (k.monthNet !== 0) return { value: fmtINR(k.monthNet), label: 'month net', tone: k.monthNet >= 0 ? 'positive' : 'negative' };
      return null;

    case 'biz-daybook':
      if (k.todayCount === 0) return null;
      return { value: String(k.todayCount), label: `entr${k.todayCount === 1 ? 'y' : 'ies'} today`, tone: 'neutral' };

    case 'biz-invoices':
      if (k.pending === 0) return null;
      return { value: fmtINR(k.pending), label: 'pending invoices', tone: 'neutral' };

    case 'biz-outstanding':
      if (k.overdue > 0) return { value: fmtINR(k.overdue), label: 'overdue', tone: 'negative' };
      if (k.pending > 0) return { value: fmtINR(k.pending), label: 'outstanding', tone: 'neutral' };
      return null;

    case 'biz-cashflow':
      if (k.monthNet === 0) return null;
      return { value: fmtINR(k.monthNet), label: 'month net', tone: k.monthNet >= 0 ? 'positive' : 'negative' };

    case 'biz-reports':
      if (k.monthNet === 0) return null;
      return { value: fmtINR(k.monthNet), label: 'month P&L', tone: k.monthNet >= 0 ? 'positive' : 'negative' };

    case 'biz-parties':
      if (k.parties === 0) return null;
      return { value: String(k.parties), label: `part${k.parties === 1 ? 'y' : 'ies'}`, tone: 'neutral' };

    case 'biz-inventory':
    case 'biz-products':
      if (k.lowStock > 0) return { value: String(k.lowStock), label: 'low stock', tone: 'negative' };
      return { value: String(Object.keys(store.products ?? {}).length), label: 'products', tone: 'neutral' };

    case 'biz-staff':
      if (k.staff === 0) return null;
      return { value: String(k.staff), label: `staff member${k.staff === 1 ? '' : 's'}`, tone: 'neutral' };

    case 'biz-purchases':
      if (k.purchases === 0) return null;
      return { value: String(k.purchases), label: `purchase bill${k.purchases === 1 ? '' : 's'}`, tone: 'neutral' };

    case 'biz-quotations':
      if (k.quotations === 0) return null;
      return { value: String(k.quotations), label: `quotation${k.quotations === 1 ? '' : 's'}`, tone: 'neutral' };

    case 'biz-loans':
      if (k.loans === 0) return null;
      return { value: String(k.loans), label: `active loan${k.loans === 1 ? '' : 's'}`, tone: 'neutral' };

    default: return null;
  }
}

// ── Personal Finance ──────────────────────────────────────────────────────────

interface PFTx { date: string; type: 'credit' | 'debit'; amount: number; isTransfer?: boolean; }
interface PFStore { transactions?: PFTx[]; accounts?: Record<string, unknown>; }

function getPFStore(): PFStore | null {
  const s = safeRead<PFStore | null>('otsd-pf-store', null);
  if (!s) return null;
  return s;
}

function getPFTileData(toolId: string): TileLiveData | null {
  const store = getPFStore();
  if (!store || !Array.isArray(store.transactions) || store.transactions.length === 0) return null;

  const m = thisMonth();
  const monthTxs = store.transactions.filter(t => t.date?.startsWith(m) && !t.isTransfer);
  const monthCredits = monthTxs.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const monthDebits  = monthTxs.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const monthNet     = monthCredits - monthDebits;
  const totalTxs     = store.transactions.length;

  switch (toolId) {
    case 'pf-statement-manager':
      return { value: String(totalTxs), label: `transaction${totalTxs === 1 ? '' : 's'}`, tone: 'neutral' };

    case 'pf-expenses':
    case 'pf-expenditure':
    case 'pf-big-spends':
    case 'pf-top-merchants':
    case 'pf-commitments':
    case 'pf-recurring':
      if (monthDebits === 0) return null;
      return { value: fmtINR(monthDebits), label: 'spent this month', tone: 'neutral' };

    case 'pf-income-sources':
      if (monthCredits === 0) return null;
      return { value: fmtINR(monthCredits), label: 'income this month', tone: 'positive' };

    case 'pf-cash-flow':
    case 'pf-savings-trend':
    case 'pf-month-compare':
    case 'pf-financial-position':
      if (monthNet === 0) return null;
      return { value: fmtINR(monthNet), label: 'net this month', tone: monthNet >= 0 ? 'positive' : 'negative' };

    case 'pf-tx-explorer':
    case 'pf-heatmap':
    case 'pf-behavior':
    case 'pf-labels':
    case 'pf-rules':
      return totalTxs > 0
        ? { value: String(totalTxs), label: 'transactions', tone: 'neutral' }
        : null;

    case 'pf-subscriptions':
      // Estimate recurring debits with same description pattern
      const recurring = store.transactions.filter(t => t.type === 'debit' && (t as any).recurringFlag).length;
      if (recurring === 0) return null;
      return { value: String(recurring), label: 'subscriptions tracked', tone: 'neutral' };

    default: return null;
  }
}

// ── Budget vs Actual ──────────────────────────────────────────────────────────

interface BudgetCategory { budget: number; actual: number; }
interface BudgetStore { categories?: BudgetCategory[]; monthlyIncome?: number; }

function getBudgetTileData(): TileLiveData | null {
  const s = safeRead<BudgetStore>('otsd-budget-vs-actual', { categories: [], monthlyIncome: 0 });
  const cats = s.categories ?? [];
  if (cats.length === 0) return null;

  const totalBudget = cats.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalActual = cats.reduce((sum, c) => sum + (c.actual || 0), 0);
  if (totalBudget === 0) return null;

  const variance = totalBudget - totalActual;
  return {
    value: fmtINR(Math.abs(variance)),
    label: variance >= 0 ? 'under budget' : 'over budget',
    tone: variance >= 0 ? 'positive' : 'negative',
  };
}

// ── Investment Tracker ────────────────────────────────────────────────────────

interface Investment { investedAmount: number; currentValue: number; }

function getInvestmentTileData(): TileLiveData | null {
  const investments = safeRead<Investment[]>('otsd-investment-tracker', []);
  if (investments.length === 0) return null;

  const invested = investments.reduce((s, i) => s + (i.investedAmount || 0), 0);
  const current  = investments.reduce((s, i) => s + (i.currentValue  || 0), 0);
  if (invested === 0) return null;

  const gain    = current - invested;
  const gainPct = ((gain / invested) * 100).toFixed(1);

  return {
    value: `${gain >= 0 ? '+' : ''}${gainPct}%`,
    label: `on ${fmtINR(invested)} invested`,
    tone: gain >= 0 ? 'positive' : 'negative',
  };
}

// ── Financial Snapshot / Health Score ────────────────────────────────────────

function getFinancialSnapshotTileData(toolId: string): TileLiveData | null {
  // These tools store their data in pf-store, so delegate
  return getPFTileData('pf-cash-flow');
}

// ── Spending DNA ──────────────────────────────────────────────────────────────

function getSpendingDnaTileData(): TileLiveData | null {
  return getPFTileData('pf-expenditure');
}

// ── Habit Tracker ─────────────────────────────────────────────────────────────

interface Habit { completions: string[]; }

function getHabitTileData(): TileLiveData | null {
  const habits = safeRead<Habit[]>('otsd-habit-tracker', []);
  if (habits.length === 0) return null;

  const t = today();
  const doneToday = habits.filter(h => Array.isArray(h.completions) && h.completions.includes(t)).length;
  const total     = habits.length;

  return {
    value: `${doneToday}/${total}`,
    label: 'done today',
    tone: doneToday === total ? 'positive' : doneToday > 0 ? 'neutral' : 'negative',
  };
}

// ── Water Tracker ─────────────────────────────────────────────────────────────

interface WaterLog { date: string; glasses: number; }

function getWaterTileData(): TileLiveData | null {
  const logs = safeRead<WaterLog[]>('otsd-water-tracker', []);
  const todayLog = logs.find(l => l.date === today());
  if (!todayLog || todayLog.glasses === 0) return null;

  return {
    value: `${todayLog.glasses}`,
    label: `glass${todayLog.glasses === 1 ? '' : 'es'} today`,
    tone: todayLog.glasses >= 8 ? 'positive' : 'neutral',
  };
}

// ── Life OS ───────────────────────────────────────────────────────────────────

interface LifeTask { date: string; completed: boolean; type?: string; }

function getLifeOsTileData(): TileLiveData | null {
  const tasks = safeRead<LifeTask[]>('lifeos_tasks_v2', []);
  const t = today();
  const todayTasks    = tasks.filter(task => task.date === t);
  const completedToday = todayTasks.filter(task => task.completed).length;
  const totalToday     = todayTasks.length;

  if (totalToday === 0) return null;
  return {
    value: `${completedToday}/${totalToday}`,
    label: 'tasks done today',
    tone: completedToday === totalToday ? 'positive' : completedToday > 0 ? 'neutral' : 'neutral',
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function getTileLiveData(toolId: string): TileLiveData | null {
  if (typeof window === 'undefined') return null;

  try {
    // Business OS
    if (toolId.startsWith('biz-')) return getBizTileData(toolId);

    // Personal Finance (pf- prefix)
    if (toolId.startsWith('pf-')) return getPFTileData(toolId);

    // Standalone stores
    switch (toolId) {
      case 'habit-tracker':        return getHabitTileData();
      case 'water-tracker':        return getWaterTileData();
      case 'calorie-calculator':   return getWaterTileData(); // fallback if key matches
      case 'life-os':              return getLifeOsTileData();
      default:                     return null;
    }
  } catch {
    return null;
  }
}

// Specific overrides for pf tools stored under different keys
const PF_TOOL_OVERRIDES: Record<string, () => TileLiveData | null> = {
  'pf-budget-vs-actual':   getBudgetTileData,
  'pf-investment-tracker': getInvestmentTileData,
  'pf-financial-snapshot': getFinancialSnapshotTileData.bind(null, 'pf-financial-snapshot'),
  'pf-health-score':       getFinancialSnapshotTileData.bind(null, 'pf-health-score'),
  'pf-spending-dna':       getSpendingDnaTileData,
};

export function getTileLiveDataFull(toolId: string): TileLiveData | null {
  if (typeof window === 'undefined') return null;
  try {
    if (toolId in PF_TOOL_OVERRIDES) return PF_TOOL_OVERRIDES[toolId]();
    return getTileLiveData(toolId);
  } catch {
    return null;
  }
}

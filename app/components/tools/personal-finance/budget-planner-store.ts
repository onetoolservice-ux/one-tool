'use client';
// ══════════════════════════════════════════════════════════════════════════════
// budget-planner-store.ts
// Complete data layer for the Monthly Budget Planner
// Separate from pf-budget-vs-actual — full zero-based planning engine
// ══════════════════════════════════════════════════════════════════════════════

import { safeLocalStorage } from '@/app/lib/utils/storage';
import { getPFTransactions, getCommitments, PF_CATEGORIES } from './finance-store';

// ── Types ──────────────────────────────────────────────────────────────────────

export type EnvelopeType = 'regular' | 'sinking-fund' | 'goal' | 'committed';
export type EnvelopePriority = 1 | 2 | 3 | 4 | 5;
export type EnvelopeStatus = 'safe' | 'warning' | 'danger' | 'over';
export type SpecialFlag = 'festival' | 'vacation' | 'annual-dues' | 'tax-season';
export type GoalCategory = 'emergency' | 'travel' | 'purchase' | 'education' | 'vehicle' | 'investment' | 'debt-payoff' | 'custom';
export type VelocityPace = 'on-track' | 'overpacing' | 'underpacing';

export interface Envelope {
  id: string;
  category: string;
  allocated: number;
  rolloverEnabled: boolean;
  rolloverAmount: number;
  priority: EnvelopePriority;
  type: EnvelopeType;
  notes?: string;
  linkedGoalId?: string;
  isCommitted?: boolean;
}

export interface MonthIncome {
  expected: number;
  minScenario?: number;
  maxScenario?: number;
  variableMode: boolean;
}

export interface MonthPlan {
  month: string; // 'YYYY-MM'
  income: MonthIncome;
  envelopes: Envelope[];
  notes?: string;
  specialFlag?: SpecialFlag;
  templateId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  targetDate: string; // 'YYYY-MM-DD'
  currentSaved: number;
  monthlyContribution: number;
  linkedEnvelopeId?: string;
  color: string;
  category: GoalCategory;
  createdAt: string;
}

export interface TemplateAllocation {
  category: string;
  percent: number;
  priority: EnvelopePriority;
  type: EnvelopeType;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  allocations: TemplateAllocation[];
}

export interface BPStoreData {
  months: Record<string, MonthPlan>;
  goals: SavingsGoal[];
  templates: BudgetTemplate[];
  defaultIncome: number;
  lastUpdated: string;
}

// ── Compute Result Types ───────────────────────────────────────────────────────

export interface EnvelopeActuals {
  category: string;
  allocated: number;
  rollover: number;
  available: number;
  actual: number;
  remaining: number;
  status: EnvelopeStatus;
  projectedEOM: number;
  velocity: VelocityPace;
  velocityLabel: string;
  pct: number;
}

export interface MonthHealthReport {
  month: string;
  healthScore: number;
  savingsRate: number;
  categoriesOnTrack: number;
  totalCategories: number;
  totalBudget: number;
  totalActual: number;
  totalIncome: number;
  actualIncome: number;
  unallocated: number;
  breathingRoom: number;
}

export interface AutoSuggestion {
  category: string;
  suggested: number;
  avgActual: number;
  trend: 'up' | 'down' | 'stable';
  months: number; // how many months of data
}

export interface CashFlowEntry {
  day: number;
  type: 'income' | 'expense';
  label: string;
  amount: number;
  isCommitted: boolean;
  category: string;
}

export interface ConsecutiveOverspend {
  category: string;
  consecutiveMonths: number;
  suggestion: number;
  avgOverspend: number;
}

export interface GoalETA {
  months: number;
  date: string;
  canAchieve: boolean;
  onTrack: boolean;
}

// ── Built-in Templates ─────────────────────────────────────────────────────────

const BUILT_IN_TEMPLATES: BudgetTemplate[] = [
  {
    id: 'balanced',
    name: 'Balanced (50/30/20)',
    description: 'Needs 50% · Wants 30% · Savings & Debt 20%',
    isBuiltIn: true,
    allocations: [
      { category: 'Housing',      percent: 27, priority: 1, type: 'committed' },
      { category: 'Grocery',      percent: 10, priority: 1, type: 'regular'   },
      { category: 'Transport',    percent: 6,  priority: 1, type: 'regular'   },
      { category: 'Utilities',    percent: 4,  priority: 1, type: 'regular'   },
      { category: 'Health',       percent: 3,  priority: 1, type: 'regular'   },
      { category: 'Food & Dining',percent: 12, priority: 3, type: 'regular'   },
      { category: 'Shopping',     percent: 10, priority: 3, type: 'regular'   },
      { category: 'Travel',       percent: 5,  priority: 4, type: 'regular'   },
      { category: 'Entertainment',percent: 3,  priority: 4, type: 'regular'   },
      { category: 'Investment',   percent: 10, priority: 2, type: 'regular'   },
      { category: 'Savings',      percent: 5,  priority: 2, type: 'goal'      },
      { category: 'Miscellaneous',percent: 5,  priority: 5, type: 'regular'   },
    ],
  },
  {
    id: 'conservative',
    name: 'Conservative Saver',
    description: 'Needs 40% · Wants 20% · Savings 40%',
    isBuiltIn: true,
    allocations: [
      { category: 'Housing',      percent: 25, priority: 1, type: 'committed' },
      { category: 'Grocery',      percent: 8,  priority: 1, type: 'regular'   },
      { category: 'Transport',    percent: 5,  priority: 1, type: 'regular'   },
      { category: 'Utilities',    percent: 3,  priority: 1, type: 'regular'   },
      { category: 'Food & Dining',percent: 8,  priority: 3, type: 'regular'   },
      { category: 'Shopping',     percent: 7,  priority: 4, type: 'regular'   },
      { category: 'Entertainment',percent: 4,  priority: 5, type: 'regular'   },
      { category: 'Investment',   percent: 20, priority: 1, type: 'regular'   },
      { category: 'Savings',      percent: 16, priority: 2, type: 'goal'      },
      { category: 'Miscellaneous',percent: 4,  priority: 5, type: 'regular'   },
    ],
  },
  {
    id: 'debt-destroyer',
    name: 'Debt Destroyer',
    description: 'Minimum living + maximum debt payoff',
    isBuiltIn: true,
    allocations: [
      { category: 'Housing',      percent: 28, priority: 1, type: 'committed' },
      { category: 'Grocery',      percent: 10, priority: 1, type: 'regular'   },
      { category: 'Transport',    percent: 5,  priority: 1, type: 'regular'   },
      { category: 'Utilities',    percent: 4,  priority: 1, type: 'regular'   },
      { category: 'Health',       percent: 2,  priority: 1, type: 'regular'   },
      { category: 'Loan/EMI',     percent: 28, priority: 1, type: 'committed' },
      { category: 'Food & Dining',percent: 6,  priority: 4, type: 'regular'   },
      { category: 'Shopping',     percent: 4,  priority: 5, type: 'regular'   },
      { category: 'Savings',      percent: 8,  priority: 2, type: 'goal'      },
      { category: 'Miscellaneous',percent: 5,  priority: 5, type: 'regular'   },
    ],
  },
  {
    id: 'first-job',
    name: 'First Job Starter',
    description: 'Simple beginner template — build habits first',
    isBuiltIn: true,
    allocations: [
      { category: 'Housing',      percent: 30, priority: 1, type: 'committed' },
      { category: 'Grocery',      percent: 12, priority: 1, type: 'regular'   },
      { category: 'Transport',    percent: 8,  priority: 1, type: 'regular'   },
      { category: 'Utilities',    percent: 5,  priority: 1, type: 'regular'   },
      { category: 'Food & Dining',percent: 10, priority: 3, type: 'regular'   },
      { category: 'Shopping',     percent: 8,  priority: 4, type: 'regular'   },
      { category: 'Entertainment',percent: 5,  priority: 4, type: 'regular'   },
      { category: 'Investment',   percent: 10, priority: 2, type: 'regular'   },
      { category: 'Savings',      percent: 5,  priority: 2, type: 'goal'      },
      { category: 'Miscellaneous',percent: 7,  priority: 5, type: 'regular'   },
    ],
  },
  {
    id: 'festival-month',
    name: 'Festival Month',
    description: 'Higher shopping + gifts + travel budget',
    isBuiltIn: true,
    allocations: [
      { category: 'Housing',      percent: 22, priority: 1, type: 'committed' },
      { category: 'Grocery',      percent: 10, priority: 1, type: 'regular'   },
      { category: 'Transport',    percent: 5,  priority: 1, type: 'regular'   },
      { category: 'Utilities',    percent: 3,  priority: 1, type: 'regular'   },
      { category: 'Food & Dining',percent: 12, priority: 3, type: 'regular'   },
      { category: 'Shopping',     percent: 18, priority: 3, type: 'regular'   },
      { category: 'Travel',       percent: 10, priority: 3, type: 'regular'   },
      { category: 'Entertainment',percent: 5,  priority: 4, type: 'regular'   },
      { category: 'Investment',   percent: 8,  priority: 2, type: 'regular'   },
      { category: 'Savings',      percent: 3,  priority: 5, type: 'goal'      },
      { category: 'Miscellaneous',percent: 4,  priority: 5, type: 'regular'   },
    ],
  },
];

// ── Storage ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'otsd-monthly-budget-planner';

export function loadBPStore(): BPStoreData {
  return safeLocalStorage.getItem<BPStoreData>(STORAGE_KEY, {
    months: {}, goals: [], templates: [], defaultIncome: 75000,
    lastUpdated: new Date().toISOString(),
  }) ?? { months: {}, goals: [], templates: [], defaultIncome: 75000, lastUpdated: new Date().toISOString() };
}

function saveBPStore(data: BPStoreData): void {
  data.lastUpdated = new Date().toISOString();
  safeLocalStorage.setItem(STORAGE_KEY, data);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('bp-store-updated'));
  }
}

// ── ID generator ───────────────────────────────────────────────────────────────

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Month Plan ─────────────────────────────────────────────────────────────────

export function getMonthPlan(month: string): MonthPlan | null {
  return loadBPStore().months[month] ?? null;
}

export function getAllMonthPlans(): MonthPlan[] {
  const store = loadBPStore();
  return Object.values(store.months).sort((a, b) => b.month.localeCompare(a.month));
}

export function getOrCreateMonthPlan(month: string): MonthPlan {
  const existing = getMonthPlan(month);
  if (existing) return existing;

  // Try copying from previous month
  const [y, m] = month.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prev = getMonthPlan(prevKey);

  const store = loadBPStore();
  const newPlan: MonthPlan = {
    month,
    income: prev
      ? { ...prev.income }
      : { expected: store.defaultIncome, variableMode: false },
    envelopes: prev
      ? prev.envelopes.map(e => ({
          ...e,
          id: uid('env'),
          rolloverAmount: e.rolloverEnabled ? _computeRollover(prevKey, e.category, e) : 0,
        }))
      : [],
  };

  store.months[month] = newPlan;
  saveBPStore(store);
  return newPlan;
}

export function saveMonthPlan(plan: MonthPlan): void {
  const store = loadBPStore();
  store.months[plan.month] = plan;
  saveBPStore(store);
}

export function updateMonthIncome(month: string, income: Partial<MonthIncome>): void {
  const store = loadBPStore();
  if (!store.months[month]) return;
  store.months[month].income = { ...store.months[month].income, ...income };
  saveBPStore(store);
}

export function updateMonthNotes(month: string, notes: string): void {
  const store = loadBPStore();
  if (!store.months[month]) return;
  store.months[month].notes = notes;
  saveBPStore(store);
}

export function updateMonthFlag(month: string, flag: SpecialFlag | undefined): void {
  const store = loadBPStore();
  if (!store.months[month]) return;
  store.months[month].specialFlag = flag;
  saveBPStore(store);
}

export function deleteMonthPlan(month: string): void {
  const store = loadBPStore();
  delete store.months[month];
  saveBPStore(store);
}

// ── Envelope CRUD ──────────────────────────────────────────────────────────────

export function addEnvelope(month: string, envelope: Omit<Envelope, 'id'>): Envelope {
  const store = loadBPStore();
  const plan = store.months[month];
  if (!plan) return {} as Envelope;
  const newEnv: Envelope = { ...envelope, id: uid('env') };
  plan.envelopes.push(newEnv);
  saveBPStore(store);
  return newEnv;
}

export function updateEnvelope(month: string, envelopeId: string, updates: Partial<Envelope>): void {
  const store = loadBPStore();
  const plan = store.months[month];
  if (!plan) return;
  plan.envelopes = plan.envelopes.map(e => e.id === envelopeId ? { ...e, ...updates } : e);
  saveBPStore(store);
}

export function removeEnvelope(month: string, envelopeId: string): void {
  const store = loadBPStore();
  const plan = store.months[month];
  if (!plan) return;
  plan.envelopes = plan.envelopes.filter(e => e.id !== envelopeId);
  saveBPStore(store);
}

export function moveMoneyBetweenEnvelopes(month: string, fromId: string, toId: string, amount: number): void {
  const store = loadBPStore();
  const plan = store.months[month];
  if (!plan) return;
  plan.envelopes = plan.envelopes.map(e => {
    if (e.id === fromId) return { ...e, allocated: Math.max(0, e.allocated - amount) };
    if (e.id === toId)   return { ...e, allocated: e.allocated + amount };
    return e;
  });
  saveBPStore(store);
}

export function reorderEnvelopes(month: string, orderedIds: string[]): void {
  const store = loadBPStore();
  const plan = store.months[month];
  if (!plan) return;
  const map = Object.fromEntries(plan.envelopes.map(e => [e.id, e]));
  plan.envelopes = orderedIds.map(id => map[id]).filter(Boolean);
  saveBPStore(store);
}

// ── Actuals from PF store ──────────────────────────────────────────────────────

export function computeAllActuals(month: string): Record<string, number> {
  const txns = getPFTransactions({ type: 'debit' }).filter(
    t => t.date.startsWith(month) && !t.isTransfer
  );
  const result: Record<string, number> = {};
  for (const t of txns) {
    result[t.category] = (result[t.category] ?? 0) + t.amount;
  }
  return result;
}

export function computeActualForCategory(month: string, category: string): number {
  return getPFTransactions({ type: 'debit' }).filter(
    t => t.date.startsWith(month) && t.category === category && !t.isTransfer
  ).reduce((s, t) => s + t.amount, 0);
}

export function computeMonthActualIncome(month: string): number {
  return getPFTransactions({ type: 'credit' }).filter(
    t => t.date.startsWith(month) && !t.isTransfer
  ).reduce((s, t) => s + t.amount, 0);
}

// ── Rollover ───────────────────────────────────────────────────────────────────

function _computeRollover(month: string, category: string, envelope: Envelope): number {
  const actual = computeActualForCategory(month, category);
  const available = envelope.allocated + envelope.rolloverAmount;
  return Math.max(0, available - actual);
}

// ── Auto-Suggest Budgets ───────────────────────────────────────────────────────

export function getAutoSuggestions(): AutoSuggestion[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const catData: Record<string, number[]> = {};
  for (const month of months) {
    const actuals = computeAllActuals(month);
    for (const [cat, amt] of Object.entries(actuals)) {
      if (amt > 0) {
        if (!catData[cat]) catData[cat] = [];
        catData[cat].push(amt);
      }
    }
  }

  return Object.entries(catData)
    .filter(([, vals]) => vals.length >= 1)
    .map(([category, vals]) => {
      const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
      const suggested = Math.ceil((avg * 1.05) / 500) * 500; // 5% buffer, round to 500

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (vals.length >= 2) {
        const delta = (vals[0] - vals[vals.length - 1]) / (vals[vals.length - 1] || 1);
        if (delta > 0.1) trend = 'up';
        else if (delta < -0.1) trend = 'down';
      }

      return { category, suggested, avgActual: Math.round(avg), trend, months: vals.length };
    })
    .sort((a, b) => b.avgActual - a.avgActual);
}

// ── Envelope Health ────────────────────────────────────────────────────────────

export function getEnvelopeStatus(available: number, actual: number): EnvelopeStatus {
  if (available === 0) return actual > 0 ? 'over' : 'safe';
  const pct = (actual / available) * 100;
  if (pct > 100) return 'over';
  if (pct >= 90) return 'danger';
  if (pct >= 75) return 'warning';
  return 'safe';
}

export function getSpendingVelocity(month: string, actual: number, allocated: number): {
  pace: VelocityPace; label: string;
} {
  if (allocated === 0) return { pace: 'on-track', label: 'No budget set' };

  const now = new Date();
  const [y, m] = month.split('-').map(Number);
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() + 1 === m;
  if (!isCurrentMonth) return { pace: 'on-track', label: 'Past month' };

  const daysInMonth = new Date(y, m, 0).getDate();
  const elapsed = now.getDate() / daysInMonth;
  const spentPct = actual / allocated;
  const ratio = elapsed > 0 ? spentPct / elapsed : 0;

  if (ratio > 1.25) return { pace: 'overpacing', label: `${Math.round(ratio * 100)}% of normal pace` };
  if (ratio < 0.6)  return { pace: 'underpacing', label: `${Math.round(ratio * 100)}% of normal pace` };
  return { pace: 'on-track', label: 'On track' };
}

export function getProjectedEOM(month: string, actual: number): number {
  const now = new Date();
  const [y, m] = month.split('-').map(Number);
  if (now.getFullYear() !== y || now.getMonth() + 1 !== m) return actual;
  const daysInMonth = new Date(y, m, 0).getDate();
  const day = now.getDate();
  if (day === 0) return actual;
  return Math.round((actual / day) * daysInMonth);
}

// ── Full Envelope Actuals ──────────────────────────────────────────────────────

export function getEnvelopeActuals(month: string): EnvelopeActuals[] {
  const plan = getMonthPlan(month);
  if (!plan) return [];
  const actuals = computeAllActuals(month);

  return plan.envelopes.map(e => {
    const actual = actuals[e.category] ?? 0;
    const available = e.allocated + e.rolloverAmount;
    const remaining = available - actual;
    const pct = available > 0 ? Math.min(200, (actual / available) * 100) : 0;
    const status = getEnvelopeStatus(available, actual);
    const projectedEOM = getProjectedEOM(month, actual);
    const { pace, label } = getSpendingVelocity(month, actual, e.allocated);

    return {
      category: e.category,
      allocated: e.allocated,
      rollover: e.rolloverAmount,
      available,
      actual,
      remaining,
      status,
      projectedEOM,
      velocity: pace,
      velocityLabel: label,
      pct,
    };
  });
}

// ── Month Health Report ────────────────────────────────────────────────────────

export function computeMonthHealth(month: string): MonthHealthReport {
  const plan = getMonthPlan(month);
  const empty: MonthHealthReport = {
    month, healthScore: 0, savingsRate: 0, categoriesOnTrack: 0,
    totalCategories: 0, totalBudget: 0, totalActual: 0, totalIncome: 0,
    actualIncome: 0, unallocated: 0, breathingRoom: 0,
  };
  if (!plan) return empty;

  const actuals = computeAllActuals(month);
  const actualIncome = computeMonthActualIncome(month);
  const income = plan.income.expected;

  const totalBudget = plan.envelopes.reduce((s, e) => s + e.allocated + e.rolloverAmount, 0);
  let totalActual = 0, onTrack = 0;
  let committedTotal = 0;

  for (const e of plan.envelopes) {
    const actual = actuals[e.category] ?? 0;
    totalActual += actual;
    const status = getEnvelopeStatus(e.allocated + e.rolloverAmount, actual);
    if (status === 'safe' || status === 'warning') onTrack++;
    if (e.isCommitted || e.type === 'committed') committedTotal += e.allocated;
  }

  const unallocated = income - totalBudget;
  const savingsRate = income > 0 ? Math.max(0, ((income - totalActual) / income) * 100) : 0;
  const breathingRoom = income - committedTotal - (totalActual - (actuals['Housing'] ?? 0) - (actuals['Loan/EMI'] ?? 0));

  // Score: 40 pts adherence, 40 pts savings, 20 pts zero-based allocation
  const adherenceScore = plan.envelopes.length > 0 ? (onTrack / plan.envelopes.length) * 40 : 0;
  const savingsScore = Math.min(40, savingsRate * 2);
  const allocationScore = Math.abs(unallocated) < income * 0.05 ? 20 : unallocated < 0 ? 0 : 10;
  const healthScore = Math.round(Math.min(100, adherenceScore + savingsScore + allocationScore));

  return {
    month, healthScore, savingsRate, categoriesOnTrack: onTrack,
    totalCategories: plan.envelopes.length, totalBudget, totalActual,
    totalIncome: income, actualIncome, unallocated, breathingRoom,
  };
}

// ── Cash Flow Calendar ─────────────────────────────────────────────────────────

export function getCashFlowCalendar(month: string): CashFlowEntry[] {
  const entries: CashFlowEntry[] = [];

  // Committed recurring obligations
  const commitments = getCommitments(false);
  for (const c of commitments) {
    if (c.userDismissed) continue;
    const txns = getPFTransactions({ type: 'debit' }).filter(
      t => t.date.startsWith(month) && t.recurringFlag &&
        (c.merchant ? t.description.toLowerCase().includes(c.merchant.toLowerCase()) : t.category === c.category)
    );
    const day = txns.length > 0 ? parseInt(txns[0].date.split('-')[2]) : 5;
    entries.push({
      day, type: 'expense',
      label: c.merchant || c.category,
      amount: c.monthlyEquivalent,
      isCommitted: true,
      category: c.category,
    });
  }

  // Actual transactions this month
  const txns = getPFTransactions().filter(t => t.date.startsWith(month) && !t.isTransfer);
  for (const t of txns) {
    const day = parseInt(t.date.split('-')[2]);
    // Avoid duplicating committed items
    const isDup = entries.some(e =>
      e.isCommitted && e.day === day &&
      Math.abs(e.amount - t.amount) < e.amount * 0.1
    );
    if (!isDup) {
      entries.push({
        day, type: t.type === 'credit' ? 'income' : 'expense',
        label: t.description.slice(0, 35),
        amount: t.amount,
        isCommitted: t.recurringFlag,
        category: t.category,
      });
    }
  }

  return entries.sort((a, b) => a.day - b.day);
}

// ── Consecutive Overspend Detection ───────────────────────────────────────────

export function getConsecutiveOverspend(): ConsecutiveOverspend[] {
  const now = new Date();
  const months: string[] = [];
  for (let i = 1; i <= 4; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const overData: Record<string, { count: number; overAmounts: number[] }> = {};

  for (const month of months) {
    const plan = getMonthPlan(month);
    if (!plan) continue;
    const actuals = computeAllActuals(month);
    for (const e of plan.envelopes) {
      const actual = actuals[e.category] ?? 0;
      const available = e.allocated + e.rolloverAmount;
      if (actual > available) {
        if (!overData[e.category]) overData[e.category] = { count: 0, overAmounts: [] };
        overData[e.category].count++;
        overData[e.category].overAmounts.push(actual - available);
      }
    }
  }

  return Object.entries(overData)
    .filter(([, d]) => d.count >= 2)
    .map(([category, d]) => {
      const avgOverspend = d.overAmounts.reduce((s, v) => s + v, 0) / d.overAmounts.length;
      const suggestions = getAutoSuggestions();
      const suggestion = suggestions.find(s => s.category === category)?.suggested ?? 0;
      return { category, consecutiveMonths: d.count, suggestion, avgOverspend: Math.round(avgOverspend) };
    });
}

// ── Goals ──────────────────────────────────────────────────────────────────────

export function getGoals(): SavingsGoal[] {
  return loadBPStore().goals;
}

export function addGoal(goal: Omit<SavingsGoal, 'id' | 'createdAt'>): SavingsGoal {
  const store = loadBPStore();
  const newGoal: SavingsGoal = { ...goal, id: uid('goal'), createdAt: new Date().toISOString() };
  store.goals.push(newGoal);
  saveBPStore(store);
  return newGoal;
}

export function updateGoal(id: string, updates: Partial<SavingsGoal>): void {
  const store = loadBPStore();
  store.goals = store.goals.map(g => g.id === id ? { ...g, ...updates } : g);
  saveBPStore(store);
}

export function deleteGoal(id: string): void {
  const store = loadBPStore();
  store.goals = store.goals.filter(g => g.id !== id);
  saveBPStore(store);
}

export function computeGoalETA(goal: SavingsGoal, overrideContribution?: number): GoalETA {
  const contribution = overrideContribution ?? goal.monthlyContribution;
  const remaining = Math.max(0, goal.targetAmount - goal.currentSaved);
  if (remaining === 0) return { months: 0, date: 'Achieved!', canAchieve: true, onTrack: true };
  if (contribution <= 0) return { months: Infinity, date: 'Set a monthly contribution', canAchieve: false, onTrack: false };

  const months = Math.ceil(remaining / contribution);
  const eta = new Date();
  eta.setMonth(eta.getMonth() + months);
  const date = eta.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  let canAchieve = true;
  let onTrack = true;
  if (goal.targetDate) {
    const target = new Date(goal.targetDate);
    canAchieve = eta <= target;
    onTrack = canAchieve;
  }

  return { months, date, canAchieve, onTrack };
}

// ── Templates ──────────────────────────────────────────────────────────────────

export function getTemplates(): BudgetTemplate[] {
  return [...BUILT_IN_TEMPLATES, ...loadBPStore().templates];
}

export function saveCustomTemplate(template: Omit<BudgetTemplate, 'id' | 'isBuiltIn'>): BudgetTemplate {
  const store = loadBPStore();
  const t: BudgetTemplate = { ...template, id: uid('tmpl'), isBuiltIn: false };
  store.templates.push(t);
  saveBPStore(store);
  return t;
}

export function deleteCustomTemplate(id: string): void {
  const store = loadBPStore();
  store.templates = store.templates.filter(t => t.id !== id);
  saveBPStore(store);
}

export function applyTemplateToMonth(month: string, templateId: string): void {
  const template = getTemplates().find(t => t.id === templateId);
  if (!template) return;
  const plan = getOrCreateMonthPlan(month);
  const income = plan.income.expected;

  const envelopes: Envelope[] = template.allocations.map(a => ({
    id: uid('env'),
    category: a.category,
    allocated: Math.round((income * a.percent) / 100),
    rolloverEnabled: a.type !== 'committed',
    rolloverAmount: 0,
    priority: a.priority,
    type: a.type,
  }));

  saveMonthPlan({ ...plan, envelopes, templateId });
}

export function saveCurrentMonthAsTemplate(month: string, name: string, description: string): BudgetTemplate {
  const plan = getMonthPlan(month);
  const income = plan?.income.expected || 1;
  const allocations: TemplateAllocation[] = (plan?.envelopes ?? []).map(e => ({
    category: e.category,
    percent: Math.round((e.allocated / income) * 100),
    priority: e.priority,
    type: e.type,
  }));
  return saveCustomTemplate({ name, description, allocations });
}

// ── Default Income ─────────────────────────────────────────────────────────────

export function getDefaultIncome(): number {
  return loadBPStore().defaultIncome;
}

export function setDefaultIncome(income: number): void {
  const store = loadBPStore();
  store.defaultIncome = income;
  saveBPStore(store);
}

// ── Utility: available PF categories ──────────────────────────────────────────

export function getAvailablePFCategories(): string[] {
  return [...PF_CATEGORIES, 'Savings', 'Emergency Fund', 'Sinking Fund'];
}

// ── 50/30/20 mapping ──────────────────────────────────────────────────────────

const NEEDS_CATEGORIES = new Set(['Housing', 'Grocery', 'Transport', 'Utilities', 'Health', 'Education', 'Insurance', 'Loan/EMI']);
const SAVINGS_CATEGORIES = new Set(['Investment', 'Savings', 'Emergency Fund', 'Sinking Fund']);

export function categorize5030(category: string): 'needs' | 'wants' | 'savings' {
  if (NEEDS_CATEGORIES.has(category)) return 'needs';
  if (SAVINGS_CATEGORIES.has(category)) return 'savings';
  return 'wants';
}

export interface BucketBreakdown {
  needs:   { allocated: number; pct: number };
  wants:   { allocated: number; pct: number };
  savings: { allocated: number; pct: number };
}

export function compute5030Breakdown(month: string): BucketBreakdown {
  const plan = getMonthPlan(month);
  const income = plan?.income.expected || 1;
  const totals = { needs: 0, wants: 0, savings: 0 };
  for (const e of plan?.envelopes ?? []) {
    totals[categorize5030(e.category)] += e.allocated;
  }
  return {
    needs:   { allocated: totals.needs,   pct: (totals.needs   / income) * 100 },
    wants:   { allocated: totals.wants,   pct: (totals.wants   / income) * 100 },
    savings: { allocated: totals.savings, pct: (totals.savings / income) * 100 },
  };
}

// ── Festival calendar hints ────────────────────────────────────────────────────

interface FestivalHint {
  name: string;
  month: number; // 1-12
  hint: string;
}

const FESTIVAL_HINTS: FestivalHint[] = [
  { name: 'Holi',         month: 3,  hint: 'Budget for colors, sweets, and celebrations' },
  { name: 'Eid',          month: 4,  hint: 'Gifts, new clothes, and feasting budget' },
  { name: 'Onam',         month: 8,  hint: 'Sadya, flowers, and family get-togethers' },
  { name: 'Navratri',     month: 10, hint: 'Garba outfits, dandiya events, and fasting meals' },
  { name: 'Diwali',       month: 10, hint: 'Shopping, gifts, crackers, and sweets — plan 4–6 weeks ahead' },
  { name: 'Christmas',    month: 12, hint: 'Gifts, travel, and celebrations' },
  { name: 'New Year',     month: 1,  hint: 'Party budget and first-of-year financial reset' },
  { name: 'Tax Season',   month: 3,  hint: '80C investment deadline March 31 — plan ELSS, PPF, NPS contributions' },
];

export function getFestivalHintsForMonth(month: string): FestivalHint[] {
  const m = parseInt(month.split('-')[1]);
  return FESTIVAL_HINTS.filter(f => f.month === m);
}

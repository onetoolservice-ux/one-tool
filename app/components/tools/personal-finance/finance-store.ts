/**
 * Personal Finance Shared Data Store — Production-Ready v2
 *
 * Deterministic financial ledger engine. No advice, no predictions.
 * All categorisation is provisional until user confirms.
 * User override always wins.
 */

// ── Re-use pure utilities from analytics-store ────────────────────────────────
export {
  parseDate,
  parseAmount,
  detectColumns,
  autoCategory,
} from '../analytics/analytics-store';

export type { DetectedColumns } from '../analytics/analytics-store';

import {
  parseDate,
  parseAmount,
  autoCategory,
  type DetectedColumns,
} from '../analytics/analytics-store';

// ── Core Entity Types ─────────────────────────────────────────────────────────

export interface PFAccount {
  id: string;
  name: string;
  type: 'bank' | 'credit_card' | 'cash' | 'other';
  currency: string;
  createdAt: string;
}

export interface PFStatement {
  id: string;
  accountId: string;
  fileName: string;
  uploadedAt: string;
  periodFrom: string;
  periodTo: string;
  fileType: 'csv' | 'excel';
  integrityScore: number;    // 0–100 (replaces vague parsingConfidence)
  parsingConfidence: number; // kept for backward compat, same as integrityScore
  transactionCount: number;
  duplicateCount: number;
  unclassifiedCount: number;
  missingDateCount: number;
  invalidAmountCount: number;
  missingDataFlags: string[];
  detectedColumns: DetectedColumns;
  rawHeaders: string[];
}

export interface PFTransaction {
  id: string;
  accountId: string;
  statementId: string;
  date: string;               // YYYY-MM-DD; required
  type: 'credit' | 'debit';
  amount: number;             // always positive
  description: string;
  category: string;
  subcategory: string;
  isTransfer: boolean;        // user-marked as inter-account transfer
  isLoan: boolean;            // user-marked as loan/EMI payment
  recurringFlag: boolean;
  userOverrideFlag: boolean;  // category was manually changed
  createdAt: string;
  rawData: Record<string, string>;
}

export interface PFCommitment {
  id: string;
  merchant: string;
  normalizedMerchant: string;
  frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'annual' | 'one-time';
  intervalDays: number;
  monthlyEquivalent: number;
  annualizedCost: number;
  firstDetected: string;
  lastDetected: string;
  transactionIds: string[];
  category: string;           // assigned category
  userConfirmed: boolean;
  userDismissed: boolean;
  manuallyAdded: boolean;
  convertedToOneTime: boolean;
}

export interface PFLabel {
  id: string;
  name: string;
  color: string; // hex or tailwind color key
}

export interface PFRule {
  id: string;
  conditionType: 'merchant_contains' | 'amount_min' | 'amount_max' | 'type_is';
  conditionValue: string;
  assignedCategory: string;
  active: boolean;
  createdAt: string;
}

export interface TransactionLabelMap {
  transactionId: string;
  labelId: string;
}

export interface CategoryOverride {
  transactionId: string;
  fromCategory: string;
  toCategory: string;
  appliedAt: string;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalOutflow: number;
  netSurplus: number;
  savingsRate: number;          // %
  commitmentRatio: number;      // %
  discretionaryRatio: number;   // %
  debtServicingRatio: number;   // %
  // Breakdown
  salary: number;
  otherCredits: number;
  essential: number;
  commitments: number;
  discretionary: number;
  transfers: number;
  debtServicing: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];    // blocking — prevent dashboard computation
  warnings: string[];  // non-blocking — show banner
}

// ── Store ─────────────────────────────────────────────────────────────────────

export interface PFStoreData {
  accounts: Record<string, PFAccount>;
  statements: Record<string, PFStatement>;
  transactions: PFTransaction[];
  commitments: Record<string, PFCommitment>;
  categoryOverrides: CategoryOverride[];
  userCategories: string[];
  labels: Record<string, PFLabel>;
  labelMaps: TransactionLabelMap[];
  rules: Record<string, PFRule>;
  lastUpdated: string;
}

// ── Category Definitions ──────────────────────────────────────────────────────

export const SALARY_CATEGORIES        = ['Salary'];
export const INCOME_CATEGORIES        = ['Salary', 'Freelance', 'Returns', 'Refund', 'Other Income'];
export const ESSENTIAL_CATEGORIES     = ['Housing', 'Utilities', 'Grocery', 'Health', 'Education', 'Transport'];
export const COMMITMENT_CATEGORIES    = ['Housing', 'Insurance'];
export const DISCRETIONARY_CATEGORIES = ['Food & Dining', 'Shopping', 'Travel'];
export const DEBT_CATEGORIES          = ['Loan/EMI'];
export const TRANSFER_CATEGORIES      = ['Transfer'];
export const SELF_TRANSFER_CATEGORIES = ['Self Transfer'];

/** All system-defined categories. User-defined are appended from store.userCategories. */
export const PF_CATEGORIES: string[] = [
  // Income
  'Salary', 'Freelance', 'Returns', 'Refund', 'Other Income',
  // Essential
  'Housing', 'Utilities', 'Grocery', 'Health', 'Education', 'Transport',
  // Commitments
  'Insurance',
  // Discretionary
  'Food & Dining', 'Shopping', 'Travel',
  // Investment / Debt / Transfer
  'Investment', 'Loan/EMI', 'Transfer', 'Self Transfer',
  // Catch-all
  'Miscellaneous',
];

// ── Storage ───────────────────────────────────────────────────────────────────

const PF_STORAGE_KEY = 'otsd-pf-store';

function emptyStore(): PFStoreData {
  return {
    accounts: {},
    statements: {},
    transactions: [],
    commitments: {},
    categoryOverrides: [],
    userCategories: [],
    labels: {},
    labelMaps: [],
    rules: {},
    lastUpdated: new Date().toISOString(),
  };
}

export function loadPFStore(): PFStoreData {
  try {
    if (typeof window === 'undefined') return emptyStore();
    const raw = localStorage.getItem(PF_STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as PFStoreData;
      // ── Forward-migration for older stores ────────────────────────────────
      if (!data.labels)    data.labels    = {};
      if (!data.labelMaps) data.labelMaps = [];
      if (!data.rules)     data.rules     = {};
      for (const t of data.transactions ?? []) {
        if (t.isTransfer  === undefined) t.isTransfer  = false;
        if (t.isLoan      === undefined) t.isLoan      = false;
        if (t.createdAt   === undefined) t.createdAt   = t.date || new Date().toISOString();
      }
      for (const c of Object.values(data.commitments ?? {})) {
        if (c.category        === undefined) c.category        = 'Miscellaneous';
        if (c.convertedToOneTime === undefined) c.convertedToOneTime = false;
        if (c.frequency === ('one-time' as string) && c.convertedToOneTime === undefined) {
          c.convertedToOneTime = true;
        }
      }
      for (const s of Object.values(data.statements ?? {})) {
        if (s.integrityScore    === undefined) s.integrityScore    = s.parsingConfidence ?? 80;
        if (s.missingDateCount  === undefined) s.missingDateCount  = 0;
        if (s.invalidAmountCount=== undefined) s.invalidAmountCount= 0;
      }
      return data;
    }
  } catch { /* ignore */ }
  return emptyStore();
}

export function savePFStore(data: PFStoreData): void {
  data.lastUpdated = new Date().toISOString();
  if (typeof window !== 'undefined') {
    localStorage.setItem(PF_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('pf-store-updated'));
  }
}

// ── Account Operations ────────────────────────────────────────────────────────

export function addAccount(account: Omit<PFAccount, 'id' | 'createdAt'>): PFAccount {
  const store = loadPFStore();
  const id = `acc-${Date.now()}`;
  const newAcc: PFAccount = { ...account, id, createdAt: new Date().toISOString() };
  store.accounts[id] = newAcc;
  savePFStore(store);
  return newAcc;
}

export function getAccounts(): PFAccount[] {
  return Object.values(loadPFStore().accounts);
}

export function deleteAccount(accountId: string): void {
  const store = loadPFStore();
  delete store.accounts[accountId];
  const stmtIds = Object.values(store.statements)
    .filter(s => s.accountId === accountId)
    .map(s => s.id);
  stmtIds.forEach(id => delete store.statements[id]);
  store.transactions = store.transactions.filter(t => t.accountId !== accountId);
  savePFStore(store);
}

// ── Statement Operations ──────────────────────────────────────────────────────

export function getStatements(accountId?: string): PFStatement[] {
  const all = Object.values(loadPFStore().statements);
  return accountId ? all.filter(s => s.accountId === accountId) : all;
}

export function deleteStatement(statementId: string): void {
  const store = loadPFStore();
  delete store.statements[statementId];
  store.transactions = store.transactions.filter(t => t.statementId !== statementId);
  detectAndSaveRecurring(store);
  savePFStore(store);
}

/** Returns the full date range covered by all statements, or null if no statements. */
export function getStatementCoverageRange(): { from: string; to: string } | null {
  const stmts = Object.values(loadPFStore().statements);
  if (stmts.length === 0) return null;
  const froms = stmts.map(s => s.periodFrom).filter(Boolean).sort();
  const tos   = stmts.map(s => s.periodTo).filter(Boolean).sort();
  if (froms.length === 0 || tos.length === 0) return null;
  return { from: froms[0], to: tos[tos.length - 1] };
}

export function getLastUpdatedTimestamp(): string {
  return loadPFStore().lastUpdated;
}

// ── Build PF Transactions ─────────────────────────────────────────────────────

// Words that indicate transaction direction, not a real category
const DIRECTION_WORDS = new Set(['debit', 'credit', 'dr', 'cr', 'withdrawal', 'deposit', 'purchase']);

export function buildPFTransactions(
  headers: string[],
  rows: string[][],
  columns: DetectedColumns,
  accountId: string,
  statementId: string,
): PFTransaction[] {
  const dateIdx = columns.date ? headers.indexOf(columns.date) : -1;
  const descIdx = columns.description ? headers.indexOf(columns.description) : -1;
  const catIdx  = columns.category ? headers.indexOf(columns.category) : -1;

  let lastDate = ''; // forward-fill: many bank statements only print the date on the first row of a day

  return rows
    .map((row, idx) => {
      const rawData: Record<string, string> = {};
      headers.forEach((h, i) => { rawData[h] = (row[i] ?? '').toString(); });

      const description = descIdx >= 0 ? (row[descIdx] ?? '').toString().trim() : '';
      if (!description) return null;

      // Forward-fill dates: if this row's date cell is empty/unparseable, reuse the last valid date
      const parsedDate = dateIdx >= 0 ? (parseDate(row[dateIdx]) ?? '') : '';
      if (parsedDate) lastDate = parsedDate;
      const date = parsedDate || lastDate;

      let amount = 0;
      let type: 'credit' | 'debit' = 'debit';

      if (columns.creditAmount && columns.debitAmount) {
        const crIdx = headers.indexOf(columns.creditAmount);
        const drIdx = headers.indexOf(columns.debitAmount);
        const crAmt = crIdx >= 0 ? parseAmount(row[crIdx]) : 0;
        const drAmt = drIdx >= 0 ? parseAmount(row[drIdx]) : 0;
        if (crAmt > 0) { amount = crAmt; type = 'credit'; }
        else if (drAmt > 0) { amount = Math.abs(drAmt); type = 'debit'; }
      } else if (columns.amount) {
        const amtIdx = headers.indexOf(columns.amount);
        const rawAmt = amtIdx >= 0 ? parseAmount(row[amtIdx]) : 0;
        amount = Math.abs(rawAmt);
        type = rawAmt >= 0 ? 'credit' : 'debit';
      }

      if (amount === 0) return null;

      // Use the file's category column only if it contains a real category, not a direction word
      const rawCat = catIdx >= 0 ? (row[catIdx] ?? '').toString().trim() : '';
      const category = (rawCat && !DIRECTION_WORDS.has(rawCat.toLowerCase()))
        ? rawCat
        : autoCategory(description);

      return {
        id: `pft-${statementId}-${idx}`,
        accountId,
        statementId,
        date,
        type,
        amount,
        description,
        category,
        subcategory: '',
        isTransfer: false,
        isLoan: false,
        recurringFlag: false,
        userOverrideFlag: false,
        createdAt: new Date().toISOString(),
        rawData,
      } as PFTransaction;
    })
    .filter((t): t is PFTransaction => t !== null);
}

// ── Duplicate Detection ───────────────────────────────────────────────────────

function isDuplicate(a: PFTransaction, b: PFTransaction): boolean {
  return (
    a.date === b.date &&
    a.amount === b.amount &&
    a.description === b.description &&
    a.accountId === b.accountId
  );
}

// ── Integrity Score Computation ───────────────────────────────────────────────

export function computeIntegrityScore(params: {
  total: number;
  missingDate: number;
  invalidAmount: number;
  unclassified: number;
  duplicates: number;
}): number {
  if (params.total === 0) return 100;
  const missingDatePct   = (params.missingDate   / params.total) * 100;
  const invalidAmountPct = (params.invalidAmount / params.total) * 100;
  const unclassifiedPct  = (params.unclassified  / params.total) * 100;
  const duplicatePct     = (params.duplicates    / params.total) * 100;
  const score = 100
    - (missingDatePct   * 0.5)
    - (invalidAmountPct * 0.2)
    - (unclassifiedPct  * 0.15)
    - (duplicatePct     * 0.15);
  return Math.max(0, Math.round(score));
}

// ── Ingest Statement ──────────────────────────────────────────────────────────

export function ingestStatement(params: {
  accountId: string;
  fileName: string;
  fileType: 'csv' | 'excel';
  headers: string[];
  rows: string[][];
  detectedColumns: DetectedColumns;
  skipDuplicates?: boolean;
}): { statement: PFStatement; addedCount: number; duplicateCount: number } {
  const store = loadPFStore();
  const statementId = `stmt-${Date.now()}`;

  const rawTxns = buildPFTransactions(
    params.headers,
    params.rows,
    params.detectedColumns,
    params.accountId,
    statementId,
  );

  const duplicateCount = rawTxns.filter(t =>
    store.transactions.some(e => isDuplicate(e, t))
  ).length;

  const newTxns = params.skipDuplicates
    ? rawTxns.filter(t => !store.transactions.some(e => isDuplicate(e, t)))
    : rawTxns;

  const dates            = newTxns.map(t => t.date).filter(Boolean).sort();
  const unclassifiedCount= newTxns.filter(t => t.category === 'Other' || t.category === 'Miscellaneous').length;
  const missingDateCount = newTxns.filter(t => !t.date).length;
  const invalidAmountCount = params.rows.filter(row => {
    const amtCols = [params.detectedColumns.amount, params.detectedColumns.creditAmount, params.detectedColumns.debitAmount].filter(Boolean);
    if (amtCols.length === 0) return false;
    const h = params.headers;
    return amtCols.every(col => {
      const idx = h.indexOf(col!);
      return idx < 0 || parseAmount(row[idx] ?? '') === 0;
    });
  }).length;

  const integrityScore = computeIntegrityScore({
    total: newTxns.length,
    missingDate: missingDateCount,
    invalidAmount: invalidAmountCount,
    unclassified: unclassifiedCount,
    duplicates: duplicateCount,
  });

  const missingDataFlags: string[] = [];
  if (!params.detectedColumns.date)
    missingDataFlags.push('Date column not detected');
  if (!params.detectedColumns.amount && !params.detectedColumns.creditAmount)
    missingDataFlags.push('Amount column not detected');
  if (!params.detectedColumns.description)
    missingDataFlags.push('Description column not detected');
  if (missingDateCount > 0)
    missingDataFlags.push(`${missingDateCount} transaction${missingDateCount > 1 ? 's' : ''} missing dates`);
  if (invalidAmountCount > 0)
    missingDataFlags.push(`${invalidAmountCount} row${invalidAmountCount > 1 ? 's' : ''} with invalid amounts`);

  const statement: PFStatement = {
    id: statementId,
    accountId: params.accountId,
    fileName: params.fileName,
    uploadedAt: new Date().toISOString(),
    periodFrom: dates[0] ?? '',
    periodTo: dates[dates.length - 1] ?? '',
    fileType: params.fileType,
    integrityScore,
    parsingConfidence: integrityScore, // alias
    transactionCount: newTxns.length,
    duplicateCount,
    unclassifiedCount,
    missingDateCount,
    invalidAmountCount,
    missingDataFlags,
    detectedColumns: params.detectedColumns,
    rawHeaders: params.headers,
  };

  store.statements[statementId] = statement;
  store.transactions.push(...newTxns);
  applyAllRulesToStore(store);
  detectAndSaveRecurring(store);
  savePFStore(store);

  return { statement, addedCount: newTxns.length, duplicateCount };
}

// ── Validation Layer ──────────────────────────────────────────────────────────

export function validateForCompute(txns: PFTransaction[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (txns.length === 0) return { valid: true, errors, warnings };

  const missingDate   = txns.filter(t => !t.date).length;
  const missingDatePct = (missingDate / txns.length) * 100;
  if (missingDatePct > 5) {
    errors.push(`${missingDate} transactions (${missingDatePct.toFixed(1)}%) are missing dates — financial metrics may be incomplete.`);
  } else if (missingDate > 0) {
    warnings.push(`${missingDate} transaction${missingDate > 1 ? 's' : ''} have missing dates.`);
  }

  const credits = txns.filter(t => t.type === 'credit' && !t.isTransfer);
  if (credits.length === 0) {
    warnings.push('No income transactions detected. Ratios will show 0%.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ── Transaction Queries ───────────────────────────────────────────────────────

export interface TxFilter {
  accountId?: string;
  statementId?: string;
  type?: 'credit' | 'debit';
  category?: string;
  labelId?: string;
  from?: string;
  to?: string;
  recurring?: boolean;
  isTransfer?: boolean;
  isLoan?: boolean;
  search?: string;
  amountMin?: number;
  amountMax?: number;
}

export function getPFTransactions(filters?: TxFilter): PFTransaction[] {
  const store = loadPFStore();
  let txns = store.transactions;

  if (filters?.accountId)    txns = txns.filter(t => t.accountId === filters.accountId);
  if (filters?.statementId)  txns = txns.filter(t => t.statementId === filters.statementId);
  if (filters?.type)         txns = txns.filter(t => t.type === filters.type);
  if (filters?.category)     txns = txns.filter(t => t.category === filters.category);
  if (filters?.from)         txns = txns.filter(t => t.date >= filters.from!);
  if (filters?.to)           txns = txns.filter(t => t.date <= filters.to!);
  if (filters?.recurring !== undefined)  txns = txns.filter(t => t.recurringFlag === filters.recurring);
  if (filters?.isTransfer !== undefined) txns = txns.filter(t => t.isTransfer === filters.isTransfer);
  if (filters?.isLoan     !== undefined) txns = txns.filter(t => t.isLoan === filters.isLoan);
  if (filters?.amountMin !== undefined)  txns = txns.filter(t => t.amount >= filters.amountMin!);
  if (filters?.amountMax !== undefined)  txns = txns.filter(t => t.amount <= filters.amountMax!);
  if (filters?.labelId) {
    const matchIds = new Set(
      store.labelMaps.filter(m => m.labelId === filters.labelId).map(m => m.transactionId)
    );
    txns = txns.filter(t => matchIds.has(t.id));
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    txns = txns.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  return txns.sort((a, b) => b.date.localeCompare(a.date));
}

// ── Category Overrides ────────────────────────────────────────────────────────

export function applyTransactionCategoryOverride(
  transactionId: string,
  toCategory: string,
): void {
  const store = loadPFStore();
  const txn = store.transactions.find(t => t.id === transactionId);
  if (!txn) return;
  const fromCategory = txn.category;
  txn.category = toCategory;
  txn.userOverrideFlag = true;
  store.categoryOverrides.push({
    transactionId,
    fromCategory,
    toCategory,
    appliedAt: new Date().toISOString(),
  });
  savePFStore(store);
}

/** Generic single-record update. Category changes are tracked in categoryOverrides. */
export function updatePFTransaction(
  id: string,
  updates: Partial<Pick<PFTransaction, 'category' | 'description'>>,
): void {
  const store = loadPFStore();
  const txn = store.transactions.find(t => t.id === id);
  if (!txn) return;
  if (updates.category !== undefined && updates.category !== txn.category) {
    store.categoryOverrides.push({
      transactionId: id,
      fromCategory: txn.category,
      toCategory: updates.category,
      appliedAt: new Date().toISOString(),
    });
    txn.userOverrideFlag = true;
  }
  Object.assign(txn, updates);
  savePFStore(store);
}

export function bulkApplyCategoryOverride(
  transactionIds: string[],
  toCategory: string,
): void {
  const store = loadPFStore();
  for (const id of transactionIds) {
    const txn = store.transactions.find(t => t.id === id);
    if (!txn) continue;
    store.categoryOverrides.push({
      transactionId: id,
      fromCategory: txn.category,
      toCategory,
      appliedAt: new Date().toISOString(),
    });
    txn.category = toCategory;
    txn.userOverrideFlag = true;
  }
  savePFStore(store);
}

export function getCategoryOverrides(): CategoryOverride[] {
  return loadPFStore().categoryOverrides;
}

// ── Bulk Transaction Actions ──────────────────────────────────────────────────

export function bulkMarkAsTransfer(transactionIds: string[]): void {
  const store = loadPFStore();
  for (const id of transactionIds) {
    const txn = store.transactions.find(t => t.id === id);
    if (!txn) continue;
    txn.isTransfer = true;
    txn.category = 'Transfer';
    txn.userOverrideFlag = true;
  }
  savePFStore(store);
}

export function bulkMarkAsTransferToFriend(transactionIds: string[]): void {
  const store = loadPFStore();
  for (const id of transactionIds) {
    const txn = store.transactions.find(t => t.id === id);
    if (!txn) continue;
    txn.isTransfer = true;
    txn.category = 'Transfer to Friend';
    txn.userOverrideFlag = true;
  }
  savePFStore(store);
}

export function bulkMarkAsLoan(transactionIds: string[]): void {
  const store = loadPFStore();
  for (const id of transactionIds) {
    const txn = store.transactions.find(t => t.id === id);
    if (!txn) continue;
    txn.isLoan = true;
    txn.category = 'Loan/EMI';
    txn.userOverrideFlag = true;
  }
  savePFStore(store);
}

export function bulkDeleteTransactions(transactionIds: string[]): void {
  const store = loadPFStore();
  const ids = new Set(transactionIds);
  store.transactions = store.transactions.filter(t => !ids.has(t.id));
  store.labelMaps    = store.labelMaps.filter(m => !ids.has(m.transactionId));
  detectAndSaveRecurring(store);
  savePFStore(store);
}

// ── Category Management ───────────────────────────────────────────────────────

export function getAllCategories(): string[] {
  const store = loadPFStore();
  return [...new Set([...PF_CATEGORIES, ...store.userCategories])];
}

export function addUserCategory(name: string): void {
  const store = loadPFStore();
  const trimmed = name.trim();
  if (!trimmed || getAllCategories().includes(trimmed)) return;
  store.userCategories.push(trimmed);
  savePFStore(store);
}

export function removeUserCategory(name: string): void {
  const store = loadPFStore();
  // Only allow removal if no transactions use it
  const inUse = store.transactions.some(t => t.category === name);
  if (inUse) return;
  store.userCategories = store.userCategories.filter(c => c !== name);
  savePFStore(store);
}

export function renameCategory(fromName: string, toName: string): void {
  const store = loadPFStore();
  const to = toName.trim();
  if (!to || to === fromName) return;
  // Rename in all transactions
  for (const t of store.transactions) {
    if (t.category === fromName) {
      t.category = to;
      t.userOverrideFlag = true;
    }
  }
  // Rename in user categories list
  const idx = store.userCategories.indexOf(fromName);
  if (idx !== -1) {
    store.userCategories[idx] = to;
  } else {
    // fromName was a system category — add new name to user categories
    if (!getAllCategories().includes(to)) {
      store.userCategories.push(to);
    }
  }
  savePFStore(store);
}

export function mergeCategories(fromName: string, intoName: string): void {
  const store = loadPFStore();
  for (const t of store.transactions) {
    if (t.category === fromName) {
      t.category = intoName;
      t.userOverrideFlag = true;
    }
  }
  store.userCategories = store.userCategories.filter(c => c !== fromName);
  savePFStore(store);
}

// ── Label Operations ──────────────────────────────────────────────────────────

const LABEL_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

export function addLabel(name: string, color?: string): PFLabel {
  const store = loadPFStore();
  const existing = Object.values(store.labels);
  const id = `lbl-${Date.now()}`;
  const label: PFLabel = {
    id,
    name: name.trim(),
    color: color ?? LABEL_COLORS[existing.length % LABEL_COLORS.length],
  };
  store.labels[id] = label;
  savePFStore(store);
  return label;
}

export function updateLabel(id: string, updates: Partial<Pick<PFLabel, 'name' | 'color'>>): void {
  const store = loadPFStore();
  if (!store.labels[id]) return;
  Object.assign(store.labels[id], updates);
  savePFStore(store);
}

export function deleteLabel(id: string): void {
  const store = loadPFStore();
  delete store.labels[id];
  store.labelMaps = store.labelMaps.filter(m => m.labelId !== id);
  savePFStore(store);
}

export function getLabels(): PFLabel[] {
  return Object.values(loadPFStore().labels);
}

export function assignLabels(transactionIds: string[], labelId: string): void {
  const store = loadPFStore();
  if (!store.labels[labelId]) return;
  for (const tid of transactionIds) {
    const already = store.labelMaps.some(m => m.transactionId === tid && m.labelId === labelId);
    if (!already) {
      store.labelMaps.push({ transactionId: tid, labelId });
    }
  }
  savePFStore(store);
}

export function removeLabels(transactionIds: string[], labelId: string): void {
  const store = loadPFStore();
  const ids = new Set(transactionIds);
  store.labelMaps = store.labelMaps.filter(m => !(ids.has(m.transactionId) && m.labelId === labelId));
  savePFStore(store);
}

export function getTransactionLabels(transactionId: string): PFLabel[] {
  const store = loadPFStore();
  const labelIds = store.labelMaps
    .filter(m => m.transactionId === transactionId)
    .map(m => m.labelId);
  return labelIds.map(id => store.labels[id]).filter(Boolean);
}

// ── Rule Operations ───────────────────────────────────────────────────────────

export function addRule(params: Omit<PFRule, 'id' | 'createdAt'>): PFRule {
  const store = loadPFStore();
  const rule: PFRule = {
    ...params,
    id: `rule-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  store.rules[rule.id] = rule;
  applyAllRulesToStore(store);
  savePFStore(store);
  return rule;
}

export function getRules(): PFRule[] {
  return Object.values(loadPFStore().rules).filter(r => r.active);
}

export function deleteRule(id: string): void {
  const store = loadPFStore();
  delete store.rules[id];
  savePFStore(store);
}

export function toggleRule(id: string): void {
  const store = loadPFStore();
  if (store.rules[id]) store.rules[id].active = !store.rules[id].active;
  savePFStore(store);
}

function applyRuleToTxn(txn: PFTransaction, rule: PFRule): boolean {
  if (!rule.active) return false;
  if (txn.userOverrideFlag) return false; // user override wins
  switch (rule.conditionType) {
    case 'merchant_contains':
      return txn.description.toLowerCase().includes(rule.conditionValue.toLowerCase());
    case 'amount_min':
      return txn.amount >= parseFloat(rule.conditionValue);
    case 'amount_max':
      return txn.amount <= parseFloat(rule.conditionValue);
    case 'type_is':
      return txn.type === rule.conditionValue;
    default:
      return false;
  }
}

function applyAllRulesToStore(store: PFStoreData): void {
  const rules = Object.values(store.rules).filter(r => r.active);
  if (rules.length === 0) return;
  for (const txn of store.transactions) {
    if (txn.userOverrideFlag) continue;
    for (const rule of rules) {
      if (applyRuleToTxn(txn, rule)) {
        txn.category = rule.assignedCategory;
        break; // first matching rule wins
      }
    }
  }
}

export function applyAllRules(): void {
  const store = loadPFStore();
  applyAllRulesToStore(store);
  savePFStore(store);
}

// ── Recurring Detection ───────────────────────────────────────────────────────

const FREQ_THRESHOLDS: {
  name: PFCommitment['frequency'];
  days: number;
  tolerance: number;
}[] = [
  { name: 'weekly',      days: 7,   tolerance: 3  },
  { name: 'fortnightly', days: 14,  tolerance: 4  },
  { name: 'monthly',     days: 30,  tolerance: 5  },
  { name: 'quarterly',   days: 90,  tolerance: 10 },
  { name: 'annual',      days: 365, tolerance: 15 },
];

function normalizeMerchant(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 3)
    .join(' ');
}

function detectFrequency(
  intervals: number[],
): { freq: PFCommitment['frequency']; avg: number } | null {
  if (intervals.length === 0) return null;
  const sorted = [...intervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  for (const f of FREQ_THRESHOLDS) {
    if (Math.abs(median - f.days) <= f.tolerance) {
      return { freq: f.name, avg: Math.round(median) };
    }
  }
  return null;
}

function toMonthlyEquiv(amount: number, freq: PFCommitment['frequency']): number {
  switch (freq) {
    case 'weekly':      return amount * (365 / 7 / 12);
    case 'fortnightly': return amount * (365 / 14 / 12);
    case 'monthly':     return amount;
    case 'quarterly':   return amount / 3;
    case 'annual':      return amount / 12;
    case 'one-time':    return 0;
  }
}

export function detectAndSaveRecurring(store: PFStoreData): void {
  // Preserve manually-added, user-dismissed, and user-confirmed commitments
  const preserved = Object.values(store.commitments).filter(
    c => c.manuallyAdded || c.userDismissed || c.userConfirmed || c.convertedToOneTime,
  );
  store.commitments = {};
  preserved.forEach(c => { store.commitments[c.id] = c; });

  // Reset auto-detected recurring flags on non-user-overridden transactions
  for (const t of store.transactions) {
    if (!t.userOverrideFlag) t.recurringFlag = false;
  }

  // Group debits by normalized merchant
  const debitTxns = store.transactions.filter(t => t.type === 'debit' && t.date);
  const groups: Record<string, PFTransaction[]> = {};
  for (const t of debitTxns) {
    const key = normalizeMerchant(t.description);
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }

  for (const [merchant, txns] of Object.entries(groups)) {
    if (txns.length < 3) continue;
    const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date));
    const dates = sorted.map(t => new Date(t.date + 'T12:00:00').getTime());
    const intervals = dates.slice(1).map((d, i) => Math.round((d - dates[i]) / 86400000));
    const detection = detectFrequency(intervals);
    if (!detection) continue;

    for (const t of sorted) t.recurringFlag = true;

    const avgAmount = sorted.reduce((a, t) => a + t.amount, 0) / sorted.length;
    const monthlyEquivalent = toMonthlyEquiv(avgAmount, detection.freq);
    const commitmentId = `cmt-${merchant.replace(/\s/g, '-')}`;

    if (store.commitments[commitmentId]?.userDismissed) continue;
    if (store.commitments[commitmentId]?.userConfirmed) continue;

    store.commitments[commitmentId] = {
      id: commitmentId,
      merchant: sorted[0].description,
      normalizedMerchant: merchant,
      frequency: detection.freq,
      intervalDays: detection.avg,
      monthlyEquivalent,
      annualizedCost: monthlyEquivalent * 12,
      firstDetected: sorted[0].date,
      lastDetected: sorted[sorted.length - 1].date,
      transactionIds: sorted.map(t => t.id),
      category: sorted[0].category,
      userConfirmed: false,
      userDismissed: false,
      manuallyAdded: false,
      convertedToOneTime: false,
    };
  }
}

export function rerunRecurringDetection(): void {
  const store = loadPFStore();
  detectAndSaveRecurring(store);
  savePFStore(store);
}

// ── Commitment Operations ─────────────────────────────────────────────────────

export function getCommitments(includeDismissed = false): PFCommitment[] {
  return Object.values(loadPFStore().commitments).filter(
    c => includeDismissed || !c.userDismissed,
  );
}

export function confirmCommitment(id: string): void {
  const store = loadPFStore();
  if (store.commitments[id]) store.commitments[id].userConfirmed = true;
  savePFStore(store);
}

export function dismissCommitment(id: string): void {
  const store = loadPFStore();
  if (store.commitments[id]) store.commitments[id].userDismissed = true;
  savePFStore(store);
}

export function updateCommitmentFrequency(
  id: string,
  frequency: PFCommitment['frequency'],
): void {
  const store = loadPFStore();
  const c = store.commitments[id];
  if (!c) return;
  c.frequency = frequency;
  c.intervalDays = { weekly: 7, fortnightly: 14, monthly: 30, quarterly: 90, annual: 365, 'one-time': 0 }[frequency];
  c.monthlyEquivalent = toMonthlyEquiv(c.monthlyEquivalent, frequency);
  c.annualizedCost    = c.monthlyEquivalent * 12;
  savePFStore(store);
}

export function convertCommitmentToOneTime(id: string): void {
  const store = loadPFStore();
  const c = store.commitments[id];
  if (!c) return;
  c.frequency         = 'one-time';
  c.monthlyEquivalent = 0;
  c.annualizedCost    = 0;
  c.convertedToOneTime = true;
  c.userConfirmed     = true;
  savePFStore(store);
}

export function updateCommitmentCategory(id: string, category: string): void {
  const store = loadPFStore();
  if (store.commitments[id]) store.commitments[id].category = category;
  savePFStore(store);
}

export function addManualCommitment(params: {
  merchant: string;
  frequency: PFCommitment['frequency'];
  monthlyEquivalent: number;
  category?: string;
}): void {
  const store = loadPFStore();
  const id = `cmt-manual-${Date.now()}`;
  store.commitments[id] = {
    id,
    merchant: params.merchant,
    normalizedMerchant: normalizeMerchant(params.merchant),
    frequency: params.frequency,
    intervalDays: { weekly: 7, fortnightly: 14, monthly: 30, quarterly: 90, annual: 365, 'one-time': 0 }[params.frequency],
    monthlyEquivalent: params.monthlyEquivalent,
    annualizedCost: params.monthlyEquivalent * 12,
    firstDetected: new Date().toISOString().split('T')[0],
    lastDetected:  new Date().toISOString().split('T')[0],
    transactionIds: [],
    category: params.category ?? 'Miscellaneous',
    userConfirmed: true,
    userDismissed: false,
    manuallyAdded: true,
    convertedToOneTime: false,
  };
  savePFStore(store);
}

// ── Financial Metrics ─────────────────────────────────────────────────────────

export function computeFinancialMetrics(txns: PFTransaction[]): FinancialMetrics {
  const credits = txns.filter(t => t.type === 'credit');
  const debits  = txns.filter(t => t.type === 'debit');

  const totalIncome  = credits.reduce((a, t) => a + t.amount, 0);
  const totalOutflow = debits.reduce((a, t) => a + t.amount, 0);
  const netSurplus   = totalIncome - totalOutflow;

  const sum = (arr: PFTransaction[]) => arr.reduce((a, t) => a + t.amount, 0);
  const pct = (val: number) =>
    totalIncome > 0 ? parseFloat(((val / totalIncome) * 100).toFixed(1)) : 0;

  const salary        = sum(credits.filter(t => SALARY_CATEGORIES.includes(t.category)));
  const otherCredits  = totalIncome - salary;
  const essential     = sum(debits.filter(t => ESSENTIAL_CATEGORIES.includes(t.category)));
  const commitments   = sum(debits.filter(t => COMMITMENT_CATEGORIES.includes(t.category)));
  const discretionary = sum(debits.filter(t => DISCRETIONARY_CATEGORIES.includes(t.category)));
  const debtServicing = sum(debits.filter(t => DEBT_CATEGORIES.includes(t.category)));
  const transfers     = sum(debits.filter(t => TRANSFER_CATEGORIES.includes(t.category)));

  return {
    totalIncome, totalOutflow, netSurplus,
    savingsRate:          pct(netSurplus),
    commitmentRatio:      pct(commitments + debtServicing),
    discretionaryRatio:   pct(discretionary),
    debtServicingRatio:   pct(debtServicing),
    salary, otherCredits, essential, commitments,
    discretionary, transfers, debtServicing,
  };
}

// ── Period Utilities ──────────────────────────────────────────────────────────

export function getPeriodRange(period: string): { from: string; to: string } | null {
  const now = new Date();

  if (period === 'all') return null;

  if (/^\d{4}-\d{2}$/.test(period)) {
    const [y, m] = period.split('-').map(Number);
    const from = `${y}-${String(m).padStart(2, '0')}-01`;
    const to   = `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`;
    return { from, to };
  }

  if (period === 'this-month') {
    const y = now.getFullYear(), m = now.getMonth() + 1;
    return {
      from: `${y}-${String(m).padStart(2, '0')}-01`,
      to:   `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`,
    };
  }
  if (period === 'last-month') {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const y = d.getFullYear(), m = d.getMonth() + 1;
    return {
      from: `${y}-${String(m).padStart(2, '0')}-01`,
      to:   `${y}-${String(m).padStart(2, '0')}-${new Date(y, m, 0).getDate()}`,
    };
  }
  if (period === 'last-3-months') {
    const to   = now.toISOString().split('T')[0];
    const from = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0];
    return { from, to };
  }
  if (period === 'this-quarter') {
    const q    = Math.floor(now.getMonth() / 3);
    const from = new Date(now.getFullYear(), q * 3, 1);
    const to   = new Date(now.getFullYear(), q * 3 + 3, 0);
    return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
  }
  if (period === 'this-year') {
    return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
  }

  return null;
}

export function filterByPeriod(
  txns: PFTransaction[],
  period: string,
  customFrom?: string,
  customTo?: string,
): PFTransaction[] {
  if (period === 'all') return txns;
  if (period === 'custom' && customFrom && customTo) {
    return txns.filter(t => t.date >= customFrom && t.date <= customTo);
  }
  const range = getPeriodRange(period);
  if (!range) return txns;
  return txns.filter(t => t.date >= range.from && t.date <= range.to);
}

export function getAvailableMonths(): { key: string; label: string }[] {
  const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];
  const months = new Set<string>();
  loadPFStore().transactions.forEach(t => {
    if (t.date?.length >= 7) months.add(t.date.substring(0, 7));
  });
  return Array.from(months)
    .sort()
    .reverse()
    .map(key => {
      const [y, m] = key.split('-');
      return { key, label: `${MONTH_NAMES[parseInt(m) - 1]} ${y}` };
    });
}

// ── Integrity Report ──────────────────────────────────────────────────────────

export interface IntegrityReport {
  totalStatements: number;
  totalAccounts: number;
  totalTransactions: number;
  duplicateCount: number;
  unclassifiedCount: number;
  missingDateCount: number;
  invalidAmountCount: number;
  userOverrideCount: number;
  overallIntegrityScore: number;
  parseErrors: { statementId: string; fileName: string; flags: string[] }[];
}

export function getIntegrityReport(): IntegrityReport {
  const store = loadPFStore();
  const stmts = Object.values(store.statements);
  const txns  = store.transactions;

  const duplicateCount      = stmts.reduce((a, s) => a + s.duplicateCount, 0);
  const missingDateCount    = txns.filter(t => !t.date).length;
  const unclassifiedCount   = txns.filter(t => t.category === 'Other' || t.category === 'Miscellaneous').length;
  const invalidAmountCount  = stmts.reduce((a, s) => a + (s.invalidAmountCount ?? 0), 0);

  const overallIntegrityScore = computeIntegrityScore({
    total: txns.length,
    missingDate: missingDateCount,
    invalidAmount: invalidAmountCount,
    unclassified: unclassifiedCount,
    duplicates: duplicateCount,
  });

  return {
    totalStatements:  stmts.length,
    totalAccounts:    Object.keys(store.accounts).length,
    totalTransactions: txns.length,
    duplicateCount,
    unclassifiedCount,
    missingDateCount,
    invalidAmountCount,
    userOverrideCount: txns.filter(t => t.userOverrideFlag).length,
    overallIntegrityScore,
    parseErrors: stmts
      .filter(s => s.missingDataFlags.length > 0)
      .map(s => ({ statementId: s.id, fileName: s.fileName, flags: s.missingDataFlags })),
  };
}

// ── Store Reset ───────────────────────────────────────────────────────────────

export function clearPFStore(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PF_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('pf-store-updated'));
  }
}

// ── Display Helpers ───────────────────────────────────────────────────────────

export function fmtINR(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(2)}Cr`;
  if (value >= 100_000)    return `₹${(value / 100_000).toFixed(2)}L`;
  if (value >= 1_000)      return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${value.toFixed(2)}`;
}

export function fmtPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const PERIOD_OPTIONS = [
  { key: 'all',           label: 'All Time' },
  { key: 'this-month',    label: 'This Month' },
  { key: 'last-month',    label: 'Last Month' },
  { key: 'last-3-months', label: 'Last 3 Months' },
  { key: 'this-quarter',  label: 'This Quarter' },
  { key: 'this-year',     label: 'This Year' },
  { key: 'custom',        label: 'Custom Range' },
];

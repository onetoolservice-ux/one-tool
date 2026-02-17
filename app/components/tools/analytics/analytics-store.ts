/**
 * Analytics Shared Data Store
 *
 * Single source of truth for all analytics tools.
 * Data is stored per upload batch (not per month).
 * Users can upload any file at any time; dates are auto-detected.
 * Persists in localStorage across sessions.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  date: string;           // ISO date: YYYY-MM-DD
  description: string;
  amount: number;          // always positive
  type: 'credit' | 'debit';
  category: string;
  rawData: Record<string, string>;
  batchId?: string;        // which upload batch this belongs to
}

export interface DetectedColumns {
  date: string | null;
  amount: string | null;
  creditAmount: string | null;
  debitAmount: string | null;
  description: string | null;
  category: string | null;
  balance: string | null;
}

/** A single upload batch — replaces the old MonthlyData */
export interface UploadBatch {
  batchId: string;         // unique ID (timestamp-based)
  fileName: string;
  uploadedAt: string;
  transactions: Transaction[];
  detectedColumns: DetectedColumns;
  rawHeaders?: string[];
  dateRange: { from: string; to: string } | null;  // auto-detected
  summary: {
    totalCredits: number;
    totalDebits: number;
    netFlow: number;
    transactionCount: number;
  };
}

// ── Legacy type kept for backward compatibility during migration ──────────
export interface MonthlyData {
  monthKey: string;
  monthLabel: string;
  fileName: string;
  uploadedAt: string;
  transactions: Transaction[];
  detectedColumns: DetectedColumns;
  rawHeaders?: string[];
  summary: {
    totalCredits: number;
    totalDebits: number;
    netFlow: number;
    transactionCount: number;
  };
}

export interface AnalyticsStoreData {
  months: Record<string, MonthlyData>;   // legacy (kept for migration)
  batches?: Record<string, UploadBatch>; // new format
}

// ── Storage Operations ────────────────────────────────────────────────────────

const STORAGE_KEY = 'otsd-analytics-store';

export function loadStore(): AnalyticsStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { months: {}, batches: {} };
}

export function saveStore(data: AnalyticsStoreData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function dispatchUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('analytics-store-updated'));
  }
}

// ── Migration: convert old month-based data to batches on first load ──────

export function migrateIfNeeded(): void {
  const store = loadStore();
  if (!store.batches) store.batches = {};

  const monthKeys = Object.keys(store.months || {});
  if (monthKeys.length === 0) return;

  // Already migrated? Check if batches already exist
  const batchKeys = Object.keys(store.batches);
  if (batchKeys.length > 0) return; // already have batch data

  for (const mk of monthKeys) {
    const md = store.months[mk];
    if (!md || md.transactions.length === 0) continue;
    const batchId = `migrated-${mk}`;
    const txns = md.transactions.map(t => ({ ...t, batchId }));
    const dates = txns.map(t => t.date).filter(Boolean).sort();
    store.batches[batchId] = {
      batchId,
      fileName: md.fileName || `${mk} data`,
      uploadedAt: md.uploadedAt || new Date().toISOString(),
      transactions: txns,
      detectedColumns: md.detectedColumns,
      rawHeaders: md.rawHeaders,
      dateRange: dates.length > 0 ? { from: dates[0], to: dates[dates.length - 1] } : null,
      summary: md.summary,
    };
  }
  // Clean up legacy month data after migration so it doesn't resurrect on re-migration
  store.months = {};
  saveStore(store);
}

// ── Batch Operations ──────────────────────────────────────────────────────────

export function saveBatch(batch: UploadBatch): void {
  const store = loadStore();
  if (!store.batches) store.batches = {};
  store.batches[batch.batchId] = batch;
  saveStore(store);
  dispatchUpdate();
}

export function getBatch(batchId: string): UploadBatch | null {
  const store = loadStore();
  return store.batches?.[batchId] || null;
}

export function deleteBatch(batchId: string): void {
  const store = loadStore();
  if (store.batches) delete store.batches[batchId];
  // Also clean up legacy month data if this was a migrated batch
  if (batchId.startsWith('migrated-') && store.months) {
    const monthKey = batchId.replace('migrated-', '');
    delete store.months[monthKey];
  }
  saveStore(store);
  dispatchUpdate();
}

export function getAllBatches(): UploadBatch[] {
  const store = loadStore();
  if (!store.batches) return [];
  return Object.values(store.batches).sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function getAllBatchIds(): string[] {
  return getAllBatches().map(b => b.batchId);
}

// ── Transaction Access (unified across all batches) ───────────────────────────

export function getAllTransactions(type?: 'credit' | 'debit'): Transaction[] {
  const store = loadStore();
  const batches = store.batches ? Object.values(store.batches) : [];
  const all = batches.flatMap(b => b.transactions);
  if (type) return all.filter(t => t.type === type);
  return all;
}

export function getTransactionsByBatch(batchId: string, type?: 'credit' | 'debit'): Transaction[] {
  const batch = getBatch(batchId);
  if (!batch) return [];
  if (type) return batch.transactions.filter(t => t.type === type);
  return batch.transactions;
}

/** Get detected columns from any batch (first one with data) */
export function getDetectedColumns(): DetectedColumns | null {
  const batches = getAllBatches();
  for (const b of batches) {
    if (b.detectedColumns) return b.detectedColumns;
  }
  return null;
}

// ── Legacy compatibility functions ────────────────────────────────────────────
// These bridge old code that uses month-based API to the new batch-based store.

export function getMonthData(monthKey: string): MonthlyData | null {
  // First check legacy months
  const store = loadStore();
  if (store.months?.[monthKey]) return store.months[monthKey];
  // Then check batches that were migrated from this month
  const batch = store.batches?.[`migrated-${monthKey}`];
  if (batch) {
    return {
      monthKey,
      monthLabel: monthKeyToLabel(monthKey),
      fileName: batch.fileName,
      uploadedAt: batch.uploadedAt,
      transactions: batch.transactions,
      detectedColumns: batch.detectedColumns,
      rawHeaders: batch.rawHeaders,
      summary: batch.summary,
    };
  }
  return null;
}

export function saveMonthData(data: MonthlyData): void {
  // Save as a batch instead
  const batchId = `migrated-${data.monthKey}`;
  const txns = data.transactions.map(t => ({ ...t, batchId }));
  const dates = txns.map(t => t.date).filter(Boolean).sort();
  saveBatch({
    batchId,
    fileName: data.fileName,
    uploadedAt: data.uploadedAt,
    transactions: txns,
    detectedColumns: data.detectedColumns,
    rawHeaders: data.rawHeaders,
    dateRange: dates.length > 0 ? { from: dates[0], to: dates[dates.length - 1] } : null,
    summary: data.summary,
  });
}

export function deleteMonthData(monthKey: string): void {
  const store = loadStore();
  // Remove legacy month data
  delete store.months[monthKey];
  // Remove migrated batch for this month
  if (store.batches) delete store.batches[`migrated-${monthKey}`];
  // Remove transactions matching this month from ALL batches
  if (store.batches) {
    for (const [batchId, batch] of Object.entries(store.batches)) {
      batch.transactions = batch.transactions.filter(
        t => !(t.date && t.date.startsWith(monthKey))
      );
      if (batch.transactions.length === 0) {
        delete store.batches[batchId];
      } else {
        batch.summary = calculateSummary(batch.transactions);
        const dates = batch.transactions.map(t => t.date).filter(Boolean).sort();
        batch.dateRange = dates.length > 0 ? { from: dates[0], to: dates[dates.length - 1] } : null;
      }
    }
  }
  saveStore(store);
  dispatchUpdate();
}

export function getAllMonthKeys(): string[] {
  // Derive month keys from all transaction dates across all batches
  const txns = getAllTransactions();
  const months = new Set<string>();
  txns.forEach(t => {
    if (t.date && t.date.length >= 7) {
      months.add(t.date.substring(0, 7));
    }
  });
  return Array.from(months).sort().reverse();
}

export function getTransactions(monthKey: string, type?: 'credit' | 'debit'): Transaction[] {
  const all = getAllTransactions(type);
  return all.filter(t => t.date && t.date.startsWith(monthKey));
}

// Batch-update transaction categories
export function updateTransactionCategories(
  monthKey: string,
  updates: Record<string, string>
): void {
  const store = loadStore();
  if (!store.batches) return;
  // Search all batches for matching transaction IDs
  for (const batch of Object.values(store.batches)) {
    let changed = false;
    batch.transactions = batch.transactions.map(t => {
      if (updates[t.id]) {
        changed = true;
        return { ...t, category: updates[t.id] };
      }
      return t;
    });
    if (changed) {
      batch.summary = calculateSummary(batch.transactions);
    }
  }
  saveStore(store);
  dispatchUpdate();
}

export function updateBatchTransactionCategories(
  batchId: string,
  updates: Record<string, string>
): void {
  const batch = getBatch(batchId);
  if (!batch) return;
  batch.transactions = batch.transactions.map(t =>
    updates[t.id] ? { ...t, category: updates[t.id] } : t
  );
  batch.summary = calculateSummary(batch.transactions);
  saveBatch(batch);
}

export const ALL_CATEGORIES = [
  'Salary', 'Freelance', 'Returns', 'Refund',
  'Dining', 'Shopping', 'Transport', 'Entertainment',
  'Housing', 'Groceries', 'Utilities', 'Health', 'Education',
  'Insurance', 'Investment', 'Loan/EMI', 'Transfer', 'Cash',
  'Subscription', 'Gifts', 'Tax', 'Other',
];

// ── Month Helpers ─────────────────────────────────────────────────────────────

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function monthKeyToLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
}

export function monthKeyToShort(key: string): string {
  const [year, month] = key.split('-');
  return `${MONTH_SHORT[parseInt(month) - 1]} ${year}`;
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function generateMonthOptions(): { key: string; label: string }[] {
  const now = new Date();
  const options: { key: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    options.push({ key, label: monthKeyToLabel(key) });
  }
  return options;
}

// ── Date Parsing ──────────────────────────────────────────────────────────────

export function parseDate(value: unknown): string | null {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }

  const str = String(value).trim();
  if (!str) return null;

  // ISO: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD-MMM-YYYY or DD/MMM/YYYY (e.g., 15-Jan-2024)
  const namedMatch = str.match(/^(\d{1,2})[\/\-.\s]([A-Za-z]{3,})[\/\-.\s](\d{2,4})$/);
  if (namedMatch) {
    const [, d, m, y] = namedMatch;
    const monthMap: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
      january: '01', february: '02', march: '03', april: '04',
      june: '06', july: '07', august: '08', september: '09',
      october: '10', november: '11', december: '12',
    };
    const month = monthMap[m.toLowerCase()];
    const year = y.length === 2 ? `20${y}` : y;
    if (month) return `${year}-${month}-${d.padStart(2, '0')}`;
  }

  // Excel serial date
  const num = Number(str);
  if (!isNaN(num) && num > 30000 && num < 55000) {
    const date = new Date((num - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
  }

  // Fallback: Date.parse
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().split('T')[0];
  }

  return null;
}

function isDateLike(value: string): boolean {
  return parseDate(value) !== null;
}

// ── Column Detection ──────────────────────────────────────────────────────────

export function detectColumns(headers: string[], rows: string[][]): DetectedColumns {
  const result: DetectedColumns = {
    date: null, amount: null, creditAmount: null,
    debitAmount: null, description: null, category: null, balance: null,
  };

  const sampleRows = rows.slice(0, Math.min(20, rows.length));

  // First pass: find the primary date column
  const primaryDatePat = /\btransaction\s*date\b|\btran\s*date\b|\bposting\s*date\b|\bvalue\s*date\b|\bdate\b|\bdt\b/i;
  const valueDatePat = /^value\s*d(ate)?$/i;
  for (const [header] of headers.map((h, i) => [h, i] as [string, number])) {
    const h = header.toLowerCase().trim();
    if (primaryDatePat.test(h) && !valueDatePat.test(h)) { result.date = header; break; }
  }
  if (!result.date) {
    for (const header of headers) {
      if (valueDatePat.test(header)) { result.date = header; break; }
    }
  }

  headers.forEach((header, idx) => {
    const h = header.toLowerCase().trim();
    const values = sampleRows.map(r => (r[idx] || '').toString().trim()).filter(Boolean);

    if (!result.date) {
      if (values.length > 0 && values.filter(v => isDateLike(v)).length > values.length * 0.5) {
        result.date = header;
        return;
      }
    }
    if (header === result.date) return;

    if (!result.creditAmount && /\bcredit\b|\bdeposit\b|\bcr\b|\bincome\b|\binward\b/i.test(h)) {
      result.creditAmount = header;
      return;
    }
    if (!result.debitAmount && /\bdebit\b|\bwithdraw(al)?\b|\bdr\b|\bexpense\b|\boutward\b/i.test(h)) {
      result.debitAmount = header;
      return;
    }
    if (!result.balance && /\bbalance\b|\bclosing\b|\brunning\b|\bavailable\b/i.test(h)) {
      result.balance = header;
      return;
    }
    if (!result.amount && /\bamount\b|\bprice\b|\btotal\b|\bsum\b/i.test(h)) {
      result.amount = header;
      return;
    }
    if (!result.amount && /^value$/i.test(h)) {
      result.amount = header;
      return;
    }
    if (!result.description) {
      if (/\bnarration\b|\bparticular\b|\bremark\b|\bdescription\b|\bdesc\b|\bdetail\b|\bmemo\b|\bnote\b|\bpayee\b|\bbeneficiary\b/i.test(h)) {
        result.description = header;
        return;
      }
      if (/^name$/i.test(h)) {
        result.description = header;
        return;
      }
      if (/\btransaction\s+(desc|detail|remark|narration|ref|particulars)/i.test(h)) {
        result.description = header;
        return;
      }
    }
    if (!result.category) {
      const uniqueVals = new Set(values.map(v => v.toLowerCase()));
      const isTypeCol = values.length > 0 && uniqueVals.size <= 5 &&
        [...uniqueVals].every(v => /^(debit|credit|dr|cr|purchase|transfer|withdrawal|deposit)$/.test(v.trim()));
      if (isTypeCol) { result.category = header; return; }
      if (/\bcategor\b|\btransaction\s*type\b|\btrans\s*type\b|\btype\b|\bclass\b|\bgroup\b|\btag\b|\bhead\b/i.test(h)) {
        result.category = header;
        return;
      }
    }
  });

  // Fallback: find description column as the one with most diverse text
  if (!result.description) {
    let bestIdx = -1;
    let bestScore = 0;
    headers.forEach((_, idx) => {
      if ([result.date, result.amount, result.creditAmount, result.debitAmount, result.balance]
        .includes(headers[idx])) return;
      const values = sampleRows.map(r => (r[idx] || '').toString().trim()).filter(Boolean);
      const unique = new Set(values).size;
      const avgLen = values.reduce((a, v) => a + v.length, 0) / (values.length || 1);
      const isNumeric = values.length > 0 && values.every(v => !isNaN(Number(v)));
      if (!isNumeric && unique > bestScore && avgLen > 3) {
        bestScore = unique;
        bestIdx = idx;
      }
    });
    if (bestIdx >= 0) result.description = headers[bestIdx];
  }

  // Fallback: if no amount columns detected, find numeric columns
  if (!result.amount && !result.creditAmount && !result.debitAmount) {
    headers.forEach((header, idx) => {
      if ([result.date, result.description, result.balance].includes(header)) return;
      const values = sampleRows.map(r => (r[idx] || '').toString().trim()).filter(Boolean);
      const numericCount = values.filter(v => !isNaN(Number(v.replace(/[,₹$€£]/g, '')))).length;
      if (numericCount > values.length * 0.7) {
        if (!result.amount) result.amount = header;
      }
    });
  }

  return result;
}

// ── Auto-Categorization ───────────────────────────────────────────────────────

const CATEGORY_RULES: { pattern: RegExp; category: string }[] = [
  { pattern: /\bsalary\b|\bwages\b|\bpayroll\b|\bstipend\b|\bearn.*salary\b/i, category: 'Salary' },
  { pattern: /\bfreelance\b|\bconsult\b|\bproject\s*fee\b|\bcontract.*payment\b/i, category: 'Freelance' },
  { pattern: /\bdividend\b|\binterest\s*(earned|received|credit)\b|\breturn\b|\byield\b/i, category: 'Returns' },
  { pattern: /\brefund\b|\bcashback\b|\breversal\b|\bchargeback\b/i, category: 'Refund' },
  { pattern: /\bzomato\b|\bswiggy\b|\bdunzo\b|\bzepto\b|\binstamart\b/i, category: 'Dining' },
  { pattern: /\bamazon\b|\bflipkart\b|\bmyntra\b|\bajio\b|\bnykaa\b|\bmeesho\b/i, category: 'Shopping' },
  { pattern: /\buber\b|\bola\b|\brapido\b|\bbounce\b|\byulu\b/i, category: 'Transport' },
  { pattern: /\bnetflix\b|\bspotify\b|\bprime\b|\bhotstar\b|\byoutube\s*premium\b|\bdisney\b/i, category: 'Entertainment' },
  { pattern: /\brent\b|\bmortgage\b|\blease\b|\bmaintenance\s*(charge|fee)\b|\bhousing\s*society\b/i, category: 'Housing' },
  { pattern: /\bgrocery\b|\bgrocer\b|\bsupermarket\b|\bvegetable\b|\bkirana\b|\bmart\b|\bbigbasket\b|\bblinkit\b|\bfreshworks\b/i, category: 'Groceries' },
  { pattern: /\brestaurant\b|\bfood\b|\bcafe\b|\bcafeteria\b|\bpizza\b|\bburger\b|\bdining\b|\btiffin\b|\bmess\b|\bcanteen\b/i, category: 'Dining' },
  { pattern: /\bcab\b|\btaxi\b|\bpetrol\b|\bfuel\b|\bmetro\b|\bbus\b|\btrain\b|\bflight\b|\bparking\b|\btoll\b|\btransport\b|\bcommute\b/i, category: 'Transport' },
  { pattern: /\belectric\b|\bwater\b|\bgas\b|\binternet\b|\bwifi\b|\bphone\b|\bmobile\b|\brecharge\b|\bbroadband\b|\bbill\b|\butility\b|\bcharges\b/i, category: 'Utilities' },
  { pattern: /\bshop\b|\bmall\b|\bstore\b|\bpurchase\b|\bclothing\b|\bgarment\b|\belectronics\b/i, category: 'Shopping' },
  { pattern: /\bhospital\b|\bdoctor\b|\bpharma\b|\bmedicine\b|\bhealth\b|\bclinic\b|\blab\b|\btest\b|\bapollo\b|\bmedical\b|\bdrug\b/i, category: 'Health' },
  { pattern: /\bschool\b|\bcollege\b|\bcourse\b|\beducation\b|\btuition\b|\bbook\b|\budemy\b|\bcoursera\b|\bfees\b|\buniversity\b/i, category: 'Education' },
  { pattern: /\bmovie\b|\bgame\b|\bentertain\b|\bcinema\b|\btheatre\b|\bconcert\b/i, category: 'Entertainment' },
  { pattern: /\binsurance\b|\blic\b|\bpremium\b|\bpolicy\b/i, category: 'Insurance' },
  { pattern: /\bmutual\s*fund\b|\bsip\b|\binvest\b|\bstock\b|\bshare\b|\bfd\b|\bfixed\s*deposit\b|\bppf\b|\bnps\b|\bequity\b/i, category: 'Investment' },
  { pattern: /\bloan\b|\bemi\b|\binstallment\b|\brepay\b/i, category: 'Loan/EMI' },
  { pattern: /\bupi\b.*to\b|\bp2p\b|\bpeer.*transfer\b/i, category: 'Transfer' },
  { pattern: /\batm\b|\bcash\b|\bwithdraw\b|\bpos\b/i, category: 'Cash' },
  { pattern: /\bsubscription\b|\bsaas\b|\bcloud\b|\bmembership\b/i, category: 'Subscription' },
  { pattern: /\bgift\b|\bdonation\b|\bcharity\b/i, category: 'Gifts' },
  { pattern: /\btax\b|\bgst\b|\btds\b|\bincome\s*tax\b/i, category: 'Tax' },
  { pattern: /\btransfer\b|\bneft\b|\brtgs\b|\bimps\b|\bpayment\b/i, category: 'Transfer' },
];

export function autoCategory(description: string): string {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(description)) return rule.category;
  }
  return 'Other';
}

// ── Parse Numeric Value ───────────────────────────────────────────────────────

export function parseAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const str = String(value).replace(/[,₹$€£\s]/g, '').trim();
  const num = Number(str);
  return isNaN(num) ? 0 : num;
}

// ── Build Transactions from Raw Data ──────────────────────────────────────────

export function buildTransactions(
  headers: string[],
  rows: string[][],
  columns: DetectedColumns,
  batchId?: string
): Transaction[] {
  return rows
    .map((row, idx) => {
      const rawData: Record<string, string> = {};
      headers.forEach((h, i) => { rawData[h] = (row[i] || '').toString(); });

      const descIdx = columns.description ? headers.indexOf(columns.description) : -1;
      const description = descIdx >= 0 ? (row[descIdx] || '').toString().trim() : `Row ${idx + 1}`;

      const dateIdx = columns.date ? headers.indexOf(columns.date) : -1;
      const date = dateIdx >= 0 ? parseDate(row[dateIdx]) || '' : '';

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

      const catIdx = columns.category ? headers.indexOf(columns.category) : -1;
      const category = catIdx >= 0 && row[catIdx]
        ? row[catIdx].toString().trim()
        : autoCategory(description);

      return {
        id: `txn-${idx}-${Date.now()}`,
        date,
        description,
        amount,
        type,
        category,
        rawData,
        batchId,
      };
    })
    .filter((t): t is Transaction => t !== null);
}

// ── Summary Calculation ───────────────────────────────────────────────────────

export function calculateSummary(transactions: Transaction[]) {
  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((a, t) => a + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((a, t) => a + t.amount, 0);
  return {
    totalCredits,
    totalDebits,
    netFlow: totalCredits - totalDebits,
    transactionCount: transactions.length,
  };
}

// ── Grouping Utilities ────────────────────────────────────────────────────────

export interface GroupedData {
  key: string;
  transactions: Transaction[];
  totalAmount: number;
  count: number;
}

export function groupByCategory(transactions: Transaction[]): GroupedData[] {
  const map: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    if (!map[t.category]) map[t.category] = [];
    map[t.category].push(t);
  });
  return Object.entries(map)
    .map(([key, txns]) => ({
      key,
      transactions: txns,
      totalAmount: txns.reduce((a, t) => a + t.amount, 0),
      count: txns.length,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export function groupByField(transactions: Transaction[], field: 'category' | 'type' | 'date' | 'description'): GroupedData[] {
  const map: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    const key = ((t[field] as string) || 'Unknown');
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });
  return Object.entries(map)
    .map(([key, txns]) => ({
      key,
      transactions: txns,
      totalAmount: txns.reduce((a, t) => a + t.amount, 0),
      count: txns.length,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

// ── Flexible Dimension Analytics (Power BI-style) ─────────────────────────────

export interface DimensionOption {
  value: string;
  label: string;
  group: 'standard' | 'time' | 'raw';
}

export function groupByAny(transactions: Transaction[], dimension: string): GroupedData[] {
  const map: Record<string, Transaction[]> = {};
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  transactions.forEach(t => {
    let key: string;
    if (dimension === 'month') {
      key = t.date ? t.date.substring(0, 7) : 'Unknown';
    } else if (dimension === 'dayofweek') {
      key = t.date ? (DAYS[new Date(t.date + 'T12:00:00').getDay()] || 'Unknown') : 'Unknown';
    } else if (dimension.startsWith('raw:')) {
      const rawKey = dimension.slice(4);
      key = (t.rawData?.[rawKey] || '').trim() || 'Unknown';
    } else {
      key = ((t as unknown as Record<string, unknown>)[dimension] as string || '').trim() || 'Unknown';
    }
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });

  return Object.entries(map)
    .map(([key, txns]) => ({
      key,
      transactions: txns,
      totalAmount: txns.reduce((a, t) => a + t.amount, 0),
      count: txns.length,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export function getAvailableDimensions(
  transactions: Transaction[],
  detectedColumns?: DetectedColumns | null
): DimensionOption[] {
  const dims: DimensionOption[] = [
    { value: 'category', label: 'Category', group: 'standard' },
    { value: 'description', label: 'Payee / Name', group: 'standard' },
    { value: 'type', label: 'Transaction Type', group: 'standard' },
    { value: 'month', label: 'Month', group: 'time' },
    { value: 'dayofweek', label: 'Day of Week', group: 'time' },
  ];

  if (transactions.length === 0) return dims;

  const mappedCols = new Set<string>(
    Object.values(detectedColumns || {}).filter(Boolean) as string[]
  );

  const rawKeys = new Set<string>();
  transactions.slice(0, 100).forEach(t => {
    Object.keys(t.rawData || {}).forEach(k => rawKeys.add(k));
  });

  rawKeys.forEach(key => {
    if (mappedCols.has(key)) return;
    const values = transactions.slice(0, 100)
      .map(t => (t.rawData?.[key] || '').trim()).filter(Boolean);
    if (values.length === 0) return;
    const unique = new Set(values).size;
    const isNumeric = values.every(v => !isNaN(Number(v.replace(/[,₹$€£\s]/g, ''))));
    if (!isNumeric && unique >= 2 && unique <= Math.max(values.length * 0.9, 2)) {
      dims.push({ value: `raw:${key}`, label: key, group: 'raw' });
    }
  });

  return dims;
}

/**
 * Analytics Shared Data Store
 *
 * Single source of truth for all analytics tools.
 * Only ManageTransactions can write; all other tools read.
 * Data persists in localStorage across sessions.
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

export interface MonthlyData {
  monthKey: string;        // "2024-01"
  monthLabel: string;      // "January 2024"
  fileName: string;
  uploadedAt: string;
  transactions: Transaction[];
  detectedColumns: DetectedColumns;
  rawHeaders?: string[];   // original column headers from uploaded file (for re-mapping)
  summary: {
    totalCredits: number;
    totalDebits: number;
    netFlow: number;
    transactionCount: number;
  };
}

export interface AnalyticsStoreData {
  months: Record<string, MonthlyData>;
}

// ── Storage Operations ────────────────────────────────────────────────────────

const STORAGE_KEY = 'otsd-analytics-store';

export function loadStore(): AnalyticsStoreData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { months: {} };
}

export function saveStore(data: AnalyticsStoreData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getMonthData(monthKey: string): MonthlyData | null {
  return loadStore().months[monthKey] || null;
}

export function saveMonthData(data: MonthlyData): void {
  const store = loadStore();
  store.months[data.monthKey] = data;
  saveStore(store);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('analytics-store-updated'));
  }
}

export function deleteMonthData(monthKey: string): void {
  const store = loadStore();
  delete store.months[monthKey];
  saveStore(store);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('analytics-store-updated'));
  }
}

export function getAllMonthKeys(): string[] {
  return Object.keys(loadStore().months).sort().reverse();
}

// Batch-update transaction categories for a given month.
// updates = { [transactionId]: newCategory }
export function updateTransactionCategories(
  monthKey: string,
  updates: Record<string, string>
): void {
  const data = getMonthData(monthKey);
  if (!data) return;
  const transactions = data.transactions.map(t =>
    updates[t.id] ? { ...t, category: updates[t.id] } : t
  );
  saveMonthData({ ...data, transactions, summary: calculateSummary(transactions) });
}

export const ALL_CATEGORIES = [
  'Salary', 'Freelance', 'Returns', 'Refund',
  'Dining', 'Shopping', 'Transport', 'Entertainment',
  'Housing', 'Groceries', 'Utilities', 'Health', 'Education',
  'Insurance', 'Investment', 'Loan/EMI', 'Transfer', 'Cash',
  'Subscription', 'Gifts', 'Tax', 'Other',
];

export function getTransactions(monthKey: string, type?: 'credit' | 'debit'): Transaction[] {
  const data = getMonthData(monthKey);
  if (!data) return [];
  if (type) return data.transactions.filter(t => t.type === type);
  return data.transactions;
}

export function getAllTransactions(type?: 'credit' | 'debit'): Transaction[] {
  const store = loadStore();
  const all = Object.values(store.months).flatMap(m => m.transactions);
  if (type) return all.filter(t => t.type === type);
  return all;
}

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

  // First pass: find the primary date column (prefer "Date"/"Tran Date" over "Value Date")
  const primaryDatePat = /\btransaction\s*date\b|\btran\s*date\b|\bposting\s*date\b|\bvalue\s*date\b|\bdate\b|\bdt\b/i;
  const valueDatePat = /^value\s*d(ate)?$/i; // "Value D" or "Value Date" = secondary date
  for (const [header] of headers.map((h, i) => [h, i] as [string, number])) {
    const h = header.toLowerCase().trim();
    if (primaryDatePat.test(h) && !valueDatePat.test(h)) { result.date = header; break; }
  }
  if (!result.date) {
    // Accept "Value Date" as date if nothing better found
    for (const header of headers) {
      if (valueDatePat.test(header)) { result.date = header; break; }
    }
  }

  headers.forEach((header, idx) => {
    const h = header.toLowerCase().trim();
    const values = sampleRows.map(r => (r[idx] || '').toString().trim()).filter(Boolean);

    // Date (data-based detection as fallback — skip already-mapped)
    if (!result.date) {
      if (values.length > 0 && values.filter(v => isDateLike(v)).length > values.length * 0.5) {
        result.date = header;
        return;
      }
    }
    // Skip headers already assigned as date
    if (header === result.date) return;

    // Credit/Deposit
    if (!result.creditAmount && /\bcredit\b|\bdeposit\b|\bcr\b|\bincome\b|\binward\b/i.test(h)) {
      result.creditAmount = header;
      return;
    }

    // Debit/Withdrawal
    if (!result.debitAmount && /\bdebit\b|\bwithdraw(al)?\b|\bdr\b|\bexpense\b|\boutward\b/i.test(h)) {
      result.debitAmount = header;
      return;
    }

    // Balance
    if (!result.balance && /\bbalance\b|\bclosing\b|\brunning\b|\bavailable\b/i.test(h)) {
      result.balance = header;
      return;
    }

    // Single amount column (value only if not a date column)
    if (!result.amount && /\bamount\b|\bprice\b|\btotal\b|\bsum\b/i.test(h)) {
      result.amount = header;
      return;
    }
    // "Value" without "date" context → amount
    if (!result.amount && /^value$/i.test(h)) {
      result.amount = header;
      return;
    }

    // Description — prioritize narration/name/payee, exclude transaction-type columns
    if (!result.description) {
      if (/\bnarration\b|\bparticular\b|\bremark\b|\bdescription\b|\bdesc\b|\bdetail\b|\bmemo\b|\bnote\b|\bpayee\b|\bbeneficiary\b/i.test(h)) {
        result.description = header;
        return;
      }
      // "Name" column is usually the merchant/payee name in bank statements
      if (/^name$/i.test(h)) {
        result.description = header;
        return;
      }
      // "Transaction Remarks", "Transaction Details" → description; plain "Transaction" → category
      if (/\btransaction\s+(desc|detail|remark|narration|ref|particulars)/i.test(h)) {
        result.description = header;
        return;
      }
    }

    // Category / Transaction Type (must check AFTER description to avoid "Transaction" matching desc)
    if (!result.category) {
      // Data-based: column with only "Debit/Credit/DR/CR" values → it's a type/category column
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
  // Income patterns (must be first to catch credits properly)
  { pattern: /\bsalary\b|\bwages\b|\bpayroll\b|\bstipend\b|\bearn.*salary\b/i, category: 'Salary' },
  { pattern: /\bfreelance\b|\bconsult\b|\bproject\s*fee\b|\bcontract.*payment\b/i, category: 'Freelance' },
  { pattern: /\bdividend\b|\binterest\s*(earned|received|credit)\b|\breturn\b|\byield\b/i, category: 'Returns' },
  { pattern: /\brefund\b|\bcashback\b|\breversal\b|\bchargeback\b/i, category: 'Refund' },

  // Expense patterns - Specific merchants/services first (more specific patterns)
  { pattern: /\bzomato\b|\bswiggy\b|\bdunzo\b|\bzepto\b|\binstamart\b/i, category: 'Dining' },
  { pattern: /\bamazon\b|\bflipkart\b|\bmyntra\b|\bajio\b|\bnykaa\b|\bmeesho\b/i, category: 'Shopping' },
  { pattern: /\buber\b|\bola\b|\brapido\b|\bbounce\b|\byulu\b/i, category: 'Transport' },
  { pattern: /\bnetflix\b|\bspotify\b|\bprime\b|\bhotstar\b|\byoutube\s*premium\b|\bdisney\b/i, category: 'Entertainment' },

  // General expense categories
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

  // Bank-specific patterns (generic transaction types - lower priority)
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
  columns: DetectedColumns
): Transaction[] {
  return rows
    .map((row, idx) => {
      const rawData: Record<string, string> = {};
      headers.forEach((h, i) => { rawData[h] = (row[i] || '').toString(); });

      // Get description
      const descIdx = columns.description ? headers.indexOf(columns.description) : -1;
      const description = descIdx >= 0 ? (row[descIdx] || '').toString().trim() : `Row ${idx + 1}`;

      // Get date
      const dateIdx = columns.date ? headers.indexOf(columns.date) : -1;
      const date = dateIdx >= 0 ? parseDate(row[dateIdx]) || '' : '';

      // Determine amount and type
      let amount = 0;
      let type: 'credit' | 'debit' = 'debit';

      if (columns.creditAmount && columns.debitAmount) {
        // Separate credit/debit columns
        const crIdx = headers.indexOf(columns.creditAmount);
        const drIdx = headers.indexOf(columns.debitAmount);
        const crAmt = crIdx >= 0 ? parseAmount(row[crIdx]) : 0;
        const drAmt = drIdx >= 0 ? parseAmount(row[drIdx]) : 0;

        if (crAmt > 0) {
          amount = crAmt;
          type = 'credit';
        } else if (drAmt > 0) {
          amount = Math.abs(drAmt);
          type = 'debit';
        }
      } else if (columns.amount) {
        // Single amount column
        const amtIdx = headers.indexOf(columns.amount);
        const rawAmt = amtIdx >= 0 ? parseAmount(row[amtIdx]) : 0;
        amount = Math.abs(rawAmt);
        type = rawAmt >= 0 ? 'credit' : 'debit';
      }

      // Skip rows with zero amount
      if (amount === 0) return null;

      // Get category
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

/**
 * Group transactions by any dimension: standard fields, derived time fields,
 * or raw Excel columns (raw:ColumnName).
 */
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

/**
 * Discover available grouping dimensions from the actual data.
 * Includes standard fields, time derivations, and raw Excel columns
 * that are not already mapped (text-only, with sufficient variety).
 */
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

  // Collect already-mapped column names so we don't double-expose them
  const mappedCols = new Set<string>(
    Object.values(detectedColumns || {}).filter(Boolean) as string[]
  );

  // Scan raw keys from first 100 transactions
  const rawKeys = new Set<string>();
  transactions.slice(0, 100).forEach(t => {
    Object.keys(t.rawData || {}).forEach(k => rawKeys.add(k));
  });

  rawKeys.forEach(key => {
    if (mappedCols.has(key)) return; // already mapped to a standard field
    const values = transactions.slice(0, 100)
      .map(t => (t.rawData?.[key] || '').trim()).filter(Boolean);
    if (values.length === 0) return;
    const unique = new Set(values).size;
    const isNumeric = values.every(v => !isNaN(Number(v.replace(/[,₹$€£\s]/g, ''))));
    // Only include text columns with 2+ distinct values and not too many unique values
    if (!isNumeric && unique >= 2 && unique <= Math.max(values.length * 0.9, 2)) {
      dims.push({ value: `raw:${key}`, label: key, group: 'raw' });
    }
  });

  return dims;
}

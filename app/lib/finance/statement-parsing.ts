/**
 * Shared bank-statement parsing utilities.
 *
 * Extracted from analytics-store.ts so Personal Finance, Business OS, and
 * future financial-core consumers depend on a neutral module instead of on
 * the legacy Analytics tool silo. analytics-store.ts re-exports these for
 * backward compatibility with its existing consumers.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DetectedColumns {
  date: string | null;
  amount: string | null;
  creditAmount: string | null;
  debitAmount: string | null;
  description: string | null;
  category: string | null;
  balance: string | null;
}

// ── Date Parsing ──────────────────────────────────────────────────────────────

export function parseDate(value: unknown): string | null {
  if (!value) return null;

  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }

  const str = String(value).trim();
  if (!str) return null;

  // ISO: YYYY-MM-DD (also handles ISO datetime: YYYY-MM-DDTHH:MM:SS)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);

  // YYYY/MM/DD (with slashes)
  const ymdSlash = str.match(/^(\d{4})\/(\d{2})\/(\d{2})/);
  if (ymdSlash) return `${ymdSlash[1]}-${ymdSlash[2]}-${ymdSlash[3]}`;

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY — with optional trailing time (e.g. "15/01/2024 10:30:00")
  // Also handles 2-digit year: DD/MM/YY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})(?:[\sT]\d{1,2}:\d{2}.*)?$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  // DD-MMM-YYYY or DD/MMM/YYYY (e.g., 15-Jan-2024, 15 Jan 24) — with optional trailing time
  const namedMatch = str.match(/^(\d{1,2})[\/\-.\s]([A-Za-z]{3,})[\/\-.\s](\d{2,4})(?:[\sT]\d{1,2}:\d{2}.*)?$/);
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
      // Only map to category if the column header explicitly says "category" / "tag" etc.
      // Do NOT map transaction-type columns (Debit/Credit/DR/CR) — those are direction, not category.
      if (/\bcategor\b|\btrans\s*type\b|\bclass\b|\btag\b|\bhead\b/i.test(h)) {
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

"use client";
import React, { useState, useCallback, useMemo } from 'react';
import { Upload, CheckCircle2, AlertTriangle, Info, X, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

type MatchStatus = 'matched' | 'unmatched_bank' | 'unmatched_book';

interface BankEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  matchId?: string;
  status: MatchStatus;
}

interface BookEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  matchId?: string;
  status: MatchStatus;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  result.push(cur.trim());
  return result;
}

function parseBankCSV(text: string): BankEntry[] {
  const lines = text.split('\n').filter(l => l.trim());
  const entries: BankEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i]);
    if (cols.length < 3) continue;
    const amount = parseFloat(cols[2]?.replace(/[^0-9.-]/g, '')) || 0;
    if (amount === 0) continue;
    entries.push({
      id: `bank-${i}`,
      date: cols[0] || '',
      description: cols[1] || '',
      amount: Math.abs(amount),
      type: amount >= 0 ? 'credit' : 'debit',
      status: 'unmatched_bank',
    });
  }
  return entries;
}

// Sample data
const SAMPLE_BANK: BankEntry[] = [
  { id: 'b1', date: '2024-01-02', description: 'UPI/Client ABC Payment', amount: 50000, type: 'credit', status: 'unmatched_bank' },
  { id: 'b2', date: '2024-01-05', description: 'NEFT/Office Rent', amount: 25000, type: 'debit', status: 'unmatched_bank' },
  { id: 'b3', date: '2024-01-10', description: 'UPI/Supplier XYZ', amount: 15000, type: 'debit', status: 'unmatched_bank' },
  { id: 'b4', date: '2024-01-15', description: 'UPI/Client DEF', amount: 80000, type: 'credit', status: 'unmatched_bank' },
  { id: 'b5', date: '2024-01-20', description: 'ATM Withdrawal', amount: 10000, type: 'debit', status: 'unmatched_bank' },
  { id: 'b6', date: '2024-01-22', description: 'IMPS/Unknown Transfer', amount: 5000, type: 'debit', status: 'unmatched_bank' },
];
const SAMPLE_BOOK: BookEntry[] = [
  { id: 'k1', date: '2024-01-02', description: 'Invoice #101 - Client ABC', amount: 50000, type: 'income', status: 'unmatched_book' },
  { id: 'k2', date: '2024-01-05', description: 'Office Rent - Jan', amount: 25000, type: 'expense', status: 'unmatched_book' },
  { id: 'k3', date: '2024-01-10', description: 'Raw materials - Supplier XYZ', amount: 15000, type: 'expense', status: 'unmatched_book' },
  { id: 'k4', date: '2024-01-15', description: 'Invoice #102 - Client DEF', amount: 80000, type: 'income', status: 'unmatched_book' },
  { id: 'k5', date: '2024-01-28', description: 'Salary - Staff', amount: 35000, type: 'expense', status: 'unmatched_book' },
];

function autoMatch(bank: BankEntry[], book: BookEntry[]): { bank: BankEntry[]; book: BookEntry[] } {
  const updatedBank = bank.map(b => ({ ...b }));
  const updatedBook = book.map(b => ({ ...b }));

  for (const b of updatedBank) {
    if (b.status !== 'unmatched_bank') continue;
    for (const k of updatedBook) {
      if (k.status !== 'unmatched_book') continue;
      const amountMatch = b.amount === k.amount;
      const typeMatch = (b.type === 'credit' && k.type === 'income') || (b.type === 'debit' && k.type === 'expense');
      if (amountMatch && typeMatch) {
        b.status = 'matched';
        k.status = 'matched';
        b.matchId = k.id;
        k.matchId = b.id;
        break;
      }
    }
  }
  return { bank: updatedBank, book: updatedBook };
}

export const BizReconcile = () => {
  const [bankEntries, setBankEntries] = useState<BankEntry[]>(SAMPLE_BANK);
  const [bookEntries, setBookEntries] = useState<BookEntry[]>(SAMPLE_BOOK);
  const [usingSample, setUsingSample] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'matched' | 'bank_only' | 'book_only'>('all');
  const [isMatched, setIsMatched] = useState(false);

  const handleBankUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const entries = parseBankCSV(text);
      setBankEntries(entries);
      setUsingSample(false);
      setIsMatched(false);
    };
    reader.readAsText(file);
  }, []);

  const runAutoMatch = () => {
    const { bank, book } = autoMatch(bankEntries, bookEntries);
    setBankEntries(bank);
    setBookEntries(book);
    setIsMatched(true);
  };

  const manualMatch = (bankId: string, bookId: string) => {
    setBankEntries(prev => prev.map(b => b.id === bankId ? { ...b, status: 'matched', matchId: bookId } : b));
    setBookEntries(prev => prev.map(k => k.id === bookId ? { ...k, status: 'matched', matchId: bankId } : k));
  };

  const unmatch = (bankId: string) => {
    const bank = bankEntries.find(b => b.id === bankId);
    if (!bank?.matchId) return;
    setBankEntries(prev => prev.map(b => b.id === bankId ? { ...b, status: 'unmatched_bank', matchId: undefined } : b));
    setBookEntries(prev => prev.map(k => k.id === bank.matchId ? { ...k, status: 'unmatched_book', matchId: undefined } : k));
  };

  const stats = useMemo(() => {
    const matched = bankEntries.filter(b => b.status === 'matched').length;
    const bankOnly = bankEntries.filter(b => b.status === 'unmatched_bank').length;
    const bookOnly = bookEntries.filter(b => b.status === 'unmatched_book').length;
    const matchedAmt = bankEntries.filter(b => b.status === 'matched').reduce((s, b) => s + b.amount, 0);
    const bankTotal = bankEntries.reduce((s, b) => s + b.amount, 0);
    const matchPct = bankEntries.length > 0 ? (matched / bankEntries.length) * 100 : 0;
    return { matched, bankOnly, bookOnly, matchedAmt, bankTotal, matchPct };
  }, [bankEntries, bookEntries]);

  const matchedPairs = useMemo(() =>
    bankEntries
      .filter(b => b.status === 'matched')
      .map(b => ({
        bank: b,
        book: bookEntries.find(k => k.id === b.matchId),
      }))
  , [bankEntries, bookEntries]);

  const tabs = [
    { key: 'all', label: 'All', count: bankEntries.length + bookEntries.length },
    { key: 'matched', label: 'Matched', count: stats.matched },
    { key: 'bank_only', label: 'Bank Only', count: stats.bankOnly },
    { key: 'book_only', label: 'Books Only', count: stats.bookOnly },
  ] as const;

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Bank Reconciliation"
        subtitle="Match bank statement against daybook entries"
        kpis={[
          { label: 'Bank Entries', value: String(bankEntries.length), color: 'neutral', subtitle: 'Statement transactions' },
          { label: 'Matched', value: String(stats.matched), color: 'success', subtitle: `${stats.matchPct.toFixed(0)}% reconciled` },
          { label: 'Bank-Only (Unmatched)', value: String(stats.bankOnly), color: stats.bankOnly > 0 ? 'warning' : 'success', subtitle: 'Not in daybook' },
          { label: 'Books-Only (Unmatched)', value: String(stats.bookOnly), color: stats.bookOnly > 0 ? 'error' : 'success', subtitle: 'Not in bank stmt' },
        ]}
      />

      <div className="p-4 space-y-4">
        {usingSample && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800 flex gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">Showing sample data. Upload your bank statement CSV to reconcile with your Business OS Daybook.</p>
          </div>
        )}

        {/* Upload + Auto-Match */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 cursor-pointer hover:border-blue-300 transition-colors">
            <FileSpreadsheet className="w-5 h-5 text-slate-400" />
            <div>
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload Bank Statement</div>
              <div className="text-xs text-slate-400">CSV: date, description, amount</div>
            </div>
            <input type="file" accept=".csv" className="hidden" onChange={handleBankUpload} />
          </label>

          <button onClick={runAutoMatch}
            className="flex items-center justify-center gap-3 p-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
            <RefreshCw className="w-5 h-5" />
            <div className="text-left">
              <div className="text-sm font-semibold">Auto-Match Entries</div>
              <div className="text-xs opacity-80">Match by amount + type</div>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${activeTab === tab.key
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'}`}>
              {tab.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {(activeTab === 'all' || activeTab === 'matched') && matchedPairs.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Matched ({stats.matched})
            </h3>
            {matchedPairs.map(({ bank, book }) => (
              <div key={bank.id} className="bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">BANK</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 truncate">{bank.description}</div>
                      <div className="text-xs text-slate-400">{bank.date} · {bank.type === 'credit' ? '+' : '-'}{fmt(bank.amount)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">DAYBOOK</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 truncate">{book?.description}</div>
                      <div className="text-xs text-slate-400">{book?.date} · {fmt(book?.amount || 0)}</div>
                    </div>
                  </div>
                  <button onClick={() => unmatch(bank.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors ml-2 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'bank_only') && stats.bankOnly > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Bank Only — Not in Daybook ({stats.bankOnly})
            </h3>
            {bankEntries.filter(b => b.status === 'unmatched_bank').map(b => (
              <div key={b.id} className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-3 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{b.description}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{b.date} · <span className={b.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}>{b.type === 'credit' ? '+' : '-'}{fmt(b.amount)}</span></div>
                </div>
                <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-lg font-semibold">Missing in Books</span>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'book_only') && stats.bookOnly > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Books Only — Not in Bank ({stats.bookOnly})
            </h3>
            {bookEntries.filter(k => k.status === 'unmatched_book').map(k => (
              <div key={k.id} className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 border border-red-200 dark:border-red-800 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">{k.description}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{k.date} · <span className={k.type === 'income' ? 'text-emerald-600' : 'text-red-500'}>{fmt(k.amount)}</span></div>
                </div>
                <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded-lg font-semibold">Not in Bank</span>
              </div>
            ))}
          </div>
        )}

        {stats.bankOnly === 0 && stats.bookOnly === 0 && stats.matched > 0 && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800 flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Fully reconciled! All bank entries match your daybook. Books are in order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

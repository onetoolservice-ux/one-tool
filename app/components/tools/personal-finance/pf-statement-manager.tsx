'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Upload, Plus, Trash2, FileSpreadsheet, AlertCircle,
  CheckCircle2, X, ChevronDown, ChevronUp, Database,
  RefreshCw, Info, ShieldAlert, ShieldCheck,
} from 'lucide-react';
import { useToast } from '@/app/components/ui/toast-system';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  type PFAccount, type PFStatement, type DetectedColumns,
  loadPFStore, addAccount, deleteAccount, getAccounts,
  getStatements, deleteStatement, ingestStatement,
  getIntegrityReport, type IntegrityReport,
  detectColumns, buildPFTransactions, fmtINR,
  computeIntegrityScore,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// STATEMENT MANAGER — Production-Ready
//
// Import pipeline:
//   1. Select account
//   2. Upload & parse file
//   3. Column mapping (mandatory — blocks if Date/Amount unmapped)
//   4. Data integrity check (blocks if >5% missing dates)
//   5. Preview 10 rows
//   6. Confirm & save
// ═══════════════════════════════════════════════════════════════════════════════

type Step = 'list' | 'mapping';

const ACCOUNT_TYPES: { value: PFAccount['type']; label: string }[] = [
  { value: 'bank',        label: 'Bank Account' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash',        label: 'Cash / Wallet' },
  { value: 'other',       label: 'Other' },
];

// ── Shared page header (white/neutral for secondary pages) ────────────────────
function PageHeader({
  title, subtitle, kpis,
}: {
  title: string;
  subtitle?: string;
  kpis?: Array<{ label: string; value: string | number; color?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' }>;
}) {
  const colorMap: Record<string, string> = {
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error:   'text-red-600   dark:text-red-400',
    neutral: 'text-slate-700 dark:text-slate-200',
  };
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-5 py-4">
      <p className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      {kpis && kpis.length > 0 && (
        <div className="flex flex-wrap gap-5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {kpis.map(k => (
            <div key={k.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{k.label}</p>
              <p className={`text-lg font-black ${colorMap[k.color ?? 'neutral']}`}>{k.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StatementManager() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('list');
  const [isDragging, setIsDragging] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  // Account form
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accName, setAccName]   = useState('');
  const [accType, setAccType]   = useState<PFAccount['type']>('bank');
  const [accCurrency, setAccCurrency] = useState('INR');

  // Upload state
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'csv' | 'excel'>('csv');
  const [columns, setColumns] = useState<DetectedColumns>({
    date: null, amount: null, creditAmount: null,
    debitAmount: null, description: null, category: null, balance: null,
  });
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Blocking modal state (>5% missing dates)
  const [showMissingDateModal, setShowMissingDateModal] = useState(false);

  // Data
  const [accounts, setAccounts]     = useState<PFAccount[]>([]);
  const [statements, setStatements] = useState<PFStatement[]>([]);
  const [integrity, setIntegrity]   = useState<IntegrityReport | null>(null);

  const reload = () => {
    setAccounts(getAccounts());
    setStatements(getStatements());
    setIntegrity(getIntegrityReport());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    const handler = () => reload();
    window.addEventListener('pf-store-updated', handler);
    return () => window.removeEventListener('pf-store-updated', handler);
  }, []);

  // ── Pre-save column validation ────────────────────────────────────────────────
  const dateOk   = Boolean(columns.date);
  const amountOk = Boolean(columns.amount || columns.creditAmount);
  const descOk   = Boolean(columns.description);
  const canSave  = dateOk && amountOk && descOk && rawRows.length > 0;

  // ── Live integrity stats from parsed rows (using first 200 rows for speed) ───
  const liveIntegrity = useMemo(() => {
    if (rawRows.length === 0 || !selectedAccountId) return null;
    const sample = buildPFTransactions(rawHeaders, rawRows, columns, selectedAccountId, 'preview');
    const total   = sample.length;
    const missingDate    = sample.filter(t => !t.date).length;
    const invalidAmount  = rawRows.filter(row => {
      const amtCols = [columns.amount, columns.creditAmount, columns.debitAmount].filter(Boolean);
      return amtCols.length > 0 && amtCols.every(col => {
        const idx = rawHeaders.indexOf(col!);
        const val = row[idx] ?? '';
        const n = parseFloat(val.replace(/[₹,\s]/g, ''));
        return isNaN(n) || n === 0;
      });
    }).length;
    const unclassified  = sample.filter(t => t.category === 'Miscellaneous' || t.category === 'Other').length;
    const score = computeIntegrityScore({ total, missingDate, invalidAmount, unclassified, duplicates: 0 });
    const missingDatePct = total > 0 ? (missingDate / total) * 100 : 0;
    return { total, missingDate, missingDatePct, invalidAmount, unclassified, score };
  }, [rawHeaders, rawRows, columns, selectedAccountId]);

  // ── Preview transactions (first 10 rows) ──────────────────────────────────────
  const previewTxns = useMemo(() =>
    rawRows.length > 0
      ? buildPFTransactions(rawHeaders, rawRows.slice(0, 10), columns, selectedAccountId || 'preview', 'preview')
      : [],
    [rawHeaders, rawRows, columns, selectedAccountId]
  );

  // ── File Parsing ─────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx?|csv)$/i)) {
      toast('Please upload an Excel (.xlsx, .xls) or CSV file', 'error');
      return;
    }
    if (!selectedAccountId) {
      toast('Please select or create an account first', 'error');
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      // Find header row (row with most non-empty cells in first 10 rows)
      let headerIdx = 0;
      let maxCols = 0;
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const nonEmpty = rawData[i].filter((c: unknown) => c !== '' && c != null).length;
        if (nonEmpty > maxCols) { maxCols = nonEmpty; headerIdx = i; }
      }

      const headers = rawData[headerIdx].map((h: unknown) =>
        String(h || '').trim() || `Column ${headerIdx}`,
      );
      const dataRows = rawData
        .slice(headerIdx + 1)
        .map(row => headers.map((_: string, i: number) => {
          const cell = row[i];
          // XLSX with cellDates:true returns JS Date objects for date cells.
          // Convert them directly to YYYY-MM-DD rather than relying on String() locale output.
          if (cell instanceof Date && !isNaN(cell.getTime())) {
            const y = cell.getFullYear();
            const mo = String(cell.getMonth() + 1).padStart(2, '0');
            const d = String(cell.getDate()).padStart(2, '0');
            return `${y}-${mo}-${d}`;
          }
          return String(cell ?? '').trim();
        }))
        .filter(row => row.some(cell => cell !== ''));

      if (headers.length === 0 || dataRows.length === 0) {
        toast('No data found in file. Check the file format.', 'error');
        return;
      }

      const detectedIsExcel = file.name.match(/\.xlsx?$/i) ? 'excel' : 'csv';
      setFileType(detectedIsExcel as 'csv' | 'excel');
      setRawHeaders(headers);
      setRawRows(dataRows);
      setFileName(file.name);
      setColumns(detectColumns(headers, dataRows));
      setStep('mapping');
      toast(`Parsed ${dataRows.length} rows from "${file.name}"`, 'success');
    } catch (err) {
      toast(`Failed to parse file: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  }, [selectedAccountId, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Save with blocking checks ────────────────────────────────────────────────
  const handleSaveRequest = () => {
    if (!canSave) return;
    // Check for >5% missing dates — show blocking modal
    if (liveIntegrity && liveIntegrity.missingDatePct > 5) {
      setShowMissingDateModal(true);
      return;
    }
    doSave();
  };

  const doSave = () => {
    if (!selectedAccountId || rawRows.length === 0) return;
    setShowMissingDateModal(false);
    const result = ingestStatement({
      accountId: selectedAccountId,
      fileName,
      fileType,
      headers: rawHeaders,
      rows: rawRows,
      detectedColumns: columns,
      skipDuplicates,
    });
    toast(
      `Imported ${result.addedCount} transactions${result.duplicateCount > 0 ? ` (${result.duplicateCount} duplicates skipped)` : ''}`,
      'success',
    );
    resetUpload();
  };

  const resetUpload = () => {
    setRawHeaders([]); setRawRows([]); setFileName(''); setStep('list');
    setShowMissingDateModal(false);
  };

  // ── Add Account ───────────────────────────────────────────────────────────────
  const handleAddAccount = () => {
    if (!accName.trim()) { toast('Account name is required', 'error'); return; }
    const acc = addAccount({ name: accName.trim(), type: accType, currency: accCurrency });
    setAccName(''); setShowAddAccount(false);
    setSelectedAccountId(acc.id);
    toast(`Account "${acc.name}" created`, 'success');
  };

  const toggleAccount = (id: string) => {
    setExpandedAccounts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (!mounted) return null;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Statement Manager"
        subtitle="Upload bank statements, manage accounts, and monitor data integrity"
        kpis={integrity ? [
          { label: 'Accounts',     value: integrity.totalAccounts,     color: 'primary' },
          { label: 'Statements',   value: integrity.totalStatements,   color: 'neutral' },
          { label: 'Transactions', value: integrity.totalTransactions, color: 'neutral' },
          { label: 'Integrity',    value: `${integrity.overallIntegrityScore}%`, color: integrity.overallIntegrityScore >= 80 ? 'success' : integrity.overallIntegrityScore >= 60 ? 'warning' : 'error' },
        ] : undefined}
      />
    <div className="space-y-4 px-4 pb-4">

      {/* ── STEP: List ────────────────────────────────────────────────────── */}
      {step === 'list' && (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap gap-2 items-center justify-between bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3">
            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
              >
                <option value="">— Select account —</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.type.replace('_', ' ')})</option>
                ))}
              </select>
              {selectedAccountId && (
                <label className="cursor-pointer">
                  <span className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Upload size={14} /> Upload Statement
                  </span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>
            <button
              onClick={() => setShowAddAccount(v => !v)}
              className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors font-semibold"
            >
              <Plus size={14} /> Add Account
            </button>
          </div>

          {/* Add Account Form */}
          {showAddAccount && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">New Account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  placeholder="Account name (e.g. HDFC Salary)"
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                />
                <select
                  value={accType}
                  onChange={e => setAccType(e.target.value as PFAccount['type'])}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select
                  value={accCurrency}
                  onChange={e => setAccCurrency(e.target.value)}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                >
                  {['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddAccount} className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Create Account
                </button>
                <button onClick={() => setShowAddAccount(false)} className="text-sm text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Account List */}
          {accounts.length === 0 ? (
            <div className="text-center py-16 text-slate-400 dark:text-slate-600">
              <Database size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No accounts yet.</p>
              <p className="text-xs mt-1">Add an account to start uploading statements.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map(acc => {
                const accStmts = statements.filter(s => s.accountId === acc.id);
                const isOpen = expandedAccounts.has(acc.id);
                const accTypeColor = acc.type === 'bank' ? 'bg-blue-600' : acc.type === 'credit_card' ? 'bg-orange-500' : 'bg-slate-500';
                return (
                  <div key={acc.id} className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => toggleAccount(acc.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${accTypeColor}`}>
                          {acc.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{acc.name}</p>
                          <p className="text-xs text-slate-500">{acc.type.replace('_', ' ')} · {acc.currency} · {accStmts.length} statement{accStmts.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Delete account "${acc.name}" and all its data?`)) deleteAccount(acc.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                        {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t border-slate-100 dark:border-slate-800">
                        {accStmts.length === 0 ? (
                          <p className="text-xs text-slate-400 px-4 py-3">No statements uploaded yet.</p>
                        ) : (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase tracking-wide text-[10px]">
                                <th className="px-4 py-2 text-left font-semibold">File</th>
                                <th className="px-4 py-2 text-left font-semibold">Period</th>
                                <th className="px-4 py-2 text-right font-semibold">Txns</th>
                                <th className="px-4 py-2 text-right font-semibold">Integrity</th>
                                <th className="px-4 py-2 text-left font-semibold">Issues</th>
                                <th className="px-2 py-2" />
                              </tr>
                            </thead>
                            <tbody>
                              {accStmts.map(stmt => (
                                <tr key={stmt.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-200 max-w-[160px] truncate">{stmt.fileName}</td>
                                  <td className="px-4 py-2.5 text-slate-500">
                                    {stmt.periodFrom && stmt.periodTo
                                      ? `${stmt.periodFrom} → ${stmt.periodTo}`
                                      : '—'}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-slate-700 dark:text-slate-200">{stmt.transactionCount}</td>
                                  <td className="px-4 py-2.5 text-right">
                                    <span className={`font-bold ${stmt.integrityScore >= 80 ? 'text-emerald-600' : stmt.integrityScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                      {stmt.integrityScore}%
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5">
                                    {stmt.missingDataFlags.length > 0 ? (
                                      <span className="flex items-center gap-1 text-amber-600">
                                        <AlertCircle size={11} />
                                        {stmt.missingDataFlags.length} flag{stmt.missingDataFlags.length !== 1 ? 's' : ''}
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-emerald-600">
                                        <CheckCircle2 size={11} /> Clean
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-2 py-2.5">
                                    <button
                                      onClick={() => { if (confirm('Delete this statement and all its transactions?')) deleteStatement(stmt.id); }}
                                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Overall Integrity Panel */}
          {integrity && integrity.totalTransactions > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  {integrity.overallIntegrityScore >= 80
                    ? <ShieldCheck size={15} className="text-emerald-600" />
                    : <ShieldAlert size={15} className="text-amber-600" />
                  }
                  Data Integrity Panel
                </div>
                <span className={`text-sm font-black ${integrity.overallIntegrityScore >= 80 ? 'text-emerald-600' : integrity.overallIntegrityScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  Score: {integrity.overallIntegrityScore}%
                </span>
              </div>

              {integrity.overallIntegrityScore < 80 && (
                <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <AlertCircle size={12} className="shrink-0" />
                  Some calculations may be incomplete due to data issues.
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-slate-800">
                {[
                  { label: 'Missing Dates',       value: integrity.missingDateCount,    bad: integrity.missingDateCount > 0 },
                  { label: 'Duplicate Txns',       value: integrity.duplicateCount,      bad: false },
                  { label: 'Unclassified Txns',    value: integrity.unclassifiedCount,   bad: integrity.unclassifiedCount > 0 },
                  { label: 'Invalid Amount Rows',  value: integrity.invalidAmountCount,  bad: integrity.invalidAmountCount > 0 },
                ].map(s => (
                  <div key={s.label} className="px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
                    <p className={`text-xl font-black mt-0.5 ${s.bad ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {integrity.parseErrors.length > 0 && (
                <div className="px-4 pb-3 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Parsing Issues</p>
                  {integrity.parseErrors.map(e => (
                    <div key={e.statementId} className="text-xs text-amber-700 dark:text-amber-400">
                      <span className="font-semibold">{e.fileName}:</span>{' '}
                      {e.flags.join(' · ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Override Count */}
          {integrity && integrity.userOverrideCount > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500 px-1">
              <RefreshCw size={11} />
              {integrity.userOverrideCount} transaction{integrity.userOverrideCount !== 1 ? 's' : ''} have manually overridden categories.
            </div>
          )}

          {/* Drop zone */}
          {selectedAccountId && (
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <FileSpreadsheet size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-400">Drag & drop a CSV or Excel file, or use the Upload button above</p>
            </div>
          )}
        </>
      )}

      {/* ── STEP: Column Mapping + Integrity Preview ────────────────────── */}
      {step === 'mapping' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Column Mapping
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{fileName} · {rawRows.length} rows</p>
            </div>
            <button onClick={resetUpload} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X size={18} />
            </button>
          </div>

          {/* Mapping requirement notice */}
          <div className={`flex items-start gap-2 rounded-xl p-3 text-xs border ${
            canSave
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300'
          }`}>
            {canSave ? <CheckCircle2 size={13} className="mt-0.5 shrink-0" /> : <AlertCircle size={13} className="mt-0.5 shrink-0" />}
            <span>
              {!dateOk && <strong>Date column is required. </strong>}
              {!amountOk && <strong>Amount column (or Credit/Debit columns) is required. </strong>}
              {!descOk && <strong>Description column is required. </strong>}
              {canSave && 'All required columns are mapped. Review the preview and import.'}
            </span>
          </div>

          {/* Column mapping grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(
              [
                ['date',         'Date',             true],
                ['description',  'Description',      true],
                ['amount',       'Amount (single)',   false],
                ['creditAmount', 'Credit Amount',     false],
                ['debitAmount',  'Debit Amount',      false],
                ['balance',      'Balance',           false],
              ] as [keyof DetectedColumns, string, boolean][]
            ).map(([key, label, required]) => {
              const isMapped = Boolean(columns[key]);
              const isRequired = required;
              return (
                <div key={key}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                    {label}
                    {isRequired && <span className="text-red-500 ml-0.5">*</span>}
                    {isMapped && <CheckCircle2 size={10} className="inline ml-1 text-emerald-500" />}
                  </label>
                  <select
                    value={columns[key] ?? ''}
                    onChange={e => setColumns(prev => ({ ...prev, [key]: e.target.value || null }))}
                    className={`w-full text-sm border rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 ${
                      isRequired && !isMapped
                        ? 'border-amber-400 dark:border-amber-600'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <option value="">(not mapped)</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Live Data Integrity Panel */}
          {liveIntegrity && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  {liveIntegrity.score >= 80
                    ? <ShieldCheck size={14} className="text-emerald-600" />
                    : <ShieldAlert size={14} className="text-amber-600" />
                  }
                  Data Integrity Preview
                </div>
                <span className={`text-sm font-black ${liveIntegrity.score >= 80 ? 'text-emerald-600' : liveIntegrity.score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {liveIntegrity.score}% integrity
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
                {[
                  { label: 'Total Rows',          value: liveIntegrity.total,         warn: false },
                  { label: 'Missing Dates',        value: liveIntegrity.missingDate,   warn: liveIntegrity.missingDate > 0 },
                  { label: 'Invalid Amounts',      value: liveIntegrity.invalidAmount, warn: liveIntegrity.invalidAmount > 0 },
                  { label: 'Unclassified',         value: liveIntegrity.unclassified,  warn: false },
                ].map(s => (
                  <div key={s.label} className="px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
                    <p className={`text-xl font-black mt-0.5 ${s.warn ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
              {liveIntegrity.score < 80 && (
                <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-100 dark:border-amber-800 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                  <AlertCircle size={12} className="shrink-0" />
                  Integrity below 80%. Some financial calculations may be incomplete after import.
                </div>
              )}
            </div>
          )}

          {/* Preview table (first 10 rows) */}
          {previewTxns.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-100 dark:border-slate-800">
                Preview — first {previewTxns.length} of {rawRows.length} rows
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 uppercase text-[10px] tracking-wide">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewTxns.map(t => (
                      <tr key={t.id} className={`border-t border-slate-100 dark:border-slate-800 ${!t.date ? 'bg-amber-50 dark:bg-amber-900/10' : ''}`}>
                        <td className={`px-4 py-2 ${!t.date ? 'text-amber-600 font-semibold' : 'text-slate-500'}`}>
                          {t.date || '⚠ missing'}
                        </td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{t.description}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold text-slate-700 dark:text-slate-200">{fmtINR(t.amount)}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.type === 'credit' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-500">{t.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={e => setSkipDuplicates(e.target.checked)}
                className="rounded"
              />
              Skip duplicate transactions
            </label>
            <div className="flex gap-2">
              <button onClick={resetUpload} className="text-sm text-slate-500 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSaveRequest}
                disabled={!canSave}
                title={!canSave ? 'Map required columns (Date, Description, Amount) first' : undefined}
                className="text-sm bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Import {rawRows.length} Transactions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Missing Date Blocking Modal ─────────────────────────────────── */}
      {showMissingDateModal && liveIntegrity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <ShieldAlert size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">Date Integrity Issue</p>
                <p className="text-xs text-slate-500 mt-0.5">Import blocked — review required</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-200">
                {liveIntegrity.missingDate} transactions ({liveIntegrity.missingDatePct.toFixed(1)}%) are missing dates.
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-xs">
                Bank statements always include transaction dates. Missing dates likely indicate an incorrect column mapping. Financial reports cannot be computed reliably without complete date data.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What would you like to do?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowMissingDateModal(false)}
                  className="flex flex-col items-center gap-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
                >
                  <Info size={16} />
                  Fix Mapping
                  <span className="text-[10px] font-normal opacity-80">Re-check column mapping</span>
                </button>
                <button
                  onClick={doSave}
                  className="flex flex-col items-center gap-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-4 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  <Upload size={16} />
                  Import Anyway
                  <span className="text-[10px] font-normal opacity-80">Accept incomplete data</span>
                </button>
              </div>
            </div>

            <button onClick={() => setShowMissingDateModal(false)} className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              Cancel import
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Upload, FileSpreadsheet, Trash2, AlertCircle, ChevronDown,
  ChevronUp, ArrowUpDown, Settings2, Save,
  FileDown, RotateCcw, CheckCircle2, Info, Pencil, X, Check, Database
} from 'lucide-react';
import { useToast } from '@/app/components/ui/toast-system';
import { formatCurrency, downloadFile } from '@/app/lib/utils/tool-helpers';
import {
  type Transaction, type DetectedColumns, type UploadBatch,
  detectColumns, buildTransactions, calculateSummary,
  saveBatch, getBatch, deleteBatch, getAllBatches, migrateIfNeeded, autoCategory,
} from './analytics-store';

const ALL_CATEGORIES = [
  'Salary', 'Freelance', 'Returns', 'Refund',
  'Dining', 'Shopping', 'Transport', 'Entertainment',
  'Housing', 'Groceries', 'Utilities', 'Health', 'Education',
  'Insurance', 'Investment', 'Loan/EMI', 'Transfer', 'Cash',
  'Subscription', 'Gifts', 'Tax', 'Other',
];

// ═══════════════════════════════════════════════════════════════════════════════
// MANAGE TRANSACTIONS
// Upload any bank statement or Excel file. Dates are auto-detected from data.
// No month restriction — upload anything, anytime.
// ═══════════════════════════════════════════════════════════════════════════════

type Step = 'upload' | 'mapping' | 'preview';

export function ManageTransactions() {
  const { toast: showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('upload');
  const [isDragging, setIsDragging] = useState(false);

  // Current batch being viewed/edited
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

  // Raw parsed data (for new upload)
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState('');

  // Column mapping (editable)
  const [columns, setColumns] = useState<DetectedColumns>({
    date: null, amount: null, creditAmount: null,
    debitAmount: null, description: null, category: null, balance: null,
  });

  // Processed transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // All saved batches
  const [savedBatches, setSavedBatches] = useState<UploadBatch[]>([]);

  // Table state
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Transaction>>({});
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

  useEffect(() => {
    setMounted(true);
    migrateIfNeeded();
    const batches = getAllBatches();
    setSavedBatches(batches);
    // Auto-select most recent batch
    if (batches.length > 0) {
      loadBatch(batches[0]);
    }
  }, []);

  const loadBatch = (batch: UploadBatch) => {
    setActiveBatchId(batch.batchId);
    setTransactions(batch.transactions);
    setColumns(batch.detectedColumns);
    setRawHeaders(batch.rawHeaders || []);
    setRawRows([]);
    setFileName(batch.fileName);
    setStep('preview');
    setHasUnsavedEdits(false);
    setEditingId(null);
    setEditDraft({});
  };

  // ── Excel Parsing ─────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx?|csv)$/i)) {
      showToast('Please upload an Excel (.xlsx, .xls) or CSV file', 'error');
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

      // Find header row
      let headerIdx = 0;
      let maxCols = 0;
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const nonEmpty = rawData[i].filter((c: unknown) => c !== '' && c != null).length;
        if (nonEmpty > maxCols) { maxCols = nonEmpty; headerIdx = i; }
      }

      const headers = rawData[headerIdx].map((h: unknown) => String(h || `Column ${headerIdx}`).trim());
      const dataRows = rawData.slice(headerIdx + 1)
        .map(row => headers.map((_: string, i: number) => String(row[i] ?? '').trim()))
        .filter(row => row.some(cell => cell !== ''));

      if (headers.length === 0 || dataRows.length === 0) {
        showToast('No data found in the file. Please check the file format.', 'error');
        return;
      }

      setRawHeaders(headers);
      setRawRows(dataRows);
      setFileName(file.name);

      // Auto-detect columns
      const detected = detectColumns(headers, dataRows);
      setColumns(detected);

      // Build transactions with a new batch ID
      const batchId = `batch-${Date.now()}`;
      const txns = buildTransactions(headers, dataRows, detected, batchId);
      setTransactions(txns);
      setActiveBatchId(batchId);

      // Auto-detect date range
      const dates = txns.map(t => t.date).filter(Boolean).sort();
      if (dates.length > 0) {
        showToast(`Detected dates: ${dates[0]} to ${dates[dates.length - 1]}`, 'info');
      }

      setStep('mapping');
      showToast(`Parsed ${dataRows.length} rows from "${file.name}"`, 'success');
    } catch (err) {
      showToast('Failed to parse file. Please ensure it\'s a valid Excel/CSV file.', 'error');
      console.error(err);
    }
  }, [showToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  // ── Column Mapping ────────────────────────────────────────────────────────

  const updateMapping = (field: keyof DetectedColumns, value: string) => {
    const newCols = { ...columns, [field]: value || null };
    setColumns(newCols);
    if (rawRows.length > 0 && activeBatchId) {
      const txns = buildTransactions(rawHeaders, rawRows, newCols, activeBatchId);
      setTransactions(txns);
    } else {
      setHasUnsavedEdits(true);
    }
  };

  // ── Save / Delete ─────────────────────────────────────────────────────────

  const handleSave = () => {
    if (transactions.length === 0 || !activeBatchId) {
      showToast('No transactions to save', 'error');
      return;
    }
    const summary = calculateSummary(transactions);
    const dates = transactions.map(t => t.date).filter(Boolean).sort();
    const batch: UploadBatch = {
      batchId: activeBatchId,
      fileName,
      uploadedAt: new Date().toISOString(),
      transactions,
      detectedColumns: columns,
      rawHeaders: rawHeaders.length > 0 ? rawHeaders : undefined,
      dateRange: dates.length > 0 ? { from: dates[0], to: dates[dates.length - 1] } : null,
      summary,
    };
    saveBatch(batch);
    setSavedBatches(getAllBatches());
    setHasUnsavedEdits(false);
    setStep('preview');
    showToast(`Saved ${transactions.length} transactions from "${fileName}"`, 'success');
  };

  const handleDelete = () => {
    if (!activeBatchId) return;
    deleteBatch(activeBatchId);
    const remaining = getAllBatches();
    setSavedBatches(remaining);
    if (remaining.length > 0) {
      loadBatch(remaining[0]);
    } else {
      setActiveBatchId(null);
      setTransactions([]);
      setStep('upload');
    }
    showToast('Deleted upload', 'info');
  };

  const handleNewUpload = () => {
    setStep('upload');
    setActiveBatchId(null);
    setRawHeaders([]);
    setRawRows([]);
    setFileName('');
    setTransactions([]);
    setEditingId(null);
    setEditDraft({});
    setHasUnsavedEdits(false);
  };

  // ── Inline Editing ────────────────────────────────────────────────────

  const startEdit = (txn: Transaction) => {
    setEditingId(txn.id);
    setEditDraft({ date: txn.date, description: txn.description, amount: txn.amount, type: txn.type, category: txn.category });
  };

  const cancelEdit = () => { setEditingId(null); setEditDraft({}); };

  const commitEdit = () => {
    if (!editingId) return;
    const updated = transactions.map(t =>
      t.id === editingId ? { ...t, ...editDraft } as Transaction : t
    );
    setTransactions(updated);
    setEditingId(null);
    setEditDraft({});
    setHasUnsavedEdits(true);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setHasUnsavedEdits(true);
  };

  const saveEdits = () => {
    if (transactions.length === 0 || !activeBatchId) return;
    const summary = calculateSummary(transactions);
    const dates = transactions.map(t => t.date).filter(Boolean).sort();
    const existingBatch = getBatch(activeBatchId);
    const batch: UploadBatch = {
      batchId: activeBatchId,
      fileName: fileName || existingBatch?.fileName || 'edited',
      uploadedAt: existingBatch?.uploadedAt || new Date().toISOString(),
      transactions,
      detectedColumns: columns,
      rawHeaders: rawHeaders.length > 0 ? rawHeaders : existingBatch?.rawHeaders,
      dateRange: dates.length > 0 ? { from: dates[0], to: dates[dates.length - 1] } : null,
      summary,
    };
    saveBatch(batch);
    setSavedBatches(getAllBatches());
    setHasUnsavedEdits(false);
    showToast('Changes saved', 'success');
  };

  const handleExport = () => {
    if (transactions.length === 0) { showToast('No data to export', 'error'); return; }
    const csv = [
      'Date,Description,Amount,Type,Category',
      ...transactions.map(t => `${t.date},"${t.description}",${t.amount},${t.type},${t.category}`)
    ].join('\n');
    downloadFile(csv, `transactions-${activeBatchId || 'export'}.csv`, 'text/csv');
    showToast('Exported successfully', 'success');
  };

  // ── Summary ───────────────────────────────────────────────────────────────

  const summary = useMemo(() => calculateSummary(transactions), [transactions]);

  // Date range display
  const dateRange = useMemo(() => {
    const dates = transactions.map(t => t.date).filter(Boolean).sort();
    if (dates.length === 0) return null;
    return { from: dates[0], to: dates[dates.length - 1] };
  }, [transactions]);

  // Sorting
  const sortedTransactions = useMemo(() => {
    if (!sortCol) return transactions;
    return [...transactions].sort((a, b) => {
      const va = a[sortCol as keyof Transaction];
      const vb = b[sortCol as keyof Transaction];
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va;
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
  }, [transactions, sortCol, sortDir]);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const [showColumnMapping, setShowColumnMapping] = useState(false);

  useEffect(() => {
    if (step === 'mapping') setShowColumnMapping(true);
    else setShowColumnMapping(false);
  }, [step]);

  if (!mounted) return <div className="p-10 text-center text-slate-500">Loading Transaction Manager...</div>;

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-80px)] overflow-hidden p-2">

      {/* ── TOP TOOLBAR ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          {/* Upload button */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-all text-sm font-semibold ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                : step === 'upload'
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400 hover:text-blue-500'
            }`}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input id="file-upload" type="file" accept=".xlsx,.xls,.csv" onChange={handleFileInput} className="hidden" />
            <Upload size={15} />
            <span>Upload Excel / CSV</span>
          </div>

          {/* Batch selector (show saved uploads) */}
          {savedBatches.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <Database size={14} className="text-blue-500 flex-shrink-0" />
              <select
                value={activeBatchId || ''}
                onChange={e => {
                  const batch = savedBatches.find(b => b.batchId === e.target.value);
                  if (batch) loadBatch(batch);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer max-w-[260px]"
              >
                {savedBatches.map(b => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.fileName} ({b.summary.transactionCount} txns{b.dateRange ? ` • ${b.dateRange.from} → ${b.dateRange.to}` : ''})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date range badge */}
          {dateRange && step === 'preview' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                {dateRange.from} → {dateRange.to}
              </span>
            </div>
          )}

          {/* Status badge */}
          {step === 'preview' && activeBatchId && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {transactions.length} transactions saved
              </span>
            </div>
          )}
          {step === 'mapping' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertCircle size={13} className="text-amber-600" />
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Review column mapping before saving
              </span>
            </div>
          )}

          <div className="flex-1" />

          {/* Column mapping toggle */}
          {(step === 'mapping' || step === 'preview') && rawHeaders.length > 0 && (
            <button
              onClick={() => setShowColumnMapping(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                showColumnMapping
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
              }`}
            >
              <Settings2 size={13} />
              Column Mapping
              {showColumnMapping ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}

          {/* Action buttons */}
          {step === 'mapping' && (
            <button
              onClick={handleSave}
              disabled={transactions.length === 0}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Save size={13} /> Save {transactions.length} Transactions
            </button>
          )}
          {step === 'mapping' && (
            <button
              onClick={handleNewUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <RotateCcw size={13} /> Cancel
            </button>
          )}
          {step === 'preview' && (
            <>
              <button
                onClick={handleNewUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <Upload size={13} /> New Upload
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <FileDown size={13} /> Export
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-xs font-semibold transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
              >
                <Trash2 size={13} /> Delete
              </button>
            </>
          )}
        </div>

        {/* Column Mapping Panel (collapsible) */}
        {showColumnMapping && rawHeaders.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Column Mapping</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">Auto-detected</span>
              <Info size={11} className="text-slate-400" />
              <span className="text-[11px] text-slate-400">Adjust if columns were misidentified</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {[
                { key: 'date' as const, label: 'Date' },
                { key: 'description' as const, label: 'Description' },
                { key: 'amount' as const, label: 'Amount' },
                { key: 'creditAmount' as const, label: 'Credit' },
                { key: 'debitAmount' as const, label: 'Debit' },
                { key: 'category' as const, label: 'Category' },
                { key: 'balance' as const, label: 'Balance' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    {field.label}
                    {columns[field.key] && (
                      <span className="ml-1 font-normal normal-case text-slate-500">({columns[field.key]})</span>
                    )}
                  </label>
                  <select
                    value={columns[field.key] || ''}
                    onChange={e => updateMapping(field.key, e.target.value)}
                    className={`w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-2 py-1 text-[11px] font-medium outline-none transition-all ${
                      columns[field.key]
                        ? 'border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <option value="">Not mapped</option>
                    {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RAW DATA PREVIEW (mapping step) ─────────────────────────────── */}
      {step === 'mapping' && rawRows.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex-shrink-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={13} className="text-indigo-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Raw Data Preview</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold">First 5 rows of {rawRows.length}</span>
            </div>
            <span className="text-[10px] text-slate-400">Verify columns match the mapping above</span>
          </div>
          <div className="overflow-x-auto max-h-[180px]">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  {rawHeaders.map((h, i) => {
                    const isMapped = Object.values(columns).includes(h);
                    return (
                      <th key={i} className={`px-3 py-1.5 text-left font-bold whitespace-nowrap ${isMapped ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {h}
                        {isMapped && <span className="ml-1 text-[9px]">✓</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rawRows.slice(0, 5).map((row, ri) => (
                  <tr key={ri} className="border-t border-slate-100 dark:border-slate-800">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-1 text-slate-600 dark:text-slate-400 max-w-[200px] truncate whitespace-nowrap" title={cell}>
                        {cell || <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CONTENT AREA ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">

        {/* Empty State */}
        {step === 'upload' && transactions.length === 0 && (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 gap-4 border-2 border-dashed rounded-2xl transition-all ${
              isDragging ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800'
            }`}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg">
              <FileSpreadsheet size={28} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">Drop your bank statement here</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">or click to browse — CSV, Excel, any bank format</p>
            </div>
            <div className="flex gap-6 mt-2 text-xs text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Auto-detect columns</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Auto-categorize</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Multi-month support</span>
            </div>
          </div>
        )}

        {/* KPI Summary + Table */}
        {transactions.length > 0 && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Credits</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.totalCredits)}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Debits</p>
                <p className="text-lg font-black text-rose-600 dark:text-rose-400">{formatCurrency(summary.totalDebits)}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Net Flow</p>
                <p className={`text-lg font-black ${summary.netFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {summary.netFlow >= 0 ? '+' : ''}{formatCurrency(summary.netFlow)}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Transactions</p>
                <p className="text-lg font-black text-slate-800 dark:text-white">{summary.transactionCount}</p>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Transactions</h4>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-semibold">{transactions.length} total</span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold">{transactions.filter(t => t.type === 'credit').length} credits</span>
                  <span className="text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full font-semibold">{transactions.filter(t => t.type === 'debit').length} debits</span>
                </div>
                <div className="flex items-center gap-2">
                  {hasUnsavedEdits && (
                    <button
                      onClick={saveEdits}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors animate-pulse"
                    >
                      <Save size={12} /> Save Changes
                    </button>
                  )}
                  <span className="text-[10px] text-slate-400 hidden md:block">Click row to edit</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      {([
                        { key: 'date', label: columns.date || 'Date' },
                        { key: 'description', label: columns.description || 'Description' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'type', label: 'Type' },
                        { key: 'category', label: columns.category || 'Category' },
                      ] as { key: string; label: string }[]).map(col => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className="px-3 py-2 text-left font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none"
                        >
                          <span className="flex items-center gap-1">
                            {col.label}
                            {sortCol === col.key
                              ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
                              : <ArrowUpDown size={9} className="opacity-30" />
                            }
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-2 w-16"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map(txn => {
                      const isEditing = editingId === txn.id;
                      if (isEditing) {
                        return (
                          <tr key={txn.id} className="border-t border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
                            <td className="px-2 py-1.5">
                              <input type="date" value={editDraft.date || ''} onChange={e => setEditDraft(d => ({ ...d, date: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500" />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="text" value={editDraft.description || ''} onChange={e => setEditDraft(d => ({ ...d, description: e.target.value, category: autoCategory(e.target.value) }))}
                                className="w-full bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500" placeholder="Description" />
                            </td>
                            <td className="px-2 py-1.5">
                              <input type="number" value={editDraft.amount || ''} onChange={e => setEditDraft(d => ({ ...d, amount: Number(e.target.value) }))}
                                className="w-24 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 text-xs text-right outline-none focus:ring-1 focus:ring-blue-500" min={0} step={0.01} />
                            </td>
                            <td className="px-2 py-1.5">
                              <select value={editDraft.type || 'debit'} onChange={e => setEditDraft(d => ({ ...d, type: e.target.value as 'credit' | 'debit' }))}
                                className="bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 text-xs outline-none">
                                <option value="debit">debit</option>
                                <option value="credit">credit</option>
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <select value={editDraft.category || ''} onChange={e => setEditDraft(d => ({ ...d, category: e.target.value }))}
                                className="w-full bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 text-xs outline-none">
                                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </td>
                            <td className="px-2 py-1.5">
                              <div className="flex gap-1">
                                <button onClick={commitEdit} className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors" title="Save"><Check size={12} /></button>
                                <button onClick={cancelEdit} className="p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded transition-colors" title="Cancel"><X size={12} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={txn.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer" onClick={() => startEdit(txn)}>
                          <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{txn.date || '—'}</td>
                          <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300 max-w-[300px] truncate" title={txn.description}>{txn.description}</td>
                          <td className={`px-3 py-1.5 text-right font-mono font-bold whitespace-nowrap ${txn.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </td>
                          <td className="px-3 py-1.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${txn.type === 'credit' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'}`}>
                              {txn.type}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400">{txn.category}</td>
                          <td className="px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-1">
                              <button onClick={e => { e.stopPropagation(); startEdit(txn); }} className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 rounded transition-colors" title="Edit"><Pencil size={11} /></button>
                              <button onClick={e => { e.stopPropagation(); deleteTransaction(txn.id); }} className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 rounded transition-colors" title="Delete"><Trash2 size={11} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

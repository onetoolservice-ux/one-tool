'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Upload, Plus, Trash2, FileSpreadsheet, AlertCircle,
  CheckCircle2, X, ChevronDown, ChevronUp, RefreshCw,
  ShieldAlert, ShieldCheck, Download, FolderInput,
  ArrowRight, ArrowLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/app/components/ui/ToastSystem';
import { MAX_PDF_FILE_SIZE } from '@/app/lib/constants';
import { getDemoPFStore } from './pf-demo-data';
import { activateDemoJourney } from '@/app/components/ui/DemoJourneyBanner';
import {
  type PFAccount, type PFStatement, type DetectedColumns,
  loadPFStore, savePFStore, addAccount, deleteAccount, getAccounts,
  getStatements, deleteStatement, ingestStatement,
  getIntegrityReport, type IntegrityReport,
  detectColumns, buildPFTransactions, fmtINR,
  computeIntegrityScore,
} from './finance-store';

// ── Bank presets ──────────────────────────────────────────────────────────────

const BANK_PRESETS = [
  { label: 'HDFC Bank',   short: 'HD', type: 'bank'        as const, color: 'bg-blue-700'   },
  { label: 'SBI',         short: 'SB', type: 'bank'        as const, color: 'bg-blue-900'   },
  { label: 'ICICI Bank',  short: 'IC', type: 'bank'        as const, color: 'bg-orange-600' },
  { label: 'Axis Bank',   short: 'AX', type: 'bank'        as const, color: 'bg-rose-700'   },
  { label: 'Kotak Bank',  short: 'KO', type: 'bank'        as const, color: 'bg-red-600'    },
  { label: 'Yes Bank',    short: 'YB', type: 'bank'        as const, color: 'bg-purple-700' },
  { label: 'IndusInd',    short: 'II', type: 'bank'        as const, color: 'bg-indigo-700' },
  { label: 'IDFC First',  short: 'IF', type: 'bank'        as const, color: 'bg-teal-700'   },
  { label: 'Credit Card', short: 'CC', type: 'credit_card' as const, color: 'bg-slate-600'  },
  { label: 'Other',       short: '··', type: 'bank'        as const, color: 'bg-slate-400'  },
];

// ── Quick tool links post-import ──────────────────────────────────────────────

const NEXT_TOOLS = [
  { emoji: '💸', label: 'Cash Flow',    href: '/my-finance/pf-cash-flow'     },
  { emoji: '📊', label: 'Expenses',     href: '/my-finance/pf-expenses'      },
  { emoji: '🧠', label: 'Behavior',     href: '/my-finance/pf-behavior'      },
  { emoji: '❤️', label: 'Health Score', href: '/my-finance/pf-health-score'  },
  { emoji: '🗓️', label: 'Heatmap',      href: '/my-finance/pf-heatmap'       },
  { emoji: '🏪', label: 'Merchants',    href: '/my-finance/pf-top-merchants' },
];

// ── Wizard step type ──────────────────────────────────────────────────────────

type WizardStep = 'banks' | 'upload' | 'mapping' | 'done';

// ── Progress bar ──────────────────────────────────────────────────────────────

const STEPS = ['Choose Bank', 'Upload File', 'Verify', 'Done'];

function ProgressBar({ current }: { current: WizardStep }) {
  const idx = { banks: 0, upload: 1, mapping: 2, done: 3 }[current];
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
              i < idx  ? 'bg-emerald-500 text-white' :
              i === idx ? 'bg-[var(--ot-accent,#6366f1)] text-white ring-4 ring-[var(--ot-accent,#6366f1)]/20' :
                          'bg-slate-100 dark:bg-white/[0.06] text-slate-400'
            }`}>
              {i < idx ? <CheckCircle2 size={13} /> : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
              i === idx ? 'text-[var(--ot-accent,#6366f1)]' : 'text-slate-400 dark:text-slate-500'
            }`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-[2px] flex-1 mx-1.5 mb-4 rounded-full transition-all ${
              i < idx ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/[0.06]'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function StatementManager() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<WizardStep>('banks');
  const [isDragging, setIsDragging] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [importedBankName, setImportedBankName] = useState('');

  // Bank / account selection
  const [selectedPreset, setSelectedPreset] = useState<typeof BANK_PRESETS[0] | null>(null);
  const [customBankName, setCustomBankName] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [showBankPicker, setShowBankPicker] = useState(false);

  // Upload state
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'csv' | 'excel'>('csv');
  const [columns, setColumns] = useState<DetectedColumns>({
    date: null, amount: null, creditAmount: null,
    debitAmount: null, description: null, category: null, balance: null,
  });
  const [showAdvancedMapping, setShowAdvancedMapping] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [showMissingDateModal, setShowMissingDateModal] = useState(false);

  // Data
  const [accounts, setAccounts] = useState<PFAccount[]>([]);
  const [statements, setStatements] = useState<PFStatement[]>([]);
  const [integrity, setIntegrity] = useState<IntegrityReport | null>(null);
  const [expandedAccId, setExpandedAccId] = useState<string | null>(null);

  const reload = () => {
    setAccounts(getAccounts());
    setStatements(getStatements());
    setIntegrity(getIntegrityReport());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────

  const dateOk   = Boolean(columns.date);
  const amountOk = Boolean(columns.amount || columns.creditAmount);
  const descOk   = Boolean(columns.description);
  const canSave  = dateOk && amountOk && descOk && rawRows.length > 0;

  const liveIntegrity = useMemo(() => {
    if (rawRows.length === 0 || !selectedAccountId) return null;
    const sample = buildPFTransactions(rawHeaders, rawRows, columns, selectedAccountId, 'preview');
    const total = sample.length;
    const missingDate   = sample.filter(t => !t.date).length;
    const invalidAmount = rawRows.filter(row => {
      const amtCols = [columns.amount, columns.creditAmount, columns.debitAmount].filter(Boolean);
      return amtCols.length > 0 && amtCols.every(col => {
        const idx = rawHeaders.indexOf(col!);
        const val = row[idx] ?? '';
        const n = parseFloat(val.replace(/[₹,\s]/g, ''));
        return isNaN(n) || n === 0;
      });
    }).length;
    const unclassified = sample.filter(t => t.category === 'Miscellaneous' || t.category === 'Other').length;
    const score = computeIntegrityScore({ total, missingDate, invalidAmount, unclassified, duplicates: 0 });
    return { total, missingDate, missingDatePct: total > 0 ? (missingDate / total) * 100 : 0, invalidAmount, unclassified, score };
  }, [rawHeaders, rawRows, columns, selectedAccountId]);

  const previewTxns = useMemo(() =>
    rawRows.length > 0
      ? buildPFTransactions(rawHeaders, rawRows.slice(0, 8), columns, selectedAccountId || 'preview', 'preview')
      : [],
    [rawHeaders, rawRows, columns, selectedAccountId]
  );

  // ── Sample values helper ───────────────────────────────────────────────────

  const sampleFor = (col: string | null): string => {
    if (!col) return '';
    const idx = rawHeaders.indexOf(col);
    if (idx < 0) return '';
    const vals = rawRows.slice(0, 5).map(r => (r[idx] ?? '').trim()).filter(Boolean);
    return vals[0] ?? '';
  };

  // ── File parsing ──────────────────────────────────────────────────────────

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx?|csv)$/i)) {
      toast('Please upload an Excel (.xlsx, .xls) or CSV file', 'error'); return;
    }
    if (file.size > MAX_PDF_FILE_SIZE) {
      toast('File exceeds 50 MB. Export a smaller date range from your bank.', 'error'); return;
    }
    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      let headerIdx = 0, maxCols = 0;
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const nonEmpty = rawData[i].filter((c: unknown) => c !== '' && c != null).length;
        if (nonEmpty > maxCols) { maxCols = nonEmpty; headerIdx = i; }
      }

      const headers = rawData[headerIdx].map((h: unknown) => String(h || '').trim() || `Column ${headerIdx}`);
      const dataRows = rawData
        .slice(headerIdx + 1)
        .map(row => headers.map((_: string, i: number) => {
          const cell = row[i];
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
        toast('No data found. Check the file format.', 'error'); return;
      }

      setFileType(file.name.match(/\.xlsx?$/i) ? 'excel' : 'csv');
      setRawHeaders(headers);
      setRawRows(dataRows);
      setFileName(file.name);
      setColumns(detectColumns(headers, dataRows));
      setWizardStep('mapping');
    } catch (err) {
      toast(`Could not read file: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    }
  }, [toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSaveRequest = () => {
    if (!canSave) return;
    if (liveIntegrity && liveIntegrity.missingDatePct > 5) {
      setShowMissingDateModal(true); return;
    }
    doSave();
  };

  const doSave = () => {
    if (!selectedAccountId || rawRows.length === 0) return;
    setShowMissingDateModal(false);
    const result = ingestStatement({
      accountId: selectedAccountId, fileName, fileType,
      headers: rawHeaders, rows: rawRows,
      detectedColumns: columns, skipDuplicates,
    });
    const bankName = accounts.find(a => a.id === selectedAccountId)?.name ?? 'your bank';
    setImportedCount(result.addedCount);
    setImportedBankName(bankName);
    setWizardStep('done');
    reload();
  };

  // ── Bank selection → create account ───────────────────────────────────────

  const handleSelectBank = (preset: typeof BANK_PRESETS[0]) => {
    setSelectedPreset(preset);
    if (preset.label === 'Other') setCustomBankName('');
  };

  const handleConfirmBank = () => {
    const name = selectedPreset?.label === 'Other'
      ? customBankName.trim()
      : selectedPreset?.label ?? '';
    if (!name) { toast('Enter your bank name', 'error'); return; }
    const acc = addAccount({ name, type: selectedPreset?.type ?? 'bank', currency: 'INR' });
    setSelectedAccountId(acc.id);
    reload();
    setShowBankPicker(false);
    setWizardStep('upload');
  };

  // ── Upload to existing account ────────────────────────────────────────────

  const uploadToExisting = (accId: string) => {
    setSelectedAccountId(accId);
    setWizardStep('upload');
  };

  // ── Backup / Restore / Demo ───────────────────────────────────────────────

  const handleExport = () => {
    const data = loadPFStore();
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `onetool-pf-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
    toast('Backup downloaded', 'success');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const importData = parsed.version === 1 ? parsed.data : parsed;
        if (!importData.transactions || !importData.accounts) { toast('Invalid backup file', 'error'); return; }
        savePFStore(importData);
        reload();
        toast('Backup restored successfully', 'success');
      } catch { toast('Could not read backup file', 'error'); }
    };
    reader.readAsText(file);
  };

  const handleLoadDemo = () => {
    const existing = loadPFStore();
    if (existing.transactions.length > 0 && !confirm('Replace your current data with demo data?')) return;
    savePFStore(getDemoPFStore());
    reload();
    activateDemoJourney();
    toast('3 months of demo data loaded — explore all 27 tools!', 'success');
    setWizardStep('banks'); // refresh to show accounts
  };

  const resetWizard = () => {
    setWizardStep('banks');
    setSelectedPreset(null);
    setCustomBankName('');
    setSelectedAccountId('');
    setShowBankPicker(false);
    setRawHeaders([]); setRawRows([]); setFileName('');
  };

  if (!mounted) return null;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0F111A]">
      <div className="max-w-xl mx-auto px-4 pt-8 pb-20">

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">
            Statement Manager
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Import your bank statements · All data stays on your device
          </p>
        </div>

        {/* Progress bar — only during wizard */}
        {wizardStep !== 'banks' && <ProgressBar current={wizardStep} />}

        {/* ── STEP: Banks / Home ─────────────────────────────────────────────── */}
        {wizardStep === 'banks' && (
          <div className="space-y-4">

            {/* Existing accounts */}
            {accounts.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                  Your Banks
                </p>
                {accounts.map(acc => {
                  const accStmts = statements.filter(s => s.accountId === acc.id);
                  const isExpanded = expandedAccId === acc.id;
                  const preset = BANK_PRESETS.find(b => b.label === acc.name);
                  const color = preset?.color ?? 'bg-indigo-600';
                  return (
                    <div key={acc.id} className="bg-white dark:bg-[#151827] rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 ${color}`}>
                          {acc.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{acc.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {acc.type.replace('_', ' ')} · {accStmts.length} statement{accStmts.length !== 1 ? 's' : ''}
                            {accStmts.length > 0 && (() => {
                              const totalTxns = accStmts.reduce((s, st) => s + st.transactionCount, 0);
                              return ` · ${totalTxns.toLocaleString('en-IN')} transactions`;
                            })()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => uploadToExisting(acc.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--ot-accent,#6366f1)] hover:opacity-90 text-white text-[12px] font-semibold transition-opacity"
                          >
                            <Upload size={12} /> Upload
                          </button>
                          <button
                            onClick={() => setExpandedAccId(isExpanded ? null : acc.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <button
                            onClick={() => { if (confirm(`Delete "${acc.name}" and all its data?`)) { deleteAccount(acc.id); reload(); }}}
                            className="p-1.5 rounded-xl text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Statements list */}
                      {isExpanded && accStmts.length > 0 && (
                        <div className="border-t border-slate-100 dark:border-white/[0.04] divide-y divide-slate-100 dark:divide-white/[0.04]">
                          {accStmts.map(stmt => (
                            <div key={stmt.id} className="flex items-center gap-3 px-4 py-2.5">
                              <FileSpreadsheet size={13} className="text-slate-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate">{stmt.fileName}</p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                  {stmt.transactionCount} txns
                                  {stmt.periodFrom && stmt.periodTo ? ` · ${stmt.periodFrom} → ${stmt.periodTo}` : ''}
                                </p>
                              </div>
                              <span className={`text-[11px] font-bold ${stmt.integrityScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                {stmt.integrityScore}%
                              </span>
                              <button
                                onClick={() => { if (confirm('Delete this statement?')) { deleteStatement(stmt.id); reload(); }}}
                                className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {isExpanded && accStmts.length === 0 && (
                        <div className="border-t border-slate-100 dark:border-white/[0.04] px-4 py-3">
                          <p className="text-[12px] text-slate-400 dark:text-slate-500">No statements uploaded yet. Click Upload.</p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Integrity summary */}
                {integrity && integrity.totalTransactions > 0 && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-[#151827] border border-slate-200 dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      {integrity.overallIntegrityScore >= 80
                        ? <ShieldCheck size={14} className="text-emerald-500" />
                        : <ShieldAlert size={14} className="text-amber-500" />}
                      <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                        {integrity.totalTransactions.toLocaleString('en-IN')} total transactions
                      </span>
                    </div>
                    <span className={`text-[12px] font-bold ${integrity.overallIntegrityScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {integrity.overallIntegrityScore}% clean
                    </span>
                  </div>
                )}

                {/* Add another */}
                {!showBankPicker && (
                  <button
                    onClick={() => { setShowBankPicker(true); setSelectedPreset(null); setCustomBankName(''); }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/[0.07] text-[13px] font-semibold text-slate-400 dark:text-slate-500 hover:text-[var(--ot-accent,#6366f1)] hover:border-[var(--ot-accent,#6366f1)]/40 transition-all"
                  >
                    <Plus size={14} /> Add Another Bank
                  </button>
                )}
              </div>
            )}

            {/* First time OR adding new bank */}
            {(accounts.length === 0 || showBankPicker) && (
              <div>
                {accounts.length > 0 && showBankPicker && (
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Add a bank
                    </p>
                    <button
                      onClick={() => { setShowBankPicker(false); setSelectedPreset(null); setCustomBankName(''); }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <X size={12} /> Cancel
                    </button>
                  </div>
                )}
                {accounts.length === 0 && (
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--ot-accent,#6366f1)]/10 flex items-center justify-center mx-auto mb-4">
                      <FileSpreadsheet size={26} className="text-[var(--ot-accent,#6366f1)]" />
                    </div>
                    <h2 className="text-[18px] font-black text-slate-900 dark:text-white mb-2">
                      Which bank are you importing from?
                    </h2>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                      Pick your bank and upload a CSV from net banking. Takes 2 minutes.
                    </p>
                  </div>
                )}

                {/* Bank picker grid */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {BANK_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => handleSelectBank(preset)}
                      className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border-2 transition-all ${
                        selectedPreset?.label === preset.label
                          ? 'border-[var(--ot-accent,#6366f1)] bg-[var(--ot-accent,#6366f1)]/5'
                          : 'border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#151827] hover:border-[var(--ot-accent,#6366f1)]/40'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-[11px] font-black ${preset.color}`}>
                        {preset.short}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 text-center leading-tight">
                        {preset.label.replace(' Bank', '')}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom name for "Other" */}
                {selectedPreset?.label === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter your bank name"
                    value={customBankName}
                    onChange={e => setCustomBankName(e.target.value)}
                    autoFocus
                    className="w-full h-10 px-4 text-[13px] rounded-xl bg-white dark:bg-[#151827] border border-slate-200 dark:border-white/[0.06] focus:outline-none focus:border-[var(--ot-accent,#6366f1)]/60 text-slate-800 dark:text-white placeholder:text-slate-400 mb-4 transition-colors"
                  />
                )}

                {/* Continue button */}
                {selectedPreset && (
                  <button
                    onClick={handleConfirmBank}
                    disabled={selectedPreset.label === 'Other' && !customBankName.trim()}
                    className="w-full h-11 rounded-xl bg-[var(--ot-accent,#6366f1)] hover:opacity-90 disabled:opacity-40 text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-opacity shadow-sm mb-4"
                  >
                    Continue with {selectedPreset.label === 'Other' ? (customBankName || 'your bank') : selectedPreset.label}
                    <ArrowRight size={15} />
                  </button>
                )}
              </div>
            )}

            {/* Demo + Backup options */}
            <div className="pt-2 border-t border-slate-200 dark:border-white/[0.06] flex flex-wrap gap-2">
              <button
                onClick={handleLoadDemo}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#151827] border border-slate-200 dark:border-white/[0.06] text-[12px] font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
              >
                <Sparkles size={13} /> Try with Demo Data
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#151827] border border-slate-200 dark:border-white/[0.06] text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                <Download size={13} /> Backup
              </button>
              <label className="cursor-pointer">
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#151827] border border-slate-200 dark:border-white/[0.06] text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors">
                  <FolderInput size={13} /> Restore
                </span>
                <input type="file" accept=".json" className="hidden" onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])} />
              </label>
            </div>
          </div>
        )}

        {/* ── STEP: Upload ────────────────────────────────────────────────────── */}
        {wizardStep === 'upload' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[18px] font-black text-slate-900 dark:text-white">
                Upload your bank statement
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                Export a CSV or Excel file from your bank's net banking portal and upload it here.
              </p>
            </div>

            {/* PDF not supported notice */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/50">
              <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-bold text-amber-700 dark:text-amber-300">PDF statements are not supported</p>
                <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 leading-relaxed">
                  Export your statement as <strong>CSV or Excel</strong> from your bank's net banking portal — not the PDF that arrives by email.
                </p>
              </div>
            </div>

            {/* How to export guide — bank-specific */}
            <div className="bg-white dark:bg-[#151827] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                How to export from your bank
              </p>
              <div className="space-y-2 mb-4">
                {[
                  { step: '1', text: 'Login to your bank\'s net banking portal (not mobile app — CSV download is usually only on desktop)' },
                  { step: '2', text: 'Go to Account Statement or Transaction History' },
                  { step: '3', text: 'Select your date range, then look for "Download as CSV" or "Export to Excel" — avoid the PDF option' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--ot-accent,#6366f1)]/10 flex items-center justify-center text-[11px] font-bold text-[var(--ot-accent,#6366f1)] flex-shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300">{s.text}</p>
                  </div>
                ))}
              </div>
              {/* Bank-specific quick paths */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Bank-specific path</p>
              <div className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                {[
                  { bank: 'HDFC',    path: 'NetBanking → Accounts → Account Statement → Download (XLS/CSV)' },
                  { bank: 'ICICI',   path: 'iMobile / NetBanking → Accounts → Account Statement → Download CSV' },
                  { bank: 'SBI',     path: 'OnlineSBI → Account Statement → Download (XLS)' },
                  { bank: 'Axis',    path: 'Internet Banking → Account → Statements → Download Excel' },
                  { bank: 'Kotak',   path: 'Net Banking → Account → View Statement → Download (CSV)' },
                ].map(b => (
                  <div key={b.bank} className="flex items-start gap-2">
                    <span className="font-bold text-slate-600 dark:text-slate-300 w-10 shrink-0">{b.bank}</span>
                    <span className="leading-relaxed">{b.path}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Drop zone */}
            <label
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center gap-4 w-full py-14 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? 'border-[var(--ot-accent,#6366f1)] bg-[var(--ot-accent,#6366f1)]/5'
                  : 'border-slate-200 dark:border-white/[0.07] bg-white dark:bg-[#151827] hover:border-[var(--ot-accent,#6366f1)]/50 hover:bg-[var(--ot-accent,#6366f1)]/[0.02]'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--ot-accent,#6366f1)]/10 flex items-center justify-center">
                <Upload size={24} className="text-[var(--ot-accent,#6366f1)]" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
                  Drop your file here
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
                  or click to browse · CSV and Excel supported
                </p>
              </div>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </label>

            <button
              onClick={resetWizard}
              className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        )}

        {/* ── STEP: Column Mapping ─────────────────────────────────────────────── */}
        {wizardStep === 'mapping' && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-black text-slate-900 dark:text-white">
                  Verify the columns
                </h2>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  We auto-detected your columns. Review and correct if anything looks wrong.
                </p>
              </div>
              <button onClick={() => { setWizardStep('upload'); setRawHeaders([]); setRawRows([]); }} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors flex-shrink-0">
                <X size={16} />
              </button>
            </div>

            {/* File info */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06]">
              <FileSpreadsheet size={14} className="text-slate-400" />
              <p className="text-[12px] text-slate-600 dark:text-slate-300 font-medium truncate">{fileName}</p>
              <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">{rawRows.length} rows</span>
            </div>

            {/* Required columns */}
            <div className="bg-white dark:bg-[#151827] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-4 space-y-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Required columns
              </p>

              {([
                { key: 'date'        as keyof DetectedColumns, label: 'Date',        hint: 'The transaction date column' },
                { key: 'description' as keyof DetectedColumns, label: 'Description', hint: 'What the transaction was for' },
                { key: 'amount'      as keyof DetectedColumns, label: 'Amount',       hint: 'Transaction amount (combined credit & debit)' },
              ] as { key: keyof DetectedColumns; label: string; hint: string }[]).map(f => {
                const isMapped = Boolean(columns[f.key]);
                const sample = sampleFor(columns[f.key]);
                const isRequired = true;
                return (
                  <div key={f.key} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                        {f.label}
                      </label>
                      {isMapped
                        ? <CheckCircle2 size={12} className="text-emerald-500" />
                        : <span className="text-[10px] text-rose-500 font-semibold">Required</span>}
                    </div>
                    <select
                      value={columns[f.key] ?? ''}
                      onChange={e => setColumns(prev => ({ ...prev, [f.key]: e.target.value || null }))}
                      className={`w-full h-9 px-3 text-[13px] rounded-xl transition-colors focus:outline-none ${
                        isRequired && !isMapped
                          ? 'border border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-500/[0.06]'
                          : 'border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03]'
                      } text-slate-800 dark:text-white focus:border-[var(--ot-accent,#6366f1)]/60`}
                    >
                      <option value="">(not mapped)</option>
                      {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    {sample && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">
                        Sample: <span className="font-medium text-slate-600 dark:text-slate-300">{sample}</span>
                      </p>
                    )}
                    {!isMapped && (
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">{f.hint}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Advanced / optional */}
            <button
              onClick={() => setShowAdvancedMapping(v => !v)}
              className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showAdvancedMapping ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showAdvancedMapping ? 'Hide' : 'Show'} optional columns (Credit, Debit, Balance)
            </button>

            {showAdvancedMapping && (
              <div className="bg-white dark:bg-[#151827] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-4 space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Optional columns</p>
                {([
                  { key: 'creditAmount' as keyof DetectedColumns, label: 'Credit Amount', hint: 'Use if your bank has separate credit/debit columns' },
                  { key: 'debitAmount'  as keyof DetectedColumns, label: 'Debit Amount',  hint: 'Use if your bank has separate credit/debit columns' },
                  { key: 'balance'      as keyof DetectedColumns, label: 'Balance',        hint: 'Running account balance after each transaction' },
                ] as { key: keyof DetectedColumns; label: string; hint: string }[]).map(f => {
                  const sample = sampleFor(columns[f.key]);
                  return (
                    <div key={f.key} className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{f.label}</label>
                      <select
                        value={columns[f.key] ?? ''}
                        onChange={e => setColumns(prev => ({ ...prev, [f.key]: e.target.value || null }))}
                        className="w-full h-9 px-3 text-[13px] rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-white/[0.03] text-slate-800 dark:text-white focus:outline-none focus:border-[var(--ot-accent,#6366f1)]/60 transition-colors"
                      >
                        <option value="">(not mapped)</option>
                        {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      {sample && <p className="text-[11px] text-slate-400">Sample: <span className="font-medium text-slate-600 dark:text-slate-300">{sample}</span></p>}
                      {!columns[f.key] && <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">{f.hint}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Preview table */}
            {previewTxns.length > 0 && (
              <div className="bg-white dark:bg-[#151827] rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4 pt-3 pb-2">
                  Preview — first {previewTxns.length} rows
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/[0.03]">
                        {['Date', 'Description', 'Amount', 'Type'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewTxns.map(t => (
                        <tr key={t.id} className={`border-t border-slate-100 dark:border-white/[0.04] ${!t.date ? 'bg-amber-50 dark:bg-amber-500/[0.05]' : ''}`}>
                          <td className={`px-3 py-2 ${!t.date ? 'text-amber-600 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                            {t.date || '⚠ missing'}
                          </td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-200 max-w-[180px] truncate">{t.description}</td>
                          <td className="px-3 py-2 font-semibold text-slate-800 dark:text-slate-100">{fmtINR(t.amount)}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.type === 'credit'
                                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400'
                            }`}>
                              {t.type === 'credit' ? '↓ in' : '↑ out'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Validation status */}
            {!canSave && (
              <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/[0.07] border border-amber-200 dark:border-amber-500/20">
                <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-700 dark:text-amber-300">
                  {!dateOk && 'Select the Date column. '}
                  {!amountOk && 'Select an Amount column. '}
                  {!descOk && 'Select a Description column. '}
                </p>
              </div>
            )}

            {/* Options + Import button */}
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={e => setSkipDuplicates(e.target.checked)}
                  className="w-4 h-4 rounded accent-[var(--ot-accent,#6366f1)]"
                />
                <span className="text-[13px] text-slate-600 dark:text-slate-300">
                  Skip duplicate transactions
                </span>
              </label>

              <button
                onClick={handleSaveRequest}
                disabled={!canSave}
                className="w-full h-12 rounded-xl bg-[var(--ot-accent,#6366f1)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-opacity shadow-sm"
              >
                Import {rawRows.length.toLocaleString('en-IN')} Transactions <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Done ──────────────────────────────────────────────────────── */}
        {wizardStep === 'done' && (
          <div className="text-center space-y-6">
            <div>
              <div className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h2 className="text-[24px] font-black text-slate-900 dark:text-white mb-2">
                {importedCount.toLocaleString('en-IN')} transactions imported
              </h2>
              <p className="text-[13px] text-slate-500 dark:text-slate-400">
                From {importedBankName} · All 27 tools are now unlocked
              </p>
            </div>

            {/* Next tools */}
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                Explore your finances
              </p>
              <div className="grid grid-cols-3 gap-2">
                {NEXT_TOOLS.map(t => (
                  <Link key={t.href} href={t.href}
                    className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl bg-white dark:bg-[#151827] border border-slate-200 dark:border-white/[0.06] hover:border-[var(--ot-accent,#6366f1)]/40 hover:bg-[var(--ot-accent,#6366f1)]/[0.02] transition-all group"
                  >
                    <span className="text-[22px] leading-none">{t.emoji}</span>
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 group-hover:text-[var(--ot-accent,#6366f1)] text-center">{t.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={resetWizard}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-white/[0.07] text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                Import Another
              </button>
              <Link
                href="/my-finance/pf-financial-snapshot"
                className="flex-1 h-11 rounded-xl bg-[var(--ot-accent,#6366f1)] hover:opacity-90 text-white text-[13px] font-bold flex items-center justify-center gap-1.5 transition-opacity"
              >
                View Summary <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* ── Missing date blocking modal ─────────────────────────────────────── */}
        {showMissingDateModal && liveIntegrity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white dark:bg-[#151827] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[0.07] max-w-sm w-full p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white">Check your Date column</p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {liveIntegrity.missingDate} rows ({liveIntegrity.missingDatePct.toFixed(1)}%) have no date
                  </p>
                </div>
              </div>
              <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Bank statements always have dates for every transaction. Missing dates usually mean the wrong column is selected — go back and fix the mapping.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowMissingDateModal(false)}
                  className="h-10 rounded-xl bg-[var(--ot-accent,#6366f1)] text-white text-[13px] font-bold hover:opacity-90 transition-opacity"
                >
                  Fix Mapping
                </button>
                <button
                  onClick={doSave}
                  className="h-10 rounded-xl border border-slate-200 dark:border-white/[0.07] text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors"
                >
                  Import Anyway
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

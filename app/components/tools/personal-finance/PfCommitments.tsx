'use client';

import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Plus, Check, X, Info, ChevronDown, RotateCcw } from 'lucide-react';
import { PFButton, PFBadge, PFFilterBarHeader, PFSmartTableBar } from './pf-ui';
import { useToast } from '@/app/components/ui/toast-system';
import {
  getCommitments, confirmCommitment, dismissCommitment,
  addManualCommitment, rerunRecurringDetection,
  updateCommitmentFrequency, convertCommitmentToOneTime, updateCommitmentCategory,
  getAllCategories, getStatementCoverageRange, getLastUpdatedTimestamp,
  type PFCommitment,
  fmtINR,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// COMMITMENTS REGISTER — Production-Ready
//
// Auto-detected recurring obligations + user controls.
// Status: Auto-detected → Confirmed / Dismissed / Converted to one-time.
// User controls: Change frequency, Change category, Convert to one-time.
// No advisory messaging. Purely ledger-based.
// ═══════════════════════════════════════════════════════════════════════════════

type FilterTab = 'all' | 'confirmed' | 'dismissed';

const FREQ_LABELS: Record<PFCommitment['frequency'], string> = {
  weekly:       'Weekly',
  fortnightly:  'Fortnightly',
  monthly:      'Monthly',
  quarterly:    'Quarterly',
  annual:       'Annual',
  'one-time':   'One-time',
};

const FREQ_OPTIONS: { value: PFCommitment['frequency']; label: string }[] = [
  { value: 'weekly',      label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly',     label: 'Monthly' },
  { value: 'quarterly',   label: 'Quarterly' },
  { value: 'annual',      label: 'Annual' },
  { value: 'one-time',    label: 'One-time (no recurrence)' },
];


export function CommitmentsRegister() {
  const { toast } = useToast();
  const [mounted, setMounted]         = useState(false);
  const [commitments, setCommitments] = useState<PFCommitment[]>([]);
  const [categories, setCategories]   = useState<string[]>([]);
  const [filter, setFilter]           = useState<FilterTab>('all');
  const [showAddManual, setShowAddManual] = useState(false);

  // Inline editing state
  const [editFreqId, setEditFreqId]   = useState<string | null>(null);
  const [editFreqVal, setEditFreqVal] = useState<PFCommitment['frequency']>('monthly');
  const [editCatId, setEditCatId]     = useState<string | null>(null);
  const [editCatVal, setEditCatVal]   = useState('');

  // Manual form state
  const [manualMerchant, setManualMerchant] = useState('');
  const [manualFreq, setManualFreq]         = useState<PFCommitment['frequency']>('monthly');
  const [manualAmount, setManualAmount]     = useState('');
  const [manualCategory, setManualCategory] = useState('Miscellaneous');

  const reload = () => {
    setCommitments(getCommitments(true));
    setCategories(getAllCategories());
  };

  useEffect(() => {
    setMounted(true);
    reload();
    const h = () => reload();
    window.addEventListener('pf-store-updated', h);
    return () => window.removeEventListener('pf-store-updated', h);
  }, []);

  const displayed = useMemo(() => {
    if (filter === 'confirmed') return commitments.filter(c => c.userConfirmed && !c.userDismissed);
    if (filter === 'dismissed') return commitments.filter(c => c.userDismissed);
    return commitments.filter(c => !c.userDismissed);
  }, [commitments, filter]);

  const activeCommitments  = commitments.filter(c => !c.userDismissed && !c.convertedToOneTime);
  const totalMonthly       = activeCommitments.reduce((a, c) => a + c.monthlyEquivalent, 0);
  const totalAnnual        = activeCommitments.reduce((a, c) => a + c.annualizedCost, 0);
  const confirmedCount     = activeCommitments.filter(c => c.userConfirmed).length;
  const coverage    = getStatementCoverageRange();
  const lastUpdated = getLastUpdatedTimestamp();

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleConfirm = (id: string) => { confirmCommitment(id); toast('Commitment confirmed', 'success'); };
  const handleDismiss = (id: string) => { dismissCommitment(id); toast('Commitment dismissed', 'info'); };
  const handleRerun   = () => { rerunRecurringDetection(); toast('Recurring detection re-run', 'success'); };

  const handleConvertToOneTime = (id: string) => {
    if (!confirm('Convert this to a one-time entry? It will no longer count toward monthly totals.')) return;
    convertCommitmentToOneTime(id);
    toast('Converted to one-time', 'success');
  };

  const commitFreqEdit = (id: string) => {
    updateCommitmentFrequency(id, editFreqVal);
    setEditFreqId(null);
    toast('Frequency updated', 'success');
  };

  const commitCatEdit = (id: string) => {
    if (editCatVal) updateCommitmentCategory(id, editCatVal);
    setEditCatId(null);
    toast('Category updated', 'success');
  };

  const handleAddManual = () => {
    if (!manualMerchant.trim() || !manualAmount) {
      toast('Merchant name and monthly amount are required', 'error');
      return;
    }
    addManualCommitment({
      merchant: manualMerchant.trim(),
      frequency: manualFreq,
      monthlyEquivalent: parseFloat(manualAmount),
      category: manualCategory,
    });
    setManualMerchant(''); setManualAmount('');
    setManualFreq('monthly'); setManualCategory('Miscellaneous');
    setShowAddManual(false);
    toast('Manual commitment added', 'success');
  };

  if (!mounted) return null;
  const hasData = commitments.length > 0;

  return (
    <div className="space-y-0">
      {/* ── SAP Filter Bar ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-hidden">
        <PFFilterBarHeader
          actions={
            <button
              onClick={() => setShowAddManual(v => !v)}
              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              <Plus size={11} /> Add Manual
            </button>
          }
        />
        <div className="px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Status tabs */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</label>
            <div className="flex gap-1 border border-slate-300 dark:border-slate-600 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
              {(['all', 'confirmed', 'dismissed'] as FilterTab[]).map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors capitalize ${
                    filter === t ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}>
                  {t === 'all'       ? `All (${activeCommitments.length})`
                   : t === 'confirmed' ? `Confirmed (${confirmedCount})`
                   : `Dismissed (${commitments.filter(c => c.userDismissed).length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Manual add form (inline) */}
        {showAddManual && (
          <div className="px-4 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Add Manual Commitment</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Merchant</label>
                <input value={manualMerchant} onChange={e => setManualMerchant(e.target.value)}
                  placeholder="Merchant / description"
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Frequency</label>
                <select value={manualFreq} onChange={e => setManualFreq(e.target.value as PFCommitment['frequency'])}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  {FREQ_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Monthly Amt (₹)</label>
                <input value={manualAmount} onChange={e => setManualAmount(e.target.value)}
                  placeholder="Monthly equivalent"
                  type="number" min="0"
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Category</label>
                <select value={manualCategory} onChange={e => setManualCategory(e.target.value)}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddManual} className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Add Commitment
              </button>
              <button onClick={() => setShowAddManual(false)} className="text-sm text-slate-500 px-4 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Smart Table Card ────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 overflow-hidden">
        {/* Smart Table Header */}
        <PFSmartTableBar
          title="Commitments Register"
          badges={
            <>
              <PFBadge color="blue">{activeCommitments.length} Active</PFBadge>
              <PFBadge color="orange">{fmtINR(totalMonthly)}/mo</PFBadge>
              <PFBadge color="slate">{fmtINR(totalAnnual)}/yr</PFBadge>
              {confirmedCount > 0 && (
                <PFBadge color="green">{confirmedCount} Confirmed</PFBadge>
              )}
            </>
          }
          actions={
            <PFButton icon={<RefreshCw size={12} />} onClick={handleRerun}>
              Re-run Detection
            </PFButton>
          }
        />

        {!hasData ? (
          <div className="text-center py-20 text-slate-400">
            <RefreshCw size={40} className="mx-auto mb-3 opacity-25" />
            <p className="text-sm font-medium text-slate-500 mb-1">No recurring transactions detected.</p>
            <p className="text-xs text-slate-400">
              Detection requires ≥3 transactions from the same merchant with a consistent interval (±5 days).
            </p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No commitments match the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase tracking-wide border-b border-slate-100 dark:border-slate-800">
                  <th className="px-4 py-3 text-left font-semibold">Merchant</th>
                  <th className="px-4 py-3 text-left font-semibold">Frequency</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Monthly Equiv.</th>
                  <th className="px-4 py-3 text-right font-semibold">Annual Cost</th>
                  <th className="px-4 py-3 text-left font-semibold">First / Last</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(c => (
                  <tr
                    key={c.id}
                    className={`border-t border-slate-100 dark:border-slate-800 transition-colors ${
                      c.userDismissed || c.convertedToOneTime ? 'opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate max-w-[160px]" title={c.merchant}>
                        {c.merchant}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {c.transactionIds.length} occurrence{c.transactionIds.length !== 1 ? 's' : ''}
                        {c.intervalDays > 0 && ` · ~${c.intervalDays}d`}
                      </p>
                      {c.manuallyAdded && <span className="text-[10px] text-blue-500 font-semibold">manual</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editFreqId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <select value={editFreqVal} onChange={e => setEditFreqVal(e.target.value as PFCommitment['frequency'])}
                            className="text-xs border border-blue-400 rounded px-2 py-1 bg-white dark:bg-slate-900" autoFocus>
                            {FREQ_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                          </select>
                          <button onClick={() => commitFreqEdit(c.id)} className="text-emerald-600"><Check size={13} /></button>
                          <button onClick={() => setEditFreqId(null)} className="text-slate-400"><X size={12} /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditFreqId(c.id); setEditFreqVal(c.frequency); }}
                          className="flex items-center gap-1 group" title="Click to change frequency">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded font-medium group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                            {FREQ_LABELS[c.frequency]}
                          </span>
                          <ChevronDown size={11} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editCatId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <select value={editCatVal || c.category} onChange={e => setEditCatVal(e.target.value)}
                            className="text-xs border border-blue-400 rounded px-2 py-1 bg-white dark:bg-slate-900" autoFocus>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                          <button onClick={() => commitCatEdit(c.id)} className="text-emerald-600"><Check size={13} /></button>
                          <button onClick={() => setEditCatId(null)} className="text-slate-400"><X size={12} /></button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditCatId(c.id); setEditCatVal(c.category); }}
                          className="flex items-center gap-1 group" title="Click to change category">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded font-medium group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 transition-colors">
                            {c.category || 'Miscellaneous'}
                          </span>
                          <ChevronDown size={11} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-100">
                      {c.convertedToOneTime ? '—' : fmtINR(c.monthlyEquivalent)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-300">
                      {c.convertedToOneTime ? '—' : fmtINR(c.annualizedCost)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      <p>{c.firstDetected}</p>
                      <p>{c.lastDetected}</p>
                    </td>
                    <td className="px-4 py-3">
                      {c.convertedToOneTime ? (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-semibold">One-time</span>
                      ) : c.userDismissed ? (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-semibold">Dismissed</span>
                      ) : c.userConfirmed ? (
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-semibold">Confirmed</span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-semibold">Auto-detected</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {!c.userConfirmed && !c.userDismissed && !c.convertedToOneTime && (
                          <button onClick={() => handleConfirm(c.id)} title="Confirm this commitment"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors rounded">
                            <Check size={14} />
                          </button>
                        )}
                        {!c.userDismissed && !c.convertedToOneTime && (
                          <button onClick={() => handleConvertToOneTime(c.id)} title="Convert to one-time"
                            className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors rounded">
                            <RotateCcw size={13} />
                          </button>
                        )}
                        {!c.userDismissed && !c.convertedToOneTime && (
                          <button onClick={() => handleDismiss(c.id)} title="Dismiss — not a real commitment"
                            className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700">
                  <td colSpan={3} className="px-4 py-3 text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wide">Total Active</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-slate-800 dark:text-slate-100">{fmtINR(totalMonthly)}</td>
                  <td className="px-4 py-3 text-right font-mono font-black text-slate-800 dark:text-slate-100">{fmtINR(totalAnnual)}</td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Footer */}
        {hasData && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Info size={12} className="mt-0.5 shrink-0" />
              <span>Detection rule: same merchant, ≥3 transactions, consistent interval (±5 days). Monthly Equivalent normalizes non-monthly frequencies.</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-600 space-y-0.5">
              {coverage && (
                <p>Statements covering: <span className="font-medium">{coverage.from} → {coverage.to}</span></p>
              )}
              <p>Last updated: {new Date(lastUpdated).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

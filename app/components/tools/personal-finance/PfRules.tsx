'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Play, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFButton, PFBadge } from './PfUi';
import { useToast } from '@/app/components/ui/ToastSystem';
import {
  loadPFStore, addRule, deleteRule, toggleRule, applyAllRules, getAllCategories, fmtINR,
  type PFRule,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY RULES — Visual manager for auto-categorization rules.
// Condition → Category assignment, applied to all transactions on save.
// ═══════════════════════════════════════════════════════════════════════════════

const CONDITION_LABELS: Record<PFRule['conditionType'], string> = {
  merchant_contains: 'Merchant contains',
  amount_min:        'Amount ≥',
  amount_max:        'Amount ≤',
  type_is:           'Type is',
};

const CONDITION_OPTIONS: { value: PFRule['conditionType']; label: string }[] = [
  { value: 'merchant_contains', label: 'Merchant contains' },
  { value: 'amount_min',        label: 'Amount ≥ (min)' },
  { value: 'amount_max',        label: 'Amount ≤ (max)' },
  { value: 'type_is',           label: 'Type is' },
];

export function CategoryRules() {
  const { toast } = useToast();
  const [rules,      setRules]      = useState<PFRule[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // New rule form
  const [condType,  setCondType]  = useState<PFRule['conditionType']>('merchant_contains');
  const [condValue, setCondValue] = useState('');
  const [assignCat, setAssignCat] = useState('');
  const [newCat,    setNewCat]    = useState('');
  const [showForm,  setShowForm]  = useState(false);

  const reload = () => {
    const store = loadPFStore();
    setRules(Object.values(store.rules).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    setCategories(getAllCategories());
  };

  useEffect(() => {
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  const handleAdd = () => {
    const cat = newCat.trim() || assignCat;
    if (!condValue.trim() || !cat) {
      toast('Condition value and category are required', 'error');
      return;
    }
    addRule({ conditionType: condType, conditionValue: condValue.trim(), assignedCategory: cat, active: true });
    toast('Rule added and applied', 'success');
    setCondValue('');
    setNewCat('');
    setAssignCat('');
    setShowForm(false);
    reload();
  };

  const handleDelete = (id: string) => {
    deleteRule(id);
    toast('Rule deleted', 'info');
    reload();
  };

  const handleToggle = (id: string) => {
    toggleRule(id);
    reload();
  };

  const [applyPreview, setApplyPreview] = useState<{ count: number; preview: { rule: string; matches: number }[] } | null>(null);

  const buildApplyPreview = () => {
    const store = loadPFStore();
    const txns = Object.values(store.transactions);
    const activeRules = rules.filter(r => r.active);

    let totalAffected = 0;
    const perRule: { rule: string; matches: number }[] = activeRules.map(rule => {
      const matches = txns.filter(t => {
        if (t.userOverrideFlag) return false; // skipped
        switch (rule.conditionType) {
          case 'merchant_contains': return t.description.toLowerCase().includes(rule.conditionValue.toLowerCase());
          case 'amount_min': return t.amount >= parseFloat(rule.conditionValue);
          case 'amount_max': return t.amount <= parseFloat(rule.conditionValue);
          case 'type_is': return t.type === rule.conditionValue;
          default: return false;
        }
      }).length;
      totalAffected += matches;
      return { rule: `${CONDITION_LABELS[rule.conditionType]} "${rule.conditionValue}" → ${rule.assignedCategory}`, matches };
    });
    setApplyPreview({ count: totalAffected, preview: perRule });
  };

  const handleApplyAll = () => {
    applyAllRules();
    toast('All rules re-applied to transactions', 'success');
    setApplyPreview(null);
  };

  const activeCount   = rules.filter(r => r.active).length;
  const inactiveCount = rules.filter(r => !r.active).length;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        kpiVariant="strip"
        title="Category Rules"
        subtitle="Auto-assign categories to transactions based on conditions"
        kpis={rules.length > 0 ? [
          { label: 'Total Rules',  value: rules.length,   color: 'primary' },
          { label: 'Active',       value: activeCount,    color: 'success' },
          { label: 'Inactive',     value: inactiveCount,  color: 'neutral' },
        ] : undefined}
      />
      <div className="space-y-4 px-4 pb-4">

        {/* Info banner */}
        <div className="flex items-start gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
          <Info size={13} className="text-slate-500 mt-0.5 shrink-0" />
          Rules are applied in order. First matching rule wins. Transactions with manual category overrides are skipped.
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <PFButton variant="primary" icon={<Plus size={13} />} onClick={() => setShowForm(v => !v)}>
            Add Rule
          </PFButton>
          <PFButton icon={<Play size={13} />} onClick={buildApplyPreview} disabled={activeCount === 0}>
            Re-apply All Rules
          </PFButton>
        </div>

        {/* Preview confirmation panel */}
        {applyPreview && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-warning shrink-0" />
              <p className="text-xs font-bold text-warning">
                This will re-categorize up to {applyPreview.count.toLocaleString('en-IN')} transaction{applyPreview.count !== 1 ? 's' : ''} across {activeCount} active rule{activeCount !== 1 ? 's' : ''}.
              </p>
            </div>
            {applyPreview.preview.filter(r => r.matches > 0).length > 0 && (
              <div className="space-y-1">
                {applyPreview.preview.filter(r => r.matches > 0).map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="truncate mr-2">{r.rule}</span>
                    <span className="font-bold shrink-0">{r.matches} txn{r.matches !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-slate-500">Transactions with manual overrides are not changed. This cannot be undone.</p>
            <div className="flex gap-2">
              <PFButton variant="active" icon={<Play size={12} />} onClick={handleApplyAll}>Apply Now</PFButton>
              <PFButton onClick={() => setApplyPreview(null)}>Cancel</PFButton>
            </div>
          </div>
        )}

        {/* Add rule form */}
        {showForm && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">New Rule</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Condition</label>
                <select value={condType} onChange={e => setCondType(e.target.value as PFRule['conditionType'])}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  {CONDITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Value</label>
                {condType === 'type_is' ? (
                  <select value={condValue} onChange={e => setCondValue(e.target.value)}
                    className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                    <option value="">Select…</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                ) : (
                  <input value={condValue} onChange={e => setCondValue(e.target.value)}
                    placeholder={condType === 'merchant_contains' ? 'e.g. Amazon, Swiggy…' : 'e.g. 5000'}
                    className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Assign Category</label>
                <select value={assignCat} onChange={e => setAssignCat(e.target.value)}
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                  <option value="">— pick existing —</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Or type new category…"
                  className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
              </div>
            </div>
            <div className="flex gap-2">
              <PFButton variant="active" onClick={handleAdd}>Save Rule</PFButton>
              <PFButton onClick={() => setShowForm(false)}>Cancel</PFButton>
            </div>
          </div>
        )}

        {/* Rules list */}
        {rules.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No rules yet.</p>
            <p className="text-xs text-slate-400 mt-1">Add a rule to auto-assign categories to future transactions.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500">{rules.length} rules · applied in order shown</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {rules.map((rule, i) => (
                <div key={rule.id} className={`px-4 py-3 flex items-center gap-3 ${!rule.active ? 'opacity-50' : ''}`}>
                  <span className="text-[10px] font-mono text-slate-400 w-5">{i + 1}</span>
                  <div className="flex-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{CONDITION_LABELS[rule.conditionType]}</span>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-700 dark:text-slate-200">
                      {rule.conditionType.includes('amount') ? fmtINR(parseFloat(rule.conditionValue)) : rule.conditionValue}
                    </code>
                    <span className="text-xs text-slate-400">→</span>
                    <PFBadge color="slate">{rule.assignedCategory}</PFBadge>
                    {!rule.active && <PFBadge color="slate">Inactive</PFBadge>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggle(rule.id)} title={rule.active ? 'Disable rule' : 'Enable rule'}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      {rule.active ? <ToggleRight size={18} className="text-positive" /> : <ToggleLeft size={18} />}
                    </button>
                    <button onClick={() => handleDelete(rule.id)} title="Delete rule"
                      className="p-1.5 rounded hover:bg-negative-tint text-slate-400 hover:text-negative transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

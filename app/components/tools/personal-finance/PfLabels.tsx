'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Tag, X } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { PFButton } from './pf-ui';
import { useToast } from '@/app/components/ui/toast-system';
import {
  loadPFStore, addLabel, deleteLabel, getPFTransactions, assignLabels, removeLabels,
  fmtINR, type PFLabel, type PFTransaction,
} from './finance-store';

// ═══════════════════════════════════════════════════════════════════════════════
// LABEL MANAGER — Create custom tags, view & assign to transactions.
// ═══════════════════════════════════════════════════════════════════════════════

const PRESET_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308',
  '#22c55e','#14b8a6','#06b6d4','#3b82f6','#64748b','#78716c',
];

export function LabelManager() {
  const { toast } = useToast();
  const [mounted, setMounted]   = useState(false);
  const [labels, setLabels]     = useState<PFLabel[]>([]);
  const [allTxns, setAllTxns]   = useState<PFTransaction[]>([]);
  const [labelMap, setLabelMap] = useState<Record<string, string[]>>({});  // labelId → txnIds

  const [newName,  setNewName]  = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [showForm, setShowForm] = useState(false);

  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [searchTxn,     setSearchTxn]     = useState('');

  const reload = () => {
    const store = loadPFStore();
    setLabels(Object.values(store.labels));
    setAllTxns(getPFTransactions());
    // build labelId → txnIds map
    const map: Record<string, string[]> = {};
    for (const lm of store.labelMaps) {
      if (!map[lm.labelId]) map[lm.labelId] = [];
      map[lm.labelId].push(lm.transactionId);
    }
    setLabelMap(map);
  };

  useEffect(() => {
    setMounted(true);
    reload();
    window.addEventListener('pf-store-updated', reload);
    return () => window.removeEventListener('pf-store-updated', reload);
  }, []);

  const handleAddLabel = () => {
    if (!newName.trim()) { toast('Label name is required', 'error'); return; }
    addLabel(newName.trim(), newColor);
    toast(`Label "${newName.trim()}" created`, 'success');
    setNewName('');
    setShowForm(false);
    reload();
  };

  const handleDeleteLabel = (id: string, name: string) => {
    deleteLabel(id);
    toast(`Label "${name}" deleted`, 'info');
    if (selectedLabel === id) setSelectedLabel(null);
    reload();
  };

  const handleAssign = (txnId: string, labelId: string) => {
    assignLabels([txnId], labelId);
    reload();
  };

  const handleRemove = (txnId: string, labelId: string) => {
    removeLabels([txnId], labelId);
    reload();
  };

  // Transactions for selected label
  const labelTxnIds = selectedLabel ? new Set(labelMap[selectedLabel] ?? []) : new Set<string>();
  const labelTxns   = useMemo(() => allTxns.filter(t => labelTxnIds.has(t.id)), [allTxns, labelTxnIds]);
  const labelTotal  = labelTxns.reduce((s, t) => s + (t.type === 'debit' ? t.amount : 0), 0);

  // Available (untagged) transactions for this label
  const untaggedTxns = useMemo(() => {
    const q = searchTxn.toLowerCase();
    return allTxns.filter(t =>
      !labelTxnIds.has(t.id) &&
      (t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
    ).slice(0, 30);
  }, [allTxns, labelTxnIds, searchTxn]);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <SAPHeader
        fullWidth
        title="Label Manager"
        subtitle="Create custom tags and assign them to transactions"
        kpis={labels.length > 0 ? [
          { label: 'Labels',       value: labels.length,                                           color: 'primary' },
          { label: 'Tagged Txns',  value: Object.values(labelMap).reduce((s, a) => s + a.length, 0), color: 'neutral' },
        ] : undefined}
      />
      <div className="space-y-4 px-4 pb-4">

        {/* Add Label */}
        <div className="flex items-center gap-2">
          <PFButton variant="primary" icon={<Plus size={13} />} onClick={() => setShowForm(v => !v)}>
            New Label
          </PFButton>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-700 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Create Label</p>
            <div className="flex items-center gap-3">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Label name…"
                onKeyDown={e => e.key === 'Enter' && handleAddLabel()}
                className="flex-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200" />
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${newColor === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ backgroundColor: newColor }}>
                <Tag size={12} /> {newName || 'Preview'}
              </div>
            </div>
            <div className="flex gap-2">
              <PFButton variant="active" onClick={handleAddLabel}>Create</PFButton>
              <PFButton onClick={() => setShowForm(false)}>Cancel</PFButton>
            </div>
          </div>
        )}

        {/* Labels Grid */}
        {labels.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-12 text-center">
            <Tag size={36} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No labels yet.</p>
            <p className="text-xs text-slate-400 mt-1">Create labels to tag and group your transactions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {labels.map(lbl => {
              const count = (labelMap[lbl.id] ?? []).length;
              const isSelected = selectedLabel === lbl.id;
              return (
                <div
                  key={lbl.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedLabel(isSelected ? null : lbl.id)}
                  onKeyDown={e => e.key === 'Enter' && setSelectedLabel(isSelected ? null : lbl.id)}
                  className={`relative bg-white dark:bg-slate-900 border rounded-xl p-3 text-left transition-all cursor-pointer ${isSelected ? 'border-blue-400 dark:border-blue-500 shadow-md' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: lbl.color }} />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{lbl.name}</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteLabel(lbl.id, lbl.name); }}
                      className="text-slate-300 hover:text-red-500 transition-colors p-0.5">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{count} transaction{count !== 1 ? 's' : ''}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Label Detail Panel */}
        {selectedLabel && (() => {
          const lbl = labels.find(l => l.id === selectedLabel)!;
          if (!lbl) return null;
          return (
            <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lbl.color }} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{lbl.name}</span>
                  <span className="text-xs text-slate-400">{labelTxns.length} tagged · {fmtINR(labelTotal)} debits</span>
                </div>
                <button onClick={() => setSelectedLabel(null)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
              </div>

              {/* Tagged transactions */}
              {labelTxns.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                  {labelTxns.map(t => (
                    <div key={t.id} className="px-4 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-xs">{t.description}</p>
                        <p className="text-[10px] text-slate-400">{t.date} · {t.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">{fmtINR(t.amount)}</span>
                        <button onClick={() => handleRemove(t.id, selectedLabel)}
                          className="text-slate-300 hover:text-red-500 transition-colors" title="Remove label">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Search & assign */}
              <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Add Transactions</p>
                <input value={searchTxn} onChange={e => setSearchTxn(e.target.value)} placeholder="Search transactions to tag…"
                  className="w-full text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 mb-2" />
                {searchTxn && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    {untaggedTxns.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-slate-400">No matches.</p>
                    ) : untaggedTxns.map(t => (
                      <div key={t.id} className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <div>
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-xs">{t.description}</p>
                          <p className="text-[10px] text-slate-400">{t.date} · {t.category} · {fmtINR(t.amount)}</p>
                        </div>
                        <button onClick={() => handleAssign(t.id, selectedLabel)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold shrink-0 ml-2">+ Tag</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

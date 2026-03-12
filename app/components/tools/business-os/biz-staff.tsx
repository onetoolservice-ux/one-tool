'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Users, Plus, Edit2, Trash2, Download, IndianRupee, Calendar, CheckCircle,
  UserCheck, AlertCircle, ChevronLeft, Save, X, CreditCard, Clock,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate, fmtCurrency, todayISO,
  addStaff, updateStaff, deleteStaff,
  saveAttendance, getAttendance,
  addAdvance, getStaffAdvances,
  calcSalary,
  addTransaction,
  type BizOSStore, type BizStaff, type BizAttendance, type BizAdvance,
} from './biz-os-store';

// ── Types ──────────────────────────────────────────────────────────────────────

type Mode = 'roster' | 'attendance' | 'payroll';
type AttStatus = 'P' | 'A' | 'H';

const EMPTY_STAFF = {
  name: '',
  role: '',
  phone: '',
  salary: 0,
  joiningDate: todayISO(),
  pfEnabled: false,
  esiEnabled: false,
  active: true,
  notes: '',
};

const ATT_NEXT: Record<AttStatus, AttStatus> = { P: 'A', A: 'H', H: 'P' };
const ATT_COLORS: Record<AttStatus, string> = {
  P: 'bg-emerald-500 text-white',
  A: 'bg-red-500 text-white',
  H: 'bg-amber-400 text-white',
};
const ATT_LABEL: Record<AttStatus, string> = { P: 'P', A: 'A', H: 'H' };

// ── Helpers ────────────────────────────────────────────────────────────────────

function currentMonth(): string {
  return todayISO().slice(0, 7);
}

function getDaysInMonth(month: string): number {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

function isFutureDate(month: string, day: number): boolean {
  const today = todayISO();
  const dateStr = `${month}-${String(day).padStart(2, '0')}`;
  return dateStr > today;
}

function exportPayrollCSV(
  staffList: BizStaff[],
  store: BizOSStore,
  month: string,
): void {
  const rows: string[][] = [
    ['Staff', 'Role', 'Working Days', 'Present', 'Absent', 'Half', 'Gross', 'PF', 'ESI', 'Advance', 'Net Pay'],
  ];
  for (const s of staffList) {
    if (!s.active) continue;
    const att = getAttendance(s.id, month, store);
    const advances = getStaffAdvances(s.id, store);
    const calc = calcSalary(s, att, advances, month);
    rows.push([
      s.name, s.role,
      String(calc.workingDays), String(calc.presentDays), String(calc.absentDays), String(calc.halfDays),
      String(calc.gross), String(calc.pfDeduction), String(calc.esiDeduction),
      String(calc.advanceDeduction), String(calc.net),
    ]);
  }
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payroll-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Staff Form ─────────────────────────────────────────────────────────────────

interface StaffFormProps {
  initial?: BizStaff | null;
  onSave: () => void;
  onCancel: () => void;
}

function StaffForm({ initial, onSave, onCancel }: StaffFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    role: initial?.role ?? '',
    phone: initial?.phone ?? '',
    salary: initial?.salary ?? 0,
    joiningDate: initial?.joiningDate ?? todayISO(),
    pfEnabled: initial?.pfEnabled ?? false,
    esiEnabled: initial?.esiEnabled ?? false,
    active: initial?.active ?? true,
    notes: initial?.notes ?? '',
  });

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSave() {
    if (!form.name.trim() || !form.role.trim() || !form.salary) return;
    if (initial) {
      updateStaff(initial.id, { ...form, salary: Number(form.salary) });
    } else {
      addStaff({ ...form, salary: Number(form.salary) });
    }
    onSave();
  }

  const inputCls =
    'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide';

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {initial ? 'Edit Staff' : 'Add Staff'}
        </h3>
        <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Name *</label>
          <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label className={labelCls}>Role *</label>
          <input className={inputCls} value={form.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Cashier" />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input className={inputCls} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit" />
        </div>
        <div>
          <label className={labelCls}>Monthly Salary (INR) *</label>
          <input
            type="number" min={0} className={inputCls}
            value={form.salary || ''}
            onChange={e => set('salary', Number(e.target.value))}
            placeholder="e.g. 18000"
          />
        </div>
        <div>
          <label className={labelCls}>Joining Date *</label>
          <input type="date" className={inputCls} value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelCls}>Notes</label>
          <textarea className={`${inputCls} resize-none`} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes..." />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2.5">
        {(
          [
            { key: 'pfEnabled', label: 'PF Enabled (12% deduction)' },
            { key: 'esiEnabled', label: 'ESI Enabled (0.75%, salary ≤ ₹21,000)' },
            { key: 'active', label: 'Active Employee' },
          ] as const
        ).map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set(key, !form[key])}
              className={`relative w-10 h-5 rounded-full transition-colors ${form[key] ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`}
              />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={!form.name.trim() || !form.role.trim() || !form.salary}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Save size={14} />
          {initial ? 'Update' : 'Add Staff'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Advance Panel ──────────────────────────────────────────────────────────────

interface AdvancePanelProps {
  staff: BizStaff;
  store: BizOSStore;
}

function AdvancePanel({ staff, store }: AdvancePanelProps) {
  const advances = getStaffAdvances(staff.id, store);
  const [showForm, setShowForm] = useState(false);
  const [advDate, setAdvDate] = useState(todayISO());
  const [advAmount, setAdvAmount] = useState('');
  const [advNote, setAdvNote] = useState('');

  function handleAdd() {
    const amt = Number(advAmount);
    if (!amt) return;
    addAdvance({ staffId: staff.id, date: advDate, amount: amt, note: advNote, recovered: false });
    setAdvAmount('');
    setAdvNote('');
    setShowForm(false);
  }

  const outstanding = advances.filter(a => !a.recovered).reduce((s, a) => s + a.amount, 0);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Advances
          {outstanding > 0 && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">(Outstanding: {fmtCurrency(outstanding)})</span>
          )}
        </span>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
        >
          <Plus size={12} /> Add Advance
        </button>
      </div>

      {showForm && (
        <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Date</label>
              <input
                type="date"
                className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                value={advDate}
                onChange={e => setAdvDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Amount (INR)</label>
              <input
                type="number" min={0}
                className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="e.g. 2000"
                value={advAmount}
                onChange={e => setAdvAmount(e.target.value)}
              />
            </div>
          </div>
          <input
            className="w-full px-2 py-1.5 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            placeholder="Note (optional)"
            value={advNote}
            onChange={e => setAdvNote(e.target.value)}
          />
          <button
            onClick={handleAdd}
            disabled={!advAmount}
            className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white text-xs font-bold rounded transition-colors"
          >
            Record Advance
          </button>
        </div>
      )}

      {advances.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No advances recorded.</p>
      ) : (
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {advances
            .slice()
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(adv => (
              <div
                key={adv.id}
                className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg ${
                  adv.recovered
                    ? 'bg-slate-50 dark:bg-slate-800/50 text-slate-400'
                    : 'bg-amber-50 dark:bg-amber-900/20 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="font-semibold">{adv.date}</span>
                  {adv.note && <span className="ml-2 text-slate-400">{adv.note}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{fmtCurrency(adv.amount)}</span>
                  {adv.recovered ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Recovered</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">Pending</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ── Staff Detail Panel ─────────────────────────────────────────────────────────

interface StaffDetailProps {
  staff: BizStaff;
  store: BizOSStore;
  onEdit: () => void;
  onDelete: () => void;
}

function StaffDetail({ staff, store, onEdit, onDelete }: StaffDetailProps) {
  return (
    <div className="p-5 overflow-y-auto h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{staff.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{staff.role}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Edit2 size={12} /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Monthly Salary</p>
          <p className="text-base font-bold text-slate-900 dark:text-white">{fmtCurrency(staff.salary)}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Phone</p>
          <p className="text-base font-bold text-slate-900 dark:text-white">{staff.phone || '—'}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Joining Date</p>
          <p className="text-base font-bold text-slate-900 dark:text-white">{staff.joiningDate}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-0.5">Status</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${staff.active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
            {staff.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        {staff.pfEnabled && (
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-semibold">PF 12%</span>
        )}
        {staff.esiEnabled && (
          <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg font-semibold">ESI 0.75%</span>
        )}
      </div>

      {staff.notes && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-400">{staff.notes}</p>
        </div>
      )}

      <AdvancePanel staff={staff} store={store} />
    </div>
  );
}

// ── Roster Mode ────────────────────────────────────────────────────────────────

interface RosterModeProps {
  store: BizOSStore;
}

function RosterMode({ store }: RosterModeProps) {
  const staffList: BizStaff[] = (Object.values((store as any).staff ?? {}) as BizStaff[]).sort(
    (a, b) => a.name.localeCompare(b.name),
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const selected = staffList.find(s => s.id === selectedId) ?? null;

  function handleDeleteStaff(id: string) {
    if (!confirm('Delete this staff member? All associated data will be lost.')) return;
    deleteStaff(id);
    if (selectedId === id) setSelectedId(null);
  }

  function handleSaved() {
    setIsAdding(false);
    setIsEditing(false);
  }

  return (
    <div className="flex-1 grid grid-cols-[380px_1fr] overflow-hidden">
      {/* Left: Staff List */}
      <div className="border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {staffList.length} Employee{staffList.length !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => { setIsAdding(true); setIsEditing(false); setSelectedId(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            <Plus size={13} /> Add Staff
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {staffList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <Users size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No staff added yet</p>
            </div>
          )}
          {staffList.map(s => (
            <div
              key={s.id}
              onClick={() => { setSelectedId(s.id); setIsAdding(false); setIsEditing(false); }}
              className={`p-3 rounded-xl cursor-pointer transition-colors border ${
                selectedId === s.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.role}</p>
                </div>
                <span className={`ml-2 shrink-0 text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  s.active
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {s.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><IndianRupee size={11} />{fmtCurrency(s.salary)}/mo</span>
                {s.phone && <span>{s.phone}</span>}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Joined {s.joiningDate}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Detail / Form */}
      <div className="overflow-y-auto bg-white dark:bg-slate-900">
        {isAdding ? (
          <StaffForm onSave={handleSaved} onCancel={() => setIsAdding(false)} />
        ) : isEditing && selected ? (
          <StaffForm
            initial={selected}
            onSave={handleSaved}
            onCancel={() => setIsEditing(false)}
          />
        ) : selected ? (
          <StaffDetail
            staff={selected}
            store={store}
            onEdit={() => setIsEditing(true)}
            onDelete={() => handleDeleteStaff(selected.id)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Users size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Select a staff member</p>
            <p className="text-xs mt-1">or click "Add Staff" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Attendance Mode ────────────────────────────────────────────────────────────

interface AttendanceModeProps {
  store: BizOSStore;
}

function AttendanceMode({ store }: AttendanceModeProps) {
  const [month, setMonth] = useState(currentMonth());
  const staffList: BizStaff[] = (Object.values((store as any).staff ?? {}) as BizStaff[])
    .filter(s => s.active)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Local attendance state keyed by staffId
  const [attMap, setAttMap] = useState<Record<string, Record<string, AttStatus>>>(() => {
    const init: Record<string, Record<string, AttStatus>> = {};
    for (const s of staffList) {
      const att = getAttendance(s.id, month, store);
      init[s.id] = { ...att.days } as Record<string, AttStatus>;
    }
    return init;
  });

  // Reload when month or store changes
  useEffect(() => {
    const next: Record<string, Record<string, AttStatus>> = {};
    for (const s of staffList) {
      const att = getAttendance(s.id, month, store);
      next[s.id] = { ...att.days } as Record<string, AttStatus>;
    }
    setAttMap(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, store]);

  const daysInMonth = getDaysInMonth(month);
  const dayNums = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function handleCellClick(staffId: string, day: number) {
    const dateStr = `${month}-${String(day).padStart(2, '0')}`;
    if (isFutureDate(month, day)) return;

    setAttMap(prev => {
      const current = (prev[staffId]?.[dateStr] ?? null) as AttStatus | null;
      const next: AttStatus = current ? ATT_NEXT[current] : 'P';
      const staffDays = { ...(prev[staffId] ?? {}), [dateStr]: next };
      const att: BizAttendance = { staffId, month, days: staffDays as Record<string, 'P' | 'A' | 'H'> };
      saveAttendance(att);
      return { ...prev, [staffId]: staffDays };
    });
  }

  function summarize(staffId: string) {
    const days = attMap[staffId] ?? {};
    let P = 0, A = 0, H = 0;
    Object.values(days).forEach(v => {
      if (v === 'P') P++;
      else if (v === 'A') A++;
      else if (v === 'H') H++;
    });
    return { P, A, H };
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Month Picker */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Month</label>
        <input
          type="month"
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={month}
          onChange={e => setMonth(e.target.value)}
        />
        <span className="text-xs text-slate-400">Days in month: {daysInMonth}</span>
        <div className="flex items-center gap-3 ml-auto text-xs">
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-emerald-500 inline-block" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-red-500 inline-block" /> Absent</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-amber-400 inline-block" /> Half Day</span>
          <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 inline-block" /> Future</span>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        {staffList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Users size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No active staff found. Add staff in the Roster tab.</p>
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="text-left px-4 py-2 font-bold text-slate-700 dark:text-slate-300 w-48 min-w-[192px] border-r border-slate-200 dark:border-slate-700">
                  Staff / Day
                </th>
                {dayNums.map(d => (
                  <th key={d} className="px-1 py-2 font-semibold text-slate-600 dark:text-slate-400 w-9 min-w-[36px] text-center">
                    {d}
                  </th>
                ))}
                <th className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300 text-center min-w-[120px] border-l border-slate-200 dark:border-slate-700">
                  Summary
                </th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((s, idx) => {
                const { P, A, H } = summarize(s.id);
                return (
                  <tr
                    key={s.id}
                    className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-blue-50 dark:hover:bg-blue-900/10`}
                  >
                    <td className="px-4 py-2 border-r border-slate-200 dark:border-slate-700">
                      <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-slate-400">{s.role}</p>
                    </td>
                    {dayNums.map(d => {
                      const dateStr = `${month}-${String(d).padStart(2, '0')}`;
                      const status = attMap[s.id]?.[dateStr] as AttStatus | undefined;
                      const future = isFutureDate(month, d);
                      return (
                        <td key={d} className="px-0.5 py-1 text-center">
                          <button
                            disabled={future}
                            onClick={() => handleCellClick(s.id, d)}
                            title={future ? 'Future date' : status ? `Click to cycle: ${status} → ${ATT_NEXT[status]}` : 'Click to mark Present'}
                            className={`w-8 h-8 rounded text-[10px] font-bold transition-colors ${
                              future
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                : status
                                ? `${ATT_COLORS[status]} hover:opacity-80`
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                          >
                            {future ? '' : status ? ATT_LABEL[status] : '·'}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center border-l border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">P:{P}</span>
                        <span className="text-red-500 font-bold">A:{A}</span>
                        <span className="text-amber-500 font-bold">H:{H}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Payroll Mode ───────────────────────────────────────────────────────────────

interface PayrollModeProps {
  store: BizOSStore;
}

function PayrollMode({ store }: PayrollModeProps) {
  const [month, setMonth] = useState(currentMonth());
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());

  const staffList: BizStaff[] = (Object.values((store as any).staff ?? {}) as BizStaff[])
    .filter(s => s.active)
    .sort((a, b) => a.name.localeCompare(b.name));

  interface Row {
    staff: BizStaff;
    calc: ReturnType<typeof calcSalary>;
  }

  const rows: Row[] = staffList.map(s => {
    const att = getAttendance(s.id, month, store);
    const advances = getStaffAdvances(s.id, store);
    const calc = calcSalary(s, att, advances, month);
    return { staff: s, calc };
  });

  const totalGross = rows.reduce((s, r) => s + r.calc.gross, 0);
  const totalDeductions = rows.reduce((s, r) => s + r.calc.pfDeduction + r.calc.esiDeduction + r.calc.advanceDeduction, 0);
  const totalNet = rows.reduce((s, r) => s + r.calc.net, 0);

  function handleRecordPayment(staff: BizStaff, calc: ReturnType<typeof calcSalary>) {
    if (paidIds.has(staff.id)) return;
    if (!confirm(`Record salary payment of ${fmtCurrency(calc.net)} to ${staff.name} for ${month}?`)) return;

    addTransaction({
      date: todayISO(),
      type: 'expense',
      amount: calc.net,
      category: 'Salary',
      description: `Salary payment to ${staff.name} (${staff.role}) for ${month}`,
      paymentMode: 'cash',
    });

    setPaidIds(prev => new Set([...prev, staff.id]));
  }

  function handleExport() {
    exportPayrollCSV(staffList, store, month);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Controls */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Month</label>
        <input
          type="month"
          className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={month}
          onChange={e => { setMonth(e.target.value); setPaidIds(new Set()); }}
        />
        <div className="ml-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Download size={14} /> Export Payroll CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {staffList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Users size={48} className="mb-3 opacity-30" />
            <p className="text-sm">No active staff found. Add staff in the Roster tab.</p>
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800">
              <tr>
                {[
                  'Staff', 'Role', 'Working Days', 'Present', 'Absent', 'Half',
                  'Gross', 'PF', 'ESI', 'Advance', 'Net Pay', 'Action',
                ].map(h => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap border-b border-slate-200 dark:border-slate-700 ${
                      h === 'Net Pay' ? 'text-right' : h === 'Action' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ staff, calc }, idx) => {
                const paid = paidIds.has(staff.id);
                return (
                  <tr
                    key={staff.id}
                    className={`${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/40'} hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors`}
                  >
                    <td className="px-3 py-2.5">
                      <p className="font-bold text-slate-900 dark:text-white">{staff.name}</p>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{staff.role}</td>
                    <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 text-center">{calc.workingDays}</td>
                    <td className="px-3 py-2.5 text-emerald-600 dark:text-emerald-400 font-semibold text-center">{calc.presentDays}</td>
                    <td className="px-3 py-2.5 text-red-500 font-semibold text-center">{calc.absentDays}</td>
                    <td className="px-3 py-2.5 text-amber-500 font-semibold text-center">{calc.halfDays}</td>
                    <td className="px-3 py-2.5 text-slate-800 dark:text-slate-200 font-semibold">{fmtCurrency(calc.gross)}</td>
                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                      {calc.pfDeduction > 0 ? fmtCurrency(calc.pfDeduction) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">
                      {calc.esiDeduction > 0 ? fmtCurrency(calc.esiDeduction) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-amber-600 dark:text-amber-400 font-semibold">
                      {calc.advanceDeduction > 0 ? fmtCurrency(calc.advanceDeduction) : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{fmtCurrency(calc.net)}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {paid ? (
                        <span className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle size={13} /> Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRecordPayment(staff, calc)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors mx-auto"
                        >
                          <CreditCard size={11} /> Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Footer */}
      {rows.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-6 py-3">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Gross Payroll</p>
              <p className="text-base font-black text-slate-900 dark:text-white">{fmtCurrency(totalGross)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Deductions</p>
              <p className="text-base font-black text-red-600 dark:text-red-400">{fmtCurrency(totalDeductions)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Net Payable</p>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{fmtCurrency(totalNet)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Already Paid</p>
              <p className="text-base font-black text-blue-600 dark:text-blue-400">{paidIds.size} / {rows.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Root Component ─────────────────────────────────────────────────────────────

export function BizStaff() {
  const [store, setStore] = useState<BizOSStore>(() => loadBizStore());
  const [mode, setMode] = useState<Mode>('roster');

  useEffect(() => {
    const unsub = onBizStoreUpdate(() => setStore(loadBizStore()));
    return unsub;
  }, []);

  // KPI calculations
  const staffList: BizStaff[] = Object.values((store as any).staff ?? {}) as BizStaff[];
  const activeStaff = staffList.filter(s => s.active);
  const totalMonthlyPayroll = activeStaff.reduce((sum, s) => sum + s.salary, 0);

  const allAdvances: BizAdvance[] = (store as any).advances ?? [];
  const outstandingAdvances = allAdvances.filter(a => !a.recovered).reduce((s, a) => s + a.amount, 0);

  const today = todayISO();
  // "On Leave Today": staff who are active, for whom today's attendance is explicitly 'A'
  const thisMonth = today.slice(0, 7);
  const onLeaveToday = activeStaff.filter(s => {
    const att = getAttendance(s.id, thisMonth, store);
    return att.days[today] === 'A';
  }).length;

  const kpis = [
    {
      label: 'Total Staff',
      value: activeStaff.length,
      icon: Users,
      color: 'primary' as const,
      subtitle: `${staffList.length - activeStaff.length} inactive`,
    },
    {
      label: 'Monthly Payroll',
      value: fmtCurrency(totalMonthlyPayroll),
      icon: IndianRupee,
      color: 'neutral' as const,
      subtitle: 'Gross salaries',
    },
    {
      label: 'Advances Outstanding',
      value: fmtCurrency(outstandingAdvances),
      icon: AlertCircle,
      color: outstandingAdvances > 0 ? ('warning' as const) : ('success' as const),
      subtitle: 'Unrecovered',
    },
    {
      label: 'On Leave Today',
      value: onLeaveToday,
      icon: Clock,
      color: onLeaveToday > 0 ? ('error' as const) : ('success' as const),
      subtitle: today,
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      <SAPHeader
        title="Staff & Payroll"
        subtitle="Employees · Attendance · Salary"
        kpis={kpis}
        modes={[
          {
            label: 'View',
            value: mode,
            onChange: v => setMode(v as Mode),
            options: [
              { key: 'roster', label: 'Roster', icon: Users },
              { key: 'attendance', label: 'Attendance', icon: Calendar },
              { key: 'payroll', label: 'Payroll', icon: IndianRupee },
            ],
          },
        ]}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {mode === 'roster' && <RosterMode store={store} />}
        {mode === 'attendance' && <AttendanceMode store={store} />}
        {mode === 'payroll' && <PayrollMode store={store} />}
      </div>
    </div>
  );
}

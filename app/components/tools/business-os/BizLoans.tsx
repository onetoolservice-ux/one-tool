'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  CreditCard, Plus, Edit2, Trash2, CheckCircle, Clock, AlertCircle,
  TrendingDown, IndianRupee, CalendarDays, Percent,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import {
  loadBizStore, onBizStoreUpdate, fmtCurrency, todayISO,
  addLoan, updateLoan, deleteLoan, toggleEMIPayment,
  getLoanEMISchedule, getLoans, getEMIPayments,
  type BizOSStore, type BizLoan,
} from './biz-os-store';

// ─────────────────────────────────────────────────────────────────────────────

type Mode = 'loans' | 'schedule';

const LOAN_TYPES = [
  { key: 'term',      label: 'Term Loan' },
  { key: 'overdraft', label: 'Overdraft' },
  { key: 'cc',        label: 'Credit Card' },
  { key: 'mudra',     label: 'Mudra/MSME' },
  { key: 'other',     label: 'Other' },
] as const;

const TYPE_BADGE: Record<BizLoan['type'], string> = {
  term:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  overdraft: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  cc:        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  mudra:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  other:     'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const EMPTY_LOAN: Omit<BizLoan, 'id' | 'createdAt'> = {
  lender: '',
  type: 'term',
  principal: 0,
  interestRate: 0,
  tenure: 12,
  startDate: todayISO(),
  emiAmount: 0,
  notes: '',
};

// ── EMI Formula: P * r * (1+r)^n / ((1+r)^n - 1) ──────────────────────────
function computeEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return Math.round(principal / tenureMonths);
  const factor = Math.pow(1 + r, tenureMonths);
  return Math.round((principal * r * factor) / (factor - 1));
}

// ── Current month as YYYY-MM ──────────────────────────────────────────────
function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function BizLoans() {
  const [store, setStore] = useState<BizOSStore | null>(null);
  const [mode, setMode] = useState<Mode>('loans');

  // Loans mode state
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<Omit<BizLoan, 'id' | 'createdAt'>>(EMPTY_LOAN);
  const [emiOverride, setEmiOverride] = useState(false);

  // Schedule mode state
  const [scheduleLoanId, setScheduleLoanId] = useState<string>('');

  useEffect(() => {
    const load = () => setStore(loadBizStore());
    load();
    return onBizStoreUpdate(load);
  }, []);

  const loans = useMemo(() => {
    if (!store) return {} as Record<string, BizLoan>;
    return getLoans(store);
  }, [store]);

  const emiPayments = useMemo(() => {
    if (!store) return {} as ReturnType<typeof getEMIPayments>;
    return getEMIPayments(store);
  }, [store]);

  const loanList = useMemo(() =>
    Object.values(loans).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [loans],
  );

  // ── KPIs ────────────────────────────────────────────────────────────────
  const kpiData = useMemo(() => {
    let totalDebt = 0;
    let monthlyEMIBurden = 0;
    let emisDueThisMonth = 0;
    const thisMonth = currentMonth();

    loanList.forEach(loan => {
      const schedule = getLoanEMISchedule(loan);
      // Approximate remaining balance = balance after last paid EMI
      let paidCount = 0;
      schedule.forEach(row => {
        const key = `${loan.id}-${row.month}`;
        if (emiPayments[key]?.paid) paidCount++;
      });
      // Remaining balance = balance from the last paid row (or full principal if none paid)
      let remaining = loan.principal;
      for (let i = 0; i < paidCount && i < schedule.length; i++) {
        remaining = schedule[i].balance;
      }
      totalDebt += remaining;
      monthlyEMIBurden += loan.emiAmount;

      // EMIs due this month
      const thisMonthRow = schedule.find(r => r.month === thisMonth);
      if (thisMonthRow) {
        const key = `${loan.id}-${thisMonth}`;
        if (!emiPayments[key]?.paid) emisDueThisMonth++;
      }
    });

    return { totalDebt, monthlyEMIBurden, emisDueThisMonth, activeLoans: loanList.length };
  }, [loanList, emiPayments]);

  // ── Computed EMI for form ─────────────────────────────────────────────
  const computedEMI = useMemo(
    () => computeEMI(form.principal, form.interestRate, form.tenure),
    [form.principal, form.interestRate, form.tenure],
  );

  // ── Form helpers ──────────────────────────────────────────────────────
  function openAdd() {
    setForm({ ...EMPTY_LOAN, startDate: todayISO() });
    setEmiOverride(false);
    setEditingId(null);
    setShowForm(true);
    setSelectedLoanId(null);
  }

  function openEdit(loan: BizLoan) {
    setForm({
      lender: loan.lender,
      type: loan.type,
      principal: loan.principal,
      interestRate: loan.interestRate,
      tenure: loan.tenure,
      startDate: loan.startDate,
      emiAmount: loan.emiAmount,
      notes: loan.notes ?? '',
    });
    setEmiOverride(loan.emiAmount !== computeEMI(loan.principal, loan.interestRate, loan.tenure));
    setEditingId(loan.id);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_LOAN);
    setEmiOverride(false);
  }

  function handleSave() {
    if (!form.lender.trim()) return;
    const finalEMI = emiOverride ? form.emiAmount : computedEMI;
    const payload = { ...form, emiAmount: finalEMI };
    if (editingId) {
      updateLoan(editingId, payload);
    } else {
      addLoan(payload);
    }
    closeForm();
  }

  function handleDelete(id: string) {
    deleteLoan(id);
    setDeleteConfirm(null);
    if (selectedLoanId === id) setSelectedLoanId(null);
    if (scheduleLoanId === id) setScheduleLoanId('');
  }

  function setField<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  if (!store) return null;

  // ── Schedule data ─────────────────────────────────────────────────────
  const scheduleLoan = scheduleLoanId ? loans[scheduleLoanId] : null;
  const schedule = scheduleLoan ? getLoanEMISchedule(scheduleLoan) : [];
  const thisMonth = currentMonth();

  const paidRows = schedule.filter(r => emiPayments[`${scheduleLoanId}-${r.month}`]?.paid);
  const totalPaidCount = paidRows.length;
  const totalInterestPaid = paidRows.reduce((s, r) => s + r.interest, 0);
  const totalPrincipalPaid = paidRows.reduce((s, r) => s + r.principal, 0);
  const outstandingBalance = schedule.length > 0
    ? (paidRows.length > 0 ? schedule[paidRows.length - 1].balance : (scheduleLoan?.principal ?? 0))
    : 0;

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <SAPHeader
        title="Loans & EMI"
        subtitle="Repayment · Schedule · Tracking"
        kpis={[
          {
            label: 'Total Debt',
            value: fmtCurrency(kpiData.totalDebt),
            icon: TrendingDown,
            color: 'error',
            subtitle: 'Approx. remaining',
          },
          {
            label: 'Monthly EMI Burden',
            value: fmtCurrency(kpiData.monthlyEMIBurden),
            icon: IndianRupee,
            color: 'warning',
            subtitle: 'Sum of all EMIs',
          },
          {
            label: 'EMIs Due This Month',
            value: kpiData.emisDueThisMonth,
            icon: AlertCircle,
            color: 'primary',
            subtitle: 'Unpaid for ' + thisMonth,
          },
          {
            label: 'Loans Active',
            value: kpiData.activeLoans,
            icon: CreditCard,
            color: 'neutral',
            subtitle: 'Total loans tracked',
          },
        ]}
        modes={[
          {
            label: 'View',
            options: [
              { key: 'loans', label: 'Loans' },
              { key: 'schedule', label: 'EMI Schedule' },
            ],
            value: mode,
            onChange: v => setMode(v as Mode),
          },
        ]}
      />

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {mode === 'loans' ? (
          <LoansMode
            loanList={loanList}
            emiPayments={emiPayments}
            selectedLoanId={selectedLoanId}
            setSelectedLoanId={setSelectedLoanId}
            showForm={showForm}
            editingId={editingId}
            form={form}
            setField={setField}
            computedEMI={computedEMI}
            emiOverride={emiOverride}
            setEmiOverride={setEmiOverride}
            openAdd={openAdd}
            openEdit={openEdit}
            closeForm={closeForm}
            handleSave={handleSave}
            deleteConfirm={deleteConfirm}
            setDeleteConfirm={setDeleteConfirm}
            handleDelete={handleDelete}
          />
        ) : (
          <ScheduleMode
            loanList={loanList}
            scheduleLoanId={scheduleLoanId}
            setScheduleLoanId={setScheduleLoanId}
            scheduleLoan={scheduleLoan}
            schedule={schedule}
            emiPayments={emiPayments}
            thisMonth={thisMonth}
            totalPaidCount={totalPaidCount}
            totalInterestPaid={totalInterestPaid}
            totalPrincipalPaid={totalPrincipalPaid}
            outstandingBalance={outstandingBalance}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOANS MODE
// ─────────────────────────────────────────────────────────────────────────────

interface LoansModeProps {
  loanList: BizLoan[];
  emiPayments: Record<string, { paid: boolean; amount: number }>;
  selectedLoanId: string | null;
  setSelectedLoanId: (id: string | null) => void;
  showForm: boolean;
  editingId: string | null;
  form: Omit<BizLoan, 'id' | 'createdAt'>;
  setField: <K extends keyof Omit<BizLoan, 'id' | 'createdAt'>>(
    k: K, v: Omit<BizLoan, 'id' | 'createdAt'>[K],
  ) => void;
  computedEMI: number;
  emiOverride: boolean;
  setEmiOverride: (v: boolean) => void;
  openAdd: () => void;
  openEdit: (loan: BizLoan) => void;
  closeForm: () => void;
  handleSave: () => void;
  deleteConfirm: string | null;
  setDeleteConfirm: (id: string | null) => void;
  handleDelete: (id: string) => void;
}

function LoansMode({
  loanList, emiPayments, selectedLoanId, setSelectedLoanId,
  showForm, editingId, form, setField, computedEMI,
  emiOverride, setEmiOverride, openAdd, openEdit, closeForm, handleSave,
  deleteConfirm, setDeleteConfirm, handleDelete,
}: LoansModeProps) {
  return (
    <div className="h-full grid grid-cols-[360px_1fr] overflow-hidden">
      {/* Left: Loan List */}
      <div className="border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            All Loans ({loanList.length})
          </p>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus size={13} />
            Add Loan
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loanList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <CreditCard size={36} className="text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No loans added yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Click "Add Loan" to track your first business loan
              </p>
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              {loanList.map(loan => {
                const schedule = getLoanEMISchedule(loan);
                const paidCount = schedule.filter(r => emiPayments[`${loan.id}-${r.month}`]?.paid).length;
                const remaining = paidCount > 0 ? schedule[paidCount - 1].balance : loan.principal;
                const pct = loan.principal > 0 ? Math.min(100, (paidCount / loan.tenure) * 100) : 0;

                return (
                  <div
                    key={loan.id}
                    onClick={() => { setSelectedLoanId(loan.id); }}
                    className={`rounded-xl p-3.5 border cursor-pointer transition-all ${
                      selectedLoanId === loan.id
                        ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-white/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/50'
                    }`}
                  >
                    {/* Row 1: Lender + type badge + actions */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {loan.lender}
                        </p>
                        <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_BADGE[loan.type]}`}>
                          {LOAN_TYPES.find(t => t.key === loan.type)?.label ?? loan.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={e => { e.stopPropagation(); openEdit(loan); }}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setDeleteConfirm(loan.id); }}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Principal | EMI | Rate */}
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Principal</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{fmtCurrency(loan.principal)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">EMI/mo</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{fmtCurrency(loan.emiAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Rate</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{loan.interestRate}% p.a.</p>
                      </div>
                    </div>

                    {/* Row 3: Start date + remaining */}
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Started {loan.startDate} · {loan.tenure} mo tenure
                      </p>
                      <p className="text-[10px] font-semibold text-red-500 dark:text-red-400">
                        {fmtCurrency(remaining)} left
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      {paidCount}/{loan.tenure} EMIs paid
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Form or empty state */}
      <div className="overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {showForm ? (
          <LoanForm
            editingId={editingId}
            form={form}
            setField={setField}
            computedEMI={computedEMI}
            emiOverride={emiOverride}
            setEmiOverride={setEmiOverride}
            handleSave={handleSave}
            closeForm={closeForm}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
              <CreditCard size={28} className="text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-base font-bold text-slate-600 dark:text-slate-400 mb-2">
              No loan selected
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
              Select a loan from the list to edit, or add a new loan.
            </p>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus size={15} />
              Add Loan
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Delete Loan?</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {loanList.find(l => l.id === deleteConfirm)?.lender} — This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to access loans object for delete modal label
function useLoansRef(loanList: BizLoan[]): Record<string, BizLoan> {
  return Object.fromEntries(loanList.map(l => [l.id, l]));
}

// ─────────────────────────────────────────────────────────────────────────────
// LOAN FORM
// ─────────────────────────────────────────────────────────────────────────────

interface LoanFormProps {
  editingId: string | null;
  form: Omit<BizLoan, 'id' | 'createdAt'>;
  setField: <K extends keyof Omit<BizLoan, 'id' | 'createdAt'>>(
    k: K, v: Omit<BizLoan, 'id' | 'createdAt'>[K],
  ) => void;
  computedEMI: number;
  emiOverride: boolean;
  setEmiOverride: (v: boolean) => void;
  handleSave: () => void;
  closeForm: () => void;
}

function LoanForm({ editingId, form, setField, computedEMI, emiOverride, setEmiOverride, handleSave, closeForm }: LoanFormProps) {
  const isValid = form.lender.trim() !== '' && form.principal > 0 && form.tenure > 0;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-base font-black text-slate-900 dark:text-white mb-5">
          {editingId ? 'Edit Loan' : 'Add New Loan'}
        </h2>

        <div className="flex flex-col gap-4">
          {/* Lender Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Lender Name *
            </label>
            <input
              type="text"
              placeholder="e.g. SBI, HDFC Bank, ICICI"
              value={form.lender}
              onChange={e => setField('lender', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
          </div>

          {/* Loan Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Loan Type *
            </label>
            <select
              value={form.type}
              onChange={e => setField('type', e.target.value as BizLoan['type'])}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            >
              {LOAN_TYPES.map(t => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Principal Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Principal Amount (INR) *
            </label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 500000"
              value={form.principal || ''}
              onChange={e => setField('principal', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
          </div>

          {/* Interest Rate + Tenure row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Annual Interest Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={36}
                step={1}
                placeholder="e.g. 12"
                value={form.interestRate || ''}
                onChange={e => setField('interestRate', Math.min(36, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Tenure (months)
              </label>
              <input
                type="number"
                min={1}
                placeholder="e.g. 60"
                value={form.tenure || ''}
                onChange={e => setField('tenure', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Start Date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={e => setField('startDate', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
          </div>

          {/* EMI Amount */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                EMI Amount
              </p>
              <button
                onClick={() => {
                  setEmiOverride(!emiOverride);
                  if (!emiOverride) setField('emiAmount', computedEMI);
                }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  emiOverride
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}
              >
                {emiOverride ? 'Manual Override' : 'Auto Computed'}
              </button>
            </div>
            {!emiOverride ? (
              <div className="flex items-center justify-between">
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {fmtCurrency(computedEMI)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">per month</p>
              </div>
            ) : (
              <input
                type="number"
                min={0}
                placeholder="Enter EMI amount"
                value={form.emiAmount || ''}
                onChange={e => setField('emiAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-amber-600"
              />
            )}
            {!emiOverride && form.principal > 0 && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                Computed via P × r × (1+r)^n / ((1+r)^n - 1)
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Collateral: property deed, account #XXXX"
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={closeForm}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {editingId ? 'Save Changes' : 'Add Loan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE MODE
// ─────────────────────────────────────────────────────────────────────────────

interface ScheduleModeProps {
  loanList: BizLoan[];
  scheduleLoanId: string;
  setScheduleLoanId: (id: string) => void;
  scheduleLoan: BizLoan | null;
  schedule: { month: string; principal: number; interest: number; balance: number }[];
  emiPayments: Record<string, { paid: boolean; paidDate?: string; amount: number }>;
  thisMonth: string;
  totalPaidCount: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  outstandingBalance: number;
}

function ScheduleMode({
  loanList, scheduleLoanId, setScheduleLoanId, scheduleLoan, schedule,
  emiPayments, thisMonth, totalPaidCount, totalInterestPaid, totalPrincipalPaid, outstandingBalance,
}: ScheduleModeProps) {
  const totalEMIs = schedule.length;
  const progressPct = totalEMIs > 0 ? Math.round((totalPaidCount / totalEMIs) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-5 pb-10">

        {/* Loan Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
            Select Loan
          </label>
          <select
            value={scheduleLoanId}
            onChange={e => setScheduleLoanId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
          >
            <option value="">-- Select a loan to view schedule --</option>
            {loanList.map(loan => (
              <option key={loan.id} value={loan.id}>
                {loan.lender} ({LOAN_TYPES.find(t => t.key === loan.type)?.label}) — {fmtCurrency(loan.principal)}
              </option>
            ))}
          </select>
        </div>

        {!scheduleLoan ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CalendarDays size={40} className="text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Select a loan to view its EMI schedule</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              You can mark EMIs as paid or unpaid from this view
            </p>
          </div>
        ) : (
          <>
            {/* Loan Summary Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                <SummaryCell label="Lender" value={scheduleLoan.lender} />
                <SummaryCell label="Principal" value={fmtCurrency(scheduleLoan.principal)} />
                <SummaryCell label="Rate" value={`${scheduleLoan.interestRate}% p.a.`} />
                <SummaryCell label="Tenure" value={`${scheduleLoan.tenure} months`} />
                <SummaryCell label="Monthly EMI" value={fmtCurrency(scheduleLoan.emiAmount)} accent />
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Repayment Progress
                  </p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {totalPaidCount} of {totalEMIs} EMIs paid ({progressPct}%)
                  </p>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {totalEMIs - totalPaidCount} EMIs remaining
                </p>
              </div>
            </div>

            {/* Schedule Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <th className="px-3 py-3 text-left font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">#</th>
                      <th className="px-3 py-3 text-left font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Month</th>
                      <th className="px-3 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">EMI</th>
                      <th className="px-3 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Principal</th>
                      <th className="px-3 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Interest</th>
                      <th className="px-3 py-3 text-right font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Balance</th>
                      <th className="px-3 py-3 text-center font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-3 text-center font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {schedule.map((row, idx) => {
                      const key = `${scheduleLoan.id}-${row.month}`;
                      const payment = emiPayments[key];
                      const isPaid = payment?.paid ?? false;
                      const isCurrent = row.month === thisMonth;
                      const isOverdue = !isPaid && row.month < thisMonth;

                      // Row background
                      let rowBg = '';
                      if (isPaid) rowBg = 'bg-emerald-50/60 dark:bg-emerald-900/10';
                      else if (isOverdue) rowBg = 'bg-red-50/60 dark:bg-red-900/10';
                      else if (isCurrent) rowBg = 'bg-blue-50/60 dark:bg-blue-900/10';

                      return (
                        <tr key={row.month} className={`${rowBg} transition-colors`}>
                          <td className="px-3 py-2.5 font-semibold text-slate-500 dark:text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800 dark:text-slate-100">
                                {formatMonthLabel(row.month)}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                                  This Month
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-bold text-slate-800 dark:text-slate-100">
                            {fmtCurrency(scheduleLoan.emiAmount)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-700 dark:text-slate-300">
                            {fmtCurrency(row.principal)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-500 dark:text-slate-400">
                            {fmtCurrency(row.interest)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-slate-700 dark:text-slate-300">
                            {fmtCurrency(row.balance)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <StatusBadge isPaid={isPaid} isOverdue={isOverdue} isCurrent={isCurrent} />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              onClick={() => toggleEMIPayment(scheduleLoan.id, row.month, scheduleLoan.emiAmount)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                                isPaid
                                  ? 'bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
                              }`}
                            >
                              {isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Row */}
              <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                    Interest Paid
                  </p>
                  <p className="text-sm font-black text-red-600 dark:text-red-400">
                    {fmtCurrency(totalInterestPaid)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                    Principal Paid
                  </p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    {fmtCurrency(totalPrincipalPaid)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                    Outstanding Balance
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {fmtCurrency(outstandingBalance)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function SummaryCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-bold ${accent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ isPaid, isOverdue, isCurrent }: { isPaid: boolean; isOverdue: boolean; isCurrent: boolean }) {
  if (isPaid) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
        <CheckCircle size={10} />
        Paid
      </span>
    );
  }
  if (isOverdue) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
        <AlertCircle size={10} />
        Overdue
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded-full">
      <Clock size={10} />
      Upcoming
    </span>
  );
}

function formatMonthLabel(month: string): string {
  // month is YYYY-MM
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}

"use client";
import { useState, useMemo } from 'react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-full';
const labelCls = 'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

interface Phase {
  id: string;
  name: string;
  hours: number;
}

interface Expense {
  id: string;
  item: string;
  amount: number;
}

export function ProjectPricing() {
  const [projectName, setProjectName] = useState('Web Development Project');
  const [hourlyRate, setHourlyRate] = useState(3000);
  const [margin, setMargin] = useState(20);
  const [gstApplicable, setGstApplicable] = useState(true);
  const [phases, setPhases] = useState<Phase[]>([
    { id: '1', name: 'Discovery & Planning', hours: 8 },
    { id: '2', name: 'UI/UX Design', hours: 20 },
    { id: '3', name: 'Development', hours: 60 },
    { id: '4', name: 'Testing & QA', hours: 10 },
    { id: '5', name: 'Deployment & Handover', hours: 5 },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', item: 'Domain Registration', amount: 1500 },
    { id: '2', item: 'Hosting (1 year)', amount: 6000 },
  ]);
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseHours, setNewPhaseHours] = useState(10);
  const [newExpItem, setNewExpItem] = useState('');
  const [newExpAmount, setNewExpAmount] = useState(0);

  const result = useMemo(() => {
    const totalHours = phases.reduce((s, p) => s + p.hours, 0);
    const laborCost = totalHours * hourlyRate;
    const directCosts = expenses.reduce((s, e) => s + e.amount, 0);
    const subtotal = laborCost + directCosts;
    const marginAmount = subtotal * (margin / 100);
    const preGst = subtotal + marginAmount;
    const gstAmount = gstApplicable ? preGst * 0.18 : 0;
    const grandTotal = preGst + gstAmount;
    const effectiveRate = totalHours > 0 ? grandTotal / totalHours : 0;
    return { totalHours, laborCost, directCosts, subtotal, marginAmount, preGst, gstAmount, grandTotal, effectiveRate };
  }, [phases, expenses, hourlyRate, margin, gstApplicable]);

  const kpis = [
    { label: 'Grand Total', value: fmt(result.grandTotal), color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Effective Rate/hr', value: fmt(result.effectiveRate), color: 'text-blue-600 dark:text-blue-400' },
    { label: 'GST Amount', value: gstApplicable ? fmt(result.gstAmount) : 'N/A', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Total Hours', value: result.totalHours + ' hrs', color: 'text-slate-600 dark:text-slate-400' },
  ];

  const addPhase = () => {
    if (!newPhaseName) return;
    setPhases((p) => [...p, { id: Date.now().toString(), name: newPhaseName, hours: newPhaseHours }]);
    setNewPhaseName('');
    setNewPhaseHours(10);
  };

  const addExpense = () => {
    if (!newExpItem || newExpAmount <= 0) return;
    setExpenses((e) => [...e, { id: Date.now().toString(), item: newExpItem, amount: newExpAmount }]);
    setNewExpItem('');
    setNewExpAmount(0);
  };

  return (
    <div>
      <SAPHeader
        fullWidth
        title="Project Pricing Calculator"
        subtitle="Build a profitable, GST-ready quote for any project"
        kpis={kpis}
      />
      <div className="p-4 space-y-4">
        {/* Settings */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <p className={labelCls + ' mb-3'}>Project Settings</p>
            <div className="space-y-3">
              <div>
                <p className={labelCls + ' mb-1'}>Project / Client Name</p>
                <input type="text" className={inputCls} value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Hourly Rate (₹)</p>
                <input type="number" className={inputCls} value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} />
              </div>
              <div>
                <p className={labelCls + ' mb-1'}>Profit Margin (%)</p>
                <input type="number" className={inputCls} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGstApplicable((v) => !v)}
                  className={`w-10 h-5 rounded-full transition-colors ${gstApplicable ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${gstApplicable ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-sm text-slate-600 dark:text-slate-400">GST Applicable (18%)</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-4">
            <p className={labelCls + ' mb-3 text-emerald-600 dark:text-emerald-400'}>Cost Breakdown</p>
            <div className="space-y-2 text-sm">
              {[
                { label: `Labor (${result.totalHours} hrs × ${fmt(hourlyRate)})`, value: fmt(result.laborCost), color: '' },
                { label: 'Direct Expenses (pass-through)', value: fmt(result.directCosts), color: '' },
                { label: 'Subtotal', value: fmt(result.subtotal), bold: true },
                { label: `Profit Margin (${margin}%)`, value: fmt(result.marginAmount), color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Pre-GST Total', value: fmt(result.preGst), bold: true },
                ...(gstApplicable ? [{ label: 'GST (18%)', value: fmt(result.gstAmount), color: 'text-amber-600 dark:text-amber-400' }] : []),
                { label: 'Grand Total', value: fmt(result.grandTotal), bold: true, highlight: true },
              ].map(({ label, value, bold, highlight, color }) => (
                <div key={label} className={`flex justify-between ${bold ? 'border-t border-emerald-200 dark:border-emerald-700 pt-1 font-semibold' : ''} ${highlight ? 'text-base' : ''}`}>
                  <span className="text-slate-600 dark:text-slate-400">{label}</span>
                  <span className={color || (highlight ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-800 dark:text-slate-200')}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phases */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Project Phases</p>
          <div className="space-y-2 mb-3">
            {phases.map((phase) => {
              const pct = result.totalHours > 0 ? ((phase.hours / result.totalHours) * 100).toFixed(0) : 0;
              return (
                <div key={phase.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    className={inputCls}
                    value={phase.name}
                    onChange={(e) => setPhases((p) => p.map((x) => x.id === phase.id ? { ...x, name: e.target.value } : x))}
                  />
                  <input
                    type="number"
                    className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-24"
                    value={phase.hours}
                    onChange={(e) => setPhases((p) => p.map((x) => x.id === phase.id ? { ...x, hours: Number(e.target.value) } : x))}
                  />
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-16 shrink-0 text-right">{fmt(phase.hours * hourlyRate)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-10 shrink-0 text-right">{pct}%</span>
                  <button onClick={() => setPhases((p) => p.filter((x) => x.id !== phase.id))} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <input type="text" placeholder="Phase name" className={inputCls} value={newPhaseName} onChange={(e) => setNewPhaseName(e.target.value)} />
            <input type="number" placeholder="Hours" className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-24" value={newPhaseHours} onChange={(e) => setNewPhaseHours(Number(e.target.value))} />
            <button onClick={addPhase} className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expenses */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <p className={labelCls + ' mb-3'}>Pass-through Expenses</p>
          <div className="space-y-2 mb-3">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center gap-2">
                <input type="text" className={inputCls} value={exp.item} onChange={(e) => setExpenses((p) => p.map((x) => x.id === exp.id ? { ...x, item: e.target.value } : x))} />
                <input type="number" className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-32" value={exp.amount} onChange={(e) => setExpenses((p) => p.map((x) => x.id === exp.id ? { ...x, amount: Number(e.target.value) } : x))} />
                <button onClick={() => setExpenses((p) => p.filter((x) => x.id !== exp.id))} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <input type="text" placeholder="Item description" className={inputCls} value={newExpItem} onChange={(e) => setNewExpItem(e.target.value)} />
            <input type="number" placeholder="₹ Amount" className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-400 transition-colors w-32" value={newExpAmount || ''} onChange={(e) => setNewExpAmount(Number(e.target.value))} />
            <button onClick={addExpense} className="flex items-center gap-1 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Client Quote Card */}
        <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{projectName}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Project Quotation</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(result.grandTotal)}</p>
              {gstApplicable && <p className="text-xs text-slate-400 dark:text-slate-500">Incl. GST {fmt(result.gstAmount)}</p>}
            </div>
          </div>

          <div className="space-y-1.5 text-sm mb-4">
            {phases.map((phase) => (
              <div key={phase.id} className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{phase.name} ({phase.hours} hrs)</span>
                <span>{fmt(phase.hours * hourlyRate)}</span>
              </div>
            ))}
            {expenses.length > 0 && (
              <>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{exp.item}</span><span>{fmt(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400"><span>Subtotal</span><span>{fmt(result.subtotal)}</span></div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400"><span>Margin ({margin}%)</span><span>{fmt(result.marginAmount)}</span></div>
              {gstApplicable && <div className="flex justify-between text-amber-600 dark:text-amber-400"><span>GST @ 18%</span><span>{fmt(result.gstAmount)}</span></div>}
              <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200 text-base border-t border-slate-200 dark:border-slate-700 pt-1">
                <span>Total</span><span>{fmt(result.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3 space-y-0.5">
            <p>Rates valid for 30 days from date of quotation.</p>
            <p>30% advance on project start. Balance on delivery.</p>
            {gstApplicable && <p>GST @ 18% applicable as per GST Act. GSTIN to be mentioned on invoice.</p>}
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> GST registration is mandatory if annual turnover exceeds ₹20L (₹10L for special category states). This tool generates indicative quotes — final invoices should be prepared with proper accounting software. Consult a CA for GST compliance and TDS obligations.
          </p>
        </div>
      </div>
    </div>
  );
}

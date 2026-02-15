"use client";
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Download, User, Building, Calculator, RefreshCw,
  Calendar, Trash2, Plus, X, ChevronDown, Info
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { logger } from '@/app/lib/utils/logger';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SalaryRow { id: number; label: string; val: number; editable?: boolean }
interface EmpInfo {
  name: string; id: string; role: string; department: string;
  doj: string; pan: string; uan: string; bank: string; ac: string; location: string;
}
interface CompanyInfo { name: string; address: string; cin: string; month: string }

// ─── Small reusable input ─────────────────────────────────────────────────────
const F = ({ label, value, onChange, placeholder = '', type = 'text', className = '' }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; type?: string; className?: string;
}) => (
  <div className={`space-y-0.5 ${className}`}>
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</label>
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full h-8 px-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white"
    />
  </div>
);

// ─── Number-to-words (simplified Indian) ─────────────────────────────────────
const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
function numWords(n: number): string {
  if (n === 0) return 'Zero';
  const r = (x: number): string => {
    if (x === 0) return '';
    if (x < 20) return ONES[x] + ' ';
    if (x < 100) return TENS[Math.floor(x / 10)] + (x % 10 ? ' ' + ONES[x % 10] : '') + ' ';
    if (x < 1000) return ONES[Math.floor(x / 100)] + ' Hundred ' + r(x % 100);
    if (x < 100000) return r(Math.floor(x / 1000)) + 'Thousand ' + r(x % 1000);
    if (x < 10000000) return r(Math.floor(x / 100000)) + 'Lakh ' + r(x % 100000);
    return r(Math.floor(x / 10000000)) + 'Crore ' + r(x % 10000000);
  };
  return r(Math.round(n)).trim() + ' Only';
}

// ─── Default state builders ───────────────────────────────────────────────────
function buildEarnings(annualCTC: number, lopDays: number, workingDays: number): SalaryRow[] {
  const monthly = annualCTC / 12;
  const lopFactor = workingDays > 0 ? Math.max(0, 1 - lopDays / workingDays) : 1;
  const basic = Math.round(monthly * 0.4 * lopFactor);
  const hra = Math.round(basic * 0.5);
  const transport = Math.round(1600 * lopFactor);
  const medical = Math.round(1250 * lopFactor);
  const special = Math.max(0, Math.round((monthly - monthly * 0.4 - Math.round(monthly * 0.4 * 0.5) - 1600 - 1250) * lopFactor));
  return [
    { id: 1, label: 'Basic Salary', val: basic },
    { id: 2, label: 'HRA', val: hra },
    { id: 3, label: 'Special Allowance', val: special },
    { id: 4, label: 'Transport Allowance', val: transport },
    { id: 5, label: 'Medical Allowance', val: medical },
  ];
}

function buildDeductions(annualCTC: number, basicMonthly: number, taxRegime: 'old' | 'new'): SalaryRow[] {
  const pf = Math.min(1800, Math.round(basicMonthly * 0.12));
  const pt = 200;
  let tds = 0;
  if (taxRegime === 'new') {
    tds = annualCTC > 1500000 ? Math.round((annualCTC - 1500000) * 0.30 / 12)
      : annualCTC > 1200000 ? Math.round((annualCTC - 1200000) * 0.20 / 12)
      : annualCTC > 900000 ? Math.round((annualCTC - 900000) * 0.15 / 12)
      : annualCTC > 600000 ? Math.round((annualCTC - 600000) * 0.10 / 12)
      : annualCTC > 300000 ? Math.round((annualCTC - 300000) * 0.05 / 12) : 0;
  } else {
    const taxable = annualCTC - 50000 - Math.min(basicMonthly * 12 * 0.5, 100000) - 150000;
    tds = taxable > 1000000 ? Math.round((taxable - 1000000) * 0.30 / 12)
      : taxable > 500000 ? Math.round((taxable - 500000) * 0.20 / 12)
      : taxable > 250000 ? Math.round((taxable - 250000) * 0.05 / 12) : 0;
  }
  return [
    { id: 1, label: 'Provident Fund (PF)', val: pf },
    { id: 2, label: 'Professional Tax', val: pt },
    { id: 3, label: 'Income Tax (TDS)', val: tds },
  ];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const SalarySlipGenerator = () => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Core inputs
  const [ctc, setCtc] = useState(1200000);
  const [taxRegime, setTaxRegime] = useState<'old' | 'new'>('new');
  const [lopDays, setLopDays] = useState(0);
  const [workingDays, setWorkingDays] = useState(26);
  const [presentDays, setPresentDays] = useState(26);

  const [emp, setEmp] = useState<EmpInfo>({
    name: 'Arjun Mehta', id: 'EMP-2025-042', role: 'Senior Software Engineer',
    department: 'Engineering', doj: '15/03/2022', pan: 'ABCDE1234F',
    uan: '100900123456', bank: 'HDFC Bank', ac: 'XXXXXXXX4521', location: 'Bangalore'
  });

  const [company, setCompany] = useState<CompanyInfo>({
    name: 'TechCorp Solutions Pvt. Ltd.',
    address: 'Prestige Tech Park, Whitefield, Bangalore – 560066',
    cin: 'U72200KA2020PTC123456',
    month: 'January 2026'
  });

  const [earnings, setEarnings] = useState<SalaryRow[]>(() => buildEarnings(1200000, 0, 26));
  const [deductions, setDeductions] = useState<SalaryRow[]>([]);
  const slipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const e = buildEarnings(1200000, 0, 26);
    const basic = e.find(r => r.label === 'Basic Salary')?.val ?? 0;
    setDeductions(buildDeductions(1200000, basic, 'new'));
  }, []);

  // Auto-recalculate when CTC / LOP / regime changes
  const recalculate = (newCtc: number, newLop: number, newWd: number, regime: 'old' | 'new') => {
    const e = buildEarnings(newCtc, newLop, newWd);
    setEarnings(e);
    const basic = e.find(r => r.label === 'Basic Salary')?.val ?? 0;
    setDeductions(buildDeductions(newCtc, basic, regime));
  };

  const clearAll = () => {
    const e = buildEarnings(1200000, 0, 26);
    const basic = e.find(r => r.label === 'Basic Salary')?.val ?? 0;
    setCtc(1200000); setLopDays(0); setWorkingDays(26); setPresentDays(26); setTaxRegime('new');
    setEarnings(e);
    setDeductions(buildDeductions(1200000, basic, 'new'));
    setEmp({ name: 'Arjun Mehta', id: 'EMP-2025-042', role: 'Senior Software Engineer', department: 'Engineering', doj: '15/03/2022', pan: 'ABCDE1234F', uan: '100900123456', bank: 'HDFC Bank', ac: 'XXXXXXXX4521', location: 'Bangalore' });
    setCompany({ name: 'TechCorp Solutions Pvt. Ltd.', address: 'Prestige Tech Park, Whitefield, Bangalore – 560066', cin: 'U72200KA2020PTC123456', month: 'January 2026' });
    showToast('Reset to defaults', 'success');
  };

  // ── Derived values ──────────────────────────────────────────────────────────
  const { totalEarn, totalDed, netPay, grossMonthly, lopAmt } = useMemo(() => {
    const grossMonthly = ctc / 12;
    const totalEarn = earnings.reduce((s, r) => s + Number(r.val), 0);
    const totalDed = deductions.reduce((s, r) => s + Number(r.val), 0);
    const netPay = totalEarn - totalDed;
    const lopAmt = workingDays > 0 ? Math.round((grossMonthly / workingDays) * lopDays) : 0;
    return { totalEarn, totalDed, netPay, grossMonthly, lopAmt };
  }, [earnings, deductions, ctc, lopDays, workingDays]);

  const fmt = (n: number) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  // ── Row helpers ─────────────────────────────────────────────────────────────
  const updateRow = (arr: SalaryRow[], setArr: (r: SalaryRow[]) => void, idx: number, field: 'label' | 'val', v: string) => {
    const n = [...arr];
    if (field === 'val') n[idx] = { ...n[idx], val: Number(v.replace(/[^0-9.]/g, '')) || 0 };
    else n[idx] = { ...n[idx], label: v };
    setArr(n);
  };
  const addRow = (arr: SalaryRow[], setArr: (r: SalaryRow[]) => void, label: string) => {
    setArr([...arr, { id: Date.now(), label, val: 0, editable: true }]);
  };
  const removeRow = (arr: SalaryRow[], setArr: (r: SalaryRow[]) => void, id: number) => {
    if (arr.length <= 1) return showToast('Need at least one row', 'error');
    setArr(arr.filter(r => r.id !== id));
  };

  // ── PDF download ────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!slipRef.current) return;
    if (!earnings.some(e => e.val > 0)) return showToast('Add at least one earning', 'error');
    setLoading(true);
    try {
      const canvas = await html2canvas(slipRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`Payslip_${emp.name.replace(/\s+/g, '_')}_${company.month.replace(/\s+/g, '_')}.pdf`);
      showToast('Payslip downloaded', 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || 'PDF generation failed', 'error');
      logger.error('PDF error:', err);
    } finally { setLoading(false); }
  };

  if (!mounted) return null;

  // ── KPI values ──────────────────────────────────────────────────────────────
  const kpis = [
    { label: 'Gross Monthly', val: `₹${fmt(grossMonthly)}`, sub: `CTC ₹${fmt(ctc)} p.a.`, color: 'text-blue-600' },
    { label: 'Total Earnings', val: `₹${fmt(totalEarn)}`, sub: `${presentDays}/${workingDays} days`, color: 'text-emerald-600' },
    { label: 'Total Deductions', val: `₹${fmt(totalDed)}`, sub: `LOP ₹${fmt(lopAmt)}`, color: 'text-rose-600' },
    { label: 'Net Pay (Take-Home)', val: `₹${fmt(netPay)}`, sub: taxRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime', color: 'text-violet-600' },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <Calculator size={18} className="text-blue-600" />
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Salary Slip Generator</span>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Tax Regime Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(['new', 'old'] as const).map(r => (
            <button key={r} onClick={() => { setTaxRegime(r); recalculate(ctc, lopDays, workingDays, r); }}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${taxRegime === r ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}>
              {r === 'new' ? 'New Regime' : 'Old Regime'}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all">
            <RefreshCw size={13} /> Reset
          </button>
          <button onClick={downloadPDF} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all disabled:opacity-50">
            <Download size={13} /> {loading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {kpis.map(k => (
          <div key={k.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className={`text-xl font-black mt-0.5 ${k.color}`}>{k.val}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-[340px] flex-shrink-0 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4 space-y-4">

            {/* Smart CTC + Attendance */}
            <section className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Calculator size={12} /> CTC & Attendance</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Annual CTC (₹)</label>
                  <input type="text" inputMode="numeric"
                    value={ctc === 0 ? '' : ctc}
                    onChange={e => { const v = Number(e.target.value.replace(/[^0-9]/g, '')) || 0; setCtc(v); recalculate(v, lopDays, workingDays, taxRegime); }}
                    className="w-full h-8 px-2 text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                    placeholder="e.g. 1200000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Working Days</label>
                  <input type="number" min={1} max={31} value={workingDays}
                    onChange={e => { const v = Number(e.target.value); setWorkingDays(v); recalculate(ctc, lopDays, v, taxRegime); }}
                    className="w-full h-8 px-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Present Days</label>
                  <input type="number" min={0} max={workingDays} value={presentDays}
                    onChange={e => { const v = Number(e.target.value); setPresentDays(v); const lop = Math.max(0, workingDays - v); setLopDays(lop); recalculate(ctc, lop, workingDays, taxRegime); }}
                    className="w-full h-8 px-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              {lopDays > 0 && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-lg">
                  <Info size={13} /> LOP: {lopDays} day{lopDays > 1 ? 's' : ''} = ₹{fmt(lopAmt)} deducted
                </div>
              )}
            </section>

            {/* Employee Details */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12} /> Employee</p>
              <div className="grid grid-cols-2 gap-2">
                <F label="Full Name" value={emp.name} onChange={v => setEmp({ ...emp, name: v })} className="col-span-2" />
                <F label="Emp ID" value={emp.id} onChange={v => setEmp({ ...emp, id: v })} />
                <F label="Designation" value={emp.role} onChange={v => setEmp({ ...emp, role: v })} />
                <F label="Department" value={emp.department} onChange={v => setEmp({ ...emp, department: v })} />
                <F label="Location" value={emp.location} onChange={v => setEmp({ ...emp, location: v })} />
                <F label="Date of Joining" value={emp.doj} onChange={v => setEmp({ ...emp, doj: v })} />
                <F label="Payslip Month" value={company.month} onChange={v => setCompany({ ...company, month: v })} />
              </div>
            </section>

            {/* Bank & Tax */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building size={12} /> Bank & Tax IDs</p>
              <div className="grid grid-cols-2 gap-2">
                <F label="PAN Number" value={emp.pan} onChange={v => setEmp({ ...emp, pan: v })} />
                <F label="UAN (PF)" value={emp.uan} onChange={v => setEmp({ ...emp, uan: v })} />
                <F label="Bank Name" value={emp.bank} onChange={v => setEmp({ ...emp, bank: v })} />
                <F label="Account No." value={emp.ac} onChange={v => setEmp({ ...emp, ac: v })} />
              </div>
            </section>

            {/* Company */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building size={12} /> Company</p>
              <F label="Company Name" value={company.name} onChange={v => setCompany({ ...company, name: v })} />
              <F label="Address" value={company.address} onChange={v => setCompany({ ...company, address: v })} />
              <F label="CIN / Registration" value={company.cin} onChange={v => setCompany({ ...company, cin: v })} />
            </section>

            {/* Earnings Editor */}
            <section className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Earnings</p>
                <button onClick={() => addRow(earnings, setEarnings, 'Other Allowance')}
                  className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-2 py-1 rounded">
                  <Plus size={11} /> Add
                </button>
              </div>
              <div className="space-y-1">
                {earnings.map((row, i) => (
                  <div key={row.id} className="flex items-center gap-1.5">
                    <input value={row.label} onChange={e => updateRow(earnings, setEarnings, i, 'label', e.target.value)}
                      className="flex-1 h-7 px-2 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-none" />
                    <input type="text" inputMode="numeric" value={row.val}
                      onChange={e => updateRow(earnings, setEarnings, i, 'val', e.target.value)}
                      className="w-20 h-7 px-2 text-[11px] text-right font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white outline-none" />
                    {row.editable && (
                      <button onClick={() => removeRow(earnings, setEarnings, row.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Deductions Editor */}
            <section className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 pb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Deductions</p>
                <button onClick={() => addRow(deductions, setDeductions, 'Other Deduction')}
                  className="flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-2 py-1 rounded">
                  <Plus size={11} /> Add
                </button>
              </div>
              <div className="space-y-1">
                {deductions.map((row, i) => (
                  <div key={row.id} className="flex items-center gap-1.5">
                    <input value={row.label} onChange={e => updateRow(deductions, setDeductions, i, 'label', e.target.value)}
                      className="flex-1 h-7 px-2 text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-300 outline-none" />
                    <input type="text" inputMode="numeric" value={row.val}
                      onChange={e => updateRow(deductions, setDeductions, i, 'val', e.target.value)}
                      className="w-20 h-7 px-2 text-[11px] text-right font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-white outline-none" />
                    {row.editable && (
                      <button onClick={() => removeRow(deductions, setDeductions, row.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>

        {/* ── RIGHT: PAYSLIP PREVIEW ── */}
        <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 flex justify-center py-6 px-4">
          <div className="shadow-2xl" style={{ width: 794 }}>
            <div ref={slipRef} className="bg-white text-slate-900" style={{ width: 794, minHeight: 1123, padding: '48px 56px', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>

              {/* Header */}
              <div style={{ borderBottom: '3px solid #1e293b', paddingBottom: 20, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: 1 }}>{company.name}</h1>
                    <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{company.address}</p>
                    {company.cin && <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>CIN: {company.cin}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-block', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 16px' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Payslip</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>{company.month}</p>
                    </div>
                    <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 6 }}>{taxRegime === 'new' ? '⚡ New Tax Regime' : '📋 Old Tax Regime'}</p>
                  </div>
                </div>
              </div>

              {/* Employee Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 40px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
                {[
                  ['Employee Name', emp.name],
                  ['Employee ID', emp.id],
                  ['Designation', emp.role],
                  ['Department', emp.department],
                  ['Date of Joining', emp.doj],
                  ['Location', emp.location],
                  ['PAN Number', emp.pan],
                  ['UAN (PF)', emp.uan],
                  ['Bank Name', emp.bank],
                  ['Account Number', emp.ac],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', padding: '6px 0', fontSize: 12 }}>
                    <span style={{ color: '#64748b', fontWeight: 600 }}>{k}</span>
                    <span style={{ color: '#0f172a', fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Attendance Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Working Days', val: workingDays },
                  { label: 'Days Present', val: presentDays },
                  { label: 'Loss of Pay (Days)', val: lopDays },
                  { label: 'LOP Amount', val: `₹${fmt(lopAmt)}` },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, margin: 0 }}>{label}</p>
                    <p style={{ fontSize: 16, fontWeight: 900, color: typeof val === 'number' && label.includes('LOP') && val > 0 ? '#e11d48' : '#0f172a', margin: '4px 0 0' }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Salary Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, border: '1px solid #e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ width: '50%', padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5, borderRight: '1px solid #e2e8f0' }}>Earnings</th>
                    <th style={{ width: '50%', padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: '#e11d48', textTransform: 'uppercase', letterSpacing: 0.5 }}>Deductions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.max(earnings.length, deductions.length) }).map((_, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ padding: '9px 14px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #f1f5f9' }}>
                        {earnings[i] && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#475569' }}>{earnings[i].label}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>₹{fmt(earnings[i].val)}</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
                        {deductions[i] && (
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#475569' }}>{deductions[i].label}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>₹{fmt(deductions[i].val)}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '10px 14px', borderRight: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Earnings</span>
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>₹{fmt(totalEarn)}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total Deductions</span>
                        <span style={{ fontSize: 16, fontWeight: 900, color: '#e11d48' }}>₹{fmt(totalDed)}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Net Pay Banner */}
              <div style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, margin: 0 }}>Net Salary Payable</p>
                  <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 6, fontStyle: 'italic' }}>Rupees {numWords(netPay)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: -1 }}>₹{fmt(netPay)}</p>
                  <p style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Via {emp.bank} · A/C {emp.ac}</p>
                </div>
              </div>

              {/* CTC Breakdown */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px 20px', marginBottom: 24, background: '#f8fafc' }}>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 12px' }}>CTC Breakdown (Annualised)</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {[
                    { label: 'Annual CTC', val: ctc },
                    { label: 'Gross Monthly', val: Math.round(grossMonthly) },
                    { label: 'Monthly Net', val: netPay },
                    { label: 'Annual PF (Employer)', val: Math.min(1800, Math.round((earnings.find(r => r.label === 'Basic Salary')?.val ?? 0) * 0.12)) * 12 },
                    { label: 'Annual TDS', val: (deductions.find(r => r.label.includes('TDS'))?.val ?? 0) * 12 },
                    { label: 'Effective Tax Rate', val: `${ctc > 0 ? ((deductions.find(r => r.label.includes('TDS'))?.val ?? 0) * 12 / ctc * 100).toFixed(1) : 0}%` },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ textAlign: 'center', padding: '8px 4px' }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.3, margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '3px 0 0' }}>
                        {typeof val === 'string' ? val : `₹${fmt(val)}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, textAlign: 'center', marginTop: 'auto' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>This is a computer-generated payslip and does not require a signature.</p>
                <p style={{ fontSize: 9, color: '#cbd5e1', marginTop: 4 }}>Generated by OneTool Enterprise · {company.month}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

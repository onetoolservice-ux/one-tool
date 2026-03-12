"use client";
import React, { useState, useMemo } from 'react';
import { FileCheck, CheckCircle2, Circle, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

type IncomeType = 'salary' | 'freelance' | 'business' | 'capital_gains' | 'rental' | 'agriculture' | 'foreign';
type DocStatus = 'have' | 'need' | 'na';

interface DocItem {
  id: string;
  doc: string;
  hint?: string;
  types: IncomeType[];
}

const ALL_DOCS: DocItem[] = [
  // Universal
  { id: 'pan', doc: 'PAN Card', hint: 'Mandatory for all filers', types: ['salary', 'freelance', 'business', 'capital_gains', 'rental', 'agriculture', 'foreign'] },
  { id: 'aadhaar', doc: 'Aadhaar Card', hint: 'Linked to PAN for e-verification', types: ['salary', 'freelance', 'business', 'capital_gains', 'rental', 'agriculture', 'foreign'] },
  { id: 'bankstmt', doc: 'Bank Account Statements (full year)', hint: 'All savings/current accounts', types: ['salary', 'freelance', 'business', 'capital_gains', 'rental', 'agriculture', 'foreign'] },

  // Salary
  { id: 'form16', doc: 'Form 16 (from employer)', hint: 'Part A + Part B, mandatory for salaried', types: ['salary'] },
  { id: 'salary_slip', doc: 'Last 3 Salary Slips', hint: 'To verify income & deductions', types: ['salary'] },
  { id: 'form12bb', doc: 'Form 12BB (investment declaration)', hint: 'Submitted to employer', types: ['salary'] },
  { id: 'prev_employer_form16', doc: 'Form 16 from previous employer(s)', hint: 'If changed jobs during the FY', types: ['salary'] },

  // Freelance / Business
  { id: 'invoice_register', doc: 'Invoice Register / Sales Records', hint: 'All GST invoices raised', types: ['freelance', 'business'] },
  { id: 'tds_certs', doc: 'TDS Certificates (Form 16A)', hint: 'From clients who deducted TDS', types: ['freelance', 'business'] },
  { id: 'expense_receipts', doc: 'Business Expense Receipts', hint: 'Internet, equipment, office, etc.', types: ['freelance', 'business'] },
  { id: 'gst_returns', doc: 'GSTR-3B / GSTR-1 Filings', hint: 'If GST registered', types: ['business'] },
  { id: 'books_of_accounts', doc: 'Books of Accounts / P&L Statement', hint: 'Required if turnover > ₹1 Cr', types: ['business'] },
  { id: 'balance_sheet', doc: 'Balance Sheet (if applicable)', hint: 'For businesses requiring audit', types: ['business'] },

  // Capital Gains
  { id: 'brokerledger', doc: 'Broker Trade Statement (full year)', hint: 'From Zerodha / Groww / ICICI / etc.', types: ['capital_gains'] },
  { id: 'capital_gain_stmt', doc: 'Capital Gains Statement', hint: 'Download from broker / CDSL / NSDL', types: ['capital_gains'] },
  { id: 'mf_statement', doc: 'Mutual Fund Statement (CAMS/Karvy)', hint: 'LTCG/STCG from redemptions', types: ['capital_gains'] },
  { id: 'property_sale_deed', doc: 'Property Sale Deed & Purchase Deed', hint: 'For capital gains on property sale', types: ['capital_gains'] },
  { id: 'indexed_cost', doc: 'Cost Inflation Index for Property', hint: 'For LTCG calculation on property', types: ['capital_gains'] },

  // Rental Income
  { id: 'rent_agreement', doc: 'Rent Agreement', hint: 'With tenant details', types: ['rental'] },
  { id: 'home_loan_cert', doc: 'Home Loan Interest Certificate', hint: 'From bank — Sec 24(b) deduction', types: ['rental'] },
  { id: 'property_tax_receipt', doc: 'Property Tax Receipts', hint: 'Deductible from rental income', types: ['rental'] },
  { id: 'municipal_valuation', doc: 'Municipal Valuation / Standard Rent', hint: 'For computing annual value', types: ['rental'] },

  // Deductions (applies to salary + others)
  { id: 'ppf_passbook', doc: 'PPF Passbook / Deposit Receipt', hint: 'For 80C deduction', types: ['salary', 'freelance', 'business', 'rental'] },
  { id: 'elss_stmts', doc: 'ELSS Investment Statements', hint: '80C — equity linked savings scheme', types: ['salary', 'freelance', 'business', 'rental'] },
  { id: 'insurance_premium', doc: 'Life & Health Insurance Receipts', hint: '80C (life) + 80D (health)', types: ['salary', 'freelance', 'business', 'rental'] },
  { id: 'nps_stmt', doc: 'NPS Contribution Statement', hint: '80CCD(1B) — extra ₹50K benefit', types: ['salary', 'freelance', 'business', 'rental'] },
  { id: 'hra_receipts', doc: 'Rent Receipts (if HRA claimed)', hint: 'With PAN of landlord if rent > ₹1L/yr', types: ['salary'] },
  { id: 'home_loan_principal', doc: 'Home Loan Principal Certificate', hint: '80C — principal repayment', types: ['salary', 'freelance', 'business'] },
  { id: 'children_tuition', doc: 'Children Tuition Fee Receipts', hint: '80C — full-time school/college, 2 children', types: ['salary', 'freelance', 'business', 'rental'] },
  { id: 'education_loan_cert', doc: 'Education Loan Interest Certificate', hint: '80E — deduction on interest paid', types: ['salary', 'freelance', 'business'] },
  { id: 'donation_receipts', doc: 'Donation Receipts (80G)', hint: 'With 80G registration number of NGO', types: ['salary', 'freelance', 'business', 'rental'] },

  // Foreign income
  { id: 'foreign_income', doc: 'Foreign Income Documents', hint: 'Form 67 if foreign tax credit claimed', types: ['foreign'] },
  { id: 'dtaa_docs', doc: 'DTAA Certificate (Form 10F)', hint: 'If claiming treaty benefits', types: ['foreign'] },
];

const INCOME_LABELS: Record<IncomeType, string> = {
  salary: 'Salary / Job',
  freelance: 'Freelance / Consulting',
  business: 'Business',
  capital_gains: 'Capital Gains (Stocks/MF/Property)',
  rental: 'Rental Income',
  agriculture: 'Agricultural Income',
  foreign: 'Foreign Income / NRI',
};

const FORM_GUIDE: Record<string, { form: string; who: string }> = {
  salary_only: { form: 'ITR-1 (Sahaj)', who: 'Salaried + one house + income ≤ ₹50L, no capital gains' },
  salary_cg: { form: 'ITR-2', who: 'Salaried + capital gains or multiple properties or foreign income' },
  business_presumptive: { form: 'ITR-4 (Sugam)', who: 'Freelance / business with presumptive income ≤ ₹50L (44ADA) or ₹3Cr (44AD)' },
  business_regular: { form: 'ITR-3', who: 'Business / profession with detailed accounting, F&O trading, audit required' },
};

export const ITRChecklist = () => {
  const [selectedTypes, setSelectedTypes] = useState<Set<IncomeType>>(new Set(['salary']));
  const [docStatus, setDocStatus] = useState<Record<string, DocStatus>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['universal', 'deductions']));

  const toggleType = (t: IncomeType) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  };

  const setStatus = (id: string, s: DocStatus) => {
    setDocStatus(prev => ({ ...prev, [id]: s }));
  };

  const relevantDocs = useMemo(() => {
    return ALL_DOCS.filter(d => d.types.some(t => selectedTypes.has(t)));
  }, [selectedTypes]);

  const stats = useMemo(() => {
    const total = relevantDocs.length;
    const have = relevantDocs.filter(d => docStatus[d.id] === 'have').length;
    const need = relevantDocs.filter(d => docStatus[d.id] === 'need').length;
    const na = relevantDocs.filter(d => docStatus[d.id] === 'na').length;
    const pending = total - have - need - na;
    return { total, have, need, na, pending };
  }, [relevantDocs, docStatus]);

  const recommendedForm = useMemo(() => {
    const has = (t: IncomeType) => selectedTypes.has(t);
    if (has('business') || has('freelance')) {
      // Check if can use 44ADA / 44AD
      return FORM_GUIDE.business_presumptive;
    }
    if (has('capital_gains') || has('foreign') || has('rental')) return FORM_GUIDE.salary_cg;
    return FORM_GUIDE.salary_only;
  }, [selectedTypes]);

  const sections = useMemo(() => {
    const groups: Record<string, { label: string; docs: DocItem[] }> = {
      universal: { label: 'Universal (All Filers)', docs: relevantDocs.filter(d => d.types.length === 7) },
      income: { label: 'Income Documents', docs: relevantDocs.filter(d => ['form16', 'salary_slip', 'form12bb', 'prev_employer_form16', 'invoice_register', 'tds_certs', 'expense_receipts', 'gst_returns', 'books_of_accounts', 'balance_sheet', 'foreign_income', 'dtaa_docs'].includes(d.id)) },
      capital: { label: 'Capital Gains & Property', docs: relevantDocs.filter(d => ['brokerledger', 'capital_gain_stmt', 'mf_statement', 'property_sale_deed', 'indexed_cost'].includes(d.id)) },
      rental: { label: 'Rental Income', docs: relevantDocs.filter(d => ['rent_agreement', 'home_loan_cert', 'property_tax_receipt', 'municipal_valuation'].includes(d.id)) },
      deductions: { label: 'Deduction Documents', docs: relevantDocs.filter(d => ['ppf_passbook', 'elss_stmts', 'insurance_premium', 'nps_stmt', 'hra_receipts', 'home_loan_principal', 'children_tuition', 'education_loan_cert', 'donation_receipts'].includes(d.id)) },
    };
    return Object.entries(groups).filter(([, g]) => g.docs.length > 0);
  }, [relevantDocs]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const statusColors: Record<DocStatus, string> = {
    have: 'bg-emerald-500 text-white',
    need: 'bg-amber-500 text-white',
    na: 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300',
  };

  return (
    <div>
      <SAPHeader
        fullWidth
        title="ITR Filing Checklist"
        subtitle="FY 2024-25 · Track all documents before filing"
        kpis={[
          { label: 'Total Documents', value: String(stats.total), color: 'neutral', subtitle: 'Required for your income' },
          { label: 'Have', value: String(stats.have), color: 'success', subtitle: 'Ready to file' },
          { label: 'Need to Find', value: String(stats.need), color: 'warning', subtitle: 'Action required' },
          { label: 'Pending Review', value: String(stats.pending), color: 'error', subtitle: 'Not yet reviewed' },
        ]}
      />

      <div className="p-4 space-y-4">
        {/* Income Type Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select Your Income Types</h2>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(INCOME_LABELS) as [IncomeType, string][]).map(([key, label]) => (
              <button key={key} onClick={() => toggleType(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedTypes.has(key)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Form */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 flex gap-3">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Recommended Form: {recommendedForm.form}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{recommendedForm.who}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Readiness: {stats.total > 0 ? Math.round((stats.have / stats.total) * 100) : 0}%</span>
            <span>{stats.have}/{stats.total} documents ready</span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${stats.total > 0 ? (stats.have / stats.total) * 100 : 0}%` }} />
            <div className="bg-amber-400 h-full transition-all" style={{ width: `${stats.total > 0 ? (stats.need / stats.total) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Document Sections */}
        <div className="space-y-3">
          {sections.map(([key, group]) => (
            <div key={key} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <button onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between p-4 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <span className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-blue-500" />
                  {group.label}
                  <span className="text-xs font-normal text-slate-400">({group.docs.filter(d => docStatus[d.id] === 'have').length}/{group.docs.length})</span>
                </span>
                {expandedSections.has(key) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSections.has(key) && (
                <div className="border-t border-slate-100 dark:border-slate-700">
                  {group.docs.map((doc, i) => (
                    <div key={doc.id} className={`flex items-start gap-3 px-4 py-3 ${i < group.docs.length - 1 ? 'border-b border-slate-50 dark:border-slate-800' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{doc.doc}</div>
                        {doc.hint && <div className="text-xs text-slate-400 mt-0.5">{doc.hint}</div>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {(['have', 'need', 'na'] as DocStatus[]).map(s => (
                          <button key={s} onClick={() => setStatus(doc.id, docStatus[doc.id] === s ? 'have' : s)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all ${docStatus[doc.id] === s ? statusColors[s] : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-600 hover:border-slate-300'}`}>
                            {s === 'have' ? '✓ Have' : s === 'need' ? '! Need' : 'N/A'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This checklist is for FY 2024-25 (AY 2025-26). ITR filing deadline for salaried individuals is July 31, 2025. For audited businesses, October 31, 2025. Consult a CA for complex cases (foreign income, F&O, audit requirement).
          </p>
        </div>
      </div>
    </div>
  );
};

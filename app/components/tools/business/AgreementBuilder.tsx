"use client";
import React, { useState, useMemo, useRef } from 'react';
import { FileText, Download, Copy, RefreshCw, ChevronDown, CheckCircle, Edit3 } from 'lucide-react';
import jsPDF from 'jspdf';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { logger } from '@/app/lib/utils/logger';

// ─── Template types ───────────────────────────────────────────────────────────
type TemplateKey = 'nda' | 'employment' | 'freelance' | 'rental' | 'consulting' | 'mou';

interface AgreementData {
  partyA: string;
  partyAAddress: string;
  partyB: string;
  partyBAddress: string;
  date: string;
  location: string;
  amount: string;
  service: string;
  role: string;
  duration: string;
  noticePeriod: string;
  propertyAddress: string;
  rentDeposit: string;
  purpose: string;
}

interface Template {
  label: string;
  icon: string;
  buildContent: (d: AgreementData) => string;
}

// ─── Format date for display ──────────────────────────────────────────────────
function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch { return iso; }
}

// ─── Template registry ────────────────────────────────────────────────────────
const TEMPLATES: Record<TemplateKey, Template> = {
  nda: {
    label: 'Non-Disclosure Agreement',
    icon: '🔒',
    buildContent: (d) => `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of ${fmtDate(d.date)}, by and between:

DISCLOSING PARTY:
${d.partyA}
${d.partyAAddress}
(hereinafter referred to as "Disclosing Party")

AND

RECEIVING PARTY:
${d.partyB}
${d.partyBAddress}
(hereinafter referred to as "Receiving Party")

RECITALS

WHEREAS, the Disclosing Party possesses certain confidential and proprietary technical and business information ("Confidential Information") relating to its business operations, trade secrets, and intellectual property; and

WHEREAS, the Receiving Party desires to receive Confidential Information for the purposes of evaluating a potential business relationship between the Parties;

NOW, THEREFORE, in consideration of the mutual covenants and agreements set forth herein, the Parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any and all technical and non-technical information including, but not limited to, patent, copyright, trade secret, and proprietary information, techniques, sketches, drawings, models, inventions, know-how, processes, apparatus, equipment, algorithms, software programs, software source documents, formulae, and product data.

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to: (a) hold and maintain the Confidential Information in strictest confidence; (b) not to disclose the Confidential Information to any third parties without prior written consent of the Disclosing Party; (c) use the Confidential Information solely for the purpose of evaluating the potential business relationship.

3. EXCLUSIONS
This Agreement imposes no obligation upon the Receiving Party with respect to Confidential Information that: (a) was known to the Receiving Party prior to disclosure; (b) becomes publicly known through no breach by the Receiving Party; (c) is independently developed by the Receiving Party without use of Confidential Information.

4. TERM
This Agreement shall remain in full force and effect for a period of ${d.duration || '2 years'} from the date of execution.

5. GOVERNING LAW
This Agreement shall be governed by the laws of ${d.location || 'India'}, and any dispute shall be subject to the exclusive jurisdiction of courts in ${d.location || 'Bangalore, India'}.

6. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, warranties, and understandings.`,
  },

  employment: {
    label: 'Employment Offer Letter',
    icon: '💼',
    buildContent: (d) => `EMPLOYMENT OFFER LETTER

Date: ${fmtDate(d.date)}

To,
${d.partyB}
${d.partyBAddress}

Subject: Offer of Employment — ${d.role || 'Position'}

Dear ${d.partyB.split(' ')[0] || 'Candidate'},

We at ${d.partyA} are pleased to extend this formal offer of employment for the position of "${d.role || 'Position'}" effective from a mutually agreed date.

1. POSITION & REPORTING
You will be designated as "${d.role || 'Position'}" and shall report to the designated manager/supervisor as assigned by the Management.

2. COMPENSATION
Your total Cost to Company (CTC) will be INR ${d.amount || '—'} per annum. The detailed breakup of your compensation package will be provided in the appointment letter.

3. PLACE OF WORK
Your place of primary work will be ${d.location || '—'}. You may be required to travel or work from other locations as per business requirements.

4. PROBATION
You will be on a probation period of 3 (three) months from your date of joining. The company reserves the right to extend the probation period at its discretion.

5. NOTICE PERIOD
Upon confirmation, the notice period shall be ${d.noticePeriod || '60 days'} on either side.

6. CONFIDENTIALITY
You shall maintain strict confidentiality regarding all business, technical, financial and other information relating to the Company's operations.

7. ACCEPTANCE
This offer is conditional upon successful completion of pre-employment formalities. Please confirm your acceptance by signing below.

We look forward to welcoming you to the ${d.partyA} family.

Warm regards,

HR Department
${d.partyA}
${d.partyAAddress}`,
  },

  freelance: {
    label: 'Freelance Service Agreement',
    icon: '🤝',
    buildContent: (d) => `FREELANCE SERVICE AGREEMENT

This Freelance Service Agreement ("Agreement") is entered into as of ${fmtDate(d.date)}, between:

CLIENT: ${d.partyA}, ${d.partyAAddress} ("Client")
CONTRACTOR: ${d.partyB}, ${d.partyBAddress} ("Contractor")

1. SCOPE OF SERVICES
Contractor agrees to provide the following services to Client: ${d.service || 'Professional Services'} (the "Services"). A detailed scope document may be attached as Schedule A.

2. TERM
This Agreement commences on ${fmtDate(d.date)} and shall continue for ${d.duration || '3 months'}, unless terminated earlier in accordance with this Agreement.

3. COMPENSATION
(a) Client agrees to pay Contractor a total project fee of INR ${d.amount || '—'}.
(b) Payment shall be made as mutually agreed in the payment schedule.
(c) In case of additional scope, a Change Order shall be agreed in writing.

4. INDEPENDENT CONTRACTOR
Contractor is an independent contractor. Nothing in this Agreement shall be construed as creating an employer-employee relationship, partnership, or joint venture.

5. INTELLECTUAL PROPERTY
All work product, deliverables, and intellectual property created by Contractor under this Agreement shall be the exclusive property of Client upon full payment of fees.

6. CONFIDENTIALITY
Each party agrees to maintain the confidentiality of the other party's proprietary information during and after the term of this Agreement.

7. TERMINATION
Either party may terminate this Agreement with ${d.noticePeriod || '14 days'} written notice. Client shall compensate Contractor for all work completed up to the termination date.

8. GOVERNING LAW
This Agreement shall be governed by the laws of ${d.location || 'India'}.`,
  },

  rental: {
    label: 'Rent / Lease Agreement',
    icon: '🏠',
    buildContent: (d) => `RESIDENTIAL RENTAL AGREEMENT

This Rental Agreement ("Agreement") is entered into on ${fmtDate(d.date)}, between:

LANDLORD: ${d.partyA}, ${d.partyAAddress} ("Landlord")
TENANT: ${d.partyB}, ${d.partyBAddress} ("Tenant")

1. PROPERTY
The Landlord hereby leases to the Tenant the premises located at: ${d.propertyAddress || d.location || '—'} ("Premises").

2. TERM
This tenancy shall commence on ${fmtDate(d.date)} and continue on a month-to-month basis unless terminated by either party with 30 days' written notice.

3. RENT
(a) Monthly Rent: INR ${d.amount || '—'} per month, payable on or before the 5th of each month.
(b) Rent shall be paid via ${d.service || 'Bank Transfer / UPI'}.

4. SECURITY DEPOSIT
Tenant shall pay a refundable security deposit of INR ${d.rentDeposit || '—'} at the time of signing this Agreement.

5. USE OF PREMISES
The Premises shall be used solely for residential purposes. Tenant shall not sublet, assign, or transfer this Agreement without prior written consent of Landlord.

6. MAINTENANCE
Tenant shall maintain the Premises in clean and good condition and shall be responsible for minor repairs. Major structural repairs shall be the Landlord's responsibility.

7. UTILITIES
Tenant shall be responsible for electricity, water, and other utility charges unless otherwise agreed.

8. TERMINATION
Either party may terminate this Agreement with ${d.noticePeriod || '30 days'} prior written notice.

9. GOVERNING LAW
This Agreement shall be governed by the laws applicable in ${d.location || 'India'} and the applicable Rent Control legislation.`,
  },

  consulting: {
    label: 'Consulting Agreement',
    icon: '📊',
    buildContent: (d) => `CONSULTING AGREEMENT

This Consulting Agreement ("Agreement") is entered into as of ${fmtDate(d.date)}, between:

CLIENT: ${d.partyA}, ${d.partyAAddress} ("Client")
CONSULTANT: ${d.partyB}, ${d.partyBAddress} ("Consultant")

1. CONSULTING SERVICES
Consultant agrees to provide consulting services in the area of: ${d.service || 'Business & Technology Consulting'}. Specific deliverables shall be agreed in a Statement of Work ("SOW").

2. FEES & PAYMENT
Client agrees to pay Consultant a retainer / project fee of INR ${d.amount || '—'} for the engagement period. Invoices shall be raised monthly / milestone-based as per SOW.

3. TERM
This Agreement shall be effective from ${fmtDate(d.date)} for a period of ${d.duration || '6 months'}, unless terminated earlier.

4. INDEPENDENT CONTRACTOR
Consultant is engaged as an independent contractor. Consultant shall not represent themselves as an employee, agent, or partner of Client.

5. INTELLECTUAL PROPERTY
Deliverables created specifically for Client shall be Client's property upon payment. Consultant retains rights to generic methodologies, tools, and pre-existing IP.

6. NON-SOLICITATION
During the term and for 12 months thereafter, Consultant shall not solicit Client's employees or key clients for competing engagements.

7. LIMITATION OF LIABILITY
In no event shall either party's liability exceed the total fees paid under this Agreement.

8. CONFIDENTIALITY
Both parties agree to keep confidential all non-public information exchanged under this Agreement for a period of 2 years post-termination.

9. GOVERNING LAW
This Agreement shall be governed by the laws of ${d.location || 'India'}.`,
  },

  mou: {
    label: 'Memorandum of Understanding',
    icon: '📋',
    buildContent: (d) => `MEMORANDUM OF UNDERSTANDING (MOU)

This Memorandum of Understanding ("MOU") is entered into on ${fmtDate(d.date)}, between:

PARTY A: ${d.partyA}, ${d.partyAAddress}
PARTY B: ${d.partyB}, ${d.partyBAddress}

BACKGROUND & PURPOSE
${d.partyA} and ${d.partyB} (collectively the "Parties") wish to record their mutual understanding and intent to collaborate on: ${d.purpose || d.service || '—'}.

1. SCOPE OF COLLABORATION
The Parties intend to collaborate in the following areas:
(a) ${d.service || 'Joint development and knowledge sharing'}
(b) Sharing of resources, expertise, and best practices
(c) Joint promotional activities as mutually agreed

2. TERM
This MOU shall be effective from ${fmtDate(d.date)} for a period of ${d.duration || '1 year'}, renewable by mutual written consent.

3. FINANCIAL ARRANGEMENTS
${d.amount && d.amount !== '—' ? `The Parties agree to contribute / share resources valued at approximately INR ${d.amount} for the collaboration.` : 'Each Party shall bear its own costs unless otherwise agreed in writing.'}

4. RESPONSIBILITIES
Each Party shall designate a point of contact responsible for implementation of activities under this MOU.

5. NON-BINDING NATURE
This MOU is intended to record the mutual intent and understanding of the Parties. It does not create legally binding obligations except for the confidentiality and governing law provisions.

6. CONFIDENTIALITY
The Parties agree to keep confidential all information shared during the collaboration period.

7. GOVERNING LAW & DISPUTE RESOLUTION
This MOU shall be governed by the laws of ${d.location || 'India'}. Any disputes shall be resolved through good-faith negotiation and, if necessary, arbitration.`,
  },
};

// ─── Main component ───────────────────────────────────────────────────────────
export const AgreementBuilder = () => {
  const [templateKey, setTemplateKey] = useState<TemplateKey>('nda');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const [data, setData] = useState<AgreementData>({
    partyA: 'TechCorp Solutions Pvt. Ltd.',
    partyAAddress: 'Prestige Tech Park, Bangalore – 560066',
    partyB: 'Arjun Mehta',
    partyBAddress: '402, Green Valley, Koramangala, Bangalore – 560034',
    date: today,
    location: 'Bangalore, Karnataka, India',
    amount: '1,50,000',
    service: 'Software Development',
    role: 'Senior Software Engineer',
    duration: '12 months',
    noticePeriod: '60 days',
    propertyAddress: 'Flat 402, Green Valley Apartments, Koramangala, Bangalore',
    rentDeposit: '55,500',
    purpose: 'Joint product development and technology partnership',
  });

  const set = (k: keyof AgreementData, v: string) => setData(prev => ({ ...prev, [k]: v }));

  const content = useMemo(() => TEMPLATES[templateKey].buildContent(data), [templateKey, data]);

  const copyText = () => {
    navigator.clipboard.writeText(TEMPLATES[templateKey].label + '\n\n' + content)
      .then(() => showToast('Copied to clipboard', 'success'))
      .catch(() => showToast('Copy failed', 'error'));
  };

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const margin = 20;
      const lineH = 6;
      let y = margin;

      // Title
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text(TEMPLATES[templateKey].label.toUpperCase(), pw / 2, y, { align: 'center' });
      y += 8;
      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pw - margin, y);
      y += 8;

      // Body
      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);
      const lines = doc.splitTextToSize(content, pw - margin * 2);
      for (const line of lines) {
        if (y + lineH > ph - margin - 20) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineH;
      }

      // Signature block
      y += 12;
      if (y + 40 > ph - margin) { doc.addPage(); y = margin; }
      doc.line(margin, y, margin + 60, y);
      doc.line(pw - margin - 60, y, pw - margin, y);
      y += 5;
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.text(data.partyA, margin, y);
      doc.text(data.partyB, pw - margin, y, { align: 'right' });
      y += 4;
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Authorised Signatory', margin, y);
      doc.text('Signature', pw - margin, y, { align: 'right' });

      // Footer on all pages
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(`Generated by OneTool Enterprise · ${fmtDate(today)} · Page ${p} of ${totalPages}`, pw / 2, ph - 8, { align: 'center' });
      }

      doc.save(`${templateKey}_agreement_${data.partyA.replace(/\s+/g, '_')}.pdf`);
      showToast('Agreement PDF downloaded', 'success');
    } catch (err) {
      showToast(getErrorMessage(err) || 'PDF generation failed', 'error');
      logger.error('PDF error:', err);
    } finally { setLoading(false); }
  };

  const F = ({ label, value, onChange, placeholder = '', textarea = false }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean
  }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} placeholder={placeholder}
            className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white resize-none" />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full h-8 px-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
      }
    </div>
  );

  const isRental = templateKey === 'rental';
  const isOffer = templateKey === 'employment';
  const isMou = templateKey === 'mou';
  const showAmount = templateKey !== 'nda';
  const showService = ['freelance', 'consulting', 'mou'].includes(templateKey);
  const showRole = templateKey === 'employment';
  const showDuration = ['nda', 'freelance', 'consulting', 'mou', 'rental'].includes(templateKey);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-y-1">
        <FileText size={18} className="text-blue-600" />
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Agreement Builder</span>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Template selector */}
        <div className="relative">
          <select value={templateKey} onChange={e => setTemplateKey(e.target.value as TemplateKey)}
            className="appearance-none pl-3 pr-8 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer text-slate-700 dark:text-slate-200">
            {(Object.keys(TEMPLATES) as TemplateKey[]).map(k => (
              <option key={k} value={k}>{TEMPLATES[k].icon} {TEMPLATES[k].label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={copyText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
            <Copy size={13} /> Copy
          </button>
          <button onClick={downloadPDF} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all disabled:opacity-50">
            <Download size={13} /> {loading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="flex-shrink-0 flex items-center gap-4 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <span className="font-bold text-slate-700 dark:text-slate-300">{TEMPLATES[templateKey].icon} {TEMPLATES[templateKey].label}</span>
        <span>·</span>
        <span>{data.partyA}</span>
        <span>↔</span>
        <span>{data.partyB}</span>
        <span>·</span>
        <span>{fmtDate(data.date)}</span>
        {showAmount && data.amount && <><span>·</span><span className="text-emerald-600 font-bold">₹{data.amount}</span></>}
        {showDuration && data.duration && <><span>·</span><span>{data.duration}</span></>}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-[300px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4 space-y-3">

            {/* Core fields – always shown */}
            <section className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parties</p>
              <F label="Party A (Company / Org)" value={data.partyA} onChange={v => set('partyA', v)} />
              <F label="Party A Address" value={data.partyAAddress} onChange={v => set('partyAAddress', v)} textarea />
              <F label="Party B (Person / Org)" value={data.partyB} onChange={v => set('partyB', v)} />
              <F label="Party B Address" value={data.partyBAddress} onChange={v => set('partyBAddress', v)} textarea />
            </section>

            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Agreement Details</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Date</label>
                  <input type="date" value={data.date} onChange={e => set('date', e.target.value)}
                    className="w-full h-8 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                </div>
                {showDuration && <F label="Duration" value={data.duration} onChange={v => set('duration', v)} placeholder="12 months" />}
              </div>
              <F label="Jurisdiction / Location" value={data.location} onChange={v => set('location', v)} />
              {showAmount && <F label="Amount / Fee (₹)" value={data.amount} onChange={v => set('amount', v)} placeholder="1,50,000" />}
              {showService && <F label="Service / Purpose" value={data.service} onChange={v => set('service', v)} />}
              {showRole && <F label="Role / Position" value={data.role} onChange={v => set('role', v)} />}
              {(isOffer || ['freelance', 'consulting'].includes(templateKey)) && (
                <F label="Notice Period" value={data.noticePeriod} onChange={v => set('noticePeriod', v)} placeholder="30 days" />
              )}
              {isRental && (
                <>
                  <F label="Property Address" value={data.propertyAddress} onChange={v => set('propertyAddress', v)} textarea />
                  <F label="Security Deposit (₹)" value={data.rentDeposit} onChange={v => set('rentDeposit', v)} placeholder="2 months rent" />
                  <F label="Payment Mode" value={data.service} onChange={v => set('service', v)} placeholder="NEFT / UPI / Cheque" />
                </>
              )}
              {isMou && <F label="Purpose / Collaboration Area" value={data.purpose} onChange={v => set('purpose', v)} textarea />}
            </section>

            <div className="pt-2 pb-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Edit3 size={13} className="text-blue-600 flex-shrink-0" />
                <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed">
                  The agreement text on the right updates live as you edit the fields. You can also directly edit the text in the preview.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── RIGHT: DOCUMENT PREVIEW ── */}
        <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 flex justify-center py-6 px-4">
          <div style={{ width: 720 }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {TEMPLATES[templateKey].icon} {TEMPLATES[templateKey].label}
              </span>
              <span className="text-xs text-slate-400">{fmtDate(data.date)} · {data.location}</span>
            </div>

            {/* Document */}
            <div className="bg-white shadow-2xl" style={{ padding: '60px 64px', minHeight: 1056, fontFamily: 'Georgia, serif' }}>
              {/* Title */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: 16, marginBottom: 32 }}>
                <h1 style={{ fontSize: 17, fontWeight: 900, letterSpacing: 2, textTransform: 'uppercase', margin: 0, color: '#0f172a' }}>
                  {TEMPLATES[templateKey].label.toUpperCase()}
                </h1>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>Dated: {fmtDate(data.date)}</p>
              </div>

              {/* Editable content */}
              <textarea
                value={content}
                readOnly
                style={{
                  width: '100%', border: 'none', outline: 'none', resize: 'none',
                  fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.9, color: '#1e293b',
                  background: 'transparent', whiteSpace: 'pre-wrap', minHeight: 700
                }}
              />

              {/* Signature Block */}
              <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, borderTop: '1px solid #e2e8f0', paddingTop: 24 }}>
                {[{ name: data.partyA, label: 'Authorised Signatory' }, { name: data.partyB, label: 'Signature / Acceptance' }].map(sig => (
                  <div key={sig.name} style={{ textAlign: 'center' }}>
                    <div style={{ height: 48, borderBottom: '1.5px solid #0f172a', marginBottom: 6 }} />
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', margin: 0 }}>{sig.name}</p>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: '3px 0 0', textTransform: 'uppercase', letterSpacing: 1 }}>{sig.label}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ marginTop: 32, textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                <p style={{ fontSize: 9, color: '#cbd5e1', fontFamily: 'Arial, sans-serif' }}>Generated by OneTool Enterprise · {fmtDate(today)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

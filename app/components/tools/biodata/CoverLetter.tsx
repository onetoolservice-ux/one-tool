"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, RefreshCw, Mail, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showToast } from '@/app/shared/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'form' | 'gallery';
type CLTemplate = 'professional' | 'modern' | 'minimal';

interface SenderInfo {
  name: string; title: string; address: string; phone: string; email: string;
}

interface RecipientInfo {
  company: string; contactName: string; contactTitle: string; companyAddress: string;
}

interface LetterContent {
  date: string; subject: string;
  intro: string; body: string; motivation: string; closing: string;
}

interface CLData {
  sender: SenderInfo;
  recipient: RecipientInfo;
  letter: LetterContent;
}

const TEMPLATES: { id: CLTemplate; name: string }[] = [
  { id: 'professional', name: 'Professional' },
  { id: 'modern', name: 'Modern' },
  { id: 'minimal', name: 'Minimal' },
];

const defaultData: CLData = {
  sender: { name: '', title: '', address: '', phone: '', email: '' },
  recipient: { company: '', contactName: '', contactTitle: '', companyAddress: '' },
  letter: {
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
    subject: '',
    intro: '',
    body: '',
    motivation: '',
    closing: '',
  },
};

const STORAGE_KEY = 'ots_coverletter_v1';
const THUMB_W = 156;
const THUMB_SCALE = THUMB_W / 794;
const FULL_SCALE = 0.72;
const FULL_W = Math.round(794 * FULL_SCALE);
const FULL_H = Math.round(1123 * FULL_SCALE);

// ─── Accordion Section ────────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        <div className="flex items-center gap-3 font-semibold text-slate-800 dark:text-white">{icon} {title}</div>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 py-4 grid grid-cols-2 gap-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">{children}</div>}
    </div>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────
function F({ label, value, onChange, placeholder = '', type = 'text', span2 = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; span2?: boolean;
}) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-white resize-none transition-colors" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-white transition-colors" />
      )}
    </div>
  );
}

// ─── A4 Document: Professional ────────────────────────────────────────────────
function ProfessionalDocument({ data }: { data: CLData }) {
  const { sender: s, recipient: r, letter: l } = data;
  const salutation = r.contactName ? `Dear ${r.contactName},` : 'Dear Sir/Madam,';
  const hasBody = l.intro || l.body || l.motivation || l.closing;

  return (
    <div style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: 'Arial, sans-serif', padding: '72px 80px 80px', boxSizing: 'border-box', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #1e3a5f, #2563eb)' }} />
      <div style={{ marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e3a5f', marginBottom: '3px' }}>{s.name || 'Your Name'}</div>
        {s.title && <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{s.title}</div>}
        <div style={{ display: 'flex', gap: '16px', fontSize: '9.5px', color: '#6b7280', marginTop: '4px', flexWrap: 'wrap' }}>
          {s.address && <span>{s.address}</span>}
          {s.phone && <span>📞 {s.phone}</span>}
          {s.email && <span>✉️ {s.email}</span>}
        </div>
      </div>
      <div style={{ fontSize: '10px', color: '#374151', marginBottom: '20px' }}>{l.date}</div>
      <div style={{ marginBottom: '24px' }}>
        {r.contactName && <div style={{ fontSize: '11px', fontWeight: 700, color: '#111', marginBottom: '1px' }}>{r.contactName}</div>}
        {r.contactTitle && <div style={{ fontSize: '10px', color: '#374151', marginBottom: '1px' }}>{r.contactTitle}</div>}
        {r.company && <div style={{ fontSize: '10px', color: '#374151', marginBottom: '1px' }}>{r.company}</div>}
        {r.companyAddress && <div style={{ fontSize: '10px', color: '#374151' }}>{r.companyAddress}</div>}
      </div>
      {l.subject && (
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#1e3a5f', textDecoration: 'underline' }}>Re: {l.subject}</span>
        </div>
      )}
      <div style={{ fontSize: '10.5px', color: '#111', marginBottom: '14px', fontWeight: 600 }}>{salutation}</div>
      {hasBody && (
        <div style={{ fontSize: '10.5px', color: '#374151', lineHeight: '1.85' }}>
          {l.intro && <p style={{ marginBottom: '14px' }}>{l.intro}</p>}
          {l.body && <p style={{ marginBottom: '14px' }}>{l.body}</p>}
          {l.motivation && <p style={{ marginBottom: '14px' }}>{l.motivation}</p>}
          {l.closing && <p style={{ marginBottom: '14px' }}>{l.closing}</p>}
        </div>
      )}
      <div style={{ marginTop: '28px', fontSize: '10.5px', color: '#374151' }}>
        <div style={{ marginBottom: '36px' }}>Yours sincerely,</div>
        <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '6px', display: 'inline-block', minWidth: '160px' }}>
          <div style={{ fontWeight: 700, color: '#1e3a5f', fontSize: '11px' }}>{s.name || 'Your Name'}</div>
          {s.title && <div style={{ fontSize: '9.5px', color: '#6b7280' }}>{s.title}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── A4 Document: Modern ─────────────────────────────────────────────────────
function ModernCLDocument({ data }: { data: CLData }) {
  const { sender: s, recipient: r, letter: l } = data;
  const salutation = r.contactName ? `Dear ${r.contactName},` : 'Dear Hiring Manager,';
  const hasBody = l.intro || l.body || l.motivation || l.closing;

  return (
    <div style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: 'Arial, sans-serif', display: 'flex' }}>
      <div style={{ width: '8px', background: 'linear-gradient(180deg, #0ea5e9, #7c3aed)', flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '56px 60px 60px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingBottom: '20px', borderBottom: '2px solid #e0f2fe' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{s.name || 'Your Name'}</div>
            {s.title && <div style={{ fontSize: '11px', color: '#0ea5e9', fontWeight: 600 }}>{s.title}</div>}
          </div>
          <div style={{ textAlign: 'right', fontSize: '9.5px', color: '#64748b', lineHeight: '1.8' }}>
            {s.address && <div>{s.address}</div>}
            {s.phone && <div>{s.phone}</div>}
            {s.email && <div>{s.email}</div>}
          </div>
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '20px' }}>{l.date}</div>
        <div style={{ marginBottom: '24px', padding: '12px 14px', background: '#f0f9ff', borderRadius: '6px', borderLeft: '3px solid #0ea5e9' }}>
          {r.contactName && <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>{r.contactName}</div>}
          {r.contactTitle && <div style={{ fontSize: '9.5px', color: '#475569' }}>{r.contactTitle}</div>}
          {r.company && <div style={{ fontSize: '10px', color: '#0ea5e9', fontWeight: 600 }}>{r.company}</div>}
          {r.companyAddress && <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px' }}>{r.companyAddress}</div>}
        </div>
        {l.subject && (
          <div style={{ marginBottom: '18px', padding: '8px 12px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Subject: </span>
            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a' }}>{l.subject}</span>
          </div>
        )}
        <div style={{ fontSize: '10.5px', color: '#111', marginBottom: '14px', fontWeight: 600 }}>{salutation}</div>
        {hasBody && (
          <div style={{ fontSize: '10.5px', color: '#374151', lineHeight: '1.9' }}>
            {l.intro && <p style={{ marginBottom: '14px' }}>{l.intro}</p>}
            {l.body && <p style={{ marginBottom: '14px' }}>{l.body}</p>}
            {l.motivation && <p style={{ marginBottom: '14px' }}>{l.motivation}</p>}
            {l.closing && <p style={{ marginBottom: '14px' }}>{l.closing}</p>}
          </div>
        )}
        <div style={{ marginTop: '28px', fontSize: '10.5px', color: '#374151' }}>
          <div style={{ marginBottom: '36px' }}>Yours sincerely,</div>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{s.name || 'Your Name'}</div>
          {s.title && <div style={{ fontSize: '9.5px', color: '#0ea5e9' }}>{s.title}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── A4 Document: Minimal ─────────────────────────────────────────────────────
function MinimalCLDocument({ data }: { data: CLData }) {
  const { sender: s, recipient: r, letter: l } = data;
  const salutation = r.contactName ? `Dear ${r.contactName},` : 'Dear Sir/Madam,';
  const hasBody = l.intro || l.body || l.motivation || l.closing;

  return (
    <div style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: "'Georgia', serif", padding: '80px 96px 80px', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'right', marginBottom: '40px' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '4px' }}>{s.name || 'Your Name'}</div>
        {s.title && <div style={{ fontSize: '10.5px', color: '#6b7280', marginBottom: '2px', fontFamily: 'Arial, sans-serif' }}>{s.title}</div>}
        <div style={{ fontSize: '9.5px', color: '#9ca3af', fontFamily: 'Arial, sans-serif', lineHeight: '1.7' }}>
          {s.address && <div>{s.address}</div>}
          {s.phone && <div>{s.phone}</div>}
          {s.email && <div>{s.email}</div>}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #e5e7eb', marginBottom: '28px' }} />
      <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '24px', fontFamily: 'Arial, sans-serif' }}>{l.date}</div>
      <div style={{ marginBottom: '28px' }}>
        {r.contactName && <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#111' }}>{r.contactName}</div>}
        {r.contactTitle && <div style={{ fontSize: '10px', color: '#374151', fontFamily: 'Arial, sans-serif' }}>{r.contactTitle}</div>}
        {r.company && <div style={{ fontSize: '10.5px', color: '#374151', fontFamily: 'Arial, sans-serif' }}>{r.company}</div>}
        {r.companyAddress && <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'Arial, sans-serif', marginTop: '2px' }}>{r.companyAddress}</div>}
      </div>
      {l.subject && (
        <div style={{ marginBottom: '20px', fontSize: '10.5px', fontWeight: 700, color: '#111' }}>
          Re: {l.subject}
        </div>
      )}
      <div style={{ fontSize: '11px', color: '#111', marginBottom: '16px' }}>{salutation}</div>
      {hasBody && (
        <div style={{ fontSize: '11px', color: '#374151', lineHeight: '1.9' }}>
          {l.intro && <p style={{ marginBottom: '16px' }}>{l.intro}</p>}
          {l.body && <p style={{ marginBottom: '16px' }}>{l.body}</p>}
          {l.motivation && <p style={{ marginBottom: '16px' }}>{l.motivation}</p>}
          {l.closing && <p style={{ marginBottom: '16px' }}>{l.closing}</p>}
        </div>
      )}
      <div style={{ marginTop: '32px', fontSize: '11px', color: '#374151' }}>
        <div style={{ marginBottom: '40px' }}>Yours faithfully,</div>
        <div style={{ fontWeight: 700, fontSize: '12px', color: '#111' }}>{s.name || 'Your Name'}</div>
        {s.title && <div style={{ fontSize: '9.5px', color: '#6b7280', fontFamily: 'Arial, sans-serif', marginTop: '2px' }}>{s.title}</div>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CoverLetter() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [downloading, setDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CLTemplate>('professional');
  const [savedBadge, setSavedBadge] = useState(false);
  const [data, setData] = useState<CLData>(defaultData);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate);
        if (parsed.data) setData({ ...defaultData, ...parsed.data });
      }
    } catch { /* ignore */ }
  }, []);

  const triggerSaveBadge = useCallback(() => {
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedTemplate, data }));
      triggerSaveBadge();
    } catch { /* ignore */ }
  }, [selectedTemplate, data, mounted, triggerSaveBadge]);

  const updSender = (field: keyof SenderInfo, val: string) =>
    setData(p => ({ ...p, sender: { ...p.sender, [field]: val } }));
  const updRecipient = (field: keyof RecipientInfo, val: string) =>
    setData(p => ({ ...p, recipient: { ...p.recipient, [field]: val } }));
  const updLetter = (field: keyof LetterContent, val: string) =>
    setData(p => ({ ...p, letter: { ...p.letter, [field]: val } }));

  const reset = () => {
    if (!window.confirm('Reset all cover letter data?')) return;
    setData(defaultData);
    setSelectedTemplate('professional');
    localStorage.removeItem(STORAGE_KEY);
    showToast('Reset to defaults', 'success');
  };

  const downloadPDF = async () => {
    if (!downloadRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(downloadRef.current, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
      pdf.save(`${(data.sender.name || 'CoverLetter').replace(/\s+/g, '_')}_${selectedTemplate}_CoverLetter.pdf`);
      showToast('Cover letter downloaded!', 'success');
    } catch {
      showToast('PDF generation failed', 'error');
    } finally { setDownloading(false); }
  };

  if (!mounted) return null;

  const introPlaceholder = `I am writing to express my keen interest in the position of ${data.letter.subject || '[Role]'} at ${data.recipient.company || '[Company]'}. Having carefully reviewed the job description, I am confident that my background and skills make me an excellent fit for this role.`;

  const renderDoc = (template: CLTemplate) => {
    if (template === 'professional') return <ProfessionalDocument data={data} />;
    if (template === 'modern') return <ModernCLDocument data={data} />;
    return <MinimalCLDocument data={data} />;
  };

  // ── Step 2: Gallery — thumbnail picker (left) + full live preview (right) ───
  if (step === 'gallery') {
    const selName = TEMPLATES.find(t => t.id === selectedTemplate)?.name ?? '';
    return (
      <div className="flex flex-col bg-slate-100 dark:bg-[#0F111A]" style={{ height: '100dvh' }}>

        {/* ── Top bar ── */}
        <div className="shrink-0 flex items-center gap-4 px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-10">
          <button onClick={() => setStep('form')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={15} /> Edit Details
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{selName}</h2>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Selected: <strong className="text-slate-800 dark:text-white">{selName}</strong>
            </span>
            <button onClick={downloadPDF} disabled={downloading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60 transition-colors">
              {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Download PDF
            </button>
          </div>
        </div>

        {/* ── Body: thumbnail sidebar + full live preview ── */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left sidebar — all templates as thumbnails */}
          <div className="shrink-0 w-[188px] overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-3 space-y-3">
            {TEMPLATES.map(tpl => {
              const isSel = selectedTemplate === tpl.id;
              return (
                <button key={tpl.id} onClick={() => setSelectedTemplate(tpl.id)}
                  className={`w-full flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${isSel ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  {/* Mini thumbnail */}
                  <div style={{ width: THUMB_W, height: Math.round(1123 * THUMB_SCALE), overflow: 'hidden', borderRadius: 3, flexShrink: 0, boxShadow: '0 1px 6px rgba(0,0,0,0.18)', position: 'relative' }}>
                    <div style={{ width: 794, transform: `scale(${THUMB_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                      {renderDoc(tpl.id)}
                    </div>
                    {isSel && (
                      <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={11} color="#fff" />
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-semibold leading-tight text-center ${isSel ? 'text-blue-600' : 'text-slate-500 dark:text-slate-400'}`}>
                    {tpl.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right — full live preview of selected template */}
          <div className="flex-1 overflow-auto flex justify-center items-start py-8 px-6 bg-slate-300 dark:bg-slate-800">
            <div style={{
              width: FULL_W, height: FULL_H,
              overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 12px 60px rgba(0,0,0,0.35)',
              borderRadius: 4,
            }}>
              <div style={{ width: 794, transform: `scale(${FULL_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none' }}>
                {renderDoc(selectedTemplate)}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden full-scale target for PDF capture */}
        <div ref={downloadRef} style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, width: '794px' }}>
          {renderDoc(selectedTemplate)}
        </div>
      </div>
    );
  }

  // ── Step 1: Form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F111A]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-violet-600" />
          <span className="font-semibold text-slate-800 dark:text-white text-sm">Cover Letter Builder</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-medium transition-opacity duration-300 ${savedBadge ? 'opacity-100 text-emerald-600 dark:text-emerald-400' : 'opacity-0'}`}>
            Saved ✓
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">All changes auto-saved</span>
          <button onClick={reset} className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors">
            <RefreshCw size={12} /> Reset
          </button>
          <button onClick={() => setStep('gallery')}
            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
            See Your Designs <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Sender */}
        <Section title="Your Details (Sender)" icon={<span className="text-lg">👤</span>} defaultOpen>
          <F label="Your Full Name" value={data.sender.name} onChange={v => updSender('name', v)} span2 />
          <F label="Your Title / Role" value={data.sender.title} onChange={v => updSender('title', v)} span2 />
          <F label="Your Address" value={data.sender.address} onChange={v => updSender('address', v)} span2 />
          <F label="Phone" value={data.sender.phone} onChange={v => updSender('phone', v)} />
          <F label="Email" value={data.sender.email} onChange={v => updSender('email', v)} type="email" />
        </Section>

        {/* Recipient */}
        <Section title="Recipient Details" icon={<span className="text-lg">🏢</span>}>
          <F label="Company Name" value={data.recipient.company} onChange={v => updRecipient('company', v)} span2 />
          <F label="Contact Person Name" value={data.recipient.contactName} onChange={v => updRecipient('contactName', v)} span2 placeholder="(Optional)" />
          <F label="Contact Title" value={data.recipient.contactTitle} onChange={v => updRecipient('contactTitle', v)} span2 placeholder="e.g. HR Manager" />
          <F label="Company Address" value={data.recipient.companyAddress} onChange={v => updRecipient('companyAddress', v)} span2 />
        </Section>

        {/* Letter Content */}
        <Section title="Letter Content" icon={<span className="text-lg">✉️</span>}>
          <F label="Date" value={data.letter.date} onChange={v => updLetter('date', v)} span2 />
          <F label="Subject / Role Applying For" value={data.letter.subject} onChange={v => updLetter('subject', v)} span2
            placeholder="e.g. Software Engineer – Full Stack" />
          <F label="Opening Paragraph" value={data.letter.intro} onChange={v => updLetter('intro', v)} type="textarea" span2
            placeholder={introPlaceholder} />
          <F label="Skills & Experience Paragraph" value={data.letter.body} onChange={v => updLetter('body', v)} type="textarea" span2
            placeholder="Highlight your key achievements and skills relevant to the role..." />
          <F label="Why This Company (Motivation)" value={data.letter.motivation} onChange={v => updLetter('motivation', v)} type="textarea" span2
            placeholder={`I am particularly drawn to ${data.recipient.company || '[Company]'} because...`} />
          <F label="Closing Paragraph" value={data.letter.closing} onChange={v => updLetter('closing', v)} type="textarea" span2
            placeholder="I would welcome the opportunity to discuss how my experience aligns with your team's goals..." />
        </Section>

        {/* Big CTA */}
        <div className="pt-4 flex justify-center">
          <button onClick={() => setStep('gallery')}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40">
            See Your Designs <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

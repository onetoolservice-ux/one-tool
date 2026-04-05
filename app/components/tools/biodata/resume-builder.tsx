"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download, RefreshCw, FileText, ChevronDown, ChevronUp,
  X, Plus, Eye, EyeOff, Trash2, ArrowRight, ArrowLeft, Check, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showToast } from '@/app/shared/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'form' | 'gallery';
type ResumeTemplate = 'classic' | 'modern' | 'executive';

interface ContactInfo {
  name: string; jobTitle: string; email: string; phone: string;
  location: string; linkedin: string; website: string;
}

interface Experience {
  id: number; company: string; role: string; location: string;
  startDate: string; endDate: string; current: boolean; bullets: string[];
}

interface Education {
  id: number; degree: string; institution: string; year: string; grade: string;
}

interface Project {
  id: number; name: string; description: string; tech: string;
}

interface Certification {
  id: number; name: string; issuer: string; year: string;
}

interface SectionVisibility {
  summary: boolean; experience: boolean; education: boolean;
  skills: boolean; projects: boolean; certifications: boolean;
  languages: boolean; achievements: boolean;
}

interface ResumeData {
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string;
  projects: Project[];
  certifications: Certification[];
  languages: string;
  achievements: string;
  sectionVisibility: SectionVisibility;
}

const TEMPLATES: { id: ResumeTemplate; name: string; color: string }[] = [
  { id: 'classic', name: 'Classic', color: '#1d4ed8' },
  { id: 'modern', name: 'Modern', color: '#0ea5e9' },
  { id: 'executive', name: 'Executive', color: '#d97706' },
];

const defaultData: ResumeData = {
  contact: { name: '', jobTitle: '', email: '', phone: '', location: '', linkedin: '', website: '' },
  summary: '',
  experience: [{ id: 1, company: '', role: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }],
  education: [{ id: 1, degree: '', institution: '', year: '', grade: '' }],
  skills: '',
  projects: [{ id: 1, name: '', description: '', tech: '' }],
  certifications: [{ id: 1, name: '', issuer: '', year: '' }],
  languages: '',
  achievements: '',
  sectionVisibility: {
    summary: true, experience: true, education: true,
    skills: true, projects: true, certifications: true,
    languages: true, achievements: false,
  },
};

const STORAGE_KEY = 'ots_resume_v1';
const THUMB_W = 156;
const THUMB_SCALE = THUMB_W / 794;
const FULL_SCALE = 0.72;
const FULL_W = Math.round(794 * FULL_SCALE);
const FULL_H = Math.round(1123 * FULL_SCALE);

// ─── Accordion Section ────────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false, visible, onToggleVisibility }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
  visible?: boolean; onToggleVisibility?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
      <div className="flex items-center bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        <button onClick={() => setOpen(o => !o)} className="flex-1 flex items-center justify-between px-5 py-4">
          <div className={`flex items-center gap-3 font-semibold text-slate-800 dark:text-white ${visible === false ? 'opacity-40' : ''}`}>{icon} {title}</div>
          {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        {onToggleVisibility && (
          <button onClick={onToggleVisibility} title={visible ? 'Hide from document' : 'Show in document'}
            className="px-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            {visible ? <Eye size={15} /> : <EyeOff size={15} className="text-slate-300" />}
          </button>
        )}
      </div>
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
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-white resize-none transition-colors" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-white transition-colors" />
      )}
    </div>
  );
}

// ─── A4 Document: Classic ─────────────────────────────────────────────────────
function ClassicDocument({ data }: { data: ResumeData }) {
  const { contact, sectionVisibility: sv } = data;
  const accentBlue = '#1d4ed8';
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
  const contactParts = [contact.email, contact.phone, contact.location, contact.linkedin].filter(Boolean);

  const secHead = (title: string) => (
    <div style={{ fontSize: '9px', fontWeight: 800, color: accentBlue, letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: `2px solid ${accentBlue}`, paddingBottom: '3px', marginBottom: '8px', marginTop: '14px' }}>{title}</div>
  );

  return (
    <div style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: "'Georgia', serif", padding: '48px 52px 52px', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '4px' }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#111', letterSpacing: '-0.5px', marginBottom: '3px' }}>{contact.name || 'Your Name'}</div>
        {contact.jobTitle && <div style={{ fontSize: '13px', color: '#555', fontFamily: 'Arial, sans-serif', marginBottom: '6px' }}>{contact.jobTitle}</div>}
        {contactParts.length > 0 && (
          <div style={{ fontSize: '9.5px', color: '#666', fontFamily: 'Arial, sans-serif', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {contactParts.map((p, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: '#ccc' }}>|</span>}
                <span>{p}</span>
              </React.Fragment>
            ))}
            {contact.website && <><span style={{ color: '#ccc' }}>|</span><span>{contact.website}</span></>}
          </div>
        )}
      </div>
      <div style={{ height: '2px', background: accentBlue, marginTop: '10px', marginBottom: '2px' }} />

      {sv.summary && data.summary && (
        <>{secHead('Professional Summary')}<div style={{ fontSize: '10px', color: '#333', lineHeight: '1.7', fontFamily: 'Arial, sans-serif' }}>{data.summary}</div></>
      )}
      {sv.experience && data.experience.some(e => e.company || e.role) && (
        <>
          {secHead('Work Experience')}
          {data.experience.filter(e => e.company || e.role).map(exp => (
            <div key={exp.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111', fontFamily: 'Arial, sans-serif' }}>{exp.role || 'Role'}</div>
                  <div style={{ fontSize: '10px', color: '#444', fontFamily: 'Arial, sans-serif' }}>{exp.company}{exp.location ? ` • ${exp.location}` : ''}</div>
                </div>
                <div style={{ fontSize: '9px', color: '#888', fontFamily: 'Arial, sans-serif', textAlign: 'right', flexShrink: 0 }}>
                  {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}
                </div>
              </div>
              {exp.bullets.filter(Boolean).length > 0 && (
                <ul style={{ paddingLeft: '14px', margin: '4px 0 0', fontFamily: 'Arial, sans-serif' }}>
                  {exp.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} style={{ fontSize: '9.5px', color: '#333', lineHeight: '1.6', marginBottom: '2px' }}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}
      {sv.education && data.education.some(e => e.degree || e.institution) && (
        <>
          {secHead('Education')}
          {data.education.filter(e => e.degree || e.institution).map(edu => (
            <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#111', fontFamily: 'Arial, sans-serif' }}>{edu.degree}</div>
                <div style={{ fontSize: '10px', color: '#444', fontFamily: 'Arial, sans-serif' }}>{edu.institution}{edu.grade ? ` • ${edu.grade}` : ''}</div>
              </div>
              <div style={{ fontSize: '9px', color: '#888', fontFamily: 'Arial, sans-serif' }}>{edu.year}</div>
            </div>
          ))}
        </>
      )}
      {sv.skills && skills.length > 0 && (
        <>
          {secHead('Skills')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {skills.map((s, i) => (
              <span key={i} style={{ fontSize: '9px', background: '#eff6ff', color: accentBlue, padding: '3px 8px', borderRadius: '100px', fontFamily: 'Arial, sans-serif', fontWeight: 600, border: '1px solid #bfdbfe' }}>{s}</span>
            ))}
          </div>
        </>
      )}
      {sv.projects && data.projects.some(p => p.name) && (
        <>
          {secHead('Projects')}
          {data.projects.filter(p => p.name).map(proj => (
            <div key={proj.id} style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#111', fontFamily: 'Arial, sans-serif' }}>{proj.name}{proj.tech ? <span style={{ fontSize: '9px', color: '#888', fontWeight: 400 }}> — {proj.tech}</span> : null}</div>
              {proj.description && <div style={{ fontSize: '9.5px', color: '#444', fontFamily: 'Arial, sans-serif', marginTop: '2px', lineHeight: 1.6 }}>{proj.description}</div>}
            </div>
          ))}
        </>
      )}
      {sv.certifications && data.certifications.some(c => c.name) && (
        <>
          {secHead('Certifications')}
          {data.certifications.filter(c => c.name).map(cert => (
            <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ fontSize: '10px', color: '#222', fontFamily: 'Arial, sans-serif', fontWeight: 600 }}>{cert.name}{cert.issuer ? <span style={{ fontWeight: 400, color: '#666' }}> — {cert.issuer}</span> : null}</div>
              <div style={{ fontSize: '9px', color: '#888', fontFamily: 'Arial, sans-serif' }}>{cert.year}</div>
            </div>
          ))}
        </>
      )}
      {sv.languages && data.languages && (
        <>{secHead('Languages')}<div style={{ fontSize: '10px', color: '#333', fontFamily: 'Arial, sans-serif' }}>{data.languages}</div></>
      )}
      {sv.achievements && data.achievements && (
        <>{secHead('Achievements')}<div style={{ fontSize: '10px', color: '#333', fontFamily: 'Arial, sans-serif', lineHeight: 1.7 }}>{data.achievements}</div></>
      )}
    </div>
  );
}

// ─── A4 Document: Modern (Two-Column) ────────────────────────────────────────
function ModernDocument({ data }: { data: ResumeData }) {
  const { contact, sectionVisibility: sv } = data;
  const sidebarBg = '#1e293b';
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);

  const secHeadRight = (title: string) => (
    <div style={{ fontSize: '9px', fontWeight: 800, color: '#0f172a', letterSpacing: '1.5px', textTransform: 'uppercase', borderLeft: '3px solid #0ea5e9', paddingLeft: '8px', marginBottom: '8px', marginTop: '14px' }}>{title}</div>
  );

  return (
    <div style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: 'Arial, sans-serif', display: 'flex' }}>
      <div style={{ width: '230px', flexShrink: 0, background: sidebarBg, padding: '32px 20px 32px', boxSizing: 'border-box', minHeight: '1123px' }}>
        <div style={{ width: '90px', height: '90px', background: '#334155', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '28px', color: '#94a3b8' }}>👤</span>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '4px', lineHeight: 1.2 }}>{contact.name || 'Your Name'}</div>
          {contact.jobTitle && <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.5px' }}>{contact.jobTitle}</div>}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '8px', fontWeight: 800, color: '#0ea5e9', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Contact</div>
          {[contact.phone, contact.email, contact.location, contact.linkedin, contact.website].filter(Boolean).map((v, i) => (
            <div key={i} style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '4px', wordBreak: 'break-all', lineHeight: 1.5 }}>{v}</div>
          ))}
        </div>
        {sv.skills && skills.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '8px', fontWeight: 800, color: '#0ea5e9', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {skills.map((s, i) => (
                <span key={i} style={{ fontSize: '8px', background: '#334155', color: '#e2e8f0', padding: '2px 7px', borderRadius: '100px', marginBottom: '2px' }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        {sv.languages && data.languages && (
          <div>
            <div style={{ fontSize: '8px', fontWeight: 800, color: '#0ea5e9', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>Languages</div>
            <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: 1.7 }}>{data.languages}</div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: '32px 28px 32px', boxSizing: 'border-box' }}>
        {sv.summary && data.summary && (
          <>{secHeadRight('Profile Summary')}<div style={{ fontSize: '9.5px', color: '#444', lineHeight: 1.7 }}>{data.summary}</div></>
        )}
        {sv.experience && data.experience.some(e => e.company || e.role) && (
          <>
            {secHeadRight('Work Experience')}
            {data.experience.filter(e => e.company || e.role).map(exp => (
              <div key={exp.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>{exp.role || 'Role'}</div>
                  <div style={{ fontSize: '8.5px', color: '#64748b', flexShrink: 0 }}>{exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}</div>
                </div>
                <div style={{ fontSize: '9.5px', color: '#0ea5e9', fontWeight: 600, marginBottom: '3px' }}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                {exp.bullets.filter(Boolean).length > 0 && (
                  <ul style={{ paddingLeft: '14px', margin: '4px 0 0' }}>
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} style={{ fontSize: '9px', color: '#444', lineHeight: 1.6, marginBottom: '2px' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}
        {sv.education && data.education.some(e => e.degree || e.institution) && (
          <>
            {secHeadRight('Education')}
            {data.education.filter(e => e.degree || e.institution).map(edu => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a' }}>{edu.degree}</div>
                  <div style={{ fontSize: '9.5px', color: '#475569' }}>{edu.institution}{edu.grade ? ` • ${edu.grade}` : ''}</div>
                </div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{edu.year}</div>
              </div>
            ))}
          </>
        )}
        {sv.projects && data.projects.some(p => p.name) && (
          <>
            {secHeadRight('Projects')}
            {data.projects.filter(p => p.name).map(proj => (
              <div key={proj.id} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a' }}>{proj.name}</div>
                {proj.tech && <div style={{ fontSize: '8.5px', color: '#0ea5e9', marginBottom: '2px' }}>{proj.tech}</div>}
                {proj.description && <div style={{ fontSize: '9px', color: '#475569', lineHeight: 1.6 }}>{proj.description}</div>}
              </div>
            ))}
          </>
        )}
        {sv.certifications && data.certifications.some(c => c.name) && (
          <>
            {secHeadRight('Certifications')}
            {data.certifications.filter(c => c.name).map(cert => (
              <div key={cert.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ fontSize: '9.5px', color: '#0f172a', fontWeight: 600 }}>{cert.name}{cert.issuer ? <span style={{ fontWeight: 400, color: '#64748b' }}> — {cert.issuer}</span> : null}</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{cert.year}</div>
              </div>
            ))}
          </>
        )}
        {sv.achievements && data.achievements && (
          <>{secHeadRight('Achievements')}<div style={{ fontSize: '9.5px', color: '#444', lineHeight: 1.7 }}>{data.achievements}</div></>
        )}
      </div>
    </div>
  );
}

// ─── A4 Document: Executive ───────────────────────────────────────────────────
function ExecutiveDocument({ data }: { data: ResumeData }) {
  const { contact, sectionVisibility: sv } = data;
  const headerBg = '#0f172a';
  const accentGold = '#d97706';
  const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);

  const secHead = (title: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', marginTop: '16px' }}>
      <div style={{ width: '4px', height: '18px', background: accentGold, borderRadius: '2px', flexShrink: 0 }} />
      <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', letterSpacing: '1px', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
    </div>
  );

  const contactLine = [contact.email, contact.phone, contact.location, contact.linkedin].filter(Boolean).join('  •  ');

  return (
    <div style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ background: headerBg, padding: '32px 52px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '30px', fontWeight: 800, color: '#fff', letterSpacing: '0.5px', marginBottom: '5px' }}>{contact.name || 'YOUR NAME'}</div>
        {contact.jobTitle && <div style={{ fontSize: '13px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>{contact.jobTitle}</div>}
        {contactLine && <div style={{ fontSize: '9.5px', color: '#64748b', letterSpacing: '0.5px' }}>{contactLine}</div>}
        {contact.website && <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>{contact.website}</div>}
      </div>
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${accentGold}, #fbbf24)` }} />
      <div style={{ padding: '20px 52px 40px' }}>
        {sv.summary && data.summary && (
          <>{secHead('Executive Summary')}<div style={{ fontSize: '10px', color: '#374151', lineHeight: 1.8, fontStyle: 'italic' }}>{data.summary}</div></>
        )}
        {sv.experience && data.experience.some(e => e.company || e.role) && (
          <>
            {secHead('Professional Experience')}
            {data.experience.filter(e => e.company || e.role).map(exp => (
              <div key={exp.id} style={{ marginBottom: '14px', paddingLeft: '12px', borderLeft: '2px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{exp.role || 'Role'}</div>
                    <div style={{ fontSize: '10px', color: accentGold, fontWeight: 700 }}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748b', background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                    {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}
                  </div>
                </div>
                {exp.bullets.filter(Boolean).length > 0 && (
                  <ul style={{ paddingLeft: '14px', margin: '5px 0 0' }}>
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} style={{ fontSize: '9.5px', color: '#374151', lineHeight: 1.6, marginBottom: '3px' }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </>
        )}
        {sv.education && data.education.some(e => e.degree || e.institution) && (
          <>
            {secHead('Education')}
            {data.education.filter(e => e.degree || e.institution).map(edu => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: '#f8fafc', borderRadius: '4px', marginBottom: '5px' }}>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f172a' }}>{edu.degree}</div>
                  <div style={{ fontSize: '9.5px', color: '#475569' }}>{edu.institution}{edu.grade ? ` • ${edu.grade}` : ''}</div>
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', alignSelf: 'center' }}>{edu.year}</div>
              </div>
            ))}
          </>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            {sv.skills && skills.length > 0 && (
              <>
                {secHead('Core Skills')}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {skills.map((s, i) => (
                    <span key={i} style={{ fontSize: '9px', background: '#fffbeb', color: '#92400e', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fde68a', fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </>
            )}
            {sv.languages && data.languages && (
              <>{secHead('Languages')}<div style={{ fontSize: '9.5px', color: '#374151' }}>{data.languages}</div></>
            )}
          </div>
          <div>
            {sv.certifications && data.certifications.some(c => c.name) && (
              <>
                {secHead('Certifications')}
                {data.certifications.filter(c => c.name).map(cert => (
                  <div key={cert.id} style={{ marginBottom: '5px' }}>
                    <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#0f172a' }}>{cert.name}</div>
                    <div style={{ fontSize: '8.5px', color: '#64748b' }}>{cert.issuer}{cert.year ? ` • ${cert.year}` : ''}</div>
                  </div>
                ))}
              </>
            )}
            {sv.achievements && data.achievements && (
              <>{secHead('Achievements')}<div style={{ fontSize: '9.5px', color: '#374151', lineHeight: 1.7 }}>{data.achievements}</div></>
            )}
          </div>
        </div>
        {sv.projects && data.projects.some(p => p.name) && (
          <>
            {secHead('Key Projects')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {data.projects.filter(p => p.name).map(proj => (
                <div key={proj.id} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{proj.name}</div>
                  {proj.tech && <div style={{ fontSize: '8.5px', color: accentGold, marginBottom: '3px' }}>{proj.tech}</div>}
                  {proj.description && <div style={{ fontSize: '9px', color: '#475569', lineHeight: 1.5 }}>{proj.description}</div>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ResumeBuilder() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [downloading, setDownloading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('classic');
  const [savedBadge, setSavedBadge] = useState(false);
  const [data, setData] = useState<ResumeData>(defaultData);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate);
        if (parsed.data) setData({ ...defaultData, ...parsed.data, sectionVisibility: { ...defaultData.sectionVisibility, ...(parsed.data.sectionVisibility || {}) } });
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

  const upd = useCallback(<K extends keyof ResumeData>(field: K, val: ResumeData[K]) => {
    setData(p => ({ ...p, [field]: val }));
  }, []);

  const updContact = (field: keyof ContactInfo, val: string) =>
    setData(p => ({ ...p, contact: { ...p.contact, [field]: val } }));

  const toggleVis = (section: keyof SectionVisibility) =>
    setData(p => ({ ...p, sectionVisibility: { ...p.sectionVisibility, [section]: !p.sectionVisibility[section] } }));

  const addExp = () => setData(p => ({ ...p, experience: [...p.experience, { id: Date.now(), company: '', role: '', location: '', startDate: '', endDate: '', current: false, bullets: [''] }] }));
  const removeExp = (id: number) => setData(p => ({ ...p, experience: p.experience.filter(e => e.id !== id) }));
  const updExp = (id: number, field: keyof Omit<Experience, 'id' | 'bullets'>, val: string | boolean) =>
    setData(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, [field]: val } : e) }));
  const addBullet = (id: number) => setData(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, bullets: [...e.bullets, ''] } : e) }));
  const updBullet = (id: number, idx: number, val: string) =>
    setData(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? val : b) } : e) }));
  const removeBullet = (id: number, idx: number) =>
    setData(p => ({ ...p, experience: p.experience.map(e => e.id === id ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e) }));

  const addEdu = () => setData(p => ({ ...p, education: [...p.education, { id: Date.now(), degree: '', institution: '', year: '', grade: '' }] }));
  const removeEdu = (id: number) => setData(p => ({ ...p, education: p.education.filter(e => e.id !== id) }));
  const updEdu = (id: number, field: keyof Omit<Education, 'id'>, val: string) =>
    setData(p => ({ ...p, education: p.education.map(e => e.id === id ? { ...e, [field]: val } : e) }));

  const addProj = () => setData(p => ({ ...p, projects: [...p.projects, { id: Date.now(), name: '', description: '', tech: '' }] }));
  const removeProj = (id: number) => setData(p => ({ ...p, projects: p.projects.filter(pr => pr.id !== id) }));
  const updProj = (id: number, field: keyof Omit<Project, 'id'>, val: string) =>
    setData(p => ({ ...p, projects: p.projects.map(pr => pr.id === id ? { ...pr, [field]: val } : pr) }));

  const addCert = () => setData(p => ({ ...p, certifications: [...p.certifications, { id: Date.now(), name: '', issuer: '', year: '' }] }));
  const removeCert = (id: number) => setData(p => ({ ...p, certifications: p.certifications.filter(c => c.id !== id) }));
  const updCert = (id: number, field: keyof Omit<Certification, 'id'>, val: string) =>
    setData(p => ({ ...p, certifications: p.certifications.map(c => c.id === id ? { ...c, [field]: val } : c) }));

  const reset = () => {
    if (!window.confirm('Reset all resume data?')) return;
    setData(defaultData);
    setSelectedTemplate('classic');
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
      pdf.save(`${(data.contact.name || 'Resume').replace(/\s+/g, '_')}_${selectedTemplate}_Resume.pdf`);
      showToast('Resume downloaded!', 'success');
    } catch {
      showToast('PDF generation failed', 'error');
    } finally { setDownloading(false); }
  };

  if (!mounted) return null;

  const renderDoc = (template: ResumeTemplate) => {
    if (template === 'classic') return <ClassicDocument data={data} />;
    if (template === 'modern') return <ModernDocument data={data} />;
    return <ExecutiveDocument data={data} />;
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
          <FileText size={18} className="text-blue-600" />
          <span className="font-semibold text-slate-800 dark:text-white text-sm">Resume Builder</span>
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

        {/* Contact */}
        <Section title="Contact Information" icon={<span className="text-lg">👤</span>} defaultOpen>
          <F label="Full Name" value={data.contact.name} onChange={v => updContact('name', v)} span2 />
          <F label="Job Title" value={data.contact.jobTitle} onChange={v => updContact('jobTitle', v)} span2 />
          <F label="Email" value={data.contact.email} onChange={v => updContact('email', v)} type="email" />
          <F label="Phone" value={data.contact.phone} onChange={v => updContact('phone', v)} />
          <F label="Location" value={data.contact.location} onChange={v => updContact('location', v)} />
          <F label="LinkedIn" value={data.contact.linkedin} onChange={v => updContact('linkedin', v)} placeholder="linkedin.com/in/..." />
          <F label="Website / Portfolio" value={data.contact.website} onChange={v => updContact('website', v)} span2 />
        </Section>

        {/* Summary */}
        <Section title="Summary" icon={<span className="text-lg">📝</span>}
          visible={data.sectionVisibility.summary} onToggleVisibility={() => toggleVis('summary')}>
          <F label="Professional Summary" value={data.summary} onChange={v => upd('summary', v)} type="textarea" span2
            placeholder="A results-driven professional with..." />
        </Section>

        {/* Experience */}
        <Section title="Work Experience" icon={<span className="text-lg">💼</span>}
          visible={data.sectionVisibility.experience} onToggleVisibility={() => toggleVis('experience')}>
          <div className="col-span-2 space-y-4">
            {data.experience.map((exp, ei) => (
              <div key={exp.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experience #{ei + 1}</span>
                  {data.experience.length > 1 && (
                    <button onClick={() => removeExp(exp.id)} className="text-rose-400 hover:text-rose-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <F label="Role / Title" value={exp.role} onChange={v => updExp(exp.id, 'role', v)} />
                  <F label="Company" value={exp.company} onChange={v => updExp(exp.id, 'company', v)} />
                  <F label="Location" value={exp.location} onChange={v => updExp(exp.id, 'location', v)} />
                  <div className="col-span-2 grid grid-cols-2 gap-3 items-end">
                    <F label="Start Date" value={exp.startDate} onChange={v => updExp(exp.id, 'startDate', v)} placeholder="Jan 2022" />
                    {!exp.current && <F label="End Date" value={exp.endDate} onChange={v => updExp(exp.id, 'endDate', v)} placeholder="Dec 2024" />}
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer">
                      <input type="checkbox" checked={exp.current} onChange={e => updExp(exp.id, 'current', e.target.checked)} className="accent-blue-600 w-4 h-4" />
                      Currently working here
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bullet Points</label>
                  {exp.bullets.map((b, bi) => (
                    <div key={bi} className="flex items-center gap-2">
                      <input value={b} onChange={e => updBullet(exp.id, bi, e.target.value)} placeholder="• Achieved..."
                        className="flex-1 h-9 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-colors" />
                      {exp.bullets.length > 1 && (
                        <button onClick={() => removeBullet(exp.id, bi)} className="text-rose-400 hover:text-rose-600 flex-shrink-0 transition-colors">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addBullet(exp.id)} className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors">
                    <Plus size={13} /> Add bullet
                  </button>
                </div>
              </div>
            ))}
            <button onClick={addExp} className="w-full py-2.5 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Add Experience
            </button>
          </div>
        </Section>

        {/* Education */}
        <Section title="Education" icon={<span className="text-lg">🎓</span>}
          visible={data.sectionVisibility.education} onToggleVisibility={() => toggleVis('education')}>
          <div className="col-span-2 space-y-3">
            {data.education.map(edu => (
              <div key={edu.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-3">
                <F label="Degree / Certificate" value={edu.degree} onChange={v => updEdu(edu.id, 'degree', v)} span2 />
                <F label="Institution" value={edu.institution} onChange={v => updEdu(edu.id, 'institution', v)} />
                <F label="Year" value={edu.year} onChange={v => updEdu(edu.id, 'year', v)} placeholder="2022" />
                <F label="Grade / CGPA" value={edu.grade} onChange={v => updEdu(edu.id, 'grade', v)} />
                {data.education.length > 1 && (
                  <button onClick={() => removeEdu(edu.id)} className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-semibold transition-colors">
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>
            ))}
            <button onClick={addEdu} className="w-full py-2.5 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Add Education
            </button>
          </div>
        </Section>

        {/* Skills */}
        <Section title="Skills" icon={<span className="text-lg">💡</span>}
          visible={data.sectionVisibility.skills} onToggleVisibility={() => toggleVis('skills')}>
          <F label="Skills (comma-separated)" value={data.skills} onChange={v => upd('skills', v)} span2
            placeholder="React, TypeScript, Node.js, AWS..." />
        </Section>

        {/* Projects */}
        <Section title="Projects" icon={<span className="text-lg">🚀</span>}
          visible={data.sectionVisibility.projects} onToggleVisibility={() => toggleVis('projects')}>
          <div className="col-span-2 space-y-3">
            {data.projects.map(proj => (
              <div key={proj.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-3">
                <F label="Project Name" value={proj.name} onChange={v => updProj(proj.id, 'name', v)} span2 />
                <F label="Technologies" value={proj.tech} onChange={v => updProj(proj.id, 'tech', v)} span2 placeholder="React, Firebase..." />
                <F label="Description" value={proj.description} onChange={v => updProj(proj.id, 'description', v)} type="textarea" span2 />
                {data.projects.length > 1 && (
                  <button onClick={() => removeProj(proj.id)} className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-semibold transition-colors">
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>
            ))}
            <button onClick={addProj} className="w-full py-2.5 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Add Project
            </button>
          </div>
        </Section>

        {/* Certifications */}
        <Section title="Certifications" icon={<span className="text-lg">🏆</span>}
          visible={data.sectionVisibility.certifications} onToggleVisibility={() => toggleVis('certifications')}>
          <div className="col-span-2 space-y-3">
            {data.certifications.map(cert => (
              <div key={cert.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-3">
                <F label="Certificate Name" value={cert.name} onChange={v => updCert(cert.id, 'name', v)} span2 />
                <F label="Issuing Organisation" value={cert.issuer} onChange={v => updCert(cert.id, 'issuer', v)} />
                <F label="Year" value={cert.year} onChange={v => updCert(cert.id, 'year', v)} />
                {data.certifications.length > 1 && (
                  <button onClick={() => removeCert(cert.id)} className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-semibold transition-colors">
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>
            ))}
            <button onClick={addCert} className="w-full py-2.5 border-2 border-dashed border-blue-300 dark:border-blue-800 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Add Certification
            </button>
          </div>
        </Section>

        {/* Languages */}
        <Section title="Languages" icon={<span className="text-lg">🌐</span>}
          visible={data.sectionVisibility.languages} onToggleVisibility={() => toggleVis('languages')}>
          <F label="Languages (comma-separated)" value={data.languages} onChange={v => upd('languages', v)} span2
            placeholder="Hindi (Native), English (Fluent)..." />
        </Section>

        {/* Achievements */}
        <Section title="Achievements (Optional)" icon={<span className="text-lg">⭐</span>}
          visible={data.sectionVisibility.achievements} onToggleVisibility={() => toggleVis('achievements')}>
          <F label="Achievements" value={data.achievements} onChange={v => upd('achievements', v)} type="textarea" span2 />
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

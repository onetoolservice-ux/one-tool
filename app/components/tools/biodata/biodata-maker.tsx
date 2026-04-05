"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download, RefreshCw, Heart, Briefcase, ChevronDown, ChevronUp,
  Upload, X, User, ArrowRight, ArrowLeft, Check, Loader2, Pencil,
  RotateCcw, Eye, EyeOff
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showToast } from '@/app/shared/Toast';
import { MAX_IMAGE_FILE_SIZE } from '@/app/lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 'form' | 'gallery';
type Mode = 'matrimonial' | 'job';
type Template = 'modern' | 'traditional' | 'professional' | 'elegant' | 'shagun';
type PhotoShape = 'square' | 'rounded' | 'circle';
type ResizeHandle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';
type BlockId = 'header' | 'nameblock' | 'photo' | 'education' | 'family' | 'contact' | 'hobbies' | 'expectations';

const RESIZE_HANDLES: { id: ResizeHandle; pos: React.CSSProperties; cursor: string }[] = [
  { id: 'nw', pos: { top: -5, left: -5 },                                      cursor: 'nwse-resize' },
  { id: 'n',  pos: { top: -5, left: '50%', transform: 'translateX(-50%)' },    cursor: 'ns-resize'   },
  { id: 'ne', pos: { top: -5, right: -5 },                                      cursor: 'nesw-resize' },
  { id: 'w',  pos: { top: '50%', left: -5, transform: 'translateY(-50%)' },    cursor: 'ew-resize'   },
  { id: 'e',  pos: { top: '50%', right: -5, transform: 'translateY(-50%)' },   cursor: 'ew-resize'   },
  { id: 'sw', pos: { bottom: -5, left: -5 },                                    cursor: 'nesw-resize' },
  { id: 's',  pos: { bottom: -5, left: '50%', transform: 'translateX(-50%)' }, cursor: 'ns-resize'   },
  { id: 'se', pos: { bottom: -5, right: -5 },                                   cursor: 'nwse-resize' },
];
type BlockPos = { dx: number; dy: number };
type BlockPositions = Record<BlockId, BlockPos>;

interface CustomField { id: string; label: string; value: string }

const ALL_BLOCK_IDS: BlockId[] = ['header', 'nameblock', 'photo', 'education', 'family', 'contact', 'hobbies', 'expectations'];
const DEFAULT_POSITIONS: BlockPositions = Object.fromEntries(ALL_BLOCK_IDS.map(id => [id, { dx: 0, dy: 0 }])) as BlockPositions;

interface MatrimonialData {
  name: string; dob: string; age: string; timeOfBirth: string; placeOfBirth: string;
  height: string; weight: string; complexion: string; bloodGroup: string;
  religion: string; caste: string; subCaste: string; gotra: string;
  manglik: string; rashi: string; nakshatra: string;
  education: string; occupation: string; employer: string; annualIncome: string;
  fatherName: string; fatherOccupation: string; motherName: string; motherOccupation: string;
  familyType: string; familyStatus: string; nativePlace: string; siblings: string;
  address: string; city: string; state: string; phone: string; altPhone: string; email: string;
  hobbies: string; expectations: string;
}

interface EduRow { id: number; degree: string; board: string; year: string; marks: string }
interface ExpRow { id: number; org: string; designation: string; period: string; reason: string }

interface JobData {
  name: string; dob: string; gender: string; nationality: string;
  religion: string; category: string; maritalStatus: string;
  fatherName: string; motherName: string;
  permanentAddress: string; presentAddress: string; phone: string; email: string;
  education: EduRow[];
  experience: ExpRow[];
  skills: string; languages: string;
  ref1Name: string; ref1Designation: string; ref1Contact: string;
  ref2Name: string; ref2Designation: string; ref2Contact: string;
  place: string; date: string;
}

const TEMPLATE_COLORS: Record<Template, { primary: string; gradient: string; accent: string; light: string }> = {
  modern:       { primary: '#1e3a5f', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', accent: '#2563eb', light: '#eff6ff' },
  traditional:  { primary: '#92400e', gradient: 'linear-gradient(135deg, #92400e 0%, #f97316 100%)', accent: '#ea580c', light: '#fff7ed' },
  professional: { primary: '#0f172a', gradient: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', accent: '#334155', light: '#f1f5f9' },
  elegant:      { primary: '#881337', gradient: 'linear-gradient(135deg, #881337 0%, #e11d48 100%)', accent: '#e11d48', light: '#fff1f2' },
  shagun:       { primary: '#3a0b12', gradient: 'linear-gradient(135deg, #3a0b12 0%, #5c1020 100%)', accent: '#c9a227', light: '#f0deb0' },
};

const TEMPLATES: { id: Template; name: string; dot?: string }[] = [
  { id: 'modern',       name: 'Modern' },
  { id: 'traditional',  name: 'Traditional' },
  { id: 'professional', name: 'Professional' },
  { id: 'elegant',      name: 'Elegant' },
  { id: 'shagun',       name: 'Shagun ✨' },
];

const defaultMatrimonial: MatrimonialData = {
  name: '', dob: '', age: '', timeOfBirth: '', placeOfBirth: '',
  height: '', weight: '', complexion: '', bloodGroup: '',
  religion: 'Hindu', caste: '', subCaste: '', gotra: '', manglik: 'No', rashi: '', nakshatra: '',
  education: '', occupation: '', employer: '', annualIncome: '',
  fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
  familyType: '', familyStatus: '', nativePlace: '', siblings: '',
  address: '', city: '', state: '', phone: '', altPhone: '', email: '',
  hobbies: '', expectations: '',
};

const defaultEdu: EduRow[] = [
  { id: 1, degree: '10th', board: '', year: '', marks: '' },
  { id: 2, degree: '12th', board: '', year: '', marks: '' },
  { id: 3, degree: 'Graduation', board: '', year: '', marks: '' },
];

const defaultJob: JobData = {
  name: '', dob: '', gender: '', nationality: 'Indian',
  religion: '', category: 'General', maritalStatus: '',
  fatherName: '', motherName: '',
  permanentAddress: '', presentAddress: '', phone: '', email: '',
  education: defaultEdu,
  experience: [{ id: 1, org: '', designation: '', period: '', reason: '' }],
  skills: '', languages: '',
  ref1Name: '', ref1Designation: '', ref1Contact: '',
  ref2Name: '', ref2Designation: '', ref2Contact: '',
  place: '', date: '',
};

const STORAGE_KEY = 'ots_biodata_v1';

// ─── Hindi label translations ─────────────────────────────────────────────────
const HINDI_LABELS: Record<string, string> = {
  'Date of Birth': 'जन्म तिथि', 'Place of Birth': 'जन्म स्थान', 'Age': 'आयु',
  'Time of Birth': 'जन्म समय', 'Rashi': 'राशि', 'Nakshatra': 'नक्षत्र',
  'Religion': 'धर्म', 'Caste': 'जाति', 'Sub Caste': 'उप जाति',
  'Gotra': 'गोत्र', 'Manglik': 'मांगलिक', 'Complexion': 'रंग',
  'Height': 'ऊंचाई', 'Weight': 'वजन', 'Blood Group': 'रक्त समूह',
  'Education': 'शिक्षा', 'Occupation': 'व्यवसाय', 'Employer': 'नियोक्ता',
  'Annual Income': 'वार्षिक आय', "Father's Name": 'पिता का नाम',
  "Father's Occupation": 'पिता का व्यवसाय', "Mother's Name": 'माता का नाम',
  "Mother's Occupation": 'माता का व्यवसाय', 'Siblings': 'भाई-बहन',
  'Family Type': 'परिवार का प्रकार', 'Family Status': 'पारिवारिक स्थिति',
  'Native Place': 'मूल स्थान', 'Phone no.': 'फोन नं.', 'Alt. Phone': 'वैकल्पिक फोन',
  'Email': 'ईमेल', 'Address': 'पता',
  'Family Details': 'पारिवारिक विवरण', 'Contact Details': 'संपर्क विवरण',
  'Hobbies & Interests': 'शौक और रुचियाँ', 'Expectations': 'अपेक्षाएं',
};

// Sidebar thumbnail dimensions
const THUMB_W = 156;
const THUMB_SCALE = THUMB_W / 794;
// Full preview dimensions (shown on right when template is selected)
const FULL_SCALE = 0.72;
const FULL_W = Math.round(794 * FULL_SCALE);   // ≈ 572px
const FULL_H = Math.round(1123 * FULL_SCALE);  // ≈ 809px

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
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-white resize-none transition-colors" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-700 text-slate-900 dark:text-white transition-colors" />
      )}
    </div>
  );
}

function Sel({ label, value, onChange, options, span2 = false }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; span2?: boolean;
}) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full h-10 px-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-colors">
        <option value="">— Select —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Shagun: Gold Corner Ornament ────────────────────────────────────────────
function ShagunCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const G = '#c9a227';
  const t: Record<string, string> = {
    tl: '',
    tr: 'translate(65 0) scale(-1 1)',
    bl: 'translate(0 65) scale(1 -1)',
    br: 'translate(65 65) scale(-1 -1)',
  };
  return (
    <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform={t[pos]}>
        {/* Outer diagonal accent lines */}
        <line x1="5" y1="30" x2="30" y2="5" stroke={G} strokeWidth="0.7" opacity="0.6"/>
        <line x1="5" y1="40" x2="40" y2="5" stroke={G} strokeWidth="0.4" opacity="0.4"/>
        {/* Main scroll curl */}
        <path d="M7,57 C7,42 13,32 22,25 C31,18 39,20 41,9" stroke={G} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Secondary lighter curl */}
        <path d="M13,57 C13,44 18,35 26,29 C34,23 41,24 43,14" stroke={G} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.65"/>
        {/* Teardrop leaf at bottom of scroll */}
        <path d="M5,60 C1,56 4,51 9,54 C13,57 11,63 7,63 C3,63 2,62 5,60 Z" fill={G}/>
        {/* Teardrop leaf at top of scroll */}
        <path d="M43,7 C47,3 53,6 51,12 C49,17 44,15 44,9 C44,5 41,4 43,7 Z" fill={G}/>
        {/* Diamond accent mid-curl */}
        <path d="M24,29 L27,25 L30,29 L27,33 Z" fill={G} opacity="0.85"/>
        {/* Small border lines */}
        <line x1="5" y1="57" x2="26" y2="57" stroke={G} strokeWidth="0.8" opacity="0.7"/>
        <line x1="7" y1="32" x2="7" y2="61" stroke={G} strokeWidth="0.8" opacity="0.7"/>
        {/* Dot accents along curl */}
        <circle cx="33" cy="22" r="1.5" fill={G} opacity="0.7"/>
        <circle cx="16" cy="43" r="1.5" fill={G} opacity="0.7"/>
        <circle cx="9" cy="9" r="2.2" fill={G} opacity="0.45"/>
      </g>
    </svg>
  );
}

// ─── A4 Document: Shagun — Dark Traditional Indian Matrimonial ────────────────
function ShagunMatrimonialDocument({
  data, photo, logo,
  fontScale = 1, photoW = 125, photoH, labelLang = 'en',
  editMode = false, onUpdate, startResize,
  blockPositions, hiddenBlocks = [], photoShape = 'square', startDrag,
  blockDomRefs, photoDomRef,
  customFields = [], onAddField, onUpdateField, onRemoveField,
}: {
  data: MatrimonialData; photo: string | null; logo: string | null;
  fontScale?: number; photoW?: number; photoH?: number; labelLang?: 'en' | 'hi';
  editMode?: boolean; onUpdate?: (field: keyof MatrimonialData, val: string) => void;
  startResize?: (handle: ResizeHandle, e: React.MouseEvent) => void;
  blockPositions?: BlockPositions;
  hiddenBlocks?: BlockId[];
  photoShape?: PhotoShape;
  startDrag?: (id: BlockId, e: React.MouseEvent) => void;
  blockDomRefs?: React.MutableRefObject<Partial<Record<BlockId, HTMLDivElement | null>>>;
  photoDomRef?: React.MutableRefObject<HTMLDivElement | null>;
  customFields?: CustomField[];
  onAddField?: () => void;
  onUpdateField?: (id: string, key: 'label' | 'value', val: string) => void;
  onRemoveField?: (id: string) => void;
}) {
  const G  = '#c9a227';
  const GL = '#d4b866';
  const CR = '#f0deb0';
  const BG = '#3a0b12';
  const WH = '#ffffff';
  const fs  = (n: number) => Math.round(n * fontScale * 10) / 10;
  const lbl = (en: string) => labelLang === 'hi' ? (HINDI_LABELS[en] ?? en) : en;
  const resolvedPhotoH = photoH ?? Math.round(photoW * 1.24);
  const photoRadius = photoShape === 'circle' ? '50%' : photoShape === 'rounded' ? '14px' : '0px';

  const editStyle = editMode ? { outline: 'none', borderBottom: '1px dashed rgba(255,255,255,0.3)', cursor: 'text', minWidth: '30px', display: 'inline-block' } : {};

  // ── Draggable block wrapper ──────────────────────────────────────────────────
  const D = (id: BlockId, children: React.ReactNode, extraStyle?: React.CSSProperties) => {
    if (hiddenBlocks.includes(id)) return null;
    const pos = blockPositions?.[id] ?? { dx: 0, dy: 0 };
    return (
      <div
        ref={el => { if (blockDomRefs) blockDomRefs.current[id] = el; }}
        key={id}
        onMouseDown={editMode && startDrag ? (e => { e.stopPropagation(); startDrag(id, e); }) : undefined}
        style={{
          transform: `translate(${pos.dx}px, ${pos.dy}px)`,
          position: 'relative',
          cursor: editMode ? 'grab' : 'default',
          userSelect: 'none',
          outline: editMode ? '1px dashed rgba(201,162,39,0.4)' : 'none',
          outlineOffset: '4px',
          ...extraStyle,
        }}
      >
        {editMode && (
          <div style={{ position: 'absolute', top: -14, left: 0, zIndex: 20, fontSize: '8px', background: G, color: BG, padding: '1px 5px', borderRadius: 3, fontFamily: 'Arial', fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap', opacity: 0.85 }}>
            ⠿ {id}
          </div>
        )}
        {children}
      </div>
    );
  };

  // Only render rows that have a value — no placeholder dashes
  const row = (label: string, value: string, field?: keyof MatrimonialData) => {
    if (!value) return null;
    return (
      <div key={label} style={{ display: 'flex', alignItems: 'flex-start', padding: `${fs(4)}px 0` }}>
        <span style={{ minWidth: '148px', fontSize: `${fs(11.5)}px`, color: GL, fontWeight: 500, fontFamily: 'Arial, sans-serif', flexShrink: 0 }}>{lbl(label)}</span>
        <span style={{ fontSize: `${fs(11.5)}px`, color: GL, marginRight: '10px', flexShrink: 0, fontWeight: 600 }}>:</span>
        <span
          {...(editMode && field ? { contentEditable: true, suppressContentEditableWarning: true } : {})}
          onBlur={editMode && field && onUpdate ? (e => onUpdate(field, e.currentTarget.textContent || '')) : undefined}
          style={{ fontSize: `${fs(11.5)}px`, color: CR, fontFamily: 'Arial, sans-serif', lineHeight: 1.45, ...(editMode && field ? editStyle : {}) }}
        >{value}</span>
      </div>
    );
  };

  const sectionHdr = (title: string) => (
    <div style={{ marginTop: `${fs(18)}px`, marginBottom: `${fs(10)}px` }}>
      <span style={{ fontSize: `${fs(15)}px`, fontWeight: 700, color: WH, fontFamily: 'Arial, sans-serif', borderBottom: `2px solid ${G}`, paddingBottom: '3px' }}>
        {lbl(title)}
      </span>
    </div>
  );

  return (
    <div style={{ width: '794px', minHeight: '1123px', background: BG, position: 'relative', boxSizing: 'border-box' }}>
      {/* Gold outer border */}
      <div style={{ position: 'absolute', inset: '10px', border: `3px solid ${G}`, pointerEvents: 'none', zIndex: 2 }} />
      {/* Thin inner border */}
      <div style={{ position: 'absolute', inset: '19px', border: `1px solid ${G}55`, pointerEvents: 'none', zIndex: 2 }} />

      {/* Corner ornaments */}
      <div style={{ position: 'absolute', top: 0,    left: 0,   zIndex: 5 }}><ShagunCorner pos="tl" /></div>
      <div style={{ position: 'absolute', top: 0,    right: 0,  zIndex: 5 }}><ShagunCorner pos="tr" /></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0,   zIndex: 5 }}><ShagunCorner pos="bl" /></div>
      <div style={{ position: 'absolute', bottom: 0, right: 0,  zIndex: 5 }}><ShagunCorner pos="br" /></div>

      {/* Large watermark OM */}
      <div style={{ position: 'absolute', bottom: '55px', right: '42px', fontSize: '210px', color: `${G}16`, fontFamily: 'serif', lineHeight: 1, userSelect: 'none', zIndex: 1, pointerEvents: 'none' }}>ॐ</div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 4, padding: '40px 52px 50px 52px' }}>

        {/* ── Header: blessing / logo ── */}
        {D('header', (
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            {logo ? (
              <img src={logo} alt="logo" style={{ maxHeight: '72px', maxWidth: '200px', objectFit: 'contain', margin: '0 auto 6px', display: 'block' }} />
            ) : (
              <div style={{ fontSize: `${fs(42)}px`, color: G, fontFamily: 'serif', marginBottom: '4px', lineHeight: 1 }}>ॐ</div>
            )}
            <div style={{ fontSize: `${fs(13)}px`, color: G, fontFamily: 'serif', letterSpacing: '2.5px', fontWeight: 400 }}>गणेशाय नमः</div>
          </div>
        ))}

        {/* ── Name block (left) + Photo (right) — each independently draggable ── */}
        <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
          {D('nameblock', (
            <div>
              {/* Name */}
              <div
                {...(editMode ? { contentEditable: true, suppressContentEditableWarning: true } : {})}
                onBlur={editMode && onUpdate ? (e => onUpdate('name', e.currentTarget.textContent || '')) : undefined}
                style={{
                  fontSize: `${fs(29)}px`, fontWeight: 700, color: WH, fontFamily: 'Arial, sans-serif',
                  marginBottom: `${fs(10)}px`, letterSpacing: '0.3px', textAlign: 'center',
                  ...(editMode ? { outline: 'none', borderBottom: `1px dashed ${G}88`, cursor: 'text' } : {}),
                }}
              >{data.name || 'Your Name'}</div>
              <div style={{ height: '1px', background: `linear-gradient(to right, ${G}cc, ${G}33, transparent)`, marginBottom: `${fs(10)}px` }} />
              {row('Date of Birth', data.dob, 'dob')}
              {row('Place of Birth', data.placeOfBirth, 'placeOfBirth')}
              {row('Age', data.age ? `${data.age} Years` : '', 'age')}
              {row('Time of Birth', data.timeOfBirth, 'timeOfBirth')}
              {row('Rashi', data.rashi, 'rashi')}
              {row('Nakshatra', data.nakshatra, 'nakshatra')}
              {row('Religion', data.religion, 'religion')}
              {row('Caste', data.caste, 'caste')}
              {row('Sub Caste', data.subCaste, 'subCaste')}
              {row('Gotra', data.gotra, 'gotra')}
              {row('Manglik', data.manglik && data.manglik !== 'No' ? data.manglik : '', 'manglik')}
              {row('Complexion', data.complexion, 'complexion')}
              {row('Height', data.height, 'height')}
              {row('Weight', data.weight, 'weight')}
              {row('Blood Group', data.bloodGroup, 'bloodGroup')}

              {/* ── Custom fields ── */}
              {customFields.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'flex-start', padding: `${fs(4)}px 0`, position: 'relative' }}>
                  <span
                    {...(editMode ? { contentEditable: true, suppressContentEditableWarning: true } : {})}
                    onBlur={editMode && onUpdateField ? (e => onUpdateField(f.id, 'label', e.currentTarget.textContent || '')) : undefined}
                    style={{ minWidth: '148px', fontSize: `${fs(11.5)}px`, color: GL, fontWeight: 500, fontFamily: 'Arial, sans-serif', flexShrink: 0, ...(editMode ? { outline: 'none', borderBottom: `1px dashed ${GL}55`, cursor: 'text' } : {}) }}
                  >{f.label}</span>
                  <span style={{ fontSize: `${fs(11.5)}px`, color: GL, marginRight: '10px', flexShrink: 0, fontWeight: 600 }}>:</span>
                  <span
                    {...(editMode ? { contentEditable: true, suppressContentEditableWarning: true } : {})}
                    onBlur={editMode && onUpdateField ? (e => onUpdateField(f.id, 'value', e.currentTarget.textContent || '')) : undefined}
                    style={{ fontSize: `${fs(11.5)}px`, color: CR, fontFamily: 'Arial, sans-serif', lineHeight: 1.45, ...(editMode ? editStyle : {}) }}
                  >{f.value}</span>
                  {editMode && onRemoveField && (
                    <span onMouseDown={e => { e.stopPropagation(); onRemoveField(f.id); }} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: `${GL}aa`, cursor: 'pointer', fontFamily: 'Arial', lineHeight: 1, padding: '0 2px' }}>✕</span>
                  )}
                </div>
              ))}
              {/* Add Field button */}
              {editMode && onAddField && (
                <div onMouseDown={e => { e.stopPropagation(); onAddField(); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: `${fs(8)}px`, cursor: 'pointer', color: G, fontSize: `${fs(10)}px`, fontFamily: 'Arial, sans-serif', opacity: 0.75, userSelect: 'none' }}>
                  <span style={{ fontSize: `${fs(14)}px`, lineHeight: 1 }}>+</span> Add Field
                </div>
              )}
            </div>
          ), { flex: 1 })}

          {D('photo', (
            <div style={{ position: 'relative', display: 'inline-block', width: `${photoW}px`, height: `${resolvedPhotoH}px` }}>
              {/* Photo box — ref for direct DOM resize */}
              <div
                ref={el => { if (photoDomRef) photoDomRef.current = el; }}
                style={{ width: '100%', height: '100%', border: `3px solid ${G}`, overflow: 'hidden', background: '#2a0810', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: photoRadius, boxSizing: 'border-box' }}
              >
                {photo
                  ? <img src={photo} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: photoRadius }} />
                  : <div style={{ color: `${G}80`, fontSize: '10px', textAlign: 'center', fontFamily: 'Arial', padding: '8px' }}>📷<br/>Photo</div>
                }
              </div>
              {/* 8 resize handles — only in editMode */}
              {editMode && startResize && RESIZE_HANDLES.map(h => (
                <div
                  key={h.id}
                  onMouseDown={e => { e.stopPropagation(); startResize(h.id, e); }}
                  style={{
                    position: 'absolute', ...h.pos,
                    width: 10, height: 10,
                    background: G, border: '1.5px solid #3a0b12',
                    borderRadius: 2, cursor: h.cursor, zIndex: 15,
                  }}
                />
              ))}
            </div>
          ), { flexShrink: 0, marginTop: '52px' })}
        </div>

        {/* ── Education & Career — only if any field has data ── */}
        {(data.education || data.occupation || data.employer || data.annualIncome) && D('education', (
          <div style={{ marginTop: '4px' }}>
            {row('Education', data.education, 'education')}
            {row('Occupation', data.occupation, 'occupation')}
            {row('Employer', data.employer, 'employer')}
            {row('Annual Income', data.annualIncome ? `₹ ${data.annualIncome}` : '', 'annualIncome')}
          </div>
        ))}

        {/* ── Family Details — only if any field has data ── */}
        {(data.fatherName || data.motherName || data.siblings || data.familyType || data.familyStatus || data.nativePlace) && D('family', (
          <>
            {sectionHdr('Family Details')}
            <div style={{ height: '1px', background: `${G}44`, marginBottom: '8px' }} />
            {row("Father's Name", data.fatherName, 'fatherName')}
            {row("Father's Occupation", data.fatherOccupation, 'fatherOccupation')}
            {row("Mother's Name", data.motherName, 'motherName')}
            {row("Mother's Occupation", data.motherOccupation, 'motherOccupation')}
            {row('Siblings', data.siblings, 'siblings')}
            {row('Family Type', data.familyType, 'familyType')}
            {row('Family Status', data.familyStatus, 'familyStatus')}
            {row('Native Place', data.nativePlace, 'nativePlace')}
          </>
        ))}

        {/* ── Contact Details — only if any field has data ── */}
        {(data.phone || data.altPhone || data.email || data.address || data.city) && D('contact', (
          <>
            {sectionHdr('Contact Details')}
            <div style={{ height: '1px', background: `${G}44`, marginBottom: '8px' }} />
            {row('Phone no.', data.phone, 'phone')}
            {row('Alt. Phone', data.altPhone, 'altPhone')}
            {row('Email', data.email, 'email')}
            {row('Address', [data.address, data.city, data.state].filter(Boolean).join(', '), 'address')}
          </>
        ))}

        {/* ── Hobbies — only if filled ── */}
        {data.hobbies && D('hobbies', (
          <>
            {sectionHdr('Hobbies & Interests')}
            <div
              {...(editMode ? { contentEditable: true, suppressContentEditableWarning: true } : {})}
              onBlur={editMode && onUpdate ? (e => onUpdate('hobbies', e.currentTarget.textContent || '')) : undefined}
              style={{ fontSize: `${fs(11.5)}px`, color: CR, fontFamily: 'Arial, sans-serif', lineHeight: 1.7, marginTop: '4px', ...(editMode ? { outline: 'none', cursor: 'text', borderBottom: '1px dashed rgba(255,255,255,0.3)' } : {}) }}
            >{data.hobbies}</div>
          </>
        ))}

        {/* ── Expectations — only if filled ── */}
        {data.expectations && D('expectations', (
          <>
            {sectionHdr('Expectations')}
            <div
              {...(editMode ? { contentEditable: true, suppressContentEditableWarning: true } : {})}
              onBlur={editMode && onUpdate ? (e => onUpdate('expectations', e.currentTarget.textContent || '')) : undefined}
              style={{ fontSize: `${fs(11.5)}px`, color: CR, fontFamily: 'Arial, sans-serif', lineHeight: 1.7, marginTop: '4px', padding: '10px 14px', border: `1px solid ${G}33`, background: `${G}0a`, ...(editMode ? { outline: 'none', cursor: 'text' } : {}) }}
            >{data.expectations}</div>
          </>
        ))}
      </div>
    </div>
  );
}

// ─── A4 Document: Matrimonial ─────────────────────────────────────────────────
function MatrimonialDocument({ data, photo, template, logo, fontScale, photoW, photoH, labelLang, editMode, onUpdate, startResize, blockPositions, hiddenBlocks, photoShape, startDrag, blockDomRefs, photoDomRef, customFields, onAddField, onUpdateField, onRemoveField }: {
  data: MatrimonialData; photo: string | null; template: Template; logo?: string | null;
  fontScale?: number; photoW?: number; photoH?: number; labelLang?: 'en' | 'hi';
  editMode?: boolean; onUpdate?: (field: keyof MatrimonialData, val: string) => void;
  startResize?: (handle: ResizeHandle, e: React.MouseEvent) => void;
  blockPositions?: BlockPositions; hiddenBlocks?: BlockId[]; photoShape?: PhotoShape;
  startDrag?: (id: BlockId, e: React.MouseEvent) => void;
  blockDomRefs?: React.MutableRefObject<Partial<Record<BlockId, HTMLDivElement | null>>>;
  photoDomRef?: React.MutableRefObject<HTMLDivElement | null>;
  customFields?: CustomField[];
  onAddField?: () => void;
  onUpdateField?: (id: string, key: 'label' | 'value', val: string) => void;
  onRemoveField?: (id: string) => void;
}) {
  // Shagun has its own full renderer
  if (template === 'shagun') return <ShagunMatrimonialDocument data={data} photo={photo} logo={logo ?? null} fontScale={fontScale} photoW={photoW} photoH={photoH} labelLang={labelLang} editMode={editMode} onUpdate={onUpdate} startResize={startResize} blockPositions={blockPositions} hiddenBlocks={hiddenBlocks} photoShape={photoShape} startDrag={startDrag} blockDomRefs={blockDomRefs} photoDomRef={photoDomRef} customFields={customFields} onAddField={onAddField} onUpdateField={onUpdateField} onRemoveField={onRemoveField} />;
  const c = TEMPLATE_COLORS[template];
  const row = (label: string, value: string) => value ? (
    <div key={label} style={{ display: 'flex', gap: '8px', padding: '3px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ minWidth: '140px', fontSize: '9.5px', color: '#666', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '9.5px', color: '#111' }}>: {value}</span>
    </div>
  ) : null;

  const section = (title: string, fields: [string, string][]) => {
    const visible = fields.filter(([, v]) => v);
    if (!visible.length) return null;
    return (
      <div key={title} style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '9px', fontWeight: 800, color: c.primary, letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: `2px solid ${c.accent}`, paddingBottom: '3px', marginBottom: '6px' }}>{title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          {visible.map(([l, v]) => row(l, v))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: "'Georgia', serif", position: 'relative' }}>
      <div style={{ background: c.gradient, padding: '28px 32px 22px', position: 'relative' }}>
        {photo && (
          <div style={{ position: 'absolute', top: '20px', right: '28px', width: '90px', height: '110px', border: '3px solid rgba(255,255,255,0.8)', borderRadius: '6px', overflow: 'hidden', background: '#eee' }}>
            <img src={photo} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>Matrimonial Bio Data</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{data.name || 'Your Name'}</div>
        {(data.dob || data.age) && (
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', fontFamily: 'Arial, sans-serif' }}>
            {data.dob && `DOB: ${data.dob}`}{data.dob && data.age && '  •  '}{data.age && `Age: ${data.age} Years`}
          </div>
        )}
      </div>
      <div style={{ background: c.light, padding: '20px 32px 28px' }}>
        {section('Personal Details', [
          ['Date of Birth', data.dob], ['Age', data.age ? `${data.age} Years` : ''],
          ['Time of Birth', data.timeOfBirth], ['Place of Birth', data.placeOfBirth],
          ['Height', data.height], ['Weight', data.weight],
          ['Complexion', data.complexion], ['Blood Group', data.bloodGroup],
        ])}
        {section('Religious & Cultural', [
          ['Religion', data.religion], ['Caste', data.caste],
          ['Sub Caste', data.subCaste], ['Gotra', data.gotra],
          ['Manglik', data.manglik], ['Rashi', data.rashi],
          ['Nakshatra', data.nakshatra],
        ])}
        {section('Education & Career', [
          ['Education', data.education], ['Occupation', data.occupation],
          ['Employer', data.employer], ['Annual Income', data.annualIncome],
        ])}
        {section('Family Details', [
          ["Father's Name", data.fatherName], ["Father's Occupation", data.fatherOccupation],
          ["Mother's Name", data.motherName], ["Mother's Occupation", data.motherOccupation],
          ['Family Type', data.familyType], ['Family Status', data.familyStatus],
          ['Native Place', data.nativePlace], ['Siblings', data.siblings],
        ])}
        {section('Contact Information', [
          ['Address', data.address], ['City', data.city],
          ['State', data.state], ['Phone', data.phone],
          ['Alternate Phone', data.altPhone], ['Email', data.email],
        ])}
        {data.hobbies && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: c.primary, letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: `2px solid ${c.accent}`, paddingBottom: '3px', marginBottom: '6px' }}>Hobbies & Interests</div>
            <div style={{ fontSize: '10px', color: '#333', lineHeight: '1.6' }}>{data.hobbies}</div>
          </div>
        )}
        {data.expectations && (
          <div style={{ marginTop: '10px', padding: '12px 16px', background: 'rgba(255,255,255,0.7)', border: `1px solid ${c.accent}30`, borderRadius: '6px' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: c.primary, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>Partner Expectations</div>
            <div style={{ fontSize: '10px', color: '#333', lineHeight: '1.7' }}>{data.expectations}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── A4 Document: Job Bio Data ────────────────────────────────────────────────
function JobDocument({ data, photo, template }: { data: JobData; photo: string | null; template: Template }) {
  const c = TEMPLATE_COLORS[template];
  const row = (label: string, value: string) => value ? (
    <div key={label} style={{ display: 'flex', gap: '8px', padding: '3px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ minWidth: '140px', fontSize: '9.5px', color: '#555', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '9.5px', color: '#111' }}>: {value}</span>
    </div>
  ) : null;

  const filledEdu = data.education.filter(e => e.degree || e.board || e.year || e.marks);
  const filledExp = data.experience.filter(e => e.org || e.designation);

  return (
    <div style={{ width: '794px', minHeight: '1123px', background: '#fff', fontFamily: 'Arial, sans-serif', position: 'relative' }}>
      <div style={{ background: c.gradient, padding: '24px 32px 18px', position: 'relative' }}>
        {photo && (
          <div style={{ position: 'absolute', top: '16px', right: '28px', width: '80px', height: '100px', border: '3px solid rgba(255,255,255,0.8)', borderRadius: '4px', overflow: 'hidden' }}>
            <img src={photo} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>Bio Data / Curriculum Vitae</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{data.name || 'Your Name'}</div>
        {data.phone && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>Ph: {data.phone}{data.email ? ` | ${data.email}` : ''}</div>}
      </div>
      <div style={{ padding: '18px 32px 28px' }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: c.primary, letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: `2px solid ${c.accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Personal Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            {row("Date of Birth", data.dob)}
            {row("Gender", data.gender)}
            {row("Nationality", data.nationality)}
            {row("Religion", data.religion)}
            {row("Category", data.category)}
            {row("Marital Status", data.maritalStatus)}
            {row("Father's Name", data.fatherName)}
            {row("Mother's Name", data.motherName)}
          </div>
        </div>
        {(data.permanentAddress || data.presentAddress) && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: c.primary, letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: `2px solid ${c.accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Address & Contact</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {data.permanentAddress && (
                <div>
                  <div style={{ fontSize: '9px', color: '#888', fontWeight: 700, marginBottom: '3px' }}>Permanent Address</div>
                  <div style={{ fontSize: '9.5px', color: '#333', lineHeight: 1.6 }}>{data.permanentAddress}</div>
                </div>
              )}
              {data.presentAddress && (
                <div>
                  <div style={{ fontSize: '9px', color: '#888', fontWeight: 700, marginBottom: '3px' }}>Present Address</div>
                  <div style={{ fontSize: '9.5px', color: '#333', lineHeight: 1.6 }}>{data.presentAddress}</div>
                </div>
              )}
            </div>
          </div>
        )}
        {filledEdu.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: c.primary, letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: `2px solid ${c.accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Educational Qualifications</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
              <thead>
                <tr style={{ background: c.primary }}>
                  {['Examination', 'Board / University', 'Year', 'Marks / Grade'].map(h => (
                    <th key={h} style={{ padding: '5px 8px', color: '#fff', textAlign: 'left', fontWeight: 700, fontSize: '8.5px', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filledEdu.map((e, i) => (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : c.light }}>
                    <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>{e.degree}</td>
                    <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>{e.board}</td>
                    <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>{e.year}</td>
                    <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>{e.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filledExp.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: c.primary, letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: `2px solid ${c.accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Work Experience</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px' }}>
              <thead>
                <tr style={{ background: c.primary }}>
                  {['Organisation', 'Designation', 'Period', 'Reason for Leaving'].map(h => (
                    <th key={h} style={{ padding: '5px 8px', color: '#fff', textAlign: 'left', fontWeight: 700, fontSize: '8.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filledExp.map((e, i) => (
                  <tr key={e.id} style={{ background: i % 2 === 0 ? '#fff' : c.light }}>
                    <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>{e.org}</td>
                    <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>{e.designation}</td>
                    <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>{e.period}</td>
                    <td style={{ padding: '4px 8px', border: '1px solid #e5e7eb' }}>{e.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(data.skills || data.languages) && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: c.primary, letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: `2px solid ${c.accent}`, paddingBottom: '3px', marginBottom: '8px' }}>Skills & Languages</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {data.skills && <div><span style={{ fontSize: '9px', color: '#888', fontWeight: 700 }}>Skills: </span><span style={{ fontSize: '9.5px', color: '#333' }}>{data.skills}</span></div>}
              {data.languages && <div><span style={{ fontSize: '9px', color: '#888', fontWeight: 700 }}>Languages: </span><span style={{ fontSize: '9.5px', color: '#333' }}>{data.languages}</span></div>}
            </div>
          </div>
        )}
        {(data.ref1Name || data.ref2Name) && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: c.primary, letterSpacing: '1.5px', textTransform: 'uppercase', borderBottom: `2px solid ${c.accent}`, paddingBottom: '3px', marginBottom: '8px' }}>References</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {data.ref1Name && (
                <div style={{ border: `1px solid ${c.accent}30`, borderRadius: '4px', padding: '8px 10px', background: c.light }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#222' }}>{data.ref1Name}</div>
                  {data.ref1Designation && <div style={{ fontSize: '9px', color: '#666' }}>{data.ref1Designation}</div>}
                  {data.ref1Contact && <div style={{ fontSize: '9px', color: '#666' }}>{data.ref1Contact}</div>}
                </div>
              )}
              {data.ref2Name && (
                <div style={{ border: `1px solid ${c.accent}30`, borderRadius: '4px', padding: '8px 10px', background: c.light }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#222' }}>{data.ref2Name}</div>
                  {data.ref2Designation && <div style={{ fontSize: '9px', color: '#666' }}>{data.ref2Designation}</div>}
                  {data.ref2Contact && <div style={{ fontSize: '9px', color: '#666' }}>{data.ref2Contact}</div>}
                </div>
              )}
            </div>
          </div>
        )}
        <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
          <div style={{ fontSize: '9.5px', color: '#555', fontStyle: 'italic', lineHeight: 1.7, marginBottom: '16px' }}>
            I hereby declare that the above information is true, complete and correct to the best of my knowledge and belief.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
            <div style={{ fontSize: '9.5px', color: '#444' }}>Place: {data.place || '___________'}</div>
            <div style={{ fontSize: '9.5px', color: '#444' }}>Date: {data.date || '___________'}</div>
            <div style={{ fontSize: '9.5px', color: '#444', borderTop: '1px solid #999', paddingTop: '4px', minWidth: '120px', textAlign: 'center' }}>Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function BiodataMaker() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [downloading, setDownloading] = useState(false);
  const [mode, setMode] = useState<Mode>('matrimonial');
  const [selectedTemplate, setSelectedTemplate] = useState<Template>('modern');
  const [savedBadge, setSavedBadge] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [shagunLogo, setShagunLogo] = useState<string | null>(null);
  const [matData, setMatData] = useState<MatrimonialData>(defaultMatrimonial);
  const [jobData, setJobData] = useState<JobData>(defaultJob);
  // Gallery editing controls
  const [fontScale, setFontScale] = useState(1);
  const [photoW, setPhotoW] = useState(125);
  const [photoH, setPhotoH] = useState(155);
  const [labelLang, setLabelLang] = useState<'en' | 'hi'>('en');
  const [editMode, setEditMode] = useState(false);
  // Canva-like block controls
  const [blockPositions, setBlockPositions] = useState<BlockPositions>({ ...DEFAULT_POSITIONS });
  const [hiddenBlocks, setHiddenBlocks] = useState<BlockId[]>([]);
  const [photoShape, setPhotoShape] = useState<PhotoShape>('square');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const downloadRef = useRef<HTMLDivElement>(null);
  // Refs for stable drag/resize handlers
  const blockPosRef = useRef<BlockPositions>({ ...DEFAULT_POSITIONS });
  const photoWRef = useRef(125);
  const photoHRef = useRef(155);
  const blockDomRefs = useRef<Partial<Record<BlockId, HTMLDivElement | null>>>({});
  const photoDomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate);
        if (parsed.matData) setMatData({ ...defaultMatrimonial, ...parsed.matData });
        if (parsed.jobData) setJobData({ ...defaultJob, ...parsed.jobData });
        if (parsed.photo) setPhoto(parsed.photo);
        if (parsed.shagunLogo) setShagunLogo(parsed.shagunLogo);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, selectedTemplate, matData, jobData, photo, shagunLogo }));
      triggerSaveBadge();
    } catch { /* ignore */ }
  }, [mode, selectedTemplate, matData, jobData, photo, shagunLogo, mounted, triggerSaveBadge]);

  // Keep refs in sync with state
  useEffect(() => { photoWRef.current = photoW; }, [photoW]);
  useEffect(() => { photoHRef.current = photoH; }, [photoH]);
  useEffect(() => { blockPosRef.current = blockPositions; }, [blockPositions]);

  // Stable drag-to-reposition handler — direct DOM mutation for 60fps smoothness
  const startDrag = useCallback((blockId: BlockId, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startDx = blockPosRef.current[blockId].dx;
    const startDy = blockPosRef.current[blockId].dy;
    const onMove = (ev: MouseEvent) => {
      const newDx = startDx + (ev.clientX - startX) / FULL_SCALE;
      const newDy = startDy + (ev.clientY - startY) / FULL_SCALE;
      // Direct DOM mutation — zero React overhead during drag
      const el = blockDomRefs.current[blockId];
      if (el) el.style.transform = `translate(${newDx}px, ${newDy}px)`;
      blockPosRef.current[blockId] = { dx: newDx, dy: newDy };
    };
    const onUp = () => {
      // Commit final position to React state (single re-render on mouse up)
      setBlockPositions({ ...blockPosRef.current });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []); // stable — closes over refs only

  // Stable free-resize handler — 8 handles, independent W×H, direct DOM mutation
  const startResize = useCallback((handle: ResizeHandle, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = photoWRef.current;
    const startH = photoHRef.current;
    const startPos = { ...blockPosRef.current['photo'] };

    const onMove = (ev: MouseEvent) => {
      const deltaX = (ev.clientX - startX) / FULL_SCALE;
      const deltaY = (ev.clientY - startY) / FULL_SCALE;

      let newW = startW, newH = startH;
      let newDx = startPos.dx, newDy = startPos.dy;

      // Horizontal
      if (handle.includes('e')) newW = Math.max(50, startW + deltaX);
      if (handle.includes('w')) { newW = Math.max(50, startW - deltaX); newDx = startPos.dx + (startW - newW); }

      // Vertical
      if (handle.includes('s')) newH = Math.max(50, startH + deltaY);
      if (handle.includes('n')) { newH = Math.max(50, startH - deltaY); newDy = startPos.dy + (startH - newH); }

      // Direct DOM mutations — zero React overhead during drag
      const photoEl = photoDomRef.current;
      if (photoEl) {
        const outer = photoEl.parentElement as HTMLDivElement | null;
        if (outer) { outer.style.width = `${newW}px`; outer.style.height = `${newH}px`; }
        photoEl.style.width = `${newW}px`;
        photoEl.style.height = `${newH}px`;
      }
      const blockEl = blockDomRefs.current['photo'];
      if (blockEl) blockEl.style.transform = `translate(${newDx}px, ${newDy}px)`;

      // Update refs for stable next-drag start values
      photoWRef.current = newW;
      photoHRef.current = newH;
      blockPosRef.current['photo'] = { dx: newDx, dy: newDy };
    };

    const onUp = () => {
      // Commit final values to state (single re-render)
      setPhotoW(Math.round(photoWRef.current));
      setPhotoH(Math.round(photoHRef.current));
      setBlockPositions({ ...blockPosRef.current });
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []); // stable — closes over refs only

  const addCustomField = useCallback(() => {
    setCustomFields(prev => [...prev, { id: Date.now().toString(), label: 'Label', value: 'Value' }]);
  }, []);
  const updateCustomField = useCallback((id: string, key: 'label' | 'value', val: string) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  }, []);
  const removeCustomField = useCallback((id: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  }, []);

  const resetLayout = useCallback(() => {
    blockPosRef.current = { ...DEFAULT_POSITIONS };
    setBlockPositions({ ...DEFAULT_POSITIONS });
    setHiddenBlocks([]);
    setPhotoShape('square');
    setPhotoW(125); photoWRef.current = 125;
    setPhotoH(155); photoHRef.current = 155;
    setFontScale(1);
  }, []);

  const setMat = (field: keyof MatrimonialData, val: string) =>
    setMatData(p => ({ ...p, [field]: val }));
  const setJob = (field: keyof Omit<JobData, 'education' | 'experience'>, val: string) =>
    setJobData(p => ({ ...p, [field]: val }));

  const updateEdu = (id: number, field: keyof EduRow, val: string) =>
    setJobData(p => ({ ...p, education: p.education.map(r => r.id === id ? { ...r, [field]: val } : r) }));
  const addEdu = () => setJobData(p => ({ ...p, education: [...p.education, { id: Date.now(), degree: '', board: '', year: '', marks: '' }] }));
  const removeEdu = (id: number) => setJobData(p => ({ ...p, education: p.education.filter(r => r.id !== id) }));

  const updateExp = (id: number, field: keyof ExpRow, val: string) =>
    setJobData(p => ({ ...p, experience: p.experience.map(r => r.id === id ? { ...r, [field]: val } : r) }));
  const addExp = () => setJobData(p => ({ ...p, experience: [...p.experience, { id: Date.now(), org: '', designation: '', period: '', reason: '' }] }));
  const removeExp = (id: number) => setJobData(p => ({ ...p, experience: p.experience.filter(r => r.id !== id) }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_FILE_SIZE) { showToast('Image too large (max 10MB)', 'error'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { showToast('Only JPG, PNG or WebP allowed', 'error'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_FILE_SIZE) { showToast('Image too large (max 10MB)', 'error'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      showToast('Only JPG, PNG, WebP or SVG allowed', 'error'); return;
    }
    const reader = new FileReader();
    reader.onload = ev => setShagunLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const reset = () => {
    if (!window.confirm('Reset all data? This cannot be undone.')) return;
    setMatData(defaultMatrimonial);
    setJobData(defaultJob);
    setPhoto(null);
    setShagunLogo(null);
    setMode('matrimonial');
    setSelectedTemplate('modern');
    localStorage.removeItem(STORAGE_KEY);
    showToast('Reset to defaults', 'success');
  };

  const downloadPDF = async () => {
    if (!downloadRef.current) return;
    const name = mode === 'matrimonial' ? matData.name : jobData.name;
    setDownloading(true);
    try {
      // backgroundColor: null preserves element's own background (important for dark templates like Shagun)
      const canvas = await html2canvas(downloadRef.current, { scale: 2, useCORS: true, backgroundColor: null, logging: false });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
      pdf.save(`${(name || 'BioData').replace(/\s+/g, '_')}_${selectedTemplate}_BioData.pdf`);
      showToast('Bio Data downloaded!', 'success');
    } catch {
      showToast('PDF generation failed', 'error');
    } finally { setDownloading(false); }
  };

  if (!mounted) return null;

  // Props shared between live preview and PDF capture (no editMode in PDF)
  const shagunProps = { fontScale, photoW, photoH, labelLang, blockPositions, hiddenBlocks, photoShape, customFields };

  const currentDoc = mode === 'matrimonial'
    ? <MatrimonialDocument data={matData} photo={photo} template={selectedTemplate} logo={shagunLogo} {...shagunProps} editMode={false} />
    : <JobDocument data={jobData} photo={photo} template={selectedTemplate} />;

  // ── Step 2: Gallery — thumbnail picker (left) + full live preview (right) ───
  if (step === 'gallery') {
    const selName = TEMPLATES.find(t => t.id === selectedTemplate)?.name ?? '';
    return (
      <div className="flex flex-col bg-slate-100 dark:bg-[#0F111A]" style={{ height: '100dvh' }}>

        {/* ── Top bar ── */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 z-10 flex-wrap">
          <button onClick={() => setStep('form')}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            <ArrowLeft size={15} /> Edit Details
          </button>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">Choose a Design</h2>

          {/* ── Shagun-only editing controls ── */}
          {selectedTemplate === 'shagun' && mode === 'matrimonial' && (
            <>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
              {/* Edit mode toggle */}
              <button
                onClick={() => setEditMode(v => !v)}
                title={editMode ? 'Exit edit mode' : 'Edit & reposition blocks'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${editMode ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <Pencil size={12} /> {editMode ? 'Editing' : 'Edit'}
              </button>
              {/* Font size */}
              <div className="flex items-center gap-0 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <button onClick={() => setFontScale(v => Math.max(0.75, Math.round((v - 0.05) * 20) / 20))} className="px-2 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Decrease font size">A−</button>
                <span className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 border-x border-slate-200 dark:border-slate-700 min-w-[40px] text-center">{Math.round(fontScale * 100)}%</span>
                <button onClick={() => setFontScale(v => Math.min(1.4, Math.round((v + 0.05) * 20) / 20))} className="px-2 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Increase font size">A+</button>
              </div>
              {/* Language */}
              <button
                onClick={() => setLabelLang(v => v === 'en' ? 'hi' : 'en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${labelLang === 'hi' ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >{labelLang === 'hi' ? 'अ हिन्दी' : 'A Eng'}</button>
              {/* Photo shape */}
              <div className="flex items-center gap-0 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden" title="Photo shape">
                {(['square','rounded','circle'] as PhotoShape[]).map(s => (
                  <button key={s} onClick={() => setPhotoShape(s)}
                    className={`px-2.5 py-1.5 text-sm transition-colors ${photoShape === s ? 'bg-amber-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                    {s === 'square' ? '▢' : s === 'rounded' ? '▣' : '◯'}
                  </button>
                ))}
              </div>
              {/* Section visibility toggles */}
              <div className="flex items-center gap-1 flex-wrap">
                {(['education','family','contact','hobbies','expectations'] as BlockId[]).map(id => {
                  const hidden = hiddenBlocks.includes(id);
                  return (
                    <button key={id}
                      onClick={() => setHiddenBlocks(prev => hidden ? prev.filter(b => b !== id) : [...prev, id])}
                      title={`${hidden ? 'Show' : 'Hide'} ${id}`}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-all ${hidden ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'}`}>
                      {hidden ? <EyeOff size={10} /> : <Eye size={10} />}
                      {id.charAt(0).toUpperCase() + id.slice(1, 4)}
                    </button>
                  );
                })}
              </div>
              {/* Reset layout */}
              <button onClick={resetLayout} title="Reset all layout changes"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-500 transition-all">
                <RotateCcw size={11} /> Reset
              </button>
            </>
          )}

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
                      {mode === 'matrimonial'
                        ? <MatrimonialDocument data={matData} photo={photo} template={tpl.id} logo={shagunLogo} />
                        : <JobDocument data={jobData} photo={photo} template={tpl.id} />}
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
          <div className="flex-1 overflow-auto flex flex-col justify-start items-center py-8 px-6 bg-slate-300 dark:bg-slate-800">
            {editMode && selectedTemplate === 'shagun' && (
              <p className="text-xs text-amber-800 bg-amber-100 border border-amber-300 rounded-lg px-3 py-1.5 mb-4 flex items-center gap-2 flex-wrap">
                <Pencil size={11} className="shrink-0" />
                <span>Drag any section to reposition · Click text to edit · Gold ◢ handle on photo = resize</span>
              </p>
            )}
            <div style={{
              width: FULL_W, height: FULL_H,
              overflow: 'hidden', flexShrink: 0,
              boxShadow: '0 12px 60px rgba(0,0,0,0.35)',
              borderRadius: 4,
              outline: editMode ? '2px solid #f59e0b' : 'none',
            }}>
              <div style={{ width: 794, transform: `scale(${FULL_SCALE})`, transformOrigin: 'top left', pointerEvents: editMode ? 'auto' : 'none' }}>
                {mode === 'matrimonial'
                  ? <MatrimonialDocument data={matData} photo={photo} template={selectedTemplate} logo={shagunLogo} {...shagunProps} editMode={editMode} onUpdate={setMat} startResize={startResize} startDrag={startDrag} blockDomRefs={blockDomRefs} photoDomRef={photoDomRef} onAddField={addCustomField} onUpdateField={updateCustomField} onRemoveField={removeCustomField} />
                  : <JobDocument data={jobData} photo={photo} template={selectedTemplate} />}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden full-scale target for PDF capture */}
        <div ref={downloadRef} style={{ position: 'fixed', left: '-9999px', top: 0, zIndex: -1, width: '794px' }}>
          {currentDoc}
        </div>
      </div>
    );
  }

  // ── Step 1: Form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F111A]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button onClick={() => setMode('matrimonial')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'matrimonial' ? 'bg-white dark:bg-slate-700 shadow text-rose-600' : 'text-slate-500 dark:text-slate-400'}`}>
              <Heart size={12} /> Matrimonial
            </button>
            <button onClick={() => setMode('job')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'job' ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500 dark:text-slate-400'}`}>
              <Briefcase size={12} /> Job Bio Data
            </button>
          </div>
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

        {/* Photo Upload */}
        <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <span className="font-semibold text-slate-800 dark:text-white flex items-center gap-3">
              <User size={18} className="text-slate-400" /> Photo (Optional)
            </span>
          </div>
          <div className="px-5 py-4 flex items-center gap-4">
            <div className="w-20 h-24 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {photo ? <img src={photo} alt="preview" className="w-full h-full object-cover" /> : <User size={24} className="text-slate-400" />}
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer transition-colors text-slate-700 dark:text-slate-200">
                <Upload size={14} /> Upload Photo
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="hidden" />
              </label>
              {photo && (
                <button onClick={() => setPhoto(null)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors">
                  <X size={14} /> Remove
                </button>
              )}
              <p className="text-xs text-slate-400">JPG / PNG / WebP, max 10MB</p>
            </div>
          </div>
        </div>

        {/* ── Shagun Header Logo (only when Shagun template is active) ── */}
        {selectedTemplate === 'shagun' && mode === 'matrimonial' && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-700/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Header Logo</span>
                <span className="ml-2 text-xs text-amber-600 dark:text-amber-500">Shagun template · replaces ॐ</span>
              </div>
              {shagunLogo && (
                <button onClick={() => setShagunLogo(null)} className="text-xs text-rose-500 hover:underline flex items-center gap-1">
                  <X size={10} /> Remove
                </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Preview box */}
              <div className="w-20 h-16 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-600 flex items-center justify-center overflow-hidden bg-[#3a0b12]">
                {shagunLogo
                  ? <img src={shagunLogo} alt="logo" className="w-full h-full object-contain p-1" />
                  : <span style={{ fontSize: '28px', color: '#c9a227' }}>ॐ</span>
                }
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-amber-100 dark:bg-amber-800/40 hover:bg-amber-200 dark:hover:bg-amber-700/40 border border-amber-300 dark:border-amber-600 rounded-xl cursor-pointer transition-colors text-amber-800 dark:text-amber-300">
                  <Upload size={14} /> Upload Logo / Image
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
                </label>
                <p className="text-xs text-amber-700/70 dark:text-amber-500/70">Ganesh, deity or custom logo<br />PNG with transparency works best</p>
              </div>
            </div>
          </div>
        )}

        {/* Matrimonial Form */}
        {mode === 'matrimonial' && (
          <>
            <Section title="Personal Details" icon={<User size={18} className="text-rose-500" />} defaultOpen>
              <F label="Full Name" value={matData.name} onChange={v => setMat('name', v)} span2 />
              <F label="Date of Birth" value={matData.dob} onChange={v => setMat('dob', v)} placeholder="dd/mm/yyyy" />
              <F label="Age" value={matData.age} onChange={v => setMat('age', v)} placeholder="e.g. 28" />
              <F label="Time of Birth" value={matData.timeOfBirth} onChange={v => setMat('timeOfBirth', v)} placeholder="e.g. 10:30 AM" />
              <F label="Place of Birth" value={matData.placeOfBirth} onChange={v => setMat('placeOfBirth', v)} />
              <F label="Height" value={matData.height} onChange={v => setMat('height', v)} placeholder="e.g. 5'6&quot;" />
              <F label="Weight" value={matData.weight} onChange={v => setMat('weight', v)} placeholder="e.g. 60 kg" />
              <F label="Complexion" value={matData.complexion} onChange={v => setMat('complexion', v)} />
              <F label="Blood Group" value={matData.bloodGroup} onChange={v => setMat('bloodGroup', v)} />
            </Section>

            <Section title="Religious & Cultural" icon={<span className="text-lg">🕉️</span>}>
              <F label="Religion" value={matData.religion} onChange={v => setMat('religion', v)} />
              <F label="Caste" value={matData.caste} onChange={v => setMat('caste', v)} />
              <F label="Sub Caste" value={matData.subCaste} onChange={v => setMat('subCaste', v)} />
              <F label="Gotra" value={matData.gotra} onChange={v => setMat('gotra', v)} />
              <Sel label="Manglik" value={matData.manglik} onChange={v => setMat('manglik', v)} options={['No', 'Mild', 'Yes']} />
              <F label="Rashi" value={matData.rashi} onChange={v => setMat('rashi', v)} />
              <F label="Nakshatra" value={matData.nakshatra} onChange={v => setMat('nakshatra', v)} />
            </Section>

            <Section title="Education & Career" icon={<Briefcase size={18} className="text-blue-500" />}>
              <F label="Education" value={matData.education} onChange={v => setMat('education', v)} span2 />
              <F label="Occupation" value={matData.occupation} onChange={v => setMat('occupation', v)} span2 />
              <F label="Employer / Company" value={matData.employer} onChange={v => setMat('employer', v)} span2 />
              <F label="Annual Income" value={matData.annualIncome} onChange={v => setMat('annualIncome', v)} span2 />
            </Section>

            <Section title="Family Details" icon={<Heart size={18} className="text-rose-500" />}>
              <F label="Father's Name" value={matData.fatherName} onChange={v => setMat('fatherName', v)} />
              <F label="Father's Occupation" value={matData.fatherOccupation} onChange={v => setMat('fatherOccupation', v)} />
              <F label="Mother's Name" value={matData.motherName} onChange={v => setMat('motherName', v)} />
              <F label="Mother's Occupation" value={matData.motherOccupation} onChange={v => setMat('motherOccupation', v)} />
              <Sel label="Family Type" value={matData.familyType} onChange={v => setMat('familyType', v)} options={['Nuclear', 'Joint', 'Extended']} />
              <Sel label="Family Status" value={matData.familyStatus} onChange={v => setMat('familyStatus', v)} options={['Middle Class', 'Upper Middle Class', 'Affluent', 'Rich']} />
              <F label="Native Place" value={matData.nativePlace} onChange={v => setMat('nativePlace', v)} />
              <F label="Siblings" value={matData.siblings} onChange={v => setMat('siblings', v)} placeholder="e.g. 1 brother, 1 sister" />
            </Section>

            <Section title="Contact Information" icon={<span className="text-lg">📞</span>}>
              <F label="Address" value={matData.address} onChange={v => setMat('address', v)} span2 />
              <F label="City" value={matData.city} onChange={v => setMat('city', v)} />
              <F label="State" value={matData.state} onChange={v => setMat('state', v)} />
              <F label="Phone" value={matData.phone} onChange={v => setMat('phone', v)} />
              <F label="Alternate Phone" value={matData.altPhone} onChange={v => setMat('altPhone', v)} />
              <F label="Email" value={matData.email} onChange={v => setMat('email', v)} type="email" span2 />
            </Section>

            <Section title="Hobbies & Expectations" icon={<span className="text-lg">✨</span>}>
              <F label="Hobbies & Interests" value={matData.hobbies} onChange={v => setMat('hobbies', v)} type="textarea" span2 />
              <F label="Partner Expectations" value={matData.expectations} onChange={v => setMat('expectations', v)} type="textarea" span2 />
            </Section>
          </>
        )}

        {/* Job Bio Data Form */}
        {mode === 'job' && (
          <>
            <Section title="Personal Information" icon={<User size={18} className="text-blue-500" />} defaultOpen>
              <F label="Full Name" value={jobData.name} onChange={v => setJob('name', v)} span2 />
              <F label="Date of Birth" value={jobData.dob} onChange={v => setJob('dob', v)} placeholder="dd/mm/yyyy" />
              <Sel label="Gender" value={jobData.gender} onChange={v => setJob('gender', v)} options={['Male', 'Female', 'Other']} />
              <F label="Nationality" value={jobData.nationality} onChange={v => setJob('nationality', v)} />
              <F label="Religion" value={jobData.religion} onChange={v => setJob('religion', v)} />
              <Sel label="Category" value={jobData.category} onChange={v => setJob('category', v)} options={['General', 'SC', 'ST', 'OBC', 'EWS']} />
              <Sel label="Marital Status" value={jobData.maritalStatus} onChange={v => setJob('maritalStatus', v)} options={['Single', 'Married', 'Divorced', 'Widowed']} />
            </Section>

            <Section title="Family Details" icon={<Heart size={18} className="text-rose-500" />}>
              <F label="Father's Name" value={jobData.fatherName} onChange={v => setJob('fatherName', v)} span2 />
              <F label="Mother's Name" value={jobData.motherName} onChange={v => setJob('motherName', v)} span2 />
            </Section>

            <Section title="Address & Contact" icon={<span className="text-lg">📍</span>}>
              <F label="Permanent Address" value={jobData.permanentAddress} onChange={v => setJob('permanentAddress', v)} type="textarea" span2 />
              <F label="Present Address" value={jobData.presentAddress} onChange={v => setJob('presentAddress', v)} type="textarea" span2 />
              <F label="Phone" value={jobData.phone} onChange={v => setJob('phone', v)} />
              <F label="Email" value={jobData.email} onChange={v => setJob('email', v)} type="email" />
            </Section>

            <Section title="Educational Qualifications" icon={<span className="text-lg">🎓</span>}>
              <div className="col-span-2 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {['Degree', 'Board / University', 'Year', 'Marks / Grade'].map(h => (
                    <span key={h} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</span>
                  ))}
                </div>
                {jobData.education.map(row => (
                  <div key={row.id} className="grid grid-cols-4 gap-2 items-center">
                    <input value={row.degree} onChange={e => updateEdu(row.id, 'degree', e.target.value)}
                      className="h-9 px-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                    <input value={row.board} onChange={e => updateEdu(row.id, 'board', e.target.value)}
                      className="h-9 px-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                    <input value={row.year} onChange={e => updateEdu(row.id, 'year', e.target.value)}
                      className="h-9 px-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                    <div className="flex gap-1 items-center">
                      <input value={row.marks} onChange={e => updateEdu(row.id, 'marks', e.target.value)}
                        className="h-9 px-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white w-full" />
                      {jobData.education.length > 1 && (
                        <button onClick={() => removeEdu(row.id)} className="text-rose-400 hover:text-rose-600 flex-shrink-0 transition-colors"><X size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={addEdu} className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors">
                  <span className="text-base leading-none">+</span> Add Row
                </button>
              </div>
            </Section>

            <Section title="Work Experience" icon={<Briefcase size={18} className="text-green-500" />}>
              <div className="col-span-2 space-y-3">
                <p className="text-xs text-slate-400">No experience? Leave rows empty — they won't appear in the PDF.</p>
                <div className="grid grid-cols-4 gap-2">
                  {['Organisation', 'Designation', 'Period', 'Reason'].map(h => (
                    <span key={h} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</span>
                  ))}
                </div>
                {jobData.experience.map(row => (
                  <div key={row.id} className="grid grid-cols-4 gap-2 items-center">
                    <input value={row.org} onChange={e => updateExp(row.id, 'org', e.target.value)}
                      className="h-9 px-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                    <input value={row.designation} onChange={e => updateExp(row.id, 'designation', e.target.value)}
                      className="h-9 px-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                    <input value={row.period} onChange={e => updateExp(row.id, 'period', e.target.value)}
                      className="h-9 px-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
                    <div className="flex gap-1 items-center">
                      <input value={row.reason} onChange={e => updateExp(row.id, 'reason', e.target.value)}
                        className="h-9 px-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white w-full" />
                      {jobData.experience.length > 1 && (
                        <button onClick={() => removeExp(row.id)} className="text-rose-400 hover:text-rose-600 flex-shrink-0 transition-colors"><X size={14} /></button>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={addExp} className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors">
                  <span className="text-base leading-none">+</span> Add Row
                </button>
              </div>
            </Section>

            <Section title="Skills & Languages" icon={<span className="text-lg">💡</span>}>
              <F label="Skills (comma-separated)" value={jobData.skills} onChange={v => setJob('skills', v)} type="textarea" span2 />
              <F label="Languages Known" value={jobData.languages} onChange={v => setJob('languages', v)} placeholder="e.g. Hindi, English, Marathi" span2 />
            </Section>

            <Section title="References" icon={<span className="text-lg">👤</span>}>
              <p className="col-span-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">Reference 1</p>
              <F label="Name" value={jobData.ref1Name} onChange={v => setJob('ref1Name', v)} />
              <F label="Designation" value={jobData.ref1Designation} onChange={v => setJob('ref1Designation', v)} />
              <F label="Contact" value={jobData.ref1Contact} onChange={v => setJob('ref1Contact', v)} span2 />
              <p className="col-span-2 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Reference 2</p>
              <F label="Name" value={jobData.ref2Name} onChange={v => setJob('ref2Name', v)} />
              <F label="Designation" value={jobData.ref2Designation} onChange={v => setJob('ref2Designation', v)} />
              <F label="Contact" value={jobData.ref2Contact} onChange={v => setJob('ref2Contact', v)} span2 />
            </Section>

            <Section title="Declaration" icon={<span className="text-lg">📜</span>}>
              <F label="Place" value={jobData.place} onChange={v => setJob('place', v)} />
              <F label="Date" value={jobData.date} onChange={v => setJob('date', v)} placeholder="dd/mm/yyyy" />
            </Section>
          </>
        )}

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

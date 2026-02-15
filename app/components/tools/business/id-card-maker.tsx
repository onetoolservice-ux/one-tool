"use client";
import React, { useState, useRef, useCallback } from 'react';
import {
  User, MapPin, Phone, Download, Upload, CreditCard,
  Repeat, Palette, Shield, Building, Calendar, Hash, RefreshCw
} from 'lucide-react';
import { showToast } from '@/app/shared/Toast';
import { MAX_IMAGE_FILE_SIZE } from '@/app/lib/constants';

// ─── Theme definitions ────────────────────────────────────────────────────────
const THEMES = {
  corporate: {
    name: 'Corporate',
    header: 'linear-gradient(135deg, #1d4ed8 0%, #3730a3 100%)',
    accent: '#1d4ed8',
    badge: '#eff6ff',
    badgeText: '#1d4ed8',
    dot: '#60a5fa',
  },
  executive: {
    name: 'Executive',
    header: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    accent: '#334155',
    badge: '#f1f5f9',
    badgeText: '#334155',
    dot: '#94a3b8',
  },
  emerald: {
    name: 'Emerald',
    header: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
    accent: '#065f46',
    badge: '#ecfdf5',
    badgeText: '#065f46',
    dot: '#34d399',
  },
  ruby: {
    name: 'Ruby',
    header: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
    accent: '#be123c',
    badge: '#fff1f2',
    badgeText: '#be123c',
    dot: '#fb7185',
  },
  violet: {
    name: 'Violet',
    header: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
    accent: '#5b21b6',
    badge: '#f5f3ff',
    badgeText: '#5b21b6',
    dot: '#a78bfa',
  },
} as const;

type ThemeKey = keyof typeof THEMES;

interface CardData {
  name: string;
  role: string;
  department: string;
  orgName: string;
  empId: string;
  location: string;
  phone: string;
  email: string;
  blood: string;
  emergency: string;
  emergencyPhone: string;
  validUntil: string;
  address: string;
  terms: string;
}

// ─── QR code using inline SVG (no external URL) ──────────────────────────────
const QRPlaceholder = ({ value, size = 64, color = '#1e293b' }: { value: string; size?: number; color?: string }) => {
  // Simple deterministic pattern based on value string
  const hash = value.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffffffff, 0);
  const cells = 7;
  const grid: boolean[][] = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Fixed finder patterns + data
      if (r < 2 && c < 2) return true;
      if (r < 2 && c > cells - 3) return true;
      if (r > cells - 3 && c < 2) return true;
      return !!((hash >> ((r * cells + c) % 32)) & 1);
    })
  );
  const cell = size / cells;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <rect width={size} height={size} fill="white" />
      {grid.flatMap((row, r) =>
        row.map((on, c) =>
          on ? <rect key={`${r}-${c}`} x={c * cell + 0.5} y={r * cell + 0.5} width={cell - 1} height={cell - 1} fill={color} /> : null
        )
      )}
    </svg>
  );
};

// ─── ID Card Front ────────────────────────────────────────────────────────────
const CardFront = React.forwardRef<HTMLDivElement, { data: CardData; theme: ThemeKey; photo: string | null }>(
  ({ data, theme, photo }, ref) => {
    const t = THEMES[theme];
    return (
      <div ref={ref} style={{ width: 340, height: 540, borderRadius: 20, overflow: 'hidden', background: '#fff', fontFamily: 'Arial, sans-serif', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', position: 'relative', flexShrink: 0 }}>
        {/* Header */}
        <div style={{ background: t.header, padding: '20px 20px 60px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1.5, margin: 0 }}>{data.orgName}</p>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', margin: '4px 0 0' }}>Identity Card</p>
            </div>
            <Shield size={22} color="rgba(255,255,255,0.4)" />
          </div>
        </div>

        {/* Photo */}
        <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', width: 90, height: 90, borderRadius: '50%', border: '4px solid white', overflow: 'hidden', background: '#e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 10 }}>
          {photo
            ? <img src={photo} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={40} color="#94a3b8" />
              </div>
          }
        </div>

        {/* Body */}
        <div style={{ paddingTop: 56, paddingBottom: 16, paddingLeft: 20, paddingRight: 20, textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: 0.3 }}>{data.name}</h2>
          <p style={{ fontSize: 10, fontWeight: 800, color: t.accent, textTransform: 'uppercase', letterSpacing: 1.5, margin: '4px 0 0' }}>{data.role}</p>
          {data.department && (
            <div style={{ display: 'inline-block', background: t.badge, color: t.badgeText, fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 20, marginTop: 6, letterSpacing: 0.5 }}>
              {data.department}
            </div>
          )}
        </div>

        {/* Info rows */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: '#', label: 'Employee ID', val: data.empId },
            { icon: '📍', label: 'Location', val: data.location },
            { icon: '📞', label: 'Phone', val: data.phone },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', padding: '8px 12px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.badge, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{row.icon}</div>
              <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                <p style={{ fontSize: 8, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: 0, letterSpacing: 0.5 }}>{row.label}</p>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
          <div>
            {data.validUntil && <p style={{ fontSize: 8, color: '#94a3b8', margin: 0 }}>Valid Until: <b style={{ color: '#0f172a' }}>{data.validUntil}</b></p>}
          </div>
          <QRPlaceholder value={`${data.orgName}|${data.empId}|${data.name}`} size={40} color={t.accent} />
        </div>
      </div>
    );
  }
);
CardFront.displayName = 'CardFront';

// ─── ID Card Back ─────────────────────────────────────────────────────────────
const CardBack = React.forwardRef<HTMLDivElement, { data: CardData; theme: ThemeKey }>(
  ({ data, theme }, ref) => {
    const t = THEMES[theme];
    return (
      <div ref={ref} style={{ width: 340, height: 540, borderRadius: 20, overflow: 'hidden', background: '#0f172a', fontFamily: 'Arial, sans-serif', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', color: '#fff', position: 'relative', flexShrink: 0 }}>
        {/* Top stripe */}
        <div style={{ height: 6, background: t.header }} />

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 2, margin: 0 }}>{data.orgName}</p>
          <h2 style={{ fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: 2, textTransform: 'uppercase', margin: '4px 0 0' }}>Emergency Information</h2>
        </div>

        {/* Blood Group */}
        <div style={{ padding: '20px 24px 12px', textAlign: 'center' }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, margin: 0 }}>Blood Group</p>
          <p style={{ fontSize: 36, fontWeight: 900, color: '#f87171', margin: '4px 0 0', letterSpacing: 2 }}>{data.blood || '—'}</p>
        </div>

        {/* Emergency contact */}
        <div style={{ padding: '0 20px 16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>Emergency Contact</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>{data.emergency || '—'}</p>
            {data.emergencyPhone && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>{data.emergencyPhone}</p>}
          </div>
        </div>

        {/* Address */}
        {data.address && (
          <div style={{ padding: '0 20px 12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 4px' }}>Office Address</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.5 }}>{data.address}</p>
            </div>
          </div>
        )}

        {/* Terms */}
        {data.terms && (
          <div style={{ padding: '0 20px' }}>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>{data.terms}</p>
          </div>
        )}

        {/* Bottom strip */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: t.header, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{ width: 4, height: 20, background: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
          ))}
        </div>
      </div>
    );
  }
);
CardBack.displayName = 'CardBack';

// ─── Main Component ───────────────────────────────────────────────────────────
export const IdCardMaker = () => {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [theme, setTheme] = useState<ThemeKey>('corporate');
  const [photo, setPhoto] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const [data, setData] = useState<CardData>({
    name: 'Arjun Mehta',
    role: 'Senior Software Engineer',
    department: 'Engineering',
    orgName: 'TechCorp Solutions',
    empId: 'EMP-2025-042',
    location: 'Bangalore, India',
    phone: '+91 98765 43210',
    email: 'arjun.mehta@techcorp.com',
    blood: 'O+',
    emergency: 'Priya Mehta (Spouse)',
    emergencyPhone: '+91 87654 32109',
    validUntil: 'Dec 2026',
    address: 'Prestige Tech Park, Whitefield, Bangalore – 560066',
    terms: 'If found, please return to Security Desk or contact HR. Misuse of this card is a punishable offence.',
  });

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const set = (k: keyof CardData, v: string) => setData(prev => ({ ...prev, [k]: v }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return showToast('Upload JPG, PNG or WebP', 'error');
    if (file.size > MAX_IMAGE_FILE_SIZE) return showToast('Image exceeds size limit', 'error');
    setPhoto(URL.createObjectURL(file));
  };

  const download = async () => {
    const ref = side === 'front' ? frontRef : backRef;
    if (!ref.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(ref.current, { scale: 3, backgroundColor: null, useCORS: true });
      const link = document.createElement('a');
      link.download = `ID_${data.name.replace(/\s+/g, '_')}_${side}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      showToast('ID Card downloaded', 'success');
    } catch { showToast('Download failed', 'error'); }
    finally { setDownloading(false); }
  };

  const F = ({ label, value, onChange, placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wide">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-8 px-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-wrap">
        <CreditCard size={18} className="text-blue-600" />
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">ID Card Maker</span>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Front/Back toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(['front', 'back'] as const).map(s => (
            <button key={s} onClick={() => setSide(s)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${side === s ? 'bg-white dark:bg-slate-700 shadow text-blue-600' : 'text-slate-500'}`}>
              {s === 'front' ? 'Front Side' : 'Back Side'}
            </button>
          ))}
        </div>

        {/* Theme dots */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Theme:</span>
          {(Object.keys(THEMES) as ThemeKey[]).map(k => (
            <button key={k} onClick={() => setTheme(k)}
              title={THEMES[k].name}
              className={`w-5 h-5 rounded-full border-2 transition-all ${theme === k ? 'border-slate-700 scale-125 shadow-md' : 'border-transparent'}`}
              style={{ background: THEMES[k].header }}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={download} disabled={downloading}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow transition-all disabled:opacity-50">
            <Download size={13} /> {downloading ? 'Downloading…' : `Download ${side === 'front' ? 'Front' : 'Back'}`}
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <span className="font-bold text-slate-700 dark:text-slate-300">{data.orgName}</span>
        <span>·</span>
        <span>{data.name}</span>
        <span>·</span>
        <span>{data.role}{data.department ? ` · ${data.department}` : ''}</span>
        <span>·</span>
        <span>ID: {data.empId}</span>
        {data.validUntil && <><span>·</span><span className="text-amber-600 font-semibold">Valid: {data.validUntil}</span></>}
        <span className="ml-auto font-semibold text-slate-600 dark:text-slate-300">Theme: {THEMES[theme].name}</span>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-[300px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4 space-y-4">

            {/* Organisation */}
            <section className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building size={12} /> Organisation</p>
              <F label="Organisation Name" value={data.orgName} onChange={v => set('orgName', v)} placeholder="TechCorp Solutions" />
            </section>

            {/* Employee */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User size={12} /> Employee</p>
              <F label="Full Name" value={data.name} onChange={v => set('name', v)} />
              <F label="Role / Designation" value={data.role} onChange={v => set('role', v)} />
              <F label="Department" value={data.department} onChange={v => set('department', v)} />
              <F label="Employee ID" value={data.empId} onChange={v => set('empId', v)} />
              <F label="Location" value={data.location} onChange={v => set('location', v)} />
              <F label="Phone" value={data.phone} onChange={v => set('phone', v)} />
              <F label="Email" value={data.email} onChange={v => set('email', v)} />
              <F label="Valid Until" value={data.validUntil} onChange={v => set('validUntil', v)} placeholder="Dec 2026" />

              {/* Photo upload */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Photo</label>
                <label className="flex items-center gap-2 h-8 px-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  {photo
                    ? <img src={photo} alt="Photo" className="w-5 h-5 rounded-full object-cover" />
                    : <Upload size={13} className="text-slate-400" />
                  }
                  <span className="text-xs text-slate-500">{photo ? 'Change photo' : 'Upload photo'}</span>
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} />
                </label>
              </div>
            </section>

            {/* Emergency / Back Info */}
            <section className="space-y-2 pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Shield size={12} /> Back Side Info</p>
              <F label="Blood Group" value={data.blood} onChange={v => set('blood', v)} placeholder="O+" />
              <F label="Emergency Contact" value={data.emergency} onChange={v => set('emergency', v)} />
              <F label="Emergency Phone" value={data.emergencyPhone} onChange={v => set('emergencyPhone', v)} />
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Office Address</label>
                <textarea value={data.address} onChange={e => set('address', e.target.value)} rows={2}
                  className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Terms / Note</label>
                <textarea value={data.terms} onChange={e => set('terms', e.target.value)} rows={2}
                  className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-blue-500 text-slate-900 dark:text-white resize-none" />
              </div>
            </section>

          </div>
        </div>

        {/* ── RIGHT: CARD PREVIEW ── */}
        <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-950 flex flex-col items-center justify-center py-8 px-4 gap-8">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              {side === 'front' ? 'Front Side Preview' : 'Back Side Preview'} · {THEMES[theme].name} Theme
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
              {side === 'front'
                ? <CardFront ref={frontRef} data={data} theme={theme} photo={photo} />
                : <CardBack ref={backRef} data={data} theme={theme} />
              }
            </div>

            <p className="text-[10px] text-slate-400 mt-4">
              Switch sides with the toolbar toggle · Download as high-res PNG (3x scale)
            </p>
          </div>

          {/* Theme switcher row */}
          <div className="flex gap-3">
            {(Object.keys(THEMES) as ThemeKey[]).map(k => (
              <button key={k} onClick={() => setTheme(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${theme === k ? 'border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'}`}>
                {THEMES[k].name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

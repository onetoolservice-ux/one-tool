"use client";
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Clock, Wifi, Mail, MessageSquare, Phone, Link, Type, Trash2 } from 'lucide-react';
import { readUrlParams, buildShareUrl } from '@/app/hooks/useUrlPreset';

type QRType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'phone';
type ErrorLevel = 'L' | 'M' | 'Q' | 'H';

interface HistoryItem { id: number; type: QRType; value: string; label: string; ts: string }

interface FormData {
  url: string;
  text: string;
  wifi_ssid: string; wifi_pass: string; wifi_enc: 'WPA' | 'WEP' | 'nopass';
  vcard_name: string; vcard_phone: string; vcard_email: string; vcard_org: string; vcard_url: string;
  email_to: string; email_sub: string; email_body: string;
  sms_to: string; sms_msg: string;
  phone: string;
}

const TYPE_META: Record<QRType, { label: string; icon: React.ReactNode; color: string }> = {
  url:   { label: 'URL / Link',   icon: <Link size={13} />,          color: 'text-blue-600' },
  text:  { label: 'Plain Text',   icon: <Type size={13} />,          color: 'text-slate-600' },
  wifi:  { label: 'Wi-Fi',        icon: <Wifi size={13} />,          color: 'text-teal-600' },
  vcard: { label: 'Contact Card', icon: <Phone size={13} />,         color: 'text-purple-600' },
  email: { label: 'Email',        icon: <Mail size={13} />,          color: 'text-rose-600' },
  sms:   { label: 'SMS',          icon: <MessageSquare size={13} />, color: 'text-amber-600' },
  phone: { label: 'Phone Call',   icon: <Phone size={13} />,         color: 'text-emerald-600' },
};

const EC_LABELS: Record<ErrorLevel, string> = { L: 'Low (7%)', M: 'Medium (15%)', Q: 'Quartile (25%)', H: 'High (30%)' };

const DEFAULTS: FormData = {
  url: 'https://example.com',
  text: 'Hello, World!',
  wifi_ssid: '', wifi_pass: '', wifi_enc: 'WPA',
  vcard_name: '', vcard_phone: '', vcard_email: '', vcard_org: '', vcard_url: '',
  email_to: '', email_sub: '', email_body: '',
  sms_to: '', sms_msg: '',
  phone: '',
};

function buildQRValue(type: QRType, f: FormData): string {
  switch (type) {
    case 'url':   return f.url || 'https://example.com';
    case 'text':  return f.text || 'Hello';
    case 'wifi':  return `WIFI:T:${f.wifi_enc};S:${f.wifi_ssid};P:${f.wifi_pass};;`;
    case 'vcard': return [
      'BEGIN:VCARD', 'VERSION:3.0',
      f.vcard_name  ? `FN:${f.vcard_name}` : '',
      f.vcard_phone ? `TEL:${f.vcard_phone}` : '',
      f.vcard_email ? `EMAIL:${f.vcard_email}` : '',
      f.vcard_org   ? `ORG:${f.vcard_org}` : '',
      f.vcard_url   ? `URL:${f.vcard_url}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n');
    case 'email': {
      let s = `mailto:${f.email_to}`;
      const p: string[] = [];
      if (f.email_sub)  p.push(`subject=${encodeURIComponent(f.email_sub)}`);
      if (f.email_body) p.push(`body=${encodeURIComponent(f.email_body)}`);
      return p.length ? `${s}?${p.join('&')}` : s;
    }
    case 'sms':   return `SMSTO:${f.sms_to}:${f.sms_msg}`;
    case 'phone': return `tel:${f.phone}`;
    default:      return '';
  }
}

function getLabel(type: QRType, f: FormData): string {
  switch (type) {
    case 'url':   return f.url || '—';
    case 'text':  return f.text.slice(0, 40) || '—';
    case 'wifi':  return f.wifi_ssid || 'Wi-Fi';
    case 'vcard': return f.vcard_name || 'Contact';
    case 'email': return f.email_to || 'Email';
    case 'sms':   return f.sms_to || 'SMS';
    case 'phone': return f.phone || 'Phone';
    default:      return '—';
  }
}

let _id = 0;

export const QrGenerator = () => {
  const _p = readUrlParams();
  const initType = (_p.get('type') as QRType) || 'url';
  const initForm = { ...DEFAULTS };
  // Hydrate form from URL params
  if (_p.get('url')) initForm.url = _p.get('url')!;
  if (_p.get('text')) initForm.text = _p.get('text')!;
  if (_p.get('ssid')) { initForm.wifi_ssid = _p.get('ssid')!; initForm.wifi_pass = _p.get('pass') || ''; }
  if (_p.get('phone')) initForm.phone = _p.get('phone')!;

  const [type, setType]         = useState<QRType>(initType);
  const [form, setForm]         = useState<FormData>(initForm);
  const [fgColor, setFgColor]   = useState(_p.get('fg') || '#000000');
  const [bgColor, setBgColor]   = useState(_p.get('bg') || '#ffffff');
  const [size, setSize]         = useState(256);
  const [ec, setEc]             = useState<ErrorLevel>('M');
  const [history, setHistory]   = useState<HistoryItem[]>([]);
  const [copied, setCopied]     = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const f = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const qrValue = useMemo(() => buildQRValue(type, form), [type, form]);

  const kpis = useMemo(() => [
    { label: 'Type',            val: TYPE_META[type].label,     color: TYPE_META[type].color },
    { label: 'Content Length',  val: `${qrValue.length} chars`, color: 'text-slate-700 dark:text-white' },
    { label: 'Error Correction',val: EC_LABELS[ec],             color: 'text-emerald-600' },
    { label: 'Canvas Size',     val: `${size} × ${size} px`,    color: 'text-blue-600' },
  ], [type, qrValue, ec, size]);

  const saveToHistory = useCallback(() => {
    const item: HistoryItem = {
      id: ++_id,
      type,
      value: qrValue,
      label: getLabel(type, form),
      ts: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setHistory(prev => [item, ...prev].slice(0, 15));
  }, [type, qrValue, form]);

  const downloadSVG = () => {
    saveToHistory();
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode-${type}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadPNG = () => {
    saveToHistory();
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const img = new Image();
    const canvas = document.createElement('canvas');
    canvas.width = size * 2; canvas.height = size * 2;
    const ctx = canvas.getContext('2d')!;
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `qrcode-${type}.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const copyValue = () => {
    navigator.clipboard.writeText(qrValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const inp = 'w-full h-8 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white';
  const lbl = 'block text-[10px] font-bold text-slate-400 uppercase mb-1';

  const renderFields = () => {
    switch (type) {
      case 'url':
        return (
          <div>
            <label className={lbl}>URL</label>
            <input className={inp} value={form.url} onChange={f('url')} placeholder="https://example.com" />
          </div>
        );
      case 'text':
        return (
          <div>
            <label className={lbl}>Text</label>
            <textarea className={`${inp} h-24 pt-1.5`} value={form.text} onChange={f('text')} placeholder="Enter text…" />
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-3">
            <div>
              <label className={lbl}>Network Name (SSID)</label>
              <input className={inp} value={form.wifi_ssid} onChange={f('wifi_ssid')} placeholder="MyWiFi" />
            </div>
            <div>
              <label className={lbl}>Password</label>
              <input className={inp} type="password" value={form.wifi_pass} onChange={f('wifi_pass')} placeholder="••••••••" />
            </div>
            <div>
              <label className={lbl}>Encryption</label>
              <select className={inp} value={form.wifi_enc} onChange={f('wifi_enc')}>
                <option value="WPA">WPA / WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open)</option>
              </select>
            </div>
          </div>
        );
      case 'vcard':
        return (
          <div className="space-y-3">
            {([['vcard_name','Full Name','John Doe'],['vcard_phone','Phone','+91 98765 43210'],
               ['vcard_email','Email','john@example.com'],['vcard_org','Organisation','Acme Corp'],
               ['vcard_url','Website','https://johndoe.com']] as [keyof FormData, string, string][])
              .map(([k, label, ph]) => (
                <div key={k}>
                  <label className={lbl}>{label}</label>
                  <input className={inp} value={form[k] as string} onChange={f(k)} placeholder={ph} />
                </div>
              ))}
          </div>
        );
      case 'email':
        return (
          <div className="space-y-3">
            <div>
              <label className={lbl}>To (email)</label>
              <input className={inp} value={form.email_to} onChange={f('email_to')} placeholder="person@example.com" />
            </div>
            <div>
              <label className={lbl}>Subject</label>
              <input className={inp} value={form.email_sub} onChange={f('email_sub')} placeholder="Hello!" />
            </div>
            <div>
              <label className={lbl}>Body</label>
              <textarea className={`${inp} h-20 pt-1.5`} value={form.email_body} onChange={f('email_body')} placeholder="Message…" />
            </div>
          </div>
        );
      case 'sms':
        return (
          <div className="space-y-3">
            <div>
              <label className={lbl}>Phone Number</label>
              <input className={inp} value={form.sms_to} onChange={f('sms_to')} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className={lbl}>Message</label>
              <textarea className={`${inp} h-20 pt-1.5`} value={form.sms_msg} onChange={f('sms_msg')} placeholder="Type your message…" />
            </div>
          </div>
        );
      case 'phone':
        return (
          <div>
            <label className={lbl}>Phone Number</label>
            <input className={inp} value={form.phone} onChange={f('phone')} placeholder="+91 98765 43210" />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-wrap">
        <span className="text-base">📱</span>
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">QR Studio</span>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex-wrap">
          {(Object.keys(TYPE_META) as QRType[]).map(k => (
            <button key={k} onClick={() => setType(k)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${type === k ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              {TYPE_META[k].icon} {TYPE_META[k].label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select value={ec} onChange={e => setEc(e.target.value as ErrorLevel)}
            className="h-7 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white outline-none">
            {(Object.keys(EC_LABELS) as ErrorLevel[]).map(l => (
              <option key={l} value={l}>EC: {l}</option>
            ))}
          </select>
          <select value={size} onChange={e => setSize(Number(e.target.value))}
            className="h-7 px-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-white outline-none">
            {[128, 192, 256, 320, 400].map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
        </div>
      </div>

      {/* KPI Row */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        {kpis.map(k => (
          <div key={k.label} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{k.label}</p>
            <p className={`text-sm font-black mt-0.5 ${k.color} truncate`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — Form */}
        <div className="w-[280px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto space-y-5">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Content</p>
            {renderFields()}
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Appearance</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Foreground</label>
                <div className="flex items-center gap-2 h-8 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-none bg-transparent p-0" />
                  <span className="font-mono text-[10px] text-slate-500">{fgColor.toUpperCase()}</span>
                </div>
              </div>
              <div>
                <label className={lbl}>Background</label>
                <div className="flex items-center gap-2 h-8 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-none bg-transparent p-0" />
                  <span className="font-mono text-[10px] text-slate-500">{bgColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR data preview */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Encoded Data</p>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 max-h-28 overflow-y-auto">
              <p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 break-all whitespace-pre-wrap">{qrValue}</p>
            </div>
            <button onClick={copyValue}
              className={`mt-2 w-full h-7 text-[11px] font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${copied ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}>
              <Copy size={11} /> {copied ? 'Copied!' : 'Copy Raw Value'}
            </button>
          </div>
        </div>

        {/* Center — QR Preview */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 bg-slate-50 dark:bg-slate-950 py-6 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
            <QRCodeSVG
              ref={svgRef as React.Ref<SVGSVGElement>}
              value={qrValue}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level={ec}
              marginSize={2}
            />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={downloadSVG}
              className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-xl shadow transition-all">
              <Download size={15} /> SVG
            </button>
            <button onClick={downloadPNG}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow transition-all">
              <Download size={15} /> PNG
            </button>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Click download to also save to history</p>
            <button
              onClick={() => {
                const p: Record<string, string> = { type };
                if (type === 'url') p.url = form.url;
                else if (type === 'text') p.text = form.text;
                else if (type === 'wifi') { p.ssid = form.wifi_ssid; p.pass = form.wifi_pass; }
                else if (type === 'phone') p.phone = form.phone;
                if (fgColor !== '#000000') p.fg = fgColor;
                if (bgColor !== '#ffffff') p.bg = bgColor;
                const url = buildShareUrl(p);
                navigator.clipboard.writeText(url);
              }}
              className="text-[10px] text-slate-400 hover:text-emerald-500 underline whitespace-nowrap transition-colors"
            >
              Copy share link
            </button>
          </div>
        </div>

        {/* Right — History */}
        <div className="w-[220px] flex-shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Clock size={10} /> History
              </p>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="text-[9px] text-slate-400 hover:text-rose-500 flex items-center gap-1">
                  <Trash2 size={9} /> Clear
                </button>
              )}
            </div>
            {history.length === 0
              ? <p className="text-xs text-slate-400 text-center py-6">Download a QR to save it here</p>
              : history.map(h => (
                <div key={h.id} className="flex items-start gap-2 px-2 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer group"
                  onClick={() => navigator.clipboard.writeText(h.value)}>
                  <div className={`mt-0.5 flex-shrink-0 ${TYPE_META[h.type].color}`}>
                    {TYPE_META[h.type].icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{h.label}</p>
                    <p className="text-[9px] text-slate-400">{TYPE_META[h.type].label} · {h.ts}</p>
                  </div>
                  <Copy size={9} className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity" />
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};

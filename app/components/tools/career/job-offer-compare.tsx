'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  AlertTriangle, Briefcase, TrendingUp, Star, Award,
  Upload, Loader2, RefreshCw, CheckCircle, X,
} from 'lucide-react';
import { SAPHeader } from '@/app/components/tools/analytics/shared/SAPHeader';

// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const inputCls =
  'text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 transition-colors w-full';
const labelCls =
  'text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

// ─────────────────────────────────────────────────────────────────────────────

interface Offer {
  company: string;
  role: string;
  ctc: number;
  city: 'metro' | 'non-metro';
  basic: number;
  hra: number;
  travelAllowance: number;
  wfh: boolean;
  officeDistance: number;
  commuteCost: number;
  performanceBonus: number;
  esopValue: number;
  healthCover: number;
  workLifeScore: number;
  growthScore: number;
}

const SAMPLE_A: Offer = {
  company: 'Flipkart', role: 'Senior Software Engineer',
  ctc: 2400000, city: 'metro', basic: 960000, hra: 480000,
  travelAllowance: 19200, wfh: false, officeDistance: 18, commuteCost: 0,
  performanceBonus: 240000, esopValue: 500000,
  healthCover: 10, workLifeScore: 7, growthScore: 9,
};
const SAMPLE_B: Offer = {
  company: 'Razorpay', role: 'Senior Software Engineer',
  ctc: 2200000, city: 'metro', basic: 880000, hra: 440000,
  travelAllowance: 19200, wfh: true, officeDistance: 0, commuteCost: 0,
  performanceBonus: 200000, esopValue: 800000,
  healthCover: 15, workLifeScore: 9, growthScore: 8,
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF / Image text extraction
// ─────────────────────────────────────────────────────────────────────────────

async function extractText(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      pages.push(content.items.map((x: { str?: string }) => x.str ?? '').join(' '));
    }
    return pages.join('\n');
  }
  if (file.type.startsWith('image/')) {
    const Tesseract = (await import('tesseract.js')).default;
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text;
  }
  return file.text();
}

// ─────────────────────────────────────────────────────────────────────────────
// Parsing
// ─────────────────────────────────────────────────────────────────────────────

const METRO_CITIES = [
  'mumbai', 'delhi', 'new delhi', 'kolkata', 'calcutta', 'chennai', 'madras',
  'bangalore', 'bengaluru', 'hyderabad', 'pune', 'noida', 'gurugram', 'gurgaon',
  'navi mumbai', 'thane', 'ahmedabad',
];

function parseOffer(raw: string): Offer {
  const text = raw;
  const lower = raw.toLowerCase();

  function amt(patterns: RegExp[]): number | null {
    for (const pat of patterns) {
      const m = text.match(pat);
      if (m) {
        for (let i = m.length - 1; i >= 1; i--) {
          if (m[i]) {
            const n = parseFloat(m[i].replace(/[,\s]/g, ''));
            if (!isNaN(n) && n > 0) return n;
          }
        }
      }
    }
    return null;
  }

  // Company
  let company = 'Company';
  for (const pat of [
    /^([A-Z][A-Za-z0-9\s&.,]{2,40})\s*(?:pvt\.?\s*ltd\.?|private limited|limited|inc\.?|llp)/im,
    /(?:joining|offer from|employment with)\s+([A-Z][A-Za-z0-9\s&.,]+?)(?:\s*[.,\n])/,
    /(?:company|employer)\s*[:\-]\s*([A-Za-z0-9\s&.,]+?)(?:\n|,)/i,
  ]) {
    const m = text.match(pat);
    if (m?.[1]?.trim()) { company = m[1].trim().replace(/\s+/g, ' '); break; }
  }

  // Role
  let role = '';
  for (const pat of [
    /(?:position of|designation of|role of|as a|as an|joining as)\s+([A-Za-z][A-Za-z0-9\s\-/&]{2,50}?)(?:\s*(?:at|in|,|\.|and\b|\n))/i,
    /(?:designation|role|position|title)\s*[:\-]\s*([A-Za-z][A-Za-z0-9\s\-/&]{2,50}?)(?:\n|,|\.)/i,
  ]) {
    const m = text.match(pat);
    if (m?.[1]?.trim()) { role = m[1].trim().replace(/\s+/g, ' '); break; }
  }

  // CTC
  let ctc = 1500000;
  const lpaM = lower.match(/(?:ctc|cost\s*to\s*company|package|total\s*compensation|annual\s*(?:ctc|salary))[^₹\d\n]{0,30}([\d.]+)\s*(?:lpa|l\.p\.a\.?|lakh|lac)/);
  if (lpaM) {
    ctc = Math.round(parseFloat(lpaM[1]) * 100000);
  } else {
    const v = amt([
      /(?:ctc|cost\s*to\s*company|annual\s*ctc)[^₹\d\n]{0,30}(?:₹|rs\.?|inr)\s*([\d,]+)/i,
      /(?:total\s*compensation|annual\s*package)[^₹\d\n]{0,30}(?:₹|rs\.?|inr)\s*([\d,]+)/i,
    ]);
    if (v && v >= 100000) ctc = v;
  }

  // Basic
  let basic = Math.round(ctc * 0.4);
  const b = amt([/basic\s*(?:salary|pay)?\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i]);
  if (b && b > 0) basic = b < 100000 ? b * 12 : b;

  // HRA
  let hra = Math.round(basic * 0.5);
  const h = amt([/(?:hra|house\s*rent\s*allowance)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i]);
  if (h && h > 0) hra = h < 50000 ? h * 12 : h;

  // Bonus
  let performanceBonus = Math.round(ctc * 0.1);
  const bns = amt([/(?:variable\s*pay|performance\s*(?:pay|bonus)|annual\s*bonus)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i]);
  if (bns && bns > 0) performanceBonus = bns < 50000 ? bns * 12 : bns;

  // ESOP
  let esopValue = 0;
  const esop = amt([/(?:esop|rsu|stock\s*option)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/i]);
  if (esop && esop >= 10000) esopValue = esop;

  // Health cover
  let healthCover = 5;
  const hcM = lower.match(/(?:medical|health)\s*(?:insurance|cover)\s*[:\-]?\s*(?:₹|rs\.?|inr)?\s*([\d,]+)/);
  if (hcM) {
    const n = parseFloat(hcM[1].replace(/,/g, ''));
    if (n >= 100000) healthCover = Math.round(n / 100000);
  }

  // City
  const city: 'metro' | 'non-metro' = METRO_CITIES.some((c) => lower.includes(c)) ? 'metro' : 'non-metro';

  // WFH
  const wfh = /(?:work\s*from\s*home|remote\s*work|hybrid|wfh)/i.test(text);

  return {
    company, role, ctc, city, basic, hra,
    travelAllowance: 19200, wfh, officeDistance: wfh ? 0 : 15, commuteCost: 0,
    performanceBonus, esopValue, healthCover,
    workLifeScore: 7, growthScore: 7,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tax / calc
// ─────────────────────────────────────────────────────────────────────────────

function estimateTax(t: number): number {
  if (t <= 300000) return 0;
  if (t <= 700000) return (t - 300000) * 0.05;
  if (t <= 1000000) return 20000 + (t - 700000) * 0.1;
  if (t <= 1200000) return 50000 + (t - 1000000) * 0.15;
  if (t <= 1500000) return 80000 + (t - 1200000) * 0.2;
  return 140000 + (t - 1500000) * 0.3;
}

function calcOffer(o: Offer) {
  const epfEmp = o.basic * 0.12;
  const epfEr = o.basic * 0.12;
  const hraEx = Math.min(o.hra, (o.city === 'metro' ? 0.5 : 0.4) * o.basic);
  const gross = o.ctc - epfEr;
  const taxable = Math.max(0, gross - epfEmp - hraEx - 75000 - o.travelAllowance);
  const tax = estimateTax(taxable) * 1.04;
  const takeHome = gross - epfEmp - tax;
  const commute = o.wfh ? 0 : (o.commuteCost > 0 ? o.commuteCost * 12 : o.officeDistance * 2 * 250 * 3);
  const netVal = takeHome + o.performanceBonus + o.esopValue * 0.3 - commute;
  const benefits = Math.min(10, o.healthCover / 2 + (o.esopValue > 0 ? 2 : 0));
  const score = Math.min(10, (netVal / 5000000) * 10) * 0.5 + o.workLifeScore * 0.2 + o.growthScore * 0.2 + benefits * 0.1;
  return { takeHome, epfEmp, tax, commute, netVal, score };
}

// ─────────────────────────────────────────────────────────────────────────────
// Single Offer Slot
// ─────────────────────────────────────────────────────────────────────────────

type SlotState = 'empty' | 'loading' | 'ready' | 'error';

interface OfferSlotProps {
  label: string;
  sample: Offer;
  offer: Offer | null;
  onFilled: (o: Offer) => void;
  onClear: () => void;
  accentClass: string;
}

function OfferSlot({ label, sample, offer, onFilled, onClear, accentClass }: OfferSlotProps) {
  const [slotState, setSlotState] = useState<SlotState>('empty');
  const [progress, setProgress] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setSlotState('loading');
    setProgress(file.type === 'application/pdf' ? 'Reading PDF…' : 'Running OCR…');
    try {
      const text = await extractText(file);
      setProgress('Extracting fields…');
      await new Promise((r) => setTimeout(r, 200));
      onFilled(parseOffer(text));
      setSlotState('ready');
    } catch {
      setSlotState('error');
    }
    setProgress('');
  }, [onFilled]);

  const handleClear = () => {
    setSlotState('empty');
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
    onClear();
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (slotState === 'empty') {
    return (
      <div className={`rounded-2xl border-2 border-dashed ${accentClass} p-8 flex flex-col items-center justify-center gap-4 min-h-[280px]`}>
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Upload className="w-6 h-6 text-slate-400 dark:text-slate-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">PDF, PNG, JPG or TXT</p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-[200px]">
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Upload Offer Letter
          </button>
          <button
            onClick={() => { onFilled(sample); setSlotState('ready'); setFileName('Sample Data'); }}
            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
          >
            See Sample
          </button>
        </div>
        <input
          ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.txt"
          className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) processFile(f); }}
        />
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (slotState === 'loading') {
    return (
      <div className={`rounded-2xl border-2 ${accentClass} p-8 flex flex-col items-center justify-center gap-3 min-h-[280px]`}>
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{fileName}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{progress}</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (slotState === 'error') {
    return (
      <div className={`rounded-2xl border-2 border-red-300 dark:border-red-700 p-8 flex flex-col items-center justify-center gap-3 min-h-[280px]`}>
        <X className="w-8 h-8 text-red-400" />
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Failed to read file</p>
        <button onClick={handleClear} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline">Try again</button>
      </div>
    );
  }

  // ── Ready — show form ──────────────────────────────────────────────────────
  if (!offer) return null;
  const set = <K extends keyof Offer>(key: K, val: Offer[K]) => onFilled({ ...offer, [key]: val });

  return (
    <div className={`rounded-2xl border-2 ${accentClass} bg-white dark:bg-slate-900 p-5 space-y-3`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]">{fileName}</span>
          <button onClick={handleClear} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Company</label>
            <input className={inputCls} value={offer.company} onChange={e => set('company', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <input className={inputCls} value={offer.role} onChange={e => set('role', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>CTC (₹/yr)</label>
            <input className={inputCls} type="number" value={offer.ctc} onChange={e => set('ctc', +e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Basic (₹/yr)</label>
            <input className={inputCls} type="number" value={offer.basic} onChange={e => set('basic', +e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>HRA (₹/yr)</label>
            <input className={inputCls} type="number" value={offer.hra} onChange={e => set('hra', +e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Perf. Bonus (₹/yr)</label>
            <input className={inputCls} type="number" value={offer.performanceBonus} onChange={e => set('performanceBonus', +e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>ESOP (₹ total)</label>
            <input className={inputCls} type="number" value={offer.esopValue} onChange={e => set('esopValue', +e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Health Cover (₹L)</label>
            <input className={inputCls} type="number" value={offer.healthCover} onChange={e => set('healthCover', +e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelCls}>City</label>
          <div className="flex gap-2 mt-1">
            {(['metro', 'non-metro'] as const).map(c => (
              <button key={c} onClick={() => set('city', c)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${offer.city === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                {c === 'metro' ? 'Metro (50% HRA)' : 'Non-Metro (40%)'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Work Mode</label>
          <div className="flex gap-2 mt-1">
            {([true, false] as const).map(v => (
              <button key={String(v)} onClick={() => set('wfh', v)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${offer.wfh === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                {v ? 'WFH / Remote' : 'Office'}
              </button>
            ))}
          </div>
        </div>

        {!offer.wfh && (
          <div>
            <label className={labelCls}>Office Distance (km)</label>
            <input className={inputCls} type="number" value={offer.officeDistance} onChange={e => set('officeDistance', +e.target.value)} />
          </div>
        )}

        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className={labelCls}>Work-Life: {offer.workLifeScore}/10</label>
            <input type="range" min={1} max={10} value={offer.workLifeScore}
              onChange={e => set('workLifeScore', +e.target.value)} className="w-full accent-blue-500" />
          </div>
          <div>
            <label className={labelCls}>Growth: {offer.growthScore}/10</label>
            <input type="range" min={1} max={10} value={offer.growthScore}
              onChange={e => set('growthScore', +e.target.value)} className="w-full accent-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Score Bar
// ─────────────────────────────────────────────────────────────────────────────

function ScoreBar({ label, a, b, higherIsBetter = true, nameA, nameB }: {
  label: string; a: number; b: number; higherIsBetter?: boolean; nameA: string; nameB: string;
}) {
  const aWins = higherIsBetter ? a >= b : a <= b;
  const max = Math.max(a, b, 1);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-400">{label}</span>
        <div className="flex gap-3">
          <span className={`font-black ${aWins ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{nameA}</span>
          <span className={`font-black ${!aWins ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{nameB}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div className="h-2 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden flex justify-end">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${(a / max) * 100}%` }} />
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-slate-500 transition-all" style={{ width: `${(b / max) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

export function JobOfferCompare() {
  const [offerA, setOfferA] = useState<Offer | null>(null);
  const [offerB, setOfferB] = useState<Offer | null>(null);

  const calcA = useMemo(() => offerA ? calcOffer(offerA) : null, [offerA]);
  const calcB = useMemo(() => offerB ? calcOffer(offerB) : null, [offerB]);

  const bothReady = offerA && offerB && calcA && calcB;

  const winner = bothReady
    ? (calcA.score >= calcB.score ? offerA.company : offerB.company)
    : '—';
  const valueDiff = bothReady ? Math.abs(calcA.netVal - calcB.netVal) : 0;
  const valueWinnerA = bothReady ? calcA.netVal >= calcB.netVal : false;
  const scoreWinnerA = bothReady ? calcA.score >= calcB.score : false;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <SAPHeader
        fullWidth
        title="Job Offer Comparator"
        subtitle="Upload offer letters — fields extracted automatically"
        kpis={[
          { label: 'Winner', value: winner, icon: Award, color: 'primary' },
          { label: 'Take-home A', value: calcA ? fmt(calcA.takeHome / 12) + '/mo' : '—', icon: Briefcase, color: 'neutral' },
          { label: 'Take-home B', value: calcB ? fmt(calcB.takeHome / 12) + '/mo' : '—', icon: Briefcase, color: 'neutral' },
          { label: 'Advantage', value: bothReady ? fmt(valueDiff) : '—', icon: TrendingUp, color: 'success', subtitle: bothReady ? `for ${valueWinnerA ? offerA.company : offerB.company}` : '' },
        ]}
      />

      <div className="p-4 space-y-4 max-w-5xl mx-auto">
        {/* Two slots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OfferSlot
            label="Offer A" sample={SAMPLE_A}
            offer={offerA} onFilled={setOfferA} onClear={() => setOfferA(null)}
            accentClass="border-blue-300 dark:border-blue-700"
          />
          <OfferSlot
            label="Offer B" sample={SAMPLE_B}
            offer={offerB} onFilled={setOfferB} onClear={() => setOfferB(null)}
            accentClass="border-slate-300 dark:border-slate-600"
          />
        </div>

        {/* Comparison — only when both ready */}
        {bothReady && (
          <>
            {/* Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {([['A', offerA, calcA, 'border-blue-200 dark:border-blue-800'], ['B', offerB, calcB, 'border-slate-200 dark:border-slate-700']] as const).map(([lbl, offer, calc, border]) => (
                <div key={lbl} className={`bg-slate-50 dark:bg-slate-800/50 rounded-xl border ${border} p-4 space-y-2`}>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">{offer.company}</p>
                    {offer.role && <p className="text-[11px] text-slate-400 dark:text-slate-500">{offer.role}</p>}
                  </div>
                  {[
                    { label: 'Annual In-hand', value: fmt(calc.takeHome), bold: true },
                    { label: 'EPF (Employee)', value: fmt(calc.epfEmp) },
                    { label: 'Tax + 4% Cess', value: fmt(calc.tax) },
                    { label: 'Commute Cost', value: calc.commute > 0 ? `-${fmt(calc.commute)}` : 'WFH ₹0' },
                    { label: 'Perf. Bonus', value: `+${fmt(offer.performanceBonus)}` },
                    { label: 'ESOP (30%)', value: offer.esopValue > 0 ? `+${fmt(offer.esopValue * 0.3)}` : '—' },
                    { label: 'Net Annual Value', value: fmt(calc.netVal), bold: true },
                  ].map(r => (
                    <div key={r.label} className={`flex justify-between text-sm ${r.bold ? 'border-t border-slate-200 dark:border-slate-700 pt-2 font-bold' : ''}`}>
                      <span className={r.bold ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}>{r.label}</span>
                      <span className={r.bold ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-700 dark:text-slate-300 font-semibold'}>{r.value}</span>
                    </div>
                  ))}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 flex justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Overall Score</span>
                    <span className="text-lg font-black text-blue-600 dark:text-blue-400">{calc.score.toFixed(1)}/10</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Head-to-head */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Head-to-Head</h3>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" />{offerA.company}</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400" />{offerB.company}</span>
                </div>
              </div>
              <div className="space-y-4">
                <ScoreBar label="Net Annual Value" a={calcA.netVal} b={calcB.netVal} nameA={offerA.company} nameB={offerB.company} />
                <ScoreBar label="Work-Life Balance" a={offerA.workLifeScore} b={offerB.workLifeScore} nameA={offerA.company} nameB={offerB.company} />
                <ScoreBar label="Growth Potential" a={offerA.growthScore} b={offerB.growthScore} nameA={offerA.company} nameB={offerB.company} />
                <ScoreBar label="Health Cover (₹L)" a={offerA.healthCover} b={offerB.healthCover} nameA={offerA.company} nameB={offerB.company} />
                <ScoreBar label="Overall Score" a={calcA.score} b={calcB.score} nameA={offerA.company} nameB={offerB.company} />
              </div>
            </div>

            {/* Verdict */}
            <div className={`rounded-2xl border-2 p-5 ${scoreWinnerA ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
              <div className="flex items-start gap-3">
                <Star size={20} className={`${scoreWinnerA ? 'text-blue-500' : 'text-slate-500'} mt-0.5 shrink-0`} />
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Final Verdict</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>{valueWinnerA ? offerA.company : offerB.company}</strong> puts <strong>{fmt(valueDiff)}</strong> more in your pocket annually after commute.{' '}
                    {scoreWinnerA !== valueWinnerA
                      ? `However, ${scoreWinnerA ? offerA.company : offerB.company} wins on overall score (${calcA.score.toFixed(1)} vs ${calcB.score.toFixed(1)}) due to work-life and growth potential.`
                      : `${winner} also leads on overall score — ${Math.max(calcA.score, calcB.score).toFixed(1)} vs ${Math.min(calcA.score, calcB.score).toFixed(1)}.`
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Disclaimer:</span> Parsed values are estimates from pattern matching — verify against your actual offer letter. Tax uses simplified FY 2025-26 new regime slabs. All processing is local; no file is uploaded to any server.
              </p>
            </div>
          </>
        )}

        {/* Prompt when only one is filled */}
        {(offerA || offerB) && !bothReady && (
          <div className="text-center py-6 text-sm text-slate-400 dark:text-slate-500">
            Add the {offerA ? 'second' : 'first'} offer to see the comparison
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, RotateCcw } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ThemeSettings {
  accent:     string;   // logo-text + search ring color
  logo:       string;   // logo square background
  navbar:     string;   // navbar bg — 'auto' | hex
  navbarText: string;   // navbar text/icon color — 'auto' | hex
  font:       string;   // font family id
}

// ── Presets ───────────────────────────────────────────────────────────────────

export const LOGO_PRESETS = [
  { name: 'Indigo',  value: '#6366f1' },
  { name: 'Violet',  value: '#8b5cf6' },
  { name: 'Blue',    value: '#3b82f6' },
  { name: 'Cyan',    value: '#06b6d4' },
  { name: 'Teal',    value: '#14b8a6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose',    value: '#f43f5e' },
  { name: 'Orange',  value: '#f97316' },
  { name: 'Amber',   value: '#f59e0b' },
  { name: 'Slate',   value: '#64748b' },
];

// 10 quick-pick presets for navbar (5 light, 5 dark) — no 'auto' here
export const NAVBAR_BG_PRESETS = [
  { name: 'White',        value: '#ffffff' },
  { name: 'Light Gray',   value: '#f1f5f9' },
  { name: 'Warm',         value: '#fafaf9' },
  { name: 'Lavender',     value: '#f0f4ff' },
  { name: 'Cream',        value: '#fff7ed' },
  { name: 'Teal',         value: '#096464' },  // default
  { name: 'Slate',        value: '#0f172a' },
  { name: 'Charcoal',     value: '#1e2433' },
  { name: 'Deep Purple',  value: '#1a0a2e' },
  { name: 'Forest',       value: '#0a1a10' },
];

export const FONT_OPTIONS = [
  { id: 'inter',   label: 'Sans',   stack: "'Inter', system-ui, sans-serif" },
  { id: 'serif',   label: 'Serif',  stack: "Georgia, 'Times New Roman', serif" },
  { id: 'mono',    label: 'Mono',   stack: "'Courier New', Courier, monospace" },
  { id: 'rounded', label: 'Round',  stack: "'Trebuchet MS', 'Helvetica Neue', sans-serif" },
];

// ── Storage ───────────────────────────────────────────────────────────────────

const KEYS = {
  ACCENT:      'onetool_accent_color',
  LOGO:        'onetool_logo_color',
  NAVBAR:      'onetool_navbar_bg',
  NAVBAR_TEXT: 'onetool_navbar_text',
  FONT:        'onetool_font',
} as const;

export const DEFAULTS: ThemeSettings = {
  accent:     '#6366f1',   // indigo — search ring, "Tool" text, active states
  logo:       '#14b8a6',   // teal — matches navbar
  navbar:     '#096464',   // teal — rgb(9, 100, 100)
  navbarText: '#f8fafc',   // light text — white on dark teal navbar
  font:       'rounded',   // Trebuchet MS rounded sans
};

// ── Color helpers ─────────────────────────────────────────────────────────────

/** WCAG luminance → returns #f8fafc for dark bg, #1e293b for light bg */
export function getContrastColor(bgHex: string): string {
  if (!bgHex?.startsWith('#') || bgHex.length < 7) return '#1e293b';
  const r = parseInt(bgHex.slice(1, 3), 16) || 0;
  const g = parseInt(bgHex.slice(3, 5), 16) || 0;
  const b = parseInt(bgHex.slice(5, 7), 16) || 0;
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.45 ? '#1e293b' : '#f8fafc';
}

function isDark(hex: string): boolean {
  return getContrastColor(hex) === '#f8fafc';
}

/**
 * Resolves the actual navbar text color.
 * Returns null when navbar is 'auto' (no CSS override needed).
 */
export function resolveNavbarTextColor(s: ThemeSettings): string | null {
  if (s.navbar === 'auto') return null;
  return s.navbarText === 'auto' ? getContrastColor(s.navbar) : s.navbarText;
}

// ── Apply helpers ─────────────────────────────────────────────────────────────

export function applyAccentColor(color: string) {
  document.documentElement.style.setProperty('--ot-accent', color);
}

export function applyLogoColor(color: string) {
  document.documentElement.style.setProperty('--ot-logo-bg', color);
  // Auto-contrast: keep the "O" letter readable on any background
  document.documentElement.style.setProperty('--ot-logo-text', getContrastColor(color));
}

export function applyNavbarBg(value: string) {
  if (value === 'auto') {
    document.documentElement.style.removeProperty('--ot-navbar-bg');
  } else {
    document.documentElement.style.setProperty('--ot-navbar-bg', value);
  }
}

export function applyFont(fontId: string) {
  const opt = FONT_OPTIONS.find(f => f.id === fontId);
  document.body.style.fontFamily = opt ? opt.stack : '';
}

/** Applies everything except navbarText (GlobalHeader owns that via data-custom-nav) */
export function applyAllTheme(s: ThemeSettings) {
  applyAccentColor(s.accent);
  applyLogoColor(s.logo);
  applyNavbarBg(s.navbar);
  applyFont(s.font);
}

// ── Load / Save ───────────────────────────────────────────────────────────────

export function loadThemeSettings(): ThemeSettings {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  return {
    accent:     localStorage.getItem(KEYS.ACCENT)      || DEFAULTS.accent,
    logo:       localStorage.getItem(KEYS.LOGO)        || DEFAULTS.logo,
    navbar:     localStorage.getItem(KEYS.NAVBAR)      || DEFAULTS.navbar,
    navbarText: localStorage.getItem(KEYS.NAVBAR_TEXT) || DEFAULTS.navbarText,
    font:       localStorage.getItem(KEYS.FONT)        || DEFAULTS.font,
  };
}

export function saveThemeSettings(s: ThemeSettings) {
  localStorage.setItem(KEYS.ACCENT,      s.accent);
  localStorage.setItem(KEYS.LOGO,        s.logo);
  localStorage.setItem(KEYS.NAVBAR,      s.navbar);
  localStorage.setItem(KEYS.NAVBAR_TEXT, s.navbarText);
  localStorage.setItem(KEYS.FONT,        s.font);
  applyAllTheme(s);
  window.dispatchEvent(new CustomEvent('ot-theme-change', { detail: s }));
}

// ── Legacy exports (backward-compat with workspace page) ──────────────────────

export const ACCENT_KEY     = KEYS.ACCENT;
export const DEFAULT_ACCENT = DEFAULTS.accent;
export function getStoredAccent() { return loadThemeSettings().accent; }
export function saveAccentColor(color: string) {
  const s = loadThemeSettings();
  saveThemeSettings({ ...s, accent: color, logo: color });
}

// ── AccentSwatches (inline — workspace page) ──────────────────────────────────

export function AccentSwatches({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {LOGO_PRESETS.map(p => (
        <button
          key={p.value}
          title={p.name}
          onClick={() => onChange(p.value)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
          style={{
            backgroundColor: p.value,
            outline: value === p.value ? `3px solid ${p.value}` : '3px solid transparent',
            outlineOffset: '2px',
          }}
        >
          {value === p.value && <Check size={13} className="text-white drop-shadow-sm" />}
        </button>
      ))}
      <RainbowPicker color={value} onChange={onChange} size={36} />
    </div>
  );
}

// ── Main Dropdown ─────────────────────────────────────────────────────────────

export function AccentColorPicker() {
  const [settings, setSettings] = useState<ThemeSettings>({ ...DEFAULTS });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = loadThemeSettings();
    setSettings(s);
    applyAllTheme(s);

    const sync = (e: Event) => setSettings((e as CustomEvent<ThemeSettings>).detail);
    window.addEventListener('ot-theme-change', sync);
    return () => window.removeEventListener('ot-theme-change', sync);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const update = (patch: Partial<ThemeSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveThemeSettings(next);
  };

  const resetAll = () => {
    setSettings({ ...DEFAULTS });
    saveThemeSettings({ ...DEFAULTS });
  };

  const resolvedTextColor = resolveNavbarTextColor(settings);
  const navbarPickerColor = settings.navbar === 'auto' ? '#ffffff' : settings.navbar;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
        style={{ color: open ? settings.logo : undefined }}
        aria-label="Customize theme"
        title="Theme customizer"
      >
        <Palette size={17} className={open ? '' : 'text-slate-400'} />
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 max-h-[85vh] overflow-y-auto bg-white dark:bg-[#1A1D2E] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/12 dark:shadow-black/50 p-4 z-50 animate-in space-y-4">

          {/* ── 1. Navbar Background ── */}
          <PickerSection label="Navbar Background">
            <div className="grid grid-cols-5 gap-1.5">
              {NAVBAR_BG_PRESETS.map(p => {
                const active = settings.navbar === p.value;
                return (
                  <button
                    key={p.value}
                    title={p.name}
                    onClick={() => update({ navbar: p.value })}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 border border-black/5 dark:border-white/10"
                    style={{
                      backgroundColor: p.value,
                      outline: active ? `3px solid ${p.value}` : '3px solid transparent',
                      outlineOffset: '2px',
                    }}
                  >
                    {active && <Check size={13} className={isDark(p.value) ? 'text-white' : 'text-slate-700'} />}
                  </button>
                );
              })}
            </div>

            {/* Free picker row */}
            <div className="flex items-center gap-2 mt-1.5">
              <RainbowPicker
                color={navbarPickerColor}
                onChange={c => update({ navbar: c })}
                size={40}
                label="Any"
              />
              <label className="flex-1 flex items-center gap-2 px-2.5 py-0 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors h-10">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: navbarPickerColor }}
                />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex-1 truncate">
                  {settings.navbar === 'auto' ? 'Auto' : settings.navbar.toUpperCase()}
                </span>
                <input
                  type="color"
                  value={navbarPickerColor}
                  onChange={e => update({ navbar: e.target.value })}
                  className="sr-only"
                />
              </label>
              {settings.navbar !== 'auto' && (
                <button
                  onClick={() => update({ navbar: 'auto', navbarText: 'auto' })}
                  className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2.5 h-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </PickerSection>

          <Divider />

          {/* ── 2. Navbar Text Color ── */}
          <PickerSection label="Navbar Text Color">
            <div className="flex gap-1.5 items-center">
              {/* Auto (smart contrast) */}
              <button
                onClick={() => update({ navbarText: 'auto' })}
                className={`flex-1 h-9 px-2 rounded-xl text-xs font-semibold border transition-all ${
                  settings.navbarText === 'auto'
                    ? 'bg-[var(--ot-accent)]/10 border-[var(--ot-accent)] text-[var(--ot-accent)]'
                    : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                Auto ✨
              </button>

              {/* Light text preset */}
              <button
                title="Light text (#f8fafc)"
                onClick={() => update({ navbarText: '#f8fafc' })}
                className="w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: '#f8fafc',
                  borderColor: settings.navbarText === '#f8fafc' ? 'var(--ot-accent)' : '#e2e8f0',
                }}
              >
                <span className="text-xs font-black text-slate-700">A</span>
              </button>

              {/* Dark text preset */}
              <button
                title="Dark text (#1e293b)"
                onClick={() => update({ navbarText: '#1e293b' })}
                className="w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: '#1e293b',
                  borderColor: settings.navbarText === '#1e293b' ? 'var(--ot-accent)' : 'transparent',
                }}
              >
                <span className="text-xs font-black text-white">A</span>
              </button>

              {/* Free picker */}
              <RainbowPicker
                color={resolvedTextColor ?? '#1e293b'}
                onChange={c => update({ navbarText: c })}
                size={36}
              />
            </div>

            {/* Resolved color preview */}
            {resolvedTextColor && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span
                  className="inline-block w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
                  style={{ backgroundColor: resolvedTextColor }}
                />
                Applied: {resolvedTextColor.toUpperCase()}
              </p>
            )}
          </PickerSection>

          <Divider />

          {/* ── 3. Text Font ── */}
          <PickerSection label="Text Font">
            <div className="grid grid-cols-2 gap-1.5">
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.id}
                  onClick={() => update({ font: f.id })}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                    settings.font === f.id
                      ? 'border-[var(--ot-accent)] bg-[var(--ot-accent)]/10 text-[var(--ot-accent)]'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                  style={{ fontFamily: f.stack }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {settings.font !== DEFAULTS.font && (
              <button
                onClick={() => update({ font: DEFAULTS.font })}
                className="w-full mt-0.5 text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2.5 h-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 transition-colors"
              >
                Auto
              </button>
            )}
          </PickerSection>

          <Divider />

          {/* ── 4. Logo Color ── */}
          <PickerSection label="Logo Color">
            <div className="grid grid-cols-5 gap-1.5">
              {LOGO_PRESETS.map(p => (
                <button
                  key={p.value}
                  title={p.name}
                  onClick={() => update({ logo: p.value })}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: p.value,
                    outline: settings.logo === p.value ? `3px solid ${p.value}` : '3px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  {settings.logo === p.value && <Check size={13} className="text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <RainbowPicker
                color={settings.logo}
                onChange={c => update({ logo: c })}
                size={40}
                label="Any"
              />
              <label className="flex-1 flex items-center gap-2 px-2.5 py-0 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors h-10">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: settings.logo }}
                />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex-1 truncate">
                  {settings.logo.toUpperCase()}
                </span>
                <input
                  type="color"
                  value={settings.logo}
                  onChange={e => update({ logo: e.target.value })}
                  className="sr-only"
                />
              </label>
              {settings.logo !== DEFAULTS.logo && (
                <button
                  onClick={() => update({ logo: DEFAULTS.logo })}
                  className="flex-shrink-0 text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2.5 h-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </PickerSection>

          <Divider />

          {/* ── 5. Accent Color ── */}
          <PickerSection label="Accent Color">
            <div className="grid grid-cols-5 gap-1.5">
              {LOGO_PRESETS.map(p => (
                <button
                  key={p.value}
                  title={p.name}
                  onClick={() => update({ accent: p.value })}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: p.value,
                    outline: settings.accent === p.value ? `3px solid ${p.value}` : '3px solid transparent',
                    outlineOffset: '2px',
                  }}
                >
                  {settings.accent === p.value && <Check size={13} className="text-white drop-shadow-sm" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-1.5">
              <RainbowPicker
                color={settings.accent}
                onChange={c => update({ accent: c })}
                size={40}
                label="Any"
              />
              <label className="flex-1 flex items-center gap-2 px-2.5 py-0 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors h-10">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: settings.accent }}
                />
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex-1 truncate">
                  {settings.accent.toUpperCase()}
                </span>
                <input
                  type="color"
                  value={settings.accent}
                  onChange={e => update({ accent: e.target.value })}
                  className="sr-only"
                />
              </label>
              {settings.accent !== DEFAULTS.accent && (
                <button
                  onClick={() => update({ accent: DEFAULTS.accent })}
                  className="flex-shrink-0 text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2.5 h-10 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </PickerSection>

          <Divider />

          {/* ── Reset ── */}
          <button
            onClick={resetAll}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <RotateCcw size={11} /> Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function PickerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        {label}
      </p>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-100 dark:border-white/[0.06]" />;
}

/**
 * A rainbow-gradient swatch that triggers the native colour picker.
 * When `label` is provided, renders as a text row; otherwise a square swatch.
 */
function RainbowPicker({
  color,
  onChange,
  size = 36,
  label,
}: {
  color: string;
  onChange: (c: string) => void;
  size?: number;
  label?: string;
}) {
  const rainbow = 'conic-gradient(#f43f5e, #f97316, #f59e0b, #10b981, #3b82f6, #8b5cf6, #f43f5e)';

  if (label) {
    return (
      <label
        title="Pick any color"
        className="cursor-pointer flex items-center gap-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors h-10 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 relative"
      >
        <div
          className="w-5 h-5 rounded-full flex-shrink-0"
          style={{ background: rainbow }}
        />
        {label}
        <input type="color" value={color} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
      </label>
    );
  }

  return (
    <label
      title="Pick any color"
      className="flex-shrink-0 cursor-pointer relative overflow-hidden rounded-xl"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-0" style={{ background: rainbow }} />
      <input type="color" value={color} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
    </label>
  );
}

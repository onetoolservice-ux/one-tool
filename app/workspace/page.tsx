'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  HardDrive, Download, Upload, Trash2, Clock, Star,
  FileText, BarChart3, ChevronRight, AlertTriangle, CheckCircle2, Palette
} from 'lucide-react';
import {
  AccentSwatches,
  loadThemeSettings, saveThemeSettings,
  NAVBAR_BG_PRESETS, FONT_OPTIONS,
  getContrastColor, resolveNavbarTextColor,
  DEFAULTS,
  type ThemeSettings,
} from '@/app/components/ui/AccentColorPicker';
import { safeLocalStorage } from '@/app/lib/utils/storage';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { getIconComponent, type IconName } from '@/app/lib/utils/icon-mapper';
import { getAllMonthKeys, getMonthData, monthKeyToLabel } from '@/app/components/tools/analytics/analytics-store';

// ─── Storage scanner: finds all OneTool data in localStorage ───────────────
interface StoredItem {
  key: string;
  label: string;
  category: string;
  size: number;
  toolId?: string;
  meta?: string;
}

function scanStorage(): StoredItem[] {
  if (typeof window === 'undefined') return [];
  const items: StoredItem[] = [];

  // Analytics months
  const months = getAllMonthKeys();
  for (const mk of months) {
    const data = getMonthData(mk);
    if (data) {
      const raw = JSON.stringify(data);
      items.push({
        key: `onetool-mmt-${mk}`,
        label: `${monthKeyToLabel(mk)} — ${data.transactions.length} transactions`,
        category: 'Analytics',
        size: new Blob([raw]).size,
        toolId: 'managetransaction',
        meta: data.fileName,
      });
    }
  }

  // Generic localStorage keys that look like OneTool data
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const val = localStorage.getItem(key) || '';
      const size = new Blob([key + val]).size;

      if (key === 'onetool-recents') {
        items.push({ key, label: 'Recently used tools', category: 'System', size });
      } else if (key === 'onetool-feedback') {
        items.push({ key, label: 'Your feedback entries', category: 'System', size });
      } else if (key.startsWith('onetool-') || key.startsWith('tool-')) {
        const toolMatch = key.replace(/^(onetool-|tool-)/, '');
        const tool = ALL_TOOLS.find(t => toolMatch.startsWith(t.id));
        items.push({
          key,
          label: tool ? `${tool.name} saved data` : key,
          category: tool?.category || 'Other',
          size,
          toolId: tool?.id,
        });
      }
    }
  } catch { /* private browsing */ }

  return items;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function WorkspacePage() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<StoredItem[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [theme, setTheme] = useState<ThemeSettings>({ ...DEFAULTS });

  useEffect(() => {
    setMounted(true);
    setItems(scanStorage());
    setTheme(loadThemeSettings());
  }, []);

  const updateTheme = (patch: Partial<ThemeSettings>) => {
    const next = { ...theme, ...patch };
    setTheme(next);
    saveThemeSettings(next);
  };

  const usage = useMemo(() => {
    if (!mounted) return { used: 0, available: 5 * 1024 * 1024, percentage: 0 };
    return safeLocalStorage.getUsage();
  }, [mounted, items]);

  const recentTools = useMemo(() => {
    if (!mounted) return [];
    const ids = safeLocalStorage.getItem<string[]>('onetool-recents', []) ?? [];
    return ids.map(id => ALL_TOOLS.find(t => t.id === id)).filter(Boolean).slice(0, 8);
  }, [mounted]);

  // ── Export all data as JSON ──────────────────────────────────────────────
  const handleExport = () => {
    if (typeof window === 'undefined') return;
    const dump: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('onetool-') || key.startsWith('tool-') || key.startsWith('mmt-')) {
        try { dump[key] = JSON.parse(localStorage.getItem(key)!); }
        catch { dump[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onetool-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import data from JSON backup ────────────────────────────────────────
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (typeof data !== 'object' || data === null) throw new Error('Invalid format');
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          count++;
        }
        setImportStatus('success');
        setItems(scanStorage());
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!mounted) return <div className="min-h-screen bg-gray-50 dark:bg-[#0F111A]" />;

  const dataItems = items.filter(i => i.category !== 'System');
  const totalDataSize = items.reduce((s, i) => s + i.size, 0);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#0F111A] text-gray-900 dark:text-white p-4 md:p-8">
      <div className="w-full space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Workspace</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your saved data, storage usage, and backups — all in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
              <Download size={16} /> Export Backup
            </button>
            <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-colors">
              <Upload size={16} /> Import
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        {importStatus !== 'idle' && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${importStatus === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
            {importStatus === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {importStatus === 'success' ? 'Data imported successfully!' : 'Failed to import — check file format.'}
          </div>
        )}

        {/* Storage meter */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-3 mb-3">
            <HardDrive size={18} className="text-slate-400" />
            <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Browser Storage</h2>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all ${usage.percentage > 80 ? 'bg-red-500' : usage.percentage > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(usage.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{formatBytes(usage.used)} used</span>
            <span>{formatBytes(usage.available)} free of 5 MB</span>
          </div>
        </div>

        {/* Recently used */}
        {recentTools.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Clock size={14} className="text-slate-400" />
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recently Used</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {recentTools.map(tool => {
                if (!tool) return null;
                const Icon = getIconComponent(tool.icon as IconName);
                return (
                  <Link key={tool.id} href={tool.href} className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                    {Icon && <Icon size={16} className="text-slate-500 group-hover:text-emerald-500 transition-colors" />}
                    <span className="text-sm font-medium truncate">{tool.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Saved data */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Star size={14} className="text-slate-400" />
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Saved Data</h2>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500 ml-auto">
              {dataItems.length} items &middot; {formatBytes(totalDataSize)}
            </span>
          </div>

          {dataItems.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800">
              <FileText size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">No saved data yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Start using tools — your data stays in your browser.</p>
              <Link href="/" className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-emerald-600 hover:text-emerald-500">
                Browse tools <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {dataItems.map(item => {
                const tool = item.toolId ? ALL_TOOLS.find(t => t.id === item.toolId) : null;
                const Icon = tool ? getIconComponent(tool.icon as IconName) : BarChart3;
                return (
                  <div key={item.key} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800">
                    {Icon && <Icon size={16} className="text-slate-400 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-400">{item.category} &middot; {formatBytes(item.size)}{item.meta ? ` &middot; ${item.meta}` : ''}</p>
                    </div>
                    {tool && (
                      <Link href={tool.href} className="text-xs text-emerald-600 hover:text-emerald-500 font-medium flex-shrink-0">
                        Open
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Personalization */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-5">
          <div className="flex items-center gap-3">
            <Palette size={18} className="text-slate-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                Personalization
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Customize the look of the app — saved to your browser.
              </p>
            </div>
          </div>

          {/* Navbar Background */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Navbar Background</p>
            <div className="flex flex-wrap gap-2 items-center">
              {NAVBAR_BG_PRESETS.map(p => {
                const active = theme.navbar === p.value;
                return (
                  <button
                    key={p.value}
                    title={p.name}
                    onClick={() => updateTheme({ navbar: p.value })}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 border border-black/5 dark:border-white/10"
                    style={{
                      backgroundColor: p.value,
                      outline: active ? `3px solid ${p.value}` : '3px solid transparent',
                      outlineOffset: '2px',
                    }}
                  />
                );
              })}
              {/* Free color input */}
              <label
                title="Any color"
                className="w-9 h-9 rounded-xl cursor-pointer overflow-hidden relative flex-shrink-0"
                style={{ background: 'conic-gradient(#f43f5e, #f97316, #f59e0b, #10b981, #3b82f6, #8b5cf6, #f43f5e)' }}
              >
                <input
                  type="color"
                  value={theme.navbar === 'auto' ? '#ffffff' : theme.navbar}
                  onChange={e => updateTheme({ navbar: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              {theme.navbar !== 'auto' && (
                <button
                  onClick={() => updateTheme({ navbar: 'auto', navbarText: 'auto' })}
                  className="px-3 h-9 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </div>

          {/* Navbar Text Color */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Navbar Text Color</p>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => updateTheme({ navbarText: 'auto' })}
                className={`px-3 h-9 rounded-xl text-xs font-semibold border transition-all ${
                  theme.navbarText === 'auto'
                    ? 'border-[var(--ot-accent)] bg-[var(--ot-accent)]/10 text-[var(--ot-accent)]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                Auto ✨
              </button>
              <button
                title="Light text"
                onClick={() => updateTheme({ navbarText: '#f8fafc' })}
                className="w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: '#f8fafc',
                  borderColor: theme.navbarText === '#f8fafc' ? 'var(--ot-accent)' : '#e2e8f0',
                }}
              >
                <span className="text-xs font-black text-slate-700">A</span>
              </button>
              <button
                title="Dark text"
                onClick={() => updateTheme({ navbarText: '#1e293b' })}
                className="w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all hover:scale-105"
                style={{
                  backgroundColor: '#1e293b',
                  borderColor: theme.navbarText === '#1e293b' ? 'var(--ot-accent)' : 'transparent',
                }}
              >
                <span className="text-xs font-black text-white">A</span>
              </button>
              <label
                title="Any color"
                className="w-9 h-9 rounded-xl cursor-pointer overflow-hidden relative flex-shrink-0"
                style={{ background: 'conic-gradient(#f43f5e, #f97316, #f59e0b, #10b981, #3b82f6, #8b5cf6, #f43f5e)' }}
              >
                <input
                  type="color"
                  value={resolveNavbarTextColor(theme) ?? '#f8fafc'}
                  onChange={e => updateTheme({ navbarText: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              {resolveNavbarTextColor(theme) && (
                <p className="text-[11px] text-slate-400 font-mono">
                  → {resolveNavbarTextColor(theme)!.toUpperCase()}
                </p>
              )}
            </div>
          </div>

          {/* Font */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Text Font</p>
            <div className="flex flex-wrap gap-2">
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.id}
                  onClick={() => updateTheme({ font: f.id })}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                    theme.font === f.id
                      ? 'border-[var(--ot-accent)] bg-[var(--ot-accent)]/10 text-[var(--ot-accent)] font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  style={{ fontFamily: f.stack }}
                >
                  {f.label}
                </button>
              ))}
              {theme.font !== DEFAULTS.font && (
                <button
                  onClick={() => updateTheme({ font: DEFAULTS.font })}
                  className="px-4 py-2 rounded-xl text-sm border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 hover:text-slate-600 transition-all"
                >
                  Auto
                </button>
              )}
            </div>
          </div>

          {/* Logo Color */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Logo Color</p>
            <AccentSwatches value={theme.logo} onChange={c => updateTheme({ logo: c })} />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{theme.logo.toUpperCase()}</p>
              {theme.logo !== DEFAULTS.logo && (
                <button
                  onClick={() => updateTheme({ logo: DEFAULTS.logo })}
                  className="text-[11px] text-slate-400 hover:text-slate-600 border border-dashed border-slate-300 dark:border-slate-600 px-2 py-0.5 rounded-lg transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Accent Color</p>
            <AccentSwatches value={theme.accent} onChange={c => updateTheme({ accent: c })} />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{theme.accent.toUpperCase()}</p>
              {theme.accent !== DEFAULTS.accent && (
                <button
                  onClick={() => updateTheme({ accent: DEFAULTS.accent })}
                  className="text-[11px] text-slate-400 hover:text-slate-600 border border-dashed border-slate-300 dark:border-slate-600 px-2 py-0.5 rounded-lg transition-colors"
                >
                  Auto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-red-200 dark:border-red-900/30 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Trash2 size={16} className="text-red-500" />
            <h2 className="text-sm font-bold text-red-600 dark:text-red-400">Clear All Data</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">This removes all saved tool data from your browser. This cannot be undone. Export a backup first.</p>
          <button
            onClick={() => {
              if (confirm('Delete ALL OneTool data from this browser? This cannot be undone.')) {
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const k = localStorage.key(i);
                  if (k && (k.startsWith('onetool-') || k.startsWith('tool-') || k.startsWith('mmt-'))) keysToRemove.push(k);
                }
                keysToRemove.forEach(k => localStorage.removeItem(k));
                setItems([]);
              }
            }}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors"
          >
            Clear Everything
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, IndianRupee, Lock, LayoutGrid, ChevronRight, Palette, Check, Pin, LayoutDashboard } from 'lucide-react';
import { ALL_TOOLS, CATEGORY_ORDER } from '@/app/lib/tools-data';
import { getIconComponent, type IconName } from '@/app/lib/utils/icon-mapper';

// Featured tools shown on landing — one per major persona
const FEATURED_IDS = [
  'pf-statement-manager', // Personal Finance
  'gst-calculator',        // GST
  'biz-invoices',          // Business
  'smart-budget',          // Budget
  'dev-station',           // Developer
  'smart-pdf-merge',       // Documents
];

// Persona cards
const PERSONAS = [
  {
    emoji: '💼',
    title: 'Salaried Professional',
    desc: 'Track expenses, save tax, plan your salary, manage investments',
    categories: ['Personal Finance', 'Finance', 'GST & Tax'],
    href: '/home',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-200 dark:border-blue-500/20',
    text: 'text-blue-700 dark:text-blue-300',
  },
  {
    emoji: '🏪',
    title: 'Business Owner',
    desc: 'GST invoices, khata, inventory, P&L — run your business from one place',
    categories: ['Business OS', 'GST & Tax', 'Business'],
    href: '/home',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-200 dark:border-violet-500/20',
    text: 'text-violet-700 dark:text-violet-300',
  },
  {
    emoji: '👨‍💻',
    title: 'Developer / Creator',
    desc: 'JSON formatter, JWT decoder, regex tester, PDF tools, and more',
    categories: ['Developer', 'Documents', 'AI'],
    href: '/home',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
];

// Category overview icons (simple emoji map — avoids importing all of Lucide)
const CAT_EMOJI: Record<string, string> = {
  'Personal Finance': '📊', 'Finance': '💰', 'GST & Tax': '🧾',
  'Real Estate': '🏠', 'Career': '🎯', 'Startup': '🚀',
  'Travel': '✈️', 'Personal CRM': '👥', 'Business CRM': '🤝',
  'Business OS': '🏪', 'Business': '💼', 'Documents': '📄',
  'Developer': '⌨️', 'Productivity': '⚡', 'Converters': '🔄',
  'Design': '🎨', 'Health': '❤️', 'AI': '🤖', 'Creator': '🎬',
};

const TOOL_ICON_BG: Record<string, string> = {
  'pf-statement-manager': 'bg-gradient-to-br from-blue-500 to-indigo-600',
  'gst-calculator':        'bg-gradient-to-br from-orange-500 to-amber-600',
  'biz-invoices':          'bg-gradient-to-br from-amber-500 to-orange-500',
  'smart-budget':          'bg-gradient-to-br from-emerald-500 to-teal-600',
  'dev-station':           'bg-gradient-to-br from-violet-600 to-purple-700',
  'smart-pdf-merge':       'bg-gradient-to-br from-red-600 to-rose-500',
};

interface Props {
  searchIntent?: string | null;
}

export function LandingPage({ searchIntent }: Props) {
  const featuredTools = FEATURED_IDS
    .map(id => ALL_TOOLS.find(t => t.id === id))
    .filter(Boolean) as typeof ALL_TOOLS;

  const categoryCounts = CATEGORY_ORDER.map(cat => ({
    name: cat,
    count: ALL_TOOLS.filter(t => t.category === cat).length,
    emoji: CAT_EMOJI[cat] || '📦',
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F111A]">

      {/* ── Search intent banner ─────────────────────────────────────────── */}
      {searchIntent && (
        <div className="bg-indigo-600 text-white px-4 py-2.5 text-center text-sm">
          You searched for &ldquo;<strong>{searchIntent}</strong>&rdquo; —
          <Link href={`/home?search=${encodeURIComponent(searchIntent)}`} className="underline ml-1 font-semibold">
            See matching tools →
          </Link>
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="px-4 pt-16 pb-12 md:pt-24 md:pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
          <Zap size={11} />
          158 tools · 19 categories · 100% free
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight">
          Everything you need,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
            one place.
          </span>
        </h1>

        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Finance, business, developer tools, documents, health — built for India.
          No login. No cloud. Your data never leaves your device.
        </p>

        {/* Trust pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { icon: Lock, label: 'Data stays on your device' },
            { icon: IndianRupee, label: 'India-focused' },
            { icon: Shield, label: 'No account needed' },
            { icon: Zap, label: 'Instant — no loading' },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              <Icon size={11} className="text-indigo-500" />
              {label}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/home"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-indigo-500/20"
          >
            <LayoutGrid size={16} />
            Browse All 158 Tools
            <ArrowRight size={15} />
          </Link>
          <a
            href="#categories"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:border-slate-300 dark:hover:border-white/20 transition-colors"
          >
            What&apos;s inside ↓
          </a>
        </div>
      </section>

      {/* ── Personas ────────────────────────────────────────────────────── */}
      <section className="px-4 pb-12 max-w-4xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
          Built for
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PERSONAS.map(p => (
            <Link
              key={p.title}
              href={p.href}
              className={`group p-5 rounded-2xl border ${p.bg} ${p.border} hover:shadow-lg transition-all duration-200`}
            >
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h3 className={`font-bold text-sm ${p.text} mb-1`}>{p.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{p.desc}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {p.categories.map(c => (
                  <span key={c} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.bg} ${p.text} border ${p.border}`}>
                    {c}
                  </span>
                ))}
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold ${p.text}`}>
                Explore tools <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured tools ─────────────────────────────────────────────── */}
      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Start with these
          </p>
          <Link href="/home" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            See all <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {featuredTools.map(tool => {
            const IconComponent = typeof tool.icon === 'string'
              ? getIconComponent(tool.icon as IconName)
              : null;
            return (
              <Link
                key={tool.id}
                href={tool.href || `/tools/${tool.category.toLowerCase().replace(/ /g, '-')}/${tool.id}`}
                className="group flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-sm group-hover:scale-110 transition-transform ${TOOL_ICON_BG[tool.id] || 'bg-gradient-to-br from-indigo-500 to-violet-600'}`}>
                  {IconComponent ? <IconComponent size={20} /> : null}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{tool.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────── */}
      <section className="px-4 pb-12 max-w-3xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
          How it works
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { step: '1', title: 'Pick a tool', desc: 'Browse 158 tools across 19 categories' },
            { step: '2', title: 'Enter your data', desc: 'Everything stays in your browser — private by default' },
            { step: '3', title: 'Get results', desc: 'Instant calculations, charts and insights — no signup ever' },
          ].map(s => (
            <div key={s.step} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-3">{s.step}</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">{s.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Make it yours ──────────────────────────────────────────────── */}
      <section className="px-4 pb-12 max-w-5xl mx-auto">
        <div className="rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-500/10 dark:via-[#0F111A] dark:to-violet-500/10">
          <div className="flex flex-col md:flex-row">

            {/* Left: Text */}
            <div className="flex-1 p-6 md:p-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4">
                <Palette size={11} />
                Fully personalizable
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                Make it yours.
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
                This isn&apos;t just a static app. Change the navbar color, pick an accent, switch fonts, pin your tools into custom Spaces — it remembers everything, no account needed.
              </p>

              <ul className="space-y-2.5 mb-6">
                {[
                  { icon: Palette, label: 'Navbar color', desc: '10 presets + any custom hex' },
                  { icon: Check,   label: 'Accent color', desc: 'Buttons, links, active states' },
                  { icon: Check,   label: 'Font style',   desc: 'Sans · Serif · Mono · Rounded' },
                  { icon: Pin,     label: 'Pin tools',    desc: 'Your own Spaces & quick-launch tiles' },
                ].map(item => (
                  <li key={item.label} className="flex items-center gap-2.5 text-sm">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                      <item.icon size={10} strokeWidth={3} />
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{item.label}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-xs">— {item.desc}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20"
              >
                <LayoutDashboard size={14} />
                Open Theme Studio
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Right: Visual preview */}
            <div className="w-full md:w-64 p-6 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-indigo-200 dark:border-indigo-500/20 bg-white/50 dark:bg-white/[0.02]">
              {/* Mini navbar previews */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Navbar presets</p>
              {[
                { bg: '#096464', text: '#f8fafc', label: 'Teal' },
                { bg: '#6366f1', text: '#f8fafc', label: 'Indigo' },
                { bg: '#0f172a', text: '#f8fafc', label: 'Dark' },
                { bg: '#ffffff', text: '#1e293b', label: 'White' },
                { bg: '#f0f4ff', text: '#1e293b', label: 'Lavender' },
              ].map(p => (
                <div
                  key={p.bg}
                  className="h-8 rounded-lg flex items-center px-3 gap-2 shadow-sm border border-black/5"
                  style={{ backgroundColor: p.bg }}
                >
                  <div className="w-4 h-4 rounded-md flex-shrink-0 font-black text-[8px] flex items-center justify-center" style={{ backgroundColor: p.text + '33', color: p.text }}>O</div>
                  <div className="flex-1 h-1.5 rounded-full opacity-25" style={{ backgroundColor: p.text }} />
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full opacity-40" style={{ backgroundColor: p.text }} />
                    <div className="w-3 h-3 rounded-full opacity-40" style={{ backgroundColor: p.text }} />
                  </div>
                  <span className="text-[9px] font-semibold opacity-50" style={{ color: p.text }}>{p.label}</span>
                </div>
              ))}

              {/* Color swatches */}
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1 mb-1">Accent colors</p>
              <div className="flex flex-wrap gap-1.5">
                {['#6366f1','#8b5cf6','#3b82f6','#06b6d4','#10b981','#f43f5e','#f97316','#f59e0b','#14b8a6','#64748b'].map(c => (
                  <div key={c} className="w-6 h-6 rounded-lg border-2 border-white dark:border-slate-800 shadow-sm hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category overview ──────────────────────────────────────────── */}
      <section id="categories" className="px-4 pb-12 max-w-5xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
          19 categories, one place
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {categoryCounts.map(cat => (
            <Link
              key={cat.name}
              href={`/home?search=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-center group"
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-tight">{cat.name}</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{cat.count} tools</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <section className="px-4 pb-12">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: '158', label: 'Free tools' },
            { value: '19', label: 'Categories' },
            { value: '0', label: 'Accounts needed' },
            { value: '100%', label: 'Client-side & private' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{s.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="px-4 pb-20 text-center">
        <div className="max-w-lg mx-auto p-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-xl shadow-indigo-500/20">
          <h2 className="text-2xl font-black text-white mb-2">Ready to start?</h2>
          <p className="text-indigo-100 text-sm mb-6">No signup. No download. Just open a tool and go.</p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
          >
            <LayoutGrid size={16} />
            Open All Tools
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getIconComponent, type IconName } from '@/app/lib/utils/icon-mapper';
import { ALL_TOOLS } from '@/app/lib/tools-data';

// ── Workflow connections: after using tool X, suggest tool Y ────────────────
const WORKFLOWS: Record<string, { ids: string[]; reason: string }> = {
  // Analytics flow
  'managetransaction': { ids: ['expenses', 'credits', 'self-serve-analytics'], reason: 'Analyze your uploaded data' },
  'expenses':          { ids: ['credits', 'smart-budget', 'self-serve-analytics'], reason: 'Continue your financial analysis' },
  'credits':           { ids: ['expenses', 'smart-budget', 'autonomous-financial-analyst'], reason: 'See the full picture' },
  'self-serve-analytics': { ids: ['expenses', 'credits', 'autonomous-financial-analyst'], reason: 'Dive deeper' },
  'autonomous-financial-analyst': { ids: ['smart-budget', 'expenses', 'smart-retirement'], reason: 'Act on your insights' },

  // Finance flow
  'smart-budget':     { ids: ['expenses', 'managetransaction', 'smart-retirement'], reason: 'Track real spending vs budget' },
  'smart-loan':       { ids: ['smart-budget', 'smart-sip', 'gst-calculator'], reason: 'Plan around your loan' },
  'smart-sip':        { ids: ['smart-retirement', 'smart-net-worth', 'smart-loan'], reason: 'Complete your investment plan' },
  'smart-net-worth':  { ids: ['smart-retirement', 'smart-budget', 'smart-sip'], reason: 'Grow your wealth' },
  'smart-retirement': { ids: ['smart-sip', 'smart-net-worth', 'smart-budget'], reason: 'Secure your future' },
  'gst-calculator':   { ids: ['invoice-generator', 'smart-budget', 'smart-loan'], reason: 'Next business step' },

  // Business flow
  'invoice-generator': { ids: ['gst-calculator', 'salary-slip', 'expenses'], reason: 'More business tools' },
  'salary-slip':       { ids: ['invoice-generator', 'rent-receipt', 'smart-budget'], reason: 'Related documents' },
  'rent-receipt':      { ids: ['invoice-generator', 'salary-slip', 'smart-budget'], reason: 'More document generators' },
  'id-card':           { ids: ['invoice-generator', 'salary-slip', 'qr-code'], reason: 'Professional essentials' },
  'smart-agreement':   { ids: ['invoice-generator', 'salary-slip', 'id-card'], reason: 'Business document suite' },

  // Documents flow
  'smart-pdf-merge':    { ids: ['smart-pdf-split', 'smart-img-compress', 'smart-ocr'], reason: 'More document tools' },
  'smart-pdf-split':    { ids: ['smart-pdf-merge', 'smart-ocr', 'universal-converter'], reason: 'More PDF tools' },
  'smart-img-compress': { ids: ['smart-img-convert', 'smart-pdf-merge', 'universal-converter'], reason: 'More image tools' },
  'smart-img-convert':  { ids: ['smart-img-compress', 'universal-converter', 'color-picker'], reason: 'Related tools' },
  'smart-ocr':          { ids: ['smart-scan', 'smart-pdf-merge', 'smart-word'], reason: 'Work with extracted text' },
  'universal-converter':{ ids: ['smart-img-compress', 'smart-pdf-merge', 'smart-img-convert'], reason: 'Convert more files' },

  // Developer flow
  'smart-json':      { ids: ['smart-jwt', 'api-playground', 'smart-diff'], reason: 'More dev tools' },
  'api-playground':  { ids: ['smart-json', 'smart-jwt', 'hash-gen'], reason: 'Debugging toolkit' },
  'smart-jwt':       { ids: ['api-playground', 'hash-gen', 'smart-json'], reason: 'Security tools' },
  'regex-tester':    { ids: ['smart-diff', 'smart-json', 'dev-station'], reason: 'More dev tools' },
  'dev-station':     { ids: ['smart-json', 'api-playground', 'regex-tester'], reason: 'Power tools' },

  // Productivity
  'qr-code':    { ids: ['smart-pass', 'unit-convert', 'color-picker'], reason: 'More quick tools' },
  'smart-pass':  { ids: ['qr-code', 'hash-gen', 'smart-jwt'], reason: 'Security essentials' },
  'pomodoro':    { ids: ['life-os', 'smart-budget', 'smart-pass'], reason: 'Productivity boost' },
  'life-os':     { ids: ['pomodoro', 'smart-budget', 'expenses'], reason: 'Organize everything' },

  // Design
  'color-picker':  { ids: ['color-studio', 'smart-img-compress', 'qr-code'], reason: 'Design toolkit' },
  'color-studio':  { ids: ['color-picker', 'smart-img-convert', 'qr-code'], reason: 'More design tools' },
};

export function WhatsNext({ toolId }: { toolId: string }) {
  const workflow = WORKFLOWS[toolId];
  if (!workflow) return null;

  const tools = workflow.ids
    .map(id => ALL_TOOLS.find(t => t.id === id))
    .filter(Boolean)
    .slice(0, 3);

  if (tools.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">
        {workflow.reason}
      </p>
      <div className="flex flex-wrap gap-2">
        {tools.map(tool => {
          if (!tool) return null;
          const Icon = getIconComponent(tool.icon as IconName);
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/30 transition-all group"
            >
              {Icon && <Icon size={15} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {tool.name}
              </span>
              <ArrowRight size={12} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import type { ToolHelpConfig } from '@/app/lib/tools-data';

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL HELP PANEL
// Self-contained "?" button + modal.
// Config comes from the helpConfig field on each Tool entry in tools-data.tsx.
// Rendered by GlobalHeader automatically when the current tool has a helpConfig.
// ═══════════════════════════════════════════════════════════════════════════════

interface ToolHelpPanelProps {
  config: ToolHelpConfig;
}

export function ToolHelpPanel({ config }: ToolHelpPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger button — matches the icon button pattern used across the app */}
      <button
        onClick={() => setIsOpen(true)}
        title="How to use this tool"
        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <HelpCircle size={16} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <HelpCircle size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">{config.title}</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {/* Description */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {config.description}
              </p>

              {/* Steps */}
              {config.steps.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    How to use
                  </p>
                  <ol className="space-y-3">
                    {config.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            {step.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tips */}
              {config.tips && config.tips.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Tips
                  </p>
                  <ul className="space-y-2">
                    {config.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5">
                        <span className="text-blue-500 text-xs mt-0.5 shrink-0 font-black">→</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{tip.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

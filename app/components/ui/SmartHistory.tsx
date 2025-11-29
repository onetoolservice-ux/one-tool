"use client";
import React, { useState, useEffect } from "react";
import { History, RotateCcw, Trash2, X } from "lucide-react";
import { showToast } from "@/app/shared/Toast";

interface Props {
  toolId: string;
  currentValue: string;
  onRestore: (val: string) => void;
}

export default function SmartHistory({ toolId, currentValue, onRestore }: Props) {
  const [history, setHistory] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(`history-${toolId}`);
    if (saved) setHistory(JSON.parse(saved));
  }, [toolId]);

  // Save unique values when they change (debounced or on blur logic could be added, here we rely on manual or effect)
  // For simplicity in this v1, we assume the parent might trigger a save, OR we just save valid runs.
  // Actually, let's expose a "Save" function or auto-save on open.

  const saveCurrent = () => {
    if (!currentValue || history[0] === currentValue) return;
    const newHistory = [currentValue, ...history.filter(h => h !== currentValue)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem(`history-${toolId}`, JSON.stringify(newHistory));
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem(`history-${toolId}`);
    showToast("History Cleared");
  };

  return (
    <div className="relative">
      <button
        onClick={() => { saveCurrent(); setIsOpen(!isOpen); }}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-bold transition   ${isOpen ? 'bg-slate-100 text-main dark:text-slate-100 dark:text-slate-200 border-line' : 'bg-surface dark:bg-slate-800 dark:bg-surface text-muted dark:text-muted dark:text-muted dark:text-muted border-line dark:border-slate-700 dark:border-slate-800 hover:bg-background dark:bg-surface dark:bg-slate-950'}`}
        title="Recent Inputs"
      >
        <History size={14} /> History
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-80 bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-xl dark:shadow-none dark:border dark:border-slate-600 border border-line dark:border-slate-700 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between p-3 border-b bg-background dark:bg-surface dark:bg-slate-950">
              <span className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase tracking-wide">Recent Inputs</span>
              <button
                aria-label="Delete Item"
                onClick={clear}
                className="text-muted/70 hover:text-rose-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {history.length === 0 ? (
                <div className="p-6 text-center text-muted/70 text-xs italic">No history yet.<br />Run or save code to populate.</div>
              ) : (
                history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { onRestore(item); setIsOpen(false); showToast("Restored"); }}
                    className="w-full text-left p-3 border-b last:border-0 hover:bg-blue-50 transition group"
                  >
                    <div className="font-mono text-xs text-muted dark:text-muted/70 dark:text-muted/70 truncate">{item.substring(0, 40)}...</div>
                    <div className="text-xs text-slate-300 mt-1 group-hover:text-blue-400">Click to restore</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

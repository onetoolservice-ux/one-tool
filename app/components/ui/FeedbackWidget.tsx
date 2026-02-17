'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquarePlus, X, Send, Check } from 'lucide-react';
import { trackFeedback } from '@/app/lib/telemetry';

const EMOJIS = [
  { value: 4, emoji: '\u{1F60D}', label: 'Love it' },
  { value: 3, emoji: '\u{1F60A}', label: 'Like it' },
  { value: 2, emoji: '\u{1F610}', label: 'Neutral' },
  { value: 1, emoji: '\u{1F615}', label: 'Needs work' },
];

interface FeedbackWidgetProps {
  toolId: string;
}

export function FeedbackWidget({ toolId }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleSubmit = () => {
    if (!rating) return;

    const entry = {
      toolId,
      rating,
      text: text.trim(),
      timestamp: Date.now(),
      url: window.location.pathname,
    };

    // Save to localStorage
    try {
      const raw = localStorage.getItem('onetool-feedback');
      const existing = raw ? JSON.parse(raw) : [];
      existing.push(entry);
      // Keep last 50 entries max
      localStorage.setItem('onetool-feedback', JSON.stringify(existing.slice(-50)));
    } catch { /* ignore */ }

    // Track in GA
    trackFeedback(toolId, rating, text.trim());

    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setRating(null);
      setText('');
    }, 1800);
  };

  return (
    <div ref={panelRef} className="fixed bottom-6 left-6 z-40">
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-[#1C1F2E] border border-gray-200 dark:border-white/10 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          aria-label="Give feedback"
        >
          <MessageSquarePlus size={18} className="text-indigo-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 hidden sm:inline">Feedback</span>
        </button>
      )}

      {/* Feedback panel */}
      {isOpen && (
        <div className="w-72 bg-white dark:bg-[#1C1F2E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {submitted ? (
            /* Thank you state */
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <Check size={24} className="text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Thank you!</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your feedback helps us improve.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">How&apos;s this tool?</p>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <X size={16} className="text-gray-400" />
                </button>
              </div>

              {/* Emoji rating */}
              <div className="flex justify-center gap-3 px-4 py-3">
                {EMOJIS.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => setRating(e.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      rating === e.value
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 scale-110 ring-2 ring-indigo-400'
                        : 'hover:bg-gray-50 dark:hover:bg-white/5 hover:scale-105'
                    }`}
                    aria-label={e.label}
                  >
                    <span className="text-2xl">{e.emoji}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{e.label}</span>
                  </button>
                ))}
              </div>

              {/* Optional text */}
              {rating && (
                <div className="px-4 pb-2 animate-in fade-in duration-200">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tell us more (optional)..."
                    rows={2}
                    maxLength={500}
                    className="w-full text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-gray-700 dark:text-gray-200 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              )}

              {/* Submit */}
              <div className="px-4 pb-4">
                <button
                  onClick={handleSubmit}
                  disabled={!rating}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Send size={14} />
                  Submit Feedback
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

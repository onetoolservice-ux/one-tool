'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Copy, Check, ChevronRight, Info,
  Zap, Eye, BarChart3, Hash, Smile
} from 'lucide-react';
import WriterNav from './shared/WriterNav';
import {
  loadWriterStore, onWriterStoreUpdate, updateDocument,
  getActiveDocument, scoreHeadline, WriterStore
} from './writer-store';

const POWER_WORD_LIST = [
  'ultimate', 'proven', 'secret', 'powerful', 'simple', 'instant',
  'surprising', 'essential', 'complete', 'free', 'new', 'easy',
  'best', 'top', 'amazing', 'incredible', 'effortless', 'master',
  'boost', 'transform', 'unlock', 'discover', 'learn', 'guide',
];

function generateAlternatives(headline: string): string[] {
  const words = headline.trim();
  if (!words) return [];

  const variants: string[] = [];

  // Add a number
  if (!/\d/.test(words)) {
    variants.push(`7 ${words}`);
    variants.push(`${words}: 5 Proven Ways`);
  }

  // Add power word
  const base = words.replace(/^(how to|the|a|an)\s+/i, '');
  variants.push(`The Ultimate Guide to ${base}`);
  variants.push(`How to ${base} (Step-by-Step)`);
  variants.push(`Why ${base} Matters More Than You Think`);
  variants.push(`The Simple Secret to ${base}`);
  variants.push(`${base} — Everything You Need to Know`);

  // Remove duplicates and filter out too-similar to original
  return variants
    .filter((v) => v.toLowerCase() !== words.toLowerCase())
    .slice(0, 5);
}

function ScoreBar({ label, value, max, color, icon }: {
  label: string; value: number; max: number; color: string; icon: React.ReactNode
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          {icon} {label}
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function WriterHeadline() {
  const [store, setStore] = useState<WriterStore | null>(null);
  const [headline, setHeadline] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [savedToDoc, setSavedToDoc] = useState(false);

  const reload = useCallback(() => {
    const s = loadWriterStore();
    setStore(s);
    const doc = getActiveDocument(s);
    if (doc && doc.headline) setHeadline(doc.headline);
  }, []);

  useEffect(() => { reload(); return onWriterStoreUpdate(reload); }, [reload]);

  const doc = store ? getActiveDocument(store) : null;

  const scores = scoreHeadline(headline);
  const alternatives = generateAlternatives(headline);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const useHeadline = (h: string) => {
    setHeadline(h);
    if (doc) {
      updateDocument(doc.id, { headline: h, title: h });
      setSavedToDoc(true);
      setTimeout(() => setSavedToDoc(false), 2000);
    }
  };

  const saveCurrentHeadline = () => {
    if (!doc || !headline.trim()) return;
    updateDocument(doc.id, { headline, title: headline });
    setSavedToDoc(true);
    setTimeout(() => setSavedToDoc(false), 2000);
  };

  const getScoreColor = (score: number) =>
    score >= 75 ? 'text-green-600 dark:text-green-400' :
    score >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
    'text-red-500 dark:text-red-400';

  const getScoreBgColor = (score: number) =>
    score >= 75 ? 'bg-green-500' :
    score >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  const getScoreLabel = (score: number) =>
    score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Weak';

  const wordCount = headline.split(/\s+/).filter(Boolean).length;
  const charCount = headline.length;
  const powerWordsFound = headline.toLowerCase().split(/\s+/).filter((w) => POWER_WORD_LIST.includes(w));
  const hasNumber = /\d/.test(headline);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <WriterNav />

      <div className="p-6 max-w-none">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Headline Lab</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Score and optimize your headline before publishing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input + Score */}
          <div className="space-y-4">
            {/* Input */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-2">
                Your Headline
              </label>
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Type your headline here…"
                rows={3}
                className="w-full text-base font-semibold bg-transparent border-none outline-none resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span>{wordCount} words</span>
                  <span>{charCount} chars</span>
                  <span className={charCount > 70 ? 'text-red-500' : charCount >= 40 ? 'text-green-500' : 'text-yellow-500'}>
                    {charCount > 70 ? 'Too long' : charCount >= 40 ? 'Good length' : 'Too short'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyText(headline)}
                    className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Copy"
                  >
                    {copied === headline ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={saveCurrentHeadline}
                    disabled={!doc || !headline.trim()}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    {savedToDoc ? <><Check size={12} /> Saved!</> : 'Save to doc'}
                  </button>
                </div>
              </div>
            </div>

            {/* Overall score */}
            {headline.trim() && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-4">
                  <div className="relative inline-flex items-center justify-center">
                    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
                      <circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" strokeWidth="7" className="text-gray-100 dark:text-gray-800" />
                      <circle
                        cx="36" cy="36" r="30" fill="none" strokeWidth="7"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * (1 - scores.total / 100)}`}
                        className={getScoreBgColor(scores.total).replace('bg-', 'stroke-')}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`absolute text-lg font-black ${getScoreColor(scores.total)}`}>{scores.total}</span>
                  </div>
                  <div>
                    <div className={`text-xl font-bold ${getScoreColor(scores.total)}`}>
                      {getScoreLabel(scores.total)}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      Headline Score / 100
                    </div>
                  </div>
                </div>

                {/* Breakdown bars */}
                <div className="mt-4 space-y-3">
                  <ScoreBar
                    label="Power words"
                    value={scores.powerWords > 0 ? 30 : 0}
                    max={30}
                    color="bg-amber-500"
                    icon={<Zap size={11} />}
                  />
                  <ScoreBar
                    label="Headline length"
                    value={scores.length}
                    max={25}
                    color="bg-blue-500"
                    icon={<Eye size={11} />}
                  />
                  <ScoreBar
                    label="Contains number"
                    value={scores.hasNumber ? 15 : 0}
                    max={15}
                    color="bg-green-500"
                    icon={<Hash size={11} />}
                  />
                  <ScoreBar
                    label="Positive sentiment"
                    value={scores.sentiment}
                    max={15}
                    color="bg-purple-500"
                    icon={<Smile size={11} />}
                  />
                  <ScoreBar
                    label="Clarity"
                    value={scores.clarity}
                    max={15}
                    color="bg-teal-500"
                    icon={<BarChart3 size={11} />}
                  />
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Info size={13} className="text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Headline Tips</span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-700 dark:text-amber-300">
                <li className={`flex items-start gap-1.5 ${hasNumber ? 'opacity-50 line-through' : ''}`}>
                  <span className="shrink-0">{hasNumber ? '✓' : '·'}</span> Include a specific number (e.g. "7 Ways to…")
                </li>
                <li className={`flex items-start gap-1.5 ${powerWordsFound.length > 0 ? 'opacity-50 line-through' : ''}`}>
                  <span className="shrink-0">{powerWordsFound.length > 0 ? '✓' : '·'}</span> Use a power word: ultimate, proven, simple, secret…
                </li>
                <li className={`flex items-start gap-1.5 ${charCount >= 40 && charCount <= 70 ? 'opacity-50 line-through' : ''}`}>
                  <span className="shrink-0">{charCount >= 40 && charCount <= 70 ? '✓' : '·'}</span> Keep it 40–70 characters for best click-through
                </li>
                <li className={`flex items-start gap-1.5 ${wordCount >= 6 && wordCount <= 12 ? 'opacity-50 line-through' : ''}`}>
                  <span className="shrink-0">{wordCount >= 6 && wordCount <= 12 ? '✓' : '·'}</span> Aim for 6–12 words — short enough to scan
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Alternatives */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" /> Alternative Headlines
            </h2>

            {!headline.trim() ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-xl">
                <Sparkles size={32} className="text-amber-300 dark:text-amber-700 mb-2" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Type a headline to see AI-styled alternatives</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alternatives.map((alt, i) => {
                  const altScore = scoreHeadline(alt);
                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 group hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{alt}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className={`text-xs font-bold ${getScoreColor(altScore.total)}`}>
                              Score: {altScore.total}
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">{alt.length} chars · {alt.split(/\s+/).length} words</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyText(alt)}
                            className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Copy"
                          >
                            {copied === alt ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                          </button>
                          <button
                            onClick={() => useHeadline(alt)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Use this <ChevronRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Power words reference */}
            <div className="mt-5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Power Words Bank
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {POWER_WORD_LIST.map((word) => {
                  const isUsed = powerWordsFound.includes(word);
                  return (
                    <button
                      key={word}
                      onClick={() => setHeadline((h) => `${h} ${word}`.trim())}
                      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                        isUsed
                          ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 font-semibold'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:text-amber-700 dark:hover:text-amber-300'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

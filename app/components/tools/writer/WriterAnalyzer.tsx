'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, AlertCircle, CheckCircle2, Info,
  ChevronRight, PenLine, Eye, EyeOff, Zap
} from 'lucide-react';
import WriterNav from './shared/WriterNav';
import {
  loadWriterStore, onWriterStoreUpdate, getActiveDocument,
  getWordCount, getSentences, getFleschScore, getPassiveVoiceCount,
  getFillerWordCount, getLongSentences, getWritingScore, FILLER_WORDS,
  WriterStore
} from './writer-store';

type HighlightMode = 'none' | 'passive' | 'filler' | 'long';

function getScoreColor(score: number): string {
  if (score >= 75) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
}

function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-green-100 dark:bg-green-900/30';
  if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

function getFleschLabel(score: number): string {
  if (score >= 90) return 'Very Easy';
  if (score >= 80) return 'Easy';
  if (score >= 70) return 'Fairly Easy';
  if (score >= 60) return 'Standard';
  if (score >= 50) return 'Fairly Difficult';
  if (score >= 30) return 'Difficult';
  return 'Very Confusing';
}

function highlightText(text: string, mode: HighlightMode): React.ReactNode[] {
  if (mode === 'none') return [text];

  const sentences = getSentences(text);

  return sentences.map((sentence, i) => {
    let highlight = false;
    let bgClass = '';

    if (mode === 'passive') {
      const beVerbs = /\b(am|is|are|was|were|be|been|being)\b/i;
      const pastParticiple = /\b\w+(ed|en|t)\b/i;
      highlight = beVerbs.test(sentence) && pastParticiple.test(sentence);
      bgClass = 'bg-orange-100 dark:bg-orange-900/30 rounded';
    }

    if (mode === 'filler') {
      const lower = sentence.toLowerCase();
      highlight = FILLER_WORDS.some((fw) => {
        const re = new RegExp(`\\b${fw.replace(/ /g, '\\s+')}\\b`, 'i');
        return re.test(lower);
      });
      bgClass = 'bg-purple-100 dark:bg-purple-900/30 rounded';
    }

    if (mode === 'long') {
      highlight = sentence.split(/\s+/).length > 30;
      bgClass = 'bg-red-100 dark:bg-red-900/30 rounded';
    }

    return (
      <span key={i} className={highlight ? bgClass : undefined}>
        {sentence}{i < sentences.length - 1 ? ' ' : ''}
      </span>
    );
  });
}

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: React.ReactNode;
}

function MetricCard({ label, value, sub, color = '', icon }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function WriterAnalyzer() {
  const [store, setStore] = useState<WriterStore | null>(null);
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('none');

  const reload = useCallback(() => {
    setStore(loadWriterStore());
  }, []);

  useEffect(() => {
    reload();
    return onWriterStoreUpdate(reload);
  }, [reload]);

  const doc = store ? getActiveDocument(store) : null;
  const text = doc?.content ?? '';

  const wordCount = getWordCount(text);
  const sentences = getSentences(text);
  const flesch = getFleschScore(text);
  const passive = getPassiveVoiceCount(text);
  const filler = getFillerWordCount(text);
  const longSents = getLongSentences(text);
  const score = getWritingScore(text);

  const passivePercent = sentences.length > 0 ? Math.round((passive / sentences.length) * 100) : 0;
  const avgWordsPerSentence = sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0;

  const hasContent = wordCount >= 10;

  const HIGHLIGHT_MODES: { mode: HighlightMode; label: string; color: string }[] = [
    { mode: 'none', label: 'None', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
    { mode: 'passive', label: 'Passive voice', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    { mode: 'filler', label: 'Filler words', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    { mode: 'long', label: 'Long sentences', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <WriterNav />

      <div className="p-6 max-w-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Writing Analyzer</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {doc ? doc.title : 'No document selected'} · {wordCount.toLocaleString()} words
            </p>
          </div>
          {!hasContent && (
            <a
              href="/tools/writer/writer-studio"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <PenLine size={14} /> Go to Studio <ChevronRight size={13} />
            </a>
          )}
        </div>

        {!hasContent ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BarChart3 size={48} className="text-amber-300 dark:text-amber-700 mb-3" />
            <h2 className="text-lg font-semibold text-gray-600 dark:text-gray-400">Nothing to analyze yet</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-sm">
              Write at least 10 words in the Studio, then come back here for a full analysis.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Score + Metrics */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              {/* Overall Score */}
              <div className={`rounded-xl p-6 text-center ${getScoreBg(score)}`}>
                <div className={`text-5xl font-black ${getScoreColor(score)}`}>{score}</div>
                <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mt-1">Overall Score</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {score >= 75 ? 'Excellent writing!' : score >= 50 ? 'Good — room to improve' : 'Needs revision'}
                </div>
                {/* Radial progress ring (CSS) */}
                <div className="mt-4 relative inline-flex items-center justify-center">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                    <circle
                      cx="40" cy="40" r="34" fill="none" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
                      className={score >= 75 ? 'stroke-green-500' : score >= 50 ? 'stroke-yellow-500' : 'stroke-red-500'}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
                </div>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Readability"
                  value={flesch}
                  sub={getFleschLabel(flesch)}
                  color={getScoreColor(flesch)}
                  icon={<Zap size={13} />}
                />
                <MetricCard
                  label="Passive"
                  value={`${passivePercent}%`}
                  sub={`${passive} of ${sentences.length} sentences`}
                  color={passivePercent > 20 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}
                />
                <MetricCard
                  label="Filler words"
                  value={filler}
                  sub={filler === 0 ? 'Clean!' : 'Consider removing'}
                  color={filler > 5 ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'}
                />
                <MetricCard
                  label="Long sentences"
                  value={longSents.length}
                  sub={`Avg ${avgWordsPerSentence} w/sentence`}
                  color={longSents.length > 3 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}
                />
              </div>

              {/* Suggestions */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-3">
                  Suggestions
                </h3>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  {passivePercent > 20 && (
                    <li className="flex items-start gap-2">
                      <AlertCircle size={13} className="text-orange-500 shrink-0 mt-0.5" />
                      Use more active voice — {passive} passive sentences detected.
                    </li>
                  )}
                  {filler > 5 && (
                    <li className="flex items-start gap-2">
                      <AlertCircle size={13} className="text-purple-500 shrink-0 mt-0.5" />
                      Remove filler words like "very", "really", "basically" for tighter writing.
                    </li>
                  )}
                  {longSents.length > 0 && (
                    <li className="flex items-start gap-2">
                      <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                      Break {longSents.length} long sentences (30+ words) into shorter ones.
                    </li>
                  )}
                  {flesch < 50 && (
                    <li className="flex items-start gap-2">
                      <AlertCircle size={13} className="text-yellow-500 shrink-0 mt-0.5" />
                      Simplify vocabulary — use shorter, common words for better readability.
                    </li>
                  )}
                  {score >= 75 && (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-green-500 shrink-0 mt-0.5" />
                      Great writing! Your content is clear and engaging.
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Right: Text viewer with highlight */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                {/* Highlight controls */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Eye size={12} /> Highlight:
                  </span>
                  {HIGHLIGHT_MODES.map(({ mode, label, color }) => (
                    <button
                      key={mode}
                      onClick={() => setHighlightMode(mode)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border
                        ${highlightMode === mode
                          ? `${color} border-current`
                          : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                {highlightMode !== 'none' && (
                  <div className={`text-xs px-3 py-2 rounded mb-3 flex items-center gap-1.5
                    ${highlightMode === 'passive' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300' :
                      highlightMode === 'filler' ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300' :
                      'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    <Info size={12} />
                    {highlightMode === 'passive' && 'Highlighted sentences may contain passive voice constructions.'}
                    {highlightMode === 'filler' && 'Highlighted sentences contain filler words that weaken your writing.'}
                    {highlightMode === 'long' && 'Highlighted sentences are 30+ words — consider splitting them.'}
                  </div>
                )}

                {/* Text */}
                <div className="text-sm leading-7 text-gray-800 dark:text-gray-200 max-h-[60vh] overflow-y-auto whitespace-pre-wrap">
                  {highlightText(text, highlightMode)}
                </div>
              </div>

              {/* CTA strip */}
              <div className="flex gap-3">
                <a
                  href="/tools/writer/writer-headline"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                >
                  Score your headline <ChevronRight size={14} />
                </a>
                <a
                  href="/tools/writer/writer-export"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Export document <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

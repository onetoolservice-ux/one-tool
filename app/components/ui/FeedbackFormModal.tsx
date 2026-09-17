'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  X, Send, Check, Paperclip, Loader2, Search, ArrowLeft, ArrowRight, MessageCircleQuestion,
} from 'lucide-react';
import { createClient } from '@/app/lib/supabase/client';
import { useAuth } from '@/app/contexts/auth-context';
import { ALL_TOOLS } from '@/app/lib/tools-data';
import { categoryToSpaceHref } from '@/app/lib/space-config';
import { trackEvent } from '@/app/lib/telemetry';
import { getPageHelp, searchHelp, type HelpAnswer } from '@/app/lib/help-assistant';

const CATEGORIES = [
  { value: 'bug', label: 'Something is broken' },
  { value: 'suggestion', label: 'Suggestion / idea' },
  { value: 'question', label: 'Question' },
  { value: 'other', label: 'Other' },
] as const;

const GENERAL_PAGES = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Something else / not listed', href: 'other' },
];

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5MB

interface FeedbackFormModalProps {
  onClose: () => void;
}

// ── An instant, rule-based answer card (no AI call, answers from existing tool data) ──
function HelpAnswerCard({ answer, onCtaClick }: { answer: HelpAnswer; onCtaClick: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3">
      <p className="text-xs font-semibold text-gray-800 dark:text-white">{answer.title}</p>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{answer.description}</p>

      {answer.steps && answer.steps.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-1.5"
          >
            {expanded ? 'Hide steps' : `Show ${answer.steps.length} steps`}
          </button>
          {expanded && (
            <ol className="mt-2 space-y-1.5">
              {answer.steps.map((s, i) => (
                <li key={s.title} className="text-[11px] text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">{i + 1}. {s.title}</span> — {s.description}
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {answer.ctaHref && (
        <Link
          href={answer.ctaHref}
          onClick={onCtaClick}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-2"
        >
          {answer.ctaLabel ?? 'Open'} <ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}

export function FeedbackFormModal({ onClose }: FeedbackFormModalProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageOptions = useMemo(() => {
    const toolPages = ALL_TOOLS.map(t => ({
      label: `${t.category} — ${t.name}`,
      href: `${categoryToSpaceHref(t.category)}/${t.id}`,
    }));
    return [...GENERAL_PAGES, ...toolPages];
  }, []);

  const currentPageMatch = pageOptions.find(p => p.href === pathname);

  const [step, setStep] = useState<'help' | 'form'>('help');
  const [pageHref, setPageHref] = useState(currentPageMatch?.href ?? 'other');
  const [category, setCategory] = useState<string>('bug');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => { trackEvent('help_opened', { page: pathname }); }, [pathname]);

  const currentPageHelp = useMemo(() => getPageHelp(pathname), [pathname]);
  const searchResults = useMemo(() => searchHelp(query), [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const goToForm = () => {
    trackEvent('help_escalated', { page: pathname, hadQuery: query.trim().length > 0 });
    if (query.trim() && !description) setDescription(query.trim());
    setStep('form');
  };

  const handleAnswerClick = (answer: HelpAnswer) => {
    trackEvent('help_self_served', { page: pathname, answerId: answer.id });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setAttachment(null); setAttachmentError(''); return; }
    if (!file.type.startsWith('image/')) {
      setAttachmentError('Only image files are supported.');
      setAttachment(null);
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachmentError('Image must be under 5MB.');
      setAttachment(null);
      return;
    }
    setAttachmentError('');
    setAttachment(file);
  };

  const handleSubmit = async () => {
    if (!description.trim() || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const supabase = createClient();
      const pageOption = pageOptions.find(p => p.href === pageHref);
      const pageLabel = pageOption ? pageOption.label : pathname;
      const resolvedPagePath = pageHref === 'other' ? pathname : pageHref;

      let attachmentPath: string | null = null;
      if (attachment) {
        const ext = attachment.name.split('.').pop() ?? 'png';
        const filePath = `${user?.id ?? 'guest'}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('feedback-attachments')
          .upload(filePath, attachment);
        if (uploadError) throw uploadError;
        attachmentPath = filePath;
      }

      const { error: insertError } = await supabase.from('feedback_submissions').insert({
        user_id: user?.id ?? null,
        user_email: user?.email ?? null,
        page_path: resolvedPagePath,
        page_label: pageLabel,
        category,
        description: description.trim(),
        attachment_url: attachmentPath,
      });
      if (insertError) throw insertError;

      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch {
      setError('Could not send feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        ref={panelRef}
        className="relative w-full max-w-md bg-white dark:bg-[#1C1F2E] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">Thank you!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We&apos;ve received your message.</p>
          </div>
        ) : step === 'help' ? (
          <>
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <div className="flex items-center gap-1.5">
                <MessageCircleQuestion size={15} className="text-indigo-500" />
                <p className="text-sm font-semibold text-gray-800 dark:text-white">Need help?</p>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="Close">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="px-5 py-3 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask a question — e.g. &ldquo;is my data safe&rdquo;"
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 pl-8 pr-3 py-2.5 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Search results take over when the user is typing */}
              {query.trim().length >= 3 ? (
                <div className="space-y-2">
                  {searchResults.length > 0 ? (
                    searchResults.map(answer => (
                      <HelpAnswerCard key={answer.id} answer={answer} onCtaClick={() => handleAnswerClick(answer)} />
                    ))
                  ) : (
                    <p className="text-[11px] text-gray-400 py-2">No instant answer for that — write to us below and we&apos;ll get back to you.</p>
                  )}
                </div>
              ) : (
                currentPageHelp && (
                  <div>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">About this page</p>
                    <HelpAnswerCard answer={currentPageHelp} onCtaClick={() => handleAnswerClick(currentPageHelp)} />
                  </div>
                )
              )}
            </div>

            <div className="px-5 pb-5 pt-1 border-t border-gray-100 dark:border-white/5 mt-1">
              <button
                onClick={goToForm}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 mt-2"
              >
                Still need help? Write to us <ArrowRight size={13} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 pt-5 pb-2">
              <button onClick={() => setStep('help')} className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <ArrowLeft size={13} /> Back
              </button>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">Write to us</p>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" aria-label="Close">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="px-5 py-3 space-y-3">
              {/* Page / app select */}
              <div>
                <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Which page or tool?</label>
                <select
                  value={pageHref}
                  onChange={e => setPageHref(e.target.value)}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  {pageOptions.map(p => (
                    <option key={p.href} value={p.href}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Category select */}
              <div>
                <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">What&apos;s this about?</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`text-[11px] font-medium px-2.5 py-2 rounded-lg border transition-colors text-left ${
                        category === c.value
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                          : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1 block">Tell us more</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="What happened, or what would you like to see?"
                  rows={4}
                  maxLength={2000}
                  className="w-full text-xs rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-gray-700 dark:text-gray-200 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              {/* Attachment */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <Paperclip size={13} />
                  {attachment ? attachment.name : 'Attach a screenshot (optional)'}
                </button>
                {attachmentError && <p className="text-[10px] text-red-500 mt-1">{attachmentError}</p>}
              </div>

              {error && <p className="text-[11px] text-red-500">{error}</p>}
            </div>

            <div className="px-5 pb-5 pt-1">
              <button
                onClick={handleSubmit}
                disabled={!description.trim() || submitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {submitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

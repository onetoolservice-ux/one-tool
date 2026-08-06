'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PenLine, Plus, Trash2, CheckCircle2, Clock, Target,
  ChevronRight, BarChart3, Download, Save, FileText,
  MoreVertical, Tag, X
} from 'lucide-react';
import WriterNav from './shared/WriterNav';
import {
  loadWriterStore, saveWriterStore, onWriterStoreUpdate,
  createDocument, updateDocument, deleteDocument, setActiveDoc,
  getActiveDocument, getWordCount, getCharCount, getReadingTime,
  WriterDocument, WriterStore, DocStatus
} from './writer-store';

const STATUS_OPTIONS: { value: DocStatus; label: string; color: string }[] = [
  { value: 'idea', label: 'Idea', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' },
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  { value: 'complete', label: 'Complete', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
];

export default function WriterStudio() {
  const [store, setStore] = useState<WriterStore | null>(null);
  const [activeDoc, setActiveDocState] = useState<WriterDocument | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [showDocMenu, setShowDocMenu] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(() => {
    const s = loadWriterStore();
    setStore(s);
    const doc = getActiveDocument(s);
    if (doc) {
      setActiveDocState(doc);
      setContent(doc.content);
      setTitle(doc.title);
    }
  }, []);

  useEffect(() => {
    reload();
    return onWriterStoreUpdate(reload);
  }, [reload]);

  // Auto-save after 1.5s of inactivity
  const scheduleAutoSave = useCallback((newContent: string, newTitle: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (activeDoc) {
        updateDocument(activeDoc.id, { content: newContent, title: newTitle });
        setIsSaving(false);
        setLastSaved(Date.now());
      }
    }, 1500);
    setIsSaving(true);
  }, [activeDoc]);

  const handleContentChange = (val: string) => {
    setContent(val);
    scheduleAutoSave(val, title);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    scheduleAutoSave(content, val);
  };

  const handleNewDoc = () => {
    createDocument({ title: 'Untitled', content: '' });
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm('Delete this document?')) {
      deleteDocument(id);
    }
    setShowDocMenu(null);
  };

  const handleStatusChange = (status: DocStatus) => {
    if (!activeDoc) return;
    updateDocument(activeDoc.id, { status });
  };

  const handleGoalChange = (val: string) => {
    if (!activeDoc) return;
    const n = parseInt(val);
    if (!isNaN(n) && n > 0) updateDocument(activeDoc.id, { wordCountGoal: n });
  };

  const addTag = () => {
    if (!activeDoc || !newTagInput.trim()) return;
    const tag = newTagInput.trim().toLowerCase();
    if (!activeDoc.tags.includes(tag)) {
      updateDocument(activeDoc.id, { tags: [...activeDoc.tags, tag] });
    }
    setNewTagInput('');
  };

  const removeTag = (tag: string) => {
    if (!activeDoc) return;
    updateDocument(activeDoc.id, { tags: activeDoc.tags.filter((t) => t !== tag) });
  };

  const wordCount = getWordCount(content);
  const charCount = getCharCount(content);
  const readingTime = getReadingTime(content);
  const goalProgress = activeDoc ? Math.min(100, Math.round((wordCount / activeDoc.wordCountGoal) * 100)) : 0;
  const docs = store?.documents ?? [];

  const statusConfig = STATUS_OPTIONS.find((s) => s.value === activeDoc?.status) ?? STATUS_OPTIONS[1];

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950">
      <WriterNav />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar: Document List ── */}
        <aside className="w-64 shrink-0 bg-amber-50 dark:bg-amber-950/20 border-r border-amber-200 dark:border-amber-800 flex flex-col">
          <div className="p-3 flex items-center justify-between border-b border-amber-200 dark:border-amber-800">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
              Documents ({docs.length})
            </span>
            <button
              onClick={handleNewDoc}
              className="p-1 rounded hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-600 dark:text-amber-400 transition-colors"
              title="New document"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {docs.length === 0 && (
              <div className="p-4 text-center">
                <FileText size={32} className="mx-auto text-amber-300 dark:text-amber-700 mb-2" />
                <p className="text-xs text-amber-600 dark:text-amber-400">No documents yet</p>
                <button
                  onClick={handleNewDoc}
                  className="mt-2 text-xs text-amber-700 dark:text-amber-300 font-medium hover:underline"
                >
                  + Create your first doc
                </button>
              </div>
            )}
            {docs.map((doc) => {
              const isActive = doc.id === activeDoc?.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc.id)}
                  className={`relative group px-3 py-2.5 cursor-pointer border-b border-amber-100 dark:border-amber-900 transition-colors
                    ${isActive
                      ? 'bg-amber-100 dark:bg-amber-900/50 border-l-2 border-l-amber-500'
                      : 'hover:bg-amber-50 dark:hover:bg-amber-950/40'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-amber-800 dark:text-amber-200' : 'text-gray-700 dark:text-gray-300'}`}>
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {getWordCount(doc.content).toLocaleString()} words
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDocMenu(showDocMenu === doc.id ? null : doc.id); }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                    >
                      <MoreVertical size={13} />
                    </button>
                  </div>

                  {showDocMenu === doc.id && (
                    <div className="absolute right-2 top-8 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }}
                        className="flex items-center gap-1.5 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 w-full"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main Editor ── */}
        {activeDoc ? (
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Editor toolbar */}
            <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 flex-wrap">
              {/* Status */}
              <div className="relative">
                <select
                  value={activeDoc.status}
                  onChange={(e) => handleStatusChange(e.target.value as DocStatus)}
                  className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer appearance-none pr-6 ${statusConfig.color}`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Word goal */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Target size={13} />
                <span>Goal:</span>
                <input
                  type="number"
                  value={activeDoc.wordCountGoal}
                  onChange={(e) => handleGoalChange(e.target.value)}
                  className="w-16 px-1 py-0.5 border border-gray-200 dark:border-gray-700 rounded text-xs bg-transparent text-gray-700 dark:text-gray-300"
                />
                <span>words</span>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1 flex-wrap">
                {activeDoc.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded text-xs">
                    {tag}
                    <button onClick={() => removeTag(tag)}><X size={10} /></button>
                  </span>
                ))}
                <input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="+ tag"
                  className="text-xs px-1.5 py-0.5 border border-dashed border-amber-300 dark:border-amber-700 rounded bg-transparent text-amber-700 dark:text-amber-300 placeholder:text-amber-400 w-16 focus:outline-none focus:w-24 transition-all"
                />
              </div>

              <div className="ml-auto flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                {isSaving ? (
                  <span className="flex items-center gap-1"><Save size={11} className="animate-pulse" /> Saving…</span>
                ) : lastSaved ? (
                  <span className="flex items-center gap-1 text-green-500"><CheckCircle2 size={11} /> Saved</span>
                ) : null}
              </div>
            </div>

            {/* Title */}
            <div className="px-8 pt-6 pb-2">
              <input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Document title…"
                className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-300 dark:placeholder:text-gray-700"
              />
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing… your ideas will be saved automatically."
                className="w-full h-full min-h-[60vh] bg-transparent border-none outline-none resize-none text-base leading-relaxed text-gray-800 dark:text-gray-200 placeholder:text-gray-300 dark:placeholder:text-gray-600"
              />
            </div>

            {/* Stats bar */}
            <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-2 flex items-center gap-6 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-950">
              <span className="flex items-center gap-1"><FileText size={11} /> {wordCount.toLocaleString()} words</span>
              <span>{charCount.toLocaleString()} chars</span>
              <span className="flex items-center gap-1"><Clock size={11} /> {readingTime} min read</span>

              {/* Goal progress bar */}
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      goalProgress >= 100 ? 'bg-green-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${goalProgress}%` }}
                  />
                </div>
                <span className={goalProgress >= 100 ? 'text-green-500 font-medium' : ''}>
                  {goalProgress}% of {activeDoc.wordCountGoal.toLocaleString()} goal
                </span>
              </div>

              {/* CTA to Analyzer */}
              <a
                href="/tools/writer/writer-analyzer"
                className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <BarChart3 size={12} /> Analyze writing <ChevronRight size={11} />
              </a>
            </div>
          </main>
        ) : (
          <main className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <PenLine size={48} className="text-amber-300 dark:text-amber-700" />
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Writer's Studio</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Your distraction-free writing workspace. Create a document to get started.
            </p>
            <button
              onClick={handleNewDoc}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <Plus size={16} /> New Document
            </button>
          </main>
        )}
      </div>
    </div>
  );
}

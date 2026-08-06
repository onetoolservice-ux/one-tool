"use client";
import React, { useState, useRef, useMemo } from 'react';
import { Eye, Code, Download, Upload, Copy, Check, Columns, FileText, Hash, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { showToast } from '@/app/shared/Toast';

type ViewMode = 'editor' | 'split' | 'preview';

const DEFAULT_MD = `# Welcome to Markdown Studio

Start writing your document here. This editor supports **full Markdown** syntax.

## Features
- Live preview with split view
- Import .md or .txt files
- Export as Markdown or HTML
- Word count & reading time

## Quick Reference
| Syntax | Result |
|--------|--------|
| \`**bold**\` | **bold** |
| \`*italic*\` | *italic* |
| \`# Heading\` | Heading |
| \`[link](url)\` | link |

> Tip: Use the toolbar above to switch between Editor, Split, and Preview modes.
`;

export const MarkdownStudio = () => {
  const [text, setText] = useState(DEFAULT_MD);
  const [view, setView] = useState<ViewMode>('split');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text.split('\n').length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    return { words, chars, lines, readTime };
  }, [text]);

  const importFile = (f: File) => {
    if (!f.name.match(/\.(md|txt|markdown)$/i)) {
      showToast('Please upload a .md or .txt file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setText(e.target?.result as string || '');
      showToast(`Imported ${f.name}`, 'success');
    };
    reader.readAsText(f);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) importFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) importFile(f);
  };

  const downloadMd = () => {
    const blob = new Blob([text], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'document.md';
    a.click();
    showToast('Saved as .md', 'success');
  };

  const downloadHtml = () => {
    const body = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Document</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:800px;margin:40px auto;padding:0 20px;line-height:1.7;color:#1e293b}
  h1,h2,h3{margin-top:1.5em;line-height:1.3}
  code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace}
  blockquote{border-left:4px solid #cbd5e1;margin:0;padding-left:1em;color:#64748b}
  li{margin:4px 0}
</style>
</head>
<body><p>${body}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'document.html';
    a.click();
    showToast('Saved as .html', 'success');
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard', 'success');
  };

  const showEditor = view === 'editor' || view === 'split';
  const showPreview = view === 'preview' || view === 'split';

  return (
    <div
      className={`flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden ${isDragging ? 'ring-2 ring-inset ring-blue-500' : ''}`}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      {/* ── TOOLBAR ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FileText size={16} className="text-blue-600"/>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Markdown Studio</h2>
            <p className="text-[10px] text-slate-400">Live markdown editor with preview</p>
          </div>
        </div>

        {/* View mode switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
          {(['editor', 'split', 'preview'] as ViewMode[]).map(m => (
            <button
              key={m}
              onClick={() => setView(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all flex items-center gap-1.5 ${
                view === m
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {m === 'editor' ? <Code size={11}/> : m === 'split' ? <Columns size={11}/> : <Eye size={11}/>}
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1"/>

        <input ref={fileRef} type="file" accept=".md,.txt,.markdown" className="hidden" onChange={handleFileInput}/>
        <button
          onClick={() => fileRef.current?.click()}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors font-semibold flex items-center gap-1.5"
        >
          <Upload size={12}/> Import
        </button>
        <button
          onClick={copyText}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors font-semibold flex items-center gap-1.5"
        >
          {copied ? <Check size={12} className="text-green-500"/> : <Copy size={12}/>}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={downloadMd}
          className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors font-semibold flex items-center gap-1.5"
        >
          <Download size={12}/> .md
        </button>
        <button
          onClick={downloadHtml}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
        >
          <Download size={12}/> Export HTML
        </button>
      </div>

      {/* ── PANELS ──────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        {showEditor && (
          <div className={`flex flex-col ${view === 'split' ? 'w-1/2 border-r border-slate-200 dark:border-slate-800' : 'flex-1'}`}>
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Code size={12} className="text-slate-400"/>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Editor</span>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              spellCheck={false}
              className="flex-1 p-5 bg-slate-50 dark:bg-slate-950 resize-none font-mono text-sm leading-relaxed outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
              placeholder="Start writing markdown..."
            />
          </div>
        )}

        {/* Preview pane */}
        {showPreview && (
          <div className={`flex flex-col ${view === 'split' ? 'w-1/2' : 'flex-1'} bg-white dark:bg-slate-900`}>
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Eye size={12} className="text-slate-400"/>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Preview</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 prose dark:prose-invert prose-sm max-w-none prose-headings:font-bold prose-a:text-blue-600">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* ── STATUS BAR ──────────────────────────────────────────────────── */}
      <div className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-1.5 flex items-center gap-5 flex-shrink-0">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <Hash size={11}/> {stats.words.toLocaleString()} words
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{stats.chars.toLocaleString()} chars</span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">{stats.lines} lines</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Clock size={11}/> ~{stats.readTime} min read
        </span>
        <div className="flex-1"/>
        <span className="text-[11px] text-slate-400">Drag & drop .md or .txt to import</span>
      </div>
    </div>
  );
};

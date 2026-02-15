"use client";
import React, { useState } from 'react';
import {
  FileText, Upload, RefreshCw, Download, Copy, Check,
  Languages, AlignLeft, Hash, Clock, X
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { showToast } from '@/app/shared/Toast';
import { MAX_IMAGE_FILE_SIZE } from '@/app/lib/constants';

const LANGUAGES = [
  { value: 'eng', label: 'English' },
  { value: 'hin', label: 'Hindi' },
  { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' },
  { value: 'spa', label: 'Spanish' },
  { value: 'por', label: 'Portuguese' },
  { value: 'chi_sim', label: 'Chinese (Simplified)' },
  { value: 'jpn', label: 'Japanese' },
  { value: 'ara', label: 'Arabic' },
  { value: 'rus', label: 'Russian' },
];

export const SmartOCR = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState('eng');

  // Stats
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const lineCount = text.trim() ? text.trim().split('\n').length : 0;
  const readTime = Math.ceil(wordCount / 200); // avg 200 wpm

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!allowed.includes(f.type)) { showToast('Unsupported format. Use JPG, PNG, WEBP, BMP.', 'error'); return; }
    if (f.size > MAX_IMAGE_FILE_SIZE) { showToast('Image exceeds 10MB limit', 'error'); return; }
    setImage(URL.createObjectURL(f));
    setFileName(f.name);
    setText(''); setProgress(0); setProgressMsg('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      const fakeEvt = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleUpload(fakeEvt);
    }
  };

  const runOCR = async () => {
    if (!image) return;
    setLoading(true); setText(''); setProgress(0); setProgressMsg('Initializing...');
    try {
      const worker = await createWorker(language, 1, {
        logger: (m: { status: string; progress: number }) => {
          setProgressMsg(m.status);
          setProgress(Math.round((m.progress || 0) * 100));
        },
      });
      const ret = await worker.recognize(image);
      setText(ret.data.text);
      await worker.terminate();
      showToast('Text extracted successfully', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not extract text';
      showToast(msg, 'error');
      setText('');
    } finally { setLoading(false); setProgress(0); setProgressMsg(''); }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard', 'success');
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.[^.]+$/, '') + '_extracted.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded as .txt', 'success');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <FileText size={18} className="text-violet-600"/>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Smart OCR</h2>
            <p className="text-[11px] text-slate-400">Extract text from images • powered by Tesseract.js</p>
          </div>
        </div>

        <div className="flex-1"/>

        {/* Language selector */}
        <div className="flex items-center gap-1.5">
          <Languages size={13} className="text-slate-400 flex-shrink-0"/>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            disabled={loading}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-200 disabled:opacity-50"
          >
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Upload button */}
        <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700">
          <Upload size={13}/> {image ? 'Change Image' : 'Upload Image'}
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload}/>
        </label>

        {/* Extract button */}
        {image && (
          <button
            onClick={runOCR}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <><RefreshCw size={13} className="animate-spin"/> {progressMsg || 'Scanning...'} {progress > 0 ? `${progress}%` : ''}</>
            ) : (
              <><RefreshCw size={13}/> Extract Text</>
            )}
          </button>
        )}
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 flex-shrink-0">
          <div className="h-full bg-violet-500 transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}/>
        </div>
      )}

      {/* ── WORKSPACE ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Image */}
        <div className="flex-1 lg:max-w-[50%] flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Source Image</span>
            {image && (
              <button
                onClick={() => { setImage(null); setFileName(''); setText(''); }}
                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                title="Clear image"
              >
                <X size={14}/>
              </button>
            )}
          </div>
          <div
            className="flex-1 flex items-center justify-center p-6 overflow-auto"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
          >
            {image ? (
              <img src={image} alt="Uploaded for OCR" className="max-w-full max-h-full object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-700"/>
            ) : (
              <label
                className="cursor-pointer flex flex-col items-center gap-4 text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 w-full h-full justify-center hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all"
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
              >
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload}/>
                <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <Upload size={40} className="opacity-40"/>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Upload an image</p>
                  <p className="text-sm mt-1">JPG, PNG, WEBP, BMP, GIF</p>
                  <p className="text-xs text-slate-400 mt-1">Max 10MB • Drag & drop supported</p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* RIGHT: Text output */}
        <div className="flex-1 lg:max-w-[50%] flex flex-col overflow-hidden bg-white dark:bg-slate-900">
          {/* Output header */}
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex-1">Extracted Text</span>
            {text && (
              <>
                <button onClick={copy} title="Copy to clipboard"
                  className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors">
                  {copied ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                </button>
                <button onClick={downloadTxt} title="Download as .txt"
                  className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors">
                  <Download size={14}/>
                </button>
              </>
            )}
          </div>

          {/* Stats bar */}
          {text && (
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Hash size={11}/> <span>{wordCount} words</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <AlignLeft size={11}/> <span>{lineCount} lines</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <FileText size={11}/> <span>{charCount} chars</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock size={11}/> <span>{readTime} min read</span>
              </div>
            </div>
          )}

          {/* Text content */}
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-400">
                <div className="relative">
                  <RefreshCw size={40} className="animate-spin text-violet-400"/>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 capitalize">{progressMsg || 'Processing...'}</p>
                  {progress > 0 && (
                    <div className="mt-3 w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-500 transition-all duration-200 rounded-full" style={{ width: `${progress}%` }}/>
                    </div>
                  )}
                  <p className="text-xs mt-2 text-slate-400">This may take a moment for large images</p>
                </div>
              </div>
            ) : text ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{text}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <AlignLeft size={32} className="opacity-30"/>
                </div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {image ? 'Click "Extract Text" to start OCR' : 'Upload an image to begin'}
                </p>
                <p className="text-xs text-center max-w-[200px]">
                  Works best on clear, high-resolution images with readable text
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

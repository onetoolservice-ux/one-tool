"use client";
import React, { useState, useCallback } from 'react';
import {
  Scissors, Upload, Download, FileText, CheckCircle,
  Loader2, RotateCcw, CheckSquare, Square, Hash
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { MAX_PDF_FILE_SIZE } from '@/app/lib/constants';

// ── Range parser: "1-5, 8, 11-15" → [1,2,3,4,5,8,11,12,13,14,15] ─────────
function parseRange(input: string, maxPage: number): number[] {
  const result = new Set<number>();
  input.split(',').forEach(part => {
    const p = part.trim();
    if (!p) return;
    const dash = p.indexOf('-');
    if (dash > 0) {
      const from = parseInt(p.slice(0, dash));
      const to = parseInt(p.slice(dash + 1));
      if (!isNaN(from) && !isNaN(to)) {
        for (let i = Math.max(1, from); i <= Math.min(maxPage, to); i++) result.add(i);
      }
    } else {
      const n = parseInt(p);
      if (!isNaN(n) && n >= 1 && n <= maxPage) result.add(n);
    }
  });
  return Array.from(result).sort((a, b) => a - b);
}

export const PdfSplitter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [rangeInput, setRangeInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const loadFile = useCallback(async (f: File) => {
    if (f.type !== 'application/pdf') { showToast('Please upload a PDF file', 'error'); return; }
    if (f.size > MAX_PDF_FILE_SIZE) { showToast('File exceeds 50MB limit', 'error'); return; }
    setFile(f); setSelected([]); setRangeInput('');
    try {
      const bytes = await f.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      setPages(pdf.getPageCount());
    } catch (error) {
      showToast(getErrorMessage(error) || 'Failed to read PDF', 'error');
      setFile(null);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  const togglePage = (i: number) => {
    setSelected(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i].sort((a, b) => a - b)
    );
  };

  const selectAll = () => setSelected(Array.from({ length: pages }, (_, i) => i + 1));
  const selectNone = () => setSelected([]);
  const invertSelection = () => {
    const all = Array.from({ length: pages }, (_, i) => i + 1);
    setSelected(all.filter(p => !selected.includes(p)));
  };

  const applyRange = () => {
    const parsed = parseRange(rangeInput, pages);
    if (parsed.length === 0) { showToast('No valid pages in range', 'error'); return; }
    setSelected(parsed);
    showToast(`Selected ${parsed.length} pages`, 'success');
  };

  const downloadSplit = async () => {
    if (!file || selected.length === 0) { showToast('Select at least one page', 'error'); return; }
    setProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const source = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();
      const pages0 = selected.map(n => n - 1).sort((a, b) => a - b);
      for (const pi of pages0) {
        if (pi >= 0 && pi < source.getPageCount()) {
          const [p] = await newPdf.copyPages(source, [pi]);
          newPdf.addPage(p);
        }
      }
      const bytes = await newPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `extracted_${selected.length}pages_${file.name}`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Extracted ${selected.length} page(s) successfully`, 'success');
    } catch (error) {
      showToast(getErrorMessage(error) || 'Failed to split PDF', 'error');
    } finally { setProcessing(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <Scissors size={18} className="text-teal-600"/>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">PDF Page Extractor</h2>
            <p className="text-[11px] text-slate-400">Select pages to extract as a new PDF • 50MB max</p>
          </div>
        </div>

        {file && pages > 0 && (
          <>
            <div className="flex items-center gap-2 ml-1">
              <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-full font-semibold">
                {pages} pages
              </span>
              {selected.length > 0 && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-semibold">
                  {selected.length} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button onClick={selectAll} title="Select all pages"
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-semibold flex items-center gap-1">
                <CheckSquare size={12}/> All
              </button>
              <button onClick={selectNone} title="Deselect all"
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors font-semibold flex items-center gap-1">
                <Square size={12}/> None
              </button>
              <button onClick={invertSelection} title="Invert selection"
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors font-semibold flex items-center gap-1">
                <RotateCcw size={12}/> Invert
              </button>
            </div>

            {/* Range input */}
            <div className="flex items-center gap-1.5">
              <Hash size={13} className="text-slate-400 flex-shrink-0"/>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <input
                  value={rangeInput}
                  onChange={e => setRangeInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && applyRange()}
                  placeholder="e.g. 1-5, 8, 12-15"
                  className="px-2.5 py-1.5 text-xs bg-transparent outline-none w-44 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                />
                <button
                  onClick={applyRange}
                  className="px-2.5 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        )}

        <div className="flex-1" />

        {file && (
          <button
            onClick={() => { setFile(null); setPages(0); setSelected([]); setRangeInput(''); }}
            className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-semibold"
          >
            Change File
          </button>
        )}

        <button
          onClick={downloadSplit}
          disabled={selected.length === 0 || processing}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <><Loader2 size={14} className="animate-spin"/> Processing...</>
          ) : (
            <><Download size={14}/> Extract {selected.length > 0 ? `${selected.length} ` : ''}Pages</>
          )}
        </button>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {!file ? (
          <div
            className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all cursor-pointer
              ${isDragging
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/10'
              } text-slate-400`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('pdf-split-input')?.click()}
          >
            <input id="pdf-split-input" type="file" accept=".pdf" className="hidden" onChange={handleInput}/>
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-5">
              <Upload size={48} className="opacity-40"/>
            </div>
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Upload a PDF file</h3>
            <p className="text-sm">Drag & drop or click to browse</p>
            <p className="text-xs mt-2 text-slate-400">Select specific pages to extract as a new PDF</p>
          </div>
        ) : (
          <div>
            {/* File info */}
            <div className="flex items-center gap-3 mb-5 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <div className="w-10 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-teal-100 dark:border-teal-800/30">
                <FileText size={20} className="text-teal-500"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pages} pages • {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {selected.length === 0 ? 'Click pages to select' : `${selected.length} of ${pages} pages selected`}
              </p>
            </div>

            {/* Page grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
              {Array.from({ length: pages }).map((_, i) => {
                const pageNum = i + 1;
                const isSelected = selected.includes(pageNum);
                return (
                  <button
                    key={i}
                    onClick={() => togglePage(pageNum)}
                    className={`aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center transition-all relative
                      ${isSelected
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-900/10'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5">
                        <CheckCircle size={14} className="text-teal-500"/>
                      </div>
                    )}
                    <FileText size={18} className={`mb-1 ${isSelected ? 'text-teal-600' : 'text-slate-300 dark:text-slate-600'}`}/>
                    <p className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'}`}>
                      {pageNum}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selection summary */}
            {selected.length > 0 && (
              <div className="mt-5 flex items-center justify-between px-4 py-3 bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800 rounded-xl">
                <p className="text-xs text-teal-700 dark:text-teal-300 font-medium">
                  Selected: <strong>{selected.join(', ')}</strong>
                </p>
                <button onClick={selectNone} className="text-xs text-teal-600 hover:text-teal-800 font-semibold">
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

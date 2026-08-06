"use client";
import React, { useState, useRef } from 'react';
import {
  Layers, Plus, X, FileText, Download, Trash2, ChevronUp,
  ChevronDown, MoveVertical, AlertCircle, CheckCircle2
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { logger } from '@/app/lib/utils/logger';
import { MAX_PDF_FILE_SIZE } from '@/app/lib/constants';

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export const PdfWorkbench = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setMerging] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(0);
  const [outputName, setOutputName] = useState('merged');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | File[]) => {
    const newFiles: File[] = [];
    Array.from(fileList).forEach(file => {
      if (file.type !== 'application/pdf') { showToast(`${file.name} is not a PDF`, 'error'); return; }
      if (file.size > MAX_PDF_FILE_SIZE) { showToast(`${file.name} exceeds 50MB`, 'error'); return; }
      newFiles.push(file);
    });
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      showToast(`Added ${newFiles.length} PDF${newFiles.length > 1 ? 's' : ''}`, 'success');
    }
  };

  const moveFile = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= files.length) return;
    const next = [...files];
    [next[i], next[j]] = [next[j], next[i]];
    setFiles(next);
  };

  const handleMerge = async () => {
    if (files.length < 2) { showToast('Add at least 2 PDF files', 'error'); return; }
    setMerging(true); setMergeProgress(0);
    try {
      const mergedPdf = await PDFDocument.create();
      let successCount = 0;
      const failedFiles: string[] = [];
      for (let idx = 0; idx < files.length; idx++) {
        try {
          const pdfBytes = await files[idx].arrayBuffer();
          const pdf = await PDFDocument.load(pdfBytes);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
          successCount++;
          setMergeProgress(Math.round(((idx + 1) / files.length) * 100));
        } catch (error) {
          failedFiles.push(files[idx].name);
          logger.warn(`Failed: ${files[idx].name}`, error);
        }
      }
      if (successCount === 0) { showToast('Failed to process any PDFs', 'error'); return; }
      if (failedFiles.length > 0) showToast(`${successCount} merged. ${failedFiles.length} skipped.`, 'warning');
      const bytes = await mergedPdf.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${outputName.trim() || 'merged'}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (failedFiles.length === 0) showToast(`Merged ${successCount} PDFs successfully!`, 'success');
    } catch (error) {
      showToast(getErrorMessage(error) || 'Failed to merge PDFs', 'error');
    } finally { setMerging(false); setMergeProgress(0); }
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ──────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
            <Layers size={18} className="text-rose-600"/>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">PDF Merge Workbench</h2>
            <p className="text-[11px] text-slate-400">Combine PDFs in order • max 50MB per file</p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="flex items-center gap-2 ml-1">
            <span className="text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2.5 py-1 rounded-full font-semibold">
              {files.length} file{files.length > 1 ? 's' : ''}
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full">
              {fmtSize(totalSize)}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {files.length >= 2 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Output:</span>
            <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <input
                value={outputName}
                onChange={e => setOutputName(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-transparent outline-none w-32 text-slate-700 dark:text-slate-200"
                placeholder="merged"
              />
              <span className="text-slate-400 pr-2.5 text-xs">.pdf</span>
            </div>
          </div>
        )}

        <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700">
          <Plus size={14}/> Add PDFs
          <input ref={inputRef} type="file" multiple accept=".pdf" className="hidden"
            onChange={e => e.target.files && addFiles(e.target.files)}/>
        </label>

        {files.length > 0 && (
          <button
            onClick={() => setFiles([])}
            className="px-3 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors font-semibold flex items-center gap-1"
          >
            <Trash2 size={13}/> Clear All
          </button>
        )}

        <button
          onClick={handleMerge}
          disabled={files.length < 2 || isMerging}
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isMerging ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              Merging {mergeProgress}%
            </>
          ) : (
            <><Download size={14}/> Merge &amp; Download</>
          )}
        </button>
      </div>

      {/* Progress bar */}
      {isMerging && (
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 flex-shrink-0">
          <div className="h-full bg-rose-500 transition-all duration-300 ease-out"
            style={{ width: `${mergeProgress}%` }}/>
        </div>
      )}

      {/* ── WORKSPACE ────────────────────────────────────────────────────────── */}
      <div
        className={`flex-1 overflow-y-auto p-6 transition-colors ${isDragging ? 'bg-rose-50/50 dark:bg-rose-900/5' : ''}`}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault(); setIsDragging(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
      >
        {files.length === 0 ? (
          /* ── Empty ── */
          <div
            className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl text-slate-400 cursor-pointer hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-all"
            onClick={() => inputRef.current?.click()}
          >
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-5">
              <Layers size={48} className="opacity-40"/>
            </div>
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Drag &amp; drop PDF files here</h3>
            <p className="text-sm mb-1">or click to browse</p>
            <p className="text-xs text-slate-400 mt-2">Add 2+ PDFs to merge them in order • 50MB max per file</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Tip banner */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl mb-4">
              <MoveVertical size={14} className="text-amber-600 flex-shrink-0"/>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                Use ▲▼ arrows to reorder files • PDFs will be merged in the order shown
              </p>
            </div>

            {/* File list */}
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-black flex-shrink-0">
                  {i + 1}
                </div>
                <div className="w-10 h-12 bg-rose-50 dark:bg-rose-900/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-rose-100 dark:border-rose-800/30">
                  <FileText size={20} className="text-rose-400"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{f.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{fmtSize(f.size)}</p>
                </div>
                {/* Reorder */}
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => moveFile(i, -1)}
                    disabled={i === 0}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ChevronUp size={14}/>
                  </button>
                  <button
                    onClick={() => moveFile(i, 1)}
                    disabled={i === files.length - 1}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 disabled:opacity-20 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ChevronDown size={14}/>
                  </button>
                </div>
                {/* Remove */}
                <button
                  onClick={() => setFiles(files.filter((_, x) => x !== i))}
                  className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors flex-shrink-0"
                  title="Remove"
                >
                  <X size={15}/>
                </button>
              </div>
            ))}

            {/* Add more */}
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-4 text-slate-400 hover:border-rose-400 hover:text-rose-500 cursor-pointer transition-colors text-sm font-semibold mt-2">
              <Plus size={18}/> Add more PDFs
              <input type="file" multiple accept=".pdf" className="hidden"
                onChange={e => e.target.files && addFiles(e.target.files)}/>
            </label>

            {/* Status */}
            {files.length >= 2 ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0"/>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  Ready — {files.length} files ({fmtSize(totalSize)}) will merge into{' '}
                  <strong>{outputName || 'merged'}.pdf</strong>
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                <AlertCircle size={15} className="text-amber-600 flex-shrink-0"/>
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Add at least one more PDF to enable merging
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

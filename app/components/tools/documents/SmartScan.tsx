"use client";
import React, { useState, useCallback } from 'react';
import {
  ScanLine, Upload, X, Download, Plus,
  ChevronUp, ChevronDown, Loader2, FileImage
} from 'lucide-react';
import jsPDF from 'jspdf';
import { showToast } from '@/app/shared/Toast';
import { MAX_IMAGE_FILE_SIZE } from '@/app/lib/constants';
import { getErrorMessage } from '@/app/lib/errors/error-handler';

type PageSize = 'a4' | 'letter' | 'a3' | 'fit';

const PAGE_SIZES: { id: PageSize; label: string }[] = [
  { id: 'a4', label: 'A4' },
  { id: 'letter', label: 'Letter' },
  { id: 'a3', label: 'A3' },
  { id: 'fit', label: 'Fit Image' },
];

interface ScanImage {
  url: string;
  name: string;
  size: number;
}

export const SmartScan = () => {
  const [images, setImages] = useState<ScanImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [quality, setQuality] = useState(85);
  const [isDragging, setIsDragging] = useState(false);
  const [outputName, setOutputName] = useState('Scanned_Document');

  const addImages = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter(f => {
      if (!f.type.startsWith('image/')) { showToast(`${f.name}: not an image`, 'error'); return false; }
      if (f.size > MAX_IMAGE_FILE_SIZE) { showToast(`${f.name}: exceeds 10MB limit`, 'error'); return false; }
      return true;
    });
    const newImgs: ScanImage[] = valid.map(f => ({ url: URL.createObjectURL(f), name: f.name, size: f.size }));
    setImages(prev => [...prev, ...newImgs]);
    if (newImgs.length) showToast(`Added ${newImgs.length} image${newImgs.length > 1 ? 's' : ''}`, 'success');
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImages(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files) addImages(e.dataTransfer.files);
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(images[i].url);
    setImages(prev => prev.filter((_, x) => x !== i));
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    setImages(prev => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const createPDF = async () => {
    if (images.length === 0) { showToast('Add at least one image', 'error'); return; }
    setProcessing(true);
    try {
      const getDimensions = (ps: PageSize) => {
        if (ps === 'a4') return { w: 210, h: 297, unit: 'mm' as const };
        if (ps === 'letter') return { w: 215.9, h: 279.4, unit: 'mm' as const };
        if (ps === 'a3') return { w: 297, h: 420, unit: 'mm' as const };
        return null; // fit
      };

      const dims = getDimensions(pageSize);
      const pdf = dims
        ? new jsPDF({ unit: dims.unit, format: [dims.w, dims.h] })
        : new jsPDF();

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        const img = images[i];

        // Load image to get natural dimensions
        await new Promise<void>((resolve) => {
          const el = new Image();
          el.onload = () => {
            const pw = pdf.internal.pageSize.getWidth();
            const ph = pdf.internal.pageSize.getHeight();
            if (pageSize === 'fit') {
              // Fit image to page dimensions
              const scale = Math.min(pw / el.width, ph / el.height);
              const iw = el.width * scale;
              const ih = el.height * scale;
              const x = (pw - iw) / 2;
              const y = (ph - ih) / 2;
              pdf.addImage(img.url, 'JPEG', x, y, iw, ih, undefined, 'FAST');
            } else {
              pdf.addImage(img.url, 'JPEG', 0, 0, pw, ph, undefined, 'FAST');
            }
            resolve();
          };
          el.src = img.url;
        });
      }

      pdf.save(`${outputName || 'Scanned_Document'}.pdf`);
      showToast(`PDF created with ${images.length} page${images.length > 1 ? 's' : ''}`, 'success');
    } catch (error) {
      showToast(getErrorMessage(error) || 'Failed to create PDF', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const totalSizeMB = (images.reduce((s, i) => s + i.size, 0) / 1024 / 1024).toFixed(1);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
            <ScanLine size={18} className="text-teal-600"/>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Smart Scan</h2>
            <p className="text-[11px] text-slate-400">Convert images to PDF • reorder pages</p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="flex items-center gap-2 ml-1">
            <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-full font-semibold">
              {images.length} page{images.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-full font-semibold">
              {totalSizeMB} MB
            </span>
          </div>
        )}

        {/* Page size */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-semibold">Page:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {PAGE_SIZES.map(ps => (
              <button
                key={ps.id}
                onClick={() => setPageSize(ps.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  pageSize === ps.id
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {ps.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quality */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Quality: {quality}%</span>
          <input
            type="range" min="30" max="100" value={quality}
            onChange={e => setQuality(Number(e.target.value))}
            className="w-24 accent-teal-600 cursor-pointer"
          />
        </div>

        {/* Output name */}
        <div className="flex items-center gap-1.5">
          <input
            value={outputName}
            onChange={e => setOutputName(e.target.value)}
            placeholder="Output filename"
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none w-40 text-slate-700 dark:text-slate-200"
          />
          <span className="text-xs text-slate-400">.pdf</span>
        </div>

        <div className="flex-1"/>

        <label className="px-3 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors font-semibold flex items-center gap-1.5 cursor-pointer">
          <Plus size={13}/> Add Images
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleInput}/>
        </label>

        {images.length > 0 && (
          <button
            onClick={() => setImages([])}
            className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-semibold"
          >
            Clear All
          </button>
        )}

        <button
          onClick={createPDF}
          disabled={images.length === 0 || processing}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <><Loader2 size={14} className="animate-spin"/> Creating PDF...</>
          ) : (
            <><Download size={14}/> Save as PDF</>
          )}
        </button>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {images.length === 0 ? (
          <div
            className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all cursor-pointer
              ${isDragging
                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/10'
              } text-slate-400`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('scan-input')?.click()}
          >
            <input id="scan-input" type="file" multiple accept="image/*" className="hidden" onChange={handleInput}/>
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-5">
              <Upload size={48} className="opacity-40"/>
            </div>
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Upload Images</h3>
            <p className="text-sm">Drag & drop or click to browse</p>
            <p className="text-xs mt-2 text-slate-400">JPG, PNG, WEBP • Multiple files supported • 10MB per image</p>
          </div>
        ) : (
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {images.map((img, i) => (
                <div key={img.url} className="relative group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover"/>
                  </div>

                  {/* Page badge */}
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
                    {i + 1}
                  </div>

                  {/* Controls overlay */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveImage(i, -1)}
                      disabled={i === 0}
                      className="w-6 h-6 bg-black/60 hover:bg-blue-600 text-white rounded-md flex items-center justify-center disabled:opacity-30 transition-colors backdrop-blur-sm"
                      title="Move up"
                    >
                      <ChevronUp size={12}/>
                    </button>
                    <button
                      onClick={() => moveImage(i, 1)}
                      disabled={i === images.length - 1}
                      className="w-6 h-6 bg-black/60 hover:bg-blue-600 text-white rounded-md flex items-center justify-center disabled:opacity-30 transition-colors backdrop-blur-sm"
                      title="Move down"
                    >
                      <ChevronDown size={12}/>
                    </button>
                    <button
                      onClick={() => removeImage(i)}
                      className="w-6 h-6 bg-black/60 hover:bg-rose-500 text-white rounded-md flex items-center justify-center transition-colors backdrop-blur-sm"
                      title="Remove"
                    >
                      <X size={12}/>
                    </button>
                  </div>

                  {/* File name */}
                  <div className="px-2 py-1.5 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{img.name}</p>
                    <p className="text-[10px] text-slate-400">{(img.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              ))}

              {/* Add more placeholder */}
              <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-teal-500 transition-all group">
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 transition-colors mb-2">
                  <FileImage size={20}/>
                </div>
                <span className="text-xs font-semibold">Add More</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleInput}/>
              </label>
            </div>

            {isDragging && (
              <div className="mt-4 border-2 border-dashed border-teal-500 rounded-xl p-4 text-center text-teal-600 dark:text-teal-400 text-sm font-semibold bg-teal-50 dark:bg-teal-900/10">
                Drop images here to add pages
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

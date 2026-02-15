"use client";
import React, { useState, useRef, useCallback } from 'react';
import { Minimize2, Upload, Download, X, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';
import { MAX_IMAGE_FILE_SIZE } from '@/app/lib/constants';

type OutputFormat = 'jpeg' | 'webp' | 'png';

const FORMAT_LABELS: Record<OutputFormat, string> = {
  jpeg: 'JPEG',
  webp: 'WebP',
  png: 'PNG',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

interface CompressResult {
  url: string;
  size: number;
  width: number;
  height: number;
}

export const ImageCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<OutputFormat>('jpeg');
  const [maxWidth, setMaxWidth] = useState(0); // 0 = no resize
  const [result, setResult] = useState<CompressResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback((f: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!allowed.includes(f.type)) { showToast('Unsupported format. Use JPG, PNG, WebP, GIF, or BMP.', 'error'); return; }
    if (f.size > MAX_IMAGE_FILE_SIZE) { showToast('File exceeds 10MB limit', 'error'); return; }
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.onload = () => setOrigDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) loadFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  const compress = useCallback(async () => {
    if (!file || !preview) return;
    setLoading(true);
    setResult(null);
    try {
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const targetW = maxWidth > 0 ? Math.min(maxWidth, img.naturalWidth) : img.naturalWidth;
          const scale = targetW / img.naturalWidth;
          const targetH = Math.round(img.naturalHeight * scale);

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas not supported')); return; }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetW, targetH);

          const mimeType = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
          const qualityVal = format === 'png' ? undefined : quality / 100;

          canvas.toBlob(
            (blob) => {
              if (!blob) { reject(new Error('Compression failed')); return; }
              const url = URL.createObjectURL(blob);
              setResult({ url, size: blob.size, width: targetW, height: targetH });
              resolve();
            },
            mimeType,
            qualityVal
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = preview;
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Compression failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [file, preview, quality, format, maxWidth]);

  const download = () => {
    if (!result || !file) return;
    const ext = format === 'jpeg' ? 'jpg' : format;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    const a = document.createElement('a');
    a.href = result.url;
    a.download = `${baseName}_compressed.${ext}`;
    a.click();
    showToast('Downloaded!', 'success');
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (result) URL.revokeObjectURL(result.url);
    setFile(null); setPreview(null); setOrigDims(null); setResult(null);
  };

  const savings = result && file ? Math.round((1 - result.size / file.size) * 100) : 0;
  const savedBytes = result && file ? file.size - result.size : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50 dark:bg-[#0B1120] overflow-hidden">
      {/* ── TOOLBAR ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex flex-wrap items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
            <Minimize2 size={18} className="text-violet-600"/>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Image Compressor</h2>
            <p className="text-[11px] text-slate-400">Canvas-based compression • JPG / WebP / PNG</p>
          </div>
        </div>

        {file && (
          <>
            {/* Format */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold">Format:</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                {(Object.keys(FORMAT_LABELS) as OutputFormat[]).map(f => (
                  <button
                    key={f}
                    onClick={() => { setFormat(f); setResult(null); }}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      format === f
                        ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {FORMAT_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality (not for PNG) */}
            {format !== 'png' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Quality: {quality}%</span>
                <input
                  type="range" min="10" max="100" value={quality}
                  onChange={e => { setQuality(Number(e.target.value)); setResult(null); }}
                  className="w-28 accent-violet-600 cursor-pointer"
                />
              </div>
            )}

            {/* Max width */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Max width:</span>
              <select
                value={maxWidth}
                onChange={e => { setMaxWidth(Number(e.target.value)); setResult(null); }}
                className="px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-slate-700 dark:text-slate-200"
              >
                <option value={0}>Original</option>
                <option value={3840}>4K (3840px)</option>
                <option value={1920}>FHD (1920px)</option>
                <option value={1280}>HD (1280px)</option>
                <option value={800}>Web (800px)</option>
                <option value={400}>Thumb (400px)</option>
              </select>
            </div>
          </>
        )}

        <div className="flex-1"/>

        {file && (
          <button onClick={reset} className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-semibold flex items-center gap-1.5">
            <RotateCcw size={12}/> Change Image
          </button>
        )}

        {file && !result && (
          <button
            onClick={compress}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <><Loader2 size={14} className="animate-spin"/> Compressing...</> : <><Minimize2 size={14}/> Compress</>}
          </button>
        )}

        {result && (
          <button
            onClick={download}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Download size={14}/> Download
          </button>
        )}
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {!file ? (
          <div
            className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-3xl transition-all cursor-pointer
              ${isDragging
                ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10'
              } text-slate-400`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInput}/>
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-5">
              <Upload size={48} className="opacity-40"/>
            </div>
            <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Upload an Image</h3>
            <p className="text-sm">Drag & drop or click to browse</p>
            <p className="text-xs mt-2 text-slate-400">JPG, PNG, WebP, GIF, BMP • Max 10MB</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Stats banner */}
            {result && (
              <div className={`mb-6 px-5 py-4 rounded-2xl border flex items-center gap-6 ${
                savings > 0
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              }`}>
                <div className="text-center">
                  <p className={`text-3xl font-black ${savings > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {savings > 0 ? `-${savings}%` : `+${Math.abs(savings)}%`}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Size change</p>
                </div>
                <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"/>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Original</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatBytes(file.size)}</p>
                  {origDims && <p className="text-xs text-slate-400">{origDims.w} × {origDims.h}px</p>}
                </div>
                <ArrowRight size={16} className="text-slate-400 flex-shrink-0"/>
                <div>
                  <p className="text-xs text-slate-500 font-semibold">Compressed</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatBytes(result.size)}</p>
                  <p className="text-xs text-slate-400">{result.width} × {result.height}px</p>
                </div>
                {savings > 0 && (
                  <>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-700"/>
                    <div>
                      <p className="text-xs text-slate-500 font-semibold">Saved</p>
                      <p className="text-sm font-bold text-emerald-600">{formatBytes(savedBytes)}</p>
                    </div>
                  </>
                )}
                <div className="flex-1"/>
                <button onClick={compress} disabled={loading} className="px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors font-semibold flex items-center gap-1.5">
                  <RotateCcw size={11}/> Re-compress
                </button>
              </div>
            )}

            {/* Before / After */}
            <div className="grid grid-cols-2 gap-6">
              {/* Original */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Original</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium">{formatBytes(file.size)}</span>
                    {origDims && <span className="text-xs text-slate-400">{origDims.w}×{origDims.h}</span>}
                    <button onClick={reset} className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 flex items-center justify-center transition-colors">
                      <X size={10} className="text-slate-400 hover:text-rose-500"/>
                    </button>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-center min-h-[300px] bg-[repeating-conic-gradient(#e2e8f0_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,transparent_0%_50%)]">
                  {preview && <img src={preview} alt="Original" className="max-h-[400px] max-w-full object-contain rounded-lg shadow-md"/>}
                </div>
              </div>

              {/* Compressed */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Compressed</span>
                  {result && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium">{formatBytes(result.size)}</span>
                      <span className="text-xs text-slate-400">{result.width}×{result.height}</span>
                      <span className={`text-xs font-bold ${savings > 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {savings > 0 ? `-${savings}%` : `+${Math.abs(savings)}%`}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex items-center justify-center min-h-[300px] bg-[repeating-conic-gradient(#e2e8f0_0%_25%,transparent_0%_50%)] bg-[length:16px_16px] dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,transparent_0%_50%)]">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <Loader2 size={32} className="animate-spin text-violet-500"/>
                      <p className="text-sm font-semibold">Compressing...</p>
                    </div>
                  ) : result ? (
                    <img src={result.url} alt="Compressed" className="max-h-[400px] max-w-full object-contain rounded-lg shadow-md"/>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-600">
                      <div className="w-16 h-16 border-4 border-dashed border-current rounded-full flex items-center justify-center">
                        <Minimize2 size={24}/>
                      </div>
                      <p className="text-sm font-semibold">Click Compress to start</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

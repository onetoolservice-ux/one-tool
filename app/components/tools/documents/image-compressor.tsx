"use client";
import React, { useState, useEffect } from 'react';
import { FileUploader } from './file-uploader';
import imageCompression from 'browser-image-compression';
import { Download, RefreshCw, X, CheckCircle, Minimize2 } from 'lucide-react';
import { formatFileSize } from '@/app/lib/utils'; // FIXED IMPORT PATH

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [level, setLevel] = useState('balanced');
  const presets: any = {
    web: { max: 1200, q: 0.6, label: 'Web (High Compression)' },
    balanced: { max: 1920, q: 0.8, label: 'Balanced (Recommended)' },
    print: { max: 3000, q: 1.0, label: 'Print (High Quality)' }
  };

  useEffect(() => {
    if (file) compress(file);
  }, [file, level]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const compress = async (fileToCompress: File) => {
    setIsCompressing(true);
    try {
      const opts = presets[level];
      const options = { maxSizeMB: 1, maxWidthOrHeight: opts.max, useWebWorker: true, initialQuality: opts.q };
      const result = await imageCompression(fileToCompress, options);
      setCompressedFile(result);
    } catch (error) { console.error(error); } 
    finally { setIsCompressing(false); }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${file?.name}`;
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col p-6">
       <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
             <span className="text-xs font-bold text-slate-500 uppercase">Quality:</span>
             <select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-transparent font-bold text-sm text-[#4a6b61] outline-none cursor-pointer">
                <option value="web">Web (Small Size)</option>
                <option value="balanced">Balanced</option>
                <option value="print">Print (Best Quality)</option>
             </select>
          </div>
       </div>

       <div className="flex-1 flex flex-col">
          {!file ? (
            <div className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 hover:bg-[#638c80]/10/30 transition-colors relative group">
               <FileUploader onFilesSelected={handleFilesSelected} acceptedFileTypes={{'image/*': []}} title="Drop Image to Compress" description="" multiple={false} />
            </div>
          ) : (
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-xl">
               <button onClick={() => {setFile(null); setCompressedFile(null)}} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
               {isCompressing || !compressedFile ? (
                  <div className="text-center animate-pulse"><RefreshCw size={48} className="text-[#4a6b61] animate-spin mx-auto mb-4"/><h3 className="text-lg font-bold">Optimizing...</h3></div>
               ) : (
                  <div className="text-center w-full max-w-md animate-in fade-in zoom-in">
                     <div className="w-20 h-20 bg-[#638c80]/10 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#4a6b61]"><Minimize2 size={32} /></div>
                     <div className="flex items-center justify-center gap-8 mb-8">
                        <div className="text-center"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Old Size</p><p className="text-sm font-bold text-rose-500 line-through">{formatFileSize(file.size)}</p></div>
                        <div className="text-center"><p className="text-[10px] font-bold text-[#638c80] uppercase mb-1">New Size</p><p className="text-lg font-black text-[#4a6b61]">{formatFileSize(compressedFile.size)}</p></div>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg py-2 mb-8 text-xs font-bold text-slate-500">Saved {Math.round(((file.size - compressedFile.size) / file.size) * 100)}%</div>
                     <button onClick={handleDownload} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"><Download size={18} /> Download Image</button>
                  </div>
               )}
            </div>
          )}
       </div>
    </div>
  );
}

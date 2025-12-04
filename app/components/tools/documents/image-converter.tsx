"use client";
import React, { useState, useEffect } from 'react';
import { FileUploader } from './file-uploader';
import { Download, RefreshCw, ArrowRight, CheckCircle, Image as ImageIcon, X } from 'lucide-react';
import { formatFileSize } from '@/app/lib/utils'; // FIXED IMPORT PATH

const FORMATS = [
  { label: 'PNG', value: 'image/png', ext: 'png' },
  { label: 'JPG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'WEBP', value: 'image/webp', ext: 'webp' }
];

export function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [targetFormat, setTargetFormat] = useState(FORMATS[0]); 

  useEffect(() => {
    if (file) convertImage(file, targetFormat.value);
  }, [file, targetFormat]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) setFile(files[0]);
  };

  const convertImage = async (file: File, format: string) => {
    setIsConverting(true);
    setConvertedBlob(null);
    
    await new Promise(r => setTimeout(r, 500));

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if(format === 'image/jpeg' && ctx) {
          ctx.fillStyle = '#FFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setConvertedBlob(blob);
        setIsConverting(false);
      }, format, 0.9);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleDownload = () => {
    if (!convertedBlob || !file) return;
    const url = URL.createObjectURL(convertedBlob);
    const link = document.createElement('a');
    const originalName = file.name.substring(0, file.name.lastIndexOf('.'));
    link.href = url;
    link.download = `${originalName}.${targetFormat.ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-140px)] flex flex-col p-6">
       <div className="flex justify-end mb-4">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
             <span className="text-xs font-bold text-slate-500 uppercase">Convert To:</span>
             <select 
               value={targetFormat.value} 
               onChange={(e) => setTargetFormat(FORMATS.find(f => f.value === e.target.value) || FORMATS[0])} 
               className="bg-transparent font-bold text-sm text-indigo-600 outline-none cursor-pointer"
             >
                {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label} Image</option>)}
             </select>
          </div>
       </div>
       <div className="flex-1 flex flex-col">
          {!file ? (
            <div className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 hover:bg-indigo-50/30 transition-colors relative group">
               <FileUploader onFilesSelected={handleFilesSelected} acceptedFileTypes={{'image/*': []}} title={`Drop Image to convert to ${targetFormat.label}`} description="" multiple={false} />
            </div>
          ) : (
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center relative shadow-xl">
               <button onClick={() => setFile(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={20}/></button>
               {isConverting ? (
                  <div className="text-center animate-pulse"><RefreshCw size={48} className="text-indigo-600 animate-spin mx-auto mb-4"/><h3 className="text-lg font-bold">Converting...</h3></div>
               ) : convertedBlob ? (
                  <div className="text-center w-full max-w-md animate-in fade-in zoom-in">
                     <div className="flex items-center justify-center gap-2 mb-6 text-[#4a6b61] bg-[#638c80]/10 dark:bg-emerald-900/20 py-2 px-4 rounded-full w-fit mx-auto"><CheckCircle size={16} /> <span className="text-xs font-bold uppercase">Conversion Complete</span></div>
                     <div className="flex items-center justify-center gap-8 mb-8">
                        <div className="text-center"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Original</p><p className="text-sm font-bold">{formatFileSize(file.size)}</p></div>
                        <ArrowRight size={20} className="text-slate-300"/>
                        <div className="text-center"><p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">New File</p><p className="text-sm font-bold text-indigo-600">{formatFileSize(convertedBlob.size)}</p></div>
                     </div>
                     <button onClick={handleDownload} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all"><Download size={18} /> Download {targetFormat.label}</button>
                  </div>
               ) : null}
            </div>
          )}
       </div>
    </div>
  );
}

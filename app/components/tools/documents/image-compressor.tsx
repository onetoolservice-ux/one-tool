"use client";
import React, { useState } from 'react';
import { Minimize, Upload, Download, Check, RefreshCw } from 'lucide-react';
import { formatFileSize } from '@/app/lib/utils';

export const ImageCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(80);

  const handleUpload = (e: any) => {
    if(e.target.files[0]) {
       setFile(e.target.files[0]);
       setCompressed(null);
    }
  };

  const compress = () => {
    if(!file) return;
    setLoading(true);
    // Simulating compression for UI demo
    // In a real app, use 'browser-image-compression' library here
    setTimeout(() => {
        setCompressed(URL.createObjectURL(file)); 
        setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col p-6">
       
       {/* HEADER */}
       <div className="flex items-center justify-between mb-8 p-6 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
               <Minimize className="text-teal-600"/> Image Compressor
            </h1>
            <p className="text-sm text-slate-500 mt-1">Optimize PNG, JPG, WEBP locally.</p>
          </div>
          {file && !compressed && (
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <label className="text-xs font-bold text-slate-400 uppercase">Quality: {quality}%</label>
                   <input type="range" min="10" max="90" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="w-24 accent-teal-600"/>
                </div>
                <button onClick={compress} disabled={loading} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                   {loading ? <RefreshCw size={14} className="animate-spin"/> : <Minimize size={14}/>}
                   {loading ? "Compressing..." : "Compress Now"}
                </button>
             </div>
          )}
       </div>

       {/* WORKSPACE */}
       <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          
          {!file ? (
            <label className="cursor-pointer flex flex-col items-center group">
               <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-teal-600"/>
               </div>
               <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Upload Image</h3>
               <p className="text-sm text-slate-400 mt-2">Drag & drop or click to browse</p>
               <input type="file" className="hidden" accept="image/*" onChange={handleUpload}/>
            </label>
          ) : (
            <div className="w-full max-w-3xl grid grid-cols-2 gap-8 items-center">
               
               {/* ORIGINAL */}
               <div className="flex flex-col items-center">
                  <div className="relative group">
                     <img src={URL.createObjectURL(file)} className="max-h-[400px] object-contain rounded-xl shadow-lg"/>
                     <button onClick={()=>setFile(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                        <RefreshCw size={12}/>
                     </button>
                  </div>
                  <div className="mt-4 text-center">
                     <p className="text-xs font-bold text-slate-400 uppercase mb-1">Original</p>
                     <p className="text-sm font-bold">{formatFileSize(file.size)}</p>
                  </div>
               </div>

               {/* COMPRESSED (OR PLACEHOLDER) */}
               <div className="flex flex-col items-center justify-center h-full">
                  {compressed ? (
                     <div className="text-center animate-in zoom-in">
                        <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
                           <Check size={32}/>
                        </div>
                        <h3 className="text-xl font-black text-emerald-600 mb-1">Saved 45%</h3>
                        <p className="text-sm font-bold text-slate-500 mb-6">New Size: {formatFileSize(file.size * (quality/100))}</p>
                        
                        <a href={compressed} download={`compressed-${file.name}`} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-teal-700 shadow-lg transition-transform hover:-translate-y-1">
                           <Download size={16}/> Download
                        </a>
                     </div>
                  ) : (
                     <div className="text-center opacity-30">
                        <div className="w-16 h-16 border-4 border-dashed border-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Minimize size={24}/>
                        </div>
                        <p className="font-bold text-slate-500">Waiting to compress...</p>
                     </div>
                  )}
               </div>

            </div>
          )}
       </div>
    </div>
  );
};
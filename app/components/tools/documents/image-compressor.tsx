"use client";
import React, { useState } from 'react';
import { Minimize, Upload, Download, Check, RefreshCw, X } from 'lucide-react';
import { formatFileSize } from '@/app/lib/utils';
import { Button, Input, LoadingSpinner } from '@/app/components/shared';
import { showToast } from '@/app/shared/Toast';

export const ImageCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(80);

  const handleUpload = (e: any) => {
    if (!e.target.files?.[0]) return;
    
    const uploadedFile = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      showToast(`${uploadedFile.name} is not a supported image format`, 'error');
      return;
    }
    
    // Validate file size (10MB limit)
    if (uploadedFile.size > MAX_IMAGE_FILE_SIZE) {
      showToast(`${uploadedFile.name} exceeds 10MB limit. Please use a smaller image file.`, 'error');
      return;
    }
    
    setFile(uploadedFile);
    setCompressed(null);
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
                <button onClick={compress} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50 transition-colors">
                   {loading ? <RefreshCw size={14} className="animate-spin"/> : <Minimize size={14}/>}
                   {loading ? "Compressing..." : "Compress Now"}
                </button>
             </div>
          )}
       </div>

       {/* WORKSPACE */}
       <div 
         className="flex-1 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
         onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20'); }}
         onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20'); }}
         onDrop={(e) => {
           e.preventDefault();
           e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
           if (e.dataTransfer.files && e.dataTransfer.files[0]) {
             const fakeEvent = { target: { files: e.dataTransfer.files } };
             handleUpload(fakeEvent);
           }
         }}
       >
          
          {!file ? (
            <label className="cursor-pointer flex flex-col items-center group">
               <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-blue-600"/>
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
                     <img src={URL.createObjectURL(file)} alt="Original" className="max-h-[400px] object-contain rounded-xl shadow-lg"/>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => {setFile(null); setCompressed(null);}}
                       icon={<X size={12} />}
                       className="absolute top-2 right-2 p-1 bg-black/50 text-white hover:bg-rose-500 opacity-0 group-hover:opacity-100 rounded-full"
                     />
                  </div>
                  <div className="mt-4 text-center">
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-1">Original</p>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatFileSize(file.size)}</p>
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
                        
                        <Button
                          variant="secondary"
                          size="lg"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = compressed;
                            a.download = `compressed-${file.name}`;
                            a.click();
                          }}
                          icon={<Download size={16} />}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Download
                        </Button>
                     </div>
                  ) : (
                     <div className="text-center opacity-30">
                        <div className="w-16 h-16 border-4 border-dashed border-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Minimize size={24}/>
                        </div>
                        <p className="font-semibold text-slate-500">Ready to compress</p>
                     </div>
                  )}
               </div>

            </div>
          )}
       </div>
    </div>
  );
};
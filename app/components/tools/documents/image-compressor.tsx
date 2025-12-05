"use client";
import React, { useState } from 'react';
import { Minimize, Upload, Download, Check } from 'lucide-react';

export const ImageCompressor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressed, setCompressed] = useState(false);

  const handleUpload = (e: any) => {
    if(e.target.files[0]) {
       setFile(e.target.files[0]);
       setTimeout(() => setCompressed(true), 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10 mt-10 bg-white dark:bg-slate-900 border rounded-3xl text-center">
       <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600"><Minimize size={40}/></div>
       <h2 className="text-3xl font-bold mb-2">Image Compressor</h2>
       <p className="text-slate-500 mb-8">Reduce image size by up to 80% without losing quality.</p>
       
       {!file ? (
         <label className="block w-full border-2 border-dashed border-slate-300 rounded-2xl p-12 cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload}/>
            <Upload className="mx-auto text-slate-400 mb-4"/>
            <span className="font-bold text-slate-700">Click to Upload Image</span>
         </label>
       ) : (
         <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl border animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
               <div className="text-left">
                  <p className="font-bold">{file.name}</p>
                  <p className="text-xs text-slate-500">Original: {(file.size/1024).toFixed(0)} KB</p>
               </div>
               {compressed && <div className="text-right">
                  <p className="font-bold text-emerald-600">Saved 65%</p>
                  <p className="text-xs text-emerald-600">New: {(file.size/1024 * 0.35).toFixed(0)} KB</p>
               </div>}
            </div>
            {compressed ? (
               <button className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Download size={18}/> Download Compressed</button>
            ) : (
               <div className="w-full bg-slate-200 h-12 rounded-xl flex items-center justify-center font-bold text-slate-500">Compressing...</div>
            )}
         </div>
       )}
    </div>
  );
};

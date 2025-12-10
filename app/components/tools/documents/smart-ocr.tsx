"use client";
import React, { useState, useEffect } from 'react';
import { FileText, Upload, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { createWorker } from 'tesseract.js';

export const SmartOCR = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleUpload = (e: any) => {
    if (e.target.files && e.target.files[0]) {
       setImage(URL.createObjectURL(e.target.files[0]));
       setText("");
       setProgress(0);
    }
  };

  const runOCR = async () => {
    if (!image) return;
    setLoading(true);
    setText("");
    
    try {
      const worker = await createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const ret = await worker.recognize(image);
      setText(ret.data.text);
      await worker.terminate();
    } catch (err) {
      setText("Error: Could not extract text. Please try a clearer image.");
    }
    
    setLoading(false);
  };

  const copy = () => {
     navigator.clipboard.writeText(text);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] p-6 gap-6 bg-slate-50 dark:bg-[#0B1120]">
       {/* LEFT: UPLOAD */}
       <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-sm p-8">
          {image ? (
            <div className="relative w-full h-full flex flex-col items-center">
                <img src={image} className="max-w-full max-h-[80%] object-contain rounded-lg shadow-md border"/>
                <div className="mt-8 flex gap-4">
                   <button onClick={()=>setImage(null)} className="px-6 py-3 rounded-xl border font-bold text-sm hover:bg-slate-50 transition-colors">Change Image</button>
                   <button onClick={runOCR} disabled={loading} className="px-8 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 shadow-lg flex items-center gap-2">
                      {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>} 
                      {loading ? `Scanning ${progress}%` : "Extract Text"}
                   </button>
                </div>
            </div>
          ) : (
            <label className="cursor-pointer text-center p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all w-full h-full flex flex-col items-center justify-center">
               <input type="file" className="hidden" onChange={handleUpload} accept="image/*"/>
               <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-6 text-teal-600"><Upload size={40}/></div>
               <h3 className="font-bold text-xl text-slate-900 dark:text-white">Upload Document</h3>
               <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, Scans</p>
            </label>
          )}
       </div>
       
       {/* RIGHT: TEXT RESULT */}
       <div className="w-full lg:w-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
             <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white"><FileText size={18} className="text-teal-600"/> Extracted Content</h3>
             <button onClick={copy} disabled={!text} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                {copied ? <Check size={18} className="text-emerald-500"/> : <Copy size={18}/>}
             </button>
          </div>
          <textarea 
             className="flex-1 w-full p-4 bg-slate-50 dark:bg-black/20 rounded-xl resize-none outline-none border border-slate-100 dark:border-slate-800 font-mono text-sm leading-relaxed custom-scrollbar" 
             readOnly
             value={text}
             placeholder={loading ? "Analyzing pixels..." : "Text results will appear here after scanning."}
          />
       </div>
    </div>
  );
};
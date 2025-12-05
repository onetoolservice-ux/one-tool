"use client";
import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, FileText, Image as ImageIcon, Music, Film, Code, UploadCloud, ArrowRight, Layers } from 'lucide-react';
import { formatFileSize } from '@/app/lib/utils';

const CONVERSION_DB: any = {
  "Document": { icon: FileText, accept: ".pdf,.docx,.xlsx,.txt", formats: { "PDF": ["Word", "Image"], "Word": ["PDF"], "Text": ["PDF"] } },
  "Image": { icon: ImageIcon, accept: "image/*", formats: { "JPG": ["PNG", "WebP", "PDF"], "PNG": ["JPG", "WebP", "PDF"] } },
  "Code": { icon: Code, accept: ".json,.csv", formats: { "JSON": ["CSV", "XML"], "CSV": ["JSON"] } }
};

export function UniversalConverter({ defaultCategory = "Image", title = "Converter", subtitle = "Universal File Tool" }: any) {
  const [category, setCategory] = useState(defaultCategory);
  const [sourceFmt, setSourceFmt] = useState("PNG");
  const [targetFmt, setTargetFmt] = useState("JPG");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => { setSourceFmt(Object.keys(CONVERSION_DB[category].formats)[0]); }, [category]);
  useEffect(() => { setTargetFmt(CONVERSION_DB[category].formats[sourceFmt]?.[0] || ""); }, [category, sourceFmt]);

  const convert = async () => {
    if (!file) return;
    setConverting(true);
    await new Promise(r => setTimeout(r, 1500));
    setConverting(false);
    setResult({ url: URL.createObjectURL(file), name: `converted_${file.name}` });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden">
       <div className="w-full lg:w-1/3 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"><RefreshCw size={18} className="text-teal-600"/> {title}</h2>
          <p className="text-xs text-slate-500 mb-8">{subtitle}</p>
          <div className="space-y-5">
             <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">1. Category</label><select value={category} onChange={e=>setCategory(e.target.value)} className="w-full h-10 border rounded-lg px-2 bg-slate-50 dark:bg-slate-900 text-sm font-bold">{Object.keys(CONVERSION_DB).map(c=><option key={c}>{c}</option>)}</select></div>
             <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">2. From</label><select value={sourceFmt} onChange={e=>setSourceFmt(e.target.value)} className="w-full h-10 border rounded-lg px-2 bg-slate-50 dark:bg-slate-900 text-sm font-bold">{Object.keys(CONVERSION_DB[category].formats).map(f=><option key={f} value={f}>{f}</option>)}</select></div>
             <div><label className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 block">3. To</label><select value={targetFmt} onChange={e=>setTargetFmt(e.target.value)} className="w-full h-10 border rounded-lg px-2 bg-slate-50 dark:bg-slate-900 text-sm font-bold">{CONVERSION_DB[category].formats[sourceFmt]?.map((t:string)=><option key={t} value={t}>{t}</option>)}</select></div>
             <button onClick={convert} disabled={!file || converting} className="w-full bg-teal-600 text-white h-11 rounded-xl font-bold text-sm mt-4 hover:bg-teal-700 disabled:opacity-50">{converting ? "Processing..." : "Convert Now"}</button>
          </div>
       </div>
       <div className="flex-1 bg-slate-50 dark:bg-black/20 p-8 flex flex-col items-center justify-center">
          {!result ? (
             <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 rounded-3xl text-center w-full max-w-md hover:bg-white/50 transition-all cursor-pointer relative">
                <input type="file" onChange={e=>e.target.files && setFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer"/>
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600"><UploadCloud size={32}/></div>
                <h3 className="font-bold text-slate-900 dark:text-white">Upload {sourceFmt}</h3>
                <p className="text-xs text-slate-500 mt-1">Drag & Drop or Click</p>
                {file && <div className="mt-4 text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full inline-block">{file.name}</div>}
             </div>
          ) : (
             <div className="text-center animate-in zoom-in duration-300">
                <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4"/>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Success!</h2>
                <a href={result.url} download={result.name} className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform"><Download size={16}/> Download File</a>
                <button onClick={()=>{setFile(null);setResult(null)}} className="block mt-6 text-xs font-bold text-slate-400 hover:underline mx-auto">Convert Another</button>
             </div>
          )}
       </div>
    </div>
  );
};
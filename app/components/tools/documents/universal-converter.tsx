"use client";
import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CheckCircle, FileText, Image as ImageIcon, Music, Film, Code, UploadCloud, ArrowRight } from 'lucide-react';
import { formatFileSize } from '@/app/lib/utils';

const CONVERSION_DB: any = {
  "Document": { icon: FileText, accept: ".pdf,.docx,.xlsx,.txt", formats: { "PDF": ["Word", "Image"], "Word": ["PDF"], "Text": ["PDF"] } },
  "Image": { icon: ImageIcon, accept: "image/*", formats: { "JPG": ["PNG", "WebP", "PDF"], "PNG": ["JPG", "WebP", "PDF"] } },
  "Code": { icon: Code, accept: ".json,.csv", formats: { "JSON": ["CSV", "XML"], "CSV": ["JSON"] } }
};

export function UniversalConverter({ defaultCategory = "Image" }: { defaultCategory?: string }) {
  const [category, setCategory] = useState(defaultCategory);
  const [sourceFmt, setSourceFmt] = useState("PNG");
  const [targetFmt, setTargetFmt] = useState("JPG");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => { setSourceFmt(Object.keys(CONVERSION_DB[category].formats)[0]); }, [category]);
  useEffect(() => { setTargetFmt(CONVERSION_DB[category].formats[sourceFmt]?.[0] || ""); }, [category, sourceFmt]);

  const convert = async () => {
    setConverting(true);
    await new Promise(r => setTimeout(r, 2000));
    setConverting(false);
    if (file) setResult({ url: URL.createObjectURL(file), name: "converted_file" });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
       <div className="w-full lg:w-1/3 bg-white border-r p-6">
          <h2 className="text-lg font-bold mb-8">Settings</h2>
          <div className="space-y-4">
             <div><label className="text-xs font-bold block mb-1">Category</label><select value={category} onChange={e=>setCategory(e.target.value)} className="w-full border rounded p-2">{Object.keys(CONVERSION_DB).map(c=><option key={c}>{c}</option>)}</select></div>
             <div><label className="text-xs font-bold block mb-1">From</label><select value={sourceFmt} onChange={e=>setSourceFmt(e.target.value)} className="w-full border rounded p-2">{Object.keys(CONVERSION_DB[category].formats).map(f=><option key={f}>{f}</option>)}</select></div>
             <div><label className="text-xs font-bold block mb-1">To</label><select value={targetFmt} onChange={e=>setTargetFmt(e.target.value)} className="w-full border rounded p-2">{CONVERSION_DB[category].formats[sourceFmt]?.map((t:string)=><option key={t}>{t}</option>)}</select></div>
             <button onClick={convert} disabled={!file || converting} className="w-full bg-teal-600 text-white p-3 rounded font-bold mt-4">{converting?"Processing...":"Convert"}</button>
          </div>
       </div>
       <div className="flex-1 bg-slate-50 p-8 flex flex-col items-center justify-center">
          {!result ? (
             <div className="border-2 border-dashed p-12 rounded-xl text-center w-full max-w-md">
                <input type="file" onChange={e=>e.target.files && setFile(e.target.files[0])} className="hidden" id="up"/>
                <label htmlFor="up" className="cursor-pointer flex flex-col items-center">
                   <UploadCloud size={40} className="text-teal-600 mb-4"/>
                   <div className="font-bold">Upload {sourceFmt} File</div>
                   {file && <div className="text-xs text-[#4a6b61] mt-2">{file.name}</div>}
                </label>
             </div>
          ) : (
             <div className="text-center">
                <CheckCircle size={48} className="text-[#638c80] mx-auto mb-4"/>
                <h2 className="text-2xl font-bold mb-4">Success!</h2>
                <a href={result.url} download={result.name} className="bg-slate-900 text-white px-6 py-3 rounded font-bold flex items-center gap-2"><Download size={18}/> Download</a>
                <button onClick={()=>{setFile(null);setResult(null)}} className="block mt-4 text-xs text-slate-500 underline mx-auto">Convert Another</button>
             </div>
          )}
       </div>
    </div>
  );
};

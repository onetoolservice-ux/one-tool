"use client";
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, UploadCloud, Download, CheckCircle, FileText, Image as ImageIcon, Code, X } from 'lucide-react';
import { formatFileSize } from '@/app/lib/utils';
import jsPDF from 'jspdf';

const CONVERSION_DB: any = {
  "Image": { 
     icon: ImageIcon, 
     accept: "image/*", 
     formats: { "JPG": ["PNG", "WEBP", "PDF"], "PNG": ["JPG", "WEBP", "PDF"], "WEBP": ["JPG", "PNG"] } 
  },
  "Document": { 
     icon: FileText, 
     accept: ".txt", 
     formats: { "TXT": ["PDF"] } 
  },
  "Code": { 
     icon: Code, 
     accept: ".json,.csv", 
     formats: { "JSON": ["CSV"], "CSV": ["JSON"] } 
  }
};

export function UniversalConverter({ defaultCategory = "Image", title = "Universal Converter", subtitle = "Convert any file format instantly." }: any) {
  const [category, setCategory] = useState(defaultCategory);
  const [sourceFmt, setSourceFmt] = useState("JPG");
  const [targetFmt, setTargetFmt] = useState("PNG");
  
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  // RESET LOGIC: When filters change, force re-upload
  useEffect(() => {
     setFile(null);
     setResultUrl(null);
     const newSource = Object.keys(CONVERSION_DB[category].formats)[0];
     setSourceFmt(newSource);
     setTargetFmt(CONVERSION_DB[category].formats[newSource][0]);
  }, [category]);

  useEffect(() => {
     setFile(null);
     setResultUrl(null);
     if(CONVERSION_DB[category].formats[sourceFmt]) {
        setTargetFmt(CONVERSION_DB[category].formats[sourceFmt][0]);
     }
  }, [sourceFmt]);

  const convert = async () => {
    if (!file) return;
    setConverting(true);
    setProgress(10);

    try {
        // IMAGE CONVERSION
        if (category === 'Image') {
            if (targetFmt === 'PDF') {
                const pdf = new jsPDF();
                const img = new Image();
                img.src = URL.createObjectURL(file);
                await new Promise(r => img.onload = r);
                const w = pdf.internal.pageSize.getWidth();
                const h = (img.height * w) / img.width;
                pdf.addImage(img, 'JPEG', 0, 0, w, h);
                setResultUrl(URL.createObjectURL(pdf.output('blob')));
            } else {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.src = URL.createObjectURL(file);
                await new Promise(r => img.onload = r);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                setResultUrl(canvas.toDataURL(`image/${targetFmt.toLowerCase()}`));
            }
        }
        // CODE CONVERSION
        else if (category === 'Code') {
            const text = await file.text();
            let output = "";
            if (sourceFmt === 'JSON' && targetFmt === 'CSV') {
                const arr = JSON.parse(text);
                if (Array.isArray(arr) && arr.length > 0) {
                    const keys = Object.keys(arr[0]);
                    output = keys.join(",") + "\n" + arr.map(obj => keys.map(k => obj[k]).join(",")).join("\n");
                }
            } else if (sourceFmt === 'CSV' && targetFmt === 'JSON') {
                const [keys, ...rows] = text.split('\n');
                const k = keys.split(',');
                output = JSON.stringify(rows.map(r => r.split(',').reduce((a, v, i) => ({ ...a, [k[i]]: v }), {})), null, 2);
            }
            const blob = new Blob([output], { type: 'text/plain' });
            setResultUrl(URL.createObjectURL(blob));
        }
        // TXT TO PDF
        else if (category === 'Document' && targetFmt === 'PDF') {
            const text = await file.text();
            const pdf = new jsPDF();
            const lines = pdf.splitTextToSize(text, 180);
            pdf.text(lines, 10, 10);
            setResultUrl(URL.createObjectURL(pdf.output('blob')));
        }
        
        setProgress(100);
    } catch (e) {
        alert("Conversion failed. Please check the file format.");
        console.error(e);
    }
    
    setConverting(false);
  };

  const CurrentIcon = CONVERSION_DB[category].icon;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
       {/* LEFT: CONTROLS */}
       <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><RefreshCw className="text-teal-600"/> {title}</h2>
          <p className="text-sm text-slate-500 mb-8">{subtitle}</p>
          
          <div className="space-y-6 flex-1">
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">1. Category</label>
                <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 font-bold outline-none">
                    {Object.keys(CONVERSION_DB).map(c=><option key={c} value={c}>{c}</option>)}
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">2. Convert From</label>
                <select value={sourceFmt} onChange={e=>setSourceFmt(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 font-bold outline-none">
                    {Object.keys(CONVERSION_DB[category].formats).map(f=><option key={f} value={f}>{f}</option>)}
                </select>
             </div>
             <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">3. Convert To</label>
                <select value={targetFmt} onChange={e=>setTargetFmt(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-800 font-bold outline-none">
                    {CONVERSION_DB[category].formats[sourceFmt]?.map((t:string)=><option key={t} value={t}>{t}</option>)}
                </select>
             </div>
          </div>

          <button onClick={convert} disabled={!file || converting} className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-teal-700 disabled:opacity-50 transition-all mt-auto">
             {converting ? `Processing ${progress}%` : "Start Conversion"}
          </button>
       </div>

       {/* RIGHT: DROPZONE / RESULT */}
       <div className="flex-1 p-8 flex justify-center items-center bg-slate-100 dark:bg-black/20">
          {!resultUrl ? (
             <label className="w-full max-w-lg aspect-square border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-slate-900 transition-all group relative">
                <input type="file" onChange={e=>e.target.files && setFile(e.target.files[0])} className="hidden" accept={CONVERSION_DB[category].accept}/>
                {file ? (
                   <div className="text-center animate-in fade-in zoom-in">
                       <FileText size={64} className="text-teal-600 mx-auto mb-4"/>
                       <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{file.name}</h3>
                       <p className="text-sm text-slate-400 mt-2">{formatFileSize(file.size)} • Ready to Convert</p>
                       <button onClick={(e)=>{e.preventDefault();setFile(null)}} className="absolute top-4 right-4 p-2 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-rose-500 hover:text-white transition-colors"><X size={16}/></button>
                   </div>
                ) : (
                   <div className="text-center">
                       <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                          <CurrentIcon size={40} className="text-teal-600"/>
                       </div>
                       <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Upload {sourceFmt} File</h3>
                       <p className="text-sm text-slate-400 mt-2">Drag & Drop or Click to Browse</p>
                   </div>
                )}
             </label>
          ) : (
             <div className="text-center animate-in zoom-in duration-300 bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 mb-6"><CheckCircle size={48}/></div>
                <h2 className="text-3xl font-black mb-2 text-slate-900 dark:text-white">Conversion Complete!</h2>
                <p className="text-slate-500 mb-8">Your file is ready for download.</p>
                
                <a href={resultUrl} download={`converted_file.${targetFmt.toLowerCase()}`} className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                   <Download size={20}/> Download {targetFmt}
                </a>
                
                <button onClick={()=>{setFile(null);setResultUrl(null)}} className="block mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 w-full">Convert Another File</button>
             </div>
          )}
       </div>
    </div>
  );
};
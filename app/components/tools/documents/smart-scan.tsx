"use client";
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import { Upload, Download, Plus, Layers, X, FileText, Loader2 } from 'lucide-react';

export const SmartScan = () => {
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => { inputRef.current?.click(); };
  
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImgs = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImgs]);
    }
  };

  const createPDF = () => {
    if (images.length === 0) return;
    setProcessing(true);
    const pdf = new jsPDF();
    images.forEach((imgUrl, index) => {
      const img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        const width = pdf.internal.pageSize.getWidth();
        const height = (img.height * width) / img.width;
        if (index > 0) pdf.addPage();
        pdf.addImage(img, 'JPEG', 0, 0, width, height);
        if (index === images.length - 1) {
          pdf.save('scanned-doc.pdf');
          setProcessing(false);
        }
      };
    });
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col p-4">
       <input type="file" multiple accept="image/*" ref={inputRef} onChange={handleUpload} className="hidden" />
       <div className="flex justify-between items-center mb-6">
          <div><h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Layers size={24} className="text-indigo-600"/> Smart Scan</h2><p className="text-sm text-slate-500">Convert images to Multi-Page PDF</p></div>
          <div className="flex gap-2">
             <button onClick={triggerUpload} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"><Plus size={14}/> Add Pages</button>
             {images.length > 0 && <button onClick={createPDF} disabled={processing} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-indigo-700">{processing ? <Loader2 className="animate-spin" size={14}/> : <Download size={14}/>} {processing ? "Generating..." : "Download PDF"}</button>}
          </div>
       </div>
       {images.length === 0 ? (
          <div className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400">
             <button onClick={triggerUpload} className="flex flex-col items-center group"><div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Upload size={40}/></div><p className="font-bold text-slate-700 dark:text-slate-200">Click to Upload Images</p><p className="text-xs mt-2">JPG, PNG supported</p></button>
          </div>
       ) : (
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 content-start">
             {images.map((src, i) => (
                <div key={i} className="relative group aspect-[3/4] bg-white shadow-sm border rounded-xl overflow-hidden">
                   <img src={src} className="w-full h-full object-cover" />
                   <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                </div>
             ))}
          </div>
       )}
    </div>
  );
};

"use client";
import React, { useState } from 'react';
import { ScanLine, Upload, X, Download, FileText, Plus } from 'lucide-react';
import jsPDF from 'jspdf';

export const SmartScan = () => {
  const [images, setImages] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleUpload = (e: any) => {
    if (e.target.files) {
       const urls = Array.from(e.target.files).map((f: any) => URL.createObjectURL(f));
       setImages([...images, ...urls]);
    }
  };

  const createPDF = () => {
    setProcessing(true);
    const pdf = new jsPDF();
    images.forEach((img, i) => {
       if (i > 0) pdf.addPage();
       const width = pdf.internal.pageSize.getWidth();
       const height = pdf.internal.pageSize.getHeight();
       pdf.addImage(img, 'JPEG', 0, 0, width, height);
    });
    pdf.save('Scanned_Doc.pdf');
    setProcessing(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 h-[calc(100vh-80px)] flex flex-col">
       <div className="flex justify-between items-center mb-8 p-6 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><ScanLine className="text-teal-600"/> Smart Scan</h1>
            <p className="text-xs text-slate-500 mt-1">Convert multiple images into a single PDF document.</p>
          </div>
          <div className="flex gap-3">
             <label className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors">
                <Plus size={16}/> Add Pages
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload}/>
             </label>
             <button onClick={createPDF} disabled={images.length===0} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
                {processing ? "Generating..." : <><Download size={16}/> Save as PDF</>}
             </button>
          </div>
       </div>
       
       <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 overflow-y-auto custom-scrollbar">
          {images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <Upload size={48} className="mb-4 opacity-50"/>
               <h3 className="font-bold text-lg">No Images Selected</h3>
               <p className="text-sm">Upload photos to start building your PDF</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {images.map((src, i) => (
                  <div key={i} className="aspect-[3/4] bg-white dark:bg-slate-800 rounded-xl relative group overflow-hidden border shadow-sm hover:shadow-lg transition-all">
                     <img src={src} className="w-full h-full object-cover"/>
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={()=>setImages(images.filter((_,x)=>x!==i))} className="bg-rose-500 text-white p-2 rounded-full hover:scale-110 transition-transform"><X size={16}/></button>
                     </div>
                     <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded font-bold backdrop-blur-sm">Page {i+1}</div>
                  </div>
               ))}
            </div>
          )}
       </div>
    </div>
  );
};
"use client";
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Upload, Scissors, CheckCircle, FileText } from 'lucide-react';

export const PdfSplitter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      const arrayBuffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      setPageCount(pdf.getPageCount());
      setSelectedPages([]);
    }
  };

  const togglePage = (i: number) => {
    if (selectedPages.includes(i)) setSelectedPages(selectedPages.filter(p => p !== i));
    else setSelectedPages([...selectedPages, i]);
  };

  const extractPages = async () => {
    if (!file || selectedPages.length === 0) return;
    setProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      const indices = selectedPages.sort((a, b) => a - b).map(i => i - 1); // 0-indexed
      const copied = await newPdf.copyPages(srcPdf, indices);
      copied.forEach(p => newPdf.addPage(p));
      const pdfBytes = await newPdf.save();
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `extracted-pages.pdf`;
      link.click();
    } catch(e) { alert("Error splitting PDF"); } 
    finally { setProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
       {!file ? (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-16 text-center">
             <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" id="pdf-upload" />
             <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6"><Scissors size={40}/></div>
                <h2 className="text-2xl font-bold mb-2">Split PDF</h2>
                <p className="text-slate-500">Upload a PDF to select pages.</p>
             </label>
          </div>
       ) : (
          <div>
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Select Pages to Extract ({selectedPages.length})</h3>
                <div className="flex gap-2">
                   <button onClick={() => setFile(null)} className="text-slate-500 font-bold text-xs px-4 py-2 hover:bg-slate-100 rounded-lg">Cancel</button>
                   <button onClick={extractPages} disabled={selectedPages.length === 0} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-xs disabled:opacity-50">
                      {processing ? "Extracting..." : "Download Selected"}
                   </button>
                </div>
             </div>
             
             <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {Array.from({ length: pageCount }).map((_, i) => {
                   const pageNum = i + 1;
                   const isSelected = selectedPages.includes(pageNum);
                   return (
                      <div 
                        key={i} 
                        onClick={() => togglePage(pageNum)}
                        className={`aspect-[3/4] rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}
                      >
                         <div className="text-center">
                            <FileText size={24} className={isSelected ? 'text-indigo-600' : 'text-slate-300'} />
                            <span className="block mt-2 font-bold text-xs">Page {pageNum}</span>
                            {isSelected && <CheckCircle size={16} className="mx-auto mt-1"/>}
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>
       )}
    </div>
  );
};

"use client";
import React, { useState } from 'react';
import { Scissors, Upload, Download, FileText, CheckCircle, Loader2, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { MAX_PDF_FILE_SIZE } from '@/app/lib/constants';

export const PdfSplitter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<number>(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files?.[0]) return;
    
    const uploadedFile = e.target.files[0];
    
    // Validate file type
    if (uploadedFile.type !== 'application/pdf') {
      showToast('Please upload a PDF file', 'error');
      return;
    }
    
    // Validate file size (50MB limit)
    if (uploadedFile.size > MAX_PDF_FILE_SIZE) {
      showToast('File exceeds 50MB size limit', 'error');
      return;
    }
    
    setFile(uploadedFile);
    setSelected([]);
    
    // Get actual page count
    try {
      const pdfBytes = await uploadedFile.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      setPages(pdf.getPageCount());
    } catch (error) {
      const message = getErrorMessage(error);
      showToast(message || 'Failed to load PDF. It may be corrupted.', 'error');
      setFile(null);
    }
  };

  const togglePage = (i: number) => {
     if(selected.includes(i)) setSelected(selected.filter(x => x !== i));
     else setSelected([...selected, i]);
  };

  const downloadSplit = async () => {
    if (!file || selected.length === 0) {
      showToast('Please select at least one page', 'error');
      return;
    }
    
    setProcessing(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();
      
      // Add selected pages (convert from 1-based to 0-based)
      const pagesToAdd = selected.map(pageNum => pageNum - 1).sort((a, b) => a - b);
      
      for (const pageIndex of pagesToAdd) {
        if (pageIndex >= 0 && pageIndex < sourcePdf.getPageCount()) {
          const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageIndex]);
          newPdf.addPage(copiedPage);
        }
      }
      
      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `split_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`Extracted ${selected.length} page(s) successfully`, 'success');
    } catch (error) {
      const message = getErrorMessage(error);
      showToast(message || 'Failed to split PDF. Please try again.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 h-[80vh] flex flex-col">
       {showWarning && (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-xl max-w-md shadow-xl">
             <div className="flex justify-between items-start mb-4">
               <h3 className="font-bold text-lg text-slate-900 dark:text-white">PDF Splitter</h3>
               <button onClick={() => setShowWarning(false)} className="text-slate-400 hover:text-slate-600">
                 <X size={20}/>
               </button>
             </div>
             <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
               This tool allows you to extract specific pages from a PDF file. Select the pages you want to extract and download them as a new PDF.
             </p>
             <button 
               onClick={() => setShowWarning(false)} 
               className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg font-bold text-sm"
             >
               Got It
             </button>
           </div>
         </div>
       )}
       
       <div className="text-center mb-8">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2"><Scissors className="text-rose-500"/> PDF Splitter</h1>
          <p className="text-slate-500">Select pages to extract.</p>
       </div>
       
       {!file ? (
          <label className="flex-1 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
             <Upload size={48} className="text-slate-400 mb-4"/>
             <span className="font-bold text-slate-700">Upload PDF</span>
             <input type="file" accept=".pdf" className="hidden" onChange={handleUpload}/>
          </label>
       ) : (
          <div className="flex-1 flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <span className="font-bold">{file.name}</span>
                <button onClick={()=>setFile(null)} className="text-xs text-rose-500 hover:underline">Remove</button>
             </div>
             <div className="flex-1 overflow-y-auto grid grid-cols-3 md:grid-cols-5 gap-4 p-4 bg-slate-50 rounded-2xl border">
                {Array.from({length: pages}).map((_, i) => (
                   <div key={i} onClick={()=>togglePage(i+1)} className={`aspect-[3/4] rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selected.includes(i+1)?'border-teal-500 bg-teal-50':'border-slate-200 bg-white hover:border-teal-200'}`}>
                      <div className="text-center">
                         <FileText size={24} className={`mx-auto mb-2 ${selected.includes(i+1)?'text-teal-600':'text-slate-300'}`}/>
                         <p className="text-xs font-bold text-slate-500">Page {i+1}</p>
                         {selected.includes(i+1) && <CheckCircle size={16} className="text-teal-500 mx-auto mt-2"/>}
                      </div>
                   </div>
                ))}
             </div>
             <button onClick={downloadSplit} disabled={selected.length===0 || processing} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 transition-colors">
                {processing ? "Splitting..." : `Download ${selected.length} Pages`}
             </button>
          </div>
       )}
    </div>
  );
};
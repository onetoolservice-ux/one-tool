"use client";

import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, Layers, X, ArrowDown, ArrowUp, Download, Loader2 } from "lucide-react";

export default function PdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type === "application/pdf");
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const moveFile = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === files.length - 1)) return;
    const newFiles = [...files];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newFiles[index], newFiles[swapIndex]] = [newFiles[swapIndex], newFiles[index]];
    setFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (files.length < 2) return alert("Please upload at least 2 PDF files.");
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `merged_ots_${Date.now()}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to merge. Files might be corrupted or password protected.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Layers className="text-rose-500" /> PDF Merger
        </h1>
        <p className="text-slate-500 text-sm mt-1">Drag and drop files to reorder.</p>
      </div>

      <div 
        className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer bg-white"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" multiple accept="application/pdf" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <Upload size={20} />
        </div>
        <p className="font-medium text-slate-700">Click to Upload PDFs</p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-1 rounded">{idx + 1}</span>
                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveFile(idx, 'up')} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ArrowUp size={16}/></button>
                <button onClick={() => moveFile(idx, 'down')} disabled={idx === files.length - 1} className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ArrowDown size={16}/></button>
                <button onClick={() => removeFile(idx)} className="p-1.5 text-slate-400 hover:text-rose-600"><X size={16}/></button>
              </div>
            </div>
          ))}
          <div className="pt-4 flex justify-end">
            <button 
              onClick={mergePDFs} 
              disabled={isProcessing || files.length < 2}
              className="flex items-center gap-2 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
              {isProcessing ? "Merging..." : "Merge PDFs"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

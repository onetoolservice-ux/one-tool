"use client";

import React, { useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, FileText, X, ArrowDown, ArrowUp, Download, Loader2, Layers } from "lucide-react";

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

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
      // FIX: Cast pdfBytes to 'any' to satisfy strict TypeScript checks
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `merged_ots_${Date.now()}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to merge. Some PDFs might be password protected or corrupted.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mb-4 shadow-sm">
          <Layers size={28} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Merge PDF Files</h1>
        <p className="text-slate-500 mt-2 max-w-lg mx-auto">
          Combine multiple PDFs into one unified document. Processing happens entirely in your browser for maximum privacy.
        </p>
      </div>

      <div 
        className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:bg-slate-50 hover:border-[rgb(117,163,163)] transition-all cursor-pointer bg-white group"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          multiple 
          accept="application/pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
          <Upload size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-700">Drop PDF files here</h3>
        <p className="text-slate-400 text-sm mt-1">or click to browse from your computer</p>
      </div>

      {files.length > 0 && (
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">{files.length}</span>
              Files Selected
            </h3>
            <button onClick={() => setFiles([])} className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline">Clear All</button>
          </div>
          
          <div className="space-y-2">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={() => moveFile(idx, 'up')} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"><ArrowUp size={16}/></button>
                  <button onClick={() => moveFile(idx, 'down')} disabled={idx === files.length - 1} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:hover:bg-transparent"><ArrowDown size={16}/></button>
                  <div className="w-px h-4 bg-slate-200 mx-1"></div>
                  <button onClick={() => removeFile(idx)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"><X size={16}/></button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={mergePDFs} 
              disabled={isProcessing || files.length < 2}
              className="flex items-center gap-2 px-8 py-3 bg-[rgb(117,163,163)] hover:opacity-90 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              {isProcessing ? "Merging PDFs..." : "Merge & Download"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

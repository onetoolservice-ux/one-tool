"use client";
import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, FileText, Download, X } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function PdfMerge() {
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const remove = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const merge = async () => {
    if (files.length < 2) return showToast("Select at least 2 PDFs", "error");
    try {
      const mergedPdf = await PDFDocument.create(); 
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "onetool-merged.pdf";
      link.click();
      showToast("PDFs Merged Successfully!", "success");
    } catch (err) {
      showToast("Failed to merge PDFs", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">PDF Merger</h1>
        <p className="text-slate-500">Combine multiple PDF documents into one.</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-6">
         <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
            <Upload size={40} className="mx-auto text-slate-400 mb-3" />
            <span className="font-bold text-slate-600 dark:text-slate-300">Click to Select PDFs</span>
            <input type="file" accept=".pdf" multiple onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
         </div>
         {files.length > 0 && (
             <div className="space-y-2">
                {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded text-red-600"><FileText size={18}/></div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.name}</span>
                        </div>
                        <button onClick={() => remove(i)} className="text-slate-400 hover:text-rose-500"><X size={18}/></button>
                    </div>
                ))}
             </div>
         )}
         <Button onClick={merge} disabled={files.length < 2} className="w-full py-3"><Download size={18} className="mr-2"/> Merge & Download</Button>
      </div>
    </div>
  );
}

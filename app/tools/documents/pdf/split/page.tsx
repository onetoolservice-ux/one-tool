"use client";
import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, Download, FileText, X } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function PdfSplit() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitRange, setSplitRange] = useState("1");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const buffer = await f.arrayBuffer();
      const pdf = await PDFDocument.load(buffer);
      setPageCount(pdf.getPageCount());
    }
  };

  const split = async () => {
    if (!file) return;
    try {
        const buffer = await file.arrayBuffer();
        const srcDoc = await PDFDocument.load(buffer);
        const newDoc = await PDFDocument.create();
        
        const pagesToKeep = splitRange.split(',').map(s => parseInt(s.trim()) - 1).filter(n => n >= 0 && n < pageCount);
        
        if(pagesToKeep.length === 0) return showToast("Invalid Page Range", "error");

        const copied = await newDoc.copyPages(srcDoc, pagesToKeep);
        copied.forEach(p => newDoc.addPage(p));

        const pdfBytes = await newDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `split-${file.name}`;
        a.click();
        showToast("PDF Split Successfully!", "success");
    } catch(e) {
        showToast("Error splitting PDF", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
       <div className="text-center"><h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">PDF Splitter</h1><p className="text-slate-500">Extract specific pages from a PDF.</p></div>

       <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
          {!file ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 text-center relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <Upload size={40} className="mx-auto text-slate-400 mb-2"/>
                <span className="font-bold text-slate-600 dark:text-slate-300">Upload PDF</span>
                <input type="file" accept=".pdf" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer"/>
            </div>
          ) : (
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 text-red-600 rounded"><FileText size={20}/></div>
                        <div><div className="font-bold text-sm text-slate-800 dark:text-slate-200">{file.name}</div><div className="text-xs text-slate-500">{pageCount} Pages</div></div>
                    </div>
                    <button onClick={()=>setFile(null)} className="text-slate-400 hover:text-rose-500"><X size={20}/></button>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Pages to Extract (e.g. 1, 3, 5)</label>
                    <input value={splitRange} onChange={e=>setSplitRange(e.target.value)} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-900"/>
                </div>

                <Button onClick={split} className="w-full py-3"><Download size={18} className="mr-2"/> Download Pages</Button>
            </div>
          )}
       </div>
    </div>
  );
}

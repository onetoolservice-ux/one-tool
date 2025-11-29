"use client";
import React, { useState } from "react";
import { ScanLine, Upload, FileText, X, Plus } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartScan() {
  const [images, setImages] = useState<string[]>([]);

  const handleUpload = (e: any) => {
    const newFiles = Array.from(e.target.files).map((f: any) => "Page " + (images.length + 1));
    setImages([...images, ...newFiles]);
    showToast("Pages Added");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-600 text-white  "><ScanLine size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Scan</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Images to PDF</p></div>
        </div>
        <button onClick={()=>{showToast("PDF Downloaded")}} disabled={images.length===0} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition shadow-lg shadow-slate-200/50 dark:shadow-none disabled:opacity-50"><FileText size={14}/> Export PDF</button>
      </div>
      
      <div className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            
            {/* Add Button */}
            <label className="aspect-[3/4] border-2 border-dashed border-line rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition text-muted/70 hover:text-orange-600 dark:text-orange-400 bg-surface dark:bg-slate-800 dark:bg-surface shadow-lg shadow-slate-200/50 dark:shadow-none hover: ">
                <div className="p-3 bg-background dark:bg-[#0f172a] dark:bg-[#020617] rounded-full mb-3 group-hover:bg-orange-100 transition"><Plus size={24}/></div>
                <span className="text-xs font-bold uppercase tracking-wide tracking-wide">Add Page</span>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleUpload} />
            </label>

            {/* Pages */}
            {images.map((img, i) => (
                <div key={i} className="aspect-[3/4] bg-surface dark:bg-slate-800 dark:bg-surface rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border p-3 relative group hover:  transition">
                    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 font-bold text-xl select-none border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
                        {i+1}
                    </div>
                    <button onClick={()=>setImages(images.filter((_,x)=>x!==i))} className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg shadow-slate-200/50 dark:shadow-none hover:scale-110"><X size={12}/></button>
                    <div className="absolute bottom-4 left-0 w-full text-center text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted opacity-0 group-hover:opacity-100 transition">Page {i+1}</div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

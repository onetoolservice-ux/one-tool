"use client";
import React, { useState } from "react";
import { Image as ImageIcon, Upload, Download, Sliders } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartCompress() {
  const [file, setFile] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white  "><ImageIcon size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Compress</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Image Optimizer</p></div>
        </div>
        <button onClick={()=>{showToast("Image Saved")}} disabled={!file} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-lg shadow-slate-200/50 dark:shadow-none disabled:opacity-50"><Download size={14}/> Save Image</button>
      </div>

      <div className="flex-1 p-8 overflow-auto flex flex-col items-center justify-center">
        {!file ? (
            <label className="w-full max-w-2xl border-2 border-dashed border-line rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition group bg-surface dark:bg-slate-800 dark:bg-surface">
                <div className="p-5 bg-indigo-50 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none mb-4 group-hover:scale-110 transition"><Upload size={32} className="text-indigo-500"/></div>
                <h3 className="text-xl font-bold text-main dark:text-slate-300">Upload Image</h3>
                <p className="text-muted/70 mt-2 text-sm">JPG, PNG, WEBP supported</p>
                <input type="file" accept="image/*" className="hidden" onChange={(e:any)=>setFile(e.target.files[0]?.name)} />
            </label>
        ) : (
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col items-center">
                    <div className="w-full aspect-video bg-slate-100 rounded-xl mb-4 flex items-center justify-center text-muted/70 font-bold border-2 border-transparent">Original</div>
                    <div className="text-sm font-bold text-main dark:text-slate-300">Size: 2.4 MB</div>
                </div>
                <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col items-center ring-2 ring-indigo-100">
                    <div className="w-full aspect-video bg-background dark:bg-[#0f172a] dark:bg-[#020617] rounded-xl mb-4 flex items-center justify-center text-indigo-500 font-bold border-2 border-dashed border-indigo-200">Compressed</div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">New Size: ~{(2.4 * (quality/100)).toFixed(1)} MB <span className="text-xs bg-indigo-100 px-2 py-0.5 rounded-full ml-2">-{100-quality}%</span></div>
                </div>
                
                <div className="md:col-span-2 bg-surface dark:bg-slate-800 dark:bg-surface p-8 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase flex items-center gap-2"><Sliders size={14}/> Compression Level</label>
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">{quality}%</span>
                    </div>
                    <input type="range" min="10" max="95" value={quality} onChange={e=>setQuality(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"/>
                    <div className="flex justify-between text-xs font-bold text-muted/70 mt-2 uppercase">
                        <span>Max Compression</span>
                        <span>Best Quality</span>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

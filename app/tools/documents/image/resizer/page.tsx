"use client";
import React, { useState } from "react";
import { Crop, Upload, Download, Lock, Unlock } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartResize() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [locked, setLocked] = useState(true);
  const [file, setFile] = useState<string|null>(null);

  const handleRatio = (dim: 'w'|'h', val: number) => {
    if(dim === 'w') {
        setWidth(val);
        if(locked) setHeight(Math.round(val * 0.5625));
    } else {
        setHeight(val);
        if(locked) setWidth(Math.round(val / 0.5625));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-600 text-white  "><Crop size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Resize</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Pixel Editor</p></div>
        </div>
        <button onClick={()=>{showToast("Image Saved")}} disabled={!file} className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg text-xs font-bold hover:bg-pink-700 transition shadow-lg shadow-slate-200/50 dark:shadow-none disabled:opacity-50"><Download size={14}/> Save</button>
      </div>

      <div className="flex-1 p-8 overflow-auto flex flex-col items-center justify-center">
        {!file ? (
             <label className="w-full max-w-2xl border-2 border-dashed border-line rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition group bg-surface dark:bg-slate-800 dark:bg-surface">
                <div className="p-5 bg-pink-50 rounded-full shadow-lg shadow-slate-200/50 dark:shadow-none mb-4 group-hover:scale-110 transition"><Upload size={32} className="text-pink-500"/></div>
                <h3 className="text-xl font-bold text-main dark:text-slate-300">Upload Image</h3>
                <input type="file" className="hidden" onChange={(e:any)=>setFile(e.target.files[0]?.name)} />
            </label>
        ) : (
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-8 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none w-full max-w-lg space-y-8">
                <div className="text-center pb-4 border-b">
                    <div className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">{file}</div>
                    <div className="text-xs font-bold text-muted/70 uppercase mt-1">Current: 3840 x 2160</div>
                </div>
                
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase mb-1 block">Width (px)</label>
                        <input type="number" value={width} onChange={e=>handleRatio('w', Number(e.target.value))} className="w-full p-4 border rounded-xl font-bold text-2xl text-main dark:text-slate-300 outline-none focus:border-pink-500 text-center" />
                    </div>
                    <button onClick={()=>setLocked(!locked)} className={`p-4 mb-[2px] rounded-xl transition ${locked ? 'bg-pink-50 text-pink-600' : 'bg-background dark:bg-[#0f172a] dark:bg-[#020617] text-muted/70'}`}>
                        {locked ? <Lock size={20}/> : <Unlock size={20}/>}
                    </button>
                    <div className="flex-1">
                        <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase mb-1 block">Height (px)</label>
                        <input type="number" value={height} onChange={e=>handleRatio('h', Number(e.target.value))} className="w-full p-4 border rounded-xl font-bold text-2xl text-main dark:text-slate-300 outline-none focus:border-pink-500 text-center" />
                    </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                    {[0.25, 0.5, 0.75, 1].map(scale => (
                        <button key={scale} onClick={()=>{setWidth(3840*scale); setHeight(2160*scale)}} className="py-2 bg-background dark:bg-[#0f172a] dark:bg-[#020617] rounded-lg text-xs font-bold text-muted dark:text-muted/70 dark:text-muted/70 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 border border-transparent transition">
                            {scale*100}%
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

"use client";
import React, { useState, useRef } from "react";
import { Upload, Download, Minimize } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function ImageCompressor() {
  const [original, setOriginal] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.6);
  const [ogSize, setOgSize] = useState(0);
  const [newSize, setNewSize] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOgSize(file.size);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setOriginal(ev.target?.result as string);
        compress(ev.target?.result as string, quality);
      };
      reader.readAsDataURL(file);
    }
  };

  const compress = (src: string, q: number) => {
    const img = new Image();
    img.onload = () => {
       const canvas = canvasRef.current;
       if(canvas) {
           canvas.width = img.width;
           canvas.height = img.height;
           const ctx = canvas.getContext("2d");
           ctx?.drawImage(img, 0, 0);
           const dataUrl = canvas.toDataURL("image/jpeg", q);
           setCompressed(dataUrl);
           // Estimate size
           const head = "data:image/jpeg;base64,";
           const size = Math.round((dataUrl.length - head.length)*3/4);
           setNewSize(size);
       }
    };
    img.src = src;
  };

  const handleQuality = (q: number) => {
      setQuality(q);
      if(original) compress(original, q);
  };

  const formatSize = (b: number) => (b / 1024).toFixed(1) + " KB";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Image Compressor</h1>
        <p className="text-slate-500">Reduce file size directly in browser.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
         {!original ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl h-64 flex flex-col items-center justify-center relative cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
               <Upload size={48} className="text-slate-300 mb-4"/>
               <span className="font-bold text-slate-600 dark:text-slate-400">Upload Image</span>
               <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0" />
            </div>
         ) : (
            <div className="space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                     <div className="text-xs font-bold uppercase text-slate-400 mb-2">Original</div>
                     <img src={original} className="max-h-64 mx-auto rounded-lg" alt="Og"/>
                     <div className="text-center mt-2 font-mono font-bold">{formatSize(ogSize)}</div>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                     <div className="text-xs font-bold uppercase text-indigo-400 mb-2">Compressed</div>
                     {compressed && <img src={compressed} className="max-h-64 mx-auto rounded-lg" alt="Comp"/>}
                     <div className="text-center mt-2 font-mono font-bold text-indigo-600">{formatSize(newSize)} <span className="text-xs text-emerald-500">({Math.round((1 - newSize/ogSize)*100)}% Saved)</span></div>
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Quality: {Math.round(quality*100)}%</label>
                  <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={e=>handleQuality(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg accent-indigo-600 cursor-pointer"/>
               </div>

               <div className="flex gap-4">
                  <Button onClick={() => { const a = document.createElement('a'); a.href=compressed!; a.download="compressed.jpg"; a.click(); }} className="flex-1 py-3"><Download size={18} className="mr-2"/> Download</Button>
                  <Button variant="secondary" onClick={() => setOriginal(null)}>Start Over</Button>
               </div>
            </div>
         )}
         <canvas ref={canvasRef} className="hidden"/>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useRef } from "react";
import { Upload, Download, Image as ImageIcon } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function ImageResizer() {
  const [image, setImage] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [ogRatio, setOgRatio] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(event.target?.result as string);
          setWidth(img.width);
          setHeight(img.height);
          setOgRatio(img.width / img.height);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleWidthChange = (w: number) => {
    setWidth(w);
    if (lockRatio) setHeight(Math.round(w / ogRatio));
  };

  const handleHeightChange = (h: number) => {
    setHeight(h);
    if (lockRatio) setWidth(Math.round(h * ogRatio));
  };

  const download = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = new Image();
    if (image && canvas && ctx) {
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const link = document.createElement("a");
        link.download = "resized-image.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = image;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">Image Resizer</h1>
        <p className="text-muted">Resize images pixel-perfectly directly in your browser.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
          {!image ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl h-64 flex flex-col items-center justify-center text-muted hover:bg-slate-50 dark:hover:bg-slate-700/50 transition relative">
              <Upload size={32} className="mb-2" />
              <span className="text-sm font-bold">Click to Upload Image</span>
              <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          ) : (
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted uppercase">Width (px)</label>
                    <input type="number" value={width} onChange={e => handleWidthChange(Number(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted uppercase">Height (px)</label>
                    <input type="number" value={height} onChange={e => handleHeightChange(Number(e.target.value))} className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono" />
                  </div>
               </div>
               <label className="flex items-center gap-2 text-sm font-medium text-muted dark:text-muted">
                  <input type="checkbox" checked={lockRatio} onChange={e => setLockRatio(e.target.checked)} className="rounded text-indigo-600" />
                  Lock Aspect Ratio
               </label>
               <Button onClick={download} className="w-full py-3"><Download size={18} className="mr-2"/> Download Resized</Button>
               <button onClick={() => setImage(null)} className="w-full text-xs text-rose-500 hover:underline">Remove Image</button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 overflow-hidden relative min-h-[300px]">
           {image ? (
             // eslint-disable-next-line @next/next/no-img-element
             <img src={image} alt="Preview" className="max-w-full max-h-[400px] rounded shadow-lg" />
           ) : (
             <div className="text-slate-300 flex flex-col items-center"><ImageIcon size={48} /><span className="text-sm mt-2">Preview</span></div>
           )}
           <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}

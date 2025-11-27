"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, Download, Upload, RefreshCw, Lock, Unlock } from "lucide-react";

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      const url = URL.createObjectURL(f);
      setSrc(url);
      
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
        setAspectRatio(img.width / img.height);
      };
      img.src = url;
    }
  };

  const handleDimensionChange = (type: 'w' | 'h', val: number) => {
    if (type === 'w') {
      setWidth(val);
      if (lockAspect) setHeight(Math.round(val / aspectRatio));
    } else {
      setHeight(val);
      if (lockAspect) setWidth(Math.round(val * aspectRatio));
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = new Image();
    if (ctx && src && canvas) {
      img.onload = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        const link = document.createElement('a');
        link.download = `resized_${width}x${height}_${file?.name}`;
        link.href = canvas.toDataURL(file?.type);
        link.click();
      };
      img.src = src;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <ImageIcon className="text-pink-500" size={32} /> Image Resizer
        </h1>
        <p className="text-slate-500 mt-2">Change image dimensions securely in your browser.</p>
      </div>

      {!src ? (
        <label className="border-2 border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
          <Upload size={32} className="text-slate-400 mb-4"/>
          <span className="font-semibold text-slate-700">Upload Image</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center justify-center bg-slate-50 rounded-xl overflow-hidden p-4 border border-slate-100">
            <img src={src} alt="Preview" className="max-h-64 object-contain" />
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Width (px)</label>
                <input type="number" value={width} onChange={(e) => handleDimensionChange('w', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Height (px)</label>
                <input type="number" value={height} onChange={(e) => handleDimensionChange('h', Number(e.target.value))} className="w-full mt-1 p-2 border rounded-lg" />
              </div>
            </div>

            <button onClick={() => setLockAspect(!lockAspect)} className={`flex items-center gap-2 text-sm font-medium ${lockAspect ? 'text-teal-600' : 'text-slate-400'}`}>
              {lockAspect ? <Lock size={16}/> : <Unlock size={16}/>} Maintain Aspect Ratio
            </button>

            <button onClick={handleDownload} className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <Download size={18}/> Download Resized
            </button>
            
            <button onClick={() => { setSrc(null); setFile(null); }} className="w-full py-2 text-slate-500 hover:text-slate-800 text-sm">Upload Different Image</button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}

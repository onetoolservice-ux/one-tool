"use client";
import React, { useState } from "react";
import { RefreshCw, Upload, Download, Image as ImageIcon } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("image/jpeg");
  const [converted, setConverted] = useState<string | null>(null);

  const handleUpload = (e: any) => { if(e.target.files?.[0]) setFile(e.target.files[0]); };
  const convert = () => {
    if(!file) return;
    const img = new Image();
    img.onload = () => {
      const cvs = document.createElement('canvas');
      cvs.width = img.width; cvs.height = img.height;
      const ctx = cvs.getContext('2d');
      if(ctx) {
        if(format === 'image/jpeg') { ctx.fillStyle = '#FFF'; ctx.fillRect(0,0,cvs.width,cvs.height); }
        ctx.drawImage(img, 0, 0);
        setConverted(cvs.toDataURL(format, 0.9));
      }
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-64px)] flex flex-col">
      <ToolHeader title="Image Converter" desc="WebP • PNG • JPG" icon={<RefreshCw size={20}/>} />
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        <div className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer">
          {!file ? (
            <>
              <Upload className="text-slate-400 mb-3" size={32}/>
              <span className="text-sm font-bold text-slate-600">Click to Upload</span>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} accept="image/*"/>
            </>
          ) : (
            <img src={URL.createObjectURL(file)} className="max-h-full max-w-full object-contain p-4"/>
          )}
        </div>
        <div className="flex flex-col justify-center space-y-6 p-4">
           <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Convert To</label>
             <select value={format} onChange={e=>setFormat(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer">
               <option value="image/jpeg">JPG</option>
               <option value="image/png">PNG</option>
               <option value="image/webp">WEBP</option>
             </select>
           </div>
           <button onClick={convert} disabled={!file} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md">Convert Now</button>
           {converted && (
             <a href={converted} download="converted-image" className="w-full py-3 border-2 border-emerald-500 text-emerald-700 bg-emerald-50 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all">
               <Download size={18}/> Download
             </a>
           )}
        </div>
      </div>
    </div>
  );
}

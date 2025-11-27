"use client";

import React, { useState } from "react";
import imageCompression from 'browser-image-compression';
import { Image as ImageIcon, Upload, Download, RefreshCw, CheckCircle2 } from "lucide-react";

export default function ImageCompressor() {
  const [original, setOriginal] = useState<File | null>(null);
  const [compressed, setCompressed] = useState<Blob | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setOriginal(file);
    setIsCompressing(true);
    
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      const output = await imageCompression(file, options);
      setCompressed(output);
    } catch (error) {
      console.log(error);
      alert("Compression failed.");
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-3">
          <ImageIcon className="text-blue-500" size={32} /> Image Compressor
        </h1>
        <p className="text-slate-500 mt-2">Optimize JPG/PNG images locally. Fast & Private.</p>
      </div>

      {!original ? (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-16 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer bg-white relative">
          <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload size={28} />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">Upload an Image</h3>
          <p className="text-sm text-slate-400 mt-1">Supports JPG, PNG, WEBP</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Original */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="mb-4 flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-slate-400">Original</span>
              <span className="text-sm font-medium text-slate-700">{(original.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
              <img src={URL.createObjectURL(original)} alt="Original" className="max-h-full max-w-full object-contain" />
            </div>
          </div>

          {/* Compressed */}
          <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
            {isCompressing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                <RefreshCw className="animate-spin text-blue-500 mb-2" size={32} />
                <span className="text-sm font-medium text-slate-600">Compressing...</span>
              </div>
            ) : compressed && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14}/> Compressed</span>
                  <span className="text-sm font-bold text-emerald-600">{(compressed.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden mb-6">
                  <img src={URL.createObjectURL(compressed)} alt="Compressed" className="max-h-full max-w-full object-contain" />
                </div>
                <a 
                  href={URL.createObjectURL(compressed)} 
                  download={`compressed_${original.name}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  <Download size={18} /> Download
                </a>
                <div className="mt-3 text-center">
                   <span className="text-xs text-emerald-600 font-medium">
                     Saved {Math.round((1 - compressed.size / original.size) * 100)}% 
                   </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      {original && (
        <div className="text-center mt-8">
          <button onClick={() => { setOriginal(null); setCompressed(null); }} className="text-sm text-slate-500 hover:text-slate-800 underline">Compress another image</button>
        </div>
      )}
    </div>
  );
}

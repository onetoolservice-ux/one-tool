"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, RefreshCw, Download, Upload, X, CheckCircle } from "lucide-react";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("image/jpeg");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setConvertedUrl(null);
    }
  };

  const convertImage = () => {
    if (!file) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // If converting to JPG, fill background white (transparent PNGs turn black otherwise)
          if (format === "image/jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL(format, 0.9);
          setConvertedUrl(dataUrl);
          setIsProcessing(false);
        }
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const getExt = () => format.split("/")[1];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
          <RefreshCw size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Image Converter</h1>
        <p className="text-slate-500 mt-2">Convert WEBP to PNG, PNG to JPG, and more. Zero server upload.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
          {!file ? (
            <label className="cursor-pointer flex flex-col items-center group">
              <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                <Upload size={32} />
              </div>
              <span className="font-semibold text-slate-700">Upload Image</span>
              <span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP supported</span>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
          ) : (
            <div className="w-full h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase text-slate-400">Original</span>
                <button onClick={() => { setFile(null); setConvertedUrl(null); }} className="p-1 hover:bg-slate-100 rounded-full"><X size={16}/></button>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden p-4 border border-slate-100 relative">
                <img src={URL.createObjectURL(file)} alt="Original" className="max-h-60 object-contain" />
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Convert To</label>
                  <div className="flex gap-2">
                    {["jpeg", "png", "webp"].map(f => (
                      <button 
                        key={f} 
                        onClick={() => setFormat(`image/${f}`)}
                        className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition-all ${format === `image/${f}` ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={convertImage} disabled={isProcessing} className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all">
                  {isProcessing ? "Converting..." : "Convert Now"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Output Card */}
        <div className={`bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px] transition-all ${convertedUrl ? 'opacity-100' : 'opacity-50 grayscale'}`}>
          {!convertedUrl ? (
            <div className="text-center text-slate-300">
              <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
              <p>Converted image will appear here</p>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase text-emerald-500 flex items-center gap-1"><CheckCircle size={14}/> Ready</span>
              </div>
              <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 rounded-xl flex items-center justify-center overflow-hidden p-4 border border-slate-100">
                <img src={convertedUrl} alt="Converted" className="max-h-60 object-contain" />
              </div>
              <div className="mt-6">
                <a href={convertedUrl} download={`converted.${getExt()}`} className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200">
                  <Download size={18} /> Download {getExt().toUpperCase()}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Link as LinkIcon, Palette } from 'lucide-react';

export const QrGenerator = () => {
  const [text, setText] = useState("https://onetool.com");
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");

  const downloadQr = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "onetool-qr.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto items-center animate-in fade-in duration-500">
       
       {/* Controls */}
       <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Content / URL</label>
             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <LinkIcon size={18} className="text-slate-400" />
                <input 
                  type="text" 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  className="bg-transparent outline-none w-full text-sm font-medium"
                  placeholder="Enter text or URL..."
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Palette size={12}/> Color</label>
                <div className="flex items-center gap-2 h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2">
                   <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                   <span className="text-xs font-mono">{color}</span>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Palette size={12}/> Background</label>
                <div className="flex items-center gap-2 h-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2">
                   <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                   <span className="text-xs font-mono">{bgColor}</span>
                </div>
             </div>
          </div>
       </div>

       {/* Preview Card */}
       <div className="flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
             <QRCodeSVG 
               id="qr-code-svg"
               value={text} 
               size={200} 
               fgColor={color} 
               bgColor={bgColor} 
               level="H"
               includeMargin={true}
             />
          </div>
          <button onClick={downloadQr} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
             <Download size={16} /> Download PNG
          </button>
       </div>

    </div>
  );
};

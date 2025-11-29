"use client";

import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, QrCode, Link as LinkIcon, Share2 } from "lucide-react";

export default function QrGenerator() {
  const [text, setText] = useState("https://onetool.vercel.app");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      a.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 dark:text-indigo-400 rounded-xl mb-4"><QrCode size={32} /></div>
        <h1 className="text-3xl font-bold text-main dark:text-slate-100 dark:text-slate-200">QR Code Generator</h1>
        <p className="text-muted dark:text-muted dark:text-muted dark:text-muted mt-2">Create custom QR codes for links, text, or Wi-Fi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-8 rounded-3xl border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none space-y-6">
          <div>
            <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase mb-2 block">Content</label>
            <div className="relative">
              <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/70"/>
              <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-background dark:bg-[#0f172a] dark:bg-[#020617] border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 rounded-xl focus:border-indigo-500 outline-none transition-all" placeholder="Enter URL or text..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase mb-2 block">Foreground</label>
              <div className="flex items-center gap-2 p-2 border rounded-xl">
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent dark:text-white" />
                <span className="text-xs font-mono text-muted dark:text-muted/70 dark:text-muted/70">{fgColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase mb-2 block">Background</label>
              <div className="flex items-center gap-2 p-2 border rounded-xl">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent dark:text-white" />
                <span className="text-xs font-mono text-muted dark:text-muted/70 dark:text-muted/70">{bgColor}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase mb-2 block">Size: {size}px</label>
            <input type="range" min="128" max="512" step="32" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-indigo-600 cursor-pointer" />
          </div>
        </div>

        {/* Preview */}
        <div className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-8 rounded-3xl border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 flex flex-col items-center justify-center">
          <div ref={qrRef} className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl shadow-lg">
            <QRCodeCanvas value={text} size={size} fgColor={fgColor} bgColor={bgColor} level={"H"} />
          </div>
          <button onClick={downloadQR} className="mt-8 flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
            <Download size={18} /> Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}

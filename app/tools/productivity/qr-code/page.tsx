"use client";
import React, { useState } from "react";
import QRCode from "react-qr-code";
import Button from "@/app/shared/ui/Button";
import { Download } from "lucide-react";

export default function QRCodeGenerator() {
  const [text, setText] = useState("https://onetool.co");
  const [size, setSize] = useState(256);

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "qr-code.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">QR Code Generator</h1>
        <p className="text-muted">Create and download custom QR codes.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div>
            <label className="block text-sm font-bold text-main dark:text-slate-300 mb-2">Content</label>
            <input value={text} onChange={(e) => setText(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" placeholder="Enter URL or text..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-main dark:text-slate-300 mb-2">Size: {size}px</label>
            <input type="range" min="128" max="512" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>
          <Button onClick={downloadQR} className="w-full py-3"><Download size={18} className="mr-2" /> Download PNG</Button>
        </div>

        <div className="flex items-center justify-center bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="p-4 bg-white rounded-xl shadow-sm border">
            <QRCode id="qr-code-svg" value={text} size={size} className="max-w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

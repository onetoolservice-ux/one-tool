"use client";
import React, { useState } from 'react';
import { QrCode, Download } from 'lucide-react';

export const QrGenerator = () => {
  const [text, setText] = useState("https://onetool.com");
  const [color, setColor] = useState("000000");
  const [bgColor, setBgColor] = useState("ffffff");
  
  // Normalize color to hex format (remove #, ensure 6 chars)
  const normalizeColor = (col: string): string => {
    let normalized = col.replace('#', '').toUpperCase();
    // Validate hex color (6 hex digits)
    if (!/^[0-9A-F]{6}$/i.test(normalized)) {
      return '000000'; // Default to black if invalid
    }
    return normalized;
  };
  
  // Robust API for customization
  const normalizedColor = normalizeColor(color);
  const normalizedBgColor = normalizeColor(bgColor);
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}&color=${normalizedColor}&bgcolor=${normalizedBgColor}&margin=10`;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-12 p-8 items-center bg-white dark:bg-[#0B1120]">
       
       {/* CONTROLS */}
       <div className="w-full lg:w-1/2 space-y-6">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3"><QrCode className="text-blue-600"/> QR Studio</h1>
             <p className="text-slate-500">Create custom QR codes for links, text, or Wi-Fi.</p>
          </div>

          <div className="space-y-4">
             <div>
                <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Target Content</label>
                <input 
                  value={text} 
                  onChange={e=>setText(e.target.value)} 
                  className="w-full p-4 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-xl font-medium outline-none text-slate-900 dark:text-white transition-all"
                  placeholder="https://... or plain text"
               />
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Foreground</label>
                   <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"/>
                      <span className="font-mono text-xs text-slate-500">{color}</span>
                   </div>
                </div>
                <div>
                   <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Background</label>
                   <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <input type="color" value={`#${normalizedBgColor}`} onChange={e=>setBgColor(e.target.value.replace('#',''))} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"/>
                      <span className="font-mono text-xs text-slate-500">#{normalizedBgColor}</span>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* PREVIEW */}
       <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/50 rounded-[3rem] p-12 border border-slate-200 dark:border-slate-800">
          <div className="bg-white p-4 rounded-3xl shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-300">
             <img src={url} alt="QR Code" className="w-64 h-64 mix-blend-multiply"/>
          </div>
          <div className="flex gap-3">
             <a href={url} download="qrcode.png" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-all">
                <Download size={18}/> Download PNG
             </a>
          </div>
       </div>
    </div>
  );
};

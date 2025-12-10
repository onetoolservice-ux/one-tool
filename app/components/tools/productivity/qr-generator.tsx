"use client";
import React, { useState } from 'react';
import { QrCode, Download } from 'lucide-react';

export const QrGenerator = () => {
  const [text, setText] = useState("https://onetool.com");
  const [color, setColor] = useState("000000");
  const [bgColor, setBgColor] = useState("ffffff");
  
  // Robust API for customization
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}&color=${color.replace('#','')}&bgcolor=${bgColor.replace('#','')}&margin=10`;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col lg:flex-row gap-12 p-8 items-center bg-white dark:bg-[#0B1120]">
       
       {/* CONTROLS */}
       <div className="w-full lg:w-1/2 space-y-8">
          <div>
             <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 flex items-center gap-3"><QrCode className="text-blue-600"/> QR Studio</h1>
             <p className="text-slate-500">Create custom QR codes for links, text, or Wi-Fi.</p>
          </div>

          <div className="space-y-4">
             <div>
                <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Target Content</label>
                <input 
                  value={text} 
                  onChange={e=>setText(e.target.value)} 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:ring-2 ring-blue-500/20 text-slate-900 dark:text-white"
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
                      <input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"/>
                      <span className="font-mono text-xs text-slate-500">{bgColor}</span>
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
             <a href={url} download="qrcode.png" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:-translate-y-1 transition-transform">
                <Download size={18}/> Download PNG
             </a>
          </div>
       </div>
    </div>
  );
};

"use client";
import React, { useState } from 'react';
import { Copy, Pipette } from 'lucide-react';

export const ColorStudio = () => {
  const [color, setColor] = useState("#0d9488");
  return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-white dark:bg-slate-900 border rounded-3xl shadow-xl">
       <div className="h-48 rounded-2xl mb-8 shadow-inner transition-colors duration-300" style={{backgroundColor: color}}></div>
       <div className="flex gap-6 items-center">
          <div className="relative">
             <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-20 h-20 rounded-2xl cursor-pointer border-none opacity-0 absolute inset-0"/>
             <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 pointer-events-none"><Pipette size={24} className="text-slate-400"/></div>
          </div>
          <div className="flex-1 space-y-3">
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">HEX</label><div className="flex gap-2"><input value={color} readOnly className="flex-1 p-2 bg-slate-50 rounded font-mono"/><button className="p-2 bg-slate-100 rounded hover:bg-teal-100"><Copy size={16}/></button></div></div>
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">RGB</label><input value={`rgb(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)})`} readOnly className="w-full p-2 bg-slate-50 rounded font-mono text-xs"/></div>
          </div>
       </div>
    </div>
  );
};
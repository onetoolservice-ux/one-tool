"use client";
import React, { useState } from 'react';
import { Pipette, Copy } from 'lucide-react';

export const ColorStudio = () => {
  const [color, setColor] = useState("#0d9488");
  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-white dark:bg-slate-900 rounded-3xl border shadow-sm">
       <div className="h-40 rounded-2xl mb-8 shadow-inner" style={{backgroundColor: color}}></div>
       <div className="flex gap-4 items-center">
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-16 h-16 rounded-xl cursor-pointer"/>
          <div className="flex-1">
             <label className="text-xs font-bold text-slate-500 uppercase">HEX Code</label>
             <div className="flex gap-2 mt-1">
                <input value={color} readOnly className="flex-1 p-3 font-mono font-bold bg-slate-50 dark:bg-slate-950 rounded-xl border-none"/>
                <button onClick={() => navigator.clipboard.writeText(color)} className="p-3 bg-slate-100 hover:bg-teal-50 rounded-xl"><Copy size={20}/></button>
             </div>
          </div>
       </div>
    </div>
  );
};
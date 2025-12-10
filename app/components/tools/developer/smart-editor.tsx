"use client";
import React, { useState } from 'react';
import { Play, Copy, Trash2 } from 'lucide-react';

export const SmartEditor = ({ toolId }: { toolId: string }) => {
  const [code, setCode] = useState("");
  
  const format = () => {
    try {
      if (toolId.includes('json')) setCode(JSON.stringify(JSON.parse(code), null, 2));
      else if (toolId.includes('sql')) setCode(code.replace(/\s+/g, ' ').replace(/SELECT|FROM|WHERE/gi, '\n$&'));
    } catch(e) { alert("Invalid Syntax"); }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-4">
       <div className="flex justify-between mb-4">
          <h2 className="font-bold capitalize">{toolId.replace('-', ' ')}</h2>
          <div className="flex gap-2">
             <button onClick={()=>setCode('')} className="p-2 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={16}/></button>
             <button onClick={format} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs flex items-center gap-2"><Play size={14}/> Run/Format</button>
          </div>
       </div>
       <textarea value={code} onChange={e=>setCode(e.target.value)} className="flex-1 p-4 font-mono text-sm bg-slate-900 text-slate-100 rounded-xl resize-none outline-none" placeholder="Paste code here..."/>
    </div>
  );
};
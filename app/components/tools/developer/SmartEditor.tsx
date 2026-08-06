"use client";
import React, { useState } from 'react';
import { Play, Copy, Trash2 } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

export const SmartEditor = ({ toolId }: { toolId: string }) => {
  const [code, setCode] = useState("");
  
  const format = () => {
    // Validate empty input
    if (!code || !code.trim()) {
      showToast('Please enter code to format', 'error');
      return;
    }

    try {
      if (toolId.includes('json')) {
        const trimmed = code.trim();
        if (!trimmed) {
          showToast('Please enter JSON code to format', 'error');
          return;
        }
        const parsed = JSON.parse(trimmed);
        setCode(JSON.stringify(parsed, null, 2));
        showToast('JSON formatted successfully', 'success');
      } else if (toolId.includes('sql')) {
        const trimmed = code.trim();
        if (!trimmed) {
          showToast('Please enter SQL code to format', 'error');
          return;
        }
        const formatted = trimmed.replace(/\s+/g, ' ').replace(/SELECT|FROM|WHERE/gi, '\n$&');
        setCode(formatted);
        showToast('SQL formatted successfully', 'success');
      } else {
        showToast('Formatting not supported for this tool', 'error');
      }
    } catch(e) {
      const message = e instanceof Error ? e.message : 'Invalid syntax';
      showToast(message || 'Invalid syntax. Please check your code.', 'error');
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col p-4">
       <div className="flex justify-between mb-4">
          <h2 className="font-bold capitalize">{toolId.replace('-', ' ')}</h2>
          <div className="flex gap-2">
             <button onClick={()=>setCode('')} className="p-2 text-rose-500 hover:bg-rose-50 rounded"><Trash2 size={16}/></button>
             <button onClick={format} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-colors"><Play size={14}/> Run/Format</button>
          </div>
       </div>
       <textarea value={code} onChange={e=>setCode(e.target.value)} className="flex-1 p-4 font-mono text-sm bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 text-slate-900 dark:text-slate-100 rounded-xl resize-none outline-none transition-all" placeholder="Paste code here..."/>
    </div>
  );
};
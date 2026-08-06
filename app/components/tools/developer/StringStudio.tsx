"use client";
import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';

export const StringStudio = ({ toolId }: { toolId: string }) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encode");

  const process = () => {
    try {
      if (toolId === 'smart-uuid') {
        setOutput(crypto.randomUUID());
        showToast('UUID generated successfully', 'success');
        return;
      }
      
      if (toolId === 'smart-base64') {
        if (mode === 'encode') {
          if (!input.trim()) {
            showToast('Please enter text to encode', 'error');
            return;
          }
          setOutput(btoa(input));
          showToast('Base64 encoded successfully', 'success');
        } else {
          if (!input.trim()) {
            showToast('Please enter Base64 string to decode', 'error');
            return;
          }
          setOutput(atob(input));
          showToast('Base64 decoded successfully', 'success');
        }
        return;
      }
      
      if (toolId === 'smart-url') {
        if (mode === 'encode') {
          if (!input.trim()) {
            showToast('Please enter URL to encode', 'error');
            return;
          }
          setOutput(encodeURIComponent(input));
          showToast('URL encoded successfully', 'success');
        } else {
          if (!input.trim()) {
            showToast('Please enter encoded URL to decode', 'error');
            return;
          }
          setOutput(decodeURIComponent(input));
          showToast('URL decoded successfully', 'success');
        }
        return;
      }
      
      if (toolId === 'smart-html-entities') {
        if (mode === 'encode') {
          if (!input.trim()) {
            showToast('Please enter text to encode', 'error');
            return;
          }
          setOutput(input.replace(/[<>&"']/g, c => '&#' + c.charCodeAt(0) + ';'));
          showToast('HTML entities encoded successfully', 'success');
        } else {
          if (!input.trim()) {
            showToast('Please enter HTML entities to decode', 'error');
            return;
          }
          // Fix decode logic: decode numeric HTML entities
          const decoded = input.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
          setOutput(decoded);
          showToast('HTML entities decoded successfully', 'success');
        }
        return;
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid input';
      setOutput("Error: " + errorMessage);
      showToast(errorMessage || 'Processing failed. Please check your input.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[80vh] flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold capitalize">{toolId.replace('smart-', '').replace('-', ' ')} Tool</h2>
          {toolId !== 'smart-uuid' && (
            <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
               <button onClick={()=>setMode('encode')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${mode==='encode'?'bg-white shadow text-blue-600':'text-slate-500'}`}>Encode</button>
               <button onClick={()=>setMode('decode')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-colors ${mode==='decode'?'bg-white shadow text-blue-600':'text-slate-500'}`}>Decode</button>
            </div>
          )}
       </div>
       <div className="flex-1 grid grid-cols-2 gap-6">
          <textarea value={input} onChange={e=>setInput(e.target.value)} className="p-4 border border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-800 resize-none outline-none transition-all" placeholder={toolId==='smart-uuid'?'Click Generate':'Input...'}/>
          <div className="relative"><textarea value={output} readOnly className="w-full h-full p-4 border border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-800 resize-none outline-none transition-all" placeholder="Output..."/><button onClick={()=>navigator.clipboard.writeText(output)} className="absolute top-2 right-2 p-2 bg-slate-100 rounded-lg hover:bg-blue-50 text-blue-600"><Copy size={16}/></button></div>
       </div>
       <button onClick={process} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">Process</button>
    </div>
  );
};
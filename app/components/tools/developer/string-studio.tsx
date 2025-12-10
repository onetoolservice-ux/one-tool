"use client";
import React, { useState } from 'react';
import { Copy, RefreshCw } from 'lucide-react';

export const StringStudio = ({ toolId }: { toolId: string }) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState("encode");

  const process = () => {
    try {
      if (toolId === 'smart-uuid') { setOutput(crypto.randomUUID()); return; }
      if (toolId === 'smart-base64') setOutput(mode === 'encode' ? btoa(input) : atob(input));
      if (toolId === 'smart-url') setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
      if (toolId === 'smart-html-entities') setOutput(mode === 'encode' ? input.replace(/[<>&"']/g, c=>'&#'+c.charCodeAt(0)+';') : input);
    } catch (e) { setOutput("Error: Invalid Input"); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 h-[80vh] flex flex-col">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold capitalize">{toolId.replace('smart-', '').replace('-', ' ')} Tool</h2>
          {toolId !== 'smart-uuid' && (
            <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
               <button onClick={()=>setMode('encode')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${mode==='encode'?'bg-white shadow text-blue-600':'text-slate-500'}`}>Encode</button>
               <button onClick={()=>setMode('decode')} className={`px-4 py-1.5 rounded-md text-xs font-bold ${mode==='decode'?'bg-white shadow text-blue-600':'text-slate-500'}`}>Decode</button>
            </div>
          )}
       </div>
       <div className="flex-1 grid grid-cols-2 gap-6">
          <textarea value={input} onChange={e=>setInput(e.target.value)} className="p-4 border rounded-xl bg-slate-50 resize-none outline-none" placeholder={toolId==='smart-uuid'?'Click Generate':'Input...'}/>
          <div className="relative"><textarea value={output} readOnly className="w-full h-full p-4 border rounded-xl bg-white resize-none outline-none" placeholder="Output..."/><button onClick={()=>navigator.clipboard.writeText(output)} className="absolute top-2 right-2 p-2 bg-slate-100 rounded-lg hover:bg-blue-50 text-blue-600"><Copy size={16}/></button></div>
       </div>
       <button onClick={process} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Process</button>
    </div>
  );
};
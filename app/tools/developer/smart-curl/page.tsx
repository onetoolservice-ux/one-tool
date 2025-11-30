"use client";
import React, { useState } from "react";
import { Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartCurl() {
  const [url, setUrl] = useState("https://api.example.com/data");
  const [method, setMethod] = useState("GET");
  const [header, setHeader] = useState("Authorization: Bearer token");
  const [body, setBody] = useState('{"key": "value"}');

  const curl = `curl -X ${method} "${url}" \\\n${header.split('\n').map(h => `  -H "${h}"`).join(' \\\n')} ${method !== 'GET' ? `\\\n  -d '${body}'` : ''}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center"><h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">cURL Builder</h1></div>

      <div className="grid md:grid-cols-3 gap-6">
         <div className="md:col-span-1 space-y-4">
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Method</label>
               <select value={method} onChange={e=>setMethod(e.target.value)} className="w-full p-2 bg-white border rounded-lg"><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">URL</label>
               <input value={url} onChange={e=>setUrl(e.target.value)} className="w-full p-2 bg-white border rounded-lg"/>
            </div>
            <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Headers (One per line)</label>
               <textarea value={header} onChange={e=>setHeader(e.target.value)} className="w-full h-24 p-2 bg-white border rounded-lg resize-none"/>
            </div>
            {method !== 'GET' && <div>
               <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Body</label>
               <textarea value={body} onChange={e=>setBody(e.target.value)} className="w-full h-24 p-2 bg-white border rounded-lg resize-none"/>
            </div>}
         </div>

         <div className="md:col-span-2 bg-slate-900 rounded-2xl p-6 relative group">
            <pre className="text-sm font-mono text-green-400 whitespace-pre-wrap">{curl}</pre>
            <Button onClick={() => {navigator.clipboard.writeText(curl); showToast("Copied!");}} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={16} className="mr-2"/> Copy</Button>
         </div>
      </div>
    </div>
  );
}

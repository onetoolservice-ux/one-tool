"use client";
import React, { useState } from 'react';
import { Globe, Play, Plus, Clock, CheckCircle, AlertCircle, Code2 } from 'lucide-react';

export const ApiPlayground = () => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const send = async () => {
    setLoading(true);
    try {
      const start = performance.now();
      const res = await fetch(url, { method });
      const data = await res.json();
      setResponse(data);
      setStatus(res.status);
    } catch (e: any) {
      setResponse({ error: e.message });
      setStatus(500);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] p-6 max-w-6xl mx-auto gap-6">
       <div className="flex gap-0 shadow-lg rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <select value={method} onChange={e=>setMethod(e.target.value)} className={`px-6 font-bold text-white outline-none appearance-none text-center ${method==='GET'?'bg-blue-600':method==='POST'?'bg-emerald-600':method==='DELETE'?'bg-rose-600':'bg-amber-500'}`}>
             <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
          </select>
          <input value={url} onChange={e=>setUrl(e.target.value)} className="flex-1 px-4 py-4 bg-white dark:bg-slate-900 font-mono text-sm outline-none" placeholder="Enter Request URL..."/>
          <button onClick={send} disabled={loading} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 font-bold flex items-center gap-2 hover:opacity-90">{loading ? "..." : <><Play size={16}/> Send</>}</button>
       </div>

       <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col">
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-xs uppercase text-slate-500">Request Body</h3><span className="text-[10px] bg-slate-100 px-2 py-1 rounded">JSON</span></div>
             <textarea className="flex-1 bg-slate-50 dark:bg-black/50 rounded-xl p-4 font-mono text-xs resize-none outline-none" placeholder="{ 'key': 'value' }"/>
          </div>
          <div className="flex-1 bg-slate-950 text-emerald-400 rounded-2xl border border-slate-800 flex flex-col overflow-hidden relative shadow-2xl">
             <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Response</span>
                {status && <span className={`text-xs font-bold px-2 py-0.5 rounded ${status<300?'bg-emerald-900/30 text-emerald-400':'bg-rose-900/30 text-rose-400'}`}>{status} OK</span>}
             </div>
             <pre className="flex-1 p-4 overflow-auto font-mono text-xs">{response ? JSON.stringify(response, null, 2) : "// Response will appear here..."}</pre>
          </div>
       </div>
    </div>
  );
};
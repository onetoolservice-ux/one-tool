"use client";
import React, { useState } from 'react';
import { Play, Plus, Trash2, Globe, AlertCircle, CheckCircle } from 'lucide-react';
import { CodeEditor } from './code-editor';

export const ApiPlayground = () => {
  const [url, setUrl] = useState("https://jsonplaceholder.typicode.com/todos/1");
  const [method, setMethod] = useState("GET");
  const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    setResponse("");
    setStatus(null);
    try {
      const headObj: Record<string, string> = {};
      headers.forEach(h => { if(h.key) headObj[h.key] = h.value });
      
      const options: RequestInit = { method, headers: headObj };
      if (method !== 'GET' && method !== 'HEAD') options.body = body;

      const res = await fetch(url, options);
      setStatus(res.status);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponse("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)] min-h-[600px]">
       {/* LEFT: REQUEST BUILDER */}
       <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Request</h3>
          <div className="flex gap-2">
             <select value={method} onChange={e=>setMethod(e.target.value)} className="bg-slate-100 dark:bg-slate-800 font-bold text-xs rounded-lg px-3 outline-none">
                <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option><option>PATCH</option>
             </select>
             <input type="text" value={url} onChange={e=>setUrl(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none font-mono" placeholder="https://api.example.com/v1/..." />
             <button onClick={sendRequest} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
                <Play size={14}/> Send
             </button>
          </div>

          <div className="space-y-2">
             <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Headers</label>
                <button onClick={()=>setHeaders([...headers, {key:"", value:""}])} className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 hover:underline"><Plus size={10}/> Add</button>
             </div>
             {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                   <input type="text" placeholder="Key" value={h.key} onChange={e=>{const n=[...headers];n[i].key=e.target.value;setHeaders(n)}} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs" />
                   <input type="text" placeholder="Value" value={h.value} onChange={e=>{const n=[...headers];n[i].value=e.target.value;setHeaders(n)}} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2 py-1.5 text-xs" />
                   <button onClick={()=>setHeaders(headers.filter((_,idx)=>idx!==i))} className="text-rose-400 hover:text-rose-600"><Trash2 size={14}/></button>
                </div>
             ))}
          </div>

          {method !== 'GET' && (
             <div className="flex-1 flex flex-col min-h-[200px]">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2">Body (JSON)</label>
                <textarea value={body} onChange={e=>setBody(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 font-mono text-xs outline-none resize-none" placeholder='{"key": "value"}' />
             </div>
          )}
       </div>

       {/* RIGHT: RESPONSE */}
       <div className="flex flex-col bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-black/20">
             <span className="text-xs font-bold uppercase tracking-wide">Response</span>
             {status && (
                <span className={`text-xs font-bold px-2 py-1 rounded ${status < 300 ? 'bg-[#638c80]/20 text-[#638c80]' : 'bg-rose-500/20 text-rose-400'}`}>
                   Status: {status}
                </span>
             )}
          </div>
          <div className="flex-1 relative">
             <CodeEditor language="json" value={response || (loading ? "Loading..." : "// Response will appear here")} onChange={()=>{}} readOnly={true} />
          </div>
       </div>
    </div>
  );
};

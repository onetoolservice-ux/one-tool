"use client";
import React, { useState, useEffect } from 'react';
import { Key, Lock } from 'lucide-react';

export const JwtDebugger = () => {
  const [token, setToken] = useState("");
  const [parts, setParts] = useState<any>({});

  useEffect(() => {
    try {
       const [h, p, s] = token.split('.');
       if(h && p) setParts({ 
          header: JSON.stringify(JSON.parse(atob(h)), null, 2), 
          payload: JSON.stringify(JSON.parse(atob(p)), null, 2),
          sig: s 
       });
    } catch(e) { setParts({}); }
  }, [token]);

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-80px)]">
       <div className="flex flex-col gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm">
             <h2 className="font-bold flex items-center gap-2 mb-2"><Key className="text-rose-500"/> Encoded Token</h2>
             <textarea value={token} onChange={e=>setToken(e.target.value)} className="w-full h-40 p-4 bg-slate-50 dark:bg-black rounded-xl font-mono text-xs break-all text-slate-600 outline-none focus:ring-2 ring-rose-500/20" placeholder="Paste JWT..."/>
          </div>
          <div className="flex-1 bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm">
             <h3 className="font-bold text-slate-500 uppercase text-xs mb-4">Algorithm & Type</h3>
             <div className="space-y-2">
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm font-bold">Type</span><span className="font-mono text-xs">JWT</span></div>
                <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm font-bold">Algorithm</span><span className="font-mono text-xs">HS256</span></div>
             </div>
          </div>
       </div>
       <div className="bg-slate-950 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
          <div className="flex-1 border-b border-slate-800 p-6 overflow-auto">
             <p className="text-xs font-bold text-rose-400 uppercase mb-2">Header</p>
             <pre className="font-mono text-sm text-rose-300">{parts.header || "{}"}</pre>
          </div>
          <div className="flex-[2] border-b border-slate-800 p-6 overflow-auto">
             <p className="text-xs font-bold text-purple-400 uppercase mb-2">Payload</p>
             <pre className="font-mono text-sm text-purple-300">{parts.payload || "{}"}</pre>
          </div>
          <div className="p-6 bg-blue-900/10">
             <p className="text-xs font-bold text-blue-400 uppercase mb-2">Signature</p>
             <pre className="font-mono text-xs text-blue-300 break-all">{parts.sig || "..."}</pre>
          </div>
       </div>
    </div>
  );
};
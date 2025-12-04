"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Key, CheckCircle, AlertCircle } from 'lucide-react';

export const JwtDebugger = () => {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState({});
  const [payload, setPayload] = useState({});
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (!token) return;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error("Invalid Token");
      setHeader(JSON.parse(atob(parts[0])));
      setPayload(JSON.parse(atob(parts[1])));
      setValid(true);
    } catch (e) {
      setValid(false);
      setHeader({});
      setPayload({});
    }
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
       <div className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
             <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Paste JWT Token</label>
             <textarea 
               value={token} 
               onChange={e => setToken(e.target.value)} 
               className="w-full h-64 p-3 text-xs font-mono bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 rounded-lg outline-none resize-none break-all text-indigo-600 dark:text-indigo-400"
               placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
             />
          </div>
          {token && (
             <div className={`p-3 rounded-lg flex items-center gap-2 text-sm font-bold ${valid ? 'bg-[#638c80]/10 text-[#4a6b61]' : 'bg-rose-50 text-rose-600'}`}>
                {valid ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                {valid ? "Valid Format" : "Invalid Format"}
             </div>
          )}
       </div>

       <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
             <div className="bg-slate-50 dark:bg-slate-950 p-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase px-4">Header</div>
             <pre className="p-4 text-sm font-mono text-rose-500 bg-white dark:bg-slate-900 overflow-auto">{JSON.stringify(header, null, 2)}</pre>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
             <div className="bg-slate-50 dark:bg-slate-950 p-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase px-4">Payload</div>
             <pre className="p-4 text-sm font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 overflow-auto">{JSON.stringify(payload, null, 2)}</pre>
          </div>
       </div>
    </div>
  );
};

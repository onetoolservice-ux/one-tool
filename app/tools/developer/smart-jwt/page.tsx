"use client";
import React, { useState, useEffect } from "react";

export default function SmartJWT() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState({});
  const [payload, setPayload] = useState({});
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    if (!token) { setHeader({}); setPayload({}); return; }
    try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error();
        const decode = (str: string) => JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
        setHeader(decode(parts[0]));
        setPayload(decode(parts[1]));
        setIsInvalid(false);
    } catch (e) { setIsInvalid(true); }
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center"><h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">JWT Debugger</h1></div>
      <div className="grid md:grid-cols-2 gap-6 flex-1">
        <textarea value={token} onChange={e => setToken(e.target.value)} className={`flex-1 p-4 rounded-xl border ${isInvalid ? 'border-rose-500' : 'border-slate-200'} bg-white dark:bg-slate-800 resize-none font-mono text-xs outline-none`} placeholder="Paste JWT..." />
        <div className="flex flex-col gap-4">
           <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-auto">
              <div className="text-xs font-bold text-rose-500 uppercase mb-2">Header</div>
              <pre className="text-xs font-mono text-slate-700 dark:text-slate-300">{JSON.stringify(header, null, 2)}</pre>
           </div>
           <div className="flex-[2] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 overflow-auto">
              <div className="text-xs font-bold text-emerald-500 uppercase mb-2">Payload</div>
              <pre className="text-xs font-mono text-slate-700 dark:text-slate-300">{JSON.stringify(payload, null, 2)}</pre>
           </div>
        </div>
      </div>
    </div>
  );
}

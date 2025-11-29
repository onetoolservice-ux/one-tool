"use client";
import React, { useState, useEffect } from "react";
import { Key, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartJWT() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState({});
  const [payload, setPayload] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) { setHeader({}); setPayload({}); setError(""); return; }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error("Invalid Token Format");
      setHeader(JSON.parse(atob(parts[0])));
      setPayload(JSON.parse(atob(parts[1])));
      setError("");
    } catch (e) { setError("Invalid JWT"); }
  }, [token]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-amber-600 text-white"><Key size={22} /></div>
        <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart JWT</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Token Debugger</p></div>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x overflow-hidden">
        <div className="p-6 flex flex-col h-full">
            <textarea value={token} onChange={e=>setToken(e.target.value)} className={`flex-1 p-4 border rounded-xl font-mono text-xs resize-none outline-none focus:ring-2 ${error ? 'border-rose-300 focus:ring-rose-200' : 'border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 focus:ring-amber-200'}`} placeholder="Paste JWT here (eyJ...)" />
            {error && <div className="mt-2 text-rose-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> {error}</div>}
        </div>
        <div className="p-6 overflow-auto bg-background dark:bg-[#0f172a] dark:bg-[#020617] space-y-6">
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Header</h3>
                <pre className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border text-xs font-mono text-main dark:text-slate-300">{JSON.stringify(header, null, 2)}</pre>
            </div>
            <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Payload</h3>
                <pre className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border text-xs font-mono text-main dark:text-slate-300">{JSON.stringify(payload, null, 2)}</pre>
            </div>
        </div>
      </div>
    </div>
  );
}

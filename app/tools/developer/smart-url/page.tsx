"use client";
import React, { useState, useMemo } from "react";
import { Link as LinkIcon } from "lucide-react";

export default function SmartURL() {
  const [url, setUrl] = useState("https://onetool.co/search?q=developer&sort=asc");

  const parsed = useMemo(() => {
    try {
      const u = new URL(url);
      const params: Record<string, string> = {};
      u.searchParams.forEach((v, k) => { params[k] = v; });
      
      return {
        valid: true,
        protocol: u.protocol,
        host: u.hostname,
        path: u.pathname,
        params
      };
    } catch (e) {
      return { valid: false };
    }
  }, [url]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">URL Parser</h1>
        <p className="text-slate-500">Analyze URL parameters and structure.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
         <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Input URL</label>
         <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={url} onChange={e => setUrl(e.target.value)} className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl" />
         </div>
      </div>

      {parsed.valid ? (
        <div className="grid gap-6">
           <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 text-center">
                 <div className="text-xs font-bold text-emerald-600 uppercase">Protocol</div>
                 <div className="font-mono font-bold text-emerald-800 dark:text-emerald-300">{parsed.protocol}</div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                 <div className="text-xs font-bold text-blue-600 uppercase">Host</div>
                 <div className="font-mono font-bold text-blue-800 dark:text-blue-300 truncate">{parsed.host}</div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 text-center">
                 <div className="text-xs font-bold text-amber-600 uppercase">Path</div>
                 <div className="font-mono font-bold text-amber-800 dark:text-amber-300 truncate">{parsed.path}</div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-600 dark:text-slate-300">
                 Query Parameters
              </div>
              {Object.keys(parsed.params || {}).length > 0 ? (
                  <table className="w-full text-sm text-left">
                    <tbody>
                        {Object.entries(parsed.params || {}).map(([k, v]) => (
                            <tr key={k} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <td className="p-4 font-bold text-slate-700 dark:text-slate-300 w-1/3 border-r border-slate-100 dark:border-slate-800">{k}</td>
                                <td className="p-4 font-mono text-indigo-600 dark:text-indigo-400">{v}</td>
                            </tr>
                        ))}
                    </tbody>
                  </table>
              ) : (
                  <div className="p-8 text-center text-slate-400 italic">No parameters found.</div>
              )}
           </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-center font-bold">Invalid URL format</div>
      )}
    </div>
  );
}

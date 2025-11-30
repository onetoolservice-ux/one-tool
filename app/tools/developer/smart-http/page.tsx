"use client";
import React, { useState } from "react";
import { Server, Search } from "lucide-react";

const CODES = [
  { c: 200, t: "OK", d: "Standard response for successful requests." },
  { c: 201, t: "Created", d: "Request fulfilled, new resource created." },
  { c: 204, t: "No Content", d: "Request processed, no content returned." },
  { c: 301, t: "Moved Permanently", d: "Resource has moved to a new URL." },
  { c: 304, t: "Not Modified", d: "Resource not modified since last request." },
  { c: 400, t: "Bad Request", d: "Server cannot process the request." },
  { c: 401, t: "Unauthorized", d: "Authentication is required." },
  { c: 403, t: "Forbidden", d: "Server refuses to authorize request." },
  { c: 404, t: "Not Found", d: "Resource could not be found." },
  { c: 500, t: "Internal Server Error", d: "Generic error message." },
  { c: 502, t: "Bad Gateway", d: "Invalid response from upstream server." },
  { c: 503, t: "Service Unavailable", d: "Server overloaded or down." }
];

export default function SmartHTTP() {
  const [q, setQ] = useState("");
  const filtered = CODES.filter(c => c.c.toString().includes(q) || c.t.toLowerCase().includes(q.toLowerCase()));

  const getColor = (code: number) => {
      if(code < 300) return "bg-emerald-100 text-emerald-700 border-emerald-200";
      if(code < 400) return "bg-blue-100 text-blue-700 border-blue-200";
      if(code < 500) return "bg-orange-100 text-orange-700 border-orange-200";
      return "bg-rose-100 text-rose-700 border-rose-200";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">HTTP Status Codes</h1>
        <p className="text-slate-500">Reference guide for API responses.</p>
      </div>

      <div className="relative max-w-md mx-auto">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
         <input value={q} onChange={e=>setQ(e.target.value)} className="w-full pl-12 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Search code (e.g. 404)..." />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
         {filtered.map(c => (
             <div key={c.c} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                 <div className="flex justify-between items-start mb-2">
                     <span className={`font-black font-mono text-lg px-2 py-1 rounded border ${getColor(c.c)}`}>{c.c}</span>
                 </div>
                 <h3 className="font-bold text-slate-900 dark:text-white mb-1">{c.t}</h3>
                 <p className="text-xs text-slate-500 leading-relaxed">{c.d}</p>
             </div>
         ))}
      </div>
    </div>
  );
}

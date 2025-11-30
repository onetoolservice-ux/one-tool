"use client";
import React, { useState } from "react";
import { Search, Server } from "lucide-react";

const PORTS = [
  { p: 21, s: "FTP", d: "File Transfer Protocol" },
  { p: 22, s: "SSH", d: "Secure Shell" },
  { p: 25, s: "SMTP", d: "Simple Mail Transfer" },
  { p: 53, s: "DNS", d: "Domain Name System" },
  { p: 80, s: "HTTP", d: "Hypertext Transfer Protocol" },
  { p: 443, s: "HTTPS", d: "Secure HTTP" },
  { p: 3000, s: "React/Node", d: "Development Server" },
  { p: 3306, s: "MySQL", d: "MySQL Database" },
  { p: 5432, s: "PostgreSQL", d: "Postgres Database" },
  { p: 6379, s: "Redis", d: "Redis Data Store" },
  { p: 8080, s: "HTTP Alt", d: "Alternative HTTP" },
  { p: 27017, s: "MongoDB", d: "Mongo Database" }
];

export default function SmartPorts() {
  const [q, setQ] = useState("");
  const filtered = PORTS.filter(p => p.p.toString().includes(q) || p.s.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Common Ports</h1>
        <p className="text-slate-500">Reference for standard server ports.</p>
      </div>

      <div className="relative max-w-md mx-auto">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
         <input value={q} onChange={e=>setQ(e.target.value)} className="w-full pl-12 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Search port or service..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filtered.map(p => (
             <div key={p.p} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:border-indigo-500 transition-colors">
                 <div className="h-12 w-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-lg">{p.p}</div>
                 <div>
                    <div className="font-bold text-slate-900 dark:text-white">{p.s}</div>
                    <div className="text-xs text-slate-500">{p.d}</div>
                 </div>
             </div>
         ))}
      </div>
    </div>
  );
}

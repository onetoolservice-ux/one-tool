"use client";
import React, { useState } from "react";
import { Server, Search } from "lucide-react";
import Toast from "@/app/shared/Toast";

const PORTS = [
  { p: 21, s: "FTP", d: "File Transfer" }, { p: 22, s: "SSH", d: "Secure Shell" },
  { p: 25, s: "SMTP", d: "Email Sending" }, { p: 53, s: "DNS", d: "Domain Name" },
  { p: 80, s: "HTTP", d: "Web" }, { p: 443, s: "HTTPS", d: "Secure Web" },
  { p: 3306, s: "MySQL", d: "Database" }, { p: 5432, s: "PostgreSQL", d: "Database" },
  { p: 27017, s: "MongoDB", d: "NoSQL DB" }, { p: 6379, s: "Redis", d: "Cache" }
];

export default function SmartPorts() {
  const [q, setQ] = useState("");
  const filtered = PORTS.filter(p => p.s.toLowerCase().includes(q.toLowerCase()) || p.p.toString().includes(q));

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-600 text-white"><Server size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Ports</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Common Reference</p></div>
        </div>
        <div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-muted/70"/><input value={q} onChange={e=>setQ(e.target.value)} className="pl-9 pr-3 py-2 border rounded-lg text-sm outline-none" placeholder="Search port..."/></div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        {filtered.map(p => (
            <div key={p.p} className="bg-surface dark:bg-slate-800 dark:bg-surface p-4 rounded-xl border hover:border-slate-400 transition flex items-center justify-between">
                <div><div className="font-bold text-main dark:text-slate-100 dark:text-slate-200">{p.s}</div><div className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">{p.d}</div></div>
                <div className="text-xl font-mono font-bold text-slate-300">:{p.p}</div>
            </div>
        ))}
      </div>
    </div>
  );
}

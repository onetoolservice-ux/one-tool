"use client";
import React, { useState } from "react";
import { Activity } from "lucide-react";
import Toast from "@/app/shared/Toast";

const CODES = [
  { c: 200, t: "OK", d: "Success" }, { c: 201, t: "Created", d: "Resource created" },
  { c: 301, t: "Moved Permanently", d: "Redirect" }, { c: 400, t: "Bad Request", d: "Client Error" },
  { c: 401, t: "Unauthorized", d: "Auth required" }, { c: 403, t: "Forbidden", d: "Access denied" },
  { c: 404, t: "Not Found", d: "Missing resource" }, { c: 500, t: "Server Error", d: "Crash" },
  { c: 502, t: "Bad Gateway", d: "Upstream error" }, { c: 503, t: "Unavailable", d: "Overloaded" }
];

export default function SmartHTTP() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-emerald-500 text-white"><Activity size={22} /></div>
        <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart HTTP</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Status Codes</p></div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-auto">
        {CODES.map(c => (
            <div key={c.c} className={`p-4 rounded-xl border border-l-4 shadow-lg shadow-slate-200/50 dark:shadow-none bg-surface dark:bg-slate-800 dark:bg-surface ${c.c>=500?'border-l-rose-500':c.c>=400?'border-l-orange-500':c.c>=300?'border-l-blue-500':'border-l-emerald-500'}`}>
                <div className="text-2xl font-bold text-main dark:text-slate-100 dark:text-slate-200 mb-1">{c.c}</div>
                <div className="font-bold text-sm text-muted dark:text-muted/70 dark:text-muted/70">{c.t}</div>
                <div className="text-xs text-muted/70 mt-1">{c.d}</div>
            </div>
        ))}
      </div>
    </div>
  );
}

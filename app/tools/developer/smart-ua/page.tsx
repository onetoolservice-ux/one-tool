"use client";
import React, { useState, useEffect } from "react";
import { Smartphone, Monitor, Globe } from "lucide-react";

export default function SmartUA() {
  const [ua, setUa] = useState("");

  useEffect(() => {
    setUa(navigator.userAgent);
  }, []);

  const browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : "Safari";
  const os = ua.includes("Win") ? "Windows" : ua.includes("Mac") ? "macOS" : "Linux";
  const device = ua.includes("Mobile") ? "Mobile" : "Desktop";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">User Agent Info</h1>
        <p className="text-muted">Analyze your browser string.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
         <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-8 font-mono text-sm text-muted dark:text-muted break-all">
            {ua}
         </div>

         <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                <Globe className="mx-auto mb-3 text-blue-500" size={32} />
                <div className="font-bold text-blue-700 dark:text-blue-300">{browser}</div>
                <div className="text-xs text-blue-400 uppercase font-bold">Browser</div>
            </div>
            <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                <Monitor className="mx-auto mb-3 text-emerald-500" size={32} />
                <div className="font-bold text-emerald-700 dark:text-emerald-300">{os}</div>
                <div className="text-xs text-emerald-400 uppercase font-bold">OS</div>
            </div>
            <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-center">
                <Smartphone className="mx-auto mb-3 text-rose-500" size={32} />
                <div className="font-bold text-rose-700 dark:text-rose-300">{device}</div>
                <div className="text-xs text-rose-400 uppercase font-bold">Platform</div>
            </div>
         </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Box } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartCSS() {
  const [shadow, setShadow] = useState(10);
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-10 items-center justify-center gap-8">
        <div className="w-40 h-40 bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl" style={{boxShadow: `0 10px ${shadow}px rgba(0,0,0,0.1)`}}></div>
        <input type="range" min="0" max="100" value={shadow} onChange={e=>setShadow(Number(e.target.value))} className="w-64" />
        <code className="bg-surface dark:bg-slate-800 dark:bg-surface p-3 rounded border text-muted dark:text-muted/70 dark:text-muted/70 text-sm">box-shadow: 0 10px {shadow}px rgba(0,0,0,0.1);</code>
    </div>
  );
}

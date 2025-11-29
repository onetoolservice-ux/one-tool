"use client";
import React, { useState } from "react";
import { Shield } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartChmod() {
  const [val, setVal] = useState(777);
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-10 items-center justify-center">
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-10 rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border text-center">
            <div className="text-6xl font-mono font-bold text-green-600 mb-4">{val}</div>
            <input type="range" min="0" max="777" value={val} onChange={e=>setVal(Number(e.target.value))} className="w-64" />
            <div className="mt-4 text-muted dark:text-muted dark:text-muted dark:text-muted font-mono">rwxrwxrwx</div>
        </div>
    </div>
  );
}

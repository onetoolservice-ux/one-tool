"use client";
import React, { useState } from "react";
import { Command, ArrowRight } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartCurl() {
  const [input, setInput] = useState("curl https://api.example.com/data");
  const [output, setOutput] = useState("");

  const convert = () => {
    const url = input.match(/https?:\/\/[^\s]+/)?.[0] || "";
    setOutput(`fetch("${url}", {\n  method: "GET"\n});`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-700 text-white"><Command size={22} /></div>
          <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Curl</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Curl to Fetch</p></div>
        </div>
        <button
          aria-label="View Tool"
          onClick={convert}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2"
        >
          <ArrowRight size={14} /> Convert
        </button>      </div>
      <div className="flex-1 grid grid-cols-2 divide-x">
        <textarea value={input} onChange={e => setInput(e.target.value)} className="p-6 resize-none outline-none font-mono text-sm" />
        <textarea readOnly value={output} className="p-6 resize-none outline-none font-mono text-sm bg-[#1e293b] text-emerald-400" />
      </div>
    </div>
  );
}

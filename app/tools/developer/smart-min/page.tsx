"use client";
import React, { useState } from "react";
import Button from "@/app/shared/ui/Button";

export default function SmartMinifier() {
  const [code, setCode] = useState("");
  const [minified, setMinified] = useState("");

  const minify = () => {
    // Simple regex minifier for JS/CSS
    let res = code
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([:;{}])\s*/g, '$1') // Remove space around symbols
        .replace(/;}/g, '}') // Remove last semicolon
        .trim();
    setMinified(res);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center"><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Code Minifier</h1><p className="text-slate-500">Simple JS/CSS compression.</p></div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
         <textarea value={code} onChange={e=>setCode(e.target.value)} className="p-4 rounded-xl border bg-white dark:bg-slate-800 resize-none font-mono text-xs" placeholder="Paste Source Code..."/>
         <textarea readOnly value={minified} className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/50 resize-none font-mono text-xs text-indigo-600 dark:text-indigo-400" placeholder="Minified output..."/>
      </div>
      <div className="text-center"><Button onClick={minify} className="w-48">Minify</Button></div>
    </div>
  );
}

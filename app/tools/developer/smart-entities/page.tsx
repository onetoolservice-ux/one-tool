"use client";
import React, { useState } from "react";
import { Code, ArrowRightLeft } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartEntities() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const encode = () => {
    const textarea = document.createElement("textarea");
    textarea.innerText = input;
    setOutput(textarea.innerHTML);
  };

  const decode = () => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = input;
    setOutput(textarea.value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">HTML Entities</h1>
        <p className="text-slate-500">Encode or Decode special characters.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 flex-1">
         <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Input</label>
            <textarea value={input} onChange={e=>setInput(e.target.value)} className="flex-1 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Type text here..."/>
         </div>
         <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Output</label>
            <textarea readOnly value={output} className="flex-1 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none font-mono text-sm text-blue-600 dark:text-blue-400" placeholder="Result appears here..."/>
         </div>
      </div>

      <div className="flex justify-center gap-4">
         <Button onClick={encode} className="w-32">Encode</Button>
         <div className="text-slate-300 flex items-center"><ArrowRightLeft/></div>
         <Button onClick={decode} variant="secondary" className="w-32">Decode</Button>
      </div>
    </div>
  );
}

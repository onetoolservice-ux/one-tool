"use client";
import React, { useState } from "react";
import Button from "@/app/shared/ui/Button";

export default function JsonToTs() {
  const [json, setJson] = useState("");
  const [ts, setTs] = useState("");

  const convert = () => {
    try {
        const obj = JSON.parse(json);
        const generateType = (o: any, name = "Root") => {
            let out = `interface ${name} {\n`;
            for (const key in o) {
                out += `  ${key}: ${typeof o[key]};\n`;
            }
            out += "}";
            return out;
        };
        setTs(generateType(obj));
    } catch(e) { setTs("Invalid JSON"); }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center"><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">JSON to TS</h1></div>
      <div className="grid grid-cols-2 gap-4 flex-1">
         <textarea value={json} onChange={e=>setJson(e.target.value)} className="p-4 rounded-xl border bg-white dark:bg-slate-800 resize-none font-mono text-xs" placeholder='{"id": 1}'/>
         <textarea readOnly value={ts} className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/50 resize-none font-mono text-xs text-blue-600 dark:text-blue-400" placeholder="interface Root..."/>
      </div>
      <div className="text-center"><Button onClick={convert} className="w-48">Convert</Button></div>
    </div>
  );
}

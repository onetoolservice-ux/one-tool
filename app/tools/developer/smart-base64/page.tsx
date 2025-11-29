"use client";
import React, { useState } from "react";
import { Binary, Copy, FileText, Type } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartBase64() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [tab, setTab] = useState<"text" | "file">("text");

  const handleText = (val: string) => {
    setInput(val);
    try { setOutput(mode === "encode" ? btoa(val) : atob(val)); } catch { setOutput("Invalid Input"); }
  };

  const handleFile = (e: any) => {
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = (r) => setOutput(r.target?.result as string);
    reader.readAsDataURL(f);
    showToast("File Encoded");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white"><Binary size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Base64</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Encoder / Decoder</p></div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setMode("encode")} className={`px-4 py-1.5 text-xs font-bold rounded ${mode==="encode"?"bg-surface dark:bg-slate-800 dark:bg-surface shadow text-indigo-600 dark:text-indigo-400":"text-muted dark:text-muted dark:text-muted dark:text-muted"}`}>Encode</button>
            <button onClick={() => setMode("decode")} className={`px-4 py-1.5 text-xs font-bold rounded ${mode==="decode"?"bg-surface dark:bg-slate-800 dark:bg-surface shadow text-indigo-600 dark:text-indigo-400":"text-muted dark:text-muted dark:text-muted dark:text-muted"}`}>Decode</button>
        </div>
      </div>
      
      <div className="flex px-6 py-2 gap-4 border-b bg-surface dark:bg-slate-800 dark:bg-surface">
        <button onClick={()=>setTab("text")} className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 ${tab==="text"?"border-indigo-600 text-indigo-600 dark:text-indigo-400":"border-transparent text-muted dark:text-muted dark:text-muted dark:text-muted"}`}><Type size={16}/> Text</button>
        <button onClick={()=>setTab("file")} className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 ${tab==="file"?"border-indigo-600 text-indigo-600 dark:text-indigo-400":"border-transparent text-muted dark:text-muted dark:text-muted dark:text-muted"}`}><FileText size={16}/> File (Image/PDF)</button>
      </div>

      <div className="flex-1 grid grid-cols-2 divide-x">
        <div className="p-6">
            {tab === "text" ? (
                <textarea value={input} onChange={e=>handleText(e.target.value)} className="w-full h-full resize-none outline-none font-mono text-sm bg-transparent dark:text-white" placeholder={mode==="encode"?"Text to encode...":"Base64 to decode..."} />
            ) : (
                <div className="h-full flex items-center justify-center">
                    <label className="p-10 border-2 border-dashed rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition text-center">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Click to Upload File</span>
                        <input type="file" className="hidden" onChange={handleFile} />
                    </label>
                </div>
            )}
        </div>
        <div className="bg-background dark:bg-[#0f172a] dark:bg-[#020617] p-6 font-mono text-sm break-all relative overflow-auto">
            {output}
            {output && <button onClick={() => {navigator.clipboard.writeText(output); showToast("Copied");}} className="absolute top-4 right-4 p-2 bg-surface dark:bg-slate-800 dark:bg-surface rounded shadow text-muted dark:text-muted dark:text-muted dark:text-muted hover:text-indigo-600 dark:text-indigo-400"><Copy size={16}/></button>}
        </div>
      </div>
    </div>
  );
}

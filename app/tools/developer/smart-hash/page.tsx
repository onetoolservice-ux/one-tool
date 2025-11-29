"use client";
import React, { useState, useEffect } from "react";
import { Fingerprint, FileText, Upload } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartHash() {
  const [input, setInput] = useState("Hello World");
  const [hashes, setHashes] = useState({ sha1: "", sha256: "" });
  const [mode, setMode] = useState<"text" | "file">("text");

  useEffect(() => {
    if(mode === "text") {
        digestText(input);
    }
  }, [input, mode]);

  async function digestText(msg: string) {
    const data = new TextEncoder().encode(msg);
    compute(data);
  }

  async function compute(data: BufferSource) {
    const [h1, h2] = await Promise.all([
        crypto.subtle.digest("SHA-1", data),
        crypto.subtle.digest("SHA-256", data)
    ]);
    const toHex = (b: ArrayBuffer) => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
    setHashes({ sha1: toHex(h1), sha256: toHex(h2) });
  }

  const handleFile = async (e: any) => {
    const f = e.target.files[0];
    if(f) {
        const buf = await f.arrayBuffer();
        compute(buf);
        showToast("File Hashed");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-600 text-white"><Fingerprint size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Hash</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Crypto Generator</p></div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => setMode("text")} className={`px-4 py-1.5 text-xs font-bold rounded ${mode==="text"?"bg-surface dark:bg-slate-800 dark:bg-surface shadow text-rose-600 dark:text-rose-400":"text-muted dark:text-muted dark:text-muted dark:text-muted"}`}>Text</button>
            <button onClick={() => setMode("file")} className={`px-4 py-1.5 text-xs font-bold rounded ${mode==="file"?"bg-surface dark:bg-slate-800 dark:bg-surface shadow text-rose-600 dark:text-rose-400":"text-muted dark:text-muted dark:text-muted dark:text-muted"}`}>File</button>
        </div>
      </div>
      
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
        {mode === "text" ? (
            <textarea value={input} onChange={e=>setInput(e.target.value)} className="w-full p-6 border rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none outline-none focus:ring-2 focus:ring-rose-200 text-lg resize-none h-32" placeholder="Input text..." />
        ) : (
            <label className="w-full h-32 border-2 border-dashed border-line rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50 transition">
                <Upload size={24} className="text-rose-400 mb-2"/>
                <span className="font-bold text-muted dark:text-muted/70 dark:text-muted/70">Drop File to Hash</span>
                <input type="file" className="hidden" onChange={handleFile} />
            </label>
        )}
        
        <div className="space-y-4">
            <div className="group" onClick={() => {navigator.clipboard.writeText(hashes.sha1); showToast("Copied SHA-1");}}>
                <label className="text-xs font-bold text-muted/70 uppercase mb-1 block">SHA-1</label>
                <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface border rounded-lg font-mono text-sm text-muted dark:text-muted/70 dark:text-muted/70 hover:border-rose-400 cursor-pointer break-all shadow-lg shadow-slate-200/50 dark:shadow-none">{hashes.sha1}</div>
            </div>
            <div className="group" onClick={() => {navigator.clipboard.writeText(hashes.sha256); showToast("Copied SHA-256");}}>
                <label className="text-xs font-bold text-muted/70 uppercase mb-1 block">SHA-256</label>
                <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface border rounded-lg font-mono text-sm text-muted dark:text-muted/70 dark:text-muted/70 hover:border-rose-400 cursor-pointer break-all shadow-lg shadow-slate-200/50 dark:shadow-none">{hashes.sha256}</div>
            </div>
        </div>
      </div>
    </div>
  );
}

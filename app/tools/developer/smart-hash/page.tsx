"use client";
import React, { useState } from "react";
import CryptoJS from "crypto-js";
import { Copy } from "lucide-react";
import { showToast } from "@/app/shared/Toast";

export default function SmartHash() {
  const [text, setText] = useState("OneTool");

  const hashes = [
    { label: "MD5", val: CryptoJS.MD5(text).toString() },
    { label: "SHA-1", val: CryptoJS.SHA1(text).toString() },
    { label: "SHA-256", val: CryptoJS.SHA256(text).toString() },
    { label: "SHA-512", val: CryptoJS.SHA512(text).toString() },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Hash Generator</h1>
        <p className="text-slate-500">Generate cryptographic hashes instantly.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
        <input 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          className="w-full p-4 text-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50" 
          placeholder="Enter text to hash..."
          autoFocus 
        />
      </div>

      <div className="grid gap-4">
        {hashes.map((h) => (
          <div key={h.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center gap-4 group hover:border-indigo-500 transition-colors">
             <div className="w-24 font-bold text-slate-500 uppercase text-xs tracking-wider">{h.label}</div>
             <div className="flex-1 font-mono text-sm text-slate-800 dark:text-slate-200 break-all">{h.val}</div>
             <button 
               onClick={() => { navigator.clipboard.writeText(h.val); showToast(h.label + " Copied!"); }} 
               className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
             >
               <Copy size={18} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}

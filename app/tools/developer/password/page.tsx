"use client";

import React, { useState, useEffect } from "react";
import { Lock, RefreshCw, Copy, Check } from "lucide-react";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [password, setPassword] = useState("");
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const sets = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
    };
    let chars = "";
    if (options.uppercase) chars += sets.uppercase;
    if (options.lowercase) chars += sets.lowercase;
    if (options.numbers) chars += sets.numbers;
    if (options.symbols) chars += sets.symbols;

    if (!chars) return setPassword("");

    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  useEffect(() => generate(), []);

  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 bg-purple-50 text-purple-600 rounded-xl mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Secure Password</h1>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative mb-8">
          <div className="w-full bg-slate-100 p-4 rounded-xl text-center font-mono text-2xl text-slate-800 break-all min-h-[64px] flex items-center justify-center">
            {password}
          </div>
          <button onClick={copy} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white rounded-lg text-slate-500 transition-colors shadow-sm">
            {copied ? <Check size={20} className="text-emerald-500"/> : <Copy size={20}/>}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-bold text-slate-500 uppercase mb-2">
              <span>Length</span>
              <span>{length}</span>
            </div>
            <input 
              type="range" min="4" max="64" value={length} 
              onChange={e => setLength(Number(e.target.value))} 
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.keys(options).map(key => (
              <label key={key} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={(options as any)[key]} 
                  onChange={() => setOptions(prev => ({ ...prev, [key]: !(prev as any)[key] }))}
                  className="w-5 h-5 accent-purple-600 rounded"
                />
                <span className="capitalize text-sm font-medium text-slate-700">{key}</span>
              </label>
            ))}
          </div>

          <button onClick={generate} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
            <RefreshCw size={20}/> Generate New
          </button>
        </div>
      </div>
    </div>
  );
}

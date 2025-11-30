"use client";
import React, { useState } from "react";
import { Copy, RefreshCw, ShieldCheck } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");

  const generate = () => {
    const charset = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
    };
    
    let chars = "";
    if (options.uppercase) chars += charset.uppercase;
    if (options.lowercase) chars += charset.lowercase;
    if (options.numbers) chars += charset.numbers;
    if (options.symbols) chars += charset.symbols;

    if (!chars) return;

    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const copyToClipboard = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    showToast("Password Copied!", "success");
  };

  // Generate on mount
  React.useEffect(() => { generate(); }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">Password Generator</h1>
        <p className="text-muted">Create secure, random passwords instantly.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="relative mb-8">
          <div className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center">
            <span className="font-mono text-2xl md:text-3xl tracking-wider text-main dark:text-slate-200 break-all">
              {password}
            </span>
          </div>
          <button onClick={copyToClipboard} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-blue-600 transition">
            <Copy size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-bold text-sm text-main dark:text-slate-300">Length</label>
              <span className="font-mono text-blue-600 font-bold">{length}</span>
            </div>
            <input type="range" min="6" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(options).map((key) => (
              <label key={key} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <input type="checkbox" checked={options[key as keyof typeof options]} onChange={() => setOptions({ ...options, [key]: !options[key as keyof typeof options] })} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                <span className="capitalize text-sm font-medium text-main dark:text-slate-300">{key}</span>
              </label>
            ))}
          </div>

          <Button onClick={generate} className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
            <RefreshCw className="mr-2" /> Generate New
          </Button>
        </div>
      </div>
    </div>
  );
}

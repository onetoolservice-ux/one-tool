#!/bin/bash

echo "í´ Building Enterprise Password Generator..."

mkdir -p app/tools/developer/smart-pass

# 1. Create the Client Logic (Generator Engine)
cat > app/tools/developer/smart-pass/PasswordClient.tsx << 'CLIENT_EOF'
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import ToolShell from "@/app/components/layout/ToolShell";
import { Button } from "@/app/components/ui/Button";
import { Card } from "@/app/components/ui/Card";
import { RefreshCw, Copy, Check, ShieldCheck, History, Trash2, Lock } from "lucide-react";

export default function PasswordClient() {
  // Settings
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    readable: false, // No ambiguous chars like I, l, 1, 0, O
  });
  
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0); // 0-4 score
  const [copied, setCopied] = useState(false);
  
  // Enterprise Feature: History
  const [history, setHistory] = useLocalStorage<string[]>("onetool_pass_history", []);

  const generatePassword = useCallback(() => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const nums = "0123456789";
    const syms = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    const ambiguous = "Il1O0";

    let charset = "";
    if (options.lowercase) charset += lower;
    if (options.uppercase) charset += upper;
    if (options.numbers) charset += nums;
    if (options.symbols) charset += syms;

    if (options.readable) {
      // Remove ambiguous characters
      charset = charset.split('').filter(c => !ambiguous.includes(c)).join('');
    }

    if (charset === "") return;

    let newPass = "";
    const array = new Uint32Array(length);
    crypto.getRandomValues(array); // Cryptographically secure random
    
    for (let i = 0; i < length; i++) {
      newPass += charset[array[i] % charset.length];
    }

    setPassword(newPass);
    calculateStrength(newPass);
    
    // Add to history (Limit to 10)
    setHistory(prev => {
       const filtered = prev.filter(p => p !== newPass);
       return [newPass, ...filtered].slice(0, 10);
    });
    setCopied(false);
  }, [length, options, setHistory]);

  // Initial generation
  useEffect(() => {
    generatePassword();
  }, []); // Run once on mount

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 8) score++;
    if (pass.length > 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (pass.length < 8) score = Math.min(score, 1); // Penalty for short length
    setStrength(Math.min(score, 5));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-rose-500";
    if (strength === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return "Weak";
    if (strength === 3) return "Medium";
    return "Strong";
  };

  return (
    <ToolShell
      title="Smart Password Generator"
      description="Generate cryptographically secure passwords instantly. Features entropy analysis and local history."
      category="Developer"
      icon={<Lock className="w-5 h-5 text-violet-500" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Generator */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 border-t-4 border-t-violet-500">
             {/* Password Display */}
             <div className="relative mb-8">
               <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group">
                  <span className="text-2xl md:text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 break-all tracking-wider">
                    {password}
                  </span>
                  <button 
                    onClick={() => copyToClipboard(password)}
                    className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition shadow-sm"
                    title="Copy"
                  >
                    {copied ? <Check size={24} className="text-emerald-500"/> : <Copy size={24}/>}
                  </button>
               </div>
               
               {/* Strength Bar */}
               <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${getStrengthColor()}`} 
                      style={{ width: `${(strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold uppercase text-slate-500 min-w-[60px] text-right">
                    {getStrengthLabel()}
                  </span>
               </div>
             </div>

             {/* Controls */}
             <div className="space-y-8">
               <div>
                 <div className="flex justify-between mb-2">
                   <label className="font-medium text-slate-700 dark:text-slate-300">Password Length</label>
                   <span className="font-mono font-bold text-indigo-600">{length}</span>
                 </div>
                 <input 
                   type="range" min="8" max="64" 
                   value={length} 
                   onChange={(e) => setLength(parseInt(e.target.value))}
                   className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                 />
               </div>

               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {[
                   { id: 'uppercase', label: 'ABC', desc: 'Uppercase' },
                   { id: 'lowercase', label: 'abc', desc: 'Lowercase' },
                   { id: 'numbers', label: '123', desc: 'Numbers' },
                   { id: 'symbols', label: '#$&', desc: 'Symbols' },
                   { id: 'readable', label: 'No 1l0O', desc: 'Easy Read' }
                 ].map((opt) => (
                   <label key={opt.id} className={`
                      flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                      ${options[opt.id as keyof typeof options] 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}
                   `}>
                     <input 
                       type="checkbox"
                       checked={options[opt.id as keyof typeof options]}
                       onChange={() => setOptions({...options, [opt.id]: !options[opt.id as keyof typeof options]})}
                       className="w-4 h-4 accent-indigo-600"
                     />
                     <div>
                       <div className="font-bold text-slate-900 dark:text-white">{opt.label}</div>
                       <div className="text-xs text-slate-500">{opt.desc}</div>
                     </div>
                   </label>
                 ))}
               </div>

               <Button 
                 onClick={generatePassword} 
                 size="lg" 
                 className="w-full py-4 text-lg shadow-lg shadow-indigo-500/20"
                 icon={<RefreshCw size={20}/>}
               >
                 Generate New Password
               </Button>
             </div>
          </Card>
        </div>

        {/* Sidebar: History & Tips */}
        <div className="space-y-6">
          <Card className="p-6">
             <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
               <History size={18} className="text-slate-400"/> Recent Passwords
             </h3>
             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
               {history.map((pass, i) => (
                 <div key={i} className="group flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-indigo-200 transition">
                    <span className="font-mono text-sm text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                      {pass.substring(0, 10)}...
                    </span>
                    <button 
                      onClick={() => copyToClipboard(pass)}
                      className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Copy size={14}/>
                    </button>
                 </div>
               ))}
               {history.length === 0 && (
                 <p className="text-xs text-slate-400 text-center py-4">Generated passwords will appear here safely.</p>
               )}
             </div>
             {history.length > 0 && (
               <button 
                 onClick={() => setHistory([])}
                 className="mt-4 w-full text-xs text-rose-500 hover:text-rose-600 flex items-center justify-center gap-1"
               >
                 <Trash2 size={12}/> Clear History
               </button>
             )}
          </Card>

          <Card className="p-6 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-none">
             <div className="flex items-center gap-2 mb-2 text-violet-700 dark:text-violet-300">
               <ShieldCheck size={20}/>
               <h3 className="font-bold">Security Note</h3>
             </div>
             <p className="text-sm text-violet-600/80 dark:text-violet-300/80 leading-relaxed">
               Your passwords are generated <strong>locally in your browser</strong> using the Web Crypto API. They are never sent to our servers.
             </p>
          </Card>
        </div>

      </div>
    </ToolShell>
  );
}
CLIENT_EOF

# 2. Create the Server Page (Metadata)
cat > app/tools/developer/smart-pass/page.tsx << 'PAGE_EOF'
import { Metadata } from "next";
import PasswordClient from "./PasswordClient";
import ToolSchema from "@/app/components/seo/ToolSchema";

export const metadata: Metadata = {
  title: "Smart Password Generator - Secure & Random | One Tool",
  description: "Generate strong, uncrackable passwords instantly. Features entropy analysis, history, and custom character sets. 100% Client-side security.",
  keywords: ["password generator", "random password", "secure password", "strong password maker", "password creator"],
  alternates: {
    canonical: "https://onetool.co.in/tools/developer/smart-pass",
  }
};

export default function SmartPassPage() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 min-h-screen">
      <ToolSchema 
        name="Smart Password Generator" 
        description="Client-side secure password generator with entropy analysis."
        path="/tools/developer/smart-pass"
        category="WebApplication"
      />
      <PasswordClient />
    </div>
  );
}
PAGE_EOF

echo "âœ… Smart Password Generator Installed."
echo "í±‰ Run 'npm run dev' and check the Developer section!"

"use client";
import React, { useState } from "react";
import { Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartChmod() {
  // Owner, Group, Public
  const [perms, setPerms] = useState([
    { r: true, w: true, x: true }, // 7
    { r: true, w: false, x: true }, // 5
    { r: true, w: false, x: true }, // 5
  ]);

  const update = (group: number, key: 'r'|'w'|'x') => {
    const newPerms = [...perms];
    newPerms[group][key] = !newPerms[group][key];
    setPerms(newPerms);
  };

  const calculateOctal = (p: typeof perms[0]) => {
    let score = 0;
    if (p.r) score += 4;
    if (p.w) score += 2;
    if (p.x) score += 1;
    return score;
  };

  const octal = `${calculateOctal(perms[0])}${calculateOctal(perms[1])}${calculateOctal(perms[2])}`;
  const text = `-${perms.map(p => (p.r?'r':'-')+(p.w?'w':'-')+(p.x?'x':'-')).join('')}`;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
       <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">Chmod Calculator</h1>
        <p className="text-muted">Visual Unix permission generator.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-4 gap-4 mb-4 text-xs font-bold text-muted uppercase text-center">
               <div className="text-left pl-2">Scope</div>
               <div>Read (4)</div>
               <div>Write (2)</div>
               <div>Exec (1)</div>
            </div>
            {['Owner', 'Group', 'Public'].map((label, i) => (
               <div key={label} className="grid grid-cols-4 gap-4 items-center py-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="font-bold text-main dark:text-white pl-2">{label}</div>
                  <div className="flex justify-center"><input type="checkbox" checked={perms[i].r} onChange={() => update(i, 'r')} className="w-5 h-5 rounded text-indigo-600"/></div>
                  <div className="flex justify-center"><input type="checkbox" checked={perms[i].w} onChange={() => update(i, 'w')} className="w-5 h-5 rounded text-indigo-600"/></div>
                  <div className="flex justify-center"><input type="checkbox" checked={perms[i].x} onChange={() => update(i, 'x')} className="w-5 h-5 rounded text-indigo-600"/></div>
               </div>
            ))}
         </div>

         <div className="space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl text-center space-y-2">
               <div className="text-xs font-bold text-muted uppercase">Octal Value</div>
               <div className="text-6xl font-mono font-bold text-indigo-400">{octal}</div>
               <div className="text-sm font-mono text-muted">{text}</div>
            </div>
            <Button onClick={() => { navigator.clipboard.writeText(`chmod ${octal} filename`); showToast("Command Copied!"); }} className="w-full py-4 text-lg">
               <Copy size={18} className="mr-2"/> Copy Command
            </Button>
         </div>
      </div>
    </div>
  );
}

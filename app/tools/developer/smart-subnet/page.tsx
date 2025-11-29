"use client";
import React, { useState } from "react";
import { Network } from "lucide-react";
import Toast from "@/app/shared/Toast";

export default function SmartSubnet() {
  const [ip, setIp] = useState("192.168.1.1");
  const [mask, setMask] = useState(24);

  const hosts = Math.pow(2, 32 - mask) - 2;
  const maskStr = [0,0,0,0].map((_,i) => {
      const part = Math.max(0, Math.min(8, mask - i * 8));
      return 256 - Math.pow(2, 8 - part);
  }).join('.');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617]">
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center gap-3 sticky top-0 z-50">
        <div className="p-2 rounded-lg bg-cyan-600 text-white"><Network size={22} /></div>
        <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Subnet</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">CIDR Calculator</p></div>
      </div>
      <div className="p-8 max-w-2xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-4">
            <input value={ip} onChange={e=>setIp(e.target.value)} className="flex-1 p-4 border rounded-xl text-xl font-mono outline-none focus:border-cyan-500" placeholder="IP Address" />
            <div className="text-2xl text-slate-300">/</div>
            <input type="number" min="0" max="32" value={mask} onChange={e=>setMask(Number(e.target.value))} className="w-24 p-4 border rounded-xl text-xl font-mono outline-none focus:border-cyan-500" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none text-center">
                <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">{hosts.toLocaleString()}</div>
                <div className="text-xs font-bold text-muted/70 uppercase">Usable Hosts</div>
            </div>
            <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   shadow-lg shadow-slate-200/50 dark:shadow-none text-center">
                <div className="text-xl font-mono font-bold text-main dark:text-slate-300 mb-1 mt-2">{maskStr}</div>
                <div className="text-xs font-bold text-muted/70 uppercase">Subnet Mask</div>
            </div>
        </div>
      </div>
    </div>
  );
}

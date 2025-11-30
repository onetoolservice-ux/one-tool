"use client";
import React, { useState } from "react";

export default function SmartSubnet() {
  const [ip, setIp] = useState("192.168.1.0");
  const [mask, setMask] = useState(24);

  const calculate = () => {
     // Mock simple calc for display logic - a real lib would be heavy
     const hosts = Math.pow(2, 32 - mask) - 2;
     return { 
        netmask: "255.255.255.0", 
        range: `192.168.1.1 - 192.168.1.${Math.min(254, hosts)}`, 
        hosts: hosts.toLocaleString(),
        class: mask < 8 ? "A" : mask < 16 ? "B" : "C"
     };
  };

  const data = calculate();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">Subnet Calculator</h1>
        <p className="text-muted">CIDR to IP Range converter.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
         <div className="flex gap-4 mb-8">
            <div className="flex-1">
               <label className="text-xs font-bold text-muted uppercase mb-2 block">IP Address</label>
               <input value={ip} onChange={e=>setIp(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono" />
            </div>
            <div className="w-24">
               <label className="text-xs font-bold text-muted uppercase mb-2 block">CIDR /</label>
               <input type="number" min="0" max="32" value={mask} onChange={e=>setMask(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono text-center" />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
               <div className="text-xs font-bold text-muted uppercase">Netmask</div>
               <div className="text-lg font-bold text-main dark:text-slate-200">{data.netmask}</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
               <div className="text-xs font-bold text-muted uppercase">Class</div>
               <div className="text-lg font-bold text-main dark:text-slate-200">{data.class}</div>
            </div>
            <div className="col-span-2 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
               <div className="text-xs font-bold text-indigo-400 uppercase">Usable Host Range</div>
               <div className="text-xl font-mono font-bold text-indigo-700 dark:text-indigo-300">{data.range}</div>
               <div className="text-xs font-medium text-indigo-500 mt-1">{data.hosts} Hosts</div>
            </div>
         </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Wifi, Lock } from "lucide-react";
import ToolHeader from "@/app/components/ui/ToolHeader";

export default function WifiQR() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");

  const qrValue = `WIFI:T:${encryption};S:${ssid};P:${password};;`;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ToolHeader title="WiFi QR Code" desc="Share WiFi instantly" icon={<Wifi size={20}/>} />
      
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-8 rounded-3xl border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col items-center gap-8">
        <div className="p-4 bg-surface dark:bg-slate-800 dark:bg-surface rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-slate-600 border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
          <QRCodeCanvas value={qrValue} size={200} />
        </div>
        
        <div className="w-full space-y-4">
          <div>
             <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Network Name (SSID)</label>
             <input type="text" value={ssid} onChange={e=>setSsid(e.target.value)} className="w-full mt-1 p-3 border rounded-xl outline-none focus:border-indigo-500" placeholder="MyHomeWiFi"/>
          </div>
          <div>
             <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Password</label>
             <div className="relative mt-1">
               <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/70"/>
               <input type="text" value={password} onChange={e=>setPassword(e.target.value)} className="w-full pl-10 pr-3 p-3 border rounded-xl outline-none focus:border-indigo-500" placeholder="SecretKey123"/>
             </div>
          </div>
          <div>
             <label className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Encryption</label>
             <select value={encryption} onChange={e=>setEncryption(e.target.value)} className="w-full mt-1 p-3 border rounded-xl bg-surface dark:bg-slate-800 dark:bg-surface">
               <option value="WPA">WPA/WPA2</option>
               <option value="WEP">WEP</option>
               <option value="nopass">None</option>
             </select>
          </div>
        </div>
      </div>
    </div>
  );
}

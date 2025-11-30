"use client";
import React, { useState } from "react";
import QRCode from "react-qr-code";
import { Wifi, Eye, EyeOff, Copy } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartWifi() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [encryption, setEncryption] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // WIFI:S:MySSID;T:WPA;P:MyPass;;
  const wifiString = `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};;`;

  const download = () => {
    const svg = document.getElementById("wifi-qr");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 256;
      canvas.height = 256;
      ctx?.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `wifi-${ssid}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-main dark:text-white">WiFi QR Code</h1>
        <p className="text-muted">Share your WiFi network instantly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
           <div>
             <label className="text-xs font-bold text-muted uppercase mb-1 block">Network Name (SSID)</label>
             <input value={ssid} onChange={e=>setSsid(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl" placeholder="e.g. Office_Guest" />
           </div>
           
           <div>
             <label className="text-xs font-bold text-muted uppercase mb-1 block">Password</label>
             <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl pr-10" placeholder="Secret Key" />
                <button onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-indigo-500">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-xs font-bold text-muted uppercase mb-1 block">Encryption</label>
                 <select value={encryption} onChange={e=>setEncryption(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Open (None)</option>
                 </select>
              </div>
              <div className="flex items-center pt-6">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hidden} onChange={e=>setHidden(e.target.checked)} className="w-5 h-5 rounded text-indigo-600" />
                    <span className="text-sm font-bold text-main dark:text-slate-300">Hidden Network</span>
                 </label>
              </div>
           </div>

           <Button onClick={download} className="w-full py-3" disabled={!ssid}>Download QR</Button>
        </div>

        <div className="flex flex-col items-center justify-center bg-indigo-600 p-8 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
           <div className="bg-white p-4 rounded-xl shadow-2xl mb-6">
              <QRCode id="wifi-qr" value={wifiString} size={200} />
           </div>
           <div className="text-center">
              <div className="font-bold text-lg flex items-center justify-center gap-2"><Wifi size={20}/> {ssid || "Network Name"}</div>
              <div className="text-indigo-200 text-sm mt-1">{encryption === 'nopass' ? 'Open Network' : 'Password Protected'}</div>
           </div>
        </div>
      </div>
    </div>
  );
}

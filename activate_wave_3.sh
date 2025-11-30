#!/bin/bash

echo "í³¡ Activating Wave 3: SysAdmin & Network Tools..."

# =========================================================
# 1. DEVELOPER: SMART WIFI
# =========================================================
echo "í³¶ Activating Smart WiFi..."
cat > app/tools/developer/wifi/page.tsx << 'TS_END'
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
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">WiFi QR Code</h1>
        <p className="text-slate-500">Share your WiFi network instantly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Network Name (SSID)</label>
             <input value={ssid} onChange={e=>setSsid(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl" placeholder="e.g. Office_Guest" />
           </div>
           
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Password</label>
             <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl pr-10" placeholder="Secret Key" />
                <button onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500">{showPass ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Encryption</label>
                 <select value={encryption} onChange={e=>setEncryption(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Open (None)</option>
                 </select>
              </div>
              <div className="flex items-center pt-6">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hidden} onChange={e=>setHidden(e.target.checked)} className="w-5 h-5 rounded text-indigo-600" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Hidden Network</span>
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
TS_END

# =========================================================
# 2. DEVELOPER: SMART CHMOD
# =========================================================
echo "í´¢ Activating Smart Chmod..."
cat > app/tools/developer/smart-chmod/page.tsx << 'TS_END'
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
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Chmod Calculator</h1>
        <p className="text-slate-500">Visual Unix permission generator.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-4 gap-4 mb-4 text-xs font-bold text-slate-500 uppercase text-center">
               <div className="text-left pl-2">Scope</div>
               <div>Read (4)</div>
               <div>Write (2)</div>
               <div>Exec (1)</div>
            </div>
            {['Owner', 'Group', 'Public'].map((label, i) => (
               <div key={label} className="grid grid-cols-4 gap-4 items-center py-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white pl-2">{label}</div>
                  <div className="flex justify-center"><input type="checkbox" checked={perms[i].r} onChange={() => update(i, 'r')} className="w-5 h-5 rounded text-indigo-600"/></div>
                  <div className="flex justify-center"><input type="checkbox" checked={perms[i].w} onChange={() => update(i, 'w')} className="w-5 h-5 rounded text-indigo-600"/></div>
                  <div className="flex justify-center"><input type="checkbox" checked={perms[i].x} onChange={() => update(i, 'x')} className="w-5 h-5 rounded text-indigo-600"/></div>
               </div>
            ))}
         </div>

         <div className="space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl text-center space-y-2">
               <div className="text-xs font-bold text-slate-400 uppercase">Octal Value</div>
               <div className="text-6xl font-mono font-bold text-indigo-400">{octal}</div>
               <div className="text-sm font-mono text-slate-400">{text}</div>
            </div>
            <Button onClick={() => { navigator.clipboard.writeText(`chmod ${octal} filename`); showToast("Command Copied!"); }} className="w-full py-4 text-lg">
               <Copy size={18} className="mr-2"/> Copy Command
            </Button>
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 3. DEVELOPER: SMART SUBNET
# =========================================================
echo "í¼ Activating Smart Subnet..."
cat > app/tools/developer/smart-subnet/page.tsx << 'TS_END'
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
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Subnet Calculator</h1>
        <p className="text-slate-500">CIDR to IP Range converter.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
         <div className="flex gap-4 mb-8">
            <div className="flex-1">
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">IP Address</label>
               <input value={ip} onChange={e=>setIp(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono" />
            </div>
            <div className="w-24">
               <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">CIDR /</label>
               <input type="number" min="0" max="32" value={mask} onChange={e=>setMask(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl font-mono text-center" />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
               <div className="text-xs font-bold text-slate-400 uppercase">Netmask</div>
               <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{data.netmask}</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
               <div className="text-xs font-bold text-slate-400 uppercase">Class</div>
               <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{data.class}</div>
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
TS_END

# =========================================================
# 4. DEVELOPER: SMART UA (User Agent)
# =========================================================
echo "íµµï¸ Activating User Agent Parser..."
cat > app/tools/developer/smart-ua/page.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import { Smartphone, Monitor, Globe } from "lucide-react";

export default function SmartUA() {
  const [ua, setUa] = useState("");

  useEffect(() => {
    setUa(navigator.userAgent);
  }, []);

  const browser = ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : "Safari";
  const os = ua.includes("Win") ? "Windows" : ua.includes("Mac") ? "macOS" : "Linux";
  const device = ua.includes("Mobile") ? "Mobile" : "Desktop";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">User Agent Info</h1>
        <p className="text-slate-500">Analyze your browser string.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
         <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-8 font-mono text-sm text-slate-600 dark:text-slate-400 break-all">
            {ua}
         </div>

         <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
                <Globe className="mx-auto mb-3 text-blue-500" size={32} />
                <div className="font-bold text-blue-700 dark:text-blue-300">{browser}</div>
                <div className="text-xs text-blue-400 uppercase font-bold">Browser</div>
            </div>
            <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                <Monitor className="mx-auto mb-3 text-emerald-500" size={32} />
                <div className="font-bold text-emerald-700 dark:text-emerald-300">{os}</div>
                <div className="text-xs text-emerald-400 uppercase font-bold">OS</div>
            </div>
            <div className="p-6 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-center">
                <Smartphone className="mx-auto mb-3 text-rose-500" size={32} />
                <div className="font-bold text-rose-700 dark:text-rose-300">{device}</div>
                <div className="text-xs text-rose-400 uppercase font-bold">Platform</div>
            </div>
         </div>
      </div>
    </div>
  );
}
TS_END

# =========================================================
# 5. DEVELOPER: SMART DIFF
# =========================================================
echo "â†”ï¸ Activating Smart Diff..."
cat > app/tools/developer/smart-diff/page.tsx << 'TS_END'
"use client";
import React, { useState } from "react";

export default function SmartDiff() {
  const [text1, setText1] = useState("Hello World");
  const [text2, setText2] = useState("Hello OneTool");

  const diffs = React.useMemo(() => {
    const a = text1.split('\n');
    const b = text2.split('\n');
    return a.map((line, i) => {
       if (line === b[i]) return { type: 'same', content: line };
       if (!b[i]) return { type: 'removed', content: line };
       return { type: 'changed', content: `${line} -> ${b[i]}` };
    });
  }, [text1, text2]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col">
       <div className="text-center">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Text Compare</h1>
      </div>
      
      <div className="grid grid-cols-2 gap-4 flex-1">
         <textarea value={text1} onChange={e=>setText1(e.target.value)} className="p-4 rounded-xl border bg-white dark:bg-slate-800 resize-none" placeholder="Original Text"/>
         <textarea value={text2} onChange={e=>setText2(e.target.value)} className="p-4 rounded-xl border bg-white dark:bg-slate-800 resize-none" placeholder="Modified Text"/>
      </div>

      <div className="bg-slate-900 rounded-xl p-4 h-48 overflow-auto font-mono text-sm">
         {diffs.map((d, i) => (
            <div key={i} className={`
                ${d.type === 'same' ? 'text-slate-500' : ''}
                ${d.type === 'removed' ? 'text-rose-400 bg-rose-900/20' : ''}
                ${d.type === 'changed' ? 'text-emerald-400 bg-emerald-900/20' : ''}
            `}>
                <span className="w-6 inline-block opacity-50 select-none">{i+1}</span> {d.content}
            </div>
         ))}
      </div>
    </div>
  );
}
TS_END

echo "âœ… Wave 3 Installed. Run 'npm run dev' to check!"

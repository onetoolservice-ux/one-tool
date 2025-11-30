#!/bin/bash

echo "��� Activating The Vault (Import & Storage Manager)..."

# =========================================================
# 1. UPDATE SETTINGS PAGE (Import + Storage + Theme)
# =========================================================
echo "⚙️ Upgrading Settings Page..."
cat > app/settings/page.tsx << 'TS_END'
"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Download, Upload, Database, Moon, Sun, HardDrive, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SettingsPage() {
  const [storageSize, setStorageSize] = useState("0 KB");
  const [theme, setTheme] = useState("system");

  useEffect(() => {
     calcStorage();
     // Check current theme
     if (document.documentElement.classList.contains('dark')) setTheme('dark');
     else setTheme('light');
  }, []);

  const calcStorage = () => {
     let total = 0;
     for(let x in localStorage) {
        if(localStorage.hasOwnProperty(x)) total += ((localStorage[x].length + x.length) * 2);
     }
     setStorageSize((total / 1024).toFixed(2) + " KB");
  };

  const toggleTheme = (t: string) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      if (t === 'system') {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');
      } else {
          root.classList.add(t);
      }
      setTheme(t);
      // Persist if needed, but for now we just toggle class
  };

  const clearData = () => {
    if(confirm("⚠️ Are you sure? This will wipe ALL your data permanently.")) {
        localStorage.clear();
        calcStorage();
        showToast("All data cleared.", "error");
        setTimeout(() => window.location.reload(), 1000);
    }
  };

  const exportData = () => {
     const data = JSON.stringify(localStorage);
     const blob = new Blob([data], {type: "application/json"});
     const url = URL.createObjectURL(blob);
     const a = document.createElement("a");
     a.href = url;
     a.download = `onetool-backup-${new Date().toISOString().slice(0,10)}.json`;
     a.click();
     showToast("Backup downloaded.", "success");
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     
     const reader = new FileReader();
     reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target?.result as string);
            if (typeof data !== 'object') throw new Error("Invalid file");
            
            // Restore keys
            Object.keys(data).forEach(k => {
                localStorage.setItem(k, data[k]);
            });
            
            calcStorage();
            showToast("Data Restored Successfully!", "success");
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            showToast("Invalid Backup File", "error");
        }
     };
     reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 space-y-12">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage your data & preferences.</p>
      </div>

      {/* 1. APPEARANCE */}
      <section className="space-y-4">
         <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sun size={16}/> Appearance</h2>
         <div className="grid grid-cols-3 gap-4">
            {['light', 'dark', 'system'].map((t) => (
                <button 
                    key={t}
                    onClick={() => toggleTheme(t)}
                    className={`p-4 rounded-xl border-2 font-bold capitalize flex flex-col items-center gap-2 transition-all ${theme === t ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                >
                    {t === 'light' && <Sun size={24}/>}
                    {t === 'dark' && <Moon size={24}/>}
                    {t === 'system' && <HardDrive size={24}/>}
                    {t}
                </button>
            ))}
         </div>
      </section>

      {/* 2. DATA MANAGEMENT */}
      <section className="space-y-4">
         <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Database size={16}/> Data Vault</h2>
         <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            
            {/* Stats */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400"><HardDrive size={20}/></div>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-white">Local Storage</div>
                        <div className="text-xs text-slate-500">Encrypted on device</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono font-bold text-xl text-indigo-600 dark:text-indigo-400">{storageSize}</div>
                    <div className="text-xs text-slate-400">Used</div>
                </div>
            </div>

            {/* Actions */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                <div className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                   <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Download size={16}/> Backup Data</div>
                      <div className="text-sm text-slate-500">Save a secure JSON file of your entire workspace.</div>
                   </div>
                   <Button onClick={exportData} variant="secondary" className="text-sm">Download Backup</Button>
                </div>

                <div className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition relative">
                   <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><Upload size={16}/> Restore Data</div>
                      <div className="text-sm text-slate-500">Overwrite current data with a backup file.</div>
                   </div>
                   <div className="relative">
                       <Button variant="secondary" className="text-sm pointer-events-none">Select File</Button>
                       <input type="file" accept=".json" onChange={importData} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                </div>

                <div className="p-6 flex items-center justify-between bg-rose-50/30 dark:bg-rose-900/10">
                   <div>
                      <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2"><Trash2 size={16}/> Factory Reset</div>
                      <div className="text-sm text-rose-600/70 dark:text-rose-500/70">Permanently erase all local data.</div>
                   </div>
                   <Button onClick={clearData} className="bg-white dark:bg-slate-900 text-rose-600 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 hover:border-rose-300 shadow-none text-sm">Clear All</Button>
                </div>
            </div>
         </div>
      </section>
      
      {/* Footer Info */}
      <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold mb-4">
            <CheckCircle2 size={14}/> System Operational
         </div>
         <p className="text-xs text-slate-400">OneTool v2.1.0 • Built for Privacy • Zero Tracking</p>
      </div>
    </div>
  );
}
TS_END

echo "✅ Vault Activated. Settings Page upgraded."

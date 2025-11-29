"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Database, Save, Server, ShieldCheck, ArrowLeft, Download, Upload, CheckCircle } from "lucide-react";
import Link from "next/link";
import Toast, { showToast } from "../shared/Toast";
import Achievements from "@/app/components/profile/Achievements";

export default function SettingsPage() {
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    let total = 0;
    for(let x in localStorage) {
        if(localStorage.hasOwnProperty(x)) total += ((localStorage[x].length + x.length) * 2);
    }
    setUsage(total);
  }, []);

  const exportData = () => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) data[key] = localStorage.getItem(key) || "";
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onetool_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast("Backup Downloaded");
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
        showToast("Data Restored Successfully");
        setTimeout(() => window.location.reload(), 1000);
      } catch { showToast("Invalid Backup File"); }
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    if(confirm("Are you sure? This will delete ALL data from Smart Budget, Debt, Loans, etc.")) {
        localStorage.clear();
        setUsage(0);
        showToast("System Reset Complete");
    }
  };

  return (
    <div className="w-full px-6 py-8 max-w-4xl mx-auto space-y-8 font-sans">
      <Toast />
      
      <div className="flex items-center gap-4 border-b pb-6">
        <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition"><ArrowLeft size={20} className="text-muted dark:text-muted/70 dark:text-muted/70"/></Link>
        <div><h1 className="text-2xl font-extrabold text-main dark:text-slate-50 dark:text-slate-100">Settings</h1><p className="text-muted dark:text-muted dark:text-muted dark:text-muted font-medium">System & Data Management</p></div>
      </div>

      <Achievements />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backup Card */}
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-800  ">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 dark:text-indigo-400 rounded-lg"><Save size={20}/></div>
                <h3 className="font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Backup</h3>
            </div>
            <p className="text-sm text-muted dark:text-muted/70 dark:text-muted/70 mb-6">Export your entire digital life to a JSON file. Keep it safe to restore later.</p>
            
            <div className="space-y-3">
                <button onClick={exportData} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold   hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                    <Download size={16}/> Export Data
                </button>
                <label className="w-full py-3 bg-surface dark:bg-slate-800 dark:bg-surface border-2 border-dashed border-line text-muted dark:text-muted dark:text-muted dark:text-muted rounded-xl font-bold hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 dark:text-indigo-400 transition flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={16}/> Restore Backup
                    <input type="file" accept=".json" className="hidden" onChange={importData} />
                </label>
            </div>
        </div>

        {/* Storage Card */}
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 rounded-2xl border   border-line dark:border-slate-700 dark:border-slate-800  ">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 dark:text-blue-400 rounded-lg"><Database size={20}/></div>
                <h3 className="font-bold text-main dark:text-slate-100 dark:text-slate-200">Storage</h3>
            </div>
            <div className="text-4xl font-black text-main dark:text-slate-100 dark:text-slate-200 mb-1">{(usage / 1024).toFixed(2)} <span className="text-lg font-medium text-muted/70">KB</span></div>
            <div className="text-xs font-bold text-muted/70 uppercase tracking-wide mb-6">Local Storage Used</div>
            
            <div className="p-4 bg-background dark:bg-surface dark:bg-slate-950 rounded-xl border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-1"><CheckCircle size={16}/> Healthy</div>
                <p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted">You are well within the browser's 5MB limit.</p>
            </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-rose-100 rounded-2xl overflow-hidden">
        <div className="bg-rose-50/50 p-4 border-b border-rose-100">
            <h3 className="text-sm font-bold text-rose-700 uppercase tracking-wide">Danger Zone</h3>
        </div>
        <div className="bg-surface dark:bg-slate-800 dark:bg-surface p-6 flex items-center justify-between">
            <div><div className="font-bold text-main dark:text-slate-100 dark:text-slate-200">Factory Reset</div><p className="text-xs text-muted dark:text-muted dark:text-muted dark:text-muted mt-1">Clears all budgets, loans, passwords, and preferences.</p></div>
            <button aria-label="Delete Item"<button onClick={clearAll} className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold hover:bg-rose-600 hover:text-white transition flex items-center gap-2"><Trash2 size={14}/> Clear All Data</button>
        </div>
      </div>
    </div>
  );
}

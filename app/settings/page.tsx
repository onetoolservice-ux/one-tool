"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Download, Database, HardDrive, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const [storageSize, setStorageSize] = useState("0 KB");

  useEffect(() => {
    calculateStorage();
  }, []);

  const calculateStorage = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += (localStorage[key].length * 2);
      }
    }
    setStorageSize((total / 1024).toFixed(2) + " KB");
  };

  const handleClearData = () => {
    if (confirm("⚠️ DANGER: This will delete ALL budgets, settings, and local data. This cannot be undone.")) {
      localStorage.clear();
      calculateStorage();
      alert("All data has been wiped.");
      window.location.reload();
    }
  };

  const handleExportAll = () => {
    const backup: Record<string, any> = {};
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        try {
          backup[key] = JSON.parse(localStorage[key]);
        } catch {
          backup[key] = localStorage[key];
        }
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OTS_FULL_BACKUP_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Settings & Data</h1>
        <p className="text-slate-500 mt-2">Manage your local storage and app preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Storage Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Database size={24}/></div>
            <div>
              <h3 className="font-bold text-slate-800">Local Storage Used</h3>
              <p className="text-xs text-slate-500">Data stored on this device</p>
            </div>
          </div>
          <div className="text-xl font-mono font-bold text-slate-700">{storageSize}</div>
        </div>

        {/* Data Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><HardDrive size={20}/> Data Management</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-slate-900">Export All Data</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">Download a JSON backup of your budget, history, and settings.</p>
              </div>
              <button onClick={handleExportAll} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                <Download size={16}/> Backup
              </button>
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium text-rose-600 flex items-center gap-2"><AlertTriangle size={16}/> Danger Zone</h4>
                <p className="text-sm text-slate-500 mt-1 max-w-sm">Permanently delete all data stored in this browser.</p>
              </div>
              <button onClick={handleClearData} className="flex items-center gap-2 px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-sm font-medium transition-colors">
                <Trash2 size={16}/> Reset App
              </button>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center pt-8">
          <p className="text-xs text-slate-400 font-medium">One Tool Solutions v1.0.0</p>
          <p className="text-[10px] text-slate-300 mt-1">Built with Next.js 16 & Tailwind</p>
        </div>
      </div>
    </div>
  );
}

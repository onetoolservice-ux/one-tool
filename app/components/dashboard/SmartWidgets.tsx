"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp, ShieldAlert, Activity, Lock, Hash, Plus, ArrowRight, Code2, Wallet } from "lucide-react";
import Link from "next/link";
import { showToast } from "@/app/shared/Toast";

export default function SmartWidgets() {
  const [greeting, setGreeting] = useState("Welcome");
  const [netWorth, setNetWorth] = useState(0);
  const [debtDate, setDebtDate] = useState("-");
  const [quickPass, setQuickPass] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Mock Data Loading
    const debtData = localStorage.getItem("smart-debt-data-v1");
    if (debtData) {
        try {
            const debts = JSON.parse(debtData);
            if(debts.length > 0) setDebtDate("Oct 2026"); 
        } catch {}
    }
  }, []);

  const generateQuickPass = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for(let i=0; i<16; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setQuickPass(pass);
    navigator.clipboard.writeText(pass);
    showToast("Password Copied!");
  };

  const copyUUID = () => {
    const id = crypto.randomUUID();
    navigator.clipboard.writeText(id);
    showToast("UUID Copied!");
  };

  // STANDARD CARD STYLE (Applied to all widgets)
  const cardStyle = "bg-surface border border-line rounded-2xl p-5   hover:  transition group relative overflow-hidden flex flex-col justify-between min-h-[140px]";

  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      
      {/* Greeting */}
      <div className="flex justify-between items-end px-1">
        <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-main tracking-tight">{greeting}</h1>
            <p className="text-muted font-medium text-sm mt-1">Your digital command center.</p>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Finance Snapshot (Unified Style) */}
        <div className={cardStyle}>
            <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition transform group-hover:scale-110">
                <Wallet size={80} className="text-emerald-600"/>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold text-xs uppercase tracking-wide">
                    <TrendingUp size={14}/> Net Worth
                </div>
                <div className="text-3xl font-black text-main tracking-tight">₹{netWorth.toLocaleString()}</div>
            </div>
            <Link href="/tools/finance/smart-net-worth" className="text-xs font-bold text-muted hover:text-emerald-600 flex items-center gap-1 transition mt-4">
                Update Assets <ArrowRight size={12}/>
            </Link>
        </div>

        {/* 2. Debt Tracker (Unified Style) */}
        <div className={cardStyle}>
             <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition transform group-hover:scale-110">
                <ShieldAlert size={80} className="text-indigo-600"/>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-3 text-indigo-600 font-bold text-xs uppercase tracking-wide">
                    <ShieldAlert size={14}/> Freedom Date
                </div>
                <div className="text-3xl font-black text-main tracking-tight">{debtDate}</div>
            </div>
            <Link href="/tools/finance/smart-debt" className="text-xs font-bold text-muted hover:text-indigo-600 flex items-center gap-1 transition mt-4">
                View Plan <ArrowRight size={12}/>
            </Link>
        </div>

        {/* 3. Developer Quick Tools (Unified Style - No more dark blue box) */}
        <div className={cardStyle}>
            <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition">
                <Code2 size={80} className="text-blue-600"/>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold text-xs uppercase tracking-wide">
                    <Lock size={14}/> Quick Dev
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={generateQuickPass} className="bg-background hover:bg-slate-100 dark:hover:bg-slate-800 border border-line p-2 rounded-lg text-xs font-bold text-main transition text-center">
                        Gen Pass
                    </button>
                    <button onClick={copyUUID} className="bg-background hover:bg-slate-100 dark:hover:bg-slate-800 border border-line p-2 rounded-lg text-xs font-bold text-main transition text-center flex items-center justify-center gap-1">
                        <Hash size={12}/> UUID
                    </button>
                </div>
            </div>
            {quickPass && <div className="mt-2 text-xs text-emerald-600 font-bold text-center animate-in fade-in">Copied to Clipboard!</div>}
        </div>

        {/* 4. Shortcuts (Unified Style) */}
        <div className={cardStyle}>
            <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition">
                <Activity size={80} className="text-orange-500"/>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-3 text-orange-500 font-bold text-xs uppercase tracking-wide">
                    <Activity size={14}/> Actions
                </div>
                <div className="space-y-2">
                    <Link href="/tools/finance/smart-budget" className="flex items-center justify-between bg-background hover:bg-slate-100 dark:hover:bg-slate-800 border border-line p-2 rounded-lg transition cursor-pointer group/item">
                        <span className="text-xs font-bold text-main">Add Expense</span>
                        <Plus size={14} className="text-muted group-hover/item:text-orange-500 transition"/>
                    </Link>
                    <Link href="/tools/documents/smart-scan" className="flex items-center justify-between bg-background hover:bg-slate-100 dark:hover:bg-slate-800 border border-line p-2 rounded-lg transition cursor-pointer group/item">
                        <span className="text-xs font-bold text-main">Scan Document</span>
                        <Plus size={14} className="text-muted group-hover/item:text-orange-500 transition"/>
                    </Link>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

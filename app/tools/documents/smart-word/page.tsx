"use client";
import React from "react";
import { FileText, Save, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import Toast, { showToast } from "@/app/shared/Toast";

export default function SmartWord() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background dark:bg-[#0f172a] dark:bg-[#020617] font-sans">
      <Toast />
      <div className="bg-surface dark:bg-slate-800 dark:bg-surface/80 backdrop-blur-md backdrop-blur-md border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600 text-white  "><FileText size={22} /></div>
            <div><h1 className="text-lg font-bold text-main dark:text-slate-100 dark:text-slate-200">Smart Word</h1><p className="text-xs font-bold text-muted dark:text-muted dark:text-muted dark:text-muted uppercase">Rich Text Editor</p></div>
        </div>
        
        {/* Toolbar */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button className="p-1.5 hover:bg-surface dark:bg-slate-800 dark:bg-surface hover:shadow rounded text-muted dark:text-muted/70 dark:text-muted/70 transition"><Bold size={16}/></button>
            <button className="p-1.5 hover:bg-surface dark:bg-slate-800 dark:bg-surface hover:shadow rounded text-muted dark:text-muted/70 dark:text-muted/70 transition"><Italic size={16}/></button>
            <button className="p-1.5 hover:bg-surface dark:bg-slate-800 dark:bg-surface hover:shadow rounded text-muted dark:text-muted/70 dark:text-muted/70 transition"><Underline size={16}/></button>
            <div className="w-[1px] bg-slate-300 h-4 mx-1"></div>
            <button className="p-1.5 hover:bg-surface dark:bg-slate-800 dark:bg-surface hover:shadow rounded text-muted dark:text-muted/70 dark:text-muted/70 transition"><AlignLeft size={16}/></button>
            <button className="p-1.5 hover:bg-surface dark:bg-slate-800 dark:bg-surface hover:shadow rounded text-muted dark:text-muted/70 dark:text-muted/70 transition"><AlignCenter size={16}/></button>
            <button className="p-1.5 hover:bg-surface dark:bg-slate-800 dark:bg-surface hover:shadow rounded text-muted dark:text-muted/70 dark:text-muted/70 transition"><AlignRight size={16}/></button>
        </div>

        <button onClick={()=>{showToast("Document Saved")}} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-lg shadow-slate-200/50 dark:shadow-none"><Save size={14}/> Save</button>
      </div>
      
      <div className="flex-1 p-8 overflow-auto flex justify-center bg-slate-100">
        <div className="w-full max-w-[850px] bg-surface dark:bg-slate-800 dark:bg-surface min-h-[1000px] shadow-lg border border-line dark:border-slate-700 dark:border-slate-700 dark:border-slate-800 p-16 rounded-sm outline-none text-main dark:text-slate-100 dark:text-slate-200 leading-relaxed" contentEditable>
            <h1 className="text-3xl font-bold mb-6">Untitled Project</h1>
            <p>Start typing your masterpiece here...</p>
        </div>
      </div>
    </div>
  );
}

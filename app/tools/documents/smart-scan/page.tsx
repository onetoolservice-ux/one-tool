"use client";
import React from "react";
import { ScanLine, Upload, Camera } from "lucide-react";
import EmptyState from "@/app/shared/ui/EmptyState";
import Button from "@/app/shared/ui/Button";

export default function SmartScan() {
  return (
    <div className="max-w-3xl mx-auto p-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Smart Scan</h1>
        <p className="text-slate-500">Digitize physical documents instantly.</p>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center">
         <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600 mb-6 animate-pulse">
            <ScanLine size={48} />
         </div>
         <h2 className="text-xl font-bold mb-2">No Document Selected</h2>
         <p className="text-slate-500 max-w-sm mb-8">Upload an image or take a photo to extract text and convert to PDF.</p>
         
         <div className="flex gap-4">
            <div className="relative">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                <Button><Upload size={18} className="mr-2"/> Upload Image</Button>
            </div>
            <Button variant="secondary"><Camera size={18} className="mr-2"/> Use Camera</Button>
         </div>
      </div>
    </div>
  );
}

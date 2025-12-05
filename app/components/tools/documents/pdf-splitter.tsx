"use client";
import React from 'react';
import { Scissors } from 'lucide-react';
export const PdfSplitter = () => (
  <div className="p-12 text-center border rounded-3xl bg-slate-50/50 max-w-2xl mx-auto mt-10">
     <Scissors size={64} className="mx-auto text-rose-500 mb-6"/>
     <h2 className="text-3xl font-bold mb-2">Split PDF Pages</h2>
     <p className="text-slate-500 mb-10">Extract specific pages from your PDF document instantly.</p>
     <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all">Select PDF File</button>
  </div>
);

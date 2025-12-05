"use client";
import React from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
export const ImageConverter = () => (
  <div className="max-w-xl mx-auto p-10 bg-white dark:bg-slate-900 border rounded-3xl text-center mt-12">
    <RefreshCw size={48} className="mx-auto text-indigo-500 mb-6"/>
    <h2 className="text-3xl font-bold mb-2">Image Converter</h2>
    <p className="text-slate-500">Convert between JPG, PNG, WEBP instantly.</p>
    
    <div className="flex items-center justify-center gap-6 my-10">
       <div className="p-4 border rounded-2xl font-bold text-xl min-w-[100px]">JPG</div>
       <ArrowRight className="text-slate-300"/>
       <div className="p-4 border-2 border-indigo-500 text-indigo-600 rounded-2xl font-bold text-xl min-w-[100px]">PNG</div>
    </div>
    
    <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform">Select Files</button>
  </div>
);

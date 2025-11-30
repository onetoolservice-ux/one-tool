"use client";
import React, { useState } from "react";
import Tesseract from 'tesseract.js';
import { Upload, FileText, Copy, Loader2, RefreshCw } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartOCR() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setImage(url);
      setText("");
      setProgress(0);
    }
  };

  const processImage = () => {
    if (!image) return;
    setIsProcessing(true);
    Tesseract.recognize(
      image,
      'eng',
      { logger: m => {
          if(m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
      }}
    ).then(({ data: { text } }) => {
      setText(text);
      setIsProcessing(false);
      showToast("Text Extracted!", "success");
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 h-[calc(100vh-100px)] flex flex-col">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Smart OCR</h1>
        <p className="text-slate-500">Extract text from images instantly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 flex-1">
         {/* Image Input */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
            {!image ? (
                <div className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center relative hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer">
                    <Upload size={40} className="text-slate-400 mb-3" />
                    <span className="font-bold text-slate-600 dark:text-slate-300">Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
            ) : (
                <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-center">
                    <img src={image} alt="OCR Source" className="max-w-full max-h-full object-contain" />
                    <button onClick={() => { setImage(null); setText(""); }} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-rose-600 transition"><RefreshCw size={16}/></button>
                </div>
            )}
            <div className="mt-4">
               <Button onClick={processImage} disabled={!image || isProcessing} className="w-full py-3">
                  {isProcessing ? <><Loader2 size={18} className="animate-spin mr-2"/> Processing {progress}%</> : <><FileText size={18} className="mr-2"/> Extract Text</>}
               </Button>
            </div>
         </div>

         {/* Text Output */}
         <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
               <label className="text-xs font-bold text-slate-500 uppercase">Extracted Content</label>
               <button onClick={() => { navigator.clipboard.writeText(text); showToast("Copied!"); }} disabled={!text} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline disabled:opacity-50"><Copy size={14}/> Copy</button>
            </div>
            <textarea 
               value={text} 
               readOnly 
               className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none font-mono text-sm leading-relaxed"
               placeholder="Text will appear here..."
            />
         </div>
      </div>
    </div>
  );
}

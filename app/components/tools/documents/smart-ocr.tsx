"use client";
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { ScanLine, Copy, Check, Loader2, FileText, Upload, X, AlertCircle } from 'lucide-react';

export const SmartOCR = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setText("");
      setStatus("");
      setProgress(0);
    }
  };

  const processImage = async () => {
    if (!image) return;
    setIsProcessing(true);
    setText("");
    setStatus("Initializing OCR Engine...");
    setProgress(0);
    
    try {
      const result = await Tesseract.recognize(
        image,
        'eng',
        { 
          logger: m => {
            if (m.status === 'loading tesseract core') setStatus("Loading Core...");
            if (m.status === 'initializing api') setStatus("Warming up...");
            if (m.status === 'recognizing text') {
              setStatus("Scanning Text...");
              setProgress(Math.round(m.progress * 100));
            }
          } 
        }
      );

      const extractedText = result.data.text.trim();
      
      if (!extractedText) {
        setStatus("Scan complete, but no text was found.");
      } else {
        setText(extractedText);
        setStatus("Complete");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error: Failed to process image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)] min-h-[600px]">
       
       {/* LEFT: IMAGE STAGE */}
       <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          
          <div className="flex justify-between items-center mb-4 shrink-0">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
               <ScanLine size={14} /> Source Image
             </h3>
             {image && (
               <button 
                 onClick={() => {setImage(null); setText(""); setStatus("");}} 
                 className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 z-20"
               >
                 <X size={12} /> Remove
               </button>
             )}
          </div>

          <div className="flex-1 min-h-0 flex flex-col justify-center items-center relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 overflow-hidden">
             {!image ? (
                <div className="text-center p-8">
                   <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload size={32}/>
                   </div>
                   <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">Upload Document</p>
                   <p className="text-xs text-slate-400 mb-6">Best results with high contrast images</p>
                   
                   <label className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-lg text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                      Select Image
                      <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                   </label>
                </div>
             ) : (
                <img src={image} className="w-full h-full object-contain p-4" />
             )}
          </div>

          {/* ACTION BUTTON */}
          {image && (
             <div className="mt-4 shrink-0 z-10 relative">
                <button 
                  onClick={processImage} 
                  disabled={isProcessing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {isProcessing ? (
                     <>
                       <Loader2 className="animate-spin" size={18} /> 
                       {status} ({progress}%)
                     </>
                   ) : (
                     <>
                       <ScanLine size={18} /> Extract Text Now
                     </>
                   )}
                </button>
             </div>
          )}
       </div>

       {/* RIGHT: TEXT RESULT */}
       <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm relative">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 shrink-0">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
               <FileText size={14} /> Extracted Content
             </span>
             {text && (
                <button onClick={handleCopy} className="text-[#4a6b61] text-xs font-bold flex items-center gap-1 hover:bg-[#638c80]/10 dark:hover:bg-emerald-900/20 px-2 py-1 rounded transition-colors">
                   {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? "Copied" : "Copy Text"}
                </button>
             )}
          </div>
          
          <div className="flex-1 relative min-h-0">
             <textarea 
               value={text} 
               onChange={(e) => setText(e.target.value)}
               readOnly={isProcessing}
               // FIX: Changed 'loading' to 'isProcessing'
               placeholder={isProcessing ? "Scanning in progress..." : "Text will appear here after scanning..."}
               className="w-full h-full p-6 outline-none text-sm font-mono text-slate-700 dark:text-slate-300 leading-relaxed resize-none bg-transparent"
             />
             
             {/* STATES OVERLAY */}
             {(!text && !isProcessing && status !== "Complete") && (
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
                  <FileText size={48} className="text-slate-400 mb-2" />
                  <p className="text-xs text-slate-500">Waiting for scan...</p>
               </div>
             )}

             {isProcessing && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
                  <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{status}</p>
                  <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                     <div className="h-full bg-indigo-600 transition-all duration-300" style={{width: `${progress}%`}}></div>
                  </div>
               </div>
             )}
             
             {status.includes("no text") && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-slate-900/90 z-10">
                  <AlertCircle size={40} className="text-amber-500 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No Text Detected</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">Try an image with clearer text and higher contrast.</p>
               </div>
             )}
          </div>
       </div>

    </div>
  );
};

"use client";
import React, { useState } from 'react';
import { FileText, Upload, Copy } from 'lucide-react';

export const SmartOCR = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const process = (e: any) => {
    if(e.target.files[0]) {
      setImage(URL.createObjectURL(e.target.files[0]));
      setLoading(true);
      setTimeout(() => {
        setText("Extracted Text:\n\nThis is a simulated OCR result. In a real implementation, this would call Tesseract.js or an API to extract the actual text from the uploaded image.\n\nOneTool Enterprise\nInvoice #001\nTotal: $500.00");
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] p-6 gap-6">
       <div className="flex-1 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
          {image ? (
            <img src={image} className="max-h-full max-w-full object-contain"/>
          ) : (
            <label className="cursor-pointer text-center p-10">
               <input type="file" className="hidden" onChange={process} accept="image/*"/>
               <Upload size={48} className="mx-auto text-slate-400 mb-4"/>
               <p className="font-bold text-slate-600">Upload Image to Extract Text</p>
            </label>
          )}
       </div>
       
       <div className="w-full lg:w-[500px] bg-white dark:bg-slate-900 border rounded-3xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold flex items-center gap-2"><FileText size={18} className="text-teal-600"/> Extracted Text</h3>
             <button className="p-2 hover:bg-slate-100 rounded-lg"><Copy size={16}/></button>
          </div>
          <textarea 
             className="flex-1 w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl resize-none outline-none border-none font-mono text-sm" 
             value={loading ? "Scanning document..." : text}
             readOnly
             placeholder="Text will appear here..."
          />
       </div>
    </div>
  );
};

"use client";
import React, { useState } from 'react';
import { FileText, Upload, RefreshCw } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { Button, Textarea, CopyButton } from '@/app/components/shared';
import { showToast } from '@/app/shared/Toast';
import { MAX_IMAGE_FILE_SIZE } from '@/app/lib/constants';

export const SmartOCR = () => {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleUpload = (e: any) => {
    if (!e.target.files?.[0]) return;
    
    const uploadedFile = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      showToast(`${uploadedFile.name} is not a supported image format`, 'error');
      return;
    }
    
    // Validate file size (10MB limit)
    if (uploadedFile.size > MAX_IMAGE_FILE_SIZE) {
      showToast(`${uploadedFile.name} exceeds 10MB size limit`, 'error');
      return;
    }
    
    setImage(URL.createObjectURL(uploadedFile));
    setText("");
    setProgress(0);
  };

  const runOCR = async () => {
    if (!image) return;
    setLoading(true);
    setText("");
    
    try {
      const worker = await createWorker();
      
      const ret = await worker.recognize(image);
      setText(ret.data.text);
      await worker.terminate();
      showToast('Text extracted successfully', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not extract text';
      showToast(message || 'Error: Could not extract text. Please try a clearer image.', 'error');
      setText("");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
     navigator.clipboard.writeText(text);
     setCopied(true);
     setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] p-6 gap-6 bg-slate-50 dark:bg-[#0B1120]">
       {/* LEFT: UPLOAD */}
       <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-sm p-8">
          {image ? (
            <div className="relative w-full h-full flex flex-col items-center">
                <img src={image} className="max-w-full max-h-[80%] object-contain rounded-lg shadow-md border"/>
                <div className="mt-8 flex gap-4">
                   <Button
                     variant="outline"
                     size="md"
                     onClick={() => setImage(null)}
                   >
                     Change Image
                   </Button>
                   <Button
                     variant="secondary"
                     size="md"
                     onClick={runOCR}
                     loading={loading}
                     icon={!loading ? <RefreshCw size={16} /> : undefined}
                     className="bg-blue-600 hover:bg-blue-700"
                   >
                     {loading ? `Scanning ${progress}%` : "Extract Text"}
                   </Button>
                </div>
            </div>
          ) : (
            <label className="cursor-pointer text-center p-12 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all w-full h-full flex flex-col items-center justify-center">
               <input type="file" className="hidden" onChange={handleUpload} accept="image/*"/>
               <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-6 text-teal-600"><Upload size={40}/></div>
               <h3 className="font-bold text-xl text-slate-900 dark:text-white">Upload Document</h3>
               <p className="text-sm text-slate-500 mt-2">Supports JPG, PNG, Scans</p>
            </label>
          )}
       </div>
       
       {/* RIGHT: TEXT RESULT */}
       <div className="w-full lg:w-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
             <h3 className="font-bold flex items-center gap-2 text-slate-900 dark:text-white"><FileText size={18} className="text-teal-600"/> Extracted Content</h3>
             {text && <CopyButton text={text} />}
          </div>
          <Textarea
             readOnly
             value={text}
             placeholder={loading ? "Analyzing pixels..." : "Text results will appear here after scanning."}
             className="flex-1 font-mono text-sm leading-relaxed"
          />
       </div>
    </div>
  );
};

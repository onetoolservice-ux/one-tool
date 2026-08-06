"use client";
import React, { useState } from 'react';
import { UploadCloud, Download, Image as ImageIcon, FileText, ScanLine, CheckCircle, RefreshCw, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { showToast } from '@/app/shared/Toast';
import { logger } from '@/app/lib/utils/logger';
import { MAX_IMAGE_FILE_SIZE, MAX_PDF_FILE_SIZE } from '@/app/lib/constants';

interface FileEngineProps {
  toolId: string;
  title: string;
}

export const FileEngine = ({ toolId, title }: FileEngineProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const uploadedFile = e.target.files[0];
    
    // Validate file type
    const isImage = uploadedFile.type.startsWith('image/');
    const isPDF = uploadedFile.type === 'application/pdf';
    
    if (!isImage && !isPDF) {
      showToast(`${uploadedFile.name} is not a supported file format`, 'error');
      return;
    }
    
    // Validate file size
    const maxSize = isPDF ? MAX_PDF_FILE_SIZE : MAX_IMAGE_FILE_SIZE;
    if (uploadedFile.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      showToast(`${uploadedFile.name} exceeds ${maxSizeMB}MB size limit`, 'error');
      return;
    }
    
    setFile(uploadedFile);
    setPreview(isImage ? URL.createObjectURL(uploadedFile) : null);
    setDone(false);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setDone(false);
  };

  const processFile = async () => {
    if (!file) return;
    setProcessing(true);
    
    // Simulate processing
    await new Promise(r => setTimeout(r, 1500));

    try {
      if (toolId.includes('scan') || toolId.includes('pdf')) {
        // Mock PDF generation
        const doc = new jsPDF();
        doc.text(`Processed: ${file.name}`, 10, 10);
        doc.save(`processed-${file.name}.pdf`);
      } else {
        // Mock download
        const link = document.createElement('a');
        link.href = preview || "";
        link.download = `processed-${file.name}`;
        link.click();
      }
      setDone(true);
      showToast('File processed successfully', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process file';
      showToast(message || 'Error processing file. Please try again.', 'error');
      logger.error('File processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 h-[500px]">
      {!file ? (
        <div className="h-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all relative group">
           <input 
             type="file" 
             accept="image/*,.pdf" 
             onChange={handleUpload} 
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" 
           />
           <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {toolId.includes('scan') ? <ScanLine size={40}/> : <UploadCloud size={40}/>}
           </div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upload File</h2>
           <p className="text-slate-500 mt-2">Click or Drag & Drop</p>
        </div>
      ) : (
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center shadow-lg relative">
           <button onClick={clearFile} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={24}/></button>
           
           <div className="w-32 h-32 bg-slate-100 dark:bg-black/50 rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative border border-slate-200 dark:border-slate-700">
              {file.type.includes('image') && preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <FileText size={48} className="text-slate-400"/>
              )}
              {done && (
                <div className="absolute inset-0 bg-[#638c80]/90 flex items-center justify-center text-white animate-in fade-in">
                  <CheckCircle size={32} />
                </div>
              )}
           </div>
           
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{file.name}</h3>
           <p className="text-xs text-slate-500 mb-8">{(file.size/1024).toFixed(1)} KB</p>
           
           <button 
             onClick={processFile} 
             disabled={processing || done}
             className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
           >
              {processing ? <RefreshCw className="animate-spin" size={20}/> : done ? <Download size={20}/> : <CheckCircle size={20}/>}
              {processing ? "Processing..." : done ? "Download Again" : "Start Processing"}
           </button>
        </div>
      )}
    </div>
  );
};

"use client";
import React, { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { PdfCard } from './pdf-card';
import { PDFDocument, degrees } from 'pdf-lib';
import download from 'downloadjs';
import { UploadCloud, Plus, Download, ShieldCheck, Loader2, FileText, Trash2, RotateCw } from 'lucide-react';
import { FileUploader } from './file-uploader'; 

export const PdfWorkbench = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [rotations, setRotations] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setRotations((prev) => [...prev, ...new Array(newFiles.length).fill(0)]);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setRotations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRotate = (index: number) => {
    setRotations((prev) => {
      const newRot = [...prev];
      newRot[index] = (newRot[index] + 90) % 360;
      return newRot;
    });
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reorderedFiles = Array.from(files);
    const [movedFile] = reorderedFiles.splice(result.source.index, 1);
    reorderedFiles.splice(result.destination.index, 0, movedFile);

    const reorderedRots = Array.from(rotations);
    const [movedRot] = reorderedRots.splice(result.source.index, 1);
    reorderedRots.splice(result.destination.index, 0, movedRot);

    setFiles(reorderedFiles);
    setRotations(reorderedRots);
  };

  const mergeAndDownload = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        const fileBytes = await files[i].arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        const rotation = rotations[i];
        copiedPages.forEach((page) => {
            if (rotation > 0) page.setRotation(degrees(page.getRotation().angle + rotation));
            mergedPdf.addPage(page);
        });
      }
      const pdfBytes = await mergedPdf.save();
      download(pdfBytes, "onetool-merged.pdf", "application/pdf");
    } catch (e) {
      console.error(e);
      alert("Error processing PDF. Ensure files are valid and not password protected.");
    } finally {
      setIsProcessing(false);
    }
  };

  // STATE 1: EMPTY (The "Drop Zone")
  if (files.length === 0) {
    return (
      <div className="h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
         <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center hover:border-indigo-500/50 transition-all">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
               <UploadCloud size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Drag & Drop PDFs</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
               Secure client-side merging. Your documents never leave this browser tab.
            </p>
            <div className="relative inline-block">
               <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity">
                  Select Documents
               </button>
               <input 
                 type="file" 
                 multiple 
                 accept=".pdf" 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 onChange={(e) => e.target.files && handleFilesAdded(Array.from(e.target.files))} 
               />
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-[#4a6b61] dark:text-[#638c80] bg-[#638c80]/10 dark:bg-emerald-900/10 py-2 px-4 rounded-full w-fit mx-auto">
               <ShieldCheck size={14} /> 100% Private & Offline Capable
            </div>
         </div>
      </div>
    );
  }

  // STATE 2: THE WORKBENCH (Analyst View)
  return (
    <div className="flex flex-col h-[calc(100vh-60px)] animate-in fade-in duration-300">
      
      {/* 1. WORKBENCH TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 flex items-center justify-between shadow-sm z-10">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold">
               <FileText size={14} /> {files.length} Files
            </div>
            <label className="cursor-pointer flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
               <Plus size={16} /> Add More
               <input type="file" multiple accept=".pdf" className="hidden" onChange={(e) => e.target.files && handleFilesAdded(Array.from(e.target.files))} />
            </label>
         </div>

         <div className="flex items-center gap-2">
            <button 
               onClick={() => {setFiles([]); setRotations([]);}}
               className="text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-2 rounded-lg transition-colors"
            >
               Clear All
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
            <button 
               onClick={mergeAndDownload}
               disabled={isProcessing}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
               {isProcessing ? "Processing..." : "Merge PDF"}
            </button>
         </div>
      </div>

      {/* 2. THE CANVAS (Darkroom Mode) */}
      <div className="flex-1 bg-slate-50 dark:bg-[#0f1115] overflow-y-auto p-6">
         <div className="max-w-5xl mx-auto">
            <DragDropContext onDragEnd={onDragEnd}>
               <Droppable droppableId="pdf-grid" direction="horizontal">
                  {(provided) => (
                     <div 
                        {...provided.droppableProps} 
                        ref={provided.innerRef} 
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                     >
                        {files.map((file, index) => (
                           <PdfCard 
                              key={`${file.name}-${index}`} 
                              index={index} 
                              file={file} 
                              rotation={rotations[index]}
                              onRemove={handleRemove}
                              onRotate={handleRotate}
                           />
                        ))}
                        {provided.placeholder}
                     </div>
                  )}
               </Droppable>
            </DragDropContext>
         </div>
      </div>

    </div>
  );
};

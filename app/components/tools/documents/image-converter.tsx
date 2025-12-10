"use client";
import React, { useState } from 'react';
import { RefreshCw, ArrowRight, Download, Upload, Check, Image as ImageIcon } from 'lucide-react';
import jsPDF from 'jspdf';

export const ImageConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('image/png');
  const [converted, setConverted] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setConverted(null);
    }
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true);

    // Simulate slight delay for UX
    await new Promise(r => setTimeout(r, 500));

    if (format === 'application/pdf') {
       const pdf = new jsPDF();
       const img = new Image();
       img.src = URL.createObjectURL(file);
       img.onload = () => {
          const width = pdf.internal.pageSize.getWidth();
          const height = (img.height * width) / img.width;
          pdf.addImage(img, 'JPEG', 0, 0, width, height);
          setConverted(pdf.output('bloburl').toString()); // Correct way to get blob URL in modern jsPDF? 
          // Actually, for blob URL in newer jsPDF, usually pdf.output('bloburi') or we generate blob and create URL.
          // Let's use a simpler approach for the demo that works consistently:
          const blob = pdf.output('blob');
          setConverted(URL.createObjectURL(blob));
          setLoading(false);
       };
    } else {
       const img = new Image();
       img.src = URL.createObjectURL(file);
       img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
             // Fill white background for JPEGs (transparency fix)
             if (format === 'image/jpeg') {
                ctx.fillStyle = '#FFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
             }
             ctx.drawImage(img, 0, 0);
             setConverted(canvas.toDataURL(format));
          }
          setLoading(false);
       };
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-80px)] flex flex-col p-6">
       
       {/* HEADER */}
       <div className="flex items-center justify-between mb-8 p-6 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
               <RefreshCw className="text-indigo-600"/> Image Converter
            </h1>
            <p className="text-sm text-slate-500 mt-1">Convert between JPG, PNG, WEBP, and PDF.</p>
          </div>
          {file && !converted && (
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                   <span className="text-xs font-bold text-slate-500 pl-2 uppercase">To:</span>
                   <select 
                     value={format} 
                     onChange={(e) => setFormat(e.target.value)}
                     className="bg-transparent text-sm font-bold outline-none cursor-pointer p-1"
                   >
                      <option value="image/png">PNG</option>
                      <option value="image/jpeg">JPG</option>
                      <option value="image/webp">WEBP</option>
                      <option value="application/pdf">PDF</option>
                   </select>
                </div>
                <button onClick={convert} disabled={loading} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                   {loading ? <RefreshCw size={14} className="animate-spin"/> : <ArrowRight size={14}/>}
                   {loading ? "Converting..." : "Convert Now"}
                </button>
             </div>
          )}
       </div>

       {/* WORKSPACE */}
       <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          
          {!file ? (
            <label className="cursor-pointer flex flex-col items-center group">
               <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-indigo-600"/>
               </div>
               <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Upload Image</h3>
               <p className="text-sm text-slate-400 mt-2">Drag & drop or click to browse</p>
               <input type="file" className="hidden" accept="image/*" onChange={handleUpload}/>
            </label>
          ) : (
            <div className="w-full max-w-4xl grid grid-cols-2 gap-12 items-center h-full">
               
               {/* ORIGINAL */}
               <div className="flex flex-col items-center h-full justify-center">
                  <div className="relative group max-h-[400px]">
                     <img src={URL.createObjectURL(file)} className="max-h-[300px] object-contain rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"/>
                     <button onClick={()=>setFile(null)} className="absolute -top-3 -right-3 p-2 bg-slate-900 text-white rounded-full hover:bg-rose-500 transition-colors shadow-md">
                        <RefreshCw size={14}/>
                     </button>
                  </div>
                  <div className="mt-6 text-center">
                     <p className="text-xs font-bold text-slate-400 uppercase mb-1">Source</p>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{file.name}</p>
                     <p className="text-xs text-slate-500">{file.type.split('/')[1].toUpperCase()}</p>
                  </div>
               </div>

               {/* RESULT */}
               <div className="flex flex-col items-center h-full justify-center border-l-2 border-dashed border-slate-200 dark:border-slate-800 pl-12">
                  {converted ? (
                     <div className="text-center animate-in zoom-in w-full">
                        <div className="relative inline-block mb-6">
                           {format === 'application/pdf' ? (
                              <div className="w-48 h-64 bg-white shadow-xl border flex items-center justify-center rounded-lg">
                                 <FileText size={48} className="text-rose-500"/>
                              </div>
                           ) : (
                              <img src={converted} className="max-h-[300px] object-contain rounded-xl shadow-lg border border-emerald-500/30"/>
                           )}
                           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                              <Check size={20}/>
                           </div>
                        </div>
                        
                        <h3 className="text-xl font-black text-emerald-600 mb-6">Converted!</h3>
                        
                        <a 
                          href={converted} 
                          download={`converted-image.${format === 'application/pdf' ? 'pdf' : format.split('/')[1]}`} 
                          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg transition-transform hover:-translate-y-1 w-full max-w-xs mx-auto"
                        >
                           <Download size={16}/> Download {format === 'application/pdf' ? 'PDF' : format.split('/')[1].toUpperCase()}
                        </a>
                     </div>
                  ) : (
                     <div className="text-center opacity-30">
                        <div className="w-24 h-24 border-4 border-dashed border-slate-300 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                           <ArrowRight size={32}/>
                        </div>
                        <p className="font-bold text-slate-500">Ready to convert...</p>
                     </div>
                  )}
               </div>

            </div>
          )}
       </div>
    </div>
  );
};
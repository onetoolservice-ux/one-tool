"use client";
import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function ImageToPdf() {
  const [images, setImages] = useState<File[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setImages([...images, ...Array.from(e.target.files)]);
  };

  const convert = async () => {
    if (images.length === 0) return;
    try {
      const pdfDoc = await PDFDocument.create();
      for (const file of images) {
        const imageBytes = await file.arrayBuffer();
        let image;
        if (file.type === 'image/jpeg') image = await pdfDoc.embedJpg(imageBytes);
        else if (file.type === 'image/png') image = await pdfDoc.embedPng(imageBytes);
        if (image) {
            const page = pdfDoc.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "images.pdf";
      link.click();
      showToast("Converted Successfully!", "success");
    } catch (e) {
        showToast("Only JPG/PNG supported", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Image to PDF</h1>
        <p className="text-slate-500">Convert JPG/PNG images into a PDF.</p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-6">
         <div className="relative group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition text-center">
            <ImageIcon size={40} className="mx-auto text-slate-400 mb-3" />
            <span className="font-bold text-slate-600 dark:text-slate-300">Upload Images</span>
            <input type="file" accept="image/png, image/jpeg" multiple onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
         </div>
         {images.length > 0 && (
             <div className="grid grid-cols-3 gap-4">
                {images.map((f, i) => (
                    <div key={i} className="relative p-2 bg-slate-50 dark:bg-slate-900 border rounded-lg text-center">
                        <div className="text-xs truncate">{f.name}</div>
                        <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1"><X size={12}/></button>
                    </div>
                ))}
             </div>
         )}
         <Button onClick={convert} disabled={images.length === 0} className="w-full py-3">Convert to PDF</Button>
      </div>
    </div>
  );
}

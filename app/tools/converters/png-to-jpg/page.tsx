"use client";
import React, { useState, useRef } from "react";
import { Upload, Download, FileImage } from "lucide-react";
import Button from "@/app/shared/ui/Button";

export default function PngToJpg() {
  const [image, setImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
         setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const download = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = new Image();
    if (image && canvas && ctx) {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        // Fill white background for JPG (handling transparent PNGs)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement("a");
        link.download = "converted-image.jpg";
        link.href = canvas.toDataURL("image/jpeg", 0.9);
        link.click();
      };
      img.src = image;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-8">
       <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">PNG to JPG</h1>
        <p className="text-slate-500">Convert transparent PNGs to high-quality JPGs.</p>
      </div>

      {!image ? (
        <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl h-64 flex flex-col items-center justify-center relative hover:bg-slate-50 dark:hover:bg-slate-900/50 transition cursor-pointer">
           <Upload size={48} className="text-slate-300 mb-4"/>
           <span className="font-bold text-slate-600 dark:text-slate-400">Upload PNG</span>
           <input type="file" accept="image/png" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img src={image} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm" />
           <div className="flex gap-4">
              <Button onClick={download} className="flex-1 py-3"><Download size={18} className="mr-2"/> Download JPG</Button>
              <Button variant="secondary" onClick={()=>setImage(null)}>Cancel</Button>
           </div>
           <canvas ref={canvasRef} className="hidden"/>
        </div>
      )}
    </div>
  );
}

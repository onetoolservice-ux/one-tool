"use client";
import React, { useState } from "react";
import Button from "@/app/shared/ui/Button";
import { showToast } from "@/app/shared/Toast";

export default function SmartMeta() {
  const [title, setTitle] = useState("My Page Title");
  const [desc, setDesc] = useState("A description of my page.");
  const [image, setImage] = useState("https://example.com/image.jpg");

  const code = `
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${desc}">

<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${image}">

<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc}">
<meta property="twitter:image" content="${image}">
  `.trim();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 h-[calc(100vh-100px)] flex flex-col">
       <div className="text-center"><h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Meta Tag Generator</h1></div>
       
       <div className="grid grid-cols-2 gap-8 flex-1">
          <div className="space-y-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
             <div><label className="font-bold text-sm block mb-1">Page Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2 border rounded-lg"/></div>
             <div><label className="font-bold text-sm block mb-1">Description</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} className="w-full p-2 border rounded-lg h-24 resize-none"/></div>
             <div><label className="font-bold text-sm block mb-1">Image URL</label><input value={image} onChange={e=>setImage(e.target.value)} className="w-full p-2 border rounded-lg"/></div>
          </div>

          <div className="relative">
             <textarea readOnly value={code} className="w-full h-full p-6 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl resize-none focus:outline-none" />
             <Button onClick={() => {navigator.clipboard.writeText(code); showToast("HTML Copied!");}} className="absolute top-4 right-4">Copy HTML</Button>
          </div>
       </div>
    </div>
  );
}

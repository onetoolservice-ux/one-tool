"use client";
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Upload, User, Mail, Phone, MapPin, Palette, Building2, BadgeCheck } from 'lucide-react';

export const IdCardMaker = () => {
  const [loading, setLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // STATE
  const [photo, setPhoto] = useState<string | null>(null);
  const [color, setColor] = useState("#4f46e5");
  const [data, setData] = useState({
    name: "Rahul Sharma",
    role: "Senior Developer",
    id: "EMP-1024",
    phone: "+91 98765 43210",
    email: "rahul@company.com",
    company: "Tech Solutions Inc",
    address: "Cyber City, Gurugram",
    blood: "O+"
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPhoto(URL.createObjectURL(e.target.files[0]));
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
    const link = document.createElement('a');
    link.download = `ID-${data.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-500">
      
      {/* EDITOR */}
      <div className="flex-1 space-y-6">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2"><User size={14}/> Employee Details</h3>
            
            <div className="flex items-center gap-4 mb-6">
               <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                  {photo ? <img src={photo} className="w-full h-full object-cover" /> : <Upload size={20} className="text-slate-400"/>}
                  <input type="file" accept="image/*" onChange={handlePhoto} className="absolute inset-0 opacity-0 cursor-pointer" />
               </div>
               <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Theme Color</label>
                  <div className="flex gap-2 mt-1">
                     {["#4f46e5", "#dc2626", "#16a34a", "#000000", "#e11d48"].map(c => (
                       <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white ring-2 ring-indigo-500' : 'border-transparent'}`} style={{backgroundColor: c}} />
                     ))}
                     <input type="color" value={color} onChange={e=>setColor(e.target.value)} className="w-6 h-6 rounded-full overflow-hidden border-0 p-0" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">FULL NAME</label><input type="text" value={data.name} onChange={e=>setData({...data, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm font-semibold"/></div>
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">ROLE / DESIGNATION</label><input type="text" value={data.role} onChange={e=>setData({...data, role: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm font-semibold"/></div>
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">ID NUMBER</label><input type="text" value={data.id} onChange={e=>setData({...data, id: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm font-semibold"/></div>
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">BLOOD GRP</label><input type="text" value={data.blood} onChange={e=>setData({...data, blood: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm font-semibold"/></div>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2"><Building2 size={14}/> Company Details</h3>
            <div className="grid grid-cols-1 gap-4">
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">COMPANY NAME</label><input type="text" value={data.company} onChange={e=>setData({...data, company: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm font-semibold"/></div>
               <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">OFFICE ADDRESS</label><input type="text" value={data.address} onChange={e=>setData({...data, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm font-semibold"/></div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">PHONE</label><input type="text" value={data.phone} onChange={e=>setData({...data, phone: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm font-semibold"/></div>
                  <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500">EMAIL</label><input type="text" value={data.email} onChange={e=>setData({...data, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-3 py-2 text-sm font-semibold"/></div>
               </div>
            </div>
         </div>
      </div>

      {/* PREVIEW */}
      <div className="lg:w-[400px] flex flex-col items-center">
         <div className="mb-6 flex justify-between w-full items-center">
            <h2 className="text-sm font-bold text-slate-500 uppercase">Live Preview</h2>
            <button onClick={downloadCard} disabled={loading} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
               {loading ? "Exporting..." : <><Download size={14}/> Download PNG</>}
            </button>
         </div>

         {/* THE CARD (CR-80 Size Ratio: 3.375 x 2.125) */}
         <div 
            ref={cardRef}
            className="w-[320px] h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-col items-center text-center"
            style={{ borderTop: `8px solid ${color}` }}
         >
            {/* Header Curve */}
            <div className="absolute top-0 left-0 w-full h-32 rounded-b-[50%] opacity-10" style={{backgroundColor: color}}></div>
            
            <div className="mt-8 mb-4">
               <div className="w-32 h-32 rounded-full p-1 bg-white shadow-lg mx-auto overflow-hidden relative">
                  {photo ? <img src={photo} className="w-full h-full object-cover rounded-full" /> : <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300"><User size={40}/></div>}
               </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 leading-tight px-4">{data.name}</h2>
            <p className="text-sm font-bold opacity-80 uppercase tracking-wide mt-1" style={{color}}>{data.role}</p>
            <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-600">ID: {data.id}</div>

            <div className="mt-auto w-full p-6 pb-8 space-y-4">
               <div className="grid grid-cols-2 gap-4 text-left text-xs">
                  <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase">Phone</p>
                     <p className="font-semibold text-slate-700 truncate">{data.phone}</p>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold text-slate-400 uppercase">Blood Group</p>
                     <p className="font-semibold text-slate-700">{data.blood}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl text-left border border-slate-100">
                  <div className="bg-white p-1 rounded border border-slate-200">
                     <QRCodeSVG value={`BEGIN:VCARD\nFN:${data.name}\nTEL:${data.phone}\nEMAIL:${data.email}\nEND:VCARD`} size={48} />
                  </div>
                  <div>
                     <p className="font-bold text-slate-800 text-xs">{data.company}</p>
                     <p className="text-[9px] text-slate-500 leading-tight mt-0.5">{data.address}</p>
                  </div>
               </div>
            </div>
            
            {/* Bottom Color Bar */}
            <div className="h-3 w-full" style={{backgroundColor: color}}></div>
         </div>
      </div>

    </div>
  );
};

"use client";
import React, { useState, useRef } from 'react';
import { User, MapPin, Phone, Download, Upload } from 'lucide-react';
import html2canvas from 'html2canvas';

export const IdCardMaker = () => {
  const [data, setData] = useState({ name: "John Doe", role: "Senior Engineer", id: "EMP-2024", location: "Bangalore", phone: "+91 98765 43210" });
  const cardRef = useRef<HTMLDivElement>(null);

  const download = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2 });
    const link = document.createElement('a');
    link.download = 'id-card.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 max-w-5xl mx-auto h-[80vh]">
      <div className="w-full md:w-1/3 space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
        <h2 className="text-xl font-bold mb-4">Card Details</h2>
        <input value={data.name} onChange={e=>setData({...data, name: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="Full Name"/>
        <input value={data.role} onChange={e=>setData({...data, role: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="Job Title"/>
        <input value={data.id} onChange={e=>setData({...data, id: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="Employee ID"/>
        <input value={data.location} onChange={e=>setData({...data, location: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50" placeholder="Location"/>
        <button onClick={download} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mt-4">Download ID Card</button>
      </div>

      <div className="flex-1 flex justify-center items-center bg-slate-100 dark:bg-black/20 rounded-2xl">
        <div ref={cardRef} className="w-[320px] h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden relative flex flex-col items-center text-center border border-slate-200">
           <div className="h-32 w-full bg-gradient-to-br from-indigo-600 to-purple-600 mb-16 relative">
             <div className="w-32 h-32 bg-white rounded-full absolute -bottom-16 left-1/2 -translate-x-1/2 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                <User size={64} className="text-slate-300"/>
             </div>
           </div>
           <h2 className="text-2xl font-black text-slate-900 px-4">{data.name}</h2>
           <p className="text-indigo-600 font-bold uppercase tracking-wider text-sm mt-1">{data.role}</p>
           
           <div className="mt-8 space-y-3 w-full px-8">
             <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl text-left">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><User size={16}/></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-bold">ID Number</p><p className="font-bold text-slate-800">{data.id}</p></div>
             </div>
             <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl text-left">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600"><MapPin size={16}/></div>
                <div><p className="text-[10px] text-slate-400 uppercase font-bold">Location</p><p className="font-bold text-slate-800">{data.location}</p></div>
             </div>
           </div>

           <div className="mt-auto mb-6 w-full px-8">
              <div className="h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-mono tracking-widest">|||| ||| || |||</div>
           </div>
        </div>
      </div>
    </div>
  );
};

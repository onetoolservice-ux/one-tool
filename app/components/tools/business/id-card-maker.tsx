"use client";
import React, { useState, useRef } from 'react';
import { User, MapPin, Phone, Download, Upload, CreditCard, Repeat, Palette, Shield } from 'lucide-react';
import { showToast } from '@/app/shared/Toast';
import { MAX_IMAGE_FILE_SIZE } from '@/app/lib/constants';

export const IdCardMaker = () => {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [theme, setTheme] = useState('corporate');
  const [data, setData] = useState({ 
    name: "Sarah Connor", role: "Security Chief", id: "SKY-900", loc: "Los Angeles", 
    phone: "+1 987 654 3210", blood: "O+", emergency: "John (Husband)",
    address: "123 Innovation Dr, Tech City, Bangalore, India",
    terms: "If found, please return to OneTool HQ." // Added state for terms
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePhoto = (e: any) => {
    if (!e.target.files?.[0]) return;
    
    const uploadedFile = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      showToast('Please upload a JPG, PNG, WEBP, or GIF image', 'error');
      return;
    }
    
    // Validate file size (10MB limit)
    if (uploadedFile.size > MAX_IMAGE_FILE_SIZE) {
      showToast('Image exceeds 10MB size limit', 'error');
      return;
    }
    
    setPhoto(URL.createObjectURL(uploadedFile));
  };

  const download = async () => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const originalTransform = el.style.transform;
    el.style.transform = "none";
    
    // Dynamic import to fix Turbopack build issue
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(el, { scale: 3, backgroundColor: null });
    const link = document.createElement('a');
    link.download = `ID_Card_${side}.png`;
    link.href = canvas.toDataURL();
    link.click();
    el.style.transform = originalTransform;
  };

  const themes: any = {
    corporate: 'bg-gradient-to-br from-blue-700 to-indigo-800 text-white',
    elite: 'bg-gradient-to-br from-slate-900 to-black text-white border border-slate-700',
    creative: 'bg-gradient-to-br from-pink-500 to-rose-500 text-white',
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 w-full h-[calc(100vh-80px)] overflow-hidden">
       
       {/* LEFT: CONTROLS */}
       <div className="w-full lg:w-[360px] space-y-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-y-auto custom-scrollbar flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-blue-600"/> ID Builder</h2>
             <div className="flex gap-2">
                {Object.keys(themes).map(t => (
                   <button key={t} onClick={()=>setTheme(t)} className={`w-6 h-6 rounded-full ${themes[t].split(' ')[0]} border-2 border-white shadow-sm hover:scale-110 transition-transform ring-1 ring-slate-200`}></button>
                ))}
             </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6">
             <button onClick={()=>setSide('front')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${side==='front'?'bg-white dark:bg-slate-700 shadow text-blue-600':'text-slate-500'}`}>Front Side</button>
             <button onClick={()=>setSide('back')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${side==='back'?'bg-white dark:bg-slate-700 shadow text-blue-600':'text-slate-500'}`}>Back Side</button>
          </div>

          <div className="space-y-3">
             {side === 'front' ? (
                <>
                   <input value={data.name} onChange={e=>setData({...data, name: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 outline-none transition-all" placeholder="Full Name"/>
                   <input value={data.role} onChange={e=>setData({...data, role: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl text-sm bg-white dark:bg-slate-800 outline-none transition-all" placeholder="Role / Title"/>
                   <input value={data.id} onChange={e=>setData({...data, id: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl text-sm bg-white dark:bg-slate-800 outline-none transition-all" placeholder="ID Number"/>
                   <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center"><Upload size={16}/></div>
                      <span className="text-sm font-bold text-slate-500">Upload Photo</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handlePhoto}/>
                   </label>
                </>
             ) : (
                <>
                   <input value={data.blood} onChange={e=>setData({...data, blood: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl text-sm bg-white dark:bg-slate-800 outline-none transition-all" placeholder="Blood Group"/>
                   <input value={data.emergency} onChange={e=>setData({...data, emergency: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl text-sm bg-white dark:bg-slate-800 outline-none transition-all" placeholder="Emergency Contact"/>
                   <input value={data.phone} onChange={e=>setData({...data, phone: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl text-sm bg-white dark:bg-slate-800 outline-none transition-all" placeholder="Phone Number"/>
                   <input value={data.address} onChange={e=>setData({...data, address: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl text-sm bg-white dark:bg-slate-800 outline-none transition-all" placeholder="Address"/>
                   <textarea 
                     value={data.terms} 
                     onChange={e=>setData({...data, terms: e.target.value})}
                     className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl text-sm bg-white dark:bg-slate-800 h-24 resize-none outline-none transition-all" 
                     placeholder="Terms & Conditions..."
                   />
                </>
             )}
          </div>
          
          <button onClick={download} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg flex justify-center gap-2 hover:scale-[1.02] transition-all">
             <Download size={18}/> Download {side === 'front' ? 'Front' : 'Back'}
          </button>
       </div>

       {/* RIGHT: 3D PREVIEW */}
       <div className="flex-1 flex justify-center items-center perspective-1000 overflow-hidden p-4">
          <div 
             ref={cardRef}
             className={`
                w-[340px] h-[540px] rounded-[2rem] shadow-2xl relative overflow-hidden transition-all duration-700 transform-style-3d
                ${side === 'back' ? 'rotate-y-180' : ''} bg-white
             `}
             style={{ transformStyle: 'preserve-3d' }}
          >
             {/* --- FRONT SIDE --- */}
             <div className="absolute inset-0 flex flex-col bg-white h-full w-full backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                <div className={`h-40 w-full relative ${themes[theme]}`}>
                   <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full border-[6px] border-white bg-slate-200 overflow-hidden shadow-lg z-10">
                      {photo ? <img src={photo} className="w-full h-full object-cover"/> : <User size={64} className="text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>}
                   </div>
                   <div className="absolute top-6 right-6 opacity-50"><Shield size={32}/></div>
                </div>
                
                <div className="mt-20 text-center px-6">
                   <h1 className="text-3xl font-black text-slate-900">{data.name}</h1>
                   <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-1">{data.role}</p>
                </div>

                <div className="mt-10 px-8 space-y-4">
                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 border border-slate-200">#</div>
                      <div><p className="text-[10px] text-slate-400 font-bold uppercase">ID Number</p><p className="font-bold text-slate-800">{data.id}</p></div>
                   </div>
                   <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 border border-slate-200"><MapPin size={18}/></div>
                      <div><p className="text-[10px] text-slate-400 font-bold uppercase">Location</p><p className="font-bold text-slate-800">{data.loc}</p></div>
                   </div>
                </div>

                <div className="mt-auto mb-8 text-center opacity-40">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=OneTool" className="w-12 h-12 mx-auto mix-blend-multiply"/>
                </div>
             </div>

             {/* --- BACK SIDE --- */}
             <div className="absolute inset-0 bg-slate-900 text-white p-8 flex flex-col items-center text-center h-full w-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="w-full h-2 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full mb-8"></div>
                <h2 className="text-lg font-bold uppercase tracking-widest mb-12">Emergency Info</h2>
                
                <div className="space-y-8 w-full">
                   <div className="border-b border-white/10 pb-4">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Blood Group</p>
                      <p className="text-3xl font-black text-rose-500">{data.blood}</p>
                   </div>
                   <div className="border-b border-white/10 pb-4">
                      <p className="text-xs text-slate-400 uppercase font-bold mb-1">Emergency Contact</p>
                      <p className="text-lg font-bold">{data.emergency}</p>
                      <p className="text-sm text-slate-400">{data.phone}</p>
                   </div>
                </div>

                <div className="mt-auto text-xs text-slate-500 leading-relaxed">
                   <p className="mb-4">{data.terms}</p>
                   <p>{data.address}</p>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

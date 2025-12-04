"use client";
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Home, User, Calendar, IndianRupee, MapPin, Hash, Scissors, Stamp } from 'lucide-react';

const InputGroup = ({ label, value, onChange, placeholder, type="text", icon:Icon }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{label}</label>
    <div className="relative group">
      {Icon && <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"><Icon size={14}/></div>}
      <input 
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg h-10 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${Icon ? 'pl-9' : 'px-3'}`}
      />
    </div>
  </div>
);

export const RentReceiptGenerator = () => {
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState({
    tenant: "Rahul Kumar",
    landlord: "Amit Sharma",
    address: "Flat 402, Palm Heights, Bangalore",
    amount: "18000",
    pan: "ABCDE1234F",
    startMonth: "April 2024",
    months: 3
  });
  const [showStamp, setShowStamp] = useState(true);

  const handleDownload = async () => {
    if (!printRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, width, height);
      pdf.save('Rent-Receipts.pdf');
    } catch { alert("Error"); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)] p-4 animate-in fade-in duration-500">
       <div className="w-full lg:w-1/3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase border-b pb-2">Receipt Settings</h3>
          <InputGroup label="Tenant Name" value={data.tenant} onChange={(e:any)=>setData({...data, tenant: e.target.value})} icon={User} />
          <InputGroup label="Landlord Name" value={data.landlord} onChange={(e:any)=>setData({...data, landlord: e.target.value})} icon={User} />
          <InputGroup label="Address" value={data.address} onChange={(e:any)=>setData({...data, address: e.target.value})} icon={MapPin} />
          <div className="grid grid-cols-2 gap-3">
             <InputGroup label="Rent (₹)" type="number" value={data.amount} onChange={(e:any)=>setData({...data, amount: e.target.value})} icon={IndianRupee} />
             <InputGroup label="PAN No" value={data.pan} onChange={(e:any)=>setData({...data, pan: e.target.value})} icon={Hash} />
          </div>
          <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
             <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2"><Stamp size={14}/> Revenue Stamp</span>
             <button onClick={() => setShowStamp(!showStamp)} className={`w-9 h-5 rounded-full relative transition-colors ${showStamp ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${showStamp ? 'left-5' : 'left-0.5'}`}></div>
             </button>
          </div>
       </div>
       <div className="flex-1 bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 overflow-y-auto flex flex-col items-center">
          <div className="w-full max-w-[210mm] flex justify-end mb-4">
             <button onClick={handleDownload} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700">{loading?"Generating...":<><Download size={14}/> Download PDF</>}</button>
          </div>
          <div ref={printRef} className="bg-white text-slate-900 p-12 shadow-xl min-h-[297mm] w-[210mm] space-y-8">
             {Array.from({ length: data.months }).map((_, i) => (
                <div key={i} className="border-2 border-slate-900 p-8 relative mb-8">
                   <div className="absolute top-6 right-6 border border-slate-300 w-20 h-24 flex flex-col items-center justify-center bg-slate-50 text-[9px] text-center font-bold text-slate-400">
                      {showStamp ? <><Stamp size={24} className="mb-1 opacity-30"/><span className="opacity-50">REVENUE<br/>STAMP</span></> : "PASTE STAMP"}
                   </div>
                   <div className="text-center mb-8"><h1 className="text-2xl font-black uppercase underline decoration-double decoration-slate-300">Rent Receipt</h1><p className="text-xs font-bold text-slate-500 uppercase mt-1">{i === 0 ? data.startMonth : `Month ${i+1}`}</p></div>
                   <div className="space-y-4 text-sm font-medium text-slate-700 font-serif">
                      <p>Received from <strong>{data.tenant}</strong> a sum of <strong>₹ {Number(data.amount).toLocaleString('en-IN')}/-</strong> towards rent for <strong>{data.address}</strong>.</p>
                   </div>
                   <div className="flex justify-between items-end mt-10 pt-4"><div className="bg-slate-100 px-4 py-2 rounded"><p className="text-[10px] font-bold text-slate-400 uppercase">PAN</p><p className="font-mono font-bold">{data.pan}</p></div><div className="text-center w-48"><p className="font-bold mb-8 font-serif italic">{data.landlord}</p><p className="text-[10px] border-t border-slate-400 pt-1 font-bold uppercase">Signature</p></div></div>
                   {i < data.months - 1 && <div className="flex items-center gap-4 mb-8 opacity-30 mt-8"><div className="h-px bg-slate-400 border-b border-dashed border-slate-900 flex-1"></div><Scissors size={14}/><div className="h-px bg-slate-400 border-b border-dashed border-slate-900 flex-1"></div></div>}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};

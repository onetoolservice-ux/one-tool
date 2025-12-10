"use client";
import React, { useState, useRef } from 'react';
import { Download, FileText, IndianRupee, Calendar, User, MapPin, Hash, Scissors, Stamp, Printer, Copy } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const RentReceiptGenerator = () => {
  const [data, setData] = useState({
    tenantName: "Arjun Kumar",
    landlordName: "Rajesh Sharma",
    amount: "18500",
    address: "Flat 402, Green Valley, Bangalore",
    startMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
    pan: "ABCDE1234F"
  });
  
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [signatureFont, setSignatureFont] = useState(false); // Toggle digital sign
  const receiptRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const downloadPDF = async () => {
    if (!receiptRef.current) return;
    setLoading(true);
    
    const element = receiptRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    // A4 Size
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    // If batch mode is huge, we might need multiple pages logic, but for 12 receipts in a grid, one long image fits well if scaled.
    // Better: Add pages.
    
    if (mode === 'batch') {
       // For batch, we capture the whole scrollable area? No, we render them sequentially.
       // Simplified: Capture the visible grid.
    }
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(mode === 'batch' ? 'Annual_Rent_Receipts.pdf' : 'Rent_Receipt.pdf');
    setLoading(false);
  };

  const getMonths = () => {
    if (mode === 'single') return [data.startMonth];
    // Generate 12 months starting from April (Financial Year) or Selection
    const months = [];
    let current = new Date(data.startMonth + "-01");
    for (let i = 0; i < 12; i++) {
       months.push(current.toLocaleString('default', { month: 'long', year: 'numeric' }));
       current.setMonth(current.getMonth() + 1);
    }
    return months;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)] overflow-hidden p-4">
       {/* LEFT: FORM */}
       <div className="w-full lg:w-[400px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col z-10 shadow-xl overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold flex items-center gap-2"><FileText size={20} className="text-teal-600"/> Rent Details</h2>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={()=>setMode('single')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode==='single'?'bg-white shadow text-teal-600':'text-slate-500'}`}>Single</button>
                <button onClick={()=>setMode('batch')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode==='batch'?'bg-white shadow text-teal-600':'text-slate-500'}`}>Annual (12)</button>
             </div>
          </div>
          
          <div className="space-y-4 flex-1">
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Tenant Name</label><input value={data.tenantName} onChange={e=>setData({...data, tenantName: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-sm"/></div>
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Landlord Name</label><input value={data.landlordName} onChange={e=>setData({...data, landlordName: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-sm"/></div>
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Rent (₹)</label><input type="number" value={data.amount} onChange={e=>setData({...data, amount: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 font-bold text-sm text-teal-600"/></div>
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Property Address</label><textarea value={data.address} onChange={e=>setData({...data, address: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 font-medium text-sm h-20 resize-none"/></div>
             
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Start Month</label><input type="month" value={data.startMonth} onChange={e=>setData({...data, startMonth: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 text-sm"/></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Landlord PAN</label><input value={data.pan} onChange={e=>setData({...data, pan: e.target.value})} className="w-full p-3 border rounded-xl bg-slate-50 dark:bg-slate-950 text-sm"/></div>
             </div>

             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border">
                <input type="checkbox" checked={signatureFont} onChange={e=>setSignatureFont(e.target.checked)} className="w-4 h-4 accent-teal-600"/>
                <span className="text-xs font-bold text-slate-600">Use Digital Signature Font</span>
             </div>
          </div>

          <button onClick={downloadPDF} disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold mt-6 shadow-lg hover:scale-[1.02] transition-transform">
             {loading ? "Generating..." : <><Download size={16} className="inline mr-2"/> Download {mode === 'batch' ? '12 Receipts' : 'Receipt'}</>}
          </button>
       </div>

       {/* RIGHT: PREVIEW (Scrollable Grid) */}
       <div className="flex-1 bg-slate-100 dark:bg-black/20 p-8 overflow-y-auto flex justify-center">
          <div ref={receiptRef} className="bg-white w-[700px] min-h-[800px] p-8 shadow-2xl relative space-y-8">
             {getMonths().map((m, i) => (
                <div key={i} className="border-2 border-slate-800 p-6 relative bg-[#fffff8]">
                   {/* STAMP */}
                   <div className="absolute top-4 right-4 border border-slate-300 w-16 h-20 flex flex-col items-center justify-center bg-white shadow-sm rotate-[-2deg]">
                      <Stamp size={20} className="text-rose-400 opacity-50 mb-1"/>
                      <span className="text-[8px] font-bold text-slate-400 uppercase text-center leading-tight">Revenue<br/>Stamp</span>
                   </div>

                   <div className="text-center border-b-2 border-dashed border-slate-300 pb-4 mb-4">
                      <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">Rent Receipt</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">{mode==='single' ? new Date(data.startMonth).toLocaleString('default', {month:'long', year:'numeric'}) : m}</p>
                   </div>

                   <div className="space-y-3 text-sm font-serif text-slate-800 leading-relaxed">
                      <p>Received with thanks from <span className="font-bold border-b border-black px-1">{data.tenantName}</span></p>
                      <p>The sum of <span className="font-bold border-b border-black px-1">₹ {Number(data.amount).toLocaleString('en-IN')}/-</span></p>
                      <p>Towards rent for the period of <span className="font-bold border-b border-black px-1">{m}</span></p>
                      <p>For the property situated at: <span className="italic text-slate-600 block mt-1 pl-4 border-l-2 border-slate-300">{data.address}</span></p>
                   </div>

                   <div className="flex justify-between items-end mt-8">
                      <div className="text-xs text-slate-500">
                         <p>Landlord PAN: <b>{data.pan}</b></p>
                      </div>
                      <div className="text-center min-w-[150px]">
                         {signatureFont && <p className="font-cursive text-xl text-blue-800 mb-1" style={{fontFamily: 'cursive'}}>{data.landlordName}</p>}
                         <div className="border-t border-slate-800 pt-1">
                            <p className="text-[10px] font-bold uppercase">{data.landlordName}</p>
                            <p className="text-[8px] text-slate-400 uppercase">(Landlord Signature)</p>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};
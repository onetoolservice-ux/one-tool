"use client";
import React, { useState, useRef } from 'react';
import { Download, FileText, IndianRupee, Calendar, User, MapPin, Hash, Scissors, Stamp, Printer, Copy } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showToast } from '@/app/shared/Toast';

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
    
    try {
      const element = receiptRef.current;
      
      if (mode === 'single') {
        // Single receipt: simple capture
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Rent_Receipt.pdf');
      } else {
        // Batch mode: capture all receipts and split across pages
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const imgAspectRatio = imgWidth / imgHeight;
        const pdfAspectRatio = pdfWidth / pdfHeight;
        
        // Calculate how many pages we need
        const totalHeightInMM = (imgHeight * pdfWidth) / imgWidth;
        const pagesNeeded = Math.ceil(totalHeightInMM / pdfHeight);
        
        let yOffset = 0;
        for (let page = 0; page < pagesNeeded; page++) {
          if (page > 0) {
            pdf.addPage();
          }
          
          const sourceY = (yOffset / pdfWidth) * imgWidth;
          const sourceHeight = Math.min(imgHeight - sourceY, (pdfHeight / pdfWidth) * imgWidth);
          
          // Create a temporary canvas for this page
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = imgWidth;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
            const pageImgData = pageCanvas.toDataURL('image/png');
            pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, (sourceHeight * pdfWidth) / imgWidth);
          }
          
          yOffset += pdfHeight;
        }
        
        pdf.save('Annual_Rent_Receipts.pdf');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate PDF';
      showToast(message || 'Failed to generate PDF. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getMonths = () => {
    if (mode === 'single') {
      // Validate and format single month
      try {
        const date = new Date(data.startMonth + "-01");
        if (isNaN(date.getTime())) {
          return [new Date().toLocaleString('default', { month: 'long', year: 'numeric' })];
        }
        return [date.toLocaleString('default', { month: 'long', year: 'numeric' })];
      } catch {
        return [new Date().toLocaleString('default', { month: 'long', year: 'numeric' })];
      }
    }
    // Generate 12 months starting from selected month
    const months = [];
    try {
      const dateStr = data.startMonth + "-01";
      let current = new Date(dateStr);
      
      // Validate date
      if (isNaN(current.getTime())) {
        // Fallback to current month if invalid
        current = new Date();
        current.setDate(1);
      }
      
      for (let i = 0; i < 12; i++) {
        months.push(current.toLocaleString('default', { month: 'long', year: 'numeric' }));
        current.setMonth(current.getMonth() + 1);
      }
    } catch {
      // Fallback: generate 12 months from current date
      let current = new Date();
      current.setDate(1);
      for (let i = 0; i < 12; i++) {
        months.push(current.toLocaleString('default', { month: 'long', year: 'numeric' }));
        current.setMonth(current.getMonth() + 1);
      }
    }
    return months;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)] overflow-hidden p-3">
       {/* LEFT: FORM */}
       <div className="w-full lg:w-[360px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col z-10 shadow-xl overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-lg font-bold flex items-center gap-2"><FileText size={20} className="text-blue-600"/> Rent Details</h2>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={()=>setMode('single')} className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${mode==='single'?'bg-white shadow text-blue-600':'text-slate-500'}`}>Single</button>
                <button onClick={()=>setMode('batch')} className={`px-3 py-2 text-xs font-bold rounded-md transition-all ${mode==='batch'?'bg-white shadow text-blue-600':'text-slate-500'}`}>Annual (12)</button>
             </div>
          </div>
          
          <div className="space-y-3 flex-1">
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Tenant Name</label><input value={data.tenantName} onChange={e=>setData({...data, tenantName: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-800 font-bold text-sm outline-none transition-all"/></div>
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Landlord Name</label><input value={data.landlordName} onChange={e=>setData({...data, landlordName: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-800 font-bold text-sm outline-none transition-all"/></div>
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Monthly Rent (₹)</label><input type="text" inputMode="numeric" pattern="[0-9]*" value={data.amount} onChange={e=>{const val = e.target.value.replace(/[^0-9]/g, ''); setData({...data, amount: val})}} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-white outline-none transition-all"/></div>
             <div><label className="text-[10px] font-bold text-slate-400 uppercase">Property Address</label><textarea value={data.address} onChange={e=>setData({...data, address: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-800 font-medium text-sm h-20 resize-none outline-none transition-all"/></div>
             
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Start Month</label><input type="month" value={data.startMonth} onChange={e=>setData({...data, startMonth: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-800 text-sm outline-none transition-all"/></div>
                <div><label className="text-[10px] font-bold text-slate-400 uppercase">Landlord PAN</label><input value={data.pan} onChange={e=>setData({...data, pan: e.target.value})} className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-slate-800 text-sm outline-none transition-all"/></div>
             </div>

             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border">
                <input type="checkbox" checked={signatureFont} onChange={e=>setSignatureFont(e.target.checked)} className="w-4 h-4 accent-blue-600"/>
                <span className="text-xs font-semibold text-slate-600">Use Digital Signature Font</span>
             </div>
          </div>

          <button onClick={downloadPDF} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mt-4 shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed" title={loading ? "Generating PDF..." : `Download ${mode === 'batch' ? '12 receipts' : 'receipt'} as PDF`}>
             {loading ? "Generating PDF..." : <><Download size={16} className="inline mr-2"/> Download {mode === 'batch' ? '12 Receipts' : 'Receipt'}</>}
          </button>
       </div>

       {/* RIGHT: PREVIEW (Scrollable Grid) */}
       <div className="flex-1 bg-slate-100 dark:bg-black/20 p-8 overflow-y-auto flex justify-center">
          <div ref={receiptRef} className="bg-white w-[700px] min-h-[800px] p-8 shadow-2xl relative space-y-8">
             {getMonths().map((m, i) => (
                <div key={i} className="border-2 border-slate-800 p-5 relative bg-[#fffff8]">
                   {/* STAMP */}
                   <div className="absolute top-3 right-3 border border-slate-300 w-14 h-18 flex flex-col items-center justify-center bg-white shadow-sm rotate-[-2deg]">
                      <Stamp size={18} className="text-rose-400 opacity-50 mb-1"/>
                      <span className="text-[8px] font-bold text-slate-400 uppercase text-center leading-tight">Revenue<br/>Stamp</span>
                   </div>

                   <div className="text-center border-b-2 border-dashed border-slate-300 pb-3 mb-3">
                      <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">Rent Receipt</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase mt-1">{mode==='single' ? new Date(data.startMonth).toLocaleString('default', {month:'long', year:'numeric'}) : m}</p>
                   </div>

                   <div className="space-y-2.5 text-sm font-serif text-slate-800 leading-relaxed">
                      <p>Received with thanks from <span className="font-bold border-b border-black px-1">{data.tenantName}</span></p>
                      <p>The sum of <span className="font-bold border-b border-black px-1">₹ {Number(data.amount).toLocaleString('en-IN')}/-</span></p>
                      <p>Towards rent for the period of <span className="font-bold border-b border-black px-1">{m}</span></p>
                      <p>For the property situated at: <span className="italic text-slate-600 block mt-1 pl-4 border-l-2 border-slate-300">{data.address}</span></p>
                   </div>

                   <div className="flex justify-between items-end mt-6">
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
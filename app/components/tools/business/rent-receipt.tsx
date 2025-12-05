"use client";
import React, { useState, useRef } from 'react';
import { Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const RentReceiptGenerator = () => {
  const [data, setData] = useState({
    tenantName: "John Doe",
    landlordName: "Jane Smith",
    amount: "15000",
    address: "Flat 101, Galaxy Apts, Bangalore",
    month: "April 2024",
    pan: "ABCDE1234F"
  });
  const receiptRef = useRef<HTMLDivElement>(null);

  const download = async () => {
    if(!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { scale: 2 });
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save('Rent_Receipt.pdf');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)] p-4">
      <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 border rounded-2xl p-6 overflow-y-auto">
         <h2 className="font-bold mb-4 flex items-center gap-2"><FileText className="text-teal-600"/> Details</h2>
         <div className="space-y-4">
           {Object.keys(data).map(key => (
             <div key={key}>
               <label className="text-xs uppercase font-bold text-slate-500 block mb-1">{key.replace(/([A-Z])/g, ' $1')}</label>
               <input 
                 value={(data as any)[key]} 
                 onChange={e => setData({...data, [key]: e.target.value})} 
                 className="w-full p-2 border rounded-lg bg-slate-50 dark:bg-slate-950"
               />
             </div>
           ))}
           <button onClick={download} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold mt-4 hover:bg-teal-700">Download PDF</button>
         </div>
      </div>
      <div className="flex-1 bg-slate-100 dark:bg-black/20 p-8 flex justify-center overflow-y-auto">
         <div ref={receiptRef} className="bg-white text-slate-900 p-8 shadow-xl w-[600px] min-h-[400px]">
            <h1 className="text-2xl font-black text-center border-b pb-4 mb-6">RENT RECEIPT</h1>
            <div className="space-y-4 text-sm">
              <p>Received from <b>{data.tenantName}</b></p>
              <p>The sum of <b>₹{Number(data.amount).toLocaleString()}</b></p>
              <p>Towards Rent for <b>{data.month}</b></p>
              <p>Property: <i>{data.address}</i></p>
              <div className="flex justify-between mt-12 pt-8">
                 <div><b>PAN:</b> {data.pan}</div>
                 <div className="text-center"><div className="border-t border-black w-32 pt-1"></div><b>{data.landlordName}</b></div>
              </div>
            </div>
         </div>
      </div>
    </div>
  );
};
"use client";
import React, { useState, useRef } from 'react';
import { FileText, Plus, Trash2, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const InvoiceGenerator = () => {
  const [items, setItems] = useState([{ id: 1, desc: "Web Development", qty: 1, rate: 25000 }]);
  const [tax, setTax] = useState(18);
  const invRef = useRef<HTMLDivElement>(null);

  const subtotal = items.reduce((sum, i) => sum + (Number(i.qty) * Number(i.rate)), 0);
  const taxAmt = (subtotal * tax) / 100;
  const total = subtotal + taxAmt;

  const download = async () => {
    if (!invRef.current) return;
    const canvas = await html2canvas(invRef.current, { scale: 2 });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, (canvas.height * 210) / canvas.width);
    pdf.save('invoice.pdf');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)]">
      {/* CONTROLS */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-slate-900 border rounded-2xl p-6 overflow-y-auto">
         <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">Edit Items</h2>
            <button onClick={()=>setItems([...items, {id:Date.now(), desc:'', qty:1, rate:0}])} className="text-xs bg-teal-50 text-teal-600 px-3 py-1 rounded-lg font-bold">+ Add</button>
         </div>
         <div className="space-y-3">
            {items.map((item, i) => (
              <div key={item.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <input className="w-full bg-transparent font-bold text-sm mb-2 outline-none" placeholder="Item Name" value={item.desc} onChange={e=>{const n=[...items];n[i].desc=e.target.value;setItems(n)}} />
                <div className="flex gap-2">
                   <input type="number" className="w-16 p-1 text-xs border rounded" placeholder="Qty" value={item.qty} onChange={e=>{const n=[...items];n[i].qty=Number(e.target.value);setItems(n)}} />
                   <input type="number" className="flex-1 p-1 text-xs border rounded" placeholder="Rate" value={item.rate} onChange={e=>{const n=[...items];n[i].rate=Number(e.target.value);setItems(n)}} />
                   <button onClick={()=>setItems(items.filter(x=>x.id!==item.id))} className="text-rose-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
         </div>
         <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between mb-2 text-sm"><span>Tax Rate</span><span className="font-bold">{tax}%</span></div>
            <input type="range" min="0" max="30" value={tax} onChange={e=>setTax(Number(e.target.value))} className="w-full accent-teal-600"/>
         </div>
         <button onClick={download} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-6 flex items-center justify-center gap-2"><Download size={16}/> Download PDF</button>
      </div>

      {/* PREVIEW */}
      <div className="flex-1 bg-slate-100 dark:bg-black/20 p-8 flex justify-center overflow-y-auto rounded-2xl">
         <div ref={invRef} className="bg-white text-slate-900 w-[600px] min-h-[800px] p-12 shadow-xl">
            <div className="flex justify-between items-start mb-10">
               <h1 className="text-4xl font-black tracking-tighter">INVOICE</h1>
               <div className="text-right">
                  <h3 className="font-bold text-lg">OneTool Inc.</h3>
                  <p className="text-sm text-slate-500">Bangalore, India</p>
               </div>
            </div>
            <table className="w-full mb-8">
               <thead>
                  <tr className="border-b-2 border-slate-900 text-xs uppercase">
                     <th className="py-2 text-left">Item</th>
                     <th className="py-2 text-center">Qty</th>
                     <th className="py-2 text-right">Rate</th>
                     <th className="py-2 text-right">Amount</th>
                  </tr>
               </thead>
               <tbody>
                  {items.map(item => (
                     <tr key={item.id} className="border-b border-slate-100 text-sm">
                        <td className="py-3 font-bold">{item.desc}</td>
                        <td className="py-3 text-center">{item.qty}</td>
                        <td className="py-3 text-right">{item.rate.toLocaleString()}</td>
                        <td className="py-3 text-right font-bold">{(item.qty * item.rate).toLocaleString()}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
            <div className="flex justify-end">
               <div className="w-48 space-y-2 text-right">
                  <div className="text-sm text-slate-500">Subtotal: <span className="text-slate-900 font-bold">{subtotal.toLocaleString()}</span></div>
                  <div className="text-sm text-slate-500">Tax ({tax}%): <span className="text-slate-900 font-bold">{taxAmt.toLocaleString()}</span></div>
                  <div className="text-xl font-black border-t-2 border-slate-900 pt-2 mt-2">₹ {total.toLocaleString()}</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

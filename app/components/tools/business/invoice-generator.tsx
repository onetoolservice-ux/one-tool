"use client";
import React, { useState, useRef } from 'react';
import { FileText, Plus, Trash2, Download, Settings, Upload, PenTool, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';

// Helper Component (Defined inside to ensure self-containment for this fix)
interface CompactInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date';
  width?: string;
}

const CompactInput = ({ label, value, onChange, type="text", width="w-full" }: CompactInputProps) => (
  <div className={width}>
    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">{label}</label>
    <input 
      type={type} value={value} onChange={e => onChange(e.target.value)} 
      className="w-full h-8 text-xs px-2 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-lg outline-none font-medium transition-all"
    />
  </div>
);

export const InvoiceGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("₹");
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [taxRate, setTaxRate] = useState(18);
  const [discountRate, setDiscountRate] = useState(0);
  const [shipping, setShipping] = useState(0);

  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const [meta, setMeta] = useState({ number: "INV-001", date: new Date().toISOString().split('T')[0], due: "" });
  const [from, setFrom] = useState({ name: "OneTool Inc.", email: "billing@onetool.com", address: "Bangalore, India" });
  const [to, setTo] = useState({ name: "Acme Corp", email: "accounts@acme.com", address: "San Francisco, CA" });
  const [items, setItems] = useState([{ id: 1, name: "Service", qty: 1, rate: 10000 }]);

  const clearAllData = () => {
    setMeta({ number: "", date: new Date().toISOString().split('T')[0], due: "" });
    setFrom({ name: "", email: "", address: "" });
    setTo({ name: "", email: "", address: "" });
    setItems([{ id: 1, name: "", qty: 1, rate: 0 }]);
    setLogo(null);
    setSignature(null);
    showToast('All data cleared', 'success');
  };

  const previewRef = useRef<HTMLDivElement>(null);

  const subtotal = items.reduce((s, i) => s + (Number(i.qty) * Number(i.rate)), 0);
  const discountAmt = (subtotal * discountRate) / 100;
  const taxAmt = ((subtotal - discountAmt) * taxRate) / 100;
  const total = subtotal - discountAmt + taxAmt + Number(shipping);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'sign') => {
    if (!e.target.files?.[0]) return;
    
    const uploadedFile = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      showToast('Please upload a JPG, PNG, WEBP, or GIF image', 'error');
      return;
    }
    
    // Validate file size (5MB limit for logos/signatures)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (uploadedFile.size > maxSize) {
      showToast(`${type === 'logo' ? 'Logo' : 'Signature'} image exceeds 5MB size limit`, 'error');
      return;
    }
    
    const url = URL.createObjectURL(uploadedFile);
    if (type === 'logo') setLogo(url); else setSignature(url);
  };

  const downloadPDF = async () => {
    if (!previewRef.current) return;
    
    // Validate items
    if (items.length === 0) {
      showToast('Please add at least one item to the invoice', 'error');
      return;
    }
    
    const invalidItems = items.filter(item => 
      !item.name || item.name.trim() === '' || 
      Number(item.qty) <= 0 || 
      Number(item.rate) < 0
    );
    
    if (invalidItems.length > 0) {
      showToast('Please ensure all items have a name, quantity > 0, and rate >= 0', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
      pdf.save(`Invoice_${meta.number}.pdf`);
      showToast('PDF generated successfully', 'success');
    } catch (error) {
      const message = getErrorMessage(error);
      showToast(message || 'Failed to generate PDF. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
      {/* EDITOR */}
      <div className="w-full lg:w-[380px] border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 flex flex-col">
         <div className="h-14 px-5 border-b flex items-center justify-between">
            <div className="flex justify-between items-center">
               <h2 className="font-bold text-sm flex gap-2"><Settings size={16} className="text-blue-600"/> Settings</h2>
               <button 
                  onClick={clearAllData} 
                  className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label="Clear all data"
                  title="Clear all data"
               >
                  <X size={14}/> Clear
               </button>
            </div>
            <div className="flex gap-2">
               <input type="color" value={brandColor} onChange={e=>setBrandColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none"/>
               <button onClick={()=>setCurrency(currency==="₹"?"$":"₹")} className="text-xs font-bold border px-3 py-2 rounded">{currency}</button>
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
               <label className="h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                  {logo ? <img src={logo} className="h-full object-contain p-1"/> : <><Upload size={16} className="text-slate-400"/><span className="text-[10px] text-slate-400 font-bold mt-1">Logo</span></>}
                  <input type="file" className="hidden" onChange={e=>handleImage(e,'logo')}/>
               </label>
               <label className="h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50">
                  {signature ? <img src={signature} className="h-full object-contain p-1"/> : <><PenTool size={16} className="text-slate-400"/><span className="text-[10px] text-slate-400 font-bold mt-1">Sign</span></>}
                  <input type="file" className="hidden" onChange={e=>handleImage(e,'sign')}/>
               </label>
            </div>
            <div className="flex gap-2">
               <CompactInput label="Invoice #" value={meta.number} onChange={(v) => setMeta({...meta, number: v})} width="w-1/2"/>
               <CompactInput label="Date" type="date" value={meta.date} onChange={(v) => setMeta({...meta, date: v})} width="w-1/2"/>
            </div>
            <div className="space-y-4">
               <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">From</p>
                  <input value={from.name} onChange={e=>setFrom({...from, name: e.target.value})} className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 outline-none transition-all" placeholder="Company"/>
                  <input value={from.email} onChange={e=>setFrom({...from, email: e.target.value})} className="w-full text-xs bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 outline-none transition-all" placeholder="Email"/>
                  <input value={from.address} onChange={e=>setFrom({...from, address: e.target.value})} className="w-full text-xs bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 outline-none transition-all" placeholder="Address"/>
               </div>
               <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">To</p>
                  <input value={to.name} onChange={e=>setTo({...to, name: e.target.value})} className="w-full text-xs font-bold bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 outline-none transition-all" placeholder="Client"/>
                  <input value={to.email} onChange={e=>setTo({...to, email: e.target.value})} className="w-full text-xs bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 outline-none transition-all" placeholder="Email"/>
                  <input value={to.address} onChange={e=>setTo({...to, address: e.target.value})} className="w-full text-xs bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded px-2 py-1 outline-none transition-all" placeholder="Address"/>
               </div>
            </div>
            <div>
               <div className="flex justify-between items-center mb-2"><label className="text-[10px] font-bold uppercase text-slate-400">Items</label><button onClick={()=>setItems([...items, {id:Date.now(), name:'', qty:1, rate:0}])} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-[10px] font-bold transition-colors shadow-sm">+ Add</button></div>
               <div className="space-y-2">
                  {items.map((item, i) => (
                     <div key={item.id} className="flex gap-2 items-center">
                        <input value={item.name} onChange={e=>{const n=[...items];n[i].name=e.target.value;setItems(n)}} className="flex-1 text-xs border border-blue-300 dark:border-blue-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 outline-none transition-all" placeholder="Item"/>
                        <input type="text" inputMode="numeric" pattern="[0-9]*" value={item.qty} onChange={e=>{const val = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0; const n=[...items];n[i].qty=val;setItems(n)}} className="w-10 text-xs border border-blue-300 dark:border-blue-600 rounded-lg px-1 py-1 text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all"/>
                        <input type="text" inputMode="numeric" pattern="[0-9.]*" value={item.rate} onChange={e=>{const val = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0; const n=[...items];n[i].rate=val;setItems(n)}} className="w-14 text-xs border border-blue-300 dark:border-blue-600 rounded-lg px-1 py-1 text-right bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none transition-all"/>
                        <button onClick={()=>setItems(items.filter(x=>x.id!==item.id))} aria-label={`Remove ${item.name || 'item'}`} title={`Remove ${item.name || 'item'}`} className="p-1.5"><Trash2 size={14} className="text-slate-300 hover:text-red-500"/></button>
                     </div>
                  ))}
               </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3">
               <div className="flex justify-between items-center"><span className="text-xs text-slate-500">Subtotal</span><span className="text-xs font-bold">{currency} {subtotal}</span></div>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 w-16">Discount %</span>
                  <input type="text" inputMode="numeric" pattern="[0-9.]*" value={discountRate} onChange={e=>setDiscountRate(Number(e.target.value.replace(/[^0-9.]/g, '')) || 0)} className="w-12 h-6 text-xs text-center border rounded text-slate-900 dark:text-white"/>
                  <span className="ml-auto text-xs text-orange-500">-{currency} {discountAmt}</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 w-16">Tax %</span>
                  <input type="text" inputMode="numeric" pattern="[0-9.]*" value={taxRate} onChange={e=>setTaxRate(Number(e.target.value.replace(/[^0-9.]/g, '')) || 0)} className="w-12 h-6 text-xs text-center border rounded text-slate-900 dark:text-white"/>
                  <span className="ml-auto text-xs text-blue-500">+{currency} {taxAmt}</span>
               </div>
               <div className="flex justify-between border-t pt-2"><span className="font-bold text-sm">Total</span><span className="font-black text-lg" style={{color: brandColor}}>{currency} {total}</span></div>
            </div>
         </div>
         <div className="p-4 border-t"><button onClick={downloadPDF} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl font-bold text-xs flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title={loading ? "Generating PDF..." : "Download invoice as PDF"}>{loading ? "Generating..." : <><Download size={14}/> Download PDF</>}</button></div>
      </div>
      
      {/* PREVIEW */}
      <div className="flex-1 bg-slate-200/50 dark:bg-black/50 p-4 flex justify-center overflow-y-auto custom-scrollbar">
         <div className="shadow-2xl my-4">
            <div ref={previewRef} className="bg-white text-slate-900 w-[794px] min-h-[1123px] p-10 relative flex flex-col">
               <div className="flex justify-between items-start mb-6 pb-4 border-b-2" style={{borderColor: brandColor}}>
                  <div>{logo && <img src={logo} className="h-12 w-auto object-contain mb-1"/>}<h2 className="font-bold text-lg">{from.name}</h2><p className="text-xs text-slate-500">{from.address}</p></div>
                  <div className="text-right"><h1 className="text-4xl font-bold mb-1" style={{color: brandColor}}>INVOICE</h1><p className="font-semibold text-sm text-slate-400">#{meta.number}</p></div>
               </div>
               <div className="flex justify-between mb-8">
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Bill To</p><h3 className="font-bold text-lg">{to.name}</h3><p className="text-sm text-slate-500">{to.address}</p></div>
                  <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Date</p><p className="font-bold">{meta.date}</p></div>
               </div>
               <table className="w-full mb-8">
                  <thead><tr className="border-b-2 border-slate-100"><th className="text-left py-2">Item</th><th className="text-center py-2">Qty</th><th className="text-right py-2">Rate</th><th className="text-right py-2">Amount</th></tr></thead>
                  <tbody>{items.map((item, i) => (
                     <tr key={i} className="border-b border-slate-50 text-sm">
                        <td className="py-4 font-bold">{item.name}</td><td className="text-center">{item.qty}</td><td className="text-right">{currency} {item.rate}</td><td className="text-right font-bold">{currency} {item.qty * item.rate}</td>
                     </tr>
                  ))}</tbody>
               </table>
               <div className="flex justify-end mt-auto">
                  <div className="w-64 space-y-2 text-right">
                     <div className="flex justify-between"><span>Subtotal</span><span>{currency} {subtotal}</span></div>
                     <div className="flex justify-between text-orange-500"><span>Discount</span><span>-{currency} {discountAmt}</span></div>
                     <div className="flex justify-between text-blue-600"><span>Tax</span><span>+{currency} {taxAmt}</span></div>
                     <div className="flex justify-between font-black text-2xl border-t pt-2" style={{color: brandColor}}><span>Total</span><span>{currency} {total}</span></div>
                     {signature && <img src={signature} className="h-12 w-auto object-contain ml-auto mt-4"/>}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
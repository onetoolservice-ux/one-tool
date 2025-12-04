"use client";
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Download, Plus, Trash2,  
  Building2, UserSquare, FileText, ShoppingCart, 
  Hash, Globe, Mail, Phone, MapPin, Upload, X, PenTool, QrCode, Palette, Image as ImageIcon, Type
} from 'lucide-react';

// --- UI HELPERS ---
const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-3 mt-1">
    <div className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
      <Icon size={14} />
    </div>
    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wide">{title}</h3>
  </div>
);

const InputGroup = ({ label, value, onChange, placeholder, type = "text", icon: Icon, className = "" }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative group w-full">
      {Icon && <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Icon size={12}/></div>}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className={`
          w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg h-9 
          text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none 
          focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all 
          placeholder:font-normal placeholder:text-slate-400
          ${Icon ? 'pl-8 pr-2' : 'px-3'}
          ${type === 'date' ? 'cursor-pointer' : ''}
        `}
      />
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export const InvoiceGenerator = () => {
  const [loading, setLoading] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const sigCanvas = useRef<any>({});

  // DATA STATE
  const [logo, setLogo] = useState<string | null>(null);
  
  // UPDATED DEFAULT COLOR: #480a0a
  const [brandColor, setBrandColor] = useState("#480a0a"); 
  
  // Upload Modes
  const [qrMode, setQrMode] = useState<'text' | 'image'>('text');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [sigMode, setSigMode] = useState<'draw' | 'image'>('draw');
  const [sigImage, setSigImage] = useState<string | null>(null);
  const [drawnSignature, setDrawnSignature] = useState<string | null>(null);

  const [biz, setBiz] = useState({ name: "Acme Corp", email: "billing@acme.com", address: "123 Tech City", phone: "+1 555 0123", paymentInfo: "upi@hdfcbank" });
  const [client, setClient] = useState({ name: "John Doe", email: "john@client.com", address: "456 Market Town" });
  const [invMeta, setInvMeta] = useState({ number: "INV-001", date: new Date().toISOString().split('T')[0], due: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], currency: "₹", note: "Thank you!" });
  
  const [items, setItems] = useState([
    { id: 1, desc: "Professional Services", qty: 1, price: 25000 },
  ]);
  const [taxRate, setTaxRate] = useState(18);

  // --- ACTIONS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogo(URL.createObjectURL(file));
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setQrImage(URL.createObjectURL(file));
  };

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSigImage(URL.createObjectURL(file));
  };

  const clearDrawnSig = () => {
    sigCanvas.current.clear();
    setDrawnSignature(null);
  };

  const saveDrawnSig = () => {
    setDrawnSignature(sigCanvas.current.getTrimmedCanvas().toDataURL('image/png'));
  };

  // --- PAGINATION ---
  const ITEMS_FIRST_PAGE = 7;
  const ITEMS_PER_PAGE = 14;

  const chunkItems = () => {
    const chunks = [];
    chunks.push(items.slice(0, ITEMS_FIRST_PAGE));
    let remaining = items.slice(ITEMS_FIRST_PAGE);
    while (remaining.length > 0) {
      chunks.push(remaining.slice(0, ITEMS_PER_PAGE));
      remaining = remaining.slice(ITEMS_PER_PAGE);
    }
    if (chunks.length === 0) chunks.push([]);
    return chunks;
  };

  const pages = chunkItems();

  // --- CALCS ---
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  // --- PDF ---
  const handleDownload = async () => {
    if (!previewContainerRef.current) return;
    setLoading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageElements = previewContainerRef.current.querySelectorAll('.invoice-page');
      for (let i = 0; i < pageElements.length; i++) {
        const page = pageElements[i] as HTMLElement;
        const canvas = await html2canvas(page, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      pdf.save(`${invMeta.number}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error generating PDF.");
    } finally {
      setLoading(false);
    }
  };

  // State Helpers
  const addItem = () => setItems([...items, { id: Date.now(), desc: "", qty: 1, price: 0 }]);
  const removeItem = (id: number) => setItems(items.filter(i => i.id !== id));
  const updateBiz = (field: string, val: string) => setBiz(prev => ({ ...prev, [field]: val }));
  const updateClient = (field: string, val: string) => setClient(prev => ({ ...prev, [field]: val }));
  const updateMeta = (field: string, val: string) => setInvMeta(prev => ({ ...prev, [field]: val }));
  const updateItem = (id: number, field: string, val: string | number) => setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: val } : i));

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] animate-in fade-in duration-500 overflow-hidden">
      
      {/* LEFT: EDITOR (Compact) */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-5 space-y-6 custom-scrollbar pb-32">
         
         {/* BRANDING: LEFT (Color) - RIGHT (Logo) */}
         <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Theme Color</label>
               <div className="flex items-center gap-2">
                  <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-9 h-9 rounded cursor-pointer border-none bg-transparent" />
                  <span className="text-xs font-mono text-slate-500">{brandColor}</span>
               </div>
            </div>
            
            <div className="text-right">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Company Logo</label>
               {!logo ? (
                 <label className="inline-flex items-center justify-center w-24 h-9 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Upload size={10}/> Upload</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                 </label>
               ) : (
                 <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setLogo(null)} className="text-[10px] text-rose-500 font-bold hover:underline bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200">Remove</button>
                    <img src={logo} alt="Logo" className="w-9 h-9 object-contain border rounded bg-white" />
                 </div>
               )}
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            {/* FROM */}
            <div className="space-y-3">
                <SectionHeader icon={Building2} title="From (Biller)" />
                <InputGroup label="Name" value={biz.name} onChange={(e:any) => updateBiz('name', e.target.value)} placeholder="Company" />
                <InputGroup label="Email" value={biz.email} onChange={(e:any) => updateBiz('email', e.target.value)} placeholder="Email" />
                <InputGroup label="Phone" value={biz.phone} onChange={(e:any) => updateBiz('phone', e.target.value)} placeholder="Phone" />
                <InputGroup label="Address" value={biz.address} onChange={(e:any) => updateBiz('address', e.target.value)} placeholder="Address" />
            </div>

            {/* TO */}
            <div className="space-y-3">
                <SectionHeader icon={UserSquare} title="Bill To (Client)" />
                <InputGroup label="Name" value={client.name} onChange={(e:any) => updateClient('name', e.target.value)} placeholder="Client Name" />
                <InputGroup label="Email" value={client.email} onChange={(e:any) => updateClient('email', e.target.value)} placeholder="Email" />
                <InputGroup label="Address" value={client.address} onChange={(e:any) => updateClient('address', e.target.value)} placeholder="Address" />
            </div>
         </div>

         {/* META */}
         <div className="space-y-3">
            <SectionHeader icon={FileText} title="Invoice Details" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <InputGroup label="Invoice #" value={invMeta.number} onChange={(e:any) => updateMeta('number', e.target.value)} placeholder="001" icon={Hash} />
               <InputGroup label="Issued" type="date" value={invMeta.date} onChange={(e:any) => updateMeta('date', e.target.value)} />
               <InputGroup label="Due" type="date" value={invMeta.due} onChange={(e:any) => updateMeta('due', e.target.value)} />
               <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Currency</label>
                  <div className="relative w-full">
                    <Globe size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select value={invMeta.currency} onChange={e => updateMeta('currency', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg h-9 pl-8 pr-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none">
                        <option value="₹">INR (₹)</option>
                        <option value="$">USD ($)</option>
                        <option value="€">EUR (€)</option>
                    </select>
                  </div>
               </div>
            </div>
         </div>

         {/* ADVANCED: QR & SIGNATURE */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* PAYMENT QR */}
            <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
               <div className="flex justify-between items-center mb-2">
                  <SectionHeader icon={QrCode} title="Payment QR" />
                  <div className="flex bg-white dark:bg-slate-950 rounded-md p-0.5 border border-slate-200 dark:border-slate-700">
                     <button onClick={() => setQrMode('text')} className={`p-1 rounded ${qrMode==='text' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><Type size={12}/></button>
                     <button onClick={() => setQrMode('image')} className={`p-1 rounded ${qrMode==='image' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><ImageIcon size={12}/></button>
                  </div>
               </div>
               
               {qrMode === 'text' ? (
                 <InputGroup label="UPI ID / Link" value={biz.paymentInfo} onChange={(e:any) => updateBiz('paymentInfo', e.target.value)} placeholder="user@upi" />
               ) : (
                 <div className="text-center py-2">
                    {!qrImage ? (
                      <label className="cursor-pointer text-xs font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1">
                        <Upload size={12}/> Upload QR Image
                        <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative w-16 h-16 mx-auto group">
                         <img src={qrImage} className="w-full h-full object-contain border rounded" />
                         <button onClick={() => setQrImage(null)} className="absolute -top-1 -right-1 bg-rose-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* SIGNATURE */}
            <div className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
               <div className="flex justify-between items-center mb-2">
                  <SectionHeader icon={PenTool} title="Signature" />
                  <div className="flex bg-white dark:bg-slate-950 rounded-md p-0.5 border border-slate-200 dark:border-slate-700">
                     <button onClick={() => setSigMode('draw')} className={`p-1 rounded ${sigMode==='draw' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><PenTool size={12}/></button>
                     <button onClick={() => setSigMode('image')} className={`p-1 rounded ${sigMode==='image' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><ImageIcon size={12}/></button>
                  </div>
               </div>

               {sigMode === 'draw' ? (
                 <div className="border border-slate-200 dark:border-slate-700 rounded-lg bg-white overflow-hidden relative" onMouseUp={saveDrawnSig} onTouchEnd={saveDrawnSig}>
                    <SignatureCanvas ref={sigCanvas} penColor="black" canvasProps={{width: 200, height: 60, className: 'sigCanvas'}} />
                    {!drawnSignature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-slate-300 uppercase">Sign Here</div>}
                    <button onClick={clearDrawnSig} className="absolute bottom-1 right-1 text-[8px] text-rose-500 font-bold bg-white/80 px-1 rounded">Clear</button>
                 </div>
               ) : (
                 <div className="text-center py-4">
                    {!sigImage ? (
                      <label className="cursor-pointer text-xs font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1">
                        <Upload size={12}/> Upload Sig
                        <input type="file" accept="image/*" onChange={handleSigUpload} className="hidden" />
                      </label>
                    ) : (
                      <div className="relative h-14 mx-auto group">
                         <img src={sigImage} className="h-full object-contain mx-auto" />
                         <button onClick={() => setSigImage(null)} className="absolute top-0 right-0 bg-rose-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                      </div>
                    )}
                 </div>
               )}
            </div>
         </div>

         {/* ITEMS */}
         <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
               <SectionHeader icon={ShoppingCart} title="Line Items" />
               <button onClick={addItem} className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded hover:bg-indigo-100 transition-colors flex items-center gap-1">
                 <Plus size={12}/> Add
               </button>
            </div>
            {items.map((item, index) => (
               <div key={item.id} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 w-4">{index+1}</span>
                  <input type="text" value={item.desc} onChange={e => updateItem(item.id, 'desc', e.target.value)} className="flex-1 bg-transparent outline-none text-xs font-medium placeholder:text-slate-400" placeholder="Description..." />
                  <input type="number" value={item.qty} onChange={e => updateItem(item.id, 'qty', Number(e.target.value))} className="w-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded px-1 py-1 text-center text-xs font-bold" placeholder="Qty" />
                  <input type="number" value={item.price} onChange={e => updateItem(item.id, 'price', Number(e.target.value))} className="w-16 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded px-1 py-1 text-right text-xs font-bold" placeholder="Price" />
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
               </div>
            ))}
            
            <div className="flex justify-end mt-2">
               <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Tax %</span>
                  <input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-12 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded px-1 py-1 text-center text-xs font-bold" />
               </div>
            </div>
         </div>

      </div>

      {/* RIGHT: LIVE PREVIEW (Responsive & Clean) */}
      <div className="w-full lg:w-1/2 h-full flex flex-col bg-slate-100 dark:bg-black/20 border-l border-slate-200 dark:border-slate-800">
         <div className="p-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#638c80] animate-pulse"></div>
               <span className="text-xs font-bold text-slate-500 uppercase">Preview ({pages.length} Pages)</span>
            </div>
            <button onClick={handleDownload} disabled={loading} style={{backgroundColor: brandColor}} className="text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md">
               {loading ? "Generating..." : <><Download size={14}/> Download PDF</>}
            </button>
         </div>

         <div className="flex-1 overflow-auto p-6 bg-slate-200/50 dark:bg-black/50 flex flex-col items-center gap-6" ref={previewContainerRef}>
            {pages.map((pageItems, pageIndex) => (
               <div 
                  key={pageIndex}
                  className="invoice-page bg-white text-slate-900 shadow-xl p-8 flex flex-col justify-between text-xs relative"
                  style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm', aspectRatio: '210/297' }}
               >
                  <div>
                     {pageIndex === 0 ? (
                        <div className="mb-6">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-start gap-3">
                                 {logo && <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />}
                                 <div>
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-0.5">INVOICE</h1>
                                    <p className="font-bold text-sm" style={{color: brandColor}}>#{invMeta.number}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <h2 className="font-bold text-base text-slate-800">{biz.name || "Business Name"}</h2>
                                 <p className="text-slate-500 whitespace-pre-line max-w-[200px] ml-auto leading-tight text-[10px]">{biz.address}</p>
                                 <p className="text-slate-500 mt-0.5 text-[10px]">{biz.email}</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-6 mb-6 border-b border-slate-100 pb-4">
                              <div>
                                 <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Billed To</p>
                                 <h3 className="font-bold text-sm text-slate-900">{client.name || "Client Name"}</h3>
                                 <p className="text-slate-500 mt-0.5 text-[10px]">{client.email}</p>
                                 <p className="text-slate-500 whitespace-pre-line max-w-[200px] leading-tight text-[10px]">{client.address}</p>
                              </div>
                              <div className="text-right space-y-2">
                                 <div><span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Date</span><p className="font-bold text-slate-800 text-xs">{invMeta.date}</p></div>
                                 <div><span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Due</span><p className="font-bold text-slate-800 text-xs">{invMeta.due}</p></div>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                           <div className="text-slate-400 font-bold uppercase text-[10px]">Invoice #{invMeta.number} (Page {pageIndex + 1})</div>
                           <div className="text-slate-800 font-bold text-[10px]">{biz.name}</div>
                        </div>
                     )}

                     {/* TABLE */}
                     <div className="grid grid-cols-12 border-b border-slate-800 pb-1 mb-2 bg-slate-50 py-1.5 px-2 rounded-t">
                        <div className="col-span-6 text-left font-bold uppercase text-[9px] text-slate-600">Description</div>
                        <div className="col-span-2 text-center font-bold uppercase text-[9px] text-slate-600">Qty</div>
                        <div className="col-span-2 text-right font-bold uppercase text-[9px] text-slate-600">Price</div>
                        <div className="col-span-2 text-right font-bold uppercase text-[9px] text-slate-600">Total</div>
                     </div>
                     <div className="space-y-0.5">
                        {pageItems.map((item, i) => (
                           <div key={i} className="grid grid-cols-12 py-2 border-b border-slate-50 px-2 last:border-0">
                              <div className="col-span-6 font-semibold text-slate-700 text-[11px]">{item.desc || "Item"}</div>
                              <div className="col-span-2 text-center text-slate-500 text-[11px]">{item.qty}</div>
                              <div className="col-span-2 text-right text-slate-500 text-[11px]">{invMeta.currency} {item.price.toLocaleString()}</div>
                              <div className="col-span-2 text-right font-bold text-slate-900 text-[11px]">{invMeta.currency} {(item.qty * item.price).toLocaleString()}</div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-auto">
                     {pageIndex === pages.length - 1 && (
                        <div className="flex justify-end mb-6 mt-4 pt-4 border-t border-slate-100">
                           <div className="w-1/2 space-y-1">
                              <div className="flex justify-between text-slate-500 text-[10px]"><span>Subtotal</span><span>{invMeta.currency} {subtotal.toLocaleString()}</span></div>
                              <div className="flex justify-between text-slate-500 text-[10px]"><span>Tax ({taxRate}%)</span><span>{invMeta.currency} {taxAmount.toLocaleString()}</span></div>
                              <div className="flex justify-between text-lg font-black text-slate-900 border-t border-slate-900 pt-2 mt-1"><span>Total</span><span style={{color: brandColor}}>{invMeta.currency} {total.toLocaleString()}</span></div>
                           </div>
                        </div>
                     )}
                     
                     <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-3">
                           {(qrMode === 'text' && biz.paymentInfo) ? (
                              <div className="bg-white p-1 border border-slate-100 rounded"><QRCodeSVG value={biz.paymentInfo} size={48} /></div>
                           ) : qrImage && (
                              <div className="bg-white p-1 border border-slate-100 rounded"><img src={qrImage} className="w-12 h-12 object-contain"/></div>
                           )}
                           
                           {(qrMode === 'text' && biz.paymentInfo || qrImage) && (
                             <div className="text-[9px] text-slate-400">
                                <p className="font-bold text-slate-700">Scan to Pay</p>
                                {qrMode === 'text' && <p className="font-mono">{biz.paymentInfo}</p>}
                             </div>
                           )}
                        </div>
                        <div className="text-right">
                           {(sigMode === 'draw' && drawnSignature) ? (
                              <img src={drawnSignature} alt="Signed" className="h-10 object-contain ml-auto mb-1" />
                           ) : sigImage && (
                              <img src={sigImage} alt="Signed" className="h-10 object-contain ml-auto mb-1" />
                           )}
                           {(drawnSignature || sigImage) && <div className="text-[9px] text-slate-400 border-t border-slate-200 pt-1 inline-block min-w-[100px] text-center">Authorized Signature</div>}
                        </div>
                     </div>
                     
                     <div className="text-center mt-4 text-[9px] text-slate-300">
                       Page {pageIndex + 1} of {pages.length}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

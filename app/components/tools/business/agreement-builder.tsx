"use client";
import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SignatureCanvas from 'react-signature-canvas';
import { 
  Download, FileText, User, Calendar, MapPin, 
  PenTool, ShieldCheck, Briefcase, Home, GraduationCap, ScrollText,
  Upload, X, Image as ImageIcon, Palette, AlertCircle
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

const InputGroup = ({ label, value, onChange, placeholder, type = "text", area = false }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    {area ? (
      <textarea 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24 resize-none"
      />
    ) : (
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg h-9 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
      />
    )}
  </div>
);

export const AgreementBuilder = () => {
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const sigCanvasA = useRef<any>({});
  const sigCanvasB = useRef<any>({});

  // STATE
  const [template, setTemplate] = useState('rent');
  const [stampMode, setStampMode] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [jurisdiction, setJurisdiction] = useState("New Delhi");
  
  // Uploads
  const [logo, setLogo] = useState<string | null>(null);
  const [sigModeA, setSigModeA] = useState<'draw' | 'upload'>('draw');
  const [sigModeB, setSigModeB] = useState<'draw' | 'upload'>('draw');
  const [sigImgA, setSigImgA] = useState<string | null>(null);
  const [sigImgB, setSigImgB] = useState<string | null>(null);
  
  // Parties
  const [partyA, setPartyA] = useState({ name: "Landlord Name", address: "Full Address", idProof: "PAN: ABCDE1234F" });
  const [partyB, setPartyB] = useState({ name: "Tenant Name", address: "Permanent Address", idProof: "Aadhaar: 1234-5678-9012" });
  
  // Specifics
  const [rent, setRent] = useState("25000");
  const [deposit, setDeposit] = useState("100000");
  const [notice, setNotice] = useState("1 Month");

  // Signatures (Canvas)
  const [drawnSigA, setDrawnSigA] = useState<string | null>(null);
  const [drawnSigB, setDrawnSigB] = useState<string | null>(null);

  // --- HANDLERS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogo(URL.createObjectURL(file));
  };

  const handleSigUploadA = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSigImgA(URL.createObjectURL(file));
  };

  const handleSigUploadB = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSigImgB(URL.createObjectURL(file));
  };

  const saveDrawnA = () => setDrawnSigA(sigCanvasA.current.getTrimmedCanvas().toDataURL('image/png'));
  const saveDrawnB = () => setDrawnSigB(sigCanvasB.current.getTrimmedCanvas().toDataURL('image/png'));

  // --- TEMPLATES ---
  const getTemplateContent = () => {
    switch(template) {
      case 'rent':
        return (
          <div className="space-y-4 text-justify leading-relaxed text-xs">
            <p><strong>LEAVE AND LICENSE AGREEMENT</strong></p>
            <p>This Agreement is made on <strong>{date}</strong> at <strong>{jurisdiction}</strong>, BETWEEN:</p>
            <p><strong>{partyA.name}</strong>, residing at {partyA.address} ({partyA.idProof}) hereinafter referred to as the "LICENSOR".</p>
            <p>AND</p>
            <p><strong>{partyB.name}</strong>, residing at {partyB.address} ({partyB.idProof}) hereinafter referred to as the "LICENSEE".</p>
            <p className="mt-4 font-bold underline">TERMS AND CONDITIONS:</p>
            <ul className="list-decimal pl-4 space-y-2">
               <li><strong>License Fee:</strong> The Licensee shall pay a monthly fee of <strong>₹{rent}</strong> on or before the 5th of every month.</li>
               <li><strong>Security Deposit:</strong> The Licensee has paid an interest-free refundable deposit of <strong>₹{deposit}</strong>.</li>
               <li><strong>Tenure:</strong> This agreement is valid for a period of <strong>11 Months</strong> commencing from {date}.</li>
               <li><strong>Notice Period:</strong> Either party can terminate this agreement by giving <strong>{notice}</strong> written notice.</li>
               <li><strong>Usage:</strong> The premises shall be used for residential purposes only.</li>
            </ul>
          </div>
        );
      case 'nda':
        return (
          <div className="space-y-4 text-justify leading-relaxed text-xs">
            <p><strong>NON-DISCLOSURE AGREEMENT (NDA)</strong></p>
            <p>This Agreement is entered into on <strong>{date}</strong> by and between <strong>{partyA.name}</strong> ("Disclosing Party") and <strong>{partyB.name}</strong> ("Receiving Party").</p>
            <p className="mt-4 font-bold underline">NOW THIS AGREEMENT WITNESSETH:</p>
            <ul className="list-decimal pl-4 space-y-2">
               <li><strong>Confidential Information:</strong> Includes all data, code, business plans, and trade secrets disclosed by the Disclosing Party.</li>
               <li><strong>Obligations:</strong> The Receiving Party agrees to protect the confidentiality of the information with the same degree of care as its own confidential information.</li>
               <li><strong>Exclusions:</strong> Information already in the public domain is excluded from this agreement.</li>
               <li><strong>Jurisdiction:</strong> This agreement shall be governed by the laws of India and subject to the jurisdiction of courts in <strong>{jurisdiction}</strong>.</li>
            </ul>
          </div>
        );
      case 'intern':
        return (
          <div className="space-y-4 text-justify leading-relaxed text-xs">
            <p><strong>INTERNSHIP OFFER LETTER</strong></p>
            <p><strong>Date: {date}</strong></p>
            <p>To,<br/><strong>{partyB.name}</strong><br/>{partyB.address}</p>
            <p>Dear {partyB.name},</p>
            <p>We are pleased to offer you an internship at <strong>{partyA.name}</strong>. Your role will be <strong>Software Intern</strong>.</p>
            <ul className="list-disc pl-4 space-y-2">
               <li><strong>Stipend:</strong> You will receive a stipend of <strong>₹{rent}</strong> per month.</li>
               <li><strong>Duration:</strong> The internship will be for a period of <strong>{notice}</strong> starting from {date}.</li>
               <li><strong>Location:</strong> {partyA.address}.</li>
            </ul>
            <p>During your internship, you may have access to confidential information which you agree not to disclose.</p>
            <p>Welcome to the team!</p>
          </div>
        );
      default: return null;
    }
  };

  // --- ACTIONS ---
  const handleDownload = async () => {
    if (!previewRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Agreement-${template}.pdf`);
    } catch (err) {
      alert("Error generating PDF");
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (t: string) => {
    setTemplate(t);
    if(t==='rent') { setPartyA({...partyA, name: "Landlord Name", idProof: "PAN: ABCDE..."}); setPartyB({...partyB, name: "Tenant Name", idProof: "Aadhaar: 1234..."}); }
    if(t==='intern') { setPartyA({...partyA, name: "Company HR", idProof: ""}); setPartyB({...partyB, name: "Student Name", idProof: "College ID: 123"}); setRent("15000"); setNotice("6 Months"); }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] animate-in fade-in duration-500 overflow-hidden">
      
      {/* LEFT: EDITOR */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-5 space-y-6 custom-scrollbar pb-32">
         
         {/* TOP BAR: TEMPLATE & BRANDING */}
         <div className="flex gap-4">
            <div className="flex-1 grid grid-cols-3 gap-2">
                {[
                  { id: 'rent', label: 'Rent', icon: Home },
                  { id: 'intern', label: 'Offer', icon: GraduationCap },
                  { id: 'nda', label: 'NDA', icon: ShieldCheck }
                ].map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setPreset(t.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${template === t.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                  >
                    <t.icon size={16} className="mb-1" />
                    <span className="text-[10px] font-bold">{t.label}</span>
                  </button>
                ))}
            </div>
            
            {/* LOGO UPLOAD (Hidden for Rent) */}
            {template !== 'rent' && (
              <div className="w-24 animate-in fade-in zoom-in">
                 {!logo ? (
                   <label className="flex flex-col items-center justify-center h-full border border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                      <Upload size={14} className="text-slate-400 mb-1"/>
                      <span className="text-[10px] font-bold text-slate-500">Logo</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                   </label>
                 ) : (
                   <div className="relative h-full border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden group">
                      <img src={logo} className="w-full h-full object-contain p-1" />
                      <button onClick={() => setLogo(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><X size={14}/></button>
                   </div>
                 )}
              </div>
            )}
         </div>

         {/* PARTY A */}
         <div className="space-y-3">
            <SectionHeader icon={User} title={template === 'rent' ? "Licensor (Owner)" : "Party A (Company)"} />
            <div className="grid grid-cols-2 gap-3">
               <InputGroup label="Name" value={partyA.name} onChange={(e:any) => setPartyA({...partyA, name: e.target.value})} placeholder="Full Name" />
               <InputGroup label="ID Proof (PAN/CIN)" value={partyA.idProof} onChange={(e:any) => setPartyA({...partyA, idProof: e.target.value})} placeholder="PAN / GSTIN" />
            </div>
            <InputGroup label="Address" value={partyA.address} onChange={(e:any) => setPartyA({...partyA, address: e.target.value})} placeholder="Full Address" />
         </div>

         {/* PARTY B */}
         <div className="space-y-3">
            <SectionHeader icon={User} title={template === 'rent' ? "Licensee (Tenant)" : "Party B (Recipient)"} />
            <div className="grid grid-cols-2 gap-3">
               <InputGroup label="Name" value={partyB.name} onChange={(e:any) => setPartyB({...partyB, name: e.target.value})} placeholder="Full Name" />
               <InputGroup label="ID Proof (Aadhaar)" value={partyB.idProof} onChange={(e:any) => setPartyB({...partyB, idProof: e.target.value})} placeholder="Aadhaar" />
            </div>
            <InputGroup label="Address" value={partyB.address} onChange={(e:any) => setPartyB({...partyB, address: e.target.value})} placeholder="Permanent Address" />
         </div>

         {/* SPECIFICS */}
         <div className="space-y-3">
            <SectionHeader icon={FileText} title="Terms" />
            <div className="grid grid-cols-2 gap-3">
               <InputGroup label="Execution Date" type="date" value={date} onChange={(e:any) => setDate(e.target.value)} />
               <InputGroup label="Jurisdiction" value={jurisdiction} onChange={(e:any) => setJurisdiction(e.target.value)} />
            </div>
            {template === 'rent' && (
               <div className="grid grid-cols-3 gap-3">
                  <InputGroup label="Rent (₹)" value={rent} onChange={(e:any) => setRent(e.target.value)} />
                  <InputGroup label="Deposit (₹)" value={deposit} onChange={(e:any) => setDeposit(e.target.value)} />
                  <InputGroup label="Notice" value={notice} onChange={(e:any) => setNotice(e.target.value)} />
               </div>
            )}
         </div>

         {/* STAMP PAPER & SIGNATURES */}
         <div className="space-y-4">
            <div className={`flex items-center justify-between border p-3 rounded-lg transition-colors ${stampMode ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex flex-col">
                   <span className={`text-xs font-bold flex items-center gap-2 ${stampMode ? 'text-amber-800' : 'text-slate-600'}`}>
                     <ScrollText size={14}/> Stamp Paper Mode
                   </span>
                   <span className="text-[10px] text-slate-400 mt-0.5">Leaves 140mm top margin for printing</span>
                </div>
                <button onClick={() => setStampMode(!stampMode)} className={`w-8 h-4 rounded-full relative transition-colors ${stampMode ? 'bg-amber-500' : 'bg-slate-300'}`}>
                   <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${stampMode ? 'left-4.5' : 'left-0.5'}`}></div>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SIG A */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                   <div className="flex justify-between mb-2 items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Party A Sign</span>
                      <div className="flex bg-white dark:bg-slate-950 rounded p-0.5 border border-slate-200 dark:border-slate-700">
                         <button onClick={() => setSigModeA('draw')} className={`p-1 rounded ${sigModeA==='draw' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><PenTool size={10}/></button>
                         <button onClick={() => setSigModeA('upload')} className={`p-1 rounded ${sigModeA==='upload' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><ImageIcon size={10}/></button>
                      </div>
                   </div>
                   {sigModeA === 'draw' ? (
                      <div className="bg-white border rounded h-16 overflow-hidden relative" onMouseUp={saveDrawnA} onTouchEnd={saveDrawnA}>
                         <SignatureCanvas ref={sigCanvasA} penColor="black" canvasProps={{width: 200, height: 64, className: 'sigCanvas'}} />
                         {!drawnSigA && <span className="absolute inset-0 flex items-center justify-center text-[9px] text-slate-300 uppercase pointer-events-none">Draw</span>}
                      </div>
                   ) : (
                      <label className="flex flex-col items-center justify-center h-16 bg-white border border-dashed rounded cursor-pointer hover:bg-slate-50">
                         {sigImgA ? <img src={sigImgA} className="h-full object-contain" /> : <><Upload size={12} className="text-slate-400"/><span className="text-[9px] text-slate-400">Upload</span></>}
                         <input type="file" accept="image/*" onChange={handleSigUploadA} className="hidden" />
                      </label>
                   )}
                </div>

                {/* SIG B */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                   <div className="flex justify-between mb-2 items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Party B Sign</span>
                      <div className="flex bg-white dark:bg-slate-950 rounded p-0.5 border border-slate-200 dark:border-slate-700">
                         <button onClick={() => setSigModeB('draw')} className={`p-1 rounded ${sigModeB==='draw' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><PenTool size={10}/></button>
                         <button onClick={() => setSigModeB('upload')} className={`p-1 rounded ${sigModeB==='upload' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400'}`}><ImageIcon size={10}/></button>
                      </div>
                   </div>
                   {sigModeB === 'draw' ? (
                      <div className="bg-white border rounded h-16 overflow-hidden relative" onMouseUp={saveDrawnB} onTouchEnd={saveDrawnB}>
                         <SignatureCanvas ref={sigCanvasB} penColor="black" canvasProps={{width: 200, height: 64, className: 'sigCanvas'}} />
                         {!drawnSigB && <span className="absolute inset-0 flex items-center justify-center text-[9px] text-slate-300 uppercase pointer-events-none">Draw</span>}
                      </div>
                   ) : (
                      <label className="flex flex-col items-center justify-center h-16 bg-white border border-dashed rounded cursor-pointer hover:bg-slate-50">
                         {sigImgB ? <img src={sigImgB} className="h-full object-contain" /> : <><Upload size={12} className="text-slate-400"/><span className="text-[9px] text-slate-400">Upload</span></>}
                         <input type="file" accept="image/*" onChange={handleSigUploadB} className="hidden" />
                      </label>
                   )}
                </div>
            </div>
         </div>

      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="w-full lg:w-1/2 h-full flex flex-col bg-slate-100 dark:bg-black/20 border-l border-slate-200 dark:border-slate-800">
         <div className="p-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-end shadow-sm z-10">
            <button onClick={handleDownload} disabled={loading} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
               {loading ? "Generating..." : <><Download size={14}/> Download PDF</>}
            </button>
         </div>

         <div className="flex-1 overflow-auto p-8 bg-slate-200/50 dark:bg-black/50 flex justify-center">
            <div 
               ref={previewRef}
               className="bg-white text-slate-900 shadow-xl p-12 text-sm relative flex flex-col justify-between"
               style={{ 
                  width: '210mm', 
                  minHeight: '297mm', 
                  fontFamily: 'Times New Roman, serif',
                  paddingTop: stampMode ? '140px' : '48px'
               }}
            >
               {/* STAMP MODE VISUAL GUIDE */}
               {stampMode && (
                 <div className="absolute top-0 left-0 w-full h-[140px] bg-amber-50/50 border-b-2 border-dashed border-amber-300 flex items-center justify-center text-amber-700/50 font-bold uppercase tracking-widest text-xs pointer-events-none print:hidden">
                    Reserved for Government Stamp (Not Printed)
                 </div>
               )}

               <div>
                  {/* LOGO & HEADER */}
                  {(!stampMode && template !== 'rent') && (
                     <div className="mb-8 text-center">
                        {logo && <img src={logo} className="h-16 object-contain mx-auto mb-4" />}
                        <h1 className="text-2xl font-bold uppercase underline decoration-double decoration-slate-300">
                          {template === 'intern' ? 'Internship Offer Letter' : 'Non-Disclosure Agreement'}
                        </h1>
                     </div>
                  )}
                  
                  {/* For Rent, just Title */}
                  {(!stampMode && template === 'rent') && (
                     <h1 className="text-2xl font-bold text-center uppercase mb-8 underline decoration-double decoration-slate-300">
                       Leave and License Agreement
                     </h1>
                  )}
                  
                  {getTemplateContent()}
               </div>

               <div className="mt-20">
                  <div className="grid grid-cols-2 gap-12 mb-8">
                     <div>
                        {/* SIG A */}
                        {(sigModeA === 'draw' && drawnSigA) ? <img src={drawnSigA} className="h-12 mb-2 object-contain"/> : sigImgA ? <img src={sigImgA} className="h-12 mb-2 object-contain"/> : <div className="h-12 mb-2"></div>}
                        <div className="border-t border-black pt-2">
                           <p className="font-bold">{partyA.name}</p>
                           <p className="text-xs text-slate-500">{template === 'rent' ? 'Licensor' : 'Party A'}</p>
                        </div>
                     </div>
                     <div>
                        {/* SIG B */}
                        {(sigModeB === 'draw' && drawnSigB) ? <img src={drawnSigB} className="h-12 mb-2 object-contain"/> : sigImgB ? <img src={sigImgB} className="h-12 mb-2 object-contain"/> : <div className="h-12 mb-2"></div>}
                        <div className="border-t border-black pt-2">
                           <p className="font-bold">{partyB.name}</p>
                           <p className="text-xs text-slate-500">{template === 'rent' ? 'Licensee' : 'Party B'}</p>
                        </div>
                     </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 border-t border-slate-200 pt-4">
                     <p className="mb-4 font-bold uppercase text-slate-700">Witnesses:</p>
                     <div className="grid grid-cols-2 gap-12">
                        <div className="border-b border-dashed border-slate-300 h-8 flex items-end">1. _______________________</div>
                        <div className="border-b border-dashed border-slate-300 h-8 flex items-end">2. _______________________</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

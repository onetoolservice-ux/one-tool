"use client";
import React, { useState, useRef } from 'react';
import { FileText, Download, PenTool, CheckCircle, ChevronDown, Copy } from 'lucide-react';
import jsPDF from 'jspdf';

export const AgreementBuilder = () => {
  const [template, setTemplate] = useState('NDA');
  
  const [data, setData] = useState({
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    partyA: "TechCorp Solutions",
    partyB: "John Doe",
    location: "Bangalore, India",
    amount: "50,000",
    service: "Software Development",
    duration: "12 Months"
  });

  const templates: any = {
    NDA: {
      title: "NON-DISCLOSURE AGREEMENT",
      content: `This Non-Disclosure Agreement (the "Agreement") is entered into on ${data.date} between:\n\n1. ${data.partyA} ("Disclosing Party")\n2. ${data.partyB} ("Receiving Party")\n\nWHEREAS, the Disclosing Party possesses certain confidential proprietary information and wishes to share it with the Receiving Party for the purpose of a potential business relationship.\n\nNOW, THEREFORE, the parties agree as follows:\n\n1. DEFINITION\n"Confidential Information" shall mean any and all technical and non-technical information including patent, copyright, trade secret, and proprietary information.\n\n2. OBLIGATIONS\nThe Receiving Party agrees to hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party.\n\n3. JURISDICTION\nThis Agreement shall be governed by the laws of ${data.location}.`
    },
    Offer: {
      title: "EMPLOYMENT OFFER LETTER",
      content: `Date: ${data.date}\n\nTo,\n${data.partyB}\n\nDear ${data.partyB.split(' ')[0]},\n\nWe are pleased to offer you the position of "Senior Consultant" at ${data.partyA}.\n\nCOMPENSATION\nYour annual Cost to Company (CTC) will be INR ${data.amount} per annum.\n\nPROBATION\nYou will be on a probation period of 3 months from your date of joining.\n\nWe look forward to welcoming you to the team.\n\nSincerely,\nHR Manager\n${data.partyA}`
    },
    Freelance: {
      title: "FREELANCE SERVICE AGREEMENT",
      content: `This Agreement is made on ${data.date} between ${data.partyA} ("Client") and ${data.partyB} ("Contractor").\n\n1. SCOPE OF WORK\nContractor agrees to provide the following services: ${data.service}.\n\n2. PAYMENT\nClient agrees to pay Contractor a total fee of ${data.amount} for the services rendered.\n\n3. TERM\nThis agreement shall remain in effect for ${data.duration}.\n\nIN WITNESS WHEREOF, the parties have executed this Agreement.`
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    
    const current = templates[template];
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text(current.title, 105, 20, { align: "center" });
    
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(current.content, 170);
    doc.text(splitText, 20, 40);
    
    doc.save(`${template}_Contract.pdf`);
  };

  const Input = ({ label, k, placeholder }: any) => (
    <div className="space-y-1">
       <label className="text-[10px] font-bold text-slate-400 uppercase">{label}</label>
       <input 
         value={(data as any)[k]} 
         onChange={e=>setData({...data, [k]: e.target.value})} 
         className="w-full p-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-teal-500 transition-all font-medium"
         placeholder={placeholder}
       />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
      
      {/* LEFT: EDITOR */}
      <div className="w-[400px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-xl flex-shrink-0">
         <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4"><FileText className="text-teal-600" size={16}/> Contract Settings</h2>
            <div className="relative">
               <select value={template} onChange={e=>setTemplate(e.target.value)} className="w-full appearance-none p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none cursor-pointer">
                  <option value="NDA">Non-Disclosure Agreement</option>
                  <option value="Offer">Offer Letter</option>
                  <option value="Freelance">Freelance Contract</option>
               </select>
               <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            <Input label="Date" k="date" />
            <div className="grid grid-cols-2 gap-3">
               <Input label="Party A (Company)" k="partyA" />
               <Input label="Party B (Person)" k="partyB" />
            </div>
            
            {template === 'NDA' && <Input label="Jurisdiction Location" k="location" />}
            
            {(template === 'Offer' || template === 'Freelance') && (
               <div className="grid grid-cols-2 gap-3">
                  <Input label="Amount / Salary" k="amount" />
                  <Input label={template === 'Offer' ? 'Role' : 'Service Type'} k={template === 'Offer' ? 'role' : 'service'} />
               </div>
            )}
            
            {template === 'Freelance' && <Input label="Duration" k="duration" />}
         </div>

         <div className="p-4 border-t bg-white dark:bg-slate-900">
            <button onClick={handleDownload} className="w-full bg-slate-900 text-white h-10 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg">
               <Download size={14}/> Download PDF
            </button>
         </div>
      </div>

      {/* RIGHT: PREVIEW */}
      <div className="flex-1 bg-slate-100 dark:bg-black/50 p-8 flex justify-center overflow-y-auto">
         <div className="bg-white text-slate-900 w-[700px] min-h-[900px] p-16 shadow-2xl relative">
            <h1 className="text-2xl font-bold text-center mb-12 uppercase tracking-wide border-b-2 border-slate-900 pb-4">{templates[template].title}</h1>
            <div className="font-serif text-[15px] leading-8 whitespace-pre-wrap text-justify">
               {templates[template].content}
            </div>
            
            <div className="mt-24 flex justify-between pt-8 border-t border-slate-200">
               <div className="text-center">
                  <div className="h-12 w-40 border-b border-black mb-2"></div>
                  <p className="font-bold text-sm">{data.partyA}</p>
                  <p className="text-xs text-slate-500 uppercase">Signature</p>
               </div>
               <div className="text-center">
                  <div className="h-12 w-40 border-b border-black mb-2"></div>
                  <p className="font-bold text-sm">{data.partyB}</p>
                  <p className="text-xs text-slate-500 uppercase">Signature</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
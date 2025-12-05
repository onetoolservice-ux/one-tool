"use client";
import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';

export const AgreementBuilder = () => {
  const [type, setType] = useState("NDA");
  const [partyA, setPartyA] = useState("[Your Company]");
  const [partyB, setPartyB] = useState("[Client Name]");

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Contract Generator</h1>
        <select value={type} onChange={e=>setType(e.target.value)} className="p-2 border rounded-lg font-bold bg-slate-50">
           <option value="NDA">Non-Disclosure Agreement (NDA)</option>
           <option value="SLA">Service Level Agreement (SLA)</option>
           <option value="Offer">Employment Offer Letter</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Party A (Disclosing)</label><input value={partyA} onChange={e=>setPartyA(e.target.value)} className="w-full p-3 border rounded-xl"/></div>
         <div><label className="block text-xs font-bold uppercase text-slate-400 mb-1">Party B (Receiving)</label><input value={partyB} onChange={e=>setPartyB(e.target.value)} className="w-full p-3 border rounded-xl"/></div>
      </div>

      <div className="bg-white border shadow-sm p-10 rounded-xl min-h-[500px] font-serif text-slate-800 leading-relaxed">
         <h2 className="text-center text-xl font-bold uppercase mb-8 underline">{type === 'NDA' ? 'NON-DISCLOSURE AGREEMENT' : type}</h2>
         <p className="mb-4">This Agreement is made on <b>{new Date().toLocaleDateString()}</b>, between <b>{partyA}</b> ("Disclosing Party") and <b>{partyB}</b> ("Receiving Party").</p>
         
         <h3 className="font-bold mt-6 mb-2">1. Confidential Information</h3>
         <p className="mb-4">The Receiving Party agrees not to disclose any confidential information obtained from the Disclosing Party to any third party without prior written consent.</p>

         <h3 className="font-bold mt-6 mb-2">2. Term</h3>
         <p className="mb-4">This agreement shall remain in effect for a period of 2 years from the date of signing.</p>

         <h3 className="font-bold mt-6 mb-2">3. Governing Law</h3>
         <p className="mb-8">This agreement shall be governed by the laws of India.</p>

         <div className="flex justify-between mt-16 pt-8 border-t">
            <div><div className="h-10 border-b-2 border-black w-48 mb-2"></div><p>Signed by: {partyA}</p></div>
            <div><div className="h-10 border-b-2 border-black w-48 mb-2"></div><p>Signed by: {partyB}</p></div>
         </div>
      </div>
      
      <div className="mt-8 text-center">
         <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"><Download size={18}/> Download Contract</button>
      </div>
    </div>
  );
};

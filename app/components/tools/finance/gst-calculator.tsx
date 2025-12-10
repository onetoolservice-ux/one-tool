"use client";
import React, { useState } from 'react';
import { Percent, ArrowRightLeft, Copy, Check } from 'lucide-react';

export const GstCalculator = () => {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(18);
  const [type, setType] = useState<'ex' | 'in'>('ex');
  const [copied, setCopied] = useState(false);

  const gst = type === 'ex' ? (amount * rate) / 100 : amount - (amount * (100 / (100 + rate)));
  const net = type === 'ex' ? amount : amount - gst;
  const total = type === 'ex' ? amount + gst : amount;

  const copy = () => {
    navigator.clipboard.writeText(`Net: ${net.toFixed(2)}, GST: ${gst.toFixed(2)}, Total: ${total.toFixed(2)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 border rounded-3xl shadow-sm mt-10">
       <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2"><Percent className="text-orange-500"/> GST Calculator</h2>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
             <button onClick={()=>setType('ex')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${type==='ex'?'bg-white dark:bg-slate-700 shadow text-orange-600':'text-slate-500'}`}>Exclusive (+)</button>
             <button onClick={()=>setType('in')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${type==='in'?'bg-white dark:bg-slate-700 shadow text-orange-600':'text-slate-500'}`}>Inclusive (-)</button>
          </div>
       </div>

       <div className="space-y-6">
          <div>
             <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Amount</label>
             <input type="number" value={amount} onChange={e=>setAmount(+e.target.value)} className="w-full text-3xl font-black bg-slate-50 dark:bg-black rounded-xl p-4 outline-none focus:ring-2 ring-orange-500/20"/>
          </div>

          <div>
             <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Tax Slab</label>
             <div className="flex gap-2">
                {[5, 12, 18, 28].map(r => (
                   <button key={r} onClick={()=>setRate(r)} className={`flex-1 py-2 rounded-lg font-bold text-sm \${rate===r?'bg-orange-500 text-white':'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{r}%</button>
                ))}
             </div>
          </div>
          
          <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3 relative">
             <div className="flex justify-between text-sm opacity-80"><span>Net Amount</span><span>₹ {net.toLocaleString('en-IN', {maximumFractionDigits:2})}</span></div>
             <div className="flex justify-between text-sm font-bold text-orange-400"><span>GST ({rate}%)</span><span>₹ {gst.toLocaleString('en-IN', {maximumFractionDigits:2})}</span></div>
             <div className="h-px bg-white/20 my-2"></div>
             <div className="flex justify-between text-2xl font-black"><span>Total</span><span>₹ {total.toLocaleString('en-IN', {maximumFractionDigits:2})}</span></div>
             <button onClick={copy} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg">{copied?<Check size={14}/>:<Copy size={14}/>}</button>
          </div>
       </div>
    </div>
  );
};

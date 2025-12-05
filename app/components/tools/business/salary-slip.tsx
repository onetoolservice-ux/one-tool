"use client";
import React, { useState, useRef } from 'react';
import { Download, FileText, User, Building, IndianRupee, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const SalarySlipGenerator = () => {
  // STATE
  const [emp, setEmp] = useState({
    name: "Amit Kumar",
    id: "EMP-2024-001",
    role: "Senior Developer",
    month: "April 2024",
    company: "OneTool Enterprise Ltd."
  });

  const [earnings, setEarnings] = useState({
    basic: 45000,
    hra: 18000,
    special: 12000,
    medical: 1250,
    conveyance: 1600
  });

  const [deductions, setDeductions] = useState({
    pf: 1800,
    tax: 2500,
    pt: 200
  });

  const slipRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // CALCULATIONS
  const totalEarn = Object.values(earnings).reduce((a, b) => a + Number(b), 0);
  const totalDed = Object.values(deductions).reduce((a, b) => a + Number(b), 0);
  const netPay = totalEarn - totalDed;

  // HANDLERS
  const handleEarn = (k: string, v: string) => setEarnings({ ...earnings, [k]: Number(v) });
  const handleDed = (k: string, v: string) => setDeductions({ ...deductions, [k]: Number(v) });

  const downloadPDF = async () => {
    if (!slipRef.current) return;
    setLoading(true);
    try {
      const canvas = await html2canvas(slipRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save('Salary_Slip.pdf');
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-80px)] p-4 overflow-hidden">
      
      {/* LEFT: EDITOR */}
      <div className="w-full lg:w-1/3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 overflow-y-auto custom-scrollbar">
         <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><FileText className="text-teal-600"/> Payroll Details</h2>
         
         <div className="space-y-6">
            {/* Employee Info */}
            <div className="space-y-3">
               <label className="text-xs font-bold text-slate-500 uppercase">Employee Info</label>
               <input value={emp.company} onChange={e=>setEmp({...emp, company: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900" placeholder="Company Name"/>
               <div className="grid grid-cols-2 gap-2">
                  <input value={emp.name} onChange={e=>setEmp({...emp, name: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900" placeholder="Name"/>
                  <input value={emp.id} onChange={e=>setEmp({...emp, id: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900" placeholder="EMP ID"/>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <input value={emp.role} onChange={e=>setEmp({...emp, role: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900" placeholder="Designation"/>
                  <input value={emp.month} onChange={e=>setEmp({...emp, month: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 dark:bg-slate-900" placeholder="Month"/>
               </div>
            </div>

            {/* Earnings */}
            <div className="space-y-3">
               <label className="text-xs font-bold text-emerald-600 uppercase">Earnings</label>
               {Object.entries(earnings).map(([key, val]) => (
                 <div key={key} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold capitalize text-slate-600 dark:text-slate-400">{key}</span>
                    <input type="number" value={val} onChange={e=>handleEarn(key, e.target.value)} className="w-24 text-right bg-transparent outline-none font-mono text-sm font-bold"/>
                 </div>
               ))}
            </div>

            {/* Deductions */}
            <div className="space-y-3">
               <label className="text-xs font-bold text-rose-600 uppercase">Deductions</label>
               {Object.entries(deductions).map(([key, val]) => (
                 <div key={key} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold capitalize text-slate-600 dark:text-slate-400">{key}</span>
                    <input type="number" value={val} onChange={e=>handleDed(key, e.target.value)} className="w-24 text-right bg-transparent outline-none font-mono text-sm font-bold text-rose-500"/>
                 </div>
               ))}
            </div>
            
            <button onClick={downloadPDF} disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90">{loading ? "Generating..." : "Download PDF"}</button>
         </div>
      </div>

      {/* RIGHT: PREVIEW */}
      <div className="flex-1 bg-slate-100 dark:bg-black/20 p-8 flex justify-center overflow-y-auto">
         <div ref={slipRef} className="bg-white text-slate-900 shadow-xl w-[700px] min-h-[800px] p-10 relative">
            
            {/* Header */}
            <div className="text-center border-b-2 border-slate-900 pb-6 mb-6">
               <h1 className="text-3xl font-black uppercase tracking-wider">{emp.company}</h1>
               <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Salary Slip for {emp.month}</p>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-y-4 mb-8 text-sm">
               <div><span className="text-slate-500 block text-xs uppercase font-bold">Employee Name</span><span className="font-bold text-lg">{emp.name}</span></div>
               <div className="text-right"><span className="text-slate-500 block text-xs uppercase font-bold">Employee ID</span><span className="font-bold">{emp.id}</span></div>
               <div><span className="text-slate-500 block text-xs uppercase font-bold">Designation</span><span className="font-bold">{emp.role}</span></div>
               <div className="text-right"><span className="text-slate-500 block text-xs uppercase font-bold">Pay Date</span><span className="font-bold">{new Date().toLocaleDateString()}</span></div>
            </div>

            {/* Table */}
            <div className="border border-slate-300">
               <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-300">
                  <div className="p-2 text-center font-bold border-r border-slate-300">EARNINGS</div>
                  <div className="p-2 text-center font-bold">DEDUCTIONS</div>
               </div>
               <div className="grid grid-cols-2">
                  <div className="border-r border-slate-300">
                     {Object.entries(earnings).map(([k, v]) => (
                        <div key={k} className="flex justify-between p-2 border-b border-slate-100 text-sm">
                           <span className="capitalize text-slate-600">{k}</span>
                           <span className="font-mono font-bold">{Number(v).toLocaleString()}</span>
                        </div>
                     ))}
                     <div className="flex justify-between p-2 bg-slate-50 font-bold border-t border-slate-300">
                        <span>Gross Earnings</span>
                        <span>₹ {totalEarn.toLocaleString()}</span>
                     </div>
                  </div>
                  <div>
                     {Object.entries(deductions).map(([k, v]) => (
                        <div key={k} className="flex justify-between p-2 border-b border-slate-100 text-sm">
                           <span className="capitalize text-slate-600">{k}</span>
                           <span className="font-mono font-bold">{Number(v).toLocaleString()}</span>
                        </div>
                     ))}
                     <div className="flex justify-between p-2 bg-slate-50 font-bold border-t border-slate-300">
                        <span>Total Deductions</span>
                        <span>₹ {totalDed.toLocaleString()}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Net Pay */}
            <div className="mt-8 border-t-2 border-dashed border-slate-300 pt-4">
               <div className="flex justify-between items-end">
                  <div className="text-sm text-slate-500">
                     <p>Net Salary Payable</p>
                     <p className="text-[10px] uppercase">(In Words: {netPay > 0 ? "Rupees " + netPay.toLocaleString() + " Only" : "Zero"})</p>
                  </div>
                  <div className="text-right">
                     <span className="block text-xs font-bold text-slate-400 uppercase">Net Pay</span>
                     <span className="text-4xl font-black text-slate-900">₹ {netPay.toLocaleString()}</span>
                  </div>
               </div>
            </div>
            
            {/* Footer */}
            <div className="absolute bottom-10 left-10 right-10 text-center">
               <p className="text-[10px] text-slate-400">This is a system generated payslip. No signature required.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
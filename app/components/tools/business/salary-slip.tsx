"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Download, User, Building, 
  Calculator, RefreshCw, Briefcase, Calendar, Hash, Trash2, Plus, X
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showToast } from '@/app/shared/Toast';
import { getErrorMessage } from '@/app/lib/errors/error-handler';
import { logger } from '@/app/lib/utils/logger';

// --- HELPER COMPONENTS (Defined Outside to Fix Focus) ---
interface CompactInputProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CompactInput = ({ label, value, onChange, placeholder="" }: CompactInputProps) => (
  <div className="space-y-0.5">
     <label className="text-[9px] font-bold text-slate-400 uppercase">{label}</label>
     <input 
       value={value} 
       onChange={e => onChange(e.target.value)} 
       placeholder={placeholder} 
       className="w-full h-8 px-2 text-xs font-bold bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-600 rounded-lg outline-none transition-all"
     />
  </div>
);

export const SalarySlipGenerator = () => {
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("₹");
  const [mounted, setMounted] = useState(false);
  
  // Smart Inputs
  const [ctc, setCtc] = useState(1200000); // Annual CTC
  
  const [emp, setEmp] = useState({
    name: "Arjun Mehta",
    id: "EMP-2025-042",
    role: "Senior Software Engineer",
    department: "Engineering",
    doj: "15/03/2022",
    pan: "ABCDE1234F",
    uan: "100900123456",
    bank: "HDFC0001234",
    ac: "XXXXXXXX4521"
  });

  const [company, setCompany] = useState({
    name: "TechCorp Solutions Pvt. Ltd.",
    address: "Prestige Tech Park, Bangalore - 560103",
    month: "October 2025"
  });

  const [earnings, setEarnings] = useState([
    { id: 1, label: "Basic Salary", val: 0 },
    { id: 2, label: "HRA", val: 0 },
    { id: 3, label: "Special Allowance", val: 0 },
    { id: 4, label: "Transport Allowance", val: 1600 },
    { id: 5, label: "Medical Allowance", val: 1250 }
  ]);

  const [deductions, setDeductions] = useState([
    { id: 1, label: "Provident Fund (PF)", val: 1800 },
    { id: 2, label: "Professional Tax", val: 200 },
    { id: 3, label: "Income Tax (TDS)", val: 0 }
  ]);

  const slipRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); recalculate(1200000); }, []);

  // --- LOGIC: SMART CALCULATOR ---
  const recalculate = (annualCTC: number) => {
    const monthlyGross = annualCTC / 12;
    
    // Standard Indian Structure: Basic is ~40% of CTC, HRA is 50% of Basic
    const basic = Math.round(monthlyGross * 0.4);
    const hra = Math.round(basic * 0.5);
    const transport = 1600;
    const medical = 1250;
    
    // Special fills the rest
    const special = Math.max(0, monthlyGross - (basic + hra + transport + medical));

    // Deductions
    const pf = Math.min(1800, Math.round(basic * 0.12));
    const pt = 200;
    const tds = annualCTC > 1500000 ? Math.round((annualCTC * 0.15) / 12) : annualCTC > 1000000 ? Math.round((annualCTC * 0.1) / 12) : 0;

    setEarnings([
      { id: 1, label: "Basic Salary", val: basic },
      { id: 2, label: "HRA", val: hra },
      { id: 3, label: "Special Allowance", val: special },
      { id: 4, label: "Transport Allowance", val: transport },
      { id: 5, label: "Medical Allowance", val: medical }
    ]);

    setDeductions([
      { id: 1, label: "Provident Fund (PF)", val: pf },
      { id: 2, label: "Professional Tax", val: pt },
      { id: 3, label: "Income Tax (TDS)", val: tds }
    ]);
  };

  // --- HELPERS ---
  const totalEarn = earnings.reduce((a, b) => a + Number(b.val), 0);
  const totalDed = deductions.reduce((a, b) => a + Number(b.val), 0);
  const netPay = totalEarn - totalDed;

  const numToWords = (n: number) => {
    if (!mounted) return "";
    // Simplified formatter for display
    return n.toLocaleString('en-IN') + " Only"; 
  };

  const handleEarn = (idx: number, val: number) => {
    const n = [...earnings]; n[idx].val = val; setEarnings(n);
  };
  const handleDed = (idx: number, val: number) => {
    const n = [...deductions]; n[idx].val = val; setDeductions(n);
  };

  const downloadPDF = async () => {
    if (!slipRef.current) return;
    
    // Validate earnings and deductions
    if (earnings.length === 0) {
      showToast('Please add at least one earning component', 'error');
      return;
    }
    if (deductions.length === 0) {
      showToast('Please add at least one deduction component', 'error');
      return;
    }
    
    // Validate that earnings have values
    const hasEarnings = earnings.some(e => Number(e.val) > 0);
    if (!hasEarnings) {
      showToast('Please enter at least one earning amount greater than 0', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const canvas = await html2canvas(slipRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`Payslip_${emp.name}.pdf`);
      showToast('PDF generated successfully', 'success');
    } catch (error) {
      const message = getErrorMessage(error);
      showToast(message || 'Failed to generate PDF. Please try again.', 'error');
      logger.error('PDF generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-50 dark:bg-[#0B1120]">
      
      {/* --- LEFT: EDITOR --- */}
      <div className="w-full lg:w-[380px] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10 shadow-xl flex-shrink-0">
         
         {/* Smart Calculator Header */}
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Calculator className="text-blue-600"/> Salary Slip Generator</h2>
            <button 
               onClick={clearAllData} 
               className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
               aria-label="Clear all data"
               title="Clear all data"
            >
               <X size={14}/> Clear
            </button>
         </div>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Calculator size={16}/></div>
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Smart Pay Calculator</h2>
               </div>
               <button 
                  onClick={clearAllData} 
                  className="text-xs text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label="Clear all data"
                  title="Clear all data"
               >
                  <X size={14}/> Clear
               </button>
            </div>
            <div className="flex gap-3 items-center">
               <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Annual CTC ({currency})</label>
                  <input 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={ctc} 
                    onChange={(e) => { const val = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0; setCtc(val); recalculate(val); }}
                    className="w-full h-9 px-3 text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-black border border-blue-300 dark:border-blue-600 rounded-lg outline-none transition-all"
                  />
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Estimated Monthly</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{currency} {(ctc/12).toLocaleString('en-IN', {maximumFractionDigits:0})}</p>
               </div>
            </div>
         </div>

         {/* Scrollable Form */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            
            {/* 1. Employee Details */}
            <section className="space-y-2.5">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase"><User size={14}/> Employee</div>
               <div className="grid grid-cols-2 gap-3">
                  <CompactInput label="Name" value={emp.name} onChange={v=>setEmp({...emp, name: v})} />
                  <CompactInput label="Emp ID" value={emp.id} onChange={v=>setEmp({...emp, id: v})} />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <CompactInput label="Designation" value={emp.role} onChange={v=>setEmp({...emp, role: v})} />
                  <CompactInput label="Department" value={emp.department} onChange={v=>setEmp({...emp, department: v})} />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <CompactInput label="Joining Date" value={emp.doj} onChange={v=>setEmp({...emp, doj: v})} />
                  <CompactInput label="Month" value={company.month} onChange={v=>setCompany({...company, month: v})} />
               </div>
            </section>

            {/* 2. Bank & Tax Info */}
            <section className="space-y-2.5 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase"><Building size={14}/> Bank & Tax</div>
               <div className="grid grid-cols-2 gap-3">
                  <CompactInput label="PAN Number" value={emp.pan} onChange={v=>setEmp({...emp, pan: v})} />
                  <CompactInput label="UAN (PF)" value={emp.uan} onChange={v=>setEmp({...emp, uan: v})} />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <CompactInput label="Bank Name" value={emp.bank} onChange={v=>setEmp({...emp, bank: v})} />
                  <CompactInput label="Account No." value={emp.ac} onChange={v=>setEmp({...emp, ac: v})} />
               </div>
            </section>

            {/* 3. Earnings & Deductions */}
            <section className="grid grid-cols-1 gap-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800">
               {/* Earnings */}
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Earnings</span>
                     <span className="text-xs font-black text-slate-900 dark:text-white">{currency} {totalEarn.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                     {earnings.map((e, i) => (
                        <div key={e.id} className="flex justify-between items-center">
                           <input value={e.label} readOnly className="bg-transparent text-[10px] font-semibold text-slate-500 w-24 outline-none cursor-default"/>
                           <input type="text" inputMode="numeric" pattern="[0-9.]*" value={e.val} onChange={ev=>handleEarn(i, Number(ev.target.value.replace(/[^0-9.]/g, '')) || 0)} className="w-20 text-right text-xs font-bold bg-white dark:bg-black border rounded px-1 h-6 text-slate-900 dark:text-white"/>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Deductions */}
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Deductions</span>
                     <span className="text-xs font-black text-slate-900 dark:text-white">{currency} {totalDed.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                     {deductions.map((d, i) => (
                        <div key={d.id} className="flex justify-between items-center">
                           <input value={d.label} readOnly className="bg-transparent text-[10px] font-semibold text-slate-500 w-24 outline-none cursor-default"/>
                           <input type="text" inputMode="numeric" pattern="[0-9.]*" value={d.val} onChange={ev=>handleDed(i, Number(ev.target.value.replace(/[^0-9.]/g, '')) || 0)} className="w-20 text-right text-xs font-bold bg-white dark:bg-black border rounded px-1 h-6 text-slate-900 dark:text-white" aria-label={`${d.label} amount`}/>
                        </div>
                     ))}
                  </div>
               </div>
            </section>
         </div>

         {/* Footer Action */}
         <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <button onClick={downloadPDF} disabled={loading} className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" title={loading ? "Generating PDF..." : "Download payslip as PDF"}>
               {loading ? "Generating PDF..." : <><Download size={16}/> Download Payslip PDF</>}
            </button>
         </div>
      </div>

      {/* --- RIGHT: PREVIEW (FLUID) --- */}
      <div className="flex-1 bg-slate-200/50 dark:bg-black/50 p-4 flex justify-center items-start overflow-y-auto custom-scrollbar">
         <div className="relative shadow-2xl my-4">
             <div ref={slipRef} className="bg-white text-slate-900 w-[794px] min-h-[1123px] p-12 relative flex flex-col">
                
                {/* Header */}
                <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
                   <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">{company.name}</h1>
                   <p className="text-slate-500 text-xs mt-1">{company.address}</p>
                   <div className="mt-3 inline-block bg-slate-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-slate-600">Payslip for {company.month}</div>
                </div>

                {/* Employee Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                   <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400 font-bold text-xs uppercase">Employee Name</span>
                      <span className="font-bold text-slate-800">{emp.name}</span>
                   </div>
                   <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400 font-bold text-xs uppercase">Employee ID</span>
                      <span className="font-bold text-slate-800">{emp.id}</span>
                   </div>
                   <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400 font-bold text-xs uppercase">Designation</span>
                      <span className="font-bold text-slate-800">{emp.role}</span>
                   </div>
                   <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400 font-bold text-xs uppercase">Date of Joining</span>
                      <span className="font-bold text-slate-800">{emp.doj}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-400 font-bold text-xs uppercase">PAN Number</span>
                      <span className="font-bold text-slate-800">{emp.pan}</span>
                   </div>
                   <div className="flex justify-between">
                      <span className="text-slate-400 font-bold text-xs uppercase">Bank Account</span>
                      <span className="font-bold text-slate-800">{emp.ac}</span>
                   </div>
                </div>

                {/* Salary Table */}
                <div className="border border-slate-200 mb-6">
                   <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200">
                      <div className="p-3 text-center font-black text-xs uppercase tracking-widest text-emerald-700 border-r border-slate-200">Earnings</div>
                      <div className="p-3 text-center font-black text-xs uppercase tracking-widest text-rose-700">Deductions</div>
                   </div>
                   
                   <div className="grid grid-cols-2">
                      {/* Left: Earnings */}
                      <div className="border-r border-slate-200">
                         {earnings.map((e, i) => (
                            <div key={i} className="flex justify-between p-3 border-b border-slate-50 text-sm last:border-0">
                               <span className="font-medium text-slate-600">{e.label}</span>
                               <span className="font-bold text-slate-900">{currency} {e.val.toLocaleString()}</span>
                            </div>
                         ))}
                         {/* Fill empty space */}
                         <div className="flex-1 min-h-[100px]"></div>
                      </div>

                      {/* Right: Deductions */}
                      <div>
                         {deductions.map((d, i) => (
                            <div key={i} className="flex justify-between p-2.5 border-b border-slate-50 text-sm last:border-0">
                               <span className="font-medium text-slate-600">{d.label}</span>
                               <span className="font-bold text-slate-900">{currency} {d.val.toLocaleString()}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {/* Total Row */}
                   <div className="grid grid-cols-2 border-t-2 border-slate-200 bg-slate-50">
                      <div className="p-3 flex justify-between items-center border-r border-slate-200">
                         <span className="text-xs font-black uppercase text-slate-400">Total Earnings</span>
                         <span className="text-lg font-black text-emerald-600">{currency} {totalEarn.toLocaleString()}</span>
                      </div>
                      <div className="p-3 flex justify-between items-center">
                         <span className="text-xs font-black uppercase text-slate-400">Total Deductions</span>
                         <span className="text-lg font-black text-rose-600">{currency} {totalDed.toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                {/* Net Pay */}
                <div className="bg-slate-900 text-white p-6 rounded-xl flex justify-between items-center shadow-lg mb-8">
                   <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Net Salary Payable</p>
                      <p className="text-xs font-medium italic opacity-80">{numToWords(netPay)}</p>
                   </div>
                   <div className="text-right">
                      <h2 className="text-3xl font-black tracking-tight">₹ {netPay.toLocaleString()}</h2>
                   </div>
                </div>

                {/* Footer */}
                <div className="mt-auto text-center border-t border-slate-100 pt-4">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">This is a system generated payslip.</p>
                   <p className="text-[10px] text-slate-300 mt-1">Generated by OneTool Enterprise OS</p>
                </div>

             </div>
         </div>
      </div>
    </div>
  );
};
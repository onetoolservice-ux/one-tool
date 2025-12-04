"use client";
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Download, Building2, User, Wallet, 
  MinusCircle, PlusCircle, RefreshCw, Calculator, IndianRupee,
  Plus, Trash2, Upload, X, CalendarCheck, MapPin, BadgePercent
} from 'lucide-react';

// --- UI HELPERS ---
const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-3 mt-1">
    <div className="p-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md"><Icon size={14} /></div>
    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wide">{title}</h3>
  </div>
);

const InputGroup = ({ label, value, onChange, placeholder, type = "text", className="" }: any) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
    <input 
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg h-9 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
    />
  </div>
);

export const SalarySlipGenerator = () => {
  const [loading, setLoading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [logo, setLogo] = useState<string | null>(null);
  const [company, setCompany] = useState({ name: "Tech Solutions Pvt Ltd", address: "Cyber City, Gurugram, India" });
  const [emp, setEmp] = useState({ name: "Rahul Sharma", id: "EMP-1024", desig: "Senior Developer", doj: "2023-04-01", pan: "ABCDE1234F", uan: "100900123456" });
  const [meta, setMeta] = useState({ month: "October 2025", days: "31", lop: "0", leaveBal: "12" });
  
  // CALCULATION CONTROLS
  // Default to 12L so the page is "Live" immediately
  const [ctcInput, setCtcInput] = useState<number | ''>(1200000);
  const [regime, setRegime] = useState<'old' | 'new'>('new');
  const [cityType, setCityType] = useState<'metro' | 'non-metro'>('non-metro');

  // FINANCIALS
  const [earnings, setEarnings] = useState([
    { id: 1, label: "Basic Salary", val: 50000 },
    { id: 2, label: "HRA", val: 20000 },
    { id: 3, label: "Special Allowance", val: 28400 },
    { id: 4, label: "Conveyance", val: 1600 }
  ]);

  const [deductions, setDeductions] = useState([
    { id: 1, label: "Provident Fund (PF)", val: 1800 },
    { id: 2, label: "Professional Tax", val: 200 },
    { id: 3, label: "TDS (Income Tax)", val: 0 }
  ]);

  // --- DERIVED TOTALS ---
  const totalEarnings = earnings.reduce((acc, curr) => acc + Number(curr.val), 0);
  const totalDeductions = deductions.reduce((acc, curr) => acc + Number(curr.val), 0);
  const netPay = totalEarnings - totalDeductions;

  const numToWords = (num: number) => num.toLocaleString('en-IN') + " Rupees Only"; 

  // --- ACTIONS ---
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogo(URL.createObjectURL(file));
  };

  const addEarning = () => setEarnings([...earnings, { id: Date.now(), label: "New Allowance", val: 0 }]);
  const removeEarning = (id: number) => setEarnings(earnings.filter(e => e.id !== id));
  
  const addDeduction = () => setDeductions([...deductions, { id: Date.now(), label: "New Deduction", val: 0 }]);
  const removeDeduction = (id: number) => setDeductions(deductions.filter(d => d.id !== id));

  // --- SMART ENGINE ---
  // This function runs whenever CTC, Regime, or City changes
  const runEngine = (ctcValue: number) => {
    const monthlyGross = ctcValue / 12;
    
    // 1. Basic (50% of Gross)
    const basic = Math.round(monthlyGross * 0.5);
    
    // 2. HRA (50% Metro / 40% Non-Metro)
    const hraPercent = cityType === 'metro' ? 0.5 : 0.4;
    const hra = Math.round(basic * hraPercent);
    
    // 3. PF (12% of Basic, Capped at 1800)
    const pf = Math.min(1800, Math.round(basic * 0.12));
    
    // 4. Standard PT
    const pt = 200;

    // 5. Tax Calc (TDS)
    let taxableIncome = ctcValue - 75000; // Std Deduction
    let tax = 0;

    if (regime === 'new') {
       // New Regime Slabs FY24-25
       if (taxableIncome > 300000) {
          if (taxableIncome <= 700000) { tax = 0; } // Rebate
          else {
             if (taxableIncome > 300000) tax += (Math.min(taxableIncome, 700000) - 300000) * 0.05;
             if (taxableIncome > 700000) tax += (Math.min(taxableIncome, 1000000) - 700000) * 0.10;
             if (taxableIncome > 1000000) tax += (Math.min(taxableIncome, 1200000) - 1000000) * 0.15;
             if (taxableIncome > 1200000) tax += (Math.min(taxableIncome, 1500000) - 1200000) * 0.20;
             if (taxableIncome > 1500000) tax += (taxableIncome - 1500000) * 0.30;
          }
       }
    } else {
       // Old Regime (Approximate with HRA exemption logic)
       // We assume some 80C declarations for a realistic estimate
       let oldTaxable = taxableIncome - 150000; // 80C
       if (oldTaxable > 500000) {
          tax = (oldTaxable - 500000) * 0.2; 
       }
    }
    const monthlyTax = Math.round(tax / 12);

    // 6. Special (Balancing)
    const fixed = basic + hra + 1600; 
    const special = Math.max(0, monthlyGross - fixed);

    // Update State
    setEarnings([
      { id: 1, label: "Basic Salary", val: basic },
      { id: 2, label: "HRA", val: hra },
      { id: 3, label: "Special Allowance", val: special },
      { id: 4, label: "Conveyance", val: 1600 }
    ]);
    setDeductions([
      { id: 1, label: "Provident Fund (PF)", val: pf },
      { id: 2, label: "Professional Tax", val: pt },
      { id: 3, label: "TDS (Income Tax)", val: monthlyTax }
    ]);
  };

  // --- LISTENERS ---
  
  // 1. When Manual CTC Input changes
  const handleManualCTC = (val: string) => {
    const num = Number(val);
    setCtcInput(num || '');
    if (num > 0) runEngine(num);
  };

  // 2. When Toggles (Regime/City) change -> Re-run using current CTC or Current Gross
  useEffect(() => {
    if (ctcInput && typeof ctcInput === 'number') {
       // Preferred: Recalculate from the defined CTC
       runEngine(ctcInput);
    } else {
       // Fallback: Recalculate based on current table total (Gross * 12)
       // This ensures toggles work even if user deleted the top input
       const currentAnnual = totalEarnings * 12;
       if (currentAnnual > 0) runEngine(currentAnnual);
    }
  }, [regime, cityType]);


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
      pdf.save(`Payslip-${emp.name}.pdf`);
    } catch (err) { alert("Error"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] animate-in fade-in duration-500 overflow-hidden">
      
      {/* LEFT: EDITOR */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-5 space-y-6 custom-scrollbar pb-32">
         
         {/* SMART ENGINE */}
         <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
                   <Calculator size={14} /> Salary Engine
                </div>
                {/* TOGGLES */}
                <div className="flex gap-2">
                   <div className="flex bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-indigo-100 dark:border-indigo-900">
                      <button onClick={()=>setRegime('new')} className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${regime==='new' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>New Regime</button>
                      <button onClick={()=>setRegime('old')} className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${regime==='old' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>Old Regime</button>
                   </div>
                   <div className="flex bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-indigo-100 dark:border-indigo-900">
                      <button onClick={()=>setCityType('metro')} className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${cityType==='metro' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>Metro</button>
                      <button onClick={()=>setCityType('non-metro')} className={`px-2 py-1 text-[9px] font-bold rounded transition-colors ${cityType==='non-metro' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}>Non-Metro</button>
                   </div>
                </div>
            </div>
            
            <div className="flex gap-2 items-center">
               <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400 font-bold text-xs">₹</span>
                  <input 
                    type="number" 
                    value={ctcInput}
                    onChange={(e) => handleManualCTC(e.target.value)}
                    placeholder="Enter Annual CTC (e.g. 1200000)"
                    className="w-full pl-6 pr-3 py-2 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm font-bold text-indigo-700 dark:text-indigo-300 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
               </div>
            </div>
         </div>

         {/* DETAILS */}
         <div className="space-y-4">
            <div className="flex justify-between items-center">
               <SectionHeader icon={Building2} title="Company Details" />
               {!logo && <label className="cursor-pointer text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:underline"><Upload size={12}/> Upload Logo<input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>}
            </div>
            <div className="flex gap-4">
               {logo && (
                  <div className="relative group w-16 h-16 shrink-0 border rounded-lg p-1 bg-white"><img src={logo} className="w-full h-full object-contain" /><button onClick={() => setLogo(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button></div>
               )}
               <div className="grid grid-cols-1 gap-3 flex-1">
                  <InputGroup label="Company Name" value={company.name} onChange={(e:any)=>setCompany({...company, name: e.target.value})} />
                  <InputGroup label="Address" value={company.address} onChange={(e:any)=>setCompany({...company, address: e.target.value})} />
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <SectionHeader icon={User} title="Employee Details" />
            <div className="grid grid-cols-2 gap-3">
               <InputGroup label="Name" value={emp.name} onChange={(e:any)=>setEmp({...emp, name: e.target.value})} />
               <InputGroup label="Designation" value={emp.desig} onChange={(e:any)=>setEmp({...emp, desig: e.target.value})} />
               <InputGroup label="Employee ID" value={emp.id} onChange={(e:any)=>setEmp({...emp, id: e.target.value})} />
               <InputGroup label="Joining Date" value={emp.doj} onChange={(e:any)=>setEmp({...emp, doj: e.target.value})} />
               <InputGroup label="PAN No" value={emp.pan} onChange={(e:any)=>setEmp({...emp, pan: e.target.value})} />
               <InputGroup label="UAN / PF" value={emp.uan} onChange={(e:any)=>setEmp({...emp, uan: e.target.value})} />
            </div>
         </div>

         <div className="space-y-4">
            <SectionHeader icon={CalendarCheck} title="Attendance" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               <InputGroup label="Month" value={meta.month} onChange={(e:any)=>setMeta({...meta, month: e.target.value})} />
               <InputGroup label="Paid Days" value={meta.days} onChange={(e:any)=>setMeta({...meta, days: e.target.value})} />
               <InputGroup label="LOP" value={meta.lop} onChange={(e:any)=>setMeta({...meta, lop: e.target.value})} />
               <InputGroup label="Leave Bal" value={meta.leaveBal} onChange={(e:any)=>setMeta({...meta, leaveBal: e.target.value})} />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
               <div className="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <SectionHeader icon={PlusCircle} title="Earnings" />
                  <button onClick={addEarning} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500"><Plus size={14}/></button>
               </div>
               <div className="space-y-2">
                  {earnings.map((e, i) => (
                     <div key={e.id} className="flex gap-2 group">
                        <input type="text" value={e.label} className="flex-1 text-[10px] bg-transparent border-b border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" onChange={(ev)=>{const n=[...earnings];n[i].label=ev.target.value;setEarnings(n)}} />
                        <input type="number" value={e.val} className="w-16 text-[10px] font-bold text-right bg-white dark:bg-slate-900 rounded px-1 outline-none border border-transparent focus:border-indigo-500" onChange={(ev)=>{const n=[...earnings];n[i].val=Number(ev.target.value);setEarnings(n)}} />
                        <button onClick={()=>removeEarning(e.id)} className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 size={12}/></button>
                     </div>
                  ))}
               </div>
               <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-bold">
                  <span>Gross Earnings</span><span className="text-[#4a6b61]">{totalEarnings.toLocaleString('en-IN')}</span>
               </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
               <div className="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <SectionHeader icon={MinusCircle} title="Deductions" />
                  <button onClick={addDeduction} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500"><Plus size={14}/></button>
               </div>
               <div className="space-y-2">
                  {deductions.map((d, i) => (
                     <div key={d.id} className="flex gap-2 group">
                        <input type="text" value={d.label} className="flex-1 text-[10px] bg-transparent border-b border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500" onChange={(ev)=>{const n=[...deductions];n[i].label=ev.target.value;setDeductions(n)}} />
                        <input type="number" value={d.val} className="w-16 text-[10px] font-bold text-right bg-white dark:bg-slate-900 rounded px-1 outline-none text-rose-500 border border-transparent focus:border-rose-500" onChange={(ev)=>{const n=[...deductions];n[i].val=Number(ev.target.value);setDeductions(n)}} />
                        <button onClick={()=>removeDeduction(d.id)} className="opacity-0 group-hover:opacity-100 text-rose-500"><Trash2 size={12}/></button>
                     </div>
                  ))}
               </div>
               <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-xs font-bold">
                  <span>Total Deductions</span><span className="text-rose-600">{totalDeductions.toLocaleString('en-IN')}</span>
               </div>
            </div>
         </div>
      </div>

      {/* RIGHT: PREVIEW (Fit to Screen) */}
      <div className="w-full lg:w-1/2 h-full flex flex-col bg-slate-100 dark:bg-black/20 border-l border-slate-200 dark:border-slate-800">
         <div className="p-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-end shadow-sm z-10">
            <button onClick={handleDownload} disabled={loading} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
               {loading ? "Generating..." : <><Download size={14}/> Download PDF</>}
            </button>
         </div>

         <div className="flex-1 overflow-auto p-4 bg-slate-200/50 dark:bg-black/50 flex justify-center items-start">
            <div 
               ref={previewRef}
               className="bg-white text-slate-900 shadow-xl p-8 text-[10px] relative flex flex-col"
               style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}
            >
               {/* HEADER */}
               <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-4">
                     {logo && <img src={logo} className="h-10 w-auto object-contain" />}
                     <div>
                        <h1 className="text-lg font-bold uppercase tracking-wide">{company.name}</h1>
                        <p className="text-slate-500 text-[9px] max-w-[250px]">{company.address}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <h2 className="text-xs font-bold underline decoration-slate-300 underline-offset-4">PAYSLIP</h2>
                     <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase">{meta.month}</p>
                  </div>
               </div>

               {/* EMPLOYEE INFO */}
               <div className="grid grid-cols-2 gap-x-8 gap-y-1 mb-4 border-b border-slate-200 pb-4">
                  <div className="flex justify-between"><span>Name:</span><span className="font-bold">{emp.name}</span></div>
                  <div className="flex justify-between"><span>ID:</span><span className="font-bold">{emp.id}</span></div>
                  <div className="flex justify-between"><span>Designation:</span><span className="font-bold">{emp.desig}</span></div>
                  <div className="flex justify-between"><span>DOJ:</span><span className="font-bold">{emp.doj}</span></div>
                  <div className="flex justify-between"><span>PAN:</span><span className="font-bold">{emp.pan}</span></div>
                  <div className="flex justify-between"><span>UAN:</span><span className="font-bold">{emp.uan}</span></div>
                  <div className="flex justify-between"><span>Paid Days:</span><span className="font-bold">{meta.days}</span></div>
                  <div className="flex justify-between"><span>Leave Bal:</span><span className="font-bold">{meta.leaveBal}</span></div>
               </div>

               {/* FINANCIAL TABLE */}
               <div className="grid grid-cols-2 border border-slate-800 mb-4">
                  <div className="border-r border-slate-800">
                     <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-800 uppercase text-[9px]">Earnings</div>
                     <div className="p-2 space-y-1 min-h-[150px]">
                        {earnings.map(e => <div key={e.id} className="flex justify-between"><span>{e.label}</span><span>{e.val.toLocaleString('en-IN')}</span></div>)}
                     </div>
                     <div className="border-t border-slate-800 p-1 flex justify-between font-bold bg-slate-50"><span>Total Earnings</span><span>{totalEarnings.toLocaleString('en-IN')}</span></div>
                  </div>
                  <div>
                     <div className="bg-slate-100 font-bold text-center py-1 border-b border-slate-800 uppercase text-[9px]">Deductions</div>
                     <div className="p-2 space-y-1 min-h-[150px]">
                        {deductions.map(d => <div key={d.id} className="flex justify-between text-slate-600"><span>{d.label}</span><span>{d.val.toLocaleString('en-IN')}</span></div>)}
                     </div>
                     <div className="border-t border-slate-800 p-1 flex justify-between font-bold bg-slate-50"><span>Total Deductions</span><span>{totalDeductions.toLocaleString('en-IN')}</span></div>
                  </div>
               </div>

               {/* NET PAY */}
               <div className="border border-slate-800 p-3 mb-6 bg-slate-50 flex justify-between items-center">
                  <div className="flex flex-col">
                     <span className="text-[9px] text-slate-500 uppercase tracking-widest">Net Salary Payable</span>
                     <span className="font-bold italic text-slate-600 text-[9px]">{numToWords(netPay)}</span>
                  </div>
                  <div className="text-xl font-black text-slate-900">₹ {netPay.toLocaleString('en-IN')}</div>
               </div>

               <div className="mt-auto text-center text-[8px] text-slate-400">
                  <p>Computer generated document. No signature required.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

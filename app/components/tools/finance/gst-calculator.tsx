"use client";
import React, { useState } from 'react';
import { Percent } from 'lucide-react';
import { Input, Button, CopyButton } from '@/app/components/shared';
import { formatCurrency } from '@/app/lib/utils/tool-helpers';
import { showToast } from '@/app/shared/Toast';

export const GstCalculator = () => {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(18);
  const [type, setType] = useState<'ex' | 'in'>('ex');

  // Validation: Ensure valid calculations
  const gst = (amount > 0 && rate > 0) 
    ? (type === 'ex' ? (amount * rate) / 100 : amount - (amount * (100 / (100 + rate))))
    : 0;
  const net = (amount > 0) 
    ? (type === 'ex' ? amount : amount - gst)
    : 0;
  const total = (amount > 0) 
    ? (type === 'ex' ? amount + gst : amount)
    : 0;

  const copyText = `Net: ${formatCurrency(net)}, GST: ${formatCurrency(gst)}, Total: ${formatCurrency(total)}`;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm mt-10">
       <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Percent className="text-orange-500"/> GST Calculator
          </h2>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1">
             <button
               onClick={() => setType('ex')}
               className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                 type === 'ex'
                   ? 'bg-orange-500 text-white shadow-sm'
                   : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
               }`}
             >
               Exclusive (+)
             </button>
             <button
               onClick={() => setType('in')}
               className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                 type === 'in'
                   ? 'bg-orange-500 text-white shadow-sm'
                   : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
               }`}
             >
               Inclusive (-)
             </button>
          </div>
       </div>

       <div className="space-y-6">
          <Input
            label="Amount"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount.toString()}
            onChange={(e) => {
              const val = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
              if (val < 0) {
                showToast('Amount cannot be negative', 'error');
                return;
              }
              if (val === 0) {
                showToast('Amount must be greater than 0', 'error');
                return;
              }
              if (val > 1000000000) {
                showToast('Amount exceeds maximum limit', 'error');
                return;
              }
              setAmount(val);
            }}
            className="text-3xl font-bold text-slate-900 dark:text-white"
          />

          <div>
             <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Tax Slab</label>
             <div className="flex gap-2">
                {[5, 12, 18, 28].map(r => (
                   <Button
                     key={r}
                     variant={rate === r ? 'primary' : 'outline'}
                     size="sm"
                     onClick={() => setRate(r)}
                     className={rate === r ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                     fullWidth
                   >
                     {r}%
                   </Button>
                ))}
             </div>
          </div>
          
          <div className="p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl space-y-3 relative">
             <div className="flex justify-between text-sm opacity-80">
               <span>Net Amount</span>
               <span>{formatCurrency(net)}</span>
             </div>
             <div className="flex justify-between text-sm font-bold text-orange-400">
               <span>GST ({rate}%)</span>
               <span>{formatCurrency(gst)}</span>
             </div>
             <div className="h-px bg-white/20 my-2"></div>
             <div className="flex justify-between text-2xl font-bold">
               <span>Total</span>
               <span>{formatCurrency(total)}</span>
             </div>
             <div className="absolute top-4 right-4">
               <CopyButton text={copyText} variant="icon" size="sm" />
             </div>
          </div>
       </div>
    </div>
  );
};

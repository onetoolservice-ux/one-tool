'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, DollarSign, Receipt, Fingerprint, Home, Clock } from 'lucide-react';

export default function QuickAccess() {
  const recentTools = [
    { id: 'invoice', title: 'Pro Invoice Studio', desc: 'Create & Download PDF Invoices.', icon: <DollarSign size={18} />, href: '/tools/business/invoice-generator', badge: 'NEW' },
    { id: 'agreement', title: 'Legal Contracts', desc: 'NDAs, Service Agreements & Offers.', icon: <FileText size={18} />, href: '/tools/business/smart-agreement', badge: 'NEW' },
    { id: 'salary', title: 'Salary Slip Studio', desc: 'Generate compliant HR Payslips instantly.', icon: <Receipt size={18} />, href: '/tools/business/salary-slip', badge: 'NEW' },
    { id: 'idcard', title: 'ID Card Creator', desc: 'Design & Print Employee IDs.', icon: <Fingerprint size={18} />, href: '/tools/business/id-card', badge: 'NEW' },
    { id: 'rent', title: 'Rent Receipt Gen', desc: 'HRA Proofs for Tax Saving.', icon: <Home size={18} />, href: '/tools/business/rent-receipt', badge: 'NEW' },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Clock size={14} className="text-gray-400" />
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
        {recentTools.map((tool) => (
          <Link key={tool.id} href={tool.href} className="min-w-[280px] p-4 bg-white dark:bg-[#1C1F2E] border border-gray-100 dark:border-white/5 rounded-xl hover:border-emerald-500/30 hover:shadow-md transition-all group flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-colors flex-shrink-0">
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate pr-2">{tool.title}</h3>
                {tool.badge && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 px-1.5 py-0.5 rounded">{tool.badge}</span>}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Activity, Timer, QrCode, Lock, Layout, CheckSquare, 
  DollarSign, Briefcase, FileText, CreditCard, Receipt,
  FileCode, Terminal, GitBranch, Database, Cpu, Globe,
  Image as ImageIcon, Minimize, Maximize, Scan, FileInput,
  Heart, Wind, Scale, MessageSquare, Sparkles, Brain, 
  Palette, Droplet, RefreshCw, Calculator, TrendingUp, 
  PiggyBank, Landmark, Home, Clock, Code, Target, Zap, Search
} from 'lucide-react';

// === MASTER TOOL DATABASE (53 Apps) ===
const tools = [
  // PRODUCTIVITY
  { id: 'life-os', title: 'Life OS', description: 'Personal OS', icon: <Activity size={18} />, category: 'productivity', href: '/tools/productivity/life-os', bg: 'bg-emerald-500' },
  { id: 'pomodoro', title: 'Focus Timer', description: 'Pomodoro', icon: <Timer size={18} />, category: 'productivity', href: '/tools/productivity/pomodoro', bg: 'bg-red-500' },
  { id: 'qr-code', title: 'QR Gen', description: 'QR Codes', icon: <QrCode size={18} />, category: 'productivity', href: '/tools/productivity/qr-code', bg: 'bg-blue-500' },
  { id: 'smart-pass', title: 'Pass Gen', description: 'Secure Keys', icon: <Lock size={18} />, category: 'productivity', href: '/tools/productivity/smart-pass', bg: 'bg-purple-500' },

  // BUSINESS
  { id: 'invoice-generator', title: 'Invoices', description: 'PDF Maker', icon: <DollarSign size={18} />, category: 'business', href: '/tools/business/invoice-generator', bg: 'bg-green-500' },
  { id: 'salary-slip', title: 'Payslips', description: 'HR Tools', icon: <Receipt size={18} />, category: 'business', href: '/tools/business/salary-slip', bg: 'bg-orange-500' },
  { id: 'rent-receipt', title: 'Rent Receipt', description: 'Tax Proof', icon: <Home size={18} />, category: 'business', href: '/tools/business/rent-receipt', bg: 'bg-teal-500' },
  { id: 'id-card', title: 'ID Cards', description: 'Design IDs', icon: <Briefcase size={18} />, category: 'business', href: '/tools/business/id-card', bg: 'bg-indigo-500' },
  { id: 'smart-agreement', title: 'Agreements', description: 'Legal Docs', icon: <FileText size={18} />, category: 'business', href: '/tools/business/smart-agreement', bg: 'bg-slate-500' },

  // DOCUMENTS
  { id: 'smart-scan', title: 'Scanner', description: 'Digitize', icon: <Scan size={18} />, category: 'documents', href: '/tools/documents/smart-scan', bg: 'bg-blue-500' },
  { id: 'smart-ocr', title: 'OCR', description: 'Img to Text', icon: <FileCode size={18} />, category: 'documents', href: '/tools/documents/smart-ocr', bg: 'bg-yellow-500' },
  { id: 'pdf-workbench', title: 'PDF Tools', description: 'Merge/Edit', icon: <FileText size={18} />, category: 'documents', href: '/tools/documents/smart-pdf-merge', bg: 'bg-red-500' },
  { id: 'pdf-splitter', title: 'PDF Split', description: 'Split Pages', icon: <Minimize size={18} />, category: 'documents', href: '/tools/documents/smart-pdf-split', bg: 'bg-red-500' },
  { id: 'image-compressor', title: 'Compressor', description: 'Shrink Img', icon: <Minimize size={18} />, category: 'documents', href: '/tools/documents/smart-img-compress', bg: 'bg-purple-500' },
  { id: 'image-converter', title: 'Converter', description: 'Img Format', icon: <ImageIcon size={18} />, category: 'documents', href: '/tools/documents/smart-img-convert', bg: 'bg-pink-500' },
  { id: 'csv-studio', title: 'CSV Editor', description: 'View Data', icon: <Database size={18} />, category: 'documents', href: '/tools/documents/smart-excel', bg: 'bg-emerald-500' },
  { id: 'markdown-studio', title: 'Markdown', description: 'MD Editor', icon: <FileCode size={18} />, category: 'documents', href: '/tools/documents/smart-word', bg: 'bg-slate-500' },
  { id: 'universal-converter', title: 'File Conv', description: 'Universal', icon: <RefreshCw size={18} />, category: 'documents', href: '/tools/documents/universal-converter', bg: 'bg-orange-500' },

  // DEVELOPER
  { id: 'api-playground', title: 'API Tester', description: 'Rest Client', icon: <Globe size={18} />, category: 'developer', href: '/tools/developer/api-playground', bg: 'bg-cyan-500' },
  { id: 'dev-station', title: 'Dev Station', description: 'Toolkit', icon: <Terminal size={18} />, category: 'developer', href: '/tools/developer/dev-station', bg: 'bg-slate-500' },
  { id: 'git-cheats', title: 'Git Cheats', description: 'Commands', icon: <GitBranch size={18} />, category: 'developer', href: '/tools/developer/git-cheats', bg: 'bg-orange-500' },
  { id: 'cron-gen', title: 'Cron Gen', description: 'Scheduler', icon: <Clock size={18} />, category: 'developer', href: '/tools/developer/cron-gen', bg: 'bg-blue-500' },
  { id: 'jwt-debugger', title: 'JWT Debug', description: 'Decode', icon: <Lock size={18} />, category: 'developer', href: '/tools/developer/smart-jwt', bg: 'bg-pink-500' },
  { id: 'diff-studio', title: 'Diff Tool', description: 'Compare', icon: <FileText size={18} />, category: 'developer', href: '/tools/developer/smart-diff', bg: 'bg-emerald-500' },
  { id: 'string-studio', title: 'String Ops', description: 'Base64/URL', icon: <FileCode size={18} />, category: 'developer', href: '/tools/developer/smart-base64', bg: 'bg-yellow-500' },
  { id: 'json-editor', title: 'JSON Edit', description: 'Formatter', icon: <Code size={18} />, category: 'developer', href: '/tools/developer/smart-json', bg: 'bg-yellow-500' },
  { id: 'sql-editor', title: 'SQL Edit', description: 'Query Tool', icon: <Database size={18} />, category: 'developer', href: '/tools/developer/smart-sql', bg: 'bg-blue-500' },

  // FINANCE
  { id: 'budget-planner', title: 'Budget', description: 'Track $$', icon: <PiggyBank size={18} />, category: 'finance', href: '/tools/finance/smart-budget', bg: 'bg-emerald-500' },
  { id: 'net-worth', title: 'Net Worth', description: 'Assets', icon: <Landmark size={18} />, category: 'finance', href: '/tools/finance/smart-net-worth', bg: 'bg-amber-500' },
  { id: 'investment', title: 'Invest Calc', description: 'ROI / SIP', icon: <TrendingUp size={18} />, category: 'finance', href: '/tools/finance/smart-sip', bg: 'bg-blue-500' },
  { id: 'loan-calc', title: 'Loan Calc', description: 'EMI Check', icon: <Calculator size={18} />, category: 'finance', href: '/tools/finance/smart-loan-calculator', bg: 'bg-indigo-500' },
  { id: 'gst-calc', title: 'GST Calc', description: 'Tax Check', icon: <Receipt size={18} />, category: 'finance', href: '/tools/finance/gst-calculator', bg: 'bg-purple-500' },
  { id: 'retirement', title: 'Retirement', description: 'Planner', icon: <Target size={18} />, category: 'finance', href: '/tools/finance/smart-retirement', bg: 'bg-green-500' },

  // HEALTH
  { id: 'smart-bmi', title: 'BMI Calc', description: 'Health', icon: <Scale size={18} />, category: 'health', href: '/tools/health/smart-bmi', bg: 'bg-rose-500' },
  { id: 'box-breathing', title: 'Breathing', description: 'Focus', icon: <Wind size={18} />, category: 'health', href: '/tools/health/smart-breath', bg: 'bg-cyan-500' },
  { id: 'hiit-timer', title: 'HIIT Timer', description: 'Workout', icon: <Timer size={18} />, category: 'health', href: '/tools/health/smart-workout', bg: 'bg-orange-500' },

  // AI
  { id: 'smart-chat', title: 'AI Assistant', description: 'Chat Bot', icon: <MessageSquare size={18} />, category: 'ai', href: '/tools/ai/smart-chat', bg: 'bg-pink-500' },
  { id: 'smart-analyze', title: 'Sentiment', description: 'Analyzer', icon: <Brain size={18} />, category: 'ai', href: '/tools/ai/smart-analyze', bg: 'bg-purple-500' },

  // DESIGN
  { id: 'color-picker', title: 'Color Pick', description: 'HEX/RGB', icon: <Palette size={18} />, category: 'design', href: '/tools/design/color-picker', bg: 'bg-pink-500' },

  // CONVERTERS
  { id: 'unit-convert', title: 'Converter', description: 'All Units', icon: <RefreshCw size={18} />, category: 'converters', href: '/tools/converters/unit-convert', bg: 'bg-orange-500' }
];

export const ToolGrid = ({ category }: { category: string }) => {
  const filteredTools = category === 'all' 
    ? tools 
    : tools.filter(tool => {
        if (category === 'utilities' && (tool.category === 'converters' || tool.category === 'design')) return true;
        return tool.category === category;
    });

  if (filteredTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3">
          <Search className="text-gray-400" size={20} />
        </div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">No tools found</h3>
        <p className="text-xs text-gray-500 mt-1">Category <span className="font-bold capitalize">{category}</span> is empty.</p>
      </div>
    );
  }

  return (
    // GRID CONFIG: High Density (2 cols mobile, up to 6 cols large screens)
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {filteredTools.map((tool) => (
        <Link 
          key={tool.id} 
          href={tool.href}
          className="group relative bg-white dark:bg-[#1C1F2E] border border-gray-100 dark:border-white/5 p-3 rounded-xl 
                     transition-all duration-200 
                     hover:scale-[1.02] active:scale-[0.98] 
                     hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-black/50 
                     hover:border-emerald-500/30 dark:hover:border-emerald-500/30
                     flex items-center gap-3 h-[72px]"
        >
          {/* Icon Box */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${tool.bg} shadow-sm flex-shrink-0 group-hover:rotate-3 transition-transform`}>
            {tool.icon}
          </div>
          
          {/* Text Info */}
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {tool.title}
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate opacity-80 group-hover:opacity-100">
              {tool.description}
            </p>
          </div>
          
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 rounded-xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors pointer-events-none"></div>
        </Link>
      ))}
    </div>
  );
};

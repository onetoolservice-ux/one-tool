"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, ShieldCheck } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'welcome';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    // Add to START of array so new ones pop at the top
    setToasts((prev) => [{ id, message, type }, ...prev].slice(0, 5));

    const duration = type === 'error' ? 8000 : 4000;
    setTimeout(() => removeToast(id), duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (msg: string, type: ToastType = 'info') => addToast(msg, type);
  const showError = (msg: string) => addToast(msg, 'error');
  const showSuccess = (msg: string) => addToast(msg, 'success');
  const showWarning = (msg: string) => addToast(msg, 'warning');

  // --- STYLES ---
  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-[#638c80] text-white border-[#4a6b61] shadow-[#638c80]/20';
      case 'error': return 'bg-[#9f1239] text-white border-[#881337] shadow-[#9f1239]/20';
      case 'warning': return 'bg-[#b45309] text-white border-[#78350f] shadow-[#b45309]/20';
      case 'welcome': return 'bg-[#0d9488] text-white border-[#115e59] shadow-[#0d9488]/20';
      default: return 'bg-[#1e293b] text-white border-[#0f172a] shadow-xl';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={18} className="text-emerald-100" />;
      case 'error': return <Info size={18} className="text-rose-100" />;
      case 'warning': return <AlertTriangle size={18} className="text-amber-100" />;
      case 'welcome': return <ShieldCheck size={18} className="text-teal-100" />;
      default: return <Info size={18} className="text-slate-300" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showWarning }}>
      {children}
      
      {/* POSITION FIX: Top-24 (Below Header) Right-6 */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none items-end">
        {toasts.map((t) => (
          <div 
            key={t.id}
            className={`
              pointer-events-auto w-full max-w-sm p-4 rounded-xl shadow-2xl border backdrop-blur-md 
              animate-in slide-in-from-right-full fade-in duration-300 
              flex items-start gap-3 transform transition-all hover:scale-[1.02]
              ${getStyles(t.type)}
            `}
          >
            <div className="mt-0.5 shrink-0">
               {getIcon(t.type)}
            </div>
            <div className="flex-1">
               <p className="text-sm font-semibold leading-snug">{t.message}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="text-white/60 hover:text-white transition-colors p-1 -mt-1 -mr-1 rounded-md hover:bg-white/10">
               <X size={14}/>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

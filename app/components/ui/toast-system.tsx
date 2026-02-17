"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

let toastCounter = 0;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${++toastCounter}`;
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const remove = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* TOAST CONTAINER (Fixed Bottom Center) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div 
            key={t.id} 
            className="pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center gap-3 px-6 py-3 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 backdrop-blur-md rounded-full shadow-2xl min-w-[300px] justify-between"
          >
             <div className="flex items-center gap-3">
                {t.type === 'success' && <CheckCircle size={18} className="text-emerald-400 dark:text-emerald-600"/>}
                {t.type === 'error' && <AlertCircle size={18} className="text-rose-400 dark:text-rose-600"/>}
                {t.type === 'info' && <Info size={18} className="text-blue-400 dark:text-blue-600"/>}
                <span className="text-sm font-medium">{t.message}</span>
             </div>
             <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100"><X size={14}/></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
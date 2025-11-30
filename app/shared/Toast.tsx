"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

let globalShow: ((msg: string, type?: ToastType) => void) | null = null;

export function showToast(msg: string, type: ToastType = "info") {
  if (globalShow) globalShow(msg, type);
}

export default function Toast() {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  useEffect(() => {
    globalShow = (msg, type = "info") => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
    };
    return () => { globalShow = null; };
  }, []);

  if (!toast) return null;

  const styles = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-slate-800 text-white"
  };

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-5 fade-in duration-300 ${styles[toast.type]}`}>
      {icons[toast.type]}
      <span className="text-sm font-bold">{toast.msg}</span>
      <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={16}/></button>
    </div>
  );
}

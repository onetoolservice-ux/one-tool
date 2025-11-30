import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function Offline() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6">
        <WifiOff size={64} className="text-slate-400" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">You are Offline</h1>
      <p className="text-slate-500 max-w-md mb-8">
        Please check your internet connection. Don't worry, your local tools (Calculator, Budget, Notes) still work!
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all"
      >
        Go to My Tools
      </Link>
    </div>
  );
}

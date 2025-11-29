import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center px-4">
      <div className="p-4 bg-background dark:bg-surface dark:bg-slate-950 rounded-full mb-6">
        <FileQuestion size={48} className="text-muted/70" />
      </div>
      <h2 className="text-3xl font-bold text-main dark:text-slate-100 dark:text-slate-200">Page Not Found</h2>
      <p className="text-muted dark:text-muted dark:text-muted dark:text-muted mt-2 max-w-md">
        We couldn't find the tool or page you're looking for. It might have been moved or doesn't exist.
      </p>
      <Link 
        href="/"
        className="mt-8 flex items-center gap-2 px-6 py-3 bg-[rgb(117,163,163)] text-white rounded-xl font-medium hover:opacity-90 transition-all active:scale-95"
      >
        <ArrowLeft size={18} /> Back Home
      </Link>
    </div>
  );
}

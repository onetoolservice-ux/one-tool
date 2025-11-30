import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 size={48} className="text-indigo-600 animate-spin" />
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Loading OneTool...</p>
      </div>
    </div>
  );
}

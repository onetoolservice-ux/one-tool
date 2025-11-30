import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  color?: "emerald" | "blue" | "indigo" | "rose" | "amber";
}

export default function EmptyState({ title, description, icon: Icon, action, color = "indigo" }: EmptyStateProps) {
  
  const colors = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 h-full min-h-[400px]">
      <div className={`p-4 rounded-full mb-4 ${colors[color]} ring-4 ring-white dark:ring-slate-900 shadow-sm`}>
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-main dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted dark:text-muted max-w-sm mb-8 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="animate-in zoom-in-95 duration-300">
          {action}
        </div>
      )}
    </div>
  );
}

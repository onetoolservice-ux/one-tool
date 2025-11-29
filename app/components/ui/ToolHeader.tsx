"use client";

export default function ToolHeader({ title, desc, icon, children }: any) {
  return (
    <div className="bg-surface dark:bg-slate-800 dark:bg-surface border-b border-line dark:border-slate-700 dark:border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-30   h-16 shrink-0">
      {/* Left Side: Icon + Title (No Back Button) */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-slate-100 text-muted dark:text-muted/70 dark:text-muted/70 rounded-lg border border-line dark:border-slate-700 dark:border-slate-800 hidden sm:block">
          {icon}
        </div>
        <div>
          <h1 className="text-base font-bold text-main dark:text-slate-100 dark:text-slate-200 leading-none">{title}</h1>
          <p className="text-[11px] font-medium text-muted dark:text-muted dark:text-muted dark:text-muted mt-0.5">{desc}</p>
        </div>
      </div>

      {/* Right Side: Tool Controls */}
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

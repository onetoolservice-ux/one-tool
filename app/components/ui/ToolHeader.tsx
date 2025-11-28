"use client";

export default function ToolHeader({ title, desc, icon, children }: any) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm h-16 shrink-0">
      {/* Left Side: Icon + Title (No Back Button) */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200 hidden sm:block">
          {icon}
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 leading-none">{title}</h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">{desc}</p>
        </div>
      </div>

      {/* Right Side: Tool Controls */}
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}

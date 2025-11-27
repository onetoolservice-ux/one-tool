// app/components/navigation/ToolMenuItem.tsx
"use client";
import React from "react";

type ToolMenuItemProps = {
  title: string;
  desc?: string;
  href?: string;
  Icon?: React.ComponentType<any>;
};

export default function ToolMenuItem({ title, desc, href = "#", Icon }: ToolMenuItemProps) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
      aria-label={title}
    >
      <div className="w-10 h-10 rounded-lg bg-[rgba(117,163,163,0.12)] flex items-center justify-center text-[#75A3A3]">
        {Icon ? <Icon size={18} /> : <div className="w-4 h-4 bg-[#75A3A3]" />}
      </div>

      <div className="flex-1">
        <div className="text-sm font-semibold text-slate-800">{title}</div>
        {desc && <div className="text-xs text-slate-500 mt-0.5">{desc}</div>}
      </div>
    </a>
  );
}

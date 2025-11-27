// app/components/navigation/MobileNavbar.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

export default function MobileNavbar() {
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const sections = [
    {
      title: "Finance",
      items: [
        { label: "Budget Tracker", href: "/tools/finance/budget-tracker" },
        { label: "Debt Planner", href: "/tools/finance/debt-planner" },
        { label: "Monthly Budget", href: "/tools/finance/monthly-budget" },
      ],
    },
    {
      title: "Documents",
      items: [
        { label: "PDF Tool", href: "/tools/documents/pdf-tool" },
        { label: "Image Tool", href: "/tools/documents/image-tool" },
        { label: "Excel Utilities", href: "/tools/documents/excel-tool" },
      ],
    },
    {
      title: "Converters",
      items: [
        { label: "Image → PDF", href: "/tools/converters/img2pdf" },
        { label: "PDF → Word", href: "/tools/converters/pdf2word" },
        { label: "PNG → JPG", href: "/tools/converters/png2jpg" },
      ],
    },
  ];

  return (
    <>
      <button
        className="md:hidden text-slate-700"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={26} />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 w-72 h-full bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#75A3A3] flex items-center justify-center text-white text-sm font-bold">
              OT
            </div>
            <div className="font-semibold text-slate-800 text-lg">One Tool</div>
          </div>

          <button onClick={() => setOpen(false)} aria-label="Close">
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col px-4 py-4 gap-4 text-slate-700">
          <Link href="/" className="text-base hover:text-[#75A3A3]">Home</Link>
          <Link href="/ai" className="text-base hover:text-[#75A3A3]">AI</Link>

          <div>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="w-full flex items-center justify-between py-2 text-base hover:text-[#75A3A3]"
            >
              <span>Tools</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${toolsOpen ? "rotate-180" : ""}`}
              />
            </button>

            {toolsOpen && (
              <div className="pl-3 pt-1 flex flex-col gap-3">
                {sections.map((sec) => (
                  <div key={sec.title}>
                    <div className="text-xs uppercase text-slate-500 mb-1">{sec.title}</div>
                    <div className="flex flex-col gap-1 mb-2">
                      {sec.items.map((it) => (
                        <Link
                          key={it.label}
                          href={it.href}
                          className="text-sm text-slate-700 hover:text-[#75A3A3] pl-2"
                        >
                          {it.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/learn" className="text-base hover:text-[#75A3A3]">Learn</Link>
          <Link href="/about" className="text-base hover:text-[#75A3A3]">About</Link>
        </nav>
      </aside>
    </>
  );
}

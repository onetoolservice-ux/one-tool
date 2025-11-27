import Link from "next/link";
import { FileText, Layers, Image, Braces, FileType, ArrowRight, RefreshCw } from "lucide-react";

const CATEGORIES = [
  {
    title: "PDF Tools",
    desc: "Merge, split, and modify PDF documents securely.",
    icon: <Layers size={24} />,
    color: "text-rose-600",
    bg: "bg-rose-50",
    tools: [
      { name: "Merge PDFs", href: "/tools/documents/pdf/merge" },
      { name: "Split PDF", href: "#", tag: "Soon" }
    ]
  },
  {
    title: "JSON Tools",
    desc: "Format, validate, and minify JSON data.",
    icon: <Braces size={24} />,
    color: "text-amber-600",
    bg: "bg-amber-50",
    tools: [
      { name: "JSON Formatter", href: "/tools/documents/json/formatter" },
      { name: "JSON to CSV", href: "#", tag: "Soon" }
    ]
  },
  {
    title: "Image Tools",
    desc: "Compress, resize and convert images locally.",
    icon: <Image size={24} />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    tools: [
      { name: "Compressor", href: "/tools/documents/image/compressor" },
      { name: "Converter", href: "/tools/documents/image/converter" }
    ]
  }
];

export default function DocumentsHub() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-[rgb(117,163,163)]/10 text-[rgb(117,163,163)] rounded-2xl mb-4">
          <FileType size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Document Studio</h1>
        <p className="text-lg text-slate-500 mt-3 max-w-2xl mx-auto">
          A suite of private, client-side tools. Your files never leave your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {CATEGORIES.map((cat) => (
          <div key={cat.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
            <div className="p-6 border-b border-slate-100">
              <div className={`w-12 h-12 rounded-xl ${cat.bg} ${cat.color} flex items-center justify-center mb-4`}>
                {cat.icon}
              </div>
              <h2 className="text-xl font-bold text-slate-800">{cat.title}</h2>
              <p className="text-sm text-slate-500 mt-2">{cat.desc}</p>
            </div>
            <div className="p-4 bg-slate-50/50">
              <div className="space-y-2">
                {cat.tools.map((tool) => (
                  <Link key={tool.name} href={tool.href} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${tool.tag ? 'opacity-60 cursor-not-allowed' : 'bg-white hover:bg-[rgb(117,163,163)]/5 hover:border-[rgb(117,163,163)]/20 border border-transparent'}`}>
                    <span className="text-sm font-medium text-slate-700">{tool.name}</span>
                    {tool.tag ? (
                      <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-500 px-2 py-0.5 rounded">{tool.tag}</span>
                    ) : (
                      <ArrowRight size={16} className="text-slate-400" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

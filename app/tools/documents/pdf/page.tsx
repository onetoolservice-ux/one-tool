import Link from "next/link";
import { FileText, Image, Scissors, Layers, ArrowRight } from "lucide-react";

const TOOLS = [
  { 
    id: "pdf-merge", 
    name: "Merge PDFs", 
    desc: "Combine multiple PDF files into one document. Drag, drop, and reorder.", 
    icon: <Layers size={24} />, 
    color: "text-blue-600", 
    bg: "bg-blue-50",
    href: "/tools/documents/pdf-merge",
    status: "Ready"
  },
  { 
    id: "pdf-split", 
    name: "Split PDF", 
    desc: "Extract pages from your PDF documents instantly.", 
    icon: <Scissors size={24} />, 
    color: "text-rose-600", 
    bg: "bg-rose-50",
    href: "#",
    status: "Coming Soon"
  },
  { 
    id: "img-compress", 
    name: "Compress Images", 
    desc: "Reduce file size of JPG/PNG without losing quality.", 
    icon: <Image size={24} />, 
    color: "text-emerald-600", 
    bg: "bg-emerald-50",
    href: "#",
    status: "Coming Soon"
  },
  { 
    id: "pdf-to-word", 
    name: "PDF to Word", 
    desc: "Convert read-only PDFs into editable docx files.", 
    icon: <FileText size={24} />, 
    color: "text-amber-600", 
    bg: "bg-amber-50",
    href: "#",
    status: "Coming Soon"
  },
];

export default function DocumentsDashboard() {
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Document Tools</h1>
        <p className="text-slate-500 mt-2">Secure, client-side file manipulation. Your files never leave your device.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TOOLS.map((tool) => (
          <Link key={tool.id} href={tool.href} className={`group relative block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all ${tool.status !== "Ready" ? "opacity-60 pointer-events-none" : "hover:-translate-y-1"}`}>
            <div className={`w-12 h-12 rounded-lg ${tool.bg} ${tool.color} flex items-center justify-center mb-4`}>
              {tool.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-800 group-hover:text-[rgb(117,163,163)] transition-colors">{tool.name}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{tool.desc}</p>
            
            {tool.status === "Ready" ? (
              <div className="mt-4 flex items-center text-sm font-medium text-[rgb(117,163,163)]">
                Launch Tool <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
              </div>
            ) : (
              <div className="mt-4 inline-block px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded font-medium">
                Coming Soon
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
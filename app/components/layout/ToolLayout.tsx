import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card } from "@/app/components/ui/Card"; 

interface ToolLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function ToolLayout({ title, description, children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-[#0B1120] pb-20 pt-8">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header/Back Button */}
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition mb-6"
        >
          <ChevronLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Tool Title */}
        <header className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">{description}</p>
        </header>

        {/* Tool Content Wrapper */}
        <Card className="p-8">
          {children}
        </Card>
      </div>
    </div>
  );
}

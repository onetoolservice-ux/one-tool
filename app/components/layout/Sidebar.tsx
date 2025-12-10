'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutGrid, Zap, Globe, FileText, Settings, 
  LogOut, User 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-[#0F111A] border-r border-white/5 flex flex-col h-full z-40 hidden md:flex flex-shrink-0">
      {/* LOGO AREA */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="font-bold text-white text-sm">OT</span>
        </div>
        <span className="font-bold text-lg text-white tracking-tight">One Tool</span>
      </div>

      {/* NAV TABS */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-3">
          Platform
        </div>
        
        <NavItem href="/" icon={<LayoutGrid size={18} />} label="All Tools" active={isActive('/')} />
        <NavItem href="/productivity" icon={<Globe size={18} />} label="Productivity" active={isActive('/productivity')} />
        <NavItem href="/utilities" icon={<Zap size={18} />} label="Utilities" active={isActive('/utilities')} />
        <NavItem href="/documents" icon={<FileText size={18} />} label="Documents" active={isActive('/documents')} />
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-white/5">
        <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors group">
           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white">
             <User size={14} />
           </div>
           <div className="text-left overflow-hidden">
             <div className="text-sm font-bold text-white truncate">My Workspace</div>
             <div className="text-xs text-gray-500 truncate">Free Plan</div>
           </div>
           <Settings size={14} className="ml-auto text-gray-500 group-hover:text-white transition-colors" />
        </button>
      </div>
    </aside>
  );
}

const NavItem = ({ href, icon, label, active }: any) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-blue-600/10 text-blue-400' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    {React.cloneElement(icon, { size: 18, className: active ? 'text-blue-400' : 'group-hover:text-white transition-colors' })}
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

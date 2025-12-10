import React from 'react';
import { LayoutDashboard, Clock, Calendar, Target, Globe, BarChart2, Settings, User } from 'lucide-react';
import ActionCenter from './ActionCenter';
import FocusSection from './FocusSection';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-[#0F111A] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#0F111A] z-20">
        <div className="p-6 flex items-center gap-3">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
             <LayoutDashboard className="w-5 h-5 text-white" />
           </div>
           <h1 className="text-xl font-bold tracking-tight">Life OS</h1>
        </div>
        <nav className="flex-1 flex flex-col px-4 gap-2 mt-4">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" active />
          <SidebarItem icon={<Clock />} label="Daily Planner" />
          <SidebarItem icon={<Calendar />} label="Weekly Review" />
          <SidebarItem icon={<Target />} label="Monthly Goals" />
          <SidebarItem icon={<Globe />} label="Macro Vision" />
        </nav>
        <div className="p-4 border-t border-white/5">
          <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center">
              <User size={14} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">My Workspace</div>
            </div>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT - No Cards, Just Action */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto bg-[#0F111A]">
        
        {/* TOP: The Action Center (Centered Input) */}
        <div className="w-full">
           <ActionCenter />
        </div>

        {/* BOTTOM: Your Focus List (Content) */}
        <div className="max-w-6xl mx-auto w-full px-8 pb-12">
           <div className="flex items-center gap-4 mb-6">
             <div className="h-px bg-white/10 flex-1"></div>
             <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Active Boards</span>
             <div className="h-px bg-white/10 flex-1"></div>
           </div>
           
           <FocusSection />
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    {React.cloneElement(icon, { size: 18, className: active ? 'text-white' : 'text-gray-400 group-hover:text-white' })}
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default DashboardLayout;

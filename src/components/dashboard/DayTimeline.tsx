import React from 'react';

const DayTimeline = () => {
  // Mock hours for the timeline
  const hours = [
    '08 AM', '09 AM', '10 AM', '11 AM', '12 PM', 
    '01 PM', '02 PM', '03 PM', '04 PM', '05 PM'
  ];

  return (
    <div className="w-full border-b border-white/5 bg-[#1C1F2E]/50 backdrop-blur-sm p-4 flex items-center gap-8 overflow-x-auto no-scrollbar">
      
      <div className="flex-shrink-0 px-4">
         <div className="text-2xl font-bold text-white">02:25 <span className="text-sm font-medium text-gray-500">PM</span></div>
         <div className="text-xs text-blue-400 font-bold uppercase tracking-wider">Current Time</div>
      </div>

      <div className="h-8 w-px bg-white/10 flex-shrink-0" />

      {/* Timeline Bar */}
      <div className="flex-1 flex items-center justify-between min-w-[600px] relative">
         {/* The "Current Time" Line Indicator */}
         <div className="absolute left-[62%] top-0 bottom-0 w-0.5 bg-blue-500 z-10">
           <div className="absolute -top-1 -left-[3px] w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
         </div>

         {hours.map((hour, index) => (
           <div key={index} className="flex flex-col items-center gap-2 relative group cursor-pointer">
             <div className={`w-2 h-2 rounded-full ${index === 6 ? 'bg-blue-500' : 'bg-gray-700 group-hover:bg-gray-500'} transition-colors`} />
             <span className={`text-xs font-medium ${index === 6 ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>{hour}</span>
             
             {/* Hover Task Preview (Example) */}
             {index === 6 && (
               <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-[#1C1F2E] border border-white/10 px-3 py-1 rounded-md whitespace-nowrap z-20 shadow-xl">
                 <span className="text-xs text-white">Deep Work Session</span>
               </div>
             )}
           </div>
         ))}
      </div>
    </div>
  );
};

export default DayTimeline;

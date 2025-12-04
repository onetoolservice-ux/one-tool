import React from 'react';

export const DynamicBackground = () => {
  return (
    <div className="fixed inset-0 z-[-50] pointer-events-none h-full w-full">
      {/* Base Layer */}
      <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#020617]"></div>
      
      {/* 1. The Mesh Gradient (Subtle Mineral Sage Tint) */}
      <div 
        className="absolute top-[-10%] right-[-5%] w-[70%] h-[50%] rounded-full blur-[120px] opacity-[0.08] dark:opacity-[0.05]"
        style={{ backgroundColor: '#638c80' }} // Mineral Sage
      ></div>

      {/* 2. The Secondary Glow (Teal) */}
      <div 
        className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-[0.06] dark:opacity-[0.03]"
        style={{ backgroundColor: '#0d9488' }} // Teal
      ></div>

      {/* 3. The Technical Grid (Overlay) */}
      <div 
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.1]"
        style={{
            backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)'
        }}
      ></div>
    </div>
  );
};

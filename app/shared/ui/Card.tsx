import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

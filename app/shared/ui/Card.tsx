import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface dark:bg-slate-800 dark:bg-surface rounded-xl border border-line dark:border-slate-700 dark:border-slate-800 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] ${className}`}>
      {children}
    </div>
  );
}

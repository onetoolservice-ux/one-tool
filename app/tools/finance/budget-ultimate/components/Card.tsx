import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-surface dark:bg-slate-800 dark:bg-surface border rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}

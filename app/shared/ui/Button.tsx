import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export default function Button({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) {
  
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[rgb(117,163,163)] text-white hover:bg-[#5f8a8a]   hover: ",
    secondary: "bg-surface dark:bg-slate-800 dark:bg-surface text-main dark:text-slate-300 border border-line dark:border-slate-700 dark:border-slate-800 hover:bg-background dark:bg-surface dark:bg-slate-950 hover:border-line",
    ghost: "bg-transparent dark:text-white text-muted dark:text-muted/70 dark:text-muted/70 hover:text-[rgb(117,163,163)] hover:bg-teal-50",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

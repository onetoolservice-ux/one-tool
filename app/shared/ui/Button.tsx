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
    primary: "bg-[rgb(117,163,163)] text-white hover:bg-[#5f8a8a] shadow-sm hover:shadow-md",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300",
    ghost: "bg-transparent text-slate-600 hover:text-[rgb(117,163,163)] hover:bg-teal-50",
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

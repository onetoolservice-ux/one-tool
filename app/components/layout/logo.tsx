import React from 'react';
export const Logo = ({ className = "w-8 h-8", color = "#0d9488" }: { className?: string, color?: string }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="100" height="100" rx="24" fill={color} />
      <path fillRule="evenodd" clipRule="evenodd" d="M50 20C33.4315 20 20 33.4315 20 50C20 66.5685 33.4315 80 50 80C66.5685 80 80 66.5685 80 50C80 33.4315 66.5685 20 50 20ZM32 50C32 40.0589 40.0589 32 50 32C59.9411 32 68 40.0589 68 50C68 59.9411 59.9411 68 50 68C40.0589 68 32 59.9411 32 50Z" fill="white" />
      <rect x="46" y="15" width="8" height="25" fill={color} />
      <rect x="46" y="60" width="8" height="25" fill={color} />
    </svg>
  );
};

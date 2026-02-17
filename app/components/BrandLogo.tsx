'use client';

import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export default function BrandLogo({ size = 36, className = '' }: BrandLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white font-black overflow-hidden ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42, borderRadius: size * 0.22 }}
    >
      {/* Subtle shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
      <span className="relative tracking-tight">O</span>
    </div>
  );
}

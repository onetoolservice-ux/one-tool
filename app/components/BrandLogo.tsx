'use client';

import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export default function BrandLogo({ size = 36, className = '' }: BrandLogoProps) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      O
    </div>
  );
}

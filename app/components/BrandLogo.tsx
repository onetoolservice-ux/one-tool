'use client';

import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export default function BrandLogo({ size = 36, className = '' }: BrandLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center font-black overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        borderRadius: size * 0.22,
        background: 'var(--ot-logo-bg, linear-gradient(135deg, #6366f1 0%, #7c3aed 100%))',
        color: 'var(--ot-logo-text, #ffffff)',
        boxShadow: '0 0 0 1.5px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.18)',
      }}
    >
      {/* Subtle shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
      <span className="relative tracking-tight">O</span>
    </div>
  );
}

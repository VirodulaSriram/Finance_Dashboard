import React from 'react';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="logo-bar1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="logo-bar2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="logo-bar3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="logo-arrow" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="40%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <filter id="logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Bars */}
      <rect x="18" y="48" width="15" height="28" rx="3" fill="url(#logo-bar1)" />
      <rect x="38" y="38" width="15" height="38" rx="3" fill="url(#logo-bar2)" />
      <rect x="58" y="24" width="20" height="52" rx="4" fill="url(#logo-bar3)" />

      {/* Swoosh Background (creates a bit of a cutout effect if needed, but we'll use drop shadow) */}
      <g filter="url(#logo-shadow)">
        <path 
          d="M 12 60 Q 40 95 80 40" 
          fill="none" 
          stroke="url(#logo-arrow)" 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        <path 
          d="M 72 35 L 88 28 L 84 46 Z" 
          fill="#86efac" 
        />
      </g>
    </svg>
  );
}

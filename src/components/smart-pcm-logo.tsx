import React from 'react';

export function SmartPcmLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 450 150"
      className={className}
      aria-label="SmartPCM Logo"
      width="150"
      height="50"
    >
      <defs>
        <path
          id="quadrant"
          d="M75 5 C 40 5, 5 40, 5 75 C 5 110, 40 145, 75 145 C 90 145, 105 135, 115 125 L 75 75 L 115 25 C 105 15, 90 5, 75 5 Z"
        />
      </defs>

      {/* Main container shapes */}
      <g fill="#007E7A" stroke="#007E7A" strokeWidth="4" strokeLinejoin="round">
        <use href="#quadrant" />
        <use href="#quadrant" transform="rotate(90, 75, 75)" />
        <use href="#quadrant" transform="rotate(180, 75, 75)" />
        <use href="#quadrant" transform="rotate(270, 75, 75)" />
      </g>

      {/* Top-left: Stopwatch */}
      <g transform="translate(30, 30)">
        <circle cx="45" cy="45" r="30" fill="none" stroke="#007E7A" strokeWidth="6" />
        <path d="M45 15 L 45 7" stroke="#007E7A" strokeWidth="6" strokeLinecap="round" />
        <path d="M35 11 L 55 11" stroke="#007E7A" strokeWidth="6" strokeLinecap="round" />
        <path d="M45 45 L 63 63" stroke="#ECB11F" strokeWidth="6" strokeLinecap="round" />
        <path d="M45 45 L 45 25" stroke="#ECB11F" strokeWidth="6" strokeLinecap="round" />
      </g>

      {/* Top-right: Gear */}
      <g transform="translate(120, 30)">
        <path
          fill="#007E7A"
          d="M45,20
             L55,22 L58,30 L58,35 L65,40 L65,50 L58,55 L58,60 L55,68
             L45,70
             L35,68 L32,60 L32,55 L25,50 L25,40 L32,35 L32,30 L35,22
             Z"
        />
        <circle cx="45" cy="45" r="12" fill="white" />
        <circle cx="45" cy="45" r="8" fill="none" stroke="#ECB11F" strokeWidth="4" />
      </g>

      {/* Bottom-left: Checkmark */}
      <g transform="translate(30, 120)">
        <path
          d="M20 50 L45 75 L80 25"
          fill="none"
          stroke="#007E7A"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="scale(0.8) translate(5, -15)"
        />
        <path
          d="M58 20 L 78 40 L 98 20"
          fill="none"
          stroke="#ECB11F"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="scale(0.8) translate(5, -15)"
        />
      </g>

      {/* Bottom-right: Document */}
      <g transform="translate(120, 120)">
         <rect x="25" y="20" width="40" height="50" rx="5" fill="none" stroke="#007E7A" strokeWidth="6"/>
         <path d="M35 35 h 20" stroke="#ECB11F" strokeWidth="6" strokeLinecap="round" />
         <path d="M35 45 h 20" stroke="#ECB11F" strokeWidth="6" strokeLinecap="round" />
         <path d="M35 55 h 20" stroke="#ECB11F" strokeWidth="6" strokeLinecap="round" />
      </g>
      
      {/* Text */}
      <text x="180" y="70" fontFamily="Arial, sans-serif" fontSize="60" fill="#888888" letterSpacing="1">
        Smart
      </text>
      <text x="180" y="135" fontFamily="Arial, sans-serif" fontSize="80" fontWeight="bold" fill="#585858">
        PCM
      </text>
    </svg>
  );
}

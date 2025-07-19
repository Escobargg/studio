import React from 'react';

export function SmartPcmLogo({ className }: { className?: string }) {
  // Using a standard <img> tag to bypass Next.js image optimization issues.
  // This is a more direct way to ensure the image from the /public folder is loaded.
  return (
    <img
      src="/logo.png"
      alt="SmartPCM Logo"
      width="150"
      height="40"
      className={className}
    />
  );
}


import Image from 'next/image';
import React from 'react';

export function SmartPcmLogo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="SmartPCM Logo"
      width={150}
      height={40}
      className={className}
      priority
    />
  );
}

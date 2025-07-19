import React from 'react';
import Image from 'next/image';

export function SmartPcmLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src="/logo.png"
        alt="SmartPCM Logo"
        width={150}
        height={40}
        priority
      />
    </div>
  );
}

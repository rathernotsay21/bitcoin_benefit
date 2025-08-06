import React from 'react';
import Image from 'next/image';

interface IconProps {
  className?: string;
  size?: number;
  color?: string; // Keep for API compatibility, but ignored for PNG
}

export const SatoshiOutlineIcon: React.FC<IconProps> = ({ 
  className = '', 
  size = 24, 
  // color prop is ignored for PNG images
}) => {
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/satoshi_logo.png"
        alt="Bitcoin Benefits Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
        // Next.js will automatically optimize this image
        quality={90}
        sizes={`${size}px`}
      />
    </div>
  );
};
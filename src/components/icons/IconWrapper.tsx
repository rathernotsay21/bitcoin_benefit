import React from 'react';
import { IconSize, iconSizes } from './types';

interface IconWrapperProps {
  children: React.ReactElement;
  size?: IconSize;
  className?: string;
  color?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  children,
  size = 'md',
  className = '',
  color = 'currentColor'
}) => {
  const iconSize = typeof size === 'number' ? size : iconSizes[size];
  
  return React.cloneElement(children, {
    size: iconSize,
    className,
    color,
  });
};

// Usage example:
// <IconWrapper size="lg" className="text-orange-500">
//   <BitcoinIcon />
// </IconWrapper>
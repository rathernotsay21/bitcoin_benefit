import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const MiningOutlineIcon: React.FC<IconProps> = ({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M12.2651 3.70309C9.72917 3.47824 7.38425 4.16153 5.84197 5.4923C5.65153 5.65663 5.82289 5.9364 6.06757 5.87805C7.78468 5.46852 9.73866 5.38359 11.772 5.68067L12.2651 3.70309Z" 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M15.168 6.52739C17.1029 7.21968 18.7883 8.21203 20.1122 9.37977C20.3009 9.54616 20.5835 9.37959 20.4925 9.14509C19.7555 7.246 18.0058 5.5418 15.6611 4.5498L15.168 6.52739Z" 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <rect 
        x="12.4812" 
        y="5.93628" 
        width="2" 
        height="5" 
        transform="rotate(14 12.4812 5.93628)" 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <rect 
        x="10.7865" 
        y="10.6668" 
        width="3" 
        height="9.5" 
        transform="rotate(14 10.7865 10.6668)" 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <rect 
        x="12.3583" 
        y="3.3291" 
        width="3.5" 
        height="2.75" 
        transform="rotate(14 12.3583 3.3291)" 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};
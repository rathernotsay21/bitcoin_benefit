import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const BitcoinCircleOutlineIcon: React.FC<IconProps> = ({ 
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
        d="M20.2473 14.0515C19.1131 18.6023 14.5039 21.3811 9.94477 20.2462C5.39397 19.1085 2.61956 14.4993 3.75378 9.94853C4.88801 5.39774 9.49442 2.61886 14.0424 3.75378C18.6044 4.87478 21.3788 9.4979 20.2473 14.0515Z" 
        stroke={color}
      />
      <path 
        d="M9.39911 14.9122L11.0926 8.12012" 
        stroke={color} 
        strokeLinecap="square" 
        strokeLinejoin="round"
      />
      <path 
        d="M9.63712 7.75726C9.63712 7.75726 11.0902 8.11957 13.8181 8.79969C16.5459 9.47982 15.9371 12.6775 13.0318 11.9532C16.2158 12.747 15.8914 16.5309 12.1246 15.5918C10.2837 15.1328 8.31195 14.6412 8.31195 14.6412" 
        stroke={color} 
        strokeLinecap="square" 
        strokeLinejoin="round"
      />
      <path 
        d="M10.3063 11.2736L12.9746 11.9389" 
        stroke={color} 
        strokeLinecap="square" 
        strokeLinejoin="round"
      />
      <path 
        d="M11.5777 8.24109L11.9406 6.78564" 
        stroke={color} 
        strokeLinecap="square" 
        strokeLinejoin="round"
      />
      <path 
        d="M9.52136 16.4886L9.88425 15.0332" 
        stroke={color} 
        strokeLinecap="square" 
        strokeLinejoin="round"
      />
      <path 
        d="M13.5183 8.72497L13.8812 7.26953" 
        stroke={color} 
        strokeLinecap="square" 
        strokeLinejoin="round"
      />
      <path 
        d="M11.462 16.9725L11.8249 15.517" 
        stroke={color} 
        strokeLinecap="square" 
        strokeLinejoin="round"
      />
    </svg>
  );
};
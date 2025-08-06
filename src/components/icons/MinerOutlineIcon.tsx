import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export const MinerOutlineIcon: React.FC<IconProps> = ({ 
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
        d="M6.41324 18.4062C5.85965 17.923 5.85965 17.077 6.41325 16.5938C7.90717 15.2899 9.86137 14.5 12 14.5C14.1387 14.5 16.093 15.2899 17.5869 16.5938C18.1405 17.077 18.1405 17.923 17.5869 18.4062C16.093 19.7101 14.1388 20.5 12.0001 20.5C9.86139 20.5 7.90717 19.7101 6.41324 18.4062Z" 
        stroke={color}
      />
      <path 
        d="M8.52139 8.5C8.71484 10.75 10.1985 12.5 12 12.5C13.8016 12.5 15.2852 10.75 15.4787 8.5H8.52139Z" 
        stroke={color}
      />
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M15.9999 8C15.9999 8.169 15.9917 8.33583 15.9755 8.5H8.02435C8.00822 8.33583 7.99994 8.169 7.99994 8C7.99994 5.51472 9.7908 3.5 11.9999 3.5C14.2091 3.5 15.9999 5.51472 15.9999 8ZM11.9999 7C12.5522 7 12.9999 6.55228 12.9999 6C12.9999 5.44772 12.5522 5 11.9999 5C11.4477 5 10.9999 5.44772 10.9999 6C10.9999 6.55228 11.4477 7 11.9999 7Z" 
        stroke={color}
      />
      <path 
        d="M7.00006 8.5H17.0001" 
        stroke={color} 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};
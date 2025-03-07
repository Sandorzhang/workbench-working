import React from 'react';
import { cn } from '@/lib/utils';

interface MemoryIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
}

export const MemoryIcon: React.FC<MemoryIconProps> = ({
  className,
  size = 'md',
  color = 'primary',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    muted: 'text-muted-foreground',
    accent: 'text-accent',
  };

  return (
    <svg
      className={cn(sizeClasses[size], colorClasses[color], className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 12.2V13.9C22 17.05 22 18.63 21.12 19.74C20.74 20.22 20.22 20.58 19.66 20.79C18.43 21.25 16.74 20.73 13.36 19.7C12.98 19.59 12.79 19.54 12.6 19.5C12.31 19.44 12.01 19.43 11.71 19.47C11.52 19.5 11.33 19.55 10.94 19.66L9.66 20.08C7.51 20.74 6.44 21.07 5.59 20.81C5.04 20.65 4.55 20.33 4.19 19.9C3.6 19.19 3.6 18.07 3.6 15.84V8.16C3.6 5.93 3.6 4.81 4.19 4.1C4.55 3.67 5.04 3.35 5.59 3.19C6.44 2.93 7.51 3.26 9.66 3.92L10.94 4.34C11.33 4.45 11.52 4.5 11.71 4.53C12.01 4.57 12.31 4.56 12.6 4.5C12.79 4.46 12.98 4.41 13.36 4.3C16.74 3.27 18.43 2.75 19.66 3.21C20.22 3.42 20.74 3.78 21.12 4.26C22 5.37 22 6.95 22 10.1V12.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10.5 12C10.5 12.8284 11.1716 13.5 12 13.5C12.8284 13.5 13.5 12.8284 13.5 12C13.5 11.1716 12.8284 10.5 12 10.5C11.1716 10.5 10.5 11.1716 10.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export default MemoryIcon; 
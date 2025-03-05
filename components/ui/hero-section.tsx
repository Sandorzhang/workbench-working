import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
  className?: string;
  actions?: ReactNode;
}

export function HeroSection({
  title,
  description,
  icon: Icon,
  gradient = "from-indigo-50 to-blue-50",
  className = "",
  actions,
}: HeroSectionProps) {
  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-lg p-4 mb-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-white p-2 shadow-sm rounded-xl mr-4 border border-indigo-100">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1 max-w-2xl text-sm">
              {description}
            </p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
} 
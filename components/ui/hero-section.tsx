import React from 'react';
import { LucideIcon } from 'lucide-react';

interface HeroSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient?: string;
  className?: string;
}

export function HeroSection({
  title,
  description,
  icon: Icon,
  gradient = "from-indigo-50 to-blue-50",
  className = "",
}: HeroSectionProps) {
  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-xl p-6 mb-8 shadow-sm ${className}`}>
      <div className="flex items-center">
        <div className="bg-white p-4 shadow-md rounded-2xl mr-6 border border-indigo-100">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2 max-w-2xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
} 
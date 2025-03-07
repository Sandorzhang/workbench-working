import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuperAdminHeroProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
  className?: string;
}

export function SuperAdminHero({
  title,
  description,
  icon: Icon,
  actions,
  className
}: SuperAdminHeroProps) {
  return (
    <div className={cn(
      "w-full mb-8",
      className
    )}>
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 shadow-sm border border-primary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg shadow-sm border border-primary/20">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                {description}
              </p>
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
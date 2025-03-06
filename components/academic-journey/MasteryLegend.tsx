'use client';

import { cn } from '@/shared/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MasteryLevel } from '@/features/academic-journey/types';

interface MasteryLegendProps {
  className?: string;
  showLabels?: boolean;
  direction?: 'horizontal' | 'vertical';
}

export function MasteryLegend({
  className,
  showLabels = true,
  direction = 'horizontal',
}: MasteryLegendProps) {
  const masteryLevels: Array<{ level: MasteryLevel; label: string; color: string }> = [
    { level: 'mastered', label: '已掌握', color: 'bg-green-500' },
    { level: 'progressing', label: '进行中', color: 'bg-blue-500' },
    { level: 'needs-improvement', label: '需提高', color: 'bg-amber-500' },
    { level: 'not-started', label: '未开始', color: 'bg-gray-400' },
  ];

  return (
    <div
      className={cn(
        'flex gap-3 items-center',
        direction === 'vertical' && 'flex-col items-start',
        className
      )}
    >
      {masteryLevels.map(({ level, label, color }) => (
        <div
          key={level}
          className={cn(
            'flex items-center gap-2',
            direction === 'vertical' && 'justify-start'
          )}
        >
          <div className={cn('w-4 h-4 rounded-sm', color)} />
          {showLabels && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      ))}
    </div>
  );
}

export function MasteryBadge({ level }: { level: MasteryLevel }) {
  const badgeProps: Record<MasteryLevel, { variant: "default" | "secondary" | "destructive" | "outline" | null | undefined, label: string }> = {
    'mastered': { variant: 'default', label: '已掌握' },
    'progressing': { variant: 'secondary', label: '进行中' },
    'needs-improvement': { variant: 'destructive', label: '需提高' },
    'not-started': { variant: 'outline', label: '未开始' },
  };

  const { variant, label } = badgeProps[level];

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
} 
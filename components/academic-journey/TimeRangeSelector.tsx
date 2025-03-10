'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface TimeRangeSelectorProps {
  onChange: (startDate: Date, endDate: Date, range: TimeRange) => void;
  className?: string;
}

export function TimeRangeSelector({ onChange, className }: TimeRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('month');
  
  const handleRangeChange = (value: TimeRange) => {
    setSelectedRange(value);
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();
    
    switch (value) {
      case 'week':
        // Start from last Sunday (or 7 days ago)
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(today);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'month':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'quarter':
        // Start from beginning of current quarter
        const currentMonth = today.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        startDate = startOfMonth(new Date(today.getFullYear(), quarterStartMonth, 1));
        endDate = endOfMonth(new Date(today.getFullYear(), quarterStartMonth + 2, 1));
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        // Default to current month
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
    }
    
    onChange(startDate, endDate, value);
  };
  
  // Function to generate time period options
  const generateTimeOptions = () => {
    const today = new Date();
    const options = [];
    
    // Current month
    const currentMonth = format(today, 'yyyy年MM月', { locale: zhCN });
    options.push({ value: 'current', label: currentMonth });
    
    // Past 3 months
    for (let i = 1; i <= 3; i++) {
      const date = subMonths(today, i);
      const label = format(date, 'yyyy年MM月', { locale: zhCN });
      options.push({ value: `past-${i}`, label });
    }
    
    return options;
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <Select
        value={selectedRange}
        onValueChange={(value) => handleRangeChange(value as TimeRange)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="选择时间范围" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">本周</SelectItem>
          <SelectItem value="month">本月</SelectItem>
          <SelectItem value="quarter">本季度</SelectItem>
          <SelectItem value="year">本年度</SelectItem>
        </SelectContent>
      </Select>
      
      {selectedRange === 'custom' && (
        <div className="flex space-x-2">
          <Select defaultValue="current">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="起始时间" />
            </SelectTrigger>
            <SelectContent>
              {generateTimeOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <span className="flex items-center">至</span>
          
          <Select defaultValue="current">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="结束时间" />
            </SelectTrigger>
            <SelectContent>
              {generateTimeOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { LearningStandard } from '@/types/academic-journey';
import { getLearningStandards } from '@/lib/api-academic-journey';

interface StandardsFilterProps {
  onChange: (selectedStandards: string[]) => void;
  className?: string;
  multiple?: boolean;
  sticky?: boolean;
}

export function StandardsFilter({ onChange, className, multiple = true, sticky = false }: StandardsFilterProps) {
  const [open, setOpen] = useState(false);
  const [standards, setStandards] = useState<LearningStandard[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [grades, setGrades] = useState<string[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        setLoading(true);
        const { standards } = await getLearningStandards();
        setStandards(standards);

        // Extract unique subjects and grades
        const uniqueSubjects = Array.from(new Set(standards.map(s => s.subject)));
        const uniqueGrades = Array.from(new Set(standards.map(s => s.grade)));
        
        setSubjects(uniqueSubjects);
        setGrades(uniqueGrades);
      } catch (error) {
        console.error('Failed to fetch standards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStandards();
  }, []);

  // Filter standards based on subject and grade
  const filteredStandards = standards.filter(standard => {
    if (selectedSubject && standard.subject !== selectedSubject) return false;
    if (selectedGrade && standard.grade !== selectedGrade) return false;
    return true;
  });

  const handleSelect = (value: string) => {
    let newSelectedValues: string[];
    
    if (multiple) {
      if (selectedValues.includes(value)) {
        newSelectedValues = selectedValues.filter(v => v !== value);
      } else {
        newSelectedValues = [...selectedValues, value];
      }
    } else {
      newSelectedValues = [value];
    }
    
    setSelectedValues(newSelectedValues);
    onChange(newSelectedValues);
    if (!multiple) setOpen(false);
  };

  return (
    <div className={cn(
      "space-y-4", 
      sticky && "sticky top-4 z-10 bg-white p-4 rounded-lg shadow-sm border", 
      className
    )}>
      <div className="flex flex-wrap gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between md:w-[350px]"
            >
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                {multiple
                  ? selectedValues.length === 0
                    ? "选择学习标准"
                    : `已选择 ${selectedValues.length} 项标准`
                  : selectedValues.length > 0
                  ? standards.find(standard => standard.id === selectedValues[0])?.shortDescription || "选择学习标准"
                  : "选择学习标准"}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 md:w-[650px] max-h-[80vh] overflow-hidden">
            <Command className="max-h-full">
              <CommandInput placeholder="搜索学习标准..." className="h-12" />
              <div className="flex p-3 gap-2 bg-slate-50 border-b">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedSubject || ''}
                  onChange={(e) => setSelectedSubject(e.target.value || null)}
                >
                  <option value="">所有学科</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedGrade || ''}
                  onChange={(e) => setSelectedGrade(e.target.value || null)}
                >
                  <option value="">所有年级</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              <CommandEmpty>未找到匹配的学习标准</CommandEmpty>
              <CommandGroup className="max-h-[400px] overflow-y-auto">
                {loading ? (
                  <div className="p-2 text-center text-sm text-muted-foreground">加载中...</div>
                ) : (
                  filteredStandards.map(standard => (
                    <CommandItem
                      key={standard.id}
                      value={standard.id}
                      onSelect={() => handleSelect(standard.id)}
                      className="p-3 border-b last:border-0"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedValues.includes(standard.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <div className="font-medium">{standard.code}</div>
                        <div className="text-sm text-muted-foreground">{standard.shortDescription}</div>
                      </div>
                    </CommandItem>
                  ))
                )}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      
      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg">
          {selectedValues.map(value => {
            const standard = standards.find(s => s.id === value);
            if (!standard) return null;
            
            return (
              <div
                key={value}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
              >
                {standard.code}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onClick={() => handleSelect(value)}
                >
                  <span className="sr-only">Remove</span>
                  <span className="h-4 w-4 flex items-center justify-center">×</span>
                </button>
              </div>
            );
          })}
          
          {selectedValues.length > 0 && (
            <Button
              variant="ghost"
              className="h-7 px-3 text-xs"
              onClick={() => {
                setSelectedValues([]);
                onChange([]);
              }}
            >
              清除全部
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MentorStudent, IndicatorRecord, Indicator } from '@/shared/types';
import { format } from "date-fns";

interface StudentDetailProps {
  student: MentorStudent;
  onBack: () => void;
}

export function StudentDetail({ student, onBack }: StudentDetailProps) {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [indicatorValue, setIndicatorValue] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const response = await fetch('/api/indicators');
        if (!response.ok) throw new Error('Failed to fetch indicators');
        const data = await response.json();
        setIndicators(data);
      } catch (err) {
        setError('Failed to load indicators');
      }
    };

    fetchIndicators();
  }, []);

  const handleSubmit = async () => {
    if (!selectedIndicator) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const record: Omit<IndicatorRecord, 'id'> = {
        studentId: student.id,
        indicatorId: selectedIndicator.id,
        value: selectedIndicator.type === 'number' ? Number(indicatorValue) : indicatorValue,
        timestamp: new Date().toISOString(),
        mentorId: student.mentorId,
        comment: comment || undefined
      };

      const response = await fetch('/api/indicator-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });

      if (!response.ok) throw new Error('Failed to save record');

      // Reset form
      setIndicatorValue("");
      setComment("");
      setSelectedIndicator(null);
    } catch (err) {
      setError('Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderIndicatorInput = () => {
    if (!selectedIndicator) return null;

    switch (selectedIndicator.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={indicatorValue}
            onChange={(e) => setIndicatorValue(e.target.value)}
            placeholder={`请输入${selectedIndicator.name}${selectedIndicator.unit ? ` (${selectedIndicator.unit})` : ''}`}
          />
        );
      case 'select':
        return (
          <Select value={indicatorValue} onValueChange={setIndicatorValue}>
            <SelectTrigger>
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
            <SelectContent>
              {selectedIndicator.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={indicatorValue}
            onChange={(e) => setIndicatorValue(e.target.value)}
            placeholder={`请输入${selectedIndicator.name}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        返回
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>学生信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">姓名</label>
              <p className="mt-1">{student.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">学号</label>
              <p className="mt-1">{student.studentNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium">年级</label>
              <p className="mt-1">{student.gradeId || '未分配'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">专业</label>
              <p className="mt-1">{student.major || '未分配'}</p>
            </div>
            <div>
              <label className="text-sm font-medium">班级</label>
              <p className="mt-1">{student.classId || '未分配'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>指标记录</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="record">
            <TabsList>
              <TabsTrigger value="record">记录指标</TabsTrigger>
              <TabsTrigger value="history">历史记录</TabsTrigger>
            </TabsList>

            <TabsContent value="record" className="space-y-4">
              <Select
                value={selectedIndicator?.id || ''}
                onValueChange={(value) => {
                  const indicator = indicators.find(i => i.id === value);
                  setSelectedIndicator(indicator || null);
                  setIndicatorValue('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择指标" />
                </SelectTrigger>
                <SelectContent>
                  {indicators.map((indicator) => (
                    <SelectItem key={indicator.id} value={indicator.id}>
                      {indicator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedIndicator && (
                <>
                  <div className="text-sm text-gray-500 mt-2">
                    {selectedIndicator.description}
                  </div>
                  {renderIndicatorInput()}
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="添加备注（可选）"
                    className="mt-4"
                  />
                </>
              )}

              {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!selectedIndicator || !indicatorValue || isSubmitting}
                className="w-full mt-4"
              >
                {isSubmitting ? "保存中..." : "保存记录"}
              </Button>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                {student.indicators.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">暂无记录</p>
                ) : (
                  student.indicators.map((record) => {
                    const indicator = indicators.find(i => i.id === record.indicatorId);
                    return (
                      <Card key={record.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{indicator?.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {typeof record.value === 'number' && indicator?.unit
                                  ? `${record.value} ${indicator.unit}`
                                  : record.value}
                              </p>
                              {record.comment && (
                                <p className="text-sm text-gray-600 mt-2">{record.comment}</p>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm')}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 
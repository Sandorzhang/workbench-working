"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CompetencyWheel } from '@/components/competency-wheel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 定义数据类型（与CompetencyWheel组件中相同）
interface CompetencyDimension {
  id: string;
  name: string;
  color: string;
  level: 1; // 第一级维度
  children: CompetencySubDimension[];
}

interface CompetencySubDimension {
  id: string;
  name: string;
  color: string;
  level: 2; // 第二级维度
  parentId: string;
  progress: number; // 0-100
  status: 'completed' | 'in-progress' | 'pending';
  children: CompetencyThirdDimension[];
  isAdvanced?: boolean; // 特殊标记，带*的项
}

interface CompetencyThirdDimension {
  id: string;
  name: string;
  color: string;
  level: 3; // 第三级维度
  parentId: string;
  progress: number; // 0-100
  status: 'completed' | 'in-progress' | 'pending';
  score?: number; // 可选的分数
}

// 颜色数组，用于随机分配颜色
const COLORS = [
  "#4290f5", // 蓝色系
  "#42c6a3", // 绿色系
  "#9966cc", // 紫色系
  "#ff9966", // 橙色系
  "#f55c5c"  // 红色系
];

// 状态数组，用于随机分配状态
const STATUSES = ['completed', 'in-progress', 'pending'] as const;

// 测试页面组件
export default function TestWheelPage() {
  const [competencies, setCompetencies] = useState<CompetencyDimension[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDimension, setSelectedDimension] = useState<any>(null);

  // 初始化加载数据
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/test/competencies');
        if (response.ok) {
          const data = await response.json();
          setCompetencies(data);
        } else {
          // 如果API请求失败，使用初始测试数据
          const initialTestData: CompetencyDimension[] = [
            {
              id: 'test-dim-1',
              name: '语言素养',
              color: '#4290f5',
              level: 1,
              children: [
                {
                  id: 'test-sub-1',
                  name: '阅读理解能力',
                  color: '#4290f5',
                  level: 2,
                  parentId: 'test-dim-1',
                  progress: 85,
                  status: 'completed',
                  children: [],
                  isAdvanced: false
                }
              ]
            },
            {
              id: 'test-dim-2',
              name: '数学素养',
              color: '#42c6a3',
              level: 1,
              children: []
            }
          ];
          setCompetencies(initialTestData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // 出错时也使用初始测试数据
        setCompetencies([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // 生成随机ID
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 9);
  };

  // 处理添加一级维度
  const handleAddPrimaryDimension = async () => {
    const dimensionNumber = competencies.length + 1;
    const newDimension: CompetencyDimension = {
      id: `dim-${generateId()}`,
      name: `新增维度 ${dimensionNumber}`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      level: 1,
      children: []
    };
    
    try {
      const response = await fetch('/api/test/competencies/primary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDimension),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompetencies(data.data);
      }
    } catch (error) {
      console.error('Error adding primary dimension:', error);
      // 直接在前端更新
      setCompetencies([...competencies, newDimension]);
    }
  };

  // 处理添加二级维度
  const handleAddSecondaryDimension = async () => {
    if (competencies.length === 0) {
      alert('请先添加一级维度');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 随机选择一个一级维度
      const randomPrimaryIndex = Math.floor(Math.random() * competencies.length);
      const targetPrimary = competencies[randomPrimaryIndex];
      
      // 创建新的二级维度
      const subDimensionNumber = targetPrimary.children.length + 1;
      const newSubDimension: CompetencySubDimension = {
        id: `sub-${generateId()}`,
        name: `二级维度 ${subDimensionNumber}`,
        color: targetPrimary.color,
        level: 2,
        parentId: targetPrimary.id,
        progress: Math.floor(Math.random() * 100),
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)] as 'completed' | 'in-progress' | 'pending',
        children: [],
        isAdvanced: Math.random() > 0.7 // 30%概率是高级项目
      };
      
      console.log('Sending request to add secondary dimension:', {
        primaryId: targetPrimary.id,
        newSubDimension
      });
      
      const response = await fetch('/api/test/competencies/secondary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryId: targetPrimary.id,
          newSubDimension
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add secondary dimension: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received response from server:', data);
      
      if (data.success) {
        // 确保接收完整的维度数据
        if (Array.isArray(data.data)) {
          setCompetencies(data.data);
        } else {
          console.error('Server returned invalid data format:', data);
          throw new Error('Server returned invalid data format');
        }
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error adding secondary dimension:', error);
      // 直接在前端更新 - 备选方案
      if (competencies.length > 0) {
        const randomPrimaryIndex = Math.floor(Math.random() * competencies.length);
        const targetPrimary = competencies[randomPrimaryIndex];
        
        const subDimensionNumber = targetPrimary.children.length + 1;
        const newSubDimension: CompetencySubDimension = {
          id: `sub-${generateId()}`,
          name: `二级维度 ${subDimensionNumber}`,
          color: targetPrimary.color,
          level: 2,
          parentId: targetPrimary.id,
          progress: Math.floor(Math.random() * 100),
          status: STATUSES[Math.floor(Math.random() * STATUSES.length)] as 'completed' | 'in-progress' | 'pending',
          children: [],
          isAdvanced: Math.random() > 0.7
        };
        
        // 创建一个深拷贝，避免直接修改状态
        const updatedCompetencies = JSON.parse(JSON.stringify(competencies));
        updatedCompetencies[randomPrimaryIndex] = {
          ...targetPrimary,
          children: [...targetPrimary.children, newSubDimension]
        };
        
        setCompetencies(updatedCompetencies);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 处理添加三级维度
  const handleAddTertiaryDimension = async () => {
    // 检查是否有二级维度可以添加
    const hasSecondaryDimensions = competencies.some(dim => dim.children.length > 0);
    if (!hasSecondaryDimensions) {
      alert('请先添加二级维度');
      return;
    }
    
    // 收集所有二级维度
    let allSecondaryDimensions: {
      primaryIndex: number;
      secondaryIndex: number;
      dimension: CompetencySubDimension;
    }[] = [];
    
    competencies.forEach((primary, pIndex) => {
      primary.children.forEach((secondary, sIndex) => {
        allSecondaryDimensions.push({
          primaryIndex: pIndex,
          secondaryIndex: sIndex,
          dimension: secondary
        });
      });
    });
    
    // 随机选择一个二级维度
    const randomSecondary = allSecondaryDimensions[
      Math.floor(Math.random() * allSecondaryDimensions.length)
    ];
    
    // 创建新的三级维度
    const tertiaryDimensionNumber = randomSecondary.dimension.children.length + 1;
    const newTertiaryDimension: CompetencyThirdDimension = {
      id: `ter-${generateId()}`,
      name: `三级维度 ${tertiaryDimensionNumber}`,
      color: randomSecondary.dimension.color,
      level: 3,
      parentId: randomSecondary.dimension.id,
      progress: Math.floor(Math.random() * 100),
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      score: Math.floor(Math.random() * 100)
    };
    
    try {
      const response = await fetch('/api/test/competencies/tertiary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secondaryParentId: randomSecondary.dimension.id,
          newTertiaryDimension
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompetencies(data.data);
      }
    } catch (error) {
      console.error('Error adding tertiary dimension:', error);
      // 直接在前端更新
      const updatedCompetencies = [...competencies];
      const targetSecondary = updatedCompetencies[randomSecondary.primaryIndex]
        .children[randomSecondary.secondaryIndex];
      
      updatedCompetencies[randomSecondary.primaryIndex].children[randomSecondary.secondaryIndex] = {
        ...targetSecondary,
        children: [...targetSecondary.children, newTertiaryDimension]
      };
      
      setCompetencies(updatedCompetencies);
    }
  };

  // 处理维度点击
  const handleDimensionClick = (dimension: any) => {
    setSelectedDimension(dimension);
  };

  // 清空数据
  const handleClearData = async () => {
    try {
      const response = await fetch('/api/test/competencies/reset', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCompetencies(data.data);
      }
    } catch (error) {
      console.error('Error resetting data:', error);
      // 直接在前端重置
      setCompetencies([]);
    }
    
    setSelectedDimension(null);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">素养轮组件测试页面 (新版)</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-8/12">
          <CompetencyWheel 
            title="素养轮测试"
            description="用于测试和调试素养轮组件"
            isLoading={isLoading}
            onDimensionClick={handleDimensionClick}
            competencies={competencies}
          />
        </div>
        
        <div className="w-full md:w-4/12">
          <Card>
            <CardHeader>
              <CardTitle>控制面板</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleAddPrimaryDimension}
                  variant="default"
                >
                  添加一级维度
                </Button>
                
                <Button 
                  onClick={handleAddSecondaryDimension}
                  variant="secondary"
                  disabled={competencies.length === 0}
                >
                  随机添加二级维度
                </Button>
                
                <Button 
                  onClick={handleAddTertiaryDimension}
                  variant="outline"
                  disabled={!competencies.some(dim => dim.children.length > 0)}
                >
                  随机添加三级维度
                </Button>
                
                <Button 
                  onClick={handleClearData}
                  variant="destructive"
                >
                  清空数据
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {selectedDimension && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>选中维度信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p><strong>ID:</strong> {selectedDimension.id}</p>
                  <p><strong>名称:</strong> {selectedDimension.name}</p>
                  <p><strong>级别:</strong> {selectedDimension.level}</p>
                  {selectedDimension.level > 1 && (
                    <p><strong>进度:</strong> {selectedDimension.progress}%</p>
                  )}
                  {selectedDimension.level > 1 && (
                    <p><strong>状态:</strong> {
                      selectedDimension.status === 'completed' ? '已完成' :
                      selectedDimension.status === 'in-progress' ? '进行中' : '未开始'
                    }</p>
                  )}
                  {selectedDimension.isAdvanced && (
                    <p><strong>高级项目:</strong> 是</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-3">当前数据</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-80">
          {JSON.stringify(competencies, null, 2)}
        </pre>
      </div>
    </div>
  );
} 
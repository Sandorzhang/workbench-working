'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Search, Plus, Check, Brain, BookOpen, Sparkles, Lightbulb, Pencil, PieChart } from "lucide-react";
import { useRouter } from 'next/navigation';

// 图标映射
const iconMap: Record<string, React.ElementType> = {
  'Brain': Brain,
  'BookOpen': BookOpen,
  'Sparkles': Sparkles,
  'Lightbulb': Lightbulb,
  'Pencil': Pencil,
  'PieChart': PieChart,
  'Bot': Bot
};

// 智能体接口定义
interface AIAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  isAdded?: boolean;
}

const AILibraryPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [userAgentIds, setUserAgentIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // 加载智能体数据
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        
        // 获取所有智能体
        const response = await fetch('/api/ai-library/agents');
        let agentData: AIAgent[] = [];
        
        if (response.ok) {
          agentData = await response.json();
        }
        
        // 获取用户已添加的智能体
        const userAgentsResponse = await fetch('/api/ai-library/user-agents');
        if (userAgentsResponse.ok) {
          const userAgents = await userAgentsResponse.json();
          setUserAgentIds(userAgents.map((agent: AIAgent) => agent.id));
          
          // 标记已添加的智能体
          agentData = agentData.map(agent => ({
            ...agent,
            isAdded: userAgents.some((ua: AIAgent) => ua.id === agent.id)
          }));
          
          // 触发一次智能体列表更新事件，确保侧边栏同步
          const event = new CustomEvent('agent-list-updated');
          window.dispatchEvent(event);
          console.log('智能体库页面加载完成，触发列表更新事件');
        }
        
        setAgents(agentData);
      } catch (error) {
        console.error('获取智能体数据失败:', error);
        // 容错：如果API失败，使用空数组
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, []);
  
  // 过滤智能体
  const filteredAgents = agents.filter(agent => {
    // 搜索过滤
    const matchesSearch = searchQuery === '' || 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // 分类过滤
    const matchesCategory = category === 'all' || agent.category === category;
    
    return matchesSearch && matchesCategory;
  });
  
  // 添加或移除智能体
  const toggleAgent = async (agentId: string) => {
    setActionLoading(agentId);
    try {
      const isAdded = userAgentIds.includes(agentId);
      const url = `/api/ai-library/user-agents/${agentId}`;
      const method = isAdded ? 'DELETE' : 'POST';
      
      const response = await fetch(url, { method });
      
      if (response.ok) {
        // 更新本地状态
        if (isAdded) {
          setUserAgentIds(prev => prev.filter(id => id !== agentId));
        } else {
          setUserAgentIds(prev => [...prev, agentId]);
        }
        
        // 更新智能体列表
        setAgents(prev => 
          prev.map(agent => 
            agent.id === agentId
              ? { ...agent, isAdded: !isAdded }
              : agent
          )
        );
        
        // 找到当前智能体完整数据
        const currentAgent = agents.find(agent => agent.id === agentId);
        
        // 触发自定义事件，通知其他组件更新智能体列表
        // 传递完整的操作信息，而不仅仅是通知刷新
        const eventData = {
          action: isAdded ? 'remove' : 'add',
          agent: currentAgent,
          timestamp: new Date().getTime()
        };
        
        const event = new CustomEvent('agent-list-updated', { 
          detail: eventData 
        });
        
        window.dispatchEvent(event);
        console.log(`已触发智能体列表更新事件（从AI库${isAdded ? '移除' : '添加'}）:`, eventData);
        
        // 如果是添加新的智能体，可以选择性地导航
        if (!isAdded) {
          // 这里可以导航到智能体对话页面
          // router.push(`/ai-teaching-assistant?agent=${agentId}`);
        }
      }
    } catch (error) {
      console.error('添加/移除智能体失败:', error);
    } finally {
      setActionLoading(null);
    }
  };
  
  // 获取对应的图标组件
  const getIconComponent = (iconName: string): React.ElementType => {
    return iconMap[iconName] || Bot;
  };
  
  return (
    <div className="container mx-auto py-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">智能体库</h1>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索智能体..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setCategory}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="education">教学</TabsTrigger>
            <TabsTrigger value="analysis">分析</TabsTrigger>
            <TabsTrigger value="research">研究</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </CardHeader>
              <CardFooter className="pt-1 pb-3 flex flex-wrap gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map(agent => {
            const IconComponent = getIconComponent(agent.icon);
            return (
              <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{agent.name}</CardTitle>
                    </div>
                    <Button 
                      variant={agent.isAdded ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleAgent(agent.id)}
                      disabled={actionLoading === agent.id}
                    >
                      {actionLoading === agent.id ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                          处理中
                        </span>
                      ) : agent.isAdded ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          已添加
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          添加
                        </>
                      )}
                    </Button>
                  </div>
                  <CardDescription className="mt-2">{agent.description}</CardDescription>
                </CardHeader>
                <CardFooter className="pt-1 pb-3 flex flex-wrap gap-2">
                  {agent.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </CardFooter>
              </Card>
            );
          })}
          
          {filteredAgents.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">没有找到匹配的智能体</h3>
              <p className="text-muted-foreground">
                尝试使用不同的搜索词或浏览所有类别
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AILibraryPage; 
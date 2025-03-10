"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bot,
  Search,
  Plus,
  Check,
  Brain,
  BookOpen,
  Sparkles,
  Lightbulb,
  Pencil,
  PieChart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/ui/page-container";
import { SectionContainer } from "@/components/ui/section-container";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";

// 图标映射
const iconMap: Record<string, React.ElementType> = {
  Brain: Brain,
  BookOpen: BookOpen,
  Sparkles: Sparkles,
  Lightbulb: Lightbulb,
  Pencil: Pencil,
  PieChart: PieChart,
  Bot: Bot,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
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
        const response = await fetch("/api/ai-library/agents");
        let agentData: AIAgent[] = [];

        if (response.ok) {
          agentData = await response.json();
        }

        // 获取用户已添加的智能体
        const userAgentsResponse = await fetch("/api/ai-library/user-agents");
        if (userAgentsResponse.ok) {
          const userAgents = await userAgentsResponse.json();
          setUserAgentIds(userAgents.map((agent: AIAgent) => agent.id));

          // 标记已添加的智能体
          agentData = agentData.map((agent) => ({
            ...agent,
            isAdded: userAgents.some((ua: AIAgent) => ua.id === agent.id),
          }));

          // 触发一次智能体列表更新事件，确保侧边栏同步
          const event = new CustomEvent("agent-list-updated");
          window.dispatchEvent(event);
          //console.log('智能体库页面加载完成，触发列表更新事件');
        }

        setAgents(agentData);
      } catch (error) {
        console.error("获取智能体数据失败:", error);
        // 容错：如果API失败，使用空数组
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // 过滤智能体
  const filteredAgents = agents.filter((agent) => {
    // 搜索过滤
    const matchesSearch =
      searchQuery === "" ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // 分类过滤
    const matchesCategory = category === "all" || agent.category === category;

    return matchesSearch && matchesCategory;
  });

  // 添加或移除智能体
  const toggleAgent = async (agentId: string) => {
    setActionLoading(agentId);
    try {
      const isAdded = userAgentIds.includes(agentId);
      const url = `/api/ai-library/user-agents/${agentId}`;
      const method = isAdded ? "DELETE" : "POST";

      const response = await fetch(url, { method });

      if (response.ok) {
        // 更新本地状态
        if (isAdded) {
          setUserAgentIds((prev) => prev.filter((id) => id !== agentId));
        } else {
          setUserAgentIds((prev) => [...prev, agentId]);
        }

        // 更新智能体列表
        setAgents((prev) =>
          prev.map((agent) =>
            agent.id === agentId ? { ...agent, isAdded: !isAdded } : agent
          )
        );

        // 找到当前智能体完整数据
        const currentAgent = agents.find((agent) => agent.id === agentId);

        // 触发自定义事件，通知其他组件更新智能体列表
        // 传递完整的操作信息，而不仅仅是通知刷新
        const eventData = {
          action: isAdded ? "remove" : "add",
          agent: currentAgent,
          timestamp: new Date().getTime(),
        };

        const event = new CustomEvent("agent-list-updated", {
          detail: eventData,
        });

        window.dispatchEvent(event);
        //console.log(`已触发智能体列表更新事件（从AI库${isAdded ? '移除' : '添加'}）:`, eventData);

        // 如果是添加新的智能体，可以选择性地导航
        if (!isAdded) {
          // 这里可以导航到智能体对话页面
          // router.push(`/ai-teaching-assistant?agent=${agentId}`);
        }
      }
    } catch (error) {
      console.error("添加/移除智能体失败:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // 获取对应的图标组件
  const getIconComponent = (iconName: string): React.ElementType => {
    return iconMap[iconName] || Bot;
  };

  // 根据分类获取渐变颜色
  const getCategoryGradient = (category: string): string => {
    const gradientMap: Record<string, string> = {
      education: "from-blue-500 to-indigo-600",
      analysis: "from-emerald-400 to-teal-600",
      research: "from-purple-400 to-violet-600",
      default: "from-gray-400 to-gray-600",
    };

    return gradientMap[category] || gradientMap.default;
  };

  // 搜索和过滤操作区域组件
  const FilterActions = (
    <div className="w-full flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索智能体..."
          className="pl-10 h-10 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs
        defaultValue="all"
        className="w-full sm:w-auto"
        onValueChange={setCategory}
      >
        <TabsList className="bg-white/50 h-10">
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="education">教学</TabsTrigger>
          <TabsTrigger value="analysis">分析</TabsTrigger>
          <TabsTrigger value="research">研究</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );

  return (
    <PageContainer
      loading={loading}
      spacing="standard"
      backgroundClassName="bg-gray-50"
    >
      {/* 顶部介绍区域 */}
      <SectionContainer
        backgroundClassName="bg-gradient-to-br from-white to-gray-50"
        className="relative overflow-hidden border border-gray-100/80 shadow-sm mb-6"
        padding="relaxed"
      >
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/5 to-transparent rounded-full -ml-32 -mb-32"></div>

        <div className="flex flex-col md:flex-row gap-6 relative z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              探索智能体世界
            </h2>
            <p className="text-gray-600 max-w-2xl">
              智能体库为您提供丰富的AI助手，能够帮助您解决各种教学、分析和研究问题。
              选择适合您需求的智能体，点击添加即可在侧边栏访问。
            </p>
          </div>
          <div className="shrink-0">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Bot className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* 过滤工具栏 */}
      <SectionContainer
        className="mb-6"
        padding="compact"
        backgroundClassName="bg-white"
      >
        {FilterActions}
      </SectionContainer>

      {/* 智能体列表 */}
      <SectionContainer
        title={`智能体列表 ${
          filteredAgents.length > 0 ? `(${filteredAgents.length})` : ""
        }`}
        description={
          filteredAgents.length === 0
            ? "没有找到符合条件的智能体"
            : "选择并添加您需要的智能体"
        }
        backgroundClassName="bg-white"
        padding="standard"
      >
        {loading ? (
          <ResponsiveGrid xs={1} sm={2} md={3} gap="lg">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="overflow-hidden border border-gray-200/70 shadow-sm"
              >
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
          </ResponsiveGrid>
        ) : (
          <ResponsiveGrid xs={1} sm={2} md={3} gap="lg">
            {filteredAgents.map((agent) => {
              const IconComponent = getIconComponent(agent.icon);
              const categoryGradient = getCategoryGradient(agent.category);

              return (
                <Card
                  key={agent.id}
                  className="overflow-hidden border border-gray-200/70 shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-md bg-gradient-to-br ${categoryGradient} text-white`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-base">
                          {agent.name}
                        </CardTitle>
                      </div>
                      <Button
                        variant={agent.isAdded ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleAgent(agent.id)}
                        disabled={actionLoading === agent.id}
                        className={agent.isAdded ? "bg-white" : ""}
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
                    <CardDescription className="mt-2 line-clamp-2">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-1 pb-3 flex flex-wrap gap-2">
                    {agent.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="font-normal bg-gray-100/70"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </CardFooter>
                </Card>
              );
            })}
          </ResponsiveGrid>
        )}

        {filteredAgents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-medium text-gray-700 mb-1">
              没有找到智能体
            </h3>
            <p className="text-gray-500 mb-6">
              尝试调整搜索条件或选择不同的分类
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setCategory("all");
              }}
            >
              重置筛选条件
            </Button>
          </div>
        )}
      </SectionContainer>
    </PageContainer>
  );
};

export default AILibraryPage;

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { 
  BarChart3, 
  Database, 
  FileText, 
  Filter, 
  Search,
  ArrowUpDown,
  BadgeInfo,
  TagIcon,
  Calendar,
  Users,
  ArrowRight,
  Check
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  TitleSkeleton, 
  CardSkeleton, 
  ContentSkeleton, 
  ListSkeleton 
} from "@/components/ui/skeleton-loader";
import { HeroSection } from "@/components/ui/hero-section";
import { cn } from "@/lib/utils";

// 数据资产类型
interface DataAsset {
  id: string;
  name: string;
  category: string;
  type: string;
  format: string;
  description: string;
  size: string;
  lastUpdated: string;
  accessLevel: string;
  source: string;
  owner: string;
  tags: string[];
  usageCount: number;
  isImportant: boolean;
}

// 数据统计类型
interface DataStats {
  totalAssets: number;
  importantAssets: number;
  categoryStats: Record<string, number>;
  typeStats: Record<string, number>;
  totalSize: string;
}

// 访问级别标识颜色
const accessLevelColors = {
  public: { color: 'text-green-700', bgColor: 'bg-green-50', label: '公开' },
  internal: { color: 'text-blue-700', bgColor: 'bg-blue-50', label: '内部' },
  restricted: { color: 'text-amber-700', bgColor: 'bg-amber-50', label: '受限' },
  confidential: { color: 'text-rose-700', bgColor: 'bg-rose-50', label: '机密' }
};

export default function DataAssetsPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // 状态管理
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataAssets, setDataAssets] = useState<DataAsset[]>([]);
  const [stats, setStats] = useState<DataStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [categories, setCategories] = useState([]);
  
  // 获取所有数据资产
  const fetchDataAssets = async () => {
    try {
      setError(null);
      
      if (!token) {
        console.warn('获取数据资产: 未提供认证token');
        return;
      }
      
      // 构建查询参数
      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'all') {
        queryParams.append('category', selectedCategory);
      }
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      
      // 发起请求
      const response = await fetch(`/api/data-assets?${queryParams.toString()}`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('获取数据资产失败');
      }
      
      const data = await response.json();
      setDataAssets(data);
    } catch (err) {
      console.error('获取数据资产失败:', err);
      setError('获取数据资产失败，请稍后重试');
      toast.error('获取数据资产失败，请稍后重试');
    }
  };
  
  // 获取数据统计
  const fetchStats = async () => {
    try {
      if (!token) {
        console.warn('获取数据统计: 未提供认证token');
        return;
      }
      
      const response = await fetch('/api/data-assets/stats', { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error('获取数据统计失败');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('获取数据统计失败:', err);
    }
  };
  
  // 初始加载数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDataAssets(), fetchStats()]);
      setIsLoading(false);
    };
    
    if (token) {
      loadData();
    }
  }, [token]);
  
  // 搜索和筛选时重新获取数据
  useEffect(() => {
    if (token) {
      fetchDataAssets();
    }
  }, [searchTerm, selectedCategory, token]);
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };
  
  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDataAssets();
  };
  
  // 查看资产详情
  const viewAssetDetails = (assetId: string) => {
    router.push(`/data-assets/${assetId}`);
  };
  
  // 渲染加载状态
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <TitleSkeleton className="w-48" />
          <div className="w-24 h-10 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="flex gap-4">
          <div className="w-32 h-10 bg-gray-100 rounded-md animate-pulse"></div>
          <div className="w-32 h-10 bg-gray-100 rounded-md animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CardSkeleton className="h-96" />
          </div>
          <div>
            <CardSkeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <HeroSection
        title="数据资产管理"
        description="管理和浏览教学相关的各类数据资源，支持数据分析和教学决策。"
        icon={Database}
        gradient="from-cyan-50 to-blue-50"
        actions={
          <Button 
            onClick={() => toast.info('功能开发中')}
            className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium"
          >
            <Database className="mr-2 h-4 w-4" />
            申请数据访问
          </Button>
        }
      />
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索数据资产..."
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              {selectedCategory === 'all' ? '所有分类' : selectedCategory}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>按分类筛选</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
              所有分类
            </DropdownMenuItem>
            {stats && Object.keys(stats.categoryStats).map((category) => (
              <DropdownMenuItem 
                key={category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* 数据统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                数据资产总量
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssets}</div>
              <p className="text-xs text-muted-foreground">
                其中重要数据资产 {stats.importantAssets} 项
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                总数据规模
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSize}</div>
              <p className="text-xs text-muted-foreground">
                总体数据规模统计
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                数据结构分布
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <div>
                  <div className="text-2xl font-bold">{stats.typeStats['结构化数据'] || 0}</div>
                  <p className="text-xs text-muted-foreground">结构化数据</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.typeStats['非结构化数据'] || 0}</div>
                  <p className="text-xs text-muted-foreground">非结构化数据</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                分类统计
              </CardTitle>
              <TagIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <ul className="grid grid-cols-1 divide-y text-sm">
                {Object.entries(stats.categoryStats).map(([category, count]) => (
                  <li key={category} className="px-6 py-1 flex justify-between items-center">
                    <span>{category}</span>
                    <Badge variant="outline">{count}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* 数据资产列表和详情 */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="table">表格视图</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataAssets.map((asset) => (
              <Card 
                key={asset.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  asset.isImportant ? 'border-primary/20' : ''
                }`}
                onClick={() => viewAssetDetails(asset.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    {asset.isImportant && (
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                        重要资产
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {asset.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {asset.tags.map((tag, i) => (
                      <Badge 
                        variant="outline" 
                        key={i}
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{asset.size}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{formatDate(asset.lastUpdated)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{asset.owner}</span>
                    </div>
                    <div>
                      <Badge 
                        variant="secondary"
                        className={`
                          text-xs 
                          ${accessLevelColors[asset.accessLevel as keyof typeof accessLevelColors]?.color} 
                          ${accessLevelColors[asset.accessLevel as keyof typeof accessLevelColors]?.bgColor}
                        `}
                      >
                        {accessLevelColors[asset.accessLevel as keyof typeof accessLevelColors]?.label || asset.accessLevel}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex justify-between items-center w-full text-sm">
                    <span className="text-muted-foreground">{asset.category}</span>
                    <Button variant="ghost" size="sm" className="h-6 gap-1">
                      <span className="text-xs">查看详情</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {dataAssets.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">没有找到数据资产</h3>
              <p className="text-muted-foreground mt-1">
                尝试调整搜索条件或查看所有分类
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
              >
                重置筛选条件
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>数据资产列表</CardTitle>
              <CardDescription>
                查看所有数据资产的详细信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>格式</TableHead>
                    <TableHead>大小</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead>访问级别</TableHead>
                    <TableHead>使用次数</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {asset.name}
                          {asset.isImportant && (
                            <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
                              重要
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{asset.category}</TableCell>
                      <TableCell>{asset.format}</TableCell>
                      <TableCell>{asset.size}</TableCell>
                      <TableCell>{formatDate(asset.lastUpdated)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`
                            ${accessLevelColors[asset.accessLevel as keyof typeof accessLevelColors]?.color} 
                            ${accessLevelColors[asset.accessLevel as keyof typeof accessLevelColors]?.bgColor}
                          `}
                        >
                          {accessLevelColors[asset.accessLevel as keyof typeof accessLevelColors]?.label || asset.accessLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.usageCount}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewAssetDetails(asset.id)}
                        >
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {dataAssets.length === 0 && !isLoading && (
                <div className="text-center py-10">
                  <h3 className="text-lg font-medium">没有找到数据资产</h3>
                  <p className="text-muted-foreground mt-1">
                    尝试调整搜索条件或查看所有分类
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  SearchX, SearchIcon, Filter, Clock, Heart, Bookmark, User, 
  ChevronLeft, ChevronRight, Star, Calendar, Smile, Camera
} from 'lucide-react';
import { ClassRecord, FilmStrip, TeachingMoment } from '@/mocks/handlers/classroom-timemachine';
import { Timeline } from '@/components/classroom-timemachine/timeline';
import RecordCard from '@/components/classroom-timemachine/record-card';
import MomentDetail from '@/components/classroom-timemachine/moment-detail';
import MemoryIcon from '@/components/classroom-timemachine/memory-icon';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

export default function ClassroomTimeMachinePage() {
  // 状态
  const [activeTab, setActiveTab] = useState('timeline');
  const [records, setRecords] = useState<ClassRecord[]>([]);
  const [filmStrips, setFilmStrips] = useState<FilmStrip[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ClassRecord | null>(null);
  const [selectedMoment, setSelectedMoment] = useState<TeachingMoment | undefined>(undefined);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingFilmStrips, setLoadingFilmStrips] = useState(true);
  const [loadingMoment, setLoadingMoment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 初始化数据
  useEffect(() => {
    const fetchInitialData = async () => {
      // 获取课堂记录
      await fetchClassroomRecords();
      
      // 获取胶片条
      await fetchFilmStrips();
      
      // 检查URL参数，加载指定的时刻或记录
      const momentId = searchParams.get('moment');
      const recordId = searchParams.get('record');
      
      if (momentId) {
        await fetchMomentDetail(momentId);
        setActiveTab('timeline');
      } else if (recordId) {
        const record = records.find(r => r.id === recordId);
        if (record) {
          setSelectedRecord(record);
        }
        setActiveTab('records');
      }
    };
    
    fetchInitialData();
  }, []);
  
  // 获取热门记录
  const getTopLikedRecords = (records: ClassRecord[], count = 1): ClassRecord[] => {
    return [...records].sort((a, b) => b.likes - a.likes).slice(0, count);
  };
  
  // 获取课堂记录
  const fetchClassroomRecords = async () => {
    setLoadingRecords(true);
    try {
      const response = await fetch('/api/classroom-timemachine/records');
      if (!response.ok) throw new Error('获取课堂记录失败');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('获取课堂记录错误:', error);
      toast.error('获取课堂记录失败');
    } finally {
      setLoadingRecords(false);
    }
  };
  
  // 获取胶片条
  const fetchFilmStrips = async () => {
    setLoadingFilmStrips(true);
    try {
      const response = await fetch('/api/classroom-timemachine/filmstrips');
      if (!response.ok) throw new Error('获取胶片条失败');
      const data = await response.json();
      setFilmStrips(data);
    } catch (error) {
      console.error('获取胶片条错误:', error);
      toast.error('获取胶片条失败');
    } finally {
      setLoadingFilmStrips(false);
    }
  };
  
  // 获取教学时刻详情
  const fetchMomentDetail = async (momentId: string) => {
    setLoadingMoment(true);
    try {
      const response = await fetch(`/api/classroom-timemachine/moments/${momentId}`);
      if (!response.ok) throw new Error('获取教学时刻失败');
      const data = await response.json();
      setSelectedMoment(data);
      
      // 更新URL参数但不重新加载页面
      router.push(`/classroom-timemachine?moment=${momentId}`, { scroll: false });
    } catch (error) {
      console.error('获取教学时刻错误:', error);
      toast.error('获取教学时刻失败');
    } finally {
      setLoadingMoment(false);
    }
  };
  
  // 处理时刻点击
  const handleMomentClick = (moment: TeachingMoment) => {
    fetchMomentDetail(moment.id);
  };
  
  // 处理记录点击
  const handleRecordClick = (recordId: string) => {
    const record = records.find(r => r.id === recordId);
    if (record) {
      setSelectedRecord(record);
      
      // 更新URL参数但不重新加载页面
      router.push(`/classroom-timemachine?record=${recordId}`, { scroll: false });
    }
  };
  
  // 过滤记录
  const filteredRecords = useMemo(() => {
    return records
      .filter(record => 
        (searchQuery ? record.title.toLowerCase().includes(searchQuery.toLowerCase()) : true) &&
        (filterSubject ? record.subject === filterSubject : true)
      );
  }, [records, searchQuery, filterSubject]);
  
  // 提取所有可用的学科
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>();
    records.forEach(record => subjects.add(record.subject));
    return Array.from(subjects);
  }, [records]);
  
  // 获取顶部喜欢的记录IDs
  const topLikedRecords = useMemo(() => {
    return getTopLikedRecords(records, 2).map(record => record.id);
  }, [records]);

  // 提取所有重要回忆
  const memoryMoments = useMemo(() => {
    const allMoments = filmStrips.flatMap(strip => strip.moments);
    // 过滤出有较多喜欢或评论的教学时刻
    return allMoments
      .filter(moment => (moment.likes && moment.likes > 30) || (moment.comments && moment.comments.length > 0))
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 4);
  }, [filmStrips]);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'note': return <Bookmark className="h-4 w-4" />;
      case 'audio': return <Smile className="h-4 w-4" />;
      case 'video': return <Camera className="h-4 w-4" />;
      case 'homework': return <Star className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <MemoryIcon size="lg" className="mr-3" />
          <div>
            <h1 className="text-3xl font-bold">课堂时光机</h1>
            <p className="text-muted-foreground">收集、整理和回顾您的教学时刻</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
          <Button>新建记录</Button>
        </div>
      </div>
      
      {/* 回忆集锦 */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">教学回忆集</h2>
          <Button variant="ghost" size="sm">
            查看全部回忆
          </Button>
        </div>
        
        {loadingFilmStrips ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        ) : memoryMoments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {memoryMoments.map((moment) => (
              <motion.div
                key={moment.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="overflow-hidden cursor-pointer h-40 group"
                  onClick={() => handleMomentClick(moment)}
                >
                  <div className="relative h-full w-full">
                    <img 
                      src={moment.thumbnail || '/placeholder-image.jpg'} 
                      alt={moment.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex flex-col justify-end">
                      <div className="flex items-center mb-1">
                        <Badge className="text-xs px-1.5 py-0.5 bg-white/90 text-foreground">
                          <span className="flex items-center gap-1">
                            {getTypeIcon(moment.type)}
                            {moment.type === 'note' && '笔记'}
                            {moment.type === 'audio' && '音频'}
                            {moment.type === 'video' && '视频'}
                            {moment.type === 'homework' && '作业'}
                            {moment.type === 'other' && '其他'}
                          </span>
                        </Badge>
                        <span className="ml-2 text-xs text-white flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {moment.date}
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-white line-clamp-1">{moment.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-white/80">{moment.teacher}</span>
                        <span className="text-xs text-white/80 flex items-center">
                          <Heart className="h-3 w-3 mr-1 fill-rose-500 text-rose-500" />
                          {moment.likes || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-8 text-center">
            <MemoryIcon size="lg" className="mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">暂无回忆收藏</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              您的珍贵教学回忆将在这里显示。点击时间线上的任意时刻可将其添加到回忆集中。
            </p>
          </div>
        )}
      </div>
      
      {/* 主要内容 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧: 时间线或记录列表 */}
        <div className="md:col-span-2">
          {/* 标签切换 */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full">
              <TabsTrigger value="timeline" className="flex-1">
                <Clock className="h-4 w-4 mr-2" />
                时间线视图
              </TabsTrigger>
              <TabsTrigger value="records" className="flex-1">
                <Bookmark className="h-4 w-4 mr-2" />
                课堂记录
              </TabsTrigger>
            </TabsList>
            
            {/* 时间线视图 */}
            <TabsContent value="timeline" className="mt-6">
              {loadingFilmStrips ? (
                <div className="w-full h-[500px] rounded-lg border">
                  <Skeleton className="w-full h-full" />
                </div>
              ) : (
                <Timeline 
                  filmStrips={filmStrips} 
                  onMomentClick={handleMomentClick}
                />
              )}
              
              {filmStrips.length > 0 && (
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  <p>您的时间线包含 {filmStrips.length} 个学期, 共 {filmStrips.reduce((acc, strip) => acc + strip.moments.length, 0)} 个教学时刻</p>
                  <p className="mt-1">点击时间线上的任意节点，查看详细内容</p>
                </div>
              )}
            </TabsContent>
            
            {/* 课堂记录视图 */}
            <TabsContent value="records" className="mt-6 space-y-4">
              {/* 搜索和过滤 */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="搜索课堂记录..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <ScrollArea className="w-full sm:w-auto">
                  <div className="flex space-x-2">
                    <Button 
                      variant={filterSubject === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterSubject(null)}
                    >
                      全部
                    </Button>
                    {availableSubjects.map(subject => (
                      <Button
                        key={subject}
                        variant={filterSubject === subject ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterSubject(subject)}
                      >
                        {subject}
                      </Button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
              
              {/* 记录列表 */}
              {loadingRecords ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-lg" />
                  ))}
                </div>
              ) : filteredRecords.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredRecords.map((record) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      isSelected={selectedRecord?.id === record.id}
                      isTopLiked={topLikedRecords.includes(record.id)}
                      onClick={handleRecordClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full py-12 flex flex-col items-center justify-center text-center">
                  <SearchX className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">未找到匹配的记录</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    尝试使用不同的搜索词或筛选条件，或者清除所有筛选器查看所有课堂记录。
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterSubject(null);
                    }}
                  >
                    清除所有筛选
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* 右侧: 详细信息面板 */}
        <div className="relative">
          <div className="sticky top-4">
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'timeline' ? (
                <MomentDetail
                  moment={selectedMoment}
                  isLoading={loadingMoment}
                />
              ) : (
                <div className="w-full rounded-lg border border-border bg-card overflow-hidden">
                  {selectedRecord ? (
                    <div className="flex flex-col h-full">
                      <div className="relative h-48 w-full overflow-hidden">
                        <img 
                          src={selectedRecord.thumbnail} 
                          alt={selectedRecord.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>
                                {selectedRecord.class}
                              </Badge>
                              {selectedRecord.isMine && (
                                <Badge variant="secondary" className="bg-sky-100 text-sky-800">
                                  我的
                                </Badge>
                              )}
                            </div>
                            <h2 className="text-xl font-bold text-white">{selectedRecord.title}</h2>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4 flex-grow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{selectedRecord.teacher}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedRecord.duration}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold">课堂详情</h3>
                            <Badge variant="outline">
                              {selectedRecord.subject}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-3 rounded-lg bg-slate-50">
                              <div className="text-muted-foreground mb-1">日期</div>
                              <div className="font-medium">{selectedRecord.date}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-50">
                              <div className="text-muted-foreground mb-1">时长</div>
                              <div className="font-medium">{selectedRecord.duration}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-50">
                              <div className="text-muted-foreground mb-1">班级</div>
                              <div className="font-medium">{selectedRecord.class}</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-50">
                              <div className="text-muted-foreground mb-1">喜欢</div>
                              <div className="font-medium flex items-center">
                                <Heart className="h-3 w-3 text-rose-500 fill-rose-500 mr-1" />
                                {selectedRecord.likes}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mt-4">
                            通过时光机功能，您可以回顾这节课的关键教学时刻。点击左侧的"时间线视图"以查看此课的教学时刻。
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 border-t">
                        <Button className="w-full">
                          查看完整课堂记录
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-[600px] flex items-center justify-center p-6">
                      <div className="text-center">
                        <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">选择一个课堂记录</h3>
                        <p className="text-muted-foreground mt-2">
                          从左侧列表中选择一个课堂记录以查看详细信息
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
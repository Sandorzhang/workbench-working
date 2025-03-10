"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  Heart,
  User,
  Plus,
  Image as LucideImage,
  BookOpen,
  Network,
  HelpCircle,
  ListChecks,
  Clock10,
} from "lucide-react";
import {
  ClassRecord,
  FilmStrip,
  TeachingMoment,
} from "@/mocks/handlers/classroom-timemachine";
import MomentDetail from "@/components/classroom-timemachine/moment-detail";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import VerticalTimeline from "@/components/classroom-timemachine/vertical-timeline";
import { HeroSection } from "@/components/ui/hero-section";

export default function ClassroomTimeMachine() {
  // 状态
  const [records, setRecords] = useState<ClassRecord[]>([]);
  const [filmStrips, setFilmStrips] = useState<FilmStrip[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ClassRecord | null>(
    null
  );
  const [selectedMoment, setSelectedMoment] = useState<
    TeachingMoment | undefined
  >(undefined);
  const [_loadingRecords, setLoadingRecords] = useState(true);
  const [loadingFilmStrips, setLoadingFilmStrips] = useState(true);
  const [loadingMoment, setLoadingMoment] = useState(false);
  const [activeTab, setActiveTab] = useState("teaching");

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
      const momentId = searchParams.get("moment");
      const recordId = searchParams.get("record");

      if (momentId) {
        await fetchMomentDetail(momentId);
      } else if (recordId) {
        const record = records.find((r) => r.id === recordId);
        if (record) {
          setSelectedRecord(record);
        }
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取课堂记录
  const fetchClassroomRecords = async () => {
    setLoadingRecords(true);
    try {
      const response = await fetch("/api/classroom-timemachine/records", {
        headers: {
          Authorization: "Bearer mock-token",
        },
      });
      if (!response.ok) throw new Error("获取课堂记录失败");
      const data = await response.json();
      setRecords(data);
      if (data.length > 0 && !selectedRecord) {
        setSelectedRecord(data[0]);
      }
    } catch (error) {
      console.error("获取课堂记录错误:", error);
      toast.error("获取课堂记录失败");
    } finally {
      setLoadingRecords(false);
    }
  };

  // 获取胶片条
  const fetchFilmStrips = async () => {
    setLoadingFilmStrips(true);
    try {
      const response = await fetch("/api/classroom-timemachine/filmstrips", {
        headers: {
          Authorization: "Bearer mock-token",
        },
      });
      if (!response.ok) throw new Error("获取胶片条失败");
      const data = await response.json();
      setFilmStrips(data);
    } catch (error) {
      console.error("获取胶片条错误:", error);
      toast.error("获取胶片条失败");
    } finally {
      setLoadingFilmStrips(false);
    }
  };

  // 获取教学时刻详情
  const fetchMomentDetail = async (momentId: string) => {
    setLoadingMoment(true);
    try {
      const response = await fetch(
        `/api/classroom-timemachine/moments/${momentId}`,
        {
          headers: {
            Authorization: "Bearer mock-token",
          },
        }
      );
      if (!response.ok) throw new Error("获取教学时刻失败");
      const data = await response.json();
      setSelectedMoment(data);

      // 更新URL参数但不重新加载页面
      router.push(`/classroom-timemachine?moment=${momentId}`, {
        scroll: false,
      });
    } catch (error) {
      console.error("获取教学时刻错误:", error);
      toast.error("获取教学时刻失败");
    } finally {
      setLoadingMoment(false);
    }
  };

  // 处理时刻点击
  const handleMomentClick = (moment: TeachingMoment) => {
    fetchMomentDetail(moment.id);
  };

  // 计算内容区高度，确保在任何分辨率下都能正确显示
  const contentHeight = "calc(100% - 64px)"; // 减去标题部分的高度

  return (
    <div className="h-full flex flex-col">
      {/* 页面标题 */}
      <HeroSection
        title="课堂时光机"
        description="收集、整理和回顾您的教学时刻"
        icon={Clock10}
        gradient="from-purple-50 to-pink-50"
        actions={
          <Button className="h-10 px-5 rounded-xl bg-primary shadow-sm hover:bg-primary/90 hover:shadow-md transition-all duration-300 font-medium">
            <Plus className="h-4 w-4 mr-2" />
            新建记录
          </Button>
        }
      />

      {/* 三列布局 */}
      <div
        className="grid grid-cols-24 gap-5 flex-1 overflow-hidden"
        style={{ height: contentHeight }}
      >
        {/* 左侧: 垂直时间线 */}
        <div className="col-span-4 overflow-hidden">
          <div className="sticky top-6 h-full max-h-full">
            {loadingFilmStrips ? (
              <Skeleton className="w-full h-full rounded-2xl" />
            ) : (
              <VerticalTimeline
                filmStrips={filmStrips}
                onMomentClick={handleMomentClick}
                selectedMomentId={selectedMoment?.id}
              />
            )}
          </div>
        </div>

        {/* 中间: 课堂内容区域 */}
        <div className="col-span-14 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            {selectedMoment ? (
              <>
                <div className="p-6 border-b border-gray-100 flex-shrink-0">
                  <div className="mb-3">
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {selectedMoment.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1.5">
                      {selectedMoment.date} · {selectedMoment.subject}
                    </p>
                  </div>

                  {/* 四个模块的标签页 */}
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-4 mt-4">
                      <TabsTrigger
                        value="teaching"
                        className="flex items-center gap-2 text-sm py-3 font-medium transition-all duration-200"
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>教学环节</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="knowledge"
                        className="flex items-center gap-2 text-sm py-3 font-medium transition-all duration-200"
                      >
                        <Network className="h-4 w-4" />
                        <span>知识结构</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="questions"
                        className="flex items-center gap-2 text-sm py-3 font-medium transition-all duration-200"
                      >
                        <HelpCircle className="h-4 w-4" />
                        <span>问题链</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="tasks"
                        className="flex items-center gap-2 text-sm py-3 font-medium transition-all duration-200"
                      >
                        <ListChecks className="h-4 w-4" />
                        <span>任务链</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50/50">
                  <Tabs value={activeTab} className="h-full">
                    {/* 教学环节还原 */}
                    <TabsContent
                      value="teaching"
                      className="p-0 h-full data-[state=active]:flex data-[state=active]:flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-gray-100 m-6 shadow-sm">
                        <div className="text-center p-10">
                          <div className="mb-5 bg-gray-50 rounded-full p-5 inline-block">
                            <BookOpen className="h-16 w-16 text-gray-300" />
                          </div>
                          <h3 className="text-2xl font-medium text-gray-800">
                            教学环节还原
                          </h3>
                          <p className="mt-3 text-gray-500 max-w-2xl mx-auto text-base">
                            此区域将呈现课堂教学环节的时序还原，包括导入、讲解、练习等环节的时间分布与内容概要。
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* 知识结构还原 */}
                    <TabsContent
                      value="knowledge"
                      className="p-0 h-full data-[state=active]:flex data-[state=active]:flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-gray-100 m-6 shadow-sm">
                        <div className="text-center p-10">
                          <div className="mb-5 bg-gray-50 rounded-full p-5 inline-block">
                            <Network className="h-16 w-16 text-gray-300" />
                          </div>
                          <h3 className="text-2xl font-medium text-gray-800">
                            知识结构还原
                          </h3>
                          <p className="mt-3 text-gray-500 max-w-2xl mx-auto text-base">
                            此区域将通过知识图谱展现课堂中涉及的知识点及其关联关系，帮助教师理解知识结构的完整性。
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* 问题链还原 */}
                    <TabsContent
                      value="questions"
                      className="p-0 h-full data-[state=active]:flex data-[state=active]:flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-gray-100 m-6 shadow-sm">
                        <div className="text-center p-10">
                          <div className="mb-5 bg-gray-50 rounded-full p-5 inline-block">
                            <HelpCircle className="h-16 w-16 text-gray-300" />
                          </div>
                          <h3 className="text-2xl font-medium text-gray-800">
                            问题链还原
                          </h3>
                          <p className="mt-3 text-gray-500 max-w-2xl mx-auto text-base">
                            此区域将展示课堂中提出的问题序列，包括教师提问和学生问题，帮助分析问题设计的逻辑性和有效性。
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    {/* 任务链还原 */}
                    <TabsContent
                      value="tasks"
                      className="p-0 h-full data-[state=active]:flex data-[state=active]:flex-col"
                    >
                      <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-gray-100 m-6 shadow-sm">
                        <div className="text-center p-10">
                          <div className="mb-5 bg-gray-50 rounded-full p-5 inline-block">
                            <ListChecks className="h-16 w-16 text-gray-300" />
                          </div>
                          <h3 className="text-2xl font-medium text-gray-800">
                            任务链还原
                          </h3>
                          <p className="mt-3 text-gray-500 max-w-2xl mx-auto text-base">
                            此区域将呈现课堂任务的设计链条，展示从简单到复杂、从浅层到深层的任务进阶过程。
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-50/30">
                <div className="text-center p-10">
                  <div className="mb-5 bg-white rounded-full p-6 inline-block shadow-sm border border-gray-100">
                    <LucideImage className="h-20 w-20 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-800">
                    请从左侧时间线选择教学时刻
                  </h3>
                  <p className="mt-3 text-gray-500 max-w-lg mx-auto text-base">
                    点击左侧时间线上的任意时刻点，此处将显示对应的课堂内容
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右侧: 课堂信息面板 */}
        <div className="col-span-6 overflow-hidden">
          <div className="sticky top-6 h-full">
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full overflow-y-auto">
                {loadingMoment ? (
                  <div className="p-7 space-y-5">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-44 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : selectedMoment ? (
                  <MomentDetail moment={selectedMoment} isLoading={false} />
                ) : selectedRecord ? (
                  <div className="flex flex-col h-full">
                    <div className="relative h-64 w-full overflow-hidden">
                      <Image
                        src={selectedRecord.thumbnail}
                        alt={selectedRecord.title}
                        fill
                        className="object-cover"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                        <div className="absolute bottom-7 left-7 right-7">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-primary text-white px-3 py-1 rounded-md font-medium">
                              {selectedRecord.class}
                            </Badge>
                            {selectedRecord.isMine && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-600 hover:bg-blue-50 rounded-md px-3 py-1 font-medium"
                              >
                                我的
                              </Badge>
                            )}
                          </div>
                          <h2 className="text-2xl font-bold text-white">
                            {selectedRecord.title}
                          </h2>
                        </div>
                      </div>
                    </div>

                    <div className="p-7 space-y-8 flex-grow overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 bg-gray-50 rounded-full">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <span className="font-medium text-gray-900 text-base">
                            {selectedRecord.teacher}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="p-2.5 bg-gray-50 rounded-full">
                            <Clock className="h-5 w-5 text-gray-500" />
                          </div>
                          <span className="text-gray-700 text-base">
                            {selectedRecord.duration}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                          <h3 className="font-semibold text-lg text-gray-900">
                            课堂详情
                          </h3>
                          <Badge
                            variant="outline"
                            className="rounded-lg bg-gray-50 text-gray-700 border-gray-200 px-3.5 py-1.5"
                          >
                            {selectedRecord.subject}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-5 text-sm">
                          <div className="p-5 rounded-xl bg-gray-50/80 hover:bg-gray-50 transition-colors duration-200">
                            <div className="text-gray-500 mb-1.5 text-xs font-medium">
                              日期
                            </div>
                            <div className="font-medium text-gray-900 text-base">
                              {selectedRecord.date}
                            </div>
                          </div>
                          <div className="p-5 rounded-xl bg-gray-50/80 hover:bg-gray-50 transition-colors duration-200">
                            <div className="text-gray-500 mb-1.5 text-xs font-medium">
                              时长
                            </div>
                            <div className="font-medium text-gray-900 text-base">
                              {selectedRecord.duration}
                            </div>
                          </div>
                          <div className="p-5 rounded-xl bg-gray-50/80 hover:bg-gray-50 transition-colors duration-200">
                            <div className="text-gray-500 mb-1.5 text-xs font-medium">
                              班级
                            </div>
                            <div className="font-medium text-gray-900 text-base">
                              {selectedRecord.class}
                            </div>
                          </div>
                          <div className="p-5 rounded-xl bg-gray-50/80 hover:bg-gray-50 transition-colors duration-200">
                            <div className="text-gray-500 mb-1.5 text-xs font-medium">
                              喜欢
                            </div>
                            <div className="font-medium text-gray-900 flex items-center text-base">
                              <Heart className="h-4 w-4 text-rose-500 fill-rose-500 mr-1.5" />
                              {selectedRecord.likes}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-10">
                    <div className="text-center">
                      <div className="mb-6 bg-gray-50 rounded-full p-6 inline-block">
                        <Clock className="h-16 w-16 text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-medium text-gray-800 mb-3">
                        等待选择
                      </h3>
                      <p className="text-gray-500 text-base max-w-sm mx-auto">
                        从左侧时间线选择一个教学时刻以查看详细信息
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

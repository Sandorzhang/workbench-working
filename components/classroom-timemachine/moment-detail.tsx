import React from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TeachingMoment } from "@/mocks/handlers/classroom-timemachine";
import {
  Calendar,
  Clock,
  Download,
  Heart,
  MessageSquare,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// 学科颜色映射
const subjectColors: Record<string, string> = {
  语文: "text-red-500 border-red-200 bg-red-50",
  数学: "text-purple-500 border-purple-200 bg-purple-50",
  英语: "text-blue-500 border-blue-200 bg-blue-50",
  物理: "text-sky-500 border-sky-200 bg-sky-50",
  化学: "text-green-500 border-green-200 bg-green-50",
  生物: "text-emerald-500 border-emerald-200 bg-emerald-50",
  历史: "text-amber-500 border-amber-200 bg-amber-50",
  地理: "text-rose-500 border-rose-200 bg-rose-50",
  政治: "text-indigo-500 border-indigo-200 bg-indigo-50",
};

// 类型图标和颜色映射
const typeInfo: Record<
  string,
  { icon: React.ReactNode; className: string; label: string }
> = {
  note: {
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 2V5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16 2V5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 8.5H21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 14H17"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 17.5H13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M19.5 9.5V16.8C19.5 18.56 18.06 20 16.3 20H7.7C5.94 20 4.5 18.56 4.5 16.8V9.5C4.5 7.74 5.94 6.3 7.7 6.3H16.3C18.06 6.3 19.5 7.74 19.5 9.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
    className: "text-amber-600 bg-amber-50",
    label: "笔记",
  },
  audio: {
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 11V13C3 17.97 7.03 22 12 22C16.97 22 21 17.97 21 13V11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 2C8.58 2 5.79 4.79 5.79 8.21V15.5H18.21V8.21C18.21 4.79 15.42 2 12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 21.4V22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 21.4V22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.11 7.48C10.8908 7.48 12.33 8.91921 12.33 10.7C12.33 12.4808 10.8908 13.92 9.11 13.92"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    className: "text-blue-600 bg-blue-50",
    label: "音频",
  },
  video: {
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M2.52002 7.11H21.48"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.52002 2.11V6.97"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.48 2.11V6.52"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.75 14.45V13.25C9.75 11.71 10.84 11.08 12.17 11.85L13.21 12.45L14.25 13.05C15.58 13.82 15.58 15.08 14.25 15.85L13.21 16.45L12.17 17.05C10.84 17.82 9.75 17.19 9.75 15.65V14.45V14.45Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    className: "text-rose-600 bg-rose-50",
    label: "视频",
  },
  homework: {
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 10H18C15 10 14 9 14 6V2L22 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 13H13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 17H11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    className: "text-green-600 bg-green-50",
    label: "作业",
  },
  other: {
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 2V5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 2V5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 9.09H20.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.6947 13.7H15.7037"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.6947 16.7H15.7037"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.9955 13.7H12.0045"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.9955 16.7H12.0045"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.29431 13.7H8.30329"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.29431 16.7H8.30329"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    className: "text-purple-600 bg-purple-50",
    label: "其他",
  },
};

interface MomentDetailProps {
  moment?: TeachingMoment;
  isLoading?: boolean;
}

export const MomentDetail: React.FC<MomentDetailProps> = ({
  moment,
  isLoading = false,
}) => {
  if (isLoading) {
    return <MomentDetailSkeleton />;
  }

  if (!moment) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <CardContent className="text-center p-6">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            选择一个教学时刻
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            从时间线上选择一个教学时刻来查看详细信息
          </p>
        </CardContent>
      </Card>
    );
  }

  const type = moment.type || "other";
  const typeData = typeInfo[type] || typeInfo.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      <Card className="w-full h-full overflow-hidden border-0 shadow-sm">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={moment.thumbnail || "/placeholder-image.jpg"}
            alt={moment.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={cn("px-2 py-1", typeData.className)}>
                  <span className="flex items-center">
                    {typeData.icon}
                    <span className="ml-1">{typeData.label}</span>
                  </span>
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "border px-2 py-1",
                    subjectColors[moment.subject]
                  )}
                >
                  {moment.subject}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-white">{moment.title}</h2>
            </div>
          </div>
        </div>

        <CardHeader className="pb-2 pt-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={moment.teacherAvatar} />
                <AvatarFallback>{moment.teacher.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{moment.teacher}</CardTitle>
                <CardDescription className="text-xs flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {moment.date} · <Clock className="h-3 w-3 mx-1" />{" "}
                  {moment.duration}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-0">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">内容</TabsTrigger>
              <TabsTrigger value="comments">
                评论 ({moment.comments?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="related">相关</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="pt-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {moment.description}
                </p>

                {moment.content && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <pre className="text-sm whitespace-pre-wrap">
                      {moment.content}
                    </pre>
                  </div>
                )}

                {moment.type === "video" && (
                  <div className="mt-4 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <Button className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 11.9999V8.43989C4 4.01989 7.13 2.2099 10.96 4.4199L14.05 6.1999L17.14 7.9799C20.97 10.1899 20.97 13.8099 17.14 16.0199L14.05 17.7999L10.96 19.5799C7.13 21.7899 4 19.9799 4 15.5599V11.9999Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="white"
                        />
                      </svg>
                      播放视频
                    </Button>
                  </div>
                )}

                {moment.type === "audio" && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 flex items-center">
                    <Button variant="outline" size="sm" className="mr-2">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 11.9999V8.43989C4 4.01989 7.13 2.2099 10.96 4.4199L14.05 6.1999L17.14 7.9799C20.97 10.1899 20.97 13.8099 17.14 16.0199L14.05 17.7999L10.96 19.5799C7.13 21.7899 4 19.9799 4 15.5599V11.9999Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Button>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-primary h-full w-1/3"></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      1:23 / 3:45
                    </span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments" className="pt-4">
              {moment.comments && moment.comments.length > 0 ? (
                <div className="space-y-4">
                  {moment.comments.map((comment, index) => (
                    <div key={index} className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            {comment.author}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {comment.date}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            回复
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">暂无评论</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    添加第一条评论
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="related" className="pt-4">
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="h-16 w-16 rounded bg-gray-100 flex-shrink-0 overflow-hidden relative">
                      <Image
                        src={`/placeholder-${i}.jpg`}
                        alt="Related content"
                        fill
                        className="object-cover"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        相关教学时刻 {i}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {moment.teacher} · {moment.subject}
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {typeData.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="pt-4 pb-4">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" className="gap-1">
                <Heart className="h-4 w-4" />
                <span>{moment.likes || 0}</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{moment.comments?.length || 0}</span>
              </Button>
            </div>
            <Button size="sm">添加到收藏</Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const MomentDetailSkeleton = () => {
  return (
    <Card className="w-full h-full overflow-hidden border-0 shadow-sm">
      <Skeleton className="h-48 w-full" />
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24 mt-2" />
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full mt-4" />
        </div>
      </CardContent>
      <CardFooter className="pt-4 pb-4">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-1">
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default MomentDetail;

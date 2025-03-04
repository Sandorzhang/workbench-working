import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { GraduationCap, LineChart, Users } from "lucide-react";

export default function AcademicJourneyPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">学业旅程</h1>
          <p className="text-muted-foreground">
            跟踪学生的学业标准达成进度，了解班级整体情况。
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">班级概览</TabsTrigger>
          <TabsTrigger value="students">学生列表</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Link href="/academic-journey/overview">
              <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">班级概览</CardTitle>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    查看班级整体学业标准达成情况，了解教学重点和挑战。
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/academic-journey/students">
              <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">学生列表</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    查看所有学生的学业标准达成情况，了解个人进度。
                  </p>
                </CardContent>
              </Card>
            </Link>
            <Card className="hover:bg-accent/50 cursor-pointer transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">学习标准</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  浏览课程的学习标准，了解教学目标和要求。
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="students" className="space-y-4">
          <Link href="/academic-journey/students">
            <Button>查看学生列表</Button>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
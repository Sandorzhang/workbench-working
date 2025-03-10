"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

// 类型导入
import { School, Region } from "@/lib/api-types";
import {
  SchoolForm,
  SchoolFormValues,
} from "@/components/superadmin/school-form";

// UI 组件导入
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Search,
  Plus,
  Pencil,
  Trash2,
  School as SchoolIcon,
} from "lucide-react";

export default function SchoolsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [schoolTypes, setSchoolTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 筛选状态
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // 对话框状态
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 获取学校数据
  const fetchSchools = async () => {
    try {
      setIsLoading(true);

      // 构建查询参数
      const params = new URLSearchParams();
      if (filterRegion && filterRegion !== "all")
        params.append("regionId", filterRegion);
      if (filterType && filterType !== "all") params.append("type", filterType);
      if (filterStatus && filterStatus !== "all")
        params.append("status", filterStatus);

      // 添加时间戳，避免缓存问题
      params.append("_t", Date.now().toString());

      const queryString = params.toString() ? `?${params.toString()}` : "";
      //console.log('请求学校数据:', `/api/superadmin/schools${queryString}`);

      const response = await fetch(`/api/superadmin/schools${queryString}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin", // 确保发送cookies
        cache: "no-store", // 确保不使用缓存
      });

      if (response.status === 307) {
        console.error("请求被重定向:", response.headers.get("Location"));
        throw new Error("请求被重定向，这可能是由于没有权限或会话已过期");
      }

      if (!response.ok) {
        throw new Error(
          `获取学校数据失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      //console.log('获取学校数据成功:', data);
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("获取学校数据失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  // 获取区域数据
  const fetchRegions = async () => {
    try {
      //console.log('获取区域数据...');
      const response = await fetch("/api/regions", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Cache-Control": "no-cache",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 307) {
        console.error("区域请求被重定向:", response.headers.get("Location"));
        throw new Error("请求被重定向，这可能是由于没有权限或会话已过期");
      }

      if (!response.ok) {
        throw new Error(
          `获取区域数据失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      //console.log('获取区域数据成功:', data);
      setRegions(data.regions.filter((region: Region) => region.status));
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("获取区域数据失败，请稍后再试");
    }
  };

  // 获取学校类型
  const fetchSchoolTypes = async () => {
    try {
      //console.log('获取学校类型...');
      const response = await fetch("/api/school-types", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Cache-Control": "no-cache",
          "X-Requested-With": "XMLHttpRequest",
        },
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 307) {
        console.error(
          "学校类型请求被重定向:",
          response.headers.get("Location")
        );
        throw new Error("请求被重定向，这可能是由于没有权限或会话已过期");
      }

      if (!response.ok) {
        throw new Error(
          `获取学校类型失败: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      //console.log('获取学校类型成功:', data);
      setSchoolTypes(data);
    } catch (error) {
      console.error("Error fetching school types:", error);
      toast.error("获取学校类型失败，请稍后再试");
    }
  };

  // 过滤学校
  const filteredSchools = schools.filter((school) => {
    // 搜索关键字
    const matchesSearch =
      searchQuery === "" ||
      (school.name &&
        school.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (school.code && school.code.includes(searchQuery)) ||
      (school.regionName &&
        school.regionName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (school.type &&
        school.type.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // 打开添加学校对话框
  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentSchool(null);
    setIsDialogOpen(true);
  };

  // 打开编辑学校对话框
  const openEditDialog = (school: School) => {
    setIsEditMode(true);
    setCurrentSchool(school);
    setIsDialogOpen(true);
  };

  // 提交表单
  const onSubmit = async (values: SchoolFormValues) => {
    try {
      if (isEditMode && currentSchool) {
        // 更新学校
        //console.log('更新学校:', currentSchool.id, values);
        const response = await fetch(
          `/api/superadmin/schools/${currentSchool.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "Cache-Control": "no-cache",
              "X-Requested-With": "XMLHttpRequest",
            },
            body: JSON.stringify(values),
            credentials: "same-origin",
            cache: "no-store",
          }
        );

        if (response.status === 307) {
          console.error("更新请求被重定向:", response.headers.get("Location"));
          throw new Error("请求被重定向，这可能是由于没有权限或会话已过期");
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `更新学校失败: ${response.status} ${response.statusText}`
          );
        }

        toast.success("学校更新成功");
      } else {
        // 创建学校
        //console.log('创建学校:', values);
        const response = await fetch("/api/superadmin/schools", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Cache-Control": "no-cache",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify(values),
          credentials: "same-origin",
          cache: "no-store",
        });

        if (response.status === 307) {
          console.error("创建请求被重定向:", response.headers.get("Location"));
          throw new Error("请求被重定向，这可能是由于没有权限或会话已过期");
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `创建学校失败: ${response.status} ${response.statusText}`
          );
        }

        toast.success("学校创建成功");
      }

      fetchSchools(); // 重新获取数据
      return Promise.resolve();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error submitting school:", error);
      toast.error(error.message || "操作失败，请稍后再试");
      return Promise.reject(error);
    }
  };

  // 打开删除对话框
  const openDeleteDialog = (school: School) => {
    setSchoolToDelete(school);
    setIsDeleteDialogOpen(true);
  };

  // 删除学校
  const deleteSchool = async () => {
    if (!schoolToDelete) return;

    try {
      setIsDeleting(true);
      //console.log('删除学校:', schoolToDelete.id);
      const response = await fetch(
        `/api/superadmin/schools/${schoolToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Cache-Control": "no-cache",
            "X-Requested-With": "XMLHttpRequest",
          },
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      if (response.status === 307) {
        console.error("删除请求被重定向:", response.headers.get("Location"));
        throw new Error("请求被重定向，这可能是由于没有权限或会话已过期");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `删除学校失败: ${response.status} ${response.statusText}`
        );
      }

      toast.success("学校删除成功");
      setIsDeleteDialogOpen(false);
      fetchSchools(); // 重新获取数据
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting school:", error);
      toast.error(error.message || "删除学校失败，请稍后再试");
    } finally {
      setIsDeleting(false);
    }
  };

  // 应用筛选条件
  const applyFilters = () => {
    fetchSchools();
  };

  // 清除筛选条件
  const clearFilters = () => {
    setFilterRegion("all");
    setFilterType("all");
    setFilterStatus("all");
    setSearchQuery("");

    // 延迟一下再重新获取数据，确保状态已更新
    setTimeout(() => {
      fetchSchools();
    }, 0);
  };

  // 检查权限并加载数据
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
      return;
    }

    if (user?.role !== "superadmin") {
      toast.error("您没有权限访问此页面");
      router.push("/workbench");
      return;
    }

    // 加载所有必要数据
    fetchRegions();
    fetchSchoolTypes();
    fetchSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, router]);

  // 显示加载状态
  if (!isAuthenticated || user?.role !== "superadmin") {
    return null;
  }

  return (
    <div className="space-y-6 p-6 pt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">学校管理</h2>
          <p className="text-muted-foreground text-sm">
            管理系统中的所有学校数据与配置
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className="shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加学校
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="shadow-sm hover:shadow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              总学校数
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              启用学校
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {schools.filter((s) => s.status).length}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              禁用学校
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {schools.filter((s) => !s.status).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选工具栏 */}
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/20 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">筛选条件</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              筛选学校数据
            </CardDescription>
          </div>

          {/* 搜索框 */}
          <div className="relative w-full sm:w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索学校、代码或区域..."
              className="pl-9 h-9 w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">区域</label>
              <Select value={filterRegion} onValueChange={setFilterRegion}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择区域" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部区域</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">学校类型</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择学校类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {schoolTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">状态</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="true">启用</SelectItem>
                  <SelectItem value="false">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end">
              <div className="flex gap-2">
                <Button onClick={applyFilters} className="flex-1">
                  应用筛选
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  清除
                </Button>
              </div>

              {/* 活跃筛选条件标签 */}
              {(filterRegion !== "all" ||
                filterType !== "all" ||
                filterStatus !== "all") && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <div className="text-xs text-muted-foreground">筛选中:</div>
                  {filterRegion !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      区域:{" "}
                      {regions.find((r) => r.id === filterRegion)?.name ||
                        filterRegion}
                    </Badge>
                  )}
                  {filterType !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      类型: {filterType}
                    </Badge>
                  )}
                  {filterStatus !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      状态: {filterStatus === "true" ? "启用" : "禁用"}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 学校列表 */}
      <Card className="overflow-hidden shadow-md border-0 rounded-xl">
        <CardHeader className="bg-muted/20 px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle>学校列表</CardTitle>
              <CardDescription>管理系统中的所有学校</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 py-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/5">
                  <TableRow>
                    <TableHead className="font-semibold px-6 py-4">
                      学校
                    </TableHead>
                    <TableHead className="font-semibold px-6">代码</TableHead>
                    <TableHead className="font-semibold px-6">区域</TableHead>
                    <TableHead className="font-semibold px-6">
                      学校类型
                    </TableHead>
                    <TableHead className="font-semibold px-6">状态</TableHead>
                    <TableHead className="text-right font-semibold px-6">
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchools.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-16 text-muted-foreground"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 text-muted-foreground/60" />
                          没有找到学校
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchools.map((school) => (
                      <TableRow
                        key={school.id}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <TableCell className="font-medium px-6 py-4">
                          <div className="flex items-center">
                            <div className="p-1.5 bg-primary/10 rounded-md mr-2.5">
                              <SchoolIcon className="h-4 w-4 text-primary" />
                            </div>
                            {school.name}
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <Badge variant="outline" className="bg-muted/50">
                            {school.code}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6">
                          {school.regionName || "-"}
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex items-center">
                            <SchoolIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                            {school.type}
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          {school.status ? (
                            <Badge className="bg-green-50 text-green-800 hover:bg-green-100 border-green-200 font-medium">
                              启用
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-800 hover:bg-red-50 border-red-200 font-medium"
                            >
                              禁用
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(school)}
                              className="h-8 px-3 rounded-md hover:bg-primary/10 transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              编辑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 h-8 px-3 rounded-md hover:bg-red-50 transition-colors"
                              onClick={() => openDeleteDialog(school)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              删除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用分离出的学校表单组件 */}
      <SchoolForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={onSubmit}
        isEditMode={isEditMode}
        currentSchool={currentSchool}
        regions={regions}
        schoolTypes={schoolTypes}
      />

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认删除学校</DialogTitle>
            <DialogDescription>
              您确定要删除学校 {schoolToDelete?.name}
              吗？此操作不可撤销，删除后所有相关数据将无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                deleteSchool();
              }}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  删除中...
                </div>
              ) : (
                "确认删除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

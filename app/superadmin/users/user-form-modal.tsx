"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// 用户类型
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  status: "active" | "inactive" | "locked";
  schoolId?: string;
  schoolName?: string;
  lastLogin?: string;
  createdAt: string;
}

// 学校类型
interface School {
  id: string;
  name: string;
  type: string;
}

// 表单数据类型
interface UserFormData {
  name: string;
  email: string;
  username: string;
  phone: string;
  password: string;
  role: string;
  schoolId: string;
}

// 当用户没有选择学校时的特殊值
const NO_SCHOOL_VALUE = "no_school";
const DEFAULT_SCHOOL_ID = "000"; // 默认学校ID，用于无学校情况

// 角色映射到前缀
const ROLE_PREFIX: Record<string, string> = {
  admin: "M",
  teacher: "T",
  student: "S",
  superadmin: "M", // 超级管理员也使用M前缀
};

// 角色选项
const roleOptions = [
  { value: "admin", label: "管理员" },
  { value: "teacher", label: "教师" },
  { value: "student", label: "学生" },
];

// 生成用户名函数
const generateUsername = (
  role: string,
  schoolId: string,
  counter?: number
): string => {
  // 获取角色前缀
  const rolePrefix = ROLE_PREFIX[role] || "U"; // 默认为'U'

  // 处理学校ID (确保是三位)
  let schoolCode = DEFAULT_SCHOOL_ID;
  if (schoolId && schoolId !== NO_SCHOOL_VALUE) {
    // 截取学校ID的前三位，如果不足三位则补0
    schoolCode = schoolId.padStart(3, "0").substring(0, 3);
  }

  // 生成六位数字序列
  const sequence = String(counter || 1).padStart(6, "0");

  // 组合用户名
  return `${rolePrefix}${schoolCode}${sequence}`;
};

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User; // 可选的用户数据，如果提供则为编辑模式
  onSuccess: () => void; // 成功回调，通常用于刷新用户列表
}

export function UserFormModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: UserFormModalProps) {
  // 编辑模式标志
  const isEditMode = !!user;

  // 表单状态
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    role: "student", // 默认角色
    schoolId: NO_SCHOOL_VALUE,
  });

  // 学校列表
  const [schools, setSchools] = useState<School[]>([]);

  // 加载状态
  const [isLoading, setIsLoading] = useState(false);

  // 表单验证错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 用户名始终自动生成，不允许手动编辑
  const [userCounter, setUserCounter] = useState(1);

  // 获取用户列表以确定最新的计数器值
  useEffect(() => {
    const fetchLastUserId = async () => {
      try {
        const response = await fetch("/api/superadmin/users");
        if (response.ok) {
          const users = await response.json();
          if (Array.isArray(users) && users.length > 0) {
            // 查找所有符合格式的用户名中的最大序列号
            const pattern = /^[MTS]\d{3}(\d{6})$/;
            let maxSequence = 0;

            users.forEach((user) => {
              const match = user.username.match(pattern);
              if (match && match[1]) {
                const sequence = parseInt(match[1], 10);
                if (!isNaN(sequence) && sequence > maxSequence) {
                  maxSequence = sequence;
                }
              }
            });

            // 更新计数器为最大序列号 + 1
            setUserCounter(Math.max(1, maxSequence + 1));
          }
        }
      } catch (error) {
        console.error("获取用户列表失败:", error);
      }
    };

    if (isOpen) {
      fetchLastUserId();
    }
  }, [isOpen]);

  // 当打开编辑模式时，填充表单数据
  useEffect(() => {
    if (isEditMode && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        phone: user.phone || "",
        password: "", // 编辑模式下密码默认为空，除非用户要更改
        role: user.role || "student",
        schoolId: user.schoolId || NO_SCHOOL_VALUE,
      });
    } else {
      // 添加模式下重置表单
      setFormData(() => {
        return {
          name: "",
          email: "",
          username: generateUsername("student", NO_SCHOOL_VALUE, userCounter),
          phone: "",
          password: "",
          role: "student",
          schoolId: NO_SCHOOL_VALUE,
        };
      });
    }

    // 清除之前的错误
    setErrors({});
  }, [isEditMode, user, isOpen, userCounter]);

  // 获取学校列表
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("/api/schools");
        if (response.ok) {
          const data = await response.json();
          // 处理正确的API响应结构
          setSchools(data.schools || []);
        } else {
          console.error("获取学校列表失败");
        }
      } catch (error) {
        console.error("获取学校列表出错:", error);
      }
    };

    if (isOpen) {
      fetchSchools();
    }
  }, [isOpen]);

  // 当角色或学校ID变更时，更新用户名（仅在添加模式下）
  useEffect(() => {
    if (!isEditMode) {
      setFormData((prev) => ({
        ...prev,
        username: generateUsername(prev.role, prev.schoolId, userCounter),
      }));
    }
  }, [formData.role, formData.schoolId, isEditMode, userCounter]);

  // 处理表单字段变更
  const handleChange = (field: keyof UserFormData, value: string) => {
    // 不允许直接修改用户名
    if (field === "username") return;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 当字段被修改时，清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 必填字段验证
    if (!formData.name.trim()) {
      newErrors.name = "姓名不能为空";
    }

    if (!formData.email.trim()) {
      newErrors.email = "邮箱不能为空";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "邮箱格式不正确";
    }

    // 用户名验证不再提示错误，因为用户无法修改
    if (!formData.username.trim()) {
      // 内部错误，不应该发生，因为用户名是自动生成的
      console.error("用户名为空，这可能是一个内部错误");
    }

    // 添加模式下密码必填
    if (!isEditMode && !formData.password.trim()) {
      newErrors.password = "密码不能为空";
    }

    // 如果有密码但长度不足
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "密码长度至少为6位";
    }

    if (!formData.role) {
      newErrors.role = "请选择角色";
    }

    // 设置验证错误
    setErrors(newErrors);

    // 如果没有错误则返回true
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 构建请求数据
      const requestData = {
        ...formData,
        // 如果是编辑模式且密码为空，不发送密码字段
        ...(isEditMode && !formData.password && { password: undefined }),
        // 处理无学校的情况
        schoolId:
          formData.schoolId === NO_SCHOOL_VALUE ? undefined : formData.schoolId,
      };

      let response;

      if (isEditMode && user) {
        // 更新用户
        response = await fetch(`/api/superadmin/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
      } else {
        // 创建用户
        response = await fetch("/api/superadmin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            username: formData.username,
            password: formData.password,
            phone: formData.phone,
            role: formData.role,
            schoolId:
              formData.schoolId === NO_SCHOOL_VALUE
                ? undefined
                : formData.schoolId,
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "操作失败");
      }

      // 成功处理
      toast.success(isEditMode ? "用户更新成功" : "用户创建成功");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("操作失败:", error);
      toast.error(
        `${isEditMode ? "更新" : "创建"}用户失败: ${
          error instanceof Error ? error.message : "未知错误"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "编辑用户" : "添加新用户"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "修改用户信息，带*号的为必填项。如不需要修改密码，可以留空。"
              : "请填写用户信息，带*号的为必填项。"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              基本信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  姓名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="请输入姓名"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="username">
                    用户名 <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    自动生成
                  </span>
                </div>
                <Input
                  id="username"
                  placeholder="用户名将自动生成"
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  className={`${
                    errors.username ? "border-red-500" : ""
                  } bg-muted cursor-not-allowed`}
                  readOnly
                  disabled
                />
                {errors.username ? (
                  <p className="text-red-500 text-xs">{errors.username}</p>
                ) : (
                  <p className="text-gray-500 text-xs">
                    格式：角色代码(M/T/S)+学校ID(3位)+序列号(6位)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              联系方式
            </h3>
            <div className="space-y-2">
              <Label htmlFor="email">
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">手机号码</Label>
              <Input
                id="phone"
                placeholder="请输入手机号码"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              账号信息
            </h3>
            <div className="space-y-2">
              <Label htmlFor="password">
                密码 {isEditMode ? "" : <span className="text-red-500">*</span>}
                {isEditMode && (
                  <span className="text-gray-400 text-xs ml-2">
                    (留空则不修改)
                  </span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isEditMode ? "留空则不修改密码" : "请输入密码"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-red-500 text-xs">{errors.password}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">
                  角色 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleChange("role", value)}
                >
                  <SelectTrigger
                    id="role"
                    className={errors.role ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-red-500 text-xs">{errors.role}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">所属学校</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={(value) => handleChange("schoolId", value)}
                >
                  <SelectTrigger id="school">
                    <SelectValue placeholder="选择学校(可选)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_SCHOOL_VALUE}>无所属学校</SelectItem>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="sm:mr-2"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "处理中..." : isEditMode ? "保存更改" : "创建用户"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

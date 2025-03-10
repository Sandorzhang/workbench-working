// import { server } from './node'
import { seedDb, db, loadDb, saveDb } from "./db";
import { handlers } from "./handlers/index";

// 初始化MSW数据库 - 只有在加载失败时才会执行
seedDb();

// 手动初始化角色权限
const initializeRolePermissions = () => {
  // //console.log(">>> [MSW初始化] 检查角色权限状态...");

  // 获取角色权限
  const existingPermissions = db.rolePermission.getAll();

  // 检查每个角色是否有权限记录
  const roles = ["superadmin", "admin", "teacher", "student"];
  const roleHasPermissions: Record<string, boolean> = {};

  roles.forEach((role) => {
    const hasPerms = existingPermissions.some((p) => p.role === role);
    roleHasPermissions[role] = hasPerms;
    // //console.log(
    //   `>>> [MSW初始化] 角色 "${role}" ${hasPerms ? "已有" : "没有"} 权限记录`
    // );
  });

  // 如果所有角色都有权限记录，则跳过初始化
  const allRolesHavePermissions = roles.every(
    (role) => roleHasPermissions[role]
  );

  if (allRolesHavePermissions) {
    // //console.log(">>> [MSW初始化] 所有角色都已有权限记录，跳过完全初始化");

    const allApplications = db.application.getAll();
    // //console.log(
    //   `>>> [MSW初始化] 系统中共有 ${allApplications.length} 个应用，检查权限完整性`
    // );

    roles.forEach((role) => {
      // //console.log(`>>> [MSW初始化] 检查角色 "${role}" 的应用权限...`);

      const rolePerms = existingPermissions.filter((p) => p.role === role);
      const permittedAppIds = rolePerms
        .filter((p) => p.granted)
        .map((p) => p.applicationId);
      const deniedAppIds = rolePerms
        .filter((p) => !p.granted)
        .map((p) => p.applicationId);

      // //console.log(
      //   `>>> [MSW初始化] 角色 "${role}" 现有权限: ${permittedAppIds.length} 允许, ${deniedAppIds.length} 拒绝`
      // );

      // 确定该角色应该可访问的应用
      let applicationsForRole = allApplications;

      if (role === "teacher") {
        // 排除管理员专用应用
        const adminOnlyAppIds = ["10", "11", "12", "13", "14"];
        applicationsForRole = allApplications.filter(
          (app) => !adminOnlyAppIds.includes(app.id)
        );
      } else if (role === "student") {
        // 学生只能访问部分应用
        const studentAppIds = ["1", "2", "3", "5", "7", "8"];
        applicationsForRole = allApplications.filter((app) =>
          studentAppIds.includes(app.id)
        );
      }

      // 检查默认角色权限是否丢失
      applicationsForRole.forEach((app) => {
        if (
          !permittedAppIds.includes(app.id) &&
          !deniedAppIds.includes(app.id)
        ) {
          // 此应用缺少权限记录，添加默认允许
          try {
            db.rolePermission.create({
              id: `${role}-${app.id}-${Date.now()}`,
              role: role,
              applicationId: app.id,
              granted: true,
              createdAt: new Date().toISOString(),
            });
            // //console.log(
            //   `>>> [MSW初始化] 补充角色权限: 为 ${role} 添加应用 ${app.name} (ID: ${app.id}) 的访问权限`
            // );
          } catch (e) {
            // //console.log(`>>> [MSW初始化] 补充权限失败: ${role}-${app.id}`, e);
          }
        }
      });

      // 对于应该拒绝的应用，也检查缺失记录
      if (role === "teacher" || role === "student") {
        const restrictedApps = allApplications.filter(
          (app) => !applicationsForRole.some((a) => a.id === app.id)
        );

        restrictedApps.forEach((app) => {
          if (
            !permittedAppIds.includes(app.id) &&
            !deniedAppIds.includes(app.id)
          ) {
            // 此应用缺少权限记录，添加默认拒绝
            try {
              db.rolePermission.create({
                id: `${role}-${app.id}-restricted-${Date.now()}`,
                role: role,
                applicationId: app.id,
                granted: false,
                createdAt: new Date().toISOString(),
              });
              // //console.log(
              //   `>>> [MSW初始化] 补充角色权限: 为 ${role} 添加应用 ${app.name} (ID: ${app.id}) 的拒绝权限`
              // );
            } catch (e) {
              // //console.log(
              //   `>>> [MSW初始化] 补充拒绝权限失败: ${role}-${app.id}`,
              //   e
              // );
            }
          }
        });
      }
    });

    // 保存数据库状态
    saveDb();
    // //console.log(">>> [MSW初始化] 权限完整性检查完成，数据库已保存");
    return;
  }

  // //console.log(">>> [MSW初始化] 开始进行完整的权限初始化...");
  const allApplications = db.application.getAll();
  // //console.log(
  //   `>>> [MSW初始化] 找到 ${allApplications.length} 个应用，准备设置权限`
  // );

  // 为每个角色设置权限
  roles.forEach((role) => {
    // 清除现有角色权限
    try {
      // //console.log(
      //   `>>> [MSW初始化] 找到 ${existingPermissions.length} 个现有 ${role} 权限记录`
      // );

      db.rolePermission.deleteMany({
        where: {
          role: {
            equals: role,
          },
        },
      });
      // //console.log(`>>> [MSW初始化] 已删除现有 ${role} 角色权限`);
    } catch (e) {
      // //console.log(`>>> [MSW初始化] 删除 ${role} 角色旧权限时出错`, e);
    }

    // 为角色添加应用权限
    // 根据角色分配不同的应用权限
    let applicationsForRole = allApplications;

    // 根据角色限制应用访问权限
    if (role === "teacher") {
      // 排除管理员专用应用
      const adminOnlyAppIds = ["10", "11", "12", "13", "14"]; // 教育管理、教师管理、学生管理、年级管理、班级管理
      applicationsForRole = allApplications.filter(
        (app) => !adminOnlyAppIds.includes(app.id)
      );
    } else if (role === "student") {
      // 学生只能访问部分应用
      const studentAppIds = ["1", "2", "3", "5", "7", "8"]; // 只允许学生访问部分应用
      applicationsForRole = allApplications.filter((app) =>
        studentAppIds.includes(app.id)
      );
    }

    // 添加权限
    applicationsForRole.forEach((app) => {
      try {
        db.rolePermission.create({
          id: `${role}-${app.id}-${Date.now()}`,
          role: role,
          applicationId: app.id,
          granted: true,
          createdAt: new Date().toISOString(),
        });
        // //console.log(
        //   `>>> [MSW初始化] 为 ${role} 角色添加应用权限: ${app.name} (ID: ${app.id})`
        // );
      } catch (e) {
        // //console.log(
        //   `>>> [MSW初始化] 为 ${role} 添加应用权限失败: ${app.name}`,
        //   e
        // );
      }
    });

    // 如果是学生或教师，对某些应用明确禁止访问
    if (role === "student" || role === "teacher") {
      const restrictedApps = allApplications.filter(
        (app) => !applicationsForRole.some((a) => a.id === app.id)
      );
      restrictedApps.forEach((app) => {
        try {
          db.rolePermission.create({
            id: `${role}-${app.id}-restricted-${Date.now()}`,
            role: role,
            applicationId: app.id,
            granted: false,
            createdAt: new Date().toISOString(),
          });
          // //console.log(
          //   `>>> [MSW初始化] 为 ${role} 角色禁止访问应用: ${app.name} (ID: ${app.id})`
          // );
        } catch (e) {
          // //console.log(
          //   `>>> [MSW初始化] 为 ${role} 设置禁止权限失败: ${app.name}`,
          //   e
          // );
        }
      });
    }
  });

  // 保存数据库状态
  saveDb();
  // //console.log(">>> [MSW初始化] 权限初始化完成，数据库状态已保存");
};

// 确保角色权限初始化执行
initializeRolePermissions();

// 最大重试次数
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// 打印MSW处理程序配置信息 (开发调试用)
// 注意: 仅在开发环境和浏览器环境打印此信息
const printHandlerInfo = () => {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    // //console.log("=== MSW处理程序配置信息 ===");
    // //console.log(`总共配置的处理程序数: ${handlers.length}`);

    // 分析处理程序路径
    const pathMap = new Map<string, number>();
    const methodMap = new Map<string, number>();

    handlers.forEach((handler) => {
      try {
        // MSW v2 格式 - 使用 handler.info
        if (handler && "info" in handler) {
          const info = (handler as any).info;

          if (info && info.path && info.method) {
            // 提取路径和方法
            const pathStr = String(info.path);
            const method = String(info.method);

            pathMap.set(pathStr, (pathMap.get(pathStr) || 0) + 1);
            methodMap.set(method, (methodMap.get(method) || 0) + 1);
          }
        }
      } catch (err) {
        // console.warn("提取处理程序信息时出错:", err);
      }
    });

    // 打印路径统计
    // //console.log('API路径统计:');
    const sortedPaths = Array.from(pathMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    sortedPaths.forEach(([path, count]) => {
      // //console.log(`  ${path}: ${count}个处理程序`);
    });

    // 打印方法统计
    // //console.log("HTTP方法统计:");
    const sortedMethods = Array.from(methodMap.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    sortedMethods.forEach(([method, count]) => {
      // //console.log(`  ${method}: ${count}个处理程序`);
    });

    // 检查常见的认证路径
    const authPaths = ["/api/auth/login", "/api/auth/me", "/api/auth/logout"];
    //console.log("认证路径检查:");
    authPaths.forEach((path) => {
      const hasPath = Array.from(pathMap.keys()).some(
        (p) =>
          p === path ||
          p.includes(path) ||
          p === `*${path}` ||
          p === `*/${path}`
      );
      // //console.log(`  ${path}: ${hasPath ? "已配置" : "未配置"}`);
    });
  }
};

// 在浏览器环境中执行一次处理程序检查
if (typeof window !== "undefined") {
  setTimeout(printHandlerInfo, 1000);
}

// 浏览器
export const worker = {
  start: async (options = {}) => {
    if (typeof window === "undefined") {
      return;
    }

    let retries = 0;

    const tryStart = async (): Promise<any> => {
      try {
        // //console.log(
        //   `尝试启动 MSW worker (尝试 ${retries + 1}/${MAX_RETRIES})...`
        // );

        printHandlerInfo();

        const { worker } = await import("./browser");

        await worker.start(options);

        const token = localStorage.getItem("token");
        if (!token) {
          // //console.log("设置默认测试token");
          localStorage.setItem("token", "default-token");

          try {
            const defaultUser = db.user.findFirst({
              where: {
                id: {
                  equals: "1",
                },
              },
            });

            if (defaultUser) {
              // //console.log("为默认用户创建有效会话");
              const expiresAt = new Date();
              expiresAt.setDate(expiresAt.getDate() + 7);

              try {
                db.session.delete({
                  where: {
                    token: {
                      equals: "default-token",
                    },
                  },
                });
                // //console.log("已删除旧的default-token会话");
              } catch (e) {}

              db.session.create({
                id: `default-session-${Date.now()}`,
                userId: defaultUser.id,
                token: "default-token",
                expiresAt: expiresAt.toISOString(),
              });

              // //console.log(
              //   "已为默认用户创建会话，到期日期:",
              //   expiresAt.toISOString()
              // );
            } else {
              // console.warn("找不到默认用户(ID: 1)，无法创建默认会话");
            }
          } catch (e) {
            // console.error("创建默认会话时出错:", e);
          }
        }

        // //console.log("MSW worker已成功初始化和启动");

        return worker;
      } catch (error) {
        // console.error(
        //   `启动MSW失败 (尝试 ${retries + 1}/${MAX_RETRIES}):`,
        //   error
        // );

        if (retries < MAX_RETRIES - 1) {
          retries++;
          // //console.log(`等待 ${RETRY_DELAY}ms 后重试...`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return tryStart();
        }

        // console.error("MSW启动失败，已达到最大重试次数");
        throw error;
      }
    };

    try {
      return await tryStart();
    } catch (error) {
      // console.error("MSW启动最终失败:", error);
      if (typeof window !== "undefined") {
        window.__MSW_READY__ = true;
      }
      return null;
    }
  },
};

// 用于类型检查 - 确保server导出可用
export const server = async () => {
  // console.warn("server()被调用，但这是仅客户端模式的MSW");
  return null;
};

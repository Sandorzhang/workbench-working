import { http, HttpResponse, delay } from "msw";
import { db } from "../db";

// 定义应用类型
interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  url?: string;
  roles?: string[];
  order?: number;
  createdAt?: string;
}

// 获取应用列表处理程序
export const getApplicationsHandler = http.get(
  "/api/applications",
  async ({ request }) => {
    await delay(300);

    try {
      console.log(">>> [MSW拦截] 获取应用列表");

      // 获取当前用户信息
      const token = request.headers.get("Authorization")?.split(" ")[1];
      if (!token) {
        console.log("No token provided");
        return new HttpResponse(JSON.stringify({ error: "未授权访问" }), {
          status: 401,
        });
      }

      // 从会话中获取用户ID
      const session = db.session.findFirst({
        where: {
          token: {
            equals: token,
          },
        },
      });

      if (!session) {
        console.log("No session found for token");
        return new HttpResponse(JSON.stringify({ error: "会话无效" }), {
          status: 401,
        });
      }

      const userId = session.userId;

      // 获取用户信息
      const user = db.user.findFirst({
        where: {
          id: {
            equals: userId,
          },
        },
      });

      if (!user) {
        console.log("User not found");
        return new HttpResponse(JSON.stringify({ error: "用户不存在" }), {
          status: 404,
        });
      }

      console.log(
        `>>> [MSW拦截] 用户信息: ${user.name}, 角色: ${user.role}, ID: ${user.id}`
      );

      // 获取所有应用
      const allApplications = db.application.getAll();
      console.log(`>>> [MSW拦截] 系统中共有 ${allApplications.length} 个应用`);

      // 先记录应用的默认角色设置
      allApplications.forEach((app) => {
        const roles = Array.isArray(app.roles) ? app.roles.join(", ") : "无";
        console.log(
          `>>> [MSW拦截] 应用 "${app.name}" (ID: ${app.id}) 默认角色: ${roles}`
        );
      });

      // 获取用户特定权限
      const userPermissions = db.permission.findMany({
        where: {
          userId: {
            equals: userId,
          },
        },
      });

      console.log(
        `>>> [MSW拦截] 用户特定权限记录数: ${userPermissions.length}`
      );

      // 获取角色权限
      const rolePermissions = db.rolePermission.findMany({
        where: {
          role: {
            equals: user.role,
          },
        },
      });

      console.log(
        `>>> [MSW拦截] 角色 "${user.role}" 权限记录数: ${rolePermissions.length}`
      );

      // 记录详细角色权限
      rolePermissions.forEach((rp) => {
        const app = allApplications.find((a) => a.id === rp.applicationId);
        const appName = app ? app.name : "未知应用";
        console.log(
          `>>> [MSW拦截] 角色权限: ${user.role} → ${appName} (ID: ${
            rp.applicationId
          }), 授权状态: ${rp.granted ? "允许" : "拒绝"}`
        );
      });

      // 合并用户可访问的应用ID
      const accessibleAppIds = new Set();

      // 检查默认角色权限 - 如果应用默认允许该角色访问，添加到可访问集合
      allApplications.forEach((app) => {
        if (Array.isArray(app.roles) && app.roles.includes(user.role)) {
          accessibleAppIds.add(app.id);
          console.log(
            `>>> [MSW拦截] 基于默认角色设置添加应用: ${app.name} (ID: ${app.id})`
          );
        }
      });

      // 添加角色权限中的应用 - 只添加granted为true的
      rolePermissions.forEach((permission) => {
        if (permission.applicationId) {
          const app = allApplications.find(
            (a) => a.id === permission.applicationId
          );
          const appName = app ? app.name : "未知应用";

          if (permission.granted) {
            accessibleAppIds.add(permission.applicationId);
            console.log(
              `>>> [MSW拦截] 添加角色权限应用: ${appName} (ID: ${permission.applicationId}), 授权: 允许`
            );
          } else {
            accessibleAppIds.delete(permission.applicationId); // 确保显式拒绝可以覆盖默认允许
            console.log(
              `>>> [MSW拦截] 移除角色权限应用: ${appName} (ID: ${permission.applicationId}), 授权: 拒绝`
            );
          }
        }
      });

      // 添加用户特定权限中的应用
      userPermissions.forEach((permission) => {
        if (permission.applicationId) {
          const app = allApplications.find(
            (a) => a.id === permission.applicationId
          );
          const appName = app ? app.name : "未知应用";

          if (permission.granted) {
            accessibleAppIds.add(permission.applicationId);
            console.log(
              `>>> [MSW拦截] 添加用户自定义权限应用: ${appName} (ID: ${permission.applicationId}), 授权: 允许`
            );
          } else {
            accessibleAppIds.delete(permission.applicationId);
            console.log(
              `>>> [MSW拦截] 移除用户自定义权限应用: ${appName} (ID: ${permission.applicationId}), 授权: 拒绝`
            );
          }
        }
      });

      console.log(
        `>>> [MSW拦截] 最终可访问应用ID列表: ${Array.from(
          accessibleAppIds
        ).join(", ")}`
      );

      // 过滤用户可访问的应用
      let accessibleApplications = allApplications.filter((app) =>
        accessibleAppIds.has(app.id)
      );

      console.log(
        `>>> [MSW拦截] 过滤后应用数量: ${accessibleApplications.length}`
      );

      // 如果用户是教师但没有任何应用权限，确保默认至少有一个应用可访问
      if (user.role === "teacher" && accessibleApplications.length === 0) {
        console.log(`>>> [MSW拦截] 教师账户没有应用权限，添加默认应用`);

        // 查找教师默认可访问的应用
        const teacherApps = allApplications.filter(
          (app) => Array.isArray(app.roles) && app.roles.includes("teacher")
        );

        if (teacherApps.length > 0) {
          accessibleApplications = teacherApps;
          console.log(
            `>>> [MSW拦截] 为教师添加 ${teacherApps.length} 个默认应用`
          );
        } else {
          // 如果没有默认配置，添加第一个应用作为应急措施
          accessibleApplications = [allApplications[0]];
          console.log(
            `>>> [MSW拦截] 为教师添加一个应急应用: ${allApplications[0].name}`
          );
        }
      }

      // 按照排序字段排序
      accessibleApplications = accessibleApplications.sort((a, b) => {
        // 首先按照 order 字段排序
        if (a.order !== b.order) {
          return a.order - b.order;
        }

        // 如果 order 相同，则按照 name 字段排序
        return a.name.localeCompare(b.name);
      });

      return HttpResponse.json(accessibleApplications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      return new HttpResponse(JSON.stringify({ error: "获取应用列表失败" }), {
        status: 500,
      });
    }
  }
);

// 获取单个应用处理程序
export const getApplicationHandler = http.get(
  "/api/applications/:id",
  async ({ params }) => {
    await delay(300);

    try {
      const { id } = params;

      const application = db.application.findFirst({
        where: {
          id: {
            equals: id as string,
          },
        },
      });

      if (!application) {
        return new HttpResponse(JSON.stringify({ error: "应用不存在" }), {
          status: 404,
        });
      }

      return HttpResponse.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      return new HttpResponse(JSON.stringify({ error: "获取应用信息失败" }), {
        status: 500,
      });
    }
  }
);

// 创建应用处理程序
export const createApplicationHandler = http.post(
  "/api/applications",
  async ({ request }) => {
    await delay(500);

    try {
      const applicationData = (await request.json()) as Partial<Application>;

      // 检查必要字段
      if (
        !applicationData.name ||
        !applicationData.description ||
        !applicationData.icon
      ) {
        return new HttpResponse(JSON.stringify({ error: "缺少必要字段" }), {
          status: 400,
        });
      }

      // 创建新应用
      const newApplication = db.application.create({
        id: String(Date.now()),
        name: applicationData.name,
        description: applicationData.description,
        icon: applicationData.icon,
        url: applicationData.url || "#",
        order: applicationData.order || 0,
        createdAt: new Date().toISOString(),
      });

      return HttpResponse.json(newApplication, { status: 201 });
    } catch (error) {
      console.error("Error creating application:", error);
      return new HttpResponse(JSON.stringify({ error: "创建应用失败" }), {
        status: 500,
      });
    }
  }
);

// 更新应用处理程序
export const updateApplicationHandler = http.put(
  "/api/applications/:id",
  async ({ params, request }) => {
    await delay(500);

    try {
      const { id } = params;
      const applicationData = (await request.json()) as Partial<Application>;

      // 检查应用是否存在
      const existingApplication = db.application.findFirst({
        where: {
          id: {
            equals: id as string,
          },
        },
      });

      if (!existingApplication) {
        return new HttpResponse(JSON.stringify({ error: "应用不存在" }), {
          status: 404,
        });
      }

      // 更新应用
      const updatedApplication = db.application.update({
        where: {
          id: {
            equals: id as string,
          },
        },
        data: applicationData,
      });

      return HttpResponse.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application:", error);
      return new HttpResponse(JSON.stringify({ error: "更新应用失败" }), {
        status: 500,
      });
    }
  }
);

// 删除应用处理程序
export const deleteApplicationHandler = http.delete(
  "/api/applications/:id",
  async ({ params }) => {
    await delay(400);

    try {
      const { id } = params;

      // 检查应用是否存在
      const existingApplication = db.application.findFirst({
        where: {
          id: {
            equals: id as string,
          },
        },
      });

      if (!existingApplication) {
        return new HttpResponse(JSON.stringify({ error: "应用不存在" }), {
          status: 404,
        });
      }

      // 删除应用
      db.application.delete({
        where: {
          id: {
            equals: id as string,
          },
        },
      });

      // 同时删除相关的权限
      db.permission.deleteMany({
        where: {
          applicationId: {
            equals: id as string,
          },
        },
      });

      db.rolePermission.deleteMany({
        where: {
          applicationId: {
            equals: id as string,
          },
        },
      });

      return new HttpResponse(null, { status: 204 });
    } catch (error) {
      console.error("Error deleting application:", error);
      return new HttpResponse(JSON.stringify({ error: "删除应用失败" }), {
        status: 500,
      });
    }
  }
);

export const applicationHandlers = [
  getApplicationsHandler,
  getApplicationHandler,
  createApplicationHandler,
  updateApplicationHandler,
  deleteApplicationHandler,
];

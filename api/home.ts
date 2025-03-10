import request from "./request";

// 工作台相关

// 获取工作台配置
export const getConfig = request.get(`/workbench/config`);

// 保存工作台偏好设置
export const savePreferences = (moduleIds: string[]) =>
  request.post(`/workbench/preferences`, moduleIds);

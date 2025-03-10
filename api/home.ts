
  // 工作台相关
  workbench: {
    // 获取工作台配置
    getConfig: () => 
      handleRequest(`/workbench/config`),
    
    // 保存工作台偏好设置
    savePreferences: (moduleIds: string[]) => 
      handleRequest(`/workbench/preferences`, {
        method: 'POST',
        data: { modules: moduleIds }
      })
  },
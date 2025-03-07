// 测试超级管理员登录
import fetch from 'node-fetch';

// 测试环境API基础URL
const API_BASE_URL = 'http://192.168.10.75/server';

// 测试超级管理员登录
async function testSuperadminLogin() {
  console.log('测试超级管理员登录...');
  console.log(`API基础URL: ${API_BASE_URL}`);
  
  try {
    // 构建登录请求
    const loginUrl = `${API_BASE_URL}/auth/login`;
    console.log(`登录URL: ${loginUrl}`);
    
    // 发送登录请求 - 使用superadmin账号
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identity: "superadmin", // 超级管理员用户名
        verify: "admin",       // 密码
        type: "ACCOUNT"
      })
    });
    
    // 获取响应数据
    const data = await response.json();
    
    // 输出响应状态和数据
    console.log(`响应状态: ${response.status}`);
    
    // 只输出关键信息，避免过多输出
    if (data.data && data.data.user) {
      console.log('用户ID:', data.data.user.id);
      console.log('用户名:', data.data.user.name);
      console.log('账号:', data.data.user.account);
      
      // 输出角色信息
      if (data.data.role) {
        console.log('角色ID:', data.data.role.id);
        console.log('角色名称:', data.data.role.name);
      } else {
        console.log('角色信息不存在');
      }
      
      // 输出角色列表
      if (data.data.roleList && data.data.roleList.length > 0) {
        console.log('角色列表:');
        data.data.roleList.forEach((role, index) => {
          console.log(`  角色 ${index+1} - ID: ${role.id}, 名称: ${role.name}`);
        });
      }
      
      // 输出权限列表
      if (data.data.permissions) {
        console.log('权限列表:', data.data.permissions);
      }
    } else {
      console.log('完整响应数据:', JSON.stringify(data, null, 2));
    }
    
    return { success: response.ok, data };
  } catch (error) {
    console.error('❌ 测试登录API时出错:', error.message);
    return { success: false, error: error.message };
  }
}

// 执行测试
testSuperadminLogin(); 
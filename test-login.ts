/**
 * 登录功能测试脚本
 * 
 * 这个脚本用于测试登录功能是否正常工作
 * 它会尝试使用不同的账号登录，并检查返回的结果
 */

// 测试账号
const TEST_ACCOUNTS = [
  { username: 'admin', password: 'admin', expectedRole: 'admin' },
  { username: 'teacher', password: 'teacher', expectedRole: 'teacher' },
  { username: 'student', password: 'student', expectedRole: 'student' },
  { username: 'superadmin', password: 'superadmin', expectedRole: 'superadmin' }
];

// 测试登录函数
async function testLogin(username: string, password: string) {
  console.log(`\n测试登录: ${username} / ${password}`);
  
  try {
    // 构建请求体
    const payload = {
      identity: username,
      verify: password,
      type: 'ACCOUNT'
    };
    
    // 发送登录请求
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    // 解析响应
    const data = await response.json();
    
    // 检查响应状态
    if (response.ok && data.success) {
      console.log('✅ 登录成功!');
      console.log(`用户信息: ${data.data.user.name} (${data.data.user.role})`);
      console.log(`访问令牌: ${data.data.accessToken.substring(0, 10)}...`);
      return { success: true, data: data.data };
    } else {
      console.error('❌ 登录失败!');
      console.error(`错误信息: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error: any) {
    console.error('❌ 请求异常!');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// 测试验证码发送函数
async function testSendCode(phone: string) {
  console.log(`\n测试发送验证码: ${phone}`);
  
  try {
    // 发送验证码请求
    const response = await fetch('/api/auth/send-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone })
    });
    
    // 解析响应
    const data = await response.json();
    
    // 检查响应状态
    if (response.ok && data.success) {
      console.log('✅ 验证码发送成功!');
      // 在测试模式下，可能会返回验证码
      const code = data.data?.code;
      if (code) {
        console.log(`测试验证码: ${code}`);
      }
      return { success: true, code };
    } else {
      console.error('❌ 验证码发送失败!');
      console.error(`错误信息: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error: any) {
    console.error('❌ 请求异常!');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// 测试验证码登录函数
async function testCodeLogin(phone: string, code: string) {
  console.log(`\n测试验证码登录: ${phone} / ${code}`);
  
  try {
    // 发送验证码登录请求
    const response = await fetch('/api/auth/login-with-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone, code })
    });
    
    // 解析响应
    const data = await response.json();
    
    // 检查响应状态
    if (response.ok && data.success) {
      console.log('✅ 验证码登录成功!');
      console.log(`用户信息: ${data.data.user.name} (${data.data.user.role})`);
      console.log(`访问令牌: ${data.data.accessToken.substring(0, 10)}...`);
      return { success: true, data: data.data };
    } else {
      console.error('❌ 验证码登录失败!');
      console.error(`错误信息: ${data.message}`);
      return { success: false, error: data.message };
    }
  } catch (error: any) {
    console.error('❌ 请求异常!');
    console.error(error);
    return { success: false, error: error.message };
  }
}

// 运行测试
async function runTests() {
  console.log('=== 开始登录功能测试 ===');
  
  // 测试账号密码登录
  for (const account of TEST_ACCOUNTS) {
    const result = await testLogin(account.username, account.password);
    
    if (result.success) {
      // 验证角色是否符合预期
      const role = result.data.user.role;
      if (role === account.expectedRole) {
        console.log(`✅ 角色验证通过: ${role}`);
      } else {
        console.error(`❌ 角色验证失败: 期望 ${account.expectedRole}, 实际 ${role}`);
      }
    }
  }
  
  // 测试验证码登录
  const phone = '13800138000';
  const codeResult = await testSendCode(phone);
  
  if (codeResult.success && codeResult.code) {
    // 使用返回的验证码登录
    await testCodeLogin(phone, codeResult.code);
  } else {
    // 使用测试验证码登录
    await testCodeLogin(phone, '123456');
  }
  
  console.log('\n=== 登录功能测试完成 ===');
}

// 检查是否在浏览器环境
if (typeof window !== 'undefined') {
  // 添加到全局对象，方便在控制台调用
  (window as any).testLogin = testLogin;
  (window as any).testSendCode = testSendCode;
  (window as any).testCodeLogin = testCodeLogin;
  (window as any).runLoginTests = runTests;
  
  console.log('登录测试工具已加载，可以通过以下方式测试:');
  console.log('1. window.testLogin("用户名", "密码")');
  console.log('2. window.testSendCode("手机号")');
  console.log('3. window.testCodeLogin("手机号", "验证码")');
  console.log('4. window.runLoginTests() - 运行所有测试');
}

// 导出测试函数
export {
  testLogin,
  testSendCode,
  testCodeLogin,
  runTests
}; 
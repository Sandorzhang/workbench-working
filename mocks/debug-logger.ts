/**
 * MSW调试日志
 * 提供详细的请求和响应日志，帮助调试MSW拦截
 */

// 打印请求详情
export const logRequest = (request: Request, handlerName: string) => {
  const { url, method, headers } = request;
  
  console.group(`🔍 [MSW请求] ${method} ${new URL(url).pathname}`);
  console.log(`处理程序: ${handlerName}`);
  console.log(`完整URL: ${url}`);
  console.log(`HTTP方法: ${method}`);
  
  // 打印关键请求头
  const headersToShow = ['content-type', 'authorization'];
  console.log('关键请求头:');
  headersToShow.forEach(header => {
    if (headers.has(header)) {
      // 如果是授权头，隐藏具体内容
      const value = header === 'authorization' 
        ? headers.get(header)?.substring(0, 15) + '...' 
        : headers.get(header);
      console.log(`  ${header}: ${value}`);
    }
  });
  
  console.groupEnd();
  
  return { 
    timestamp: new Date().toISOString(),
    url, 
    method 
  };
};

// 打印响应详情
export const logResponse = (
  response: Response, 
  requestInfo: { timestamp: string; url: string; method: string },
  handlerName: string
) => {
  const { status, headers } = response;
  const { url, method, timestamp } = requestInfo;
  
  // 计算处理时间
  const startTime = new Date(timestamp).getTime();
  const endTime = new Date().getTime();
  const duration = endTime - startTime;
  
  console.group(`✅ [MSW响应] ${method} ${new URL(url).pathname}`);
  console.log(`处理程序: ${handlerName}`);
  console.log(`状态码: ${status}`);
  console.log(`处理时间: ${duration}ms`);
  
  // 打印关键响应头
  const headersToShow = ['content-type', 'content-length'];
  console.log('关键响应头:');
  headersToShow.forEach(header => {
    if (headers.has(header)) {
      console.log(`  ${header}: ${headers.get(header)}`);
    }
  });
  
  console.groupEnd();
};

// 打印处理程序错误
export const logHandlerError = (
  error: any, 
  request: Request,
  handlerName: string
) => {
  console.group(`❌ [MSW错误] ${request.method} ${new URL(request.url).pathname}`);
  console.log(`处理程序: ${handlerName}`);
  console.error('错误详情:', error);
  console.groupEnd();
}; 
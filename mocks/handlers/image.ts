import { http, HttpResponse } from 'msw';

/**
 * 生成一个简单的占位符图片
 * @param width 图片宽度
 * @param height 图片高度
 * @returns 占位符图片的ArrayBuffer
 */
async function generatePlaceholderImage(width = 400, height = 300): Promise<ArrayBuffer> {
  try {
    // 检查是否支持OffscreenCanvas
    if (typeof OffscreenCanvas !== 'undefined') {
      // 创建一个Canvas元素
      const canvas = new OffscreenCanvas(width, height);
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建Canvas上下文');
      }
      
      // 填充背景
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, width, height);
      
      // 绘制文本
      ctx.fillStyle = '#aaaaaa';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Image Placeholder', width / 2, height / 2);
      
      // 转换为Blob并获取ArrayBuffer
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      return await blob.arrayBuffer();
    } else {
      // 如果不支持OffscreenCanvas，返回一个1x1像素的透明PNG
      // 这是一个最小的有效PNG图片的二进制数据
      const transparentPixelPNG = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0A, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0x60, 0x00, 0x00, 0x00,
        0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      return transparentPixelPNG.buffer;
    }
  } catch (error) {
    console.error('生成占位符图片失败:', error);
    
    // 返回一个1x1像素的透明PNG作为最终的后备方案
    const transparentPixelPNG = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0x60, 0x00, 0x00, 0x00,
      0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    return transparentPixelPNG.buffer;
  }
}

/**
 * 处理Next.js图片优化请求的处理器
 * 这个处理器会拦截对/_next/image的请求，并返回原始图片
 */
export const imageHandlers = [
  // 处理Next.js图片优化请求
  http.get('*/_next/image*', async ({ request }) => {
    try {
      // 从URL中提取原始图片URL
      const url = new URL(request.url);
      const imageUrl = url.searchParams.get('url');
      
      if (!imageUrl) {
        return new HttpResponse(null, { status: 400 });
      }
      
      // 获取请求的宽度和高度
      const width = parseInt(url.searchParams.get('w') || '400', 10);
      const height = parseInt(url.searchParams.get('h') || '300', 10);
      
      // 解码URL
      const decodedImageUrl = decodeURIComponent(imageUrl);
      
      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
      
      try {
        // 获取原始图片，添加超时控制
        const imageResponse = await fetch(decodedImageUrl, {
          signal: controller.signal,
        });
        
        // 清除超时计时器
        clearTimeout(timeoutId);
        
        if (!imageResponse.ok) {
          // 如果原始图片获取失败，返回占位符图片
          console.warn(`原始图片获取失败 (${imageResponse.status}): ${decodedImageUrl}`);
          const placeholderImage = await generatePlaceholderImage(width, height);
          return new HttpResponse(placeholderImage, {
            status: 200,
            headers: {
              'Content-Type': 'image/png',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
        
        // 获取图片数据
        const imageData = await imageResponse.arrayBuffer();
        
        // 获取内容类型
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        
        // 返回图片数据
        return new HttpResponse(imageData, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      } catch (fetchError: unknown) {
        // 清除超时计时器
        clearTimeout(timeoutId);
        
        // 如果是超时错误或其他错误，返回占位符图片
        console.error('图片获取错误:', fetchError);
        const placeholderImage = await generatePlaceholderImage(width, height);
        return new HttpResponse(placeholderImage, {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      }
    } catch (error) {
      console.error('Image handler error:', error);
      return new HttpResponse(null, { status: 500 });
    }
  }),
]; 
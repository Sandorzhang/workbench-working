import { http, HttpResponse, delay } from 'msw';
import { db, saveDb } from '../db';

// 定义区域数据类型
interface RegionData {
  id: string;
  name: string;
  status: boolean;
  createdAt: string;
  modifiedAt: string;
}

export const regionHandlers = [
  // 区域分页查询
  http.get('*/api/regions/page*', async ({ request }) => {
    console.log('MSW: 捕获到区域分页查询请求:', request.url);
    await delay(300);
    
    try {
      const url = new URL(request.url);
      
      // 获取分页参数
      const pageNumber = parseInt(url.searchParams.get('pageNumber') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
      const nameFilter = url.searchParams.get('name') || '';
      const statusFilter = url.searchParams.has('status') 
        ? url.searchParams.get('status') === 'true' 
        : undefined;
      
      // 获取所有区域 - 每次确保从数据库获取最新数据
      const regions = db.region.getAll().map(region => {
        const regionData = {
          id: region.id,
          name: region.name,
          status: region.status,
          createdAt: region.createdAt || new Date().toISOString(),
          modifiedAt: region.modifiedAt || new Date().toISOString()
        };
        return regionData;
      });
      
      console.log(`MSW: 区域分页查询 - 数据库中共有 ${regions.length} 个区域`);
      
      // 应用过滤
      let filteredRegions = [...regions];
      
      // 名称过滤
      if (nameFilter) {
        filteredRegions = filteredRegions.filter(region => 
          region.name.includes(nameFilter)
        );
        console.log(`MSW: 应用名称过滤 "${nameFilter}" - 过滤后 ${filteredRegions.length} 个区域`);
      }
      
      // 状态过滤
      if (statusFilter !== undefined) {
        filteredRegions = filteredRegions.filter(region => 
          region.status === statusFilter
        );
        console.log(`MSW: 应用状态过滤 ${statusFilter} - 过滤后 ${filteredRegions.length} 个区域`);
      }
      
      // 计算分页
      const totalCount = filteredRegions.length;
      const totalPage = Math.ceil(totalCount / pageSize) || 1;
      const start = (pageNumber - 1) * pageSize;
      const end = start + pageSize;
      const pagedRegions = filteredRegions.slice(start, end);
      
      console.log(`MSW: 返回区域分页数据 - 总数: ${totalCount}, 当前页: ${pagedRegions.length}项, 页码: ${pageNumber}/${totalPage}`);
      
      // 返回标准格式
      return HttpResponse.json({
        code: "0",
        msg: "请求成功",
        data: {
          pageNumber,
          pageSize,
          totalPage,
          totalCount,
          list: pagedRegions
        }
      }, { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (error) {
      console.error('MSW: 获取区域分页数据失败:', error);
      return HttpResponse.json({ 
        code: "500",
        msg: "获取区域分页数据失败",
        data: {
          pageNumber: 1,
          pageSize: 10,
          totalPage: 0,
          totalCount: 0,
          list: []
        }
      }, { status: 200 });
    }
  }),
  
  // 获取区域详情
  http.get('/api/regions/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const region = db.region.findFirst({
      where: {
        id: {
          equals: String(id),
        },
      },
    });
    
    if (!region) {
      return HttpResponse.json(
        { 
          code: "404",
          msg: "区域不存在"
        },
        { status: 200 }
      );
    }
    
    // 返回区域详情
    return HttpResponse.json({
      code: "0",
      msg: "请求成功",
      data: {
        id: region.id,
        name: region.name,
        status: region.status,
        createdAt: region.createdAt || new Date().toISOString(),
        modifiedAt: region.modifiedAt || new Date().toISOString()
      }
    }, { status: 200 });
  }),
  
  // 获取所有区域列表
  http.get('/api/regions', async () => {
    await delay(300);
    const regions = db.region.getAll().map(region => ({
      id: region.id,
      name: region.name,
      status: region.status,
      createdAt: region.createdAt || new Date().toISOString(),
      modifiedAt: region.modifiedAt || new Date().toISOString()
    }));
    
    console.log(`MSW: 获取所有区域列表 - 总数: ${regions.length}`);
    
    return HttpResponse.json({
      code: "0",
      msg: "请求成功",
      data: {
        regions,
        total: regions.length
      }
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }),
  
  // 创建区域
  http.post('/api/regions', async ({ request }) => {
    await delay(300);
    
    try {
      const data = await request.json() as RegionData;
      
      console.log('MSW: 接收到区域创建请求:', data);
      
      // 验证ID是否为6位数字
      if (!data.id || !/^\d{6}$/.test(data.id)) {
        console.log('MSW: 区域ID验证失败, ID必须是6位数字:', data.id);
        return HttpResponse.json(
          { 
            code: "400",
            msg: "区域ID必须是6位数字"
          },
          { status: 200 }
        );
      }
      
      // 验证ID唯一性
      const existingId = db.region.findFirst({
        where: {
          id: {
            equals: data.id,
          },
        },
      });
      
      if (existingId) {
        console.log('MSW: 区域ID已存在:', data.id);
        return HttpResponse.json(
          { 
            code: "409",
            msg: "区域ID已存在"
          },
          { status: 200 }
        );
      }
      
      // 验证名称唯一性
      const existingName = db.region.findFirst({
        where: {
          name: {
            equals: data.name,
          },
        },
      });
      
      if (existingName) {
        console.log('MSW: 区域名称已存在:', data.name);
        return HttpResponse.json(
          { 
            code: "409",
            msg: "区域名称已存在"
          },
          { status: 200 }
        );
      }
      
      // 添加创建时间和修改时间
      const now = new Date().toISOString();
      const newRegion = {
        ...data,
        createdAt: now,
        modifiedAt: now
      };
      
      // 创建区域
      const createdRegion = db.region.create(newRegion);
      
      // 输出当前所有区域, 确认数据已正确添加
      const allRegions = db.region.getAll();
      console.log(`MSW: 区域创建成功, ID: ${createdRegion.id}, 名称: ${createdRegion.name}`);
      console.log(`MSW: 当前区域总数: ${allRegions.length}`);
      
      // 保存数据库状态以确保持久化
      saveDb();
      console.log('MSW: 数据库状态已保存');
      
      // 返回简化的成功响应
      return HttpResponse.json(
        { 
          code: "0",
          msg: "请求成功"
        },
        { 
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    } catch (error) {
      console.error('MSW: 创建区域失败:', error);
      
      return HttpResponse.json(
        { 
          code: "500",
          msg: "创建区域失败"
        },
        { status: 200 }
      );
    }
  }),
  
  // 更新区域
  http.put('/api/regions/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    
    try {
      const data = await request.json() as Partial<RegionData>;
      console.log(`MSW: 接收到区域更新请求, ID: ${id}`, data);
      
      // 检查区域是否存在
      const existingRegion = db.region.findFirst({
        where: {
          id: {
            equals: String(id),
          },
        },
      });
      
      if (!existingRegion) {
        console.log(`MSW: 区域不存在, ID: ${id}`);
        return HttpResponse.json(
          { 
            code: "404",
            msg: "区域不存在"
          },
          { status: 200 }
        );
      }
      
      // 如果更新名称，检查名称唯一性
      if (data.name && data.name !== existingRegion.name) {
        const existingName = db.region.findFirst({
          where: {
            name: {
              equals: data.name,
            },
          },
        });
        
        if (existingName) {
          console.log(`MSW: 区域名称已存在: ${data.name}`);
          return HttpResponse.json(
            { 
              code: "409",
              msg: "区域名称已存在"
            },
            { status: 200 }
          );
        }
      }
      
      // 更新区域
      const updatedRegion = db.region.update({
        where: {
          id: {
            equals: String(id),
          },
        },
        data: {
          ...data,
          modifiedAt: new Date().toISOString(),
        },
      });
      
      // 如果更新失败，记录错误并返回
      if (!updatedRegion) {
        console.error(`MSW: 区域更新失败, ID: ${id}`);
        return HttpResponse.json(
          { 
            code: "500",
            msg: "区域更新失败"
          },
          { status: 200 }
        );
      }
      
      // 输出当前所有区域, 确认数据已正确更新
      const allRegions = db.region.getAll();
      console.log(`MSW: 区域更新成功, ID: ${id}, 名称: ${updatedRegion.name}`);
      console.log(`MSW: 当前区域总数: ${allRegions.length}`);
      
      // 保存数据库状态以确保持久化
      saveDb();
      console.log('MSW: 数据库状态已保存');
      
      // 返回成功响应 (符合API文档规范)
      return HttpResponse.json(
        { 
          code: "0",
          msg: "请求成功"
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('MSW: 更新区域失败:', error);
      
      return HttpResponse.json(
        { 
          code: "500",
          msg: "更新区域失败"
        },
        { status: 200 }
      );
    }
  }),
  
  // 删除区域
  http.delete('/api/regions/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    console.log(`MSW: 接收到区域删除请求, ID: ${id}`);
    
    // 检查区域是否存在
    const existingRegion = db.region.findFirst({
      where: {
        id: {
          equals: String(id),
        },
      },
    });
    
    if (!existingRegion) {
      console.log(`MSW: 区域不存在, ID: ${id}`);
      return HttpResponse.json(
        { 
          code: "404",
          msg: "区域不存在"
        },
        { status: 200 }
      );
    }
    
    // 删除区域
    db.region.delete({
      where: {
        id: {
          equals: String(id),
        },
      },
    });
    
    // 输出当前所有区域, 确认数据已正确删除
    const allRegions = db.region.getAll();
    console.log(`MSW: 区域删除成功, ID: ${id}`);
    console.log(`MSW: 当前区域总数: ${allRegions.length}`);
    
    // 保存数据库状态以确保持久化
    saveDb();
    console.log('MSW: 数据库状态已保存');
    
    // 返回成功响应 (符合API文档规范)
    return HttpResponse.json(
      { 
        code: "0",
        msg: "请求成功"
      },
      { status: 200 }
    );
  }),
]; 
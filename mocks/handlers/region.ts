import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 定义区域数据类型
interface RegionData {
  id: string;
  name: string;
  status: boolean;
}

export const regionHandlers = [
  // 获取区域列表
  http.get('*/api/regions', async () => {
    await delay(300);
    const regions = db.region.getAll();
    return HttpResponse.json({
      regions,
      total: regions.length
    });
  }),
  
  // 获取单个区域
  http.get('*/api/regions/:id', async ({ params }) => {
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
        { message: '区域不存在', code: '404' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(region);
  }),
  
  // 创建区域
  http.post('*/api/regions', async ({ request }) => {
    await delay(300);
    const data = await request.json() as RegionData;
    
    // 验证ID是否为6位数字
    if (!data.id || !/^\d{6}$/.test(data.id)) {
      return HttpResponse.json(
        { message: '区域ID必须是6位数字', code: '400' },
        { status: 400 }
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
      return HttpResponse.json(
        { message: '区域ID已存在', code: '409' },
        { status: 409 }
      );
    }
    
    // 验证名称唯一性
    if (!data.name) {
      return HttpResponse.json(
        { message: '区域名称不能为空', code: '400' },
        { status: 400 }
      );
    }
    
    const existingName = db.region.findFirst({
      where: {
        name: {
          equals: data.name,
        },
      },
    });
    
    if (existingName) {
      return HttpResponse.json(
        { message: '区域名称已存在', code: '409' },
        { status: 409 }
      );
    }
    
    // 创建新区域
    const newRegion = db.region.create({
      id: data.id,
      name: data.name,
      status: data.status !== undefined ? data.status : true
    });
    
    return HttpResponse.json(newRegion, { status: 201 });
  }),
  
  // 更新区域
  http.put('*/api/regions/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const data = await request.json() as Partial<RegionData>;
    
    // 验证区域是否存在
    const region = db.region.findFirst({
      where: {
        id: {
          equals: String(id),
        },
      },
    });
    
    if (!region) {
      return HttpResponse.json(
        { message: '区域不存在', code: '404' },
        { status: 404 }
      );
    }
    
    // 如果修改了名称，验证名称唯一性
    if (data.name && data.name !== region.name) {
      const existingName = db.region.findFirst({
        where: {
          name: {
            equals: data.name,
          },
        },
      });
      
      if (existingName) {
        return HttpResponse.json(
          { message: '区域名称已存在', code: '409' },
          { status: 409 }
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
        name: data.name !== undefined ? data.name : region.name,
        status: data.status !== undefined ? data.status : region.status
      },
    });
    
    return HttpResponse.json(updatedRegion);
  }),
  
  // 删除区域
  http.delete('*/api/regions/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    
    // 验证区域是否存在
    const region = db.region.findFirst({
      where: {
        id: {
          equals: String(id),
        },
      },
    });
    
    if (!region) {
      return HttpResponse.json(
        { message: '区域不存在', code: '404' },
        { status: 404 }
      );
    }
    
    // 检查是否有学校关联到该区域
    const schools = db.school.findMany({
      where: {
        regionId: {
          equals: String(id),
        },
      },
    });
    
    if (schools && schools.length > 0) {
      return HttpResponse.json(
        { 
          message: '该区域下有关联的学校，无法删除', 
          code: '400',
          details: { schoolCount: schools.length }
        },
        { status: 400 }
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
    
    return new HttpResponse(null, { status: 204 });
  }),
]; 
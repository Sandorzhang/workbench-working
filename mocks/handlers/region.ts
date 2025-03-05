import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 定义区域数据类型
interface RegionData {
  id: string;
  name: string;
  status: boolean;
}

export const regionHandlers = [
  // 获取省份列表
  http.get('/api/regions/provinces', async () => {
    await delay(300);
    
    try {
      // 获取所有省份数据
      const provinces = db.region.findMany({
        where: {
          level: { equals: 'province' }
        }
      });
      
      return HttpResponse.json(provinces);
    } catch (error) {
      console.error('获取省份列表失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取省份列表失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 获取城市列表
  http.get('/api/regions/cities/:provinceCode', async ({ params }) => {
    await delay(300);
    
    try {
      const { provinceCode } = params;
      
      // 获取指定省份下的城市
      const cities = db.region.findMany({
        where: {
          level: { equals: 'city' },
          parentCode: { equals: provinceCode as string }
        }
      });
      
      return HttpResponse.json(cities);
    } catch (error) {
      console.error('获取城市列表失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取城市列表失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 获取区/县列表
  http.get('/api/regions/districts/:cityCode', async ({ params }) => {
    await delay(300);
    
    try {
      const { cityCode } = params;
      
      // 获取指定城市下的区县
      const districts = db.region.findMany({
        where: {
          level: { equals: 'district' },
          parentCode: { equals: cityCode as string }
        }
      });
      
      return HttpResponse.json(districts);
    } catch (error) {
      console.error('获取区县列表失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取区县列表失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 根据区域代码获取详细信息
  http.get('/api/regions/:code', async ({ params }) => {
    await delay(200);
    
    try {
      const { code } = params;
      
      // 查找区域信息
      const region = db.region.findFirst({
        where: {
          code: { equals: code as string }
        }
      });
      
      if (!region) {
        return new HttpResponse(
          JSON.stringify({ error: '未找到区域信息' }),
          { status: 404 }
        );
      }
      
      return HttpResponse.json(region);
    } catch (error) {
      console.error('获取区域信息失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取区域信息失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 获取完整地址信息
  http.get('/api/regions/full-address/:code', async ({ params }) => {
    await delay(300);
    
    try {
      const { code } = params;
      
      // 查找当前区域
      const region = db.region.findFirst({
        where: {
          code: { equals: code as string }
        }
      });
      
      if (!region) {
        return new HttpResponse(
          JSON.stringify({ error: '未找到区域信息' }),
          { status: 404 }
        );
      }
      
      // 初始化完整地址对象
      const fullAddress = {
        province: null,
        city: null,
        district: null,
        detail: region
      };
      
      // 根据级别补充上级地址信息
      if (region.level === 'district') {
        // 查找城市
        const city = db.region.findFirst({
          where: {
            code: { equals: region.parentCode }
          }
        });
        
        if (city) {
          fullAddress.city = city;
          
          // 查找省份
          const province = db.region.findFirst({
            where: {
              code: { equals: city.parentCode }
            }
          });
          
          if (province) {
            fullAddress.province = province;
          }
        }
      } else if (region.level === 'city') {
        fullAddress.city = region;
        
        // 查找省份
        const province = db.region.findFirst({
          where: {
            code: { equals: region.parentCode }
          }
        });
        
        if (province) {
          fullAddress.province = province;
        }
      } else if (region.level === 'province') {
        fullAddress.province = region;
      }
      
      return HttpResponse.json(fullAddress);
    } catch (error) {
      console.error('获取完整地址信息失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取完整地址信息失败' }),
        { status: 500 }
      );
    }
  }),
  
  // 获取区域列表
  http.get('/api/regions', async () => {
    await delay(300);
    const regions = db.region.getAll();
    return HttpResponse.json({
      regions,
      total: regions.length
    });
  }),
  
  // 获取单个区域
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
        { message: '区域不存在', code: '404' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(region);
  }),
  
  // 创建区域
  http.post('/api/regions', async ({ request }) => {
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
  http.put('/api/regions/:id', async ({ params, request }) => {
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
  http.delete('/api/regions/:id', async ({ params }) => {
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
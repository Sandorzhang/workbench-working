import { http, HttpResponse, delay } from 'msw';
import { db, saveDb } from '../db';
import { SchoolData } from '@/types/models/school';

export const superadminSchoolHandlers = [
  // 忽略对页面路由的直接访问
  http.get('*/superadmin/schools', ({ request }) => {
    console.log('Next.js页面路由请求被MSW拦截并直接通过:', request.url);
    // 对页面路由请求不进行拦截，直接通过（返回undefined让MSW将请求传递给服务器）
    return undefined;
  }),
  
  // 忽略对页面路由子路径的直接访问
  http.get('*/superadmin/schools/*', ({ request }) => {
    console.log('Next.js子路径页面路由请求被MSW拦截并直接通过:', request.url);
    // 对页面路由请求不进行拦截，直接通过
    return undefined;
  }),
  
  // 获取所有学校列表（提供给超级管理员使用）
  http.get('*/api/superadmin/schools', async ({ request }) => {
    console.log('处理获取学校列表请求:', request.url);
    await delay(300);
    
    // 获取所有学校
    const schools = db.school.getAll();
    
    // 增强学校数据，添加区域信息
    const enhancedSchools = schools.map(school => {
      const region = db.region.findFirst({
        where: {
          id: {
            equals: school.regionId
          }
        }
      });
      
      return {
        ...school,
        regionName: region ? region.name : '未知区域'
      };
    });
    
    console.log(`返回${enhancedSchools.length}所学校数据`);
    return HttpResponse.json(enhancedSchools);
  }),
  
  // 获取单个学校详情
  http.get('*/api/superadmin/schools/:id', async ({ params }) => {
    const { id } = params;
    console.log('处理获取单个学校详情请求, ID:', id);
    await delay(200);
    
    const school = db.school.findFirst({
      where: {
        id: {
          equals: String(id)
        }
      }
    });
    
    if (!school) {
      return HttpResponse.json(
        { message: '学校不存在', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // 获取区域信息
    const region = db.region.findFirst({
      where: {
        id: {
          equals: school.regionId
        }
      }
    });
    
    const schoolWithRegion = {
      ...school,
      regionName: region ? region.name : '未知区域'
    };
    
    return HttpResponse.json(schoolWithRegion);
  }),
  
  // 创建学校
  http.post('*/api/superadmin/schools', async ({ request }) => {
    console.log('处理创建学校请求');
    await delay(400);
    const data = await request.json() as SchoolData;
    
    // 验证必填字段
    if (!data.name || !data.code || !data.regionId || !data.type || !Array.isArray(data.grades)) {
      return HttpResponse.json(
        { message: '缺少必要的学校信息', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }
    
    // 验证学校代码是否为3位数字
    if (!/^\d{3}$/.test(data.code)) {
      return HttpResponse.json(
        { message: '学校代码必须是3位数字', code: 'INVALID_CODE_FORMAT' },
        { status: 400 }
      );
    }
    
    // 验证区域存在
    const region = db.region.findFirst({
      where: {
        id: {
          equals: data.regionId
        }
      }
    });
    
    if (!region) {
      return HttpResponse.json(
        { message: '所选区域不存在', code: 'REGION_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // 验证学校名称唯一性
    const existingName = db.school.findFirst({
      where: {
        name: {
          equals: data.name
        }
      }
    });
    
    if (existingName) {
      return HttpResponse.json(
        { message: '学校名称已存在', code: 'NAME_EXISTS' },
        { status: 409 }
      );
    }
    
    // 验证学校代码唯一性
    const existingCode = db.school.findFirst({
      where: {
        code: {
          equals: data.code
        }
      }
    });
    
    if (existingCode) {
      return HttpResponse.json(
        { message: '学校代码已存在', code: 'CODE_EXISTS' },
        { status: 409 }
      );
    }
    
    // 创建学校
    const newSchool = db.school.create({
      id: String(Date.now()),
      name: data.name,
      code: data.code,
      regionId: data.regionId,
      type: data.type,
      grades: data.grades,
      status: data.status !== undefined ? data.status : true,
      createdAt: new Date().toISOString()
    });
    
    // 保存数据库状态
    saveDb();
    
    const schoolWithRegion = {
      ...newSchool,
      regionName: region.name
    };
    
    return HttpResponse.json(schoolWithRegion, { status: 201 });
  }),
  
  // 更新学校
  http.put('*/api/superadmin/schools/:id', async ({ params, request }) => {
    const { id } = params;
    console.log('处理更新学校请求, ID:', id);
    await delay(300);
    const data = await request.json() as Partial<SchoolData>;
    
    // 验证学校是否存在
    const school = db.school.findFirst({
      where: {
        id: {
          equals: String(id)
        }
      }
    });
    
    if (!school) {
      return HttpResponse.json(
        { message: '学校不存在', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // 如果更新了名称，检查唯一性
    if (data.name && data.name !== school.name) {
      const existingName = db.school.findFirst({
        where: {
          name: {
            equals: data.name
          }
        }
      });
      
      if (existingName && existingName.id !== id) {
        return HttpResponse.json(
          { message: '学校名称已存在', code: 'NAME_EXISTS' },
          { status: 409 }
        );
      }
    }
    
    // 如果更新了代码，检查格式和唯一性
    if (data.code && data.code !== school.code) {
      // 验证代码格式
      if (!/^\d{3}$/.test(data.code)) {
        return HttpResponse.json(
          { message: '学校代码必须是3位数字', code: 'INVALID_CODE_FORMAT' },
          { status: 400 }
        );
      }
      
      // 验证代码唯一性
      const existingCode = db.school.findFirst({
        where: {
          code: {
            equals: data.code
          }
        }
      });
      
      if (existingCode && existingCode.id !== id) {
        return HttpResponse.json(
          { message: '学校代码已存在', code: 'CODE_EXISTS' },
          { status: 409 }
        );
      }
    }
    
    // 如果更新了区域，验证区域存在
    if (data.regionId && data.regionId !== school.regionId) {
      const region = db.region.findFirst({
        where: {
          id: {
            equals: data.regionId
          }
        }
      });
      
      if (!region) {
        return HttpResponse.json(
          { message: '所选区域不存在', code: 'REGION_NOT_FOUND' },
          { status: 404 }
        );
      }
    }
    
    // 更新学校
    const updatedSchool = db.school.update({
      where: {
        id: {
          equals: String(id)
        }
      },
      data: {
        name: data.name !== undefined ? data.name : school.name,
        code: data.code !== undefined ? data.code : school.code,
        regionId: data.regionId !== undefined ? data.regionId : school.regionId,
        type: data.type !== undefined ? data.type : school.type,
        grades: data.grades !== undefined ? data.grades : school.grades,
        status: data.status !== undefined ? data.status : school.status
      }
    });
    
    // 检查更新是否成功
    if (!updatedSchool) {
      return HttpResponse.json(
        { message: '更新学校失败', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }
    
    // 保存数据库状态
    saveDb();
    
    // 获取区域信息
    const region = db.region.findFirst({
      where: {
        id: {
          equals: updatedSchool.regionId
        }
      }
    });
    
    const schoolWithRegion = {
      ...updatedSchool,
      regionName: region ? region.name : '未知区域'
    };
    
    return HttpResponse.json(schoolWithRegion);
  }),
  
  // 删除学校
  http.delete('*/api/superadmin/schools/:id', async ({ params }) => {
    const { id } = params;
    console.log('处理删除学校请求, ID:', id);
    await delay(300);
    
    // 验证学校是否存在
    const school = db.school.findFirst({
      where: {
        id: {
          equals: String(id)
        }
      }
    });
    
    if (!school) {
      return HttpResponse.json(
        { message: '学校不存在', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // 检查是否有用户关联到此学校
    const relatedUsers = db.user.findMany({
      where: {
        school: {
          equals: school.name
        }
      }
    });
    
    if (relatedUsers.length > 0) {
      return HttpResponse.json(
        { 
          message: '该学校下存在用户，无法删除', 
          code: 'SCHOOL_HAS_USERS',
          users: relatedUsers.length 
        },
        { status: 400 }
      );
    }
    
    // 删除学校
    db.school.delete({
      where: {
        id: {
          equals: String(id)
        }
      }
    });
    
    // 保存数据库状态
    saveDb();
    
    return HttpResponse.json(
      { message: '学校删除成功', code: 'SUCCESS' },
      { status: 200 }
    );
  }),
  
  // 获取学校统计信息
  http.get('*/api/superadmin/schools/statistics', async () => {
    console.log('处理获取学校统计信息请求');
    await delay(200);
    
    const schools = db.school.getAll();
    const regions = db.region.getAll();
    
    // 按类型统计学校数量
    const schoolsByType: Record<string, number> = {};
    schools.forEach(school => {
      schoolsByType[school.type] = (schoolsByType[school.type] || 0) + 1;
    });
    
    // 按区域统计学校数量
    const schoolsByRegion: Record<string, number> = {};
    schools.forEach(school => {
      const regionName = regions.find(r => r.id === school.regionId)?.name || '未知区域';
      schoolsByRegion[regionName] = (schoolsByRegion[regionName] || 0) + 1;
    });
    
    // 按状态统计学校数量
    const activeSchools = schools.filter(s => s.status).length;
    const inactiveSchools = schools.filter(s => !s.status).length;
    
    return HttpResponse.json({
      total: schools.length,
      byType: schoolsByType,
      byRegion: schoolsByRegion,
      active: activeSchools,
      inactive: inactiveSchools
    });
  })
]; 
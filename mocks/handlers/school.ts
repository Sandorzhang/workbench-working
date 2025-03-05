import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { School, SchoolType } from '../../lib/api-types';

// 定义学校数据类型
interface SchoolData {
  id?: string;
  name: string;
  code: string; // 3位数字代码
  regionId: string;
  type: string; // 学校类型/教育级别
  grades: string[]; // 年级数组
  status: boolean;
}

export const schoolHandlers = [
  // 获取学校列表
  http.get('*/api/schools', async ({ request }) => {
    await delay(300);
    
    // 解析查询参数
    const url = new URL(request.url);
    const regionId = url.searchParams.get('regionId');
    const type = url.searchParams.get('type');
    const status = url.searchParams.get('status');
    
    // 根据查询参数过滤学校
    let schools = db.school.getAll();
    
    if (regionId) {
      schools = schools.filter(school => school.regionId === regionId);
    }
    
    if (type) {
      schools = schools.filter(school => school.type === type);
    }
    
    if (status !== null) {
      const statusBool = status === 'true';
      schools = schools.filter(school => school.status === statusBool);
    }
    
    // 为每个学校添加区域名称
    const schoolsWithRegion = schools.map(school => {
      const region = db.region.findFirst({
        where: {
          id: {
            equals: school.regionId
          }
        }
      });
      
      return {
        ...school,
        regionName: region ? region.name : ''
      };
    });
    
    return HttpResponse.json({
      schools: schoolsWithRegion,
      total: schoolsWithRegion.length
    });
  }),
  
  // 获取单个学校
  http.get('*/api/schools/:id', async ({ params }) => {
    await delay(200);
    const { id } = params;
    const school = db.school.findFirst({
      where: {
        id: {
          equals: String(id),
        },
      },
    });
    
    if (!school) {
      return HttpResponse.json(
        { message: '学校不存在', code: '404' },
        { status: 404 }
      );
    }
    
    // 获取区域名称
    const region = db.region.findFirst({
      where: {
        id: {
          equals: school.regionId
        }
      }
    });
    
    const schoolWithRegion = {
      ...school,
      regionName: region ? region.name : ''
    };
    
    return HttpResponse.json(schoolWithRegion);
  }),
  
  // 创建学校
  http.post('*/api/schools', async ({ request }) => {
    await delay(300);
    const data = await request.json() as SchoolData;
    
    // 验证必填字段
    if (!data.name || !data.code || !data.regionId || !data.type || !Array.isArray(data.grades)) {
      return HttpResponse.json(
        { message: '缺少必要的学校信息', code: '400' },
        { status: 400 }
      );
    }
    
    // 验证学校代码是否为3位数字
    if (!/^\d{3}$/.test(data.code)) {
      return HttpResponse.json(
        { message: '学校代码必须是3位数字', code: '400' },
        { status: 400 }
      );
    }
    
    // 验证区域存在
    const region = db.region.findFirst({
      where: {
        id: {
          equals: data.regionId,
        },
      },
    });
    
    if (!region) {
      return HttpResponse.json(
        { message: '所选区域不存在', code: '404' },
        { status: 404 }
      );
    }
    
    // 验证学校名称唯一性
    const existingName = db.school.findFirst({
      where: {
        name: {
          equals: data.name,
        },
      },
    });
    
    if (existingName) {
      return HttpResponse.json(
        { message: '学校名称已存在', code: '409' },
        { status: 409 }
      );
    }
    
    // 验证学校代码唯一性
    const existingCode = db.school.findFirst({
      where: {
        code: {
          equals: data.code,
        },
      },
    });
    
    if (existingCode) {
      return HttpResponse.json(
        { message: '学校代码已存在', code: '409' },
        { status: 409 }
      );
    }
    
    // 创建学校
    const newSchool = db.school.create({
      // 系统生成ID (或使用自定义ID如果提供)
      id: data.id || String(db.school.getAll().length + 1),
      name: data.name,
      code: data.code,
      regionId: data.regionId,
      type: data.type,
      grades: data.grades,
      status: data.status !== undefined ? data.status : true,
      createdAt: new Date().toISOString()
    });
    
    // 获取区域名称
    const schoolWithRegion = {
      ...newSchool,
      regionName: region.name
    };
    
    return HttpResponse.json(schoolWithRegion, { status: 201 });
  }),
  
  // 更新学校
  http.put('*/api/schools/:id', async ({ params, request }) => {
    await delay(300);
    const { id } = params;
    const data = await request.json() as Partial<SchoolData>;
    
    // 验证学校是否存在
    const school = db.school.findFirst({
      where: {
        id: {
          equals: String(id),
        },
      },
    });
    
    if (!school) {
      return HttpResponse.json(
        { message: '学校不存在', code: '404' },
        { status: 404 }
      );
    }
    
    // 如果更新了学校代码，验证格式和唯一性
    if (data.code) {
      if (!/^\d{3}$/.test(data.code)) {
        return HttpResponse.json(
          { message: '学校代码必须是3位数字', code: '400' },
          { status: 400 }
        );
      }
      
      if (data.code !== school.code) {
        const existingCode = db.school.findFirst({
          where: {
            code: {
              equals: data.code,
            },
          },
        });
        
        if (existingCode) {
          return HttpResponse.json(
            { message: '学校代码已存在', code: '409' },
            { status: 409 }
          );
        }
      }
    }
    
    // 如果更新了学校名称，验证唯一性
    if (data.name && data.name !== school.name) {
      const existingName = db.school.findFirst({
        where: {
          name: {
            equals: data.name,
          },
        },
      });
      
      if (existingName) {
        return HttpResponse.json(
          { message: '学校名称已存在', code: '409' },
          { status: 409 }
        );
      }
    }
    
    // 如果更新了区域，验证区域存在
    if (data.regionId && data.regionId !== school.regionId) {
      const region = db.region.findFirst({
        where: {
          id: {
            equals: data.regionId,
          },
        },
      });
      
      if (!region) {
        return HttpResponse.json(
          { message: '所选区域不存在', code: '404' },
          { status: 404 }
        );
      }
    }
    
    // 更新学校
    const updatedSchool = db.school.update({
      where: {
        id: {
          equals: String(id),
        },
      },
      data: {
        name: data.name !== undefined ? data.name : school.name,
        code: data.code !== undefined ? data.code : school.code,
        regionId: data.regionId !== undefined ? data.regionId : school.regionId,
        type: data.type !== undefined ? data.type : school.type,
        grades: data.grades !== undefined ? data.grades : school.grades,
        status: data.status !== undefined ? data.status : school.status
      },
    });
    
    if (!updatedSchool) {
      return HttpResponse.json(
        { message: '更新学校失败', code: '500' },
        { status: 500 }
      );
    }
    
    // 获取区域名称
    const region = db.region.findFirst({
      where: {
        id: {
          equals: updatedSchool.regionId
        }
      }
    });
    
    const schoolWithRegion = {
      ...updatedSchool,
      regionName: region ? region.name : ''
    };
    
    return HttpResponse.json(schoolWithRegion);
  }),
  
  // 删除学校
  http.delete('*/api/schools/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    
    // 验证学校是否存在
    const school = db.school.findFirst({
      where: {
        id: {
          equals: String(id),
        },
      },
    });
    
    if (!school) {
      return HttpResponse.json(
        { message: '学校不存在', code: '404' },
        { status: 404 }
      );
    }
    
    // 删除学校
    db.school.delete({
      where: {
        id: {
          equals: String(id),
        },
      },
    });
    
    return new HttpResponse(null, { status: 204 });
  }),
  
  // 获取所有学校类型（教育级别）选项
  http.get('*/api/school-types', async () => {
    await delay(100);
    // 从SchoolType枚举中获取所有值
    return HttpResponse.json(Object.values(SchoolType));
  }),
  
  // 获取年级选项
  http.get('*/api/school-grades', async ({ request }) => {
    await delay(100);
    
    // 解析查询参数
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    // 根据学校类型返回不同的年级选项
    let grades: string[] = [];
    
    switch (type) {
      case SchoolType.PRIMARY_SIX:
        grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
        break;
      case SchoolType.PRIMARY_FIVE:
        grades = ['一年级', '二年级', '三年级', '四年级', '五年级'];
        break;
      case SchoolType.MIDDLE_THREE:
        grades = ['初一', '初二', '初三'];
        break;
      case SchoolType.MIDDLE_FOUR:
        grades = ['初一', '初二', '初三', '初四'];
        break;
      case SchoolType.HIGH_THREE:
        grades = ['高一', '高二', '高三'];
        break;
      case SchoolType.NINE_YEAR:
        grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三'];
        break;
      case SchoolType.COMPLETE_SIX:
        grades = ['初一', '初二', '初三', '高一', '高二', '高三'];
        break;
      case SchoolType.COMPLETE_SEVEN:
        grades = ['初一', '初二', '初三', '初四', '高一', '高二', '高三'];
        break;
      case SchoolType.TWELVE_YEAR:
        grades = [
          '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
          '初一', '初二', '初三',
          '高一', '高二', '高三'
        ];
        break;
      default:
        grades = [
          '一年级', '二年级', '三年级', '四年级', '五年级', '六年级',
          '初一', '初二', '初三',
          '高一', '高二', '高三'
        ];
    }
    
    return HttpResponse.json(grades);
  }),
]; 
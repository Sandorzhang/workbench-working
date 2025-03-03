import { http, HttpResponse } from 'msw';
import { db } from '../db';

// 定义学业标准处理程序
export const academicStandardsHandlers = [
  // 获取学科列表
  http.get('/api/academic-standards/subjects', () => {
    console.log('📝 GET /api/academic-standards/subjects - 请求学科列表');
    
    try {
      const subjects = db.subject.getAll();
      console.log(`✅ GET /api/academic-standards/subjects - 成功返回 ${subjects.length} 个学科`);
      return HttpResponse.json(subjects);
    } catch (error) {
      console.error('❌ GET /api/academic-standards/subjects - 获取学科列表失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取学科列表失败' }), 
        { status: 500 }
      );
    }
  }),
  
  // 获取学业标准列表
  http.get('/api/academic-standards', ({ request }) => {
    const url = new URL(request.url);
    const subject = url.searchParams.get('subject');
    const category = url.searchParams.get('category') || 'competencies';
    const grade = url.searchParams.get('grade');
    const search = url.searchParams.get('search');
    
    console.log(`📝 GET /api/academic-standards - 请求学业标准列表 (subject=${subject}, category=${category}, grade=${grade}, search=${search})`);
    
    try {
      let standards = db.academicStandard.findMany({
        where: {
          subject: {
            equals: subject || undefined,
          },
          category: {
            equals: category,
          },
          ...(grade ? {
            grade: {
              equals: grade,
            }
          } : {}),
          ...(search ? {
            title: {
              contains: search,
            }
          } : {})
        }
      });

      console.log(`✅ GET /api/academic-standards - 成功返回 ${standards.length} 条标准`);
      return HttpResponse.json(standards);
    } catch (error) {
      console.error('❌ GET /api/academic-standards - 获取学业标准列表失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取学业标准列表失败' }), 
        { status: 500 }
      );
    }
  }),
  
  // 获取导航数据（按学科和年级分组的标准列表）
  http.get('/api/academic-standards/navigation', ({ request }) => {
    const url = new URL(request.url);
    const subject = url.searchParams.get('subject') || 'math';
    
    console.log(`📝 GET /api/academic-standards/navigation - 请求导航数据 (subject=${subject})`);
    
    try {
      // 获取指定学科的所有标准
      const standards = db.academicStandard.findMany({
        where: {
          subject: {
            equals: subject,
          },
        },
      });
      
      // 获取指定学科的所有标准详情
      const standardDetails = db.standardDetail.getAll();
      
      // 按年级分组
      const grades = [...new Set(standards.map(standard => standard.grade))]; // 获取所有不重复的年级
      
      const navigationData = grades.map(grade => {
        // 筛选该年级的标准
        const gradeStandards = standards.filter(standard => standard.grade === grade);
        
        // 将标准转换为导航项
        const items = gradeStandards.map(standard => ({
          id: standard.id,
          title: standard.title,
          type: standard.category === 'competencies' ? 'standard' : 'domain',
          grade: standard.grade,
          code: standard.id.split('-')[0], // 简化，实际情况可能需要更复杂的逻辑
        }));
        
        return {
          grade,
          items,
        };
      });
      
      console.log(`✅ GET /api/academic-standards/navigation - 成功返回 ${navigationData.length} 个年级分组`);
      return HttpResponse.json(navigationData);
    } catch (error) {
      console.error('❌ GET /api/academic-standards/navigation - 获取导航数据失败:', error);
      return new HttpResponse(
        JSON.stringify({ error: '获取导航数据失败' }), 
        { status: 500 }
      );
    }
  }),
  
  // 获取学业标准详情
  http.get('/api/academic-standards/:id', ({ params }) => {
    const { id } = params;
    console.log(`📝 GET /api/academic-standards/${id} - 请求标准详情`);
    
    try {
      const standard = db.academicStandard.findFirst({
        where: {
          id: {
            equals: id as string,
          },
        },
      });
      
      if (!standard) {
        console.log(`❌ GET /api/academic-standards/${id} - 未找到标准`);
        return new HttpResponse(null, { status: 404 });
      }
      
      // 获取标准详情列表
      const standardDetails = db.standardDetail.findMany({
        where: {
          standardId: {
            equals: id as string,
          },
        },
      });
      
      // 获取学科名称
      const subject = db.subject.findFirst({
        where: {
          id: {
            equals: standard.subject,
          },
        },
      });
      
      // 为标准详情创建概念图谱数据
      // 注意：这里简化处理，实际项目中可能需要从数据库获取更复杂的图谱数据
      const conceptMap = {
        nodes: [
          { id: 'core', label: standard.title, type: 'core' },
          ...standardDetails.map((detail, index) => ({
            id: detail.id,
            label: detail.content.length > 15 ? detail.content.substring(0, 15) + '...' : detail.content,
            type: detail.type === 'knowledge' ? 'knowledge' : 
                  detail.type === 'skill' ? 'skill' : 'concept',
            level: Math.floor(index / 3) + 1 // 简单分配层级
          })),
        ],
        links: standardDetails.map(detail => ({
          source: 'core',
          target: detail.id,
        })),
      };
      
      // 将标准详情转换为目标
      const objectives = standardDetails.map(detail => ({
        id: detail.id,
        content: detail.content,
        type: detail.type,
        code: detail.id.split('-').pop() || 'C1', // 简化的代码生成
      }));
      
      const result = {
        ...standard,
        subjectName: subject?.name || '未知',
        code: standard.id,
        domain: standard.category === 'competencies' ? '核心素养' : '领域主题',
        objectives,
        conceptMap,
      };
      
      console.log(`✅ GET /api/academic-standards/${id} - 成功返回标准详情: ${standard.title}`);
      return HttpResponse.json(result);
    } catch (error) {
      console.error(`❌ GET /api/academic-standards/${id} - 获取标准详情失败:`, error);
      return new HttpResponse(
        JSON.stringify({ error: '获取标准详情失败' }), 
        { status: 500 }
      );
    }
  }),
]; 
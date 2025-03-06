import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';
import { IndicatorItem, EvaluationLevel } from '@/components/mentor-system/student-evaluation';

// 模拟三级指标评价数据
const evaluationIndicators: IndicatorItem[] = [
  // 1. 基础领域素养（6项）
  // 语言素养
  {
    id: 'lang-1',
    code: 'L1.1',
    name: '阅读理解能力',
    description: '理解、分析和评价各类文本的能力',
    category: '基础领域素养',
    subcategory: '语言素养',
    currentLevel: 'good'
  },
  {
    id: 'lang-2',
    code: 'L1.2',
    name: '书面与口语表达能力',
    description: '清晰准确地进行书面和口头交流的能力',
    category: '基础领域素养',
    subcategory: '语言素养',
    currentLevel: 'average'
  },
  {
    id: 'lang-3',
    code: 'L1.3',
    name: '跨语言文化沟通',
    description: '在不同语言和文化背景下有效沟通的能力',
    category: '基础领域素养',
    subcategory: '语言素养',
    currentLevel: 'needs-improvement'
  },
  
  // 数学素养
  {
    id: 'math-1',
    code: 'M1.1',
    name: '逻辑推理与抽象思维',
    description: '运用逻辑思维解决抽象问题的能力',
    category: '基础领域素养',
    subcategory: '数学素养',
    currentLevel: 'excellent'
  },
  {
    id: 'math-2',
    code: 'M1.2',
    name: '数据运算与分析能力',
    description: '进行数学运算和数据分析的能力',
    category: '基础领域素养',
    subcategory: '数学素养',
    currentLevel: 'good'
  },
  {
    id: 'math-3',
    code: 'M1.3',
    name: '数学模型应用',
    description: '应用数学模型解决实际问题的能力',
    category: '基础领域素养',
    subcategory: '数学素养',
    currentLevel: 'average'
  },
  
  // 科技素养
  {
    id: 'tech-1',
    code: 'T1.1',
    name: '科学探究方法',
    description: '运用科学方法进行探究和实验的能力',
    category: '基础领域素养',
    subcategory: '科技素养',
    currentLevel: 'good'
  },
  {
    id: 'tech-2',
    code: 'T1.2',
    name: '技术工具操作能力',
    description: '使用各类技术工具解决问题的能力',
    category: '基础领域素养',
    subcategory: '科技素养',
    currentLevel: 'excellent'
  },
  {
    id: 'tech-3',
    code: 'T1.3',
    name: '科技伦理意识',
    description: '对科技应用的伦理问题的认识和判断能力',
    category: '基础领域素养',
    subcategory: '科技素养',
    currentLevel: 'average'
  },
  
  // 人文与社会素养
  {
    id: 'human-1',
    code: 'H1.1',
    name: '历史脉络理解',
    description: '理解历史发展脉络及其对现实影响的能力',
    category: '基础领域素养',
    subcategory: '人文与社会素养',
    currentLevel: 'good'
  },
  {
    id: 'human-2',
    code: 'H1.2',
    name: '社会制度认知',
    description: '理解各类社会制度及其功能的能力',
    category: '基础领域素养',
    subcategory: '人文与社会素养',
    currentLevel: 'average'
  },
  {
    id: 'human-3',
    code: 'H1.3',
    name: '道德价值判断',
    description: '基于伦理道德进行价值判断的能力',
    category: '基础领域素养',
    subcategory: '人文与社会素养',
    currentLevel: 'needs-improvement'
  },
  
  // 艺术（审美）素养
  {
    id: 'art-1',
    code: 'A1.1',
    name: '艺术形式鉴赏',
    description: '对各类艺术形式进行审美鉴赏的能力',
    category: '基础领域素养',
    subcategory: '艺术（审美）素养',
    currentLevel: 'average'
  },
  {
    id: 'art-2',
    code: 'A1.2',
    name: '创意表达实践',
    description: '通过艺术形式进行创意表达的能力',
    category: '基础领域素养',
    subcategory: '艺术（审美）素养',
    currentLevel: 'good'
  },
  {
    id: 'art-3',
    code: 'A1.3',
    name: '美学批判思维',
    description: '从美学角度进行批判性思考的能力',
    category: '基础领域素养',
    subcategory: '艺术（审美）素养',
    currentLevel: 'needs-improvement'
  },
  
  // 运动与健康素养
  {
    id: 'health-1',
    code: 'P1.1',
    name: '生理健康管理',
    description: '管理个人生理健康的知识和能力',
    category: '基础领域素养',
    subcategory: '运动与健康素养',
    currentLevel: 'good'
  },
  {
    id: 'health-2',
    code: 'P1.2',
    name: '运动技能发展',
    description: '发展各类运动技能和体能的能力',
    category: '基础领域素养',
    subcategory: '运动与健康素养',
    currentLevel: 'excellent'
  },
  {
    id: 'health-3',
    code: 'P1.3',
    name: '心理健康维护',
    description: '维护个人心理健康的知识和能力',
    category: '基础领域素养',
    subcategory: '运动与健康素养',
    currentLevel: 'average'
  },
  
  // 2. 新兴领域素养（3项）
  // 信息素养
  {
    id: 'info-1',
    code: 'I2.1',
    name: '信息检索与筛选',
    description: '有效检索、筛选和评估信息的能力',
    category: '新兴领域素养',
    subcategory: '信息素养',
    currentLevel: 'excellent'
  },
  {
    id: 'info-2',
    code: 'I2.2',
    name: '数字内容创作',
    description: '创作各类数字内容的能力',
    category: '新兴领域素养',
    subcategory: '信息素养',
    currentLevel: 'good'
  },
  {
    id: 'info-3',
    code: 'I2.3',
    name: '网络安全与隐私保护',
    description: '保护网络安全和个人隐私的意识和能力',
    category: '新兴领域素养',
    subcategory: '信息素养',
    currentLevel: 'average'
  },
  
  // 环境素养
  {
    id: 'env-1',
    code: 'E2.1',
    name: '生态危机认知',
    description: '理解环境问题和生态危机的能力',
    category: '新兴领域素养',
    subcategory: '环境素养',
    currentLevel: 'good'
  },
  {
    id: 'env-2',
    code: 'E2.2',
    name: '可持续行为实践',
    description: '采取可持续发展行为的能力',
    category: '新兴领域素养',
    subcategory: '环境素养',
    currentLevel: 'average'
  },
  {
    id: 'env-3',
    code: 'E2.3',
    name: '环保技术创新',
    description: '应用和创新环保技术的能力',
    category: '新兴领域素养',
    subcategory: '环境素养',
    currentLevel: 'needs-improvement'
  },
  
  // 财商素养
  {
    id: 'fin-1',
    code: 'F2.1',
    name: '财务规划能力',
    description: '进行个人财务规划和管理的能力',
    category: '新兴领域素养',
    subcategory: '财商素养',
    currentLevel: 'average'
  },
  {
    id: 'fin-2',
    code: 'F2.2',
    name: '投资风险评估',
    description: '评估投资风险和制定投资策略的能力',
    category: '新兴领域素养',
    subcategory: '财商素养',
    currentLevel: 'needs-improvement'
  },
  {
    id: 'fin-3',
    code: 'F2.3',
    name: '经济伦理意识',
    description: '在经济活动中保持伦理意识的能力',
    category: '新兴领域素养',
    subcategory: '财商素养',
    currentLevel: 'good'
  },
  
  // 3. 高阶认知（3项）
  // 批判性思维
  {
    id: 'crit-1',
    code: 'C3.1',
    name: '逻辑漏洞识别',
    description: '识别论证中逻辑漏洞的能力',
    category: '高阶认知',
    subcategory: '批判性思维',
    currentLevel: 'excellent'
  },
  {
    id: 'crit-2',
    code: 'C3.2',
    name: '多视角证据分析',
    description: '从多角度分析和评估证据的能力',
    category: '高阶认知',
    subcategory: '批判性思维',
    currentLevel: 'good'
  },
  {
    id: 'crit-3',
    code: 'C3.3',
    name: '系统性反思能力',
    description: '对思维过程进行系统性反思的能力',
    category: '高阶认知',
    subcategory: '批判性思维',
    currentLevel: 'average'
  },
  
  // 创造性与问题解决
  {
    id: 'creat-1',
    code: 'P3.1',
    name: '发散性思维训练',
    description: '运用发散思维产生创新想法的能力',
    category: '高阶认知',
    subcategory: '创造性与问题解决',
    currentLevel: 'good'
  },
  {
    id: 'creat-2',
    code: 'P3.2',
    name: '原型设计与迭代',
    description: '设计原型并进行迭代改进的能力',
    category: '高阶认知',
    subcategory: '创造性与问题解决',
    currentLevel: 'excellent'
  },
  {
    id: 'creat-3',
    code: 'P3.3',
    name: '复杂问题拆解策略',
    description: '将复杂问题拆解并系统解决的能力',
    category: '高阶认知',
    subcategory: '创造性与问题解决',
    currentLevel: 'average'
  },
  
  // 学会学习与终身学习
  {
    id: 'learn-1',
    code: 'L3.1',
    name: '元认知监控',
    description: '对自身学习过程进行监控和调整的能力',
    category: '高阶认知',
    subcategory: '学会学习与终身学习',
    currentLevel: 'good'
  },
  {
    id: 'learn-2',
    code: 'L3.2',
    name: '知识迁移技巧',
    description: '将知识迁移应用到新情境的能力',
    category: '高阶认知',
    subcategory: '学会学习与终身学习',
    currentLevel: 'average'
  },
  {
    id: 'learn-3',
    code: 'L3.3',
    name: '自主学习体系构建',
    description: '构建个人化自主学习体系的能力',
    category: '高阶认知',
    subcategory: '学会学习与终身学习',
    currentLevel: 'needs-improvement'
  },
  
  // 4. 个人成长（2项）
  // 自我认识与自我调控
  {
    id: 'self-1',
    code: 'S4.1',
    name: '情绪管理技术',
    description: '识别和管理情绪的技术和能力',
    category: '个人成长',
    subcategory: '自我认识与自我调控',
    currentLevel: 'good'
  },
  {
    id: 'self-2',
    code: 'S4.2',
    name: '优势与短板分析',
    description: '分析个人优势和短板的能力',
    category: '个人成长',
    subcategory: '自我认识与自我调控',
    currentLevel: 'excellent'
  },
  {
    id: 'self-3',
    code: 'S4.3',
    name: '成长型心智培养',
    description: '培养成长型思维方式的能力',
    category: '个人成长',
    subcategory: '自我认识与自我调控',
    currentLevel: 'average'
  },
  
  // 人生规划与幸福生活
  {
    id: 'life-1',
    code: 'L4.1',
    name: '价值观澄清',
    description: '明确个人价值观并据此做出决策的能力',
    category: '个人成长',
    subcategory: '人生规划与幸福生活',
    currentLevel: 'good'
  },
  {
    id: 'life-2',
    code: 'L4.2',
    name: '生涯路径设计',
    description: '规划个人生涯发展路径的能力',
    category: '个人成长',
    subcategory: '人生规划与幸福生活',
    currentLevel: 'average'
  },
  {
    id: 'life-3',
    code: 'L4.3',
    name: '幸福感知力提升',
    description: '提升个人幸福感和生活质量的能力',
    category: '个人成长',
    subcategory: '人生规划与幸福生活',
    currentLevel: 'needs-improvement'
  },
  
  // 5. 社会性发展（5项）
  // 沟通与合作
  {
    id: 'comm-1',
    code: 'C5.1',
    name: '非语言符号解读',
    description: '理解和运用非语言沟通符号的能力',
    category: '社会性发展',
    subcategory: '沟通与合作',
    currentLevel: 'good'
  },
  {
    id: 'comm-2',
    code: 'C5.2',
    name: '跨角色协商技巧',
    description: '在不同角色间进行有效协商的能力',
    category: '社会性发展',
    subcategory: '沟通与合作',
    currentLevel: 'average'
  },
  {
    id: 'comm-3',
    code: 'C5.3',
    name: '团队目标对齐策略',
    description: '促进团队成员目标一致的能力',
    category: '社会性发展',
    subcategory: '沟通与合作',
    currentLevel: 'excellent'
  },
  
  // 领导力
  {
    id: 'lead-1',
    code: 'L5.1',
    name: '愿景塑造能力',
    description: '为团队或组织提出清晰愿景的能力',
    category: '社会性发展',
    subcategory: '领导力',
    currentLevel: 'good'
  },
  {
    id: 'lead-2',
    code: 'L5.2',
    name: '资源整合与分配',
    description: '有效整合和分配资源的能力',
    category: '社会性发展',
    subcategory: '领导力',
    currentLevel: 'average'
  },
  {
    id: 'lead-3',
    code: 'L5.3',
    name: '变革推动执行力',
    description: '推动变革并确保执行的能力',
    category: '社会性发展',
    subcategory: '领导力',
    currentLevel: 'needs-improvement'
  },
  
  // 文化理解与传承
  {
    id: 'cult-1',
    code: 'U5.1',
    name: '文化遗产解码',
    description: '理解和解读文化遗产的能力',
    category: '社会性发展',
    subcategory: '文化理解与传承',
    currentLevel: 'good'
  },
  {
    id: 'cult-2',
    code: 'U5.2',
    name: '传统技艺实践',
    description: '学习和实践传统技艺的能力',
    category: '社会性发展',
    subcategory: '文化理解与传承',
    currentLevel: 'average'
  },
  {
    id: 'cult-3',
    code: 'U5.3',
    name: '文化创新转化',
    description: '创新性转化传统文化的能力',
    category: '社会性发展',
    subcategory: '文化理解与传承',
    currentLevel: 'excellent'
  },
  
  // 跨文化与国际理解
  {
    id: 'cross-1',
    code: 'I5.1',
    name: '文化差异敏感性',
    description: '识别和理解文化差异的能力',
    category: '社会性发展',
    subcategory: '跨文化与国际理解',
    currentLevel: 'good'
  },
  {
    id: 'cross-2',
    code: 'I5.2',
    name: '全球议题认知',
    description: '理解全球重要议题的能力',
    category: '社会性发展',
    subcategory: '跨文化与国际理解',
    currentLevel: 'average'
  },
  {
    id: 'cross-3',
    code: 'I5.3',
    name: '国际协作规则掌握',
    description: '掌握国际合作规则的能力',
    category: '社会性发展',
    subcategory: '跨文化与国际理解',
    currentLevel: 'needs-improvement'
  },
  
  // 公民责任与社会参与
  {
    id: 'civ-1',
    code: 'R5.1',
    name: '公共政策分析',
    description: '分析和理解公共政策的能力',
    category: '社会性发展',
    subcategory: '公民责任与社会参与',
    currentLevel: 'good'
  },
  {
    id: 'civ-2',
    code: 'R5.2',
    name: '社区服务实践',
    description: '参与社区服务和贡献的能力',
    category: '社会性发展',
    subcategory: '公民责任与社会参与',
    currentLevel: 'excellent'
  },
  {
    id: 'civ-3',
    code: 'R5.3',
    name: '社会正义倡导能力',
    description: '倡导社会正义和平等的能力',
    category: '社会性发展',
    subcategory: '公民责任与社会参与',
    currentLevel: 'average'
  }
];

// 学生评价数据存储
const studentEvaluations: Record<string, IndicatorItem[]> = {};

// 处理程序导出
export const studentEvaluationHandlers = [
  // 获取学生评价指标
  http.get('/api/mentor/student-evaluation/:studentId', async ({ params }) => {
    const { studentId } = params;
    console.log(`获取学生(${studentId})评价指标请求`);
    
    // 模拟网络延迟
    await delay(500);
    
    // 如果学生已有评价数据，则返回已有数据
    if (studentEvaluations[studentId as string]) {
      return HttpResponse.json({
        indicators: studentEvaluations[studentId as string]
      });
    }
    
    // 否则返回默认指标数据（未评价状态）
    return HttpResponse.json({
      indicators: evaluationIndicators.map(indicator => ({
        ...indicator,
        currentLevel: 'not-evaluated' // 重置为未评价状态
      }))
    });
  }),
  
  // 保存学生评价
  http.post('/api/mentor/student-evaluation/:studentId', async ({ request, params }) => {
    const { studentId } = params;
    const requestData = await request.json();
    console.log(`保存学生(${studentId})评价请求`, requestData);
    
    // 模拟网络延迟
    await delay(800);
    
    // 类型断言确保数据正确
    const data = requestData as { indicators: IndicatorItem[] };
    
    // 保存评价数据
    studentEvaluations[studentId as string] = data.indicators;
    
    return HttpResponse.json({
      success: true,
      message: '学生评价已保存'
    });
  })
]; 
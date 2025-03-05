import { http, HttpResponse } from 'msw';

// 定义数据类型
interface CompetencyDimension {
  id: string;
  name: string;
  color: string;
  level: 1; // 第一级维度
  children: CompetencySubDimension[];
}

interface CompetencySubDimension {
  id: string;
  name: string;
  color: string;
  level: 2; // 第二级维度
  parentId: string;
  progress: number; // 0-100
  status: 'completed' | 'in-progress' | 'pending';
  children: CompetencyThirdDimension[];
  isAdvanced?: boolean; // 特殊标记，带*的项
}

interface CompetencyThirdDimension {
  id: string;
  name: string;
  color: string;
  level: 3; // 第三级维度
  parentId: string;
  progress: number; // 0-100
  status: 'completed' | 'in-progress' | 'pending';
  score?: number; // 可选的分数
}

// 保存在内存中的模拟数据
let mockCompetencies: CompetencyDimension[] = [
  {
    id: 'dim-1',
    name: '语言素养',
    color: '#4290f5',
    level: 1,
    children: [
      {
        id: 'sub-1-1',
        name: '阅读理解能力',
        color: '#4290f5',
        level: 2,
        parentId: 'dim-1',
        progress: 85,
        status: 'completed',
        children: [],
        isAdvanced: false
      },
      {
        id: 'sub-1-2',
        name: '文学鉴赏能力',
        color: '#4290f5',
        level: 2,
        parentId: 'dim-1',
        progress: 60,
        status: 'in-progress',
        children: [],
        isAdvanced: true
      }
    ]
  },
  {
    id: 'dim-2',
    name: '数学素养',
    color: '#42c6a3',
    level: 1,
    children: [
      {
        id: 'sub-2-1',
        name: '数学建模能力',
        color: '#42c6a3',
        level: 2,
        parentId: 'dim-2',
        progress: 75,
        status: 'in-progress',
        children: [],
        isAdvanced: false
      }
    ]
  },
  {
    id: 'dim-3',
    name: '科学素养',
    color: '#9966cc',
    level: 1,
    children: [
      {
        id: 'sub-3-1',
        name: '科学思维',
        color: '#9966cc',
        level: 2,
        parentId: 'dim-3',
        progress: 90,
        status: 'completed',
        children: [],
        isAdvanced: false
      },
      {
        id: 'sub-3-2',
        name: '实验探究能力',
        color: '#9966cc',
        level: 2,
        parentId: 'dim-3',
        progress: 45,
        status: 'in-progress',
        children: [],
        isAdvanced: false
      }
    ]
  },
  {
    id: 'dim-4',
    name: '社会情感素养',
    color: '#ff9966',
    level: 1,
    children: [
      {
        id: 'sub-4-1',
        name: '人际交往能力',
        color: '#ff9966',
        level: 2,
        parentId: 'dim-4',
        progress: 70,
        status: 'in-progress',
        children: [],
        isAdvanced: false
      }
    ]
  },
  {
    id: 'dim-5',
    name: '创新素养',
    color: '#f55c5c',
    level: 1,
    children: [
      {
        id: 'sub-5-1',
        name: '创造性思维',
        color: '#f55c5c',
        level: 2,
        parentId: 'dim-5',
        progress: 65,
        status: 'in-progress',
        children: [],
        isAdvanced: true
      },
      {
        id: 'sub-5-2',
        name: '问题解决能力',
        color: '#f55c5c',
        level: 2,
        parentId: 'dim-5',
        progress: 80,
        status: 'completed',
        children: [],
        isAdvanced: false
      }
    ]
  }
];

// 处理程序配置
export const testHandlers = [
  // 获取所有素养数据
  http.get('/api/test/competencies', () => {
    return HttpResponse.json(mockCompetencies);
  }),

  // 添加一级维度
  http.post('/api/test/competencies/primary', async ({ request }) => {
    try {
      const newDimension = await request.json() as CompetencyDimension;
      mockCompetencies = [...mockCompetencies, newDimension];
      return HttpResponse.json({
        success: true,
        message: 'Primary dimension added successfully',
        data: mockCompetencies
      });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        message: 'Failed to add primary dimension',
        error: String(error)
      }, { status: 400 });
    }
  }),

  // 添加二级维度
  http.post('/api/test/competencies/secondary', async ({ request }) => {
    try {
      const { primaryId, newSubDimension } = await request.json() as {
        primaryId: string;
        newSubDimension: CompetencySubDimension;
      };

      console.log('MSW received request to add secondary dimension:', { primaryId, newSubDimension });

      // 找到指定的一级维度
      const primaryIndex = mockCompetencies.findIndex(dim => dim.id === primaryId);
      
      if (primaryIndex === -1) {
        console.log('Primary dimension not found:', primaryId);
        return HttpResponse.json({
          success: false,
          message: 'Primary dimension not found'
        }, { status: 404 });
      }

      // 只添加到指定的一级维度下
      // 创建一个深拷贝以避免引用问题
      const updatedCompetencies = JSON.parse(JSON.stringify(mockCompetencies));
      
      // 添加二级维度到一级维度的children数组
      updatedCompetencies[primaryIndex].children.push(newSubDimension);
      
      // 更新全局变量
      mockCompetencies = updatedCompetencies;

      console.log('Secondary dimension added successfully');
      
      return HttpResponse.json({
        success: true,
        message: 'Secondary dimension added successfully',
        data: mockCompetencies
      });
    } catch (error) {
      console.error('Error in MSW handler:', error);
      return HttpResponse.json({
        success: false,
        message: 'Failed to add secondary dimension',
        error: String(error)
      }, { status: 400 });
    }
  }),

  // 添加三级维度
  http.post('/api/test/competencies/tertiary', async ({ request }) => {
    try {
      const { secondaryParentId, newTertiaryDimension } = await request.json() as {
        secondaryParentId: string;
        newTertiaryDimension: CompetencyThirdDimension;
      };

      // 查找父二级维度
      let found = false;
      
      for (let i = 0; i < mockCompetencies.length; i++) {
        const primaryDim = mockCompetencies[i];
        
        for (let j = 0; j < primaryDim.children.length; j++) {
          if (primaryDim.children[j].id === secondaryParentId) {
            // 找到了父二级维度
            mockCompetencies[i].children[j].children.push(newTertiaryDimension);
            found = true;
            break;
          }
        }
        
        if (found) break;
      }

      if (!found) {
        return HttpResponse.json({
          success: false,
          message: 'Secondary dimension not found'
        }, { status: 404 });
      }

      return HttpResponse.json({
        success: true,
        message: 'Tertiary dimension added successfully',
        data: mockCompetencies
      });
    } catch (error) {
      return HttpResponse.json({
        success: false,
        message: 'Failed to add tertiary dimension',
        error: String(error)
      }, { status: 400 });
    }
  }),

  // 重置数据
  http.post('/api/test/competencies/reset', () => {
    // 重置为初始状态
    mockCompetencies = [
      {
        id: 'dim-1',
        name: '语言素养',
        color: '#4290f5',
        level: 1,
        children: [
          {
            id: 'sub-1-1',
            name: '阅读理解能力',
            color: '#4290f5',
            level: 2,
            parentId: 'dim-1',
            progress: 85,
            status: 'completed',
            children: [],
            isAdvanced: false
          },
          {
            id: 'sub-1-2',
            name: '文学鉴赏能力',
            color: '#4290f5',
            level: 2,
            parentId: 'dim-1',
            progress: 60,
            status: 'in-progress',
            children: [],
            isAdvanced: true
          }
        ]
      },
      {
        id: 'dim-2',
        name: '数学素养',
        color: '#42c6a3',
        level: 1,
        children: [
          {
            id: 'sub-2-1',
            name: '数学建模能力',
            color: '#42c6a3',
            level: 2,
            parentId: 'dim-2',
            progress: 75,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          }
        ]
      },
      {
        id: 'dim-3',
        name: '科学素养',
        color: '#9966cc',
        level: 1,
        children: [
          {
            id: 'sub-3-1',
            name: '科学思维',
            color: '#9966cc',
            level: 2,
            parentId: 'dim-3',
            progress: 90,
            status: 'completed',
            children: [],
            isAdvanced: false
          },
          {
            id: 'sub-3-2',
            name: '实验探究能力',
            color: '#9966cc',
            level: 2,
            parentId: 'dim-3',
            progress: 45,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          }
        ]
      },
      {
        id: 'dim-4',
        name: '社会情感素养',
        color: '#ff9966',
        level: 1,
        children: [
          {
            id: 'sub-4-1',
            name: '人际交往能力',
            color: '#ff9966',
            level: 2,
            parentId: 'dim-4',
            progress: 70,
            status: 'in-progress',
            children: [],
            isAdvanced: false
          }
        ]
      },
      {
        id: 'dim-5',
        name: '创新素养',
        color: '#f55c5c',
        level: 1,
        children: [
          {
            id: 'sub-5-1',
            name: '创造性思维',
            color: '#f55c5c',
            level: 2,
            parentId: 'dim-5',
            progress: 65,
            status: 'in-progress',
            children: [],
            isAdvanced: true
          },
          {
            id: 'sub-5-2',
            name: '问题解决能力',
            color: '#f55c5c',
            level: 2,
            parentId: 'dim-5',
            progress: 80,
            status: 'completed',
            children: [],
            isAdvanced: false
          }
        ]
      }
    ];

    return HttpResponse.json({
      success: true,
      message: 'Data reset successfully',
      data: mockCompetencies
    });
  }),
]; 
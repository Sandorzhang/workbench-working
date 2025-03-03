import { http, HttpResponse, delay } from 'msw';
import { db } from '../db';

// 获取概念的响应类型
interface ConceptResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  targets: string[];
  subject: string;
  createdAt: string;
  updatedAt: string;
}

// 获取概念关系的响应类型
interface ConceptRelationResponse {
  id: string;
  sourceId: string;
  targetId: string;
  relationType: number;
  createdAt: string;
  updatedAt: string;
}

// 概念地图数据类型
interface ConceptMapResponse {
  nodes: {
    id: string;
    name: string;
    description: string;
    type: string;
    targets: string[];
    subject: string;
  }[];
  links: {
    id: string;
    source: string;
    target: string;
    relationType: number;
  }[];
}

// =========== 生成备选概念地图数据 ===========
// 生成随机ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// 学科列表
const subjects = ['数学', '物理', '化学', '生物'];

// 生成概念节点
const generateNodes = (subject: string, count: number): ConceptMapResponse['nodes'] => {
  const nodes: ConceptMapResponse['nodes'] = [];
  
  // 生成大概念 (20%)
  const bigConceptCount = Math.ceil(count * 0.2);
  for (let i = 0; i < bigConceptCount; i++) {
    nodes.push({
      id: `${subject}-big-${i}`,
      name: `${subject}大概念 ${i + 1}`,
      description: `这是${subject}学科的一个重要大概念，它包含多个相关的小概念。`,
      type: 'big',
      targets: ['知识', '能力', '情感'],
      subject
    });
  }
  
  // 生成小概念 (80%)
  const smallConceptCount = count - bigConceptCount;
  for (let i = 0; i < smallConceptCount; i++) {
    nodes.push({
      id: `${subject}-small-${i}`,
      name: `${subject}小概念 ${i + 1}`,
      description: `这是${subject}学科的一个具体小概念，它是大概念的一部分。`,
      type: 'small',
      targets: ['知识', '应用'],
      subject
    });
  }
  
  return nodes;
};

// 生成概念关系
const generateLinks = (nodes: ConceptMapResponse['nodes']): ConceptMapResponse['links'] => {
  const links: ConceptMapResponse['links'] = [];
  const bigConcepts = nodes.filter(node => node.type === 'big');
  const smallConcepts = nodes.filter(node => node.type === 'small');
  
  // 大概念之间的关系 (相互有少量连接)
  bigConcepts.forEach((source, i) => {
    const connectedCount = Math.min(2, bigConcepts.length - 1);
    for (let j = 0; j < connectedCount; j++) {
      const targetIndex = (i + j + 1) % bigConcepts.length;
      if (targetIndex !== i) {
        links.push({
          id: generateId(),
          source: source.id,
          target: bigConcepts[targetIndex].id,
          relationType: Math.floor(Math.random() * 12) + 1
        });
      }
    }
  });
  
  // 大概念到小概念的关系 (每个大概念连接多个小概念)
  bigConcepts.forEach(source => {
    // 每个大概念连接3-5个小概念
    const connectCount = Math.min(Math.floor(Math.random() * 3) + 3, smallConcepts.length);
    const shuffled = [...smallConcepts].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < connectCount; i++) {
      links.push({
        id: generateId(),
        source: source.id,
        target: shuffled[i].id,
        relationType: Math.floor(Math.random() * 12) + 1
      });
    }
  });
  
  // 小概念之间的关系 (少量相互连接)
  smallConcepts.forEach((source, i) => {
    if (Math.random() > 0.7) { // 30%概率建立连接
      const targetIndex = (i + 1) % smallConcepts.length;
      links.push({
        id: generateId(),
        source: source.id,
        target: smallConcepts[targetIndex].id,
        relationType: Math.floor(Math.random() * 12) + 1
      });
    }
  });
  
  return links;
};

// 预生成各学科的概念图数据
const generatedConceptMapData = {} as Record<string, ConceptMapResponse>;

subjects.forEach(subject => {
  const nodes = generateNodes(subject, 20);
  const links = generateLinks(nodes);
  generatedConceptMapData[subject] = { nodes, links };
});

// =========== 概念地图处理器 ===========

// 返回MSW数据库或生成数据
const getConceptMapData = (subject: string): ConceptMapResponse | null => {
  // 先尝试从MSW数据库获取数据
  const concepts = db.concept.findMany({
    where: {
      subject: {
        equals: subject,
      },
    },
  });
  
  if (concepts.length > 0) {
    // 获取概念ID列表
    const conceptIds = concepts.map(concept => concept.id);
    
    // 获取与这些概念相关的所有关系
    const relations = db.conceptRelation.findMany({
      where: {
        sourceId: {
          in: conceptIds,
        },
      },
    }).filter(relation => conceptIds.includes(relation.targetId));
    
    // 格式化响应数据
    return {
      nodes: concepts.map(concept => ({
        id: concept.id,
        name: concept.name,
        description: concept.description,
        type: concept.type,
        targets: concept.targets as string[],
        subject: concept.subject,
      })),
      links: relations.map(relation => ({
        id: relation.id,
        source: relation.sourceId,
        target: relation.targetId,
        relationType: relation.relationType,
      })),
    };
  }
  
  // 如果数据库中没有数据，返回生成的数据
  return generatedConceptMapData[subject] || null;
};

// 概念地图处理器
export const conceptMapHandlers = [
  // 获取所有概念
  http.get('*/api/concept-map/concepts', async ({ request }) => {
    await delay(500);
    
    // 解析URL查询参数
    const url = new URL(request.url);
    const subject = url.searchParams.get('subject');
    const type = url.searchParams.get('type');
    const target = url.searchParams.get('target');
    const search = url.searchParams.get('search');
    
    let concepts = db.concept.getAll();
    
    // 如果数据库中没有数据，使用生成的数据
    if (concepts.length === 0) {
      // 使用类型断言处理不匹配的类型
      return HttpResponse.json(
        Object.values(generatedConceptMapData).flatMap(data => 
          data.nodes.map(node => ({
            ...node,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        )
      );
    }
    
    // 根据查询参数过滤概念
    if (subject) {
      concepts = concepts.filter(concept => concept.subject === subject);
    }
    
    if (type) {
      concepts = concepts.filter(concept => concept.type === type);
    }
    
    if (target) {
      concepts = concepts.filter(concept => concept.targets.includes(target));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      concepts = concepts.filter(concept => 
        concept.name.toLowerCase().includes(searchLower) || 
        concept.description.toLowerCase().includes(searchLower)
      );
    }
    
    return HttpResponse.json(concepts);
  }),
  
  // 获取特定概念
  http.get('*/api/concept-map/concepts/:id', async ({ params }) => {
    await delay(300);
    
    const { id } = params;
    const concept = db.concept.findFirst({
      where: {
        id: {
          equals: id as string,
        },
      },
    });
    
    // 如果数据库中没有该概念，从生成的数据中查找
    if (!concept) {
      const generatedConcept = Object.values(generatedConceptMapData)
        .flatMap(data => data.nodes)
        .find(node => node.id === id);
      
      if (generatedConcept) {
        // 直接返回找到的生成概念
        return HttpResponse.json({
          ...generatedConcept,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      return new HttpResponse(
        JSON.stringify({ message: '概念不存在' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return HttpResponse.json(concept);
  }),
  
  // 获取所有概念关系
  http.get('*/api/concept-map/relations', async ({ request }) => {
    await delay(400);
    
    const url = new URL(request.url);
    const sourceId = url.searchParams.get('sourceId');
    const targetId = url.searchParams.get('targetId');
    const relationType = url.searchParams.get('relationType');
    
    let relations = db.conceptRelation.getAll();
    
    // 如果数据库中没有关系数据，使用生成的数据
    if (relations.length === 0) {
      // 使用类型断言处理不匹配的类型
      return HttpResponse.json(
        Object.values(generatedConceptMapData).flatMap(data => 
          data.links.map(link => ({
            id: link.id,
            sourceId: link.source,
            targetId: link.target,
            relationType: link.relationType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }))
        )
      );
    }
    
    if (sourceId) {
      relations = relations.filter(relation => relation.sourceId === sourceId);
    }
    
    if (targetId) {
      relations = relations.filter(relation => relation.targetId === targetId);
    }
    
    if (relationType) {
      relations = relations.filter(relation => relation.relationType === Number(relationType));
    }
    
    return HttpResponse.json(relations);
  }),
  
  // 获取特定学科的概念地图数据
  http.get('*/api/concept-map/:subject', async ({ params }) => {
    await delay(600);
    
    const { subject } = params;
    const data = getConceptMapData(subject as string);
    
    if (!data) {
      return new HttpResponse(
        JSON.stringify({ message: '未找到该学科的概念' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return HttpResponse.json(data);
  }),
  
  // 搜索概念
  http.get('*/api/concept-map/search', async ({ request }) => {
    await delay(400);
    
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    if (!query) {
      return new HttpResponse(
        JSON.stringify({ message: '搜索词不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const queryLower = query.toLowerCase();
    
    // 首先尝试从数据库中搜索
    let concepts = db.concept.findMany({
      where: {
        name: {
          contains: queryLower,
        },
      },
    });
    
    let descriptionMatches = db.concept.findMany({
      where: {
        description: {
          contains: queryLower,
        },
      },
    });
    
    // 如果数据库中没有搜索结果，从生成的数据中搜索
    if (concepts.length === 0 && descriptionMatches.length === 0) {
      const allGeneratedConcepts = Object.values(generatedConceptMapData).flatMap(data => data.nodes);
      
      // 直接返回生成的结果
      const nameMatches = allGeneratedConcepts.filter(concept => 
        concept.name.toLowerCase().includes(queryLower)
      );
      
      const descMatches = allGeneratedConcepts.filter(concept => 
        concept.description.toLowerCase().includes(queryLower) && 
        !nameMatches.some(c => c.id === concept.id)
      );
      
      const results = [...nameMatches, ...descMatches].map(concept => ({
        ...concept,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      return HttpResponse.json(results);
    }
    
    // 合并结果并去重
    const allResults = [...concepts];
    descriptionMatches.forEach(match => {
      if (!allResults.some(c => c.id === match.id)) {
        allResults.push(match);
      }
    });
    
    return HttpResponse.json(allResults);
  }),
]; 
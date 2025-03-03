import { Metadata } from 'next';
import ConceptMapClient from './client';

export const metadata: Metadata = {
  title: '大概念地图 | 教育工作台',
  description: '查看不同学科的概念节点和关系，了解知识体系结构',
};

export default function ConceptMapPage() {
  return <ConceptMapClient />;
} 
import { 
  School, 
  SchoolListResponse, 
  SchoolCreateRequest, 
  SchoolUpdateRequest, 
  SchoolResponse,
  SchoolType
} from '@/types/models/school';

/**
 * 获取所有学校列表
 * @param regionId 可选的区域ID筛选
 * @param type 可选的学校类型筛选
 * @returns 学校列表响应
 */
export async function getAllSchools(regionId?: string, type?: SchoolType): Promise<SchoolListResponse> {
  let url = '/api/schools';
  const params = new URLSearchParams();
  
  if (regionId) {
    params.append('regionId', regionId);
  }
  
  if (type) {
    params.append('type', type);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '获取学校数据失败');
  }
  
  return await response.json();
}

/**
 * 获取单个学校详情
 * @param id 学校ID
 * @returns 学校详情
 */
export async function getSchoolById(id: string): Promise<School> {
  const response = await fetch(`/api/schools/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `获取学校(ID: ${id})数据失败`);
  }
  
  const data = await response.json();
  return data.school;
}

/**
 * 创建学校
 * @param schoolData 学校创建数据
 * @returns 学校操作响应
 */
export async function createSchool(schoolData: SchoolCreateRequest): Promise<SchoolResponse> {
  const response = await fetch('/api/schools', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schoolData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '创建学校失败');
  }
  
  return await response.json();
}

/**
 * 更新学校
 * @param id 学校ID
 * @param schoolData 学校更新数据
 * @returns 学校操作响应
 */
export async function updateSchool(id: string, schoolData: SchoolUpdateRequest): Promise<SchoolResponse> {
  const response = await fetch(`/api/schools/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(schoolData),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `更新学校(ID: ${id})失败`);
  }
  
  return await response.json();
}

/**
 * 删除学校
 * @param id 学校ID
 * @returns 学校操作响应
 */
export async function deleteSchool(id: string): Promise<SchoolResponse> {
  const response = await fetch(`/api/schools/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `删除学校(ID: ${id})失败`);
  }
  
  return await response.json();
}

/**
 * 获取所有学校类型（枚举值）
 * @returns 学校类型列表
 */
export function getSchoolTypes(): { value: string; label: string }[] {
  return Object.entries(SchoolType).map(([, value]) => ({
    value: value,
    label: value,
  }));
} 
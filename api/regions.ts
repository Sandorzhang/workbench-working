import { 
  Region, 
  RegionListResponse, 
  RegionCreateRequest, 
  RegionUpdateRequest, 
  RegionResponse,
  RegionPageRequest,
  RegionPageResponse,
  SimpleApiResponse
} from '@/types/models/region';
import request from './request';

/**
 * 分页查询区域列表
 * @param params 分页查询参数
 * @returns 分页区域列表响应
 */
export async function getRegionsByPage(params: RegionPageRequest): Promise<RegionPageResponse> {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('pageNumber', params.pageNumber.toString());
    queryParams.append('pageSize', params.pageSize.toString());
    
    if (params.name) {
      queryParams.append('name', params.name);
    }
    
    if (params.status !== undefined) {
      queryParams.append('status', params.status.toString());
    }
    
    // 构建完整URL
    const url = `/api/regions/page?${queryParams.toString()}`;
    console.log('正在请求区域分页数据:', url);
    
    // 使用request模块发送请求
    const response = await request.get(url);
    console.log('区域分页数据响应:', response);
    
    // 确保响应符合RegionPageResponse类型
    if (response && typeof response === 'object' && 'code' in response && 'msg' in response && 'data' in response) {
      // 确保响应格式完全符合预期
      const typedResponse = response as unknown as RegionPageResponse;
      return typedResponse;
    }
    
    // 如果响应格式不匹配，构造标准格式
    return {
      code: "0",
      msg: "请求成功",
      data: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        totalPage: 0,
        totalCount: 0,
        list: response && typeof response === 'object' && 
              'data' in response && 
              typeof response.data === 'object' && 
              response.data !== null && 
              'list' in response.data && 
              Array.isArray(response.data.list) 
          ? response.data.list 
          : []
      }
    };
  } catch (error) {
    console.error('获取区域分页数据异常:', error);
    
    // 返回一个统一的错误响应格式，确保数据包裹在data字段中
    return {
      code: "500",
      msg: error instanceof Error ? error.message : '获取区域分页数据失败',
      data: {
        pageNumber: params.pageNumber,
        pageSize: params.pageSize,
        totalPage: 0,
        totalCount: 0,
        list: []
      }
    };
  }
}

/**
 * 获取所有区域列表
 * @returns 区域列表响应
 */
export async function getAllRegions(): Promise<RegionListResponse> {
  try {
    const response = await request.get('/api/regions');
    
    console.log('获取所有区域列表响应:', response);
    
    // 处理不同的响应格式
    if (response && typeof response === 'object') {
      // 如果是标准响应格式 { code, msg, data: { regions, total } }
      if ('code' in response && 'data' in response && typeof response.data === 'object') {
        return response.data as RegionListResponse;
      }
      
      // 如果响应本身就是 { regions, total }
      if ('regions' in response && 'total' in response) {
        return response as RegionListResponse;
      }
    }
    
    // 兜底处理，返回空数组
    return {
      regions: [],
      total: 0
    };
  } catch (error) {
    console.error('获取所有区域失败:', error);
    return {
      regions: [],
      total: 0
    };
  }
}

/**
 * 获取单个区域详情
 * @param id 区域ID
 * @returns 区域详情
 */
export async function getRegionById(id: string): Promise<Region> {
  try {
    const response = await request.get(`/api/regions/${id}`);
    // 适应response的数据结构
    if (response && typeof response === 'object') {
      // 如果是标准响应格式 { code, msg, data }
      if ('code' in response && 'data' in response && response.code === "0") {
        return response.data as Region;
      }
      // 如果响应本身就是Region
      if ('id' in response && 'name' in response && 'status' in response) {
        // 确保返回包含所有必须的字段
        const region: Region = {
          id: String(response.id),
          name: String(response.name),
          status: Boolean(response.status),
          createdAt: 'createdAt' in response && response.createdAt ? String(response.createdAt) : new Date().toISOString(),
          modifiedAt: 'modifiedAt' in response && response.modifiedAt ? String(response.modifiedAt) : new Date().toISOString()
        };
        return region;
      }
    }
    // 兜底处理
    throw new Error('区域数据格式不正确');
  } catch (error) {
    console.error(`获取区域(ID: ${id})详情失败:`, error);
    throw error; // 重新抛出异常，由调用者处理
  }
}

/**
 * 创建区域
 * @param regionData 区域创建数据
 * @returns 区域操作响应
 */
export async function createRegion(regionData: RegionCreateRequest): Promise<SimpleApiResponse> {
  try {
    console.log('创建区域，数据:', regionData);
    // 使用request模块发送请求
    const response = await request.post('/api/regions', regionData);
    console.log('创建区域响应:', response);
    
    // 确保返回格式符合SimpleApiResponse
    if (response && typeof response === 'object' && 'code' in response && 'msg' in response) {
      // 响应已经符合SimpleApiResponse格式
      return response as SimpleApiResponse;
    }
    
    // 如果响应不符合预期格式，构造一个标准响应
    return {
      code: "0",
      msg: "请求成功"
    };
  } catch (error) {
    console.error('创建区域失败:', error);
    // 返回错误响应
    return {
      code: "500",
      msg: error instanceof Error ? error.message : "创建区域失败"
    };
  }
}

/**
 * 更新区域
 * @param id 区域ID
 * @param regionData 区域更新数据
 * @returns 区域操作响应
 */
export async function updateRegion(id: string, regionData: RegionUpdateRequest): Promise<RegionResponse> {
  try {
    console.log(`更新区域(ID: ${id})，数据:`, regionData);
    // 使用request模块发送请求
    const response = await request.put(`/api/regions/${id}`, regionData);
    console.log(`更新区域(ID: ${id})响应:`, response);
    
    // 处理响应数据
    if (response && typeof response === 'object') {
      // 如果是标准API响应格式 { code, msg, data? }
      if ('code' in response && 'msg' in response) {
        return {
          success: response.code === "0",
          message: String(response.msg)
        };
      }
      
      // 如果response已经符合RegionResponse格式
      if ('success' in response) {
        return response as RegionResponse;
      }
    }
    
    // 默认返回成功响应
    return {
      success: true,
      message: "区域更新成功"
    };
  } catch (error) {
    console.error(`更新区域(ID: ${id})失败:`, error);
    // 返回错误响应
    return {
      success: false,
      message: error instanceof Error ? error.message : `更新区域(ID: ${id})失败`
    };
  }
}

/**
 * 删除区域
 * @param id 区域ID
 * @returns 区域操作响应
 */
export async function deleteRegion(id: string): Promise<RegionResponse> {
  try {
    console.log(`删除区域(ID: ${id})`);
    // 使用request模块发送请求
    const response = await request.delete(`/api/regions/${id}`);
    console.log(`删除区域(ID: ${id})响应:`, response);
    
    // 处理响应数据
    if (response && typeof response === 'object') {
      // 如果是标准API响应格式 { code, msg }
      if ('code' in response && 'msg' in response) {
        return {
          success: response.code === "0",
          message: String(response.msg)
        };
      }
      
      // 如果response已经符合RegionResponse格式
      if ('success' in response) {
        return response as RegionResponse;
      }
    }
    
    // 默认返回成功响应
    return {
      success: true,
      message: "区域删除成功"
    };
  } catch (error) {
    console.error(`删除区域(ID: ${id})失败:`, error);
    // 返回错误响应
    return {
      success: false,
      message: error instanceof Error ? error.message : `删除区域(ID: ${id})失败`
    };
  }
} 
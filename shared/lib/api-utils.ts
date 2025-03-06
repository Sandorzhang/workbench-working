/**
 * Shared API utilities for feature modules
 * This file provides standardized API path handling and request functions
 */

// API configurations
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
const API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enabled';
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENV || 'development';

/**
 * Get authentication headers from localStorage
 */
export const getAuthHeaders = (): Record<string, string> => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return {};
  }
  
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Builds a standardized API path
 * @param feature The feature module name (e.g., 'auth', 'workbench')
 * @param path The specific endpoint path
 * @returns Fully formatted API path
 */
export const buildApiPath = (feature: string, path: string): string => {
  // Ensure feature has no leading or trailing slashes
  const normalizedFeature = feature.replace(/^\/|\/$/g, '');
  
  // Ensure path has leading slash but no trailing slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Format: /api/[feature]/[path]
  return `${API_BASE_URL}/${normalizedFeature}${normalizedPath}`;
};

/**
 * Standard error response interface
 */
export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: Record<string, any>;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
  success: boolean;
}

/**
 * Handles API requests with standardized error handling
 * @param url The API URL
 * @param options Fetch options
 * @returns Promise resolving to the response data
 */
export async function handleRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Set default headers if not provided
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> || {})
    };
    
    // Execute request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Handle HTTP error responses
    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid tokens on auth failure
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
        
        throw {
          message: 'Authentication failed. Please login again.',
          code: '401'
        } as ApiErrorResponse;
      }
      
      if (response.status === 404) {
        throw {
          message: 'Resource not found',
          code: '404',
          details: { url }
        } as ApiErrorResponse;
      }
      
      // Attempt to parse error response
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || 'An error occurred',
        code: String(response.status),
        details: errorData.details || {}
      } as ApiErrorResponse;
    }
    
    // Parse successful response
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
} 
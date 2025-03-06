# API Path Standardization

This document outlines the standardized approach to API paths and API client implementations in our project.

## API Path Structure

All API paths follow this consistent pattern:

```
/api/[feature]/[resource]/[id]/[sub-resource]
```

Where:
- **api**: Fixed prefix for all API routes
- **feature**: The feature module name (e.g., `auth`, `workbench`, `teaching-designs`)
- **resource**: The primary resource being accessed
- **id**: Optional ID for specific resource
- **sub-resource**: Optional nested resource

## API Client Implementation

Each feature module includes a standardized API client in `features/[feature]/api/client.ts` that:

1. Uses the shared utilities from `shared/lib/api-utils.ts`
2. Implements consistent method naming
3. Returns typed responses using the feature's type definitions

### Example API Client

```typescript
// From features/workbench/api/client.ts
import { buildApiPath, handleRequest, ApiResponse } from '@/shared/lib/api-utils';
import { IWorkbenchConfig, IWorkbenchModule } from '../types';

// Feature name - used to create all API paths consistently
const FEATURE = 'workbench';

export const workbenchApi = {
  getConfig: (): Promise<ApiResponse<IWorkbenchConfig>> => {
    return handleRequest(buildApiPath(FEATURE, '/config'));
  },
  
  getModule: (moduleId: string): Promise<ApiResponse<IWorkbenchModule>> => {
    return handleRequest(buildApiPath(FEATURE, `/modules/${moduleId}`));
  }
};
```

## Shared API Utilities

The `shared/lib/api-utils.ts` file provides common utilities:

- `buildApiPath()`: Generates standardized API paths
- `handleRequest()`: Handles API requests with consistent error handling
- Type definitions for API responses

## Standard Response Format

All API responses follow this consistent format:

```typescript
interface ApiResponse<T> {
  data: T;
  code: number;
  message: string;
  success: boolean;
}
```

## Benefits

This standardized approach provides:

1. **Consistency**: All API paths follow the same structure
2. **Maintainability**: Easier to understand, update, and debug
3. **Type Safety**: All responses are properly typed
4. **Centralized Error Handling**: Common error handling in one place
5. **Domain Separation**: Each feature manages its own API endpoints

## Usage with MSW

When using MSW for API mocking, use the same path structure:

```typescript
// In MSW handler
http.get('*/api/workbench/config', () => {
  // Return mock data
});
```

## How to Add New API Endpoints

1. Define types in the feature's `types.ts` file
2. Add methods to the feature's API client
3. Implement corresponding MSW handlers for testing 
# MSW Handler Standardization

This document outlines how Mock Service Worker (MSW) handlers are standardized to match our API path structure.

## Handler Structure

Our MSW handlers follow the same API path structure as our API clients:

```
/api/[feature]/[resource]/[id]/[sub-resource]
```

Each handler uses a consistent pattern for paths and response formats.

## Standard Response Format

All API responses follow this consistent format:

```typescript
{
  code: number;       // 0 for success, HTTP status code for errors
  message: string;    // Status message
  success: boolean;   // Whether the request succeeded
  data: T | null;     // Response data, null for errors
}
```

## Example MSW Handler

```typescript
// Handler for the workbench feature
export const workbenchHandlers = [
  // Get workbench configuration
  http.get('*/api/workbench/config', async () => {
    await delay(300);
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: {
        modules: mockWorkbenchModules,
        categories: mockCategories
      }
    });
  }),
  
  // Get specific module
  http.get('*/api/workbench/modules/:id', async ({ params }) => {
    const { id } = params;
    
    // Find module in mock data
    const module = mockWorkbenchModules.find(mod => mod.id === id);
    
    if (!module) {
      return HttpResponse.json({
        code: 404,
        message: 'Module not found',
        success: false,
        data: null
      }, { status: 404 });
    }
    
    return HttpResponse.json({
      code: 0,
      message: 'success',
      success: true,
      data: module
    });
  })
]
```

## Prefix Pattern

All handlers use the `'*/'` prefix in the URL pattern to ensure they match in any context:

```typescript
http.get('*/api/feature/resource', ...)
```

This ensures our handlers work with both relative and absolute URLs.

## Error Response Format

Error responses maintain the same format with appropriate HTTP status codes:

```typescript
return HttpResponse.json({
  code: 404,
  message: 'Resource not found',
  success: false,
  data: null
}, { status: 404 });
```

## Handler Registration

All handlers are registered in the `mocks/handlers/index.ts` file:

```typescript
import { workbenchHandlers } from './workbench';
import { authHandlers } from './auth';
// ...

export const handlers = [
  ...authHandlers,
  ...workbenchHandlers,
  // ...other handlers
];
```

## Delay Simulation

Each handler includes a consistent delay to simulate network latency:

```typescript
await delay(300); // 300ms delay
```

## Resource-Related Handlers

Handlers for resources follow a consistent pattern:

1. **GET collection**: `http.get('*/api/feature/resources', ...)`
2. **GET item**: `http.get('*/api/feature/resources/:id', ...)`
3. **POST create**: `http.post('*/api/feature/resources', ...)`
4. **PUT update**: `http.put('*/api/feature/resources/:id', ...)`
5. **DELETE**: `http.delete('*/api/feature/resources/:id', ...)`
6. **Sub-resources**: `http.get('*/api/feature/resources/:id/sub-resources', ...)`

## Debug Logging

All handlers include debug logging to help with troubleshooting:

```typescript
console.log('[MSW] 处理请求: GET /api/feature/resource');
```

## Aligning with API Clients

The MSW handlers are designed to match the exact API path structure used by the feature API clients, ensuring that mocks and real implementations are interchangeable.

## Validation

The `mocks/browser.ts` file includes validation logic to ensure critical handlers exist and are properly formatted. 
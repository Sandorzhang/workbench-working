import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index';

// 创建worker
export const worker = setupWorker(...handlers);
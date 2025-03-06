import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/index';

// 创建worker - MSW v2 setup
export const worker = setupWorker(...handlers);
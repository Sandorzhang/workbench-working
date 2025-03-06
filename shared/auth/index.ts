/**
 * 授权模块导出
 */
import tokenService from './token-service';

// 重新导出令牌服务
export { tokenService };

// 从 lib/auth 导出 useAuth 和 AuthProvider
export { useAuth, AuthProvider } from '@/lib/auth';

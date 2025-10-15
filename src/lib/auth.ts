import { api } from './api';

// Token管理
export const tokenManager = {
  // 获取token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('ims-token');
  },

  // 设置token
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ims-token', token);
  },

  // 清除token
  clearToken: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('ims-token');
  },

  // 检查是否有token
  hasToken: (): boolean => {
    return !!tokenManager.getToken();
  },
};

// 认证状态管理
export const authManager = {
  // 登录
  login: async (name: string, password: string,code:string): Promise<boolean> => {
    try {
      const response = await api.login({ name, password });
      if (response.code === 200 && response.data) {
        tokenManager.setToken(response.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },

  // 登出
  logout: (): void => {
    tokenManager.clearToken();
    window.location.href = '/login';
  },

  // 检查认证状态
  isAuthenticated: (): boolean => {
    return tokenManager.hasToken();
  },

  // 验证token有效性（简化版本，只检查token是否存在）
  validateToken: async (): Promise<boolean> => {
    // 简化验证：只检查token是否存在，不进行网络请求
    // 实际的token验证会在用户操作时通过axios拦截器处理
    return tokenManager.hasToken();
  },
};

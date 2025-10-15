'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // 检查是否有token
      if (!authManager.isAuthenticated()) {
        router.push('/login');
        return;
      }

      // 验证token有效性
      try {
        const isValid = await authManager.validateToken();
        if (!isValid) {
          authManager.logout();
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token validation failed:', error);
        authManager.logout();
      }
    };

    checkAuth();
  }, []); // 移除router依赖，避免重复执行

  // 显示加载状态
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-900">验证中...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，不渲染内容（会跳转到登录页）
  if (!isAuthenticated) {
    return null;
  }

  // 认证成功，渲染子组件
  return <>{children}</>;
}

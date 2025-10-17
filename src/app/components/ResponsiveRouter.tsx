'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Spin } from 'antd';

interface ResponsiveRouterProps {
  children: React.ReactNode;
}

export default function ResponsiveRouter({ children }: ResponsiveRouterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 检测设备类型
  const checkDevice = () => {
    const width = window.innerWidth;
    const isMobileDevice = width < 768;
    
    setIsMobile(isMobileDevice);
    
    // 如果当前在桌面版但检测到移动设备，跳转到移动版
    if (isMobileDevice && pathname === '/') {
      router.push('/mobile');
      return;
    }
    
    // 如果当前在移动版但检测到桌面设备，跳转到桌面版
    if (!isMobileDevice && pathname === '/mobile') {
      router.push('/');
      return;
    }
    
    setIsChecking(false);
  };

  // 监听窗口大小变化
  useEffect(() => {
    // 初始检测
    checkDevice();

    // 监听窗口大小变化
    const handleResize = () => {
      checkDevice();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [pathname, router]);

  // 检测中显示loading
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-600">
            {isMobile ? '切换到移动版...' : '切换到桌面版...'}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AuthGuard from '../components/AuthGuard';
import ResponsiveRouter from '../components/ResponsiveRouter';
import { usePermissions } from '@/lib/usePermissions';
import MobileHeader from './components/MobileHeader';
import MobileNav from './components/MobileNav';
import EmployeeManagement from './components/pages/employee';
import MemberManagement from './components/pages/member';
import DesignManagement from './components/pages/design';
import OrderManagement from './components/pages/order';

// 临时占位组件
function PagePlaceholder({ pageName }: { pageName: string }) {
  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{pageName}</h2>
        <p className="text-gray-600">移动端页面开发中...</p>
      </div>
    </div>
  );
}

export default function MobilePage() {
  const { t } = useTranslation();
  const { canAccessPage, loading } = usePermissions();
  const [navOpen, setNavOpen] = useState(false);
  const [activePage, setActivePage] = useState('designManagement');

  // 检查当前页面是否可访问，如果不可访问则切换到第一个可访问的页面
  useEffect(() => {
    // 等待权限加载完成后再检查
    if (!loading && !canAccessPage(activePage)) {
      const accessiblePages = ['designManagement', 'employeeManagement', 'orderManagement', 'hotColdItems', 'inventoryRecords', 'employeeHistory', 'memberManagement', 'billManagement'];
      const firstAccessiblePage = accessiblePages.find(page => canAccessPage(page));
      if (firstAccessiblePage) {
        setActivePage(firstAccessiblePage);
      }
    }
  }, [activePage, canAccessPage, loading]);

  // 根据activePage渲染不同的页面组件
  const renderPage = () => {
    // 如果权限还在加载中，显示loading
    if (loading) {
      return (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      );
    }

    // 检查页面访问权限
    if (!canAccessPage(activePage)) {
      return (
        <div className="p-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">访问被拒绝</h2>
            <p className="text-gray-600">您没有权限访问此页面</p>
          </div>
        </div>
      );
    }

    switch (activePage) {
      case 'employeeManagement':
        return <EmployeeManagement />;
      case 'memberManagement':
        return <MemberManagement />;
      case 'designManagement':
        return <DesignManagement />;
      case 'orderManagement':
        return <OrderManagement />;
      // 其他页面暂时显示占位符
      default:
        return <PagePlaceholder pageName={t(activePage)} />;
    }
  };

  return (
    <AuthGuard>
      <ResponsiveRouter>
        <div className="min-h-screen bg-gray-50">
          {/* 移动端Header */}
          <MobileHeader 
            onMenuClick={() => setNavOpen(true)}
            title={t(activePage)}
          />

          {/* 移动端导航抽屉 */}
          <MobileNav
            open={navOpen}
            onClose={() => setNavOpen(false)}
            activePage={activePage}
            onPageChange={setActivePage}
          />

          {/* 主内容区域 - 为fixed header留出空间 */}
          <main className="pt-14">
            {renderPage()}
          </main>
        </div>
      </ResponsiveRouter>
    </AuthGuard>
  );
}


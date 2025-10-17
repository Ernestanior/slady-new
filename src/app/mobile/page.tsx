'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AuthGuard from '../components/AuthGuard';
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
  const [navOpen, setNavOpen] = useState(false);
  const [activePage, setActivePage] = useState('employeeManagement');

  // 根据activePage渲染不同的页面组件
  const renderPage = () => {
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
    </AuthGuard>
  );
}


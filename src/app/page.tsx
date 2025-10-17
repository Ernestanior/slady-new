'use client';

import { useState } from 'react';
import AuthGuard from './components/AuthGuard';
import ResponsiveRouter from './components/ResponsiveRouter';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Content from './components/Content';

export default function Home() {
  const [activePage, setActivePage] = useState('designManagement');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const toggleHeader = () => {
    setHeaderCollapsed(!headerCollapsed);
  };

  return (
    <AuthGuard>
      <ResponsiveRouter>
        <div className="min-h-screen bg-gray-50 min-w-[1200px] overflow-x-auto">
        {/* Header 容器 - 带过渡效果 */}
        <div 
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            height: headerCollapsed ? '0px' : '72px'
          }}
        >
          <Header />
        </div>
        
        {/* 切换按钮 - 始终显示 */}
        <div className="relative">
          <button
            onClick={toggleHeader}
            className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all z-50 hover:scale-110"
            title={headerCollapsed ? "展开Header" : "折叠Header"}
          >
            <svg 
              className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${headerCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 15l7-7 7 7" 
              />
            </svg>
          </button>
        </div>
        
        <div className="flex min-w-0 w-full">
          {/* Sidebar */}
          <Sidebar 
            activePage={activePage} 
            setActivePage={setActivePage}
            isCollapsed={sidebarCollapsed}
            setIsCollapsed={setSidebarCollapsed}
          />
          
          {/* Content */}
          <Content activePage={activePage} sidebarCollapsed={sidebarCollapsed} setActivePage={setActivePage} />
        </div>
        </div>
      </ResponsiveRouter>
    </AuthGuard>
  );
}

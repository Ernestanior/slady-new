'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Truck, 
  History, 
  TrendingUp, 
  MessageSquare, 
  Package, 
  Clock, 
  UserCheck, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Shirt
} from 'lucide-react';
import { usePermissions } from '@/lib/usePermissions';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ activePage, setActivePage, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { t } = useTranslation();
  const { canAccessPage } = usePermissions();

  const allMenuItems = [
    { name: 'employeeManagement', icon: Users, color: 'text-stone-600', bgColor: 'bg-stone-50', hoverColor: 'group-hover:text-stone-700' },
    { name: 'designManagement', icon: Shirt, color: 'text-red-600', bgColor: 'bg-red-50', hoverColor: 'group-hover:text-red-700' },
    { name: 'orderManagement', icon: Truck, color: 'text-green-600', bgColor: 'bg-green-50', hoverColor: 'group-hover:text-green-700' },
    // { name: 'orderHistory', icon: History, color: 'text-purple-600', bgColor: 'bg-purple-50', hoverColor: 'group-hover:text-purple-700' },
    { name: 'hotColdItems', icon: TrendingUp, color: 'text-red-600', bgColor: 'bg-red-50', hoverColor: 'group-hover:text-red-700' },
    { name: 'inventoryRecords', icon: Package, color: 'text-indigo-600', bgColor: 'bg-indigo-50', hoverColor: 'group-hover:text-indigo-700' },
    { name: 'employeeHistory', icon: Clock, color: 'text-teal-600', bgColor: 'bg-teal-50', hoverColor: 'group-hover:text-teal-700' },
    { name: 'memberManagement', icon: UserCheck, color: 'text-pink-600', bgColor: 'bg-pink-50', hoverColor: 'group-hover:text-pink-700' },
    { name: 'billManagement', icon: CreditCard, color: 'text-yellow-600', bgColor: 'bg-yellow-50', hoverColor: 'group-hover:text-yellow-700' }
  ];

  // 根据权限过滤菜单项
  const menuItems = allMenuItems.filter(item => canAccessPage(item.name));

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm border-r border-gray-200 min-h-screen transition-all duration-300 ease-in-out relative z-10 flex-shrink-0`}>
      {/* 折叠按钮 */}
      <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-end'} p-4 border-b border-gray-200`}>
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          title={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-gray-900" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          )}
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <button
                  onClick={() => setActivePage(item.name)}
                  className={`group w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-4'} py-3 md:py-3.5 rounded-lg transition-colors duration-200 min-h-[44px] ${
                    activePage === item.name
                      ? 'bg-orange-50 text-orange-700 border-l-4 border-orange-500 font-medium'
                      : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={isCollapsed ? t(item.name) : undefined}
                >
                  <div className={`${!isCollapsed ? 'mr-3' : ''} flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 ${
                    activePage === item.name 
                      ? 'bg-orange-100' 
                      : `${item.bgColor} group-hover:scale-110`
                  }`}>
                    <Icon className={`w-4 h-4 transition-colors duration-200 ${
                      activePage === item.name 
                        ? 'text-orange-600' 
                        : `${item.color} ${item.hoverColor}`
                    }`} />
                  </div>
                  {!isCollapsed && (
                    <span className={`truncate ${
                      activePage === item.name
                        ? 'text-orange-700'
                        : 'text-gray-900'
                    }`}>{t(item.name)}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

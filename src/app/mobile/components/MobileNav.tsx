'use client';

import { Drawer } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { authManager } from '@/lib/auth';
import { usePermissions } from '@/lib/usePermissions';
import { 
  Users, 
  Truck, 
  History, 
  TrendingUp, 
  Package, 
  Clock, 
  UserCheck, 
  CreditCard,
  Shirt,
  LogOut,
  Globe,
  X
} from 'lucide-react';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function MobileNav({ open, onClose, activePage, onPageChange }: MobileNavProps) {
  const { t, i18n } = useTranslation();
  const { canAccessPage } = usePermissions();
  const router = useRouter();
  const searchParams = useSearchParams();

  const menuItems = [
    { name: 'designManagement', icon: Shirt, color: 'text-red-600' },
    { name: 'employeeManagement', icon: Users, color: 'text-stone-600' },
    { name: 'orderManagement', icon: Truck, color: 'text-green-600' },
    { name: 'hotColdItems', icon: TrendingUp, color: 'text-red-600' },
    { name: 'inventoryRecords', icon: Package, color: 'text-indigo-600' },
    { name: 'employeeHistory', icon: Clock, color: 'text-teal-600' },
    { name: 'memberManagement', icon: UserCheck, color: 'text-pink-600' },
    { name: 'billManagement', icon: CreditCard, color: 'text-yellow-600' }
  ];

  const handleMenuClick = (pageName: string) => {
    onPageChange(pageName);
    
    // 更新URL参数
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageName);
    router.push(`/mobile?${params.toString()}`, { scroll: false });
    
    onClose();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <Drawer
      placement="left"
      onClose={onClose}
      open={open}
      closable={false}
      width="80%"
      styles={{ body: { padding: 0 } }}
    >
      {/* 顶部用户信息 */}
      <div className="bg-gray-900 p-6 text-white relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          aria-label="关闭菜单"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">S</span>
          </div>
          <div>
            <div className="text-lg font-semibold">Slady</div>
            <div className="text-sm opacity-90">{t('managementSystem')}</div>
          </div>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="py-2">
        {menuItems
          .filter(item => canAccessPage(item.name))
          .map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.name;
            
            return (
              <button
                key={item.name}
                onClick={() => handleMenuClick(item.name)}
                className={`w-full flex items-center px-6 py-4 transition-colors ${
                  isActive 
                    ? 'bg-gray-900 text-white border-l-4 border-gray-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-6 h-6 mr-4 ${isActive ? 'text-white' : item.color}`} />
                <span className={`text-base ${isActive ? 'text-white font-medium' : 'text-gray-700'}`}>
                  {t(item.name)}
                </span>
              </button>
            );
          })}
      </div>

      {/* 底部操作 */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
        {/* 语言切换 */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <Globe className="w-6 h-6 mr-4 text-gray-600" />
          <span className="text-base text-gray-700">
            {i18n.language === 'zh' ? 'English' : '中文'}
          </span>
        </button>

        {/* 退出登录 */}
        <button
          onClick={() => {
            authManager.logout();
            onClose();
          }}
          className="w-full flex items-center px-6 py-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
        >
          <LogOut className="w-6 h-6 mr-4 text-red-600" />
          <span className="text-base text-red-600">{t('logout')}</span>
        </button>
      </div>
    </Drawer>
  );
}


'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu as MenuIcon, X } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function MobileHeader({ onMenuClick, title = 'Slady' }: MobileHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        {/* 汉堡菜单按钮 */}
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="打开菜单"
        >
          <MenuIcon className="w-6 h-6 text-gray-700" />
        </button>

        {/* 页面标题 / Logo */}
        <h1 className="text-lg font-bold text-orange-600 flex-1 text-center">
          {title}
        </h1>

        {/* 占位，保持标题居中 */}
        <div className="w-10"></div>
      </div>
    </header>
  );
}


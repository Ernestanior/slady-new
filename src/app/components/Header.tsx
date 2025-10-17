'use client';

import { useTranslation } from 'react-i18next';
import { authManager } from '@/lib/auth';
import { usePermissions } from '@/lib/usePermissions';

export default function Header() {
  const { t, i18n } = useTranslation();
  const { userInfo, loading } = usePermissions();

  // 切换语言
  const handleLanguageChange = (language: string) => {
    const langCode = language === '中文' ? 'zh' : 'en';
    i18n.changeLanguage(langCode);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 min-w-full sticky top-0 z-50">
      <div className="flex items-center justify-between flex-wrap md:flex-nowrap gap-2 md:gap-0">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <div className="text-xl md:text-2xl font-bold text-orange-600">
            Slady
          </div>
        </div>

        {/* Right side - Language and User Info */}
        <div className="flex items-center space-x-4 md:space-x-8 flex-shrink-0">
          {/* Language Switch */}
          <div className="flex items-center space-x-1 md:space-x-2">
            <span className="text-xs md:text-sm text-gray-900 hidden sm:inline">{t('language')}:</span>
            <select 
              value={i18n.language === 'zh' ? '中文' : 'English'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[40px] md:min-h-auto"
            >
              <option value="中文">中文</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {loading ? (
              <div className="text-xs md:text-sm text-gray-500">{t('loading')}</div>
            ) : userInfo ? (
              <>
                <div className="text-right hidden md:block">
                  <div className="text-xs md:text-sm font-medium text-gray-900">{userInfo.name}</div>
                  <div className="text-[10px] md:text-xs text-gray-900">{userInfo.type}</div>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {userInfo.name.charAt(0)}
                </div>
                <button
                  onClick={() => authManager.logout()}
                  className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded transition-colors min-h-[40px] md:min-h-auto flex items-center"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <div className="text-xs md:text-sm text-gray-500">{t('userInfoNotFound')}</div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { HotColdItem } from '@/lib/types';

const dev_url = 'http://119.28.104.20';

interface TopThreeItemsProps {
  hotData: HotColdItem[];
  coldData: HotColdItem[];
}

export default function TopThreeItems({ hotData, coldData }: TopThreeItemsProps) {
  const { t } = useTranslation();
  // 获取前三名商品数据
  const getTopThreeHot = () => hotData.slice(0, 3);
  const getTopThreeCold = () => coldData.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">🔥 {t('hotItems')}</h3>
        <div className="space-y-3">
          {getTopThreeHot().map((item, index) => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  style={{ 
                    height: 100, 
                    width: 100, 
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0'
                  }}
                  alt={t('productImage')}
                  src={dev_url + item.previewPhoto}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    // 防止无限循环：如果已经是 placeholder 就不再设置
                    if (!img.src.includes('placeholder-image.jpg') && !img.src.includes('data:image')) {
                      // 使用 data URI 作为占位符（透明 1x1 像素图片）
                      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
                    }
                  }}
                />
                <div>
                  <p className="font-medium">{item.design}</p>
                  <p className="text-sm text-gray-900">{t('hot')}: {item.hot || 0}</p>
                </div>
              </div>
              <span className="text-red-600 font-bold">#{index + 1}</span>
            </div>
          ))}
          {getTopThreeHot().length === 0 && (
            <div className="text-center text-gray-500 py-4">{t('noData')}</div>
          )}
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-600 mb-4">❄️ {t('coldItems')}</h3>
        <div className="space-y-3">
          {getTopThreeCold().map((item, index) => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  style={{ 
                    height: 100, 
                    width: 100, 
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0'
                  }}
                  alt={t('productImage')}
                  src={dev_url + item.previewPhoto}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    // 防止无限循环：如果已经是 placeholder 就不再设置
                    if (!img.src.includes('placeholder-image.jpg') && !img.src.includes('data:image')) {
                      // 使用 data URI 作为占位符（透明 1x1 像素图片）
                      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
                    }
                  }}
                />
                <div>
                  <p className="font-medium">{item.design}</p>
                  <p className="text-sm text-gray-900">{t('hot')}: {item.hot || 0}</p>
                </div>
              </div>
              <span className="text-blue-600 font-bold">#{index + 1}</span>
            </div>
          ))}
          {getTopThreeCold().length === 0 && (
            <div className="text-center text-gray-500 py-4">{t('noData')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

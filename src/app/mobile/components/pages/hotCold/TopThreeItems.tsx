'use client';

import React from 'react';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { HotColdItem } from '@/lib/types';

const dev_url = 'http://119.28.104.20';

interface TopThreeItemsProps {
  hotData: HotColdItem[];
  coldData: HotColdItem[];
  type: 'hot' | 'cold';
}

export default function TopThreeItems({ hotData, coldData, type }: TopThreeItemsProps) {
  const { t } = useTranslation();
  
  // 获取前三名商品数据
  const getTopThree = () => {
    const data = type === 'hot' ? hotData : coldData;
    return data.slice(0, 3);
  };

  const topThree = getTopThree();
  const isHot = type === 'hot';

  return (
    <Card 
      className="mb-4"
      style={{ 
        borderRadius: 12, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        background: isHot ? 'linear-gradient(135deg, #fff5f5 0%, #ffffff 100%)' : 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)'
      }}
    >
      <div className="text-center mb-4">
        <h3 className={`text-lg font-bold ${isHot ? 'text-red-600' : 'text-blue-600'} mb-2`}>
          {isHot ? '🔥' : '❄️'} {isHot ? t('hotItems') : t('coldItems')} TOP 3
        </h3>
        <div className={`w-12 h-1 mx-auto rounded ${isHot ? 'bg-red-500' : 'bg-blue-500'}`}></div>
      </div>
      
      <div className="space-y-3">
        {topThree.map((item, index) => (
          <div 
            key={item.id} 
            className={`flex items-center p-3 rounded-lg ${
              isHot ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'
            }`}
          >
            {/* 排名 */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm mr-3 bg-gray-100 border border-gray-300">
              {index + 1}
            </div>
            
            {/* 商品图片 */}
            <div className="flex-shrink-0 mr-3">
              <img
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
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
            </div>
            
            {/* 商品信息 */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate mb-1">
                {item.design}
              </div>
              <div className="flex items-center justify-between">
                <div className={`text-sm font-bold ${
                  isHot ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {t('hot')}: {item.hot || 0}
                </div>
                <div className="text-xs text-gray-500">
                  {t('type')}: {item.type}
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className={`text-sm font-bold ${
                  item.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {t('stock')}: {item.stock}
                </div>
                <div className="text-sm font-bold text-gray-900">
                  ${item.salePrice}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {topThree.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">{isHot ? '🔥' : '❄️'}</div>
            <div>{t('noData')}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

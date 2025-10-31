'use client';

import React from 'react';
import { Card, Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import { HotColdItem } from '@/lib/types';

const dev_url = 'http://119.28.104.20';

interface HotColdListProps {
  data: HotColdItem[];
  loading: boolean;
  type: 'hot' | 'cold';
}

export default function HotColdList({ data, loading, type }: HotColdListProps) {
  const { t } = useTranslation();
  const isHot = type === 'hot';

  if (loading) {
    return (
      <Card className="text-center py-8">
        <Spin size="large" />
        <div className="mt-4 text-gray-500">{t('loading')}</div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="text-center py-8">
        <div className={`text-6xl mb-4 ${isHot ? 'text-red-300' : 'text-blue-300'}`}>
          {isHot ? '🔥' : '❄️'}
        </div>
        <div className="text-gray-500 text-lg">{t('noData')}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <Card
          key={item.id}
          className="hover:shadow-md transition-shadow duration-200"
          style={{ borderRadius: 12 }}
        >
          <div className="flex items-start space-x-3">
            {/* 排名 */}
            <div className=" rounded-full flex items-center justify-center text-gray-600 font-bold text-md ">
              {index + 1}
            </div>
            
            {/* 商品图片 */}
            <div className="flex-shrink-0">
              <img
                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                alt={t('productImage')}
                src={dev_url + item.previewPhoto}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                }}
              />
            </div>
            
            {/* 商品信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="font-bold text-gray-900 text-lg truncate">
                  {item.design}
                </div>

              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">{t('type')}:</span>
                  <span className="font-medium">{item.type}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">{t('stock')}:</span>
                  <span className={`font-bold ${
                    item.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.stock}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">{t('salePrice')}:</span>
                  <span className="font-bold text-gray-900">${item.salePrice}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">{t('hot')}:</span>
                  <span className={`font-bold ${
                    isHot ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {item.hot || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

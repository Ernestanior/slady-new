'use client';

import React, { useState, useEffect } from 'react';
import { Card, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { HotColdItem, HotColdListRequest } from '@/lib/types';
import { hotCold } from '@/lib/api';
import TopThreeItems from './TopThreeItems';
import HotColdTable from './HotColdTable';

export default function HotColdItems() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('hot');
  const [hotData, setHotData] = useState<HotColdItem[]>([]);
  const [coldData, setColdData] = useState<HotColdItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 获取爆款数据
  const fetchHotData = async () => {
    try {
      const params: HotColdListRequest = {
        type: '',
        searchPage: {
          desc: 1, // 降序排列，热度高的在前
          page: 1,
          pageSize: 20,
          sort: 'hot'
        }
      };
      const response = await hotCold.getList(params);
      if (response.code === 200) {
        setHotData(response.data.content);
      }
    } catch (error) {
      console.error('获取爆款数据失败:', error);
      message.error(t('fetchHotItemsFailed'));
    }
  };

  // 获取冷款数据
  const fetchColdData = async () => {
    try {
      const params: HotColdListRequest = {
        type: '',
        searchPage: {
          desc: 0, // 升序排列，热度低的在前
          page: 1,
          pageSize: 20,
          sort: 'hot'
        }
      };
      const response = await hotCold.getList(params);
      if (response.code === 200) {
        setColdData(response.data.content);
      }
    } catch (error) {
      console.error('获取冷款数据失败:', error);
      message.error(t('fetchColdItemsFailed'));
    }
  };

  // 初始化数据 - 防止重复调用
  useEffect(() => {
    if (!hasLoaded) {
      setLoading(true);
      setHasLoaded(true);
      Promise.all([fetchHotData(), fetchColdData()])
        .finally(() => {
          setLoading(false);
        });
    }
  }, [hasLoaded]);

  return (
    <div style={{ padding: '24px' }}>


      {/* 前三名商品展示模块 */}
      <TopThreeItems hotData={hotData} coldData={coldData} />

      {/* 详细表格 */}
      <Card 
        style={{ 
          borderRadius: 8, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}
      >
        <HotColdTable
          hotData={hotData}
          coldData={coldData}
          activeTab={activeTab}
          loading={loading}
          onTabChange={setActiveTab}
        />
      </Card>
    </div>
  );
}

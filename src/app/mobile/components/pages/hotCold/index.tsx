'use client';

import React, { useState, useEffect } from 'react';
import { Card, message, Tabs } from 'antd';
import { FireOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { HotColdItem, HotColdListRequest } from '@/lib/types';
import { hotCold } from '@/lib/api';
import TopThreeItems from './TopThreeItems';
import HotColdList from './HotColdList';

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

  const tabItems = [
    {
      key: 'hot',
      label: (
        <span className="flex items-center">
          <FireOutlined className="text-red-500 mr-2" />
          {t('hotItems')}
        </span>
      ),
      children: (
        <div className="space-y-4">
          {/* 前三名商品展示 */}
          <TopThreeItems hotData={hotData} coldData={coldData} type="hot" />
          
          {/* 详细列表 */}
          <HotColdList 
            data={hotData} 
            loading={loading} 
            type="hot"
          />
        </div>
      ),
    },
    {
      key: 'cold',
      label: (
        <span className="flex items-center">
          <MinusCircleOutlined className="text-blue-500 mr-2" />
          {t('coldItems')}
        </span>
      ),
      children: (
        <div className="space-y-4">
          {/* 前三名商品展示 */}
          <TopThreeItems hotData={hotData} coldData={coldData} type="cold" />
          
          {/* 详细列表 */}
          <HotColdList 
            data={coldData} 
            loading={loading} 
            type="cold"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        className="hot-cold-tabs"
      />
    </div>
  );
}

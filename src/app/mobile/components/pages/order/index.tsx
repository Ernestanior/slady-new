'use client';

import React, { useState } from 'react';
import { Tabs, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import OrderList from './OrderList';
import { WAREHOUSE } from '@/lib/types';

export default function OrderManagement() {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState('slady');
  const [refreshKey, setRefreshKey] = useState(0);

  // 刷新当前选中的订单列表
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  // 切换标签页
  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  const tabItems = [
    {
      key: 'slady',
      label: WAREHOUSE.SLADY,
      children: (
        <OrderList
          key={`slady-${refreshKey}`}
          warehouseName={WAREHOUSE.SLADY}
          onRefresh={() => handleRefresh()}
        />
      ),
    },
    {
      key: 'sl2',
      label: WAREHOUSE.SL,
      children: (
        <OrderList
          key={`sl2-${refreshKey}`}
          warehouseName={WAREHOUSE.SL}
          onRefresh={() => handleRefresh()}
        />
      ),
    },
    {
      key: 'live',
      label: WAREHOUSE.LIVE,
      children: (
        <OrderList
          key={`live-${refreshKey}`}
          warehouseName={WAREHOUSE.LIVE}
          onRefresh={() => handleRefresh()}
        />
      ),
    },
  ];

  return (
    <div className="p-4 pb-20">
      {/* 页面标题和操作按钮 */}
      <div className="flex items-center justify-between mb-4">

        <Button 
          type="primary" 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          size="large"
        >
          {t('refreshAll')}
        </Button>
      </div>

      {/* 订单列表标签页 */}
      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
        className="mobile-tabs"
      />
    </div>
  );
}

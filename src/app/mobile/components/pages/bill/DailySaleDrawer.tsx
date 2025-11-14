'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, DatePicker, Drawer, Tabs, Card, Spin, Tag, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { DailySaleRequest, DailySaleData } from '@/lib/types';
import { printService } from '@/lib/api';
import { usePermissions } from '@/lib/usePermissions';
import moment from 'moment';
import { t } from 'i18next';
import { saler } from '@/app/components/pages/bill/PrintReceipt';

interface DailySaleDrawerProps {
  visible: boolean;
  onClose: () => void;
}

// 所有 cashier 列

// 转换数据 -> pivot 格式
function transformData(data: DailySaleData[]) {
  const grouped: any = {};

  data.forEach((item: DailySaleData) => {
    if (!grouped[item.date]) {
      grouped[item.date] = { date: item.date };
      saler.forEach(c => (grouped[item.date][c] = null));
    }
    grouped[item.date][item.cashier] = item.totalPrice;
  });

  // 计算每行总计
  Object.values(grouped).forEach((row: any) => {
    row.total = saler.reduce((sum, c) => sum + (row[c] || 0), 0);
  });

  // 添加总计行
  const totalRow: any = { date: "total" };
  saler.forEach((c: any) => {
    totalRow[c] = Object.values(grouped).reduce((sum, row: any) => sum + (row[c] || 0), 0);
  });
  totalRow.total = saler.reduce((sum, c) => sum + totalRow[c], 0);

  return [...Object.values(grouped), totalRow];
}

// 手机版卡片组件
const MobileSaleCard = ({ data }: { data: any[] }) => {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  
  return (
    <div className="space-y-3">
      {data.map((row, index) => (
        <Card 
          key={row.date || index} 
          className="border border-gray-200"
          style={{ borderRadius: 12 }}
        >
          <div className="space-y-3">
            {/* 日期标题 */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {row.date === 'total' ? t('total') : row.date}
              </h3>
              {row.date !== 'total' && (
                <Tag color="blue" className="text-xs">
                  {moment(row.date).format('MM/DD')}
                </Tag>
              )}
            </div>
            
            <Divider className="my-2" />
            
            {/* {t('saleralesData')} */}
            <div className="grid grid-cols-2 gap-3">
              {saler.map(cashier => (
                <div key={cashier} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{cashier}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {row[cashier] ? formatCurrency(row[cashier]) : '-'}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 总计 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-900">{t('total')}</span>
                <span className="text-xl font-bold text-blue-900">
                  {formatCurrency(row.total)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default function DailySaleDrawer({ visible, onClose }: DailySaleDrawerProps) {
  const { t } = useTranslation();
  const { getFinanceStoreAccess } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailySaleData[]>([]);
  
  // 获取财务用户可访问的店铺
  const financeStoreAccess = getFinanceStoreAccess();
  // 根据财务用户限制设置默认 tab
  const defaultTab = financeStoreAccess ? financeStoreAccess.toString() : '2';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // 获取数据
  const fetchData = useCallback(async (store: number) => {
    setLoading(true);
    try {
      const params: DailySaleRequest = {
        store,
        startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD')
      };
      
      const response = await printService.getDailySale(params);
      if (response.code === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error('获取日销售数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    if (visible) {
      fetchData(parseInt(activeTab));
    }
  }, [visible, activeTab, fetchData]);

  // Tab切换
  const handleTabChange = (key: string) => {
    // 如果财务用户有限制，不允许切换到其他店铺
    if (financeStoreAccess && key !== financeStoreAccess.toString()) {
      return;
    }
    setActiveTab(key);
    fetchData(parseInt(key));
  };

  // 根据财务用户权限过滤可显示的店铺
  const tabItems = useMemo(() => {
    const allTabs = [
      {
        key: '1',
        label: t('Slady一店'),
        children: (
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">加载中...</div>
              </div>
            ) : (
              <MobileSaleCard data={transformData(data)} />
            )}
          </div>
        ),
      },
      {
        key: '2',
        label: t('SL二店'),
        children: (
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">加载中...</div>
              </div>
            ) : (
              <MobileSaleCard data={transformData(data)} />
            )}
          </div>
        ),
      },
    ];

    // 如果是财务用户且只能访问特定店铺，则只显示该店铺
    if (financeStoreAccess !== null) {
      return allTabs.filter(tab => tab.key === financeStoreAccess.toString());
    }

    // 否则显示所有店铺
    return allTabs;
  }, [financeStoreAccess, t, data, loading]);

  // 当财务用户只能访问一个店铺时，自动设置activeTab
  useEffect(() => {
    if (financeStoreAccess !== null && visible) {
      setActiveTab(financeStoreAccess.toString());
    }
  }, [financeStoreAccess, visible]);

  return (
    <Drawer
      title={t('dailySales')}
      placement="bottom"
      onClose={onClose}
      open={visible}
      height="90%"
      footer={
        <div className="flex gap-2 p-4">
          <Button onClick={onClose} className="flex-1">
            {t('close')}
          </Button>
        </div>
      }
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        size="large"
      />
    </Drawer>
  );
}

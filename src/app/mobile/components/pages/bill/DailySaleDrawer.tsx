'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button, DatePicker, Drawer, Tabs, Card, Spin, Tag, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { DailySaleRequest, DailySaleData } from '@/lib/types';
import { printService } from '@/lib/api';
import moment from 'moment';
import { t } from 'i18next';

interface DailySaleDrawerProps {
  visible: boolean;
  onClose: () => void;
}

// 所有 cashier 列
const cashiers = ["Serene", "Staff", "Xiao Li", "Yen"];

// 转换数据 -> pivot 格式
function transformData(data: DailySaleData[]) {
  const grouped: any = {};

  data.forEach((item: DailySaleData) => {
    if (!grouped[item.date]) {
      grouped[item.date] = { date: item.date };
      cashiers.forEach(c => (grouped[item.date][c] = null));
    }
    grouped[item.date][item.cashier] = item.totalPrice;
  });

  // 计算每行总计
  Object.values(grouped).forEach((row: any) => {
    row.total = cashiers.reduce((sum, c) => sum + (row[c] || 0), 0);
  });

  // 添加总计行
  const totalRow: any = { date: "total" };
  cashiers.forEach((c: any) => {
    totalRow[c] = Object.values(grouped).reduce((sum, row: any) => sum + (row[c] || 0), 0);
  });
  totalRow.total = cashiers.reduce((sum, c) => sum + totalRow[c], 0);

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
            
            {/* {t('cashierSalesData')} */}
            <div className="grid grid-cols-2 gap-3">
              {cashiers.map(cashier => (
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
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DailySaleData[]>([]);
  const [activeTab, setActiveTab] = useState('1');

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
      fetchData(1);
    }
  }, [visible, fetchData]);

  // Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    fetchData(parseInt(key));
  };

  const tabItems = [
    {
      key: '1',
      label: t('slStore1'),
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
      label: t('sladyStore2'),
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

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button, DatePicker, Table, Drawer, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { DailySaleRequest, DailySaleData } from '@/lib/types';
import { printService } from '@/lib/api';
import moment from 'moment';

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

// 定义表格列
const columns = [
  { title: "Date", dataIndex: "date", key: "date" },
  ...cashiers.map(c => ({
    title: c,
    dataIndex: c,
    key: c,
  })),
  { title: "total", dataIndex: "total", key: "total" }
];

export default function DailySaleDrawer({ visible, onClose }: DailySaleDrawerProps) {
  const { t } = useTranslation();
  const [data, setData] = useState<any[]>([]);
  const [dateTime, setDateTime] = useState<any>();
  const [activeTab, setActiveTab] = useState('2'); // 默认二店
  const [loading, setLoading] = useState(false);

  // 查询数据
  const onQuery = useCallback(async () => {
    try {
      setLoading(true);
      let query: DailySaleRequest;
      
      if (dateTime) {
        query = {
          startDateTime: dateTime[0].format('YYYY-MM-DD') + " 00:00:00",
          endDateTime: dateTime[1].format('YYYY-MM-DD') + " 23:59:59",
          store: parseInt(activeTab),
        };
      } else {
        query = {
          startDateTime: moment(new Date()).format('YYYY-MM-DD') + " 00:00:00",
          endDateTime: moment(new Date()).format('YYYY-MM-DD') + " 23:59:59",
          store: parseInt(activeTab),
        };
      }

      const res = await printService.getDailySale(query);
      if (res.code === 200) {
        setData(transformData(res.data));
      }
    } catch (error) {
      console.error('获取销售数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [dateTime, activeTab]);

  // 初始化数据
  useEffect(() => {
    if (visible) {
      onQuery();
    }
  }, [visible, onQuery]);

  // Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const tabItems = [
    {
      key: '1',
      label: '一店',
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <DatePicker.RangePicker 
              placeholder={[t('startTime'), t('endTime')]} 
              onChange={(e) => setDateTime(e)}
              style={{ marginRight: 16 }}
            />
            <Button type="primary" onClick={onQuery} loading={loading}>
            {t('search')}
            </Button>
          </div>
          
          <div style={{ height: 20 }}></div>
          
          <Table
            dataSource={data}
            columns={columns}
            pagination={false}
            bordered
            rowKey="date"
            loading={loading}
          />
        </div>
      ),
    },
    {
      key: '2',
      label: '二店',
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <DatePicker.RangePicker 
              placeholder={[t('startTime'), t('endTime')]} 
              onChange={(e) => setDateTime(e)}
              style={{ marginRight: 16 }}
            />
            <Button type="primary" onClick={onQuery} loading={loading}>
            {t('search')}
            </Button>
          </div>
          
          <div style={{ height: 20 }}></div>
          
          <Table
            dataSource={data}
            columns={columns}
            pagination={false}
            bordered
            rowKey="date"
            loading={loading}
          />
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title={t('dailySales')}
      placement="right"
      onClose={onClose}
      open={visible}
      width={800}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={onClose}>{t('close')}</Button>
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

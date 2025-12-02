'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, DatePicker, Table, Drawer, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { ReceiptData, ReceiptListRequest } from '@/lib/types';
import { receipt } from '@/lib/api';
import { usePermissions } from '@/lib/usePermissions';
import moment from 'moment';
import { paymentList } from './PrintReceipt';

interface PaymentMethodSaleDrawerProps {
  visible: boolean;
  onClose: () => void;
}

// 转换数据 -> pivot 格式（按日期和支付方式）
function transformData(data: ReceiptData[]) {
  const grouped: any = {};

  data.forEach((receipt: ReceiptData) => {
    // 获取日期（格式化为 YYYY-MM-DD）
    const date = moment(receipt.receiptDate || receipt.createDate).format('YYYY-MM-DD');
    
    if (!grouped[date]) {
      grouped[date] = { date };
      // 初始化所有支付方式为 0
      paymentList.forEach(payment => (grouped[date][payment] = 0));
    }

    // 处理支付方式列表
    let paymentListData: any[] = [];
    if (receipt.paymentList) {
      if (typeof receipt.paymentList === 'string') {
        try {
          paymentListData = JSON.parse(receipt.paymentList);
        } catch {
          paymentListData = [];
        }
      } else if (Array.isArray(receipt.paymentList)) {
        paymentListData = receipt.paymentList;
      }
    }

    if (Array.isArray(paymentListData)) {
      paymentListData.forEach((paymentItem: any) => {
        const payment = paymentItem.payment;
        const amount = Number(paymentItem.amount) || 0;
        
        // 如果支付方式在固定列表中，累加金额
        if (payment && paymentList.includes(payment)) {
          grouped[date][payment] = (grouped[date][payment] || 0) + amount;
        }
      });
    }
  });

  // 计算每行总计
  Object.values(grouped).forEach((row: any) => {
    const sum = paymentList.reduce((sum: number, payment: string) => sum + (row[payment] || 0), 0);
    row.total = parseFloat(sum.toFixed(2));
  });

  // 添加总计行
  const totalRow: any = { date: "total" };
  paymentList.forEach((payment: string) => {
    const sum = Object.values(grouped).reduce((sum: number, row: any) => {
      return sum + (row[payment] || 0);
    }, 0);
    totalRow[payment] = parseFloat(sum.toFixed(2));
  });
  const totalSum = paymentList.reduce((sum: number, payment: string) => sum + (totalRow[payment] || 0), 0);
  totalRow.total = parseFloat(totalSum.toFixed(2));

  // 按日期排序（除了总计行）
  const rows = Object.values(grouped) as any[];
  rows.sort((a, b) => {
    if (a.date === 'total' || b.date === 'total') return 0;
    return moment(a.date).valueOf() - moment(b.date).valueOf();
  });

  return [...rows, totalRow];
}

// 定义表格列
const columns = [
  { title: "Date", dataIndex: "date", key: "date", width: 150, fixed: 'left' as const },
  ...paymentList.map(payment => ({
    title: payment,
    dataIndex: payment,
    key: payment,
    width: 150,
    render: (value: number | null) => value !== null && value !== undefined ? value.toFixed(2) : '0.00',
  })),
  { 
    title: "total", 
    dataIndex: "total", 
    key: "total",
    width: 150,
    fixed: 'right' as const,
    render: (value: number | null) => value !== null && value !== undefined ? value.toFixed(2) : '0.00',
  }
];

export default function PaymentMethodSaleDrawer({ visible, onClose }: PaymentMethodSaleDrawerProps) {
  const { t } = useTranslation();
  const { getFinanceStoreAccess } = usePermissions();
  const [data, setData] = useState<any[]>([]);
  const [dateTime, setDateTime] = useState<any>();
  const [activeTab, setActiveTab] = useState('2'); // 默认二店
  const [loading, setLoading] = useState(false);

  // 获取财务用户可访问的店铺
  const financeStoreAccess = getFinanceStoreAccess();

  // 查询数据
  const onQuery = useCallback(async () => {
    try {
      setLoading(true);
      let query: ReceiptListRequest;
      
      if (dateTime && dateTime.length === 2) {
        query = {
          searchPage: {
            desc: 1,
            page: 1,
            pageSize: 9999, // 获取所有数据用于统计
            sort: 'create_date'
          },
          store: parseInt(activeTab),
          startDateTime: dateTime[0].startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          endDateTime: dateTime[1].endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        };
      } else {
        // 如果没有选择日期，默认查询今天
        const today = moment();
        query = {
          searchPage: {
            desc: 1,
            page: 1,
            pageSize: 9999,
            sort: 'create_date'
          },
          store: parseInt(activeTab),
          startDateTime: today.startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          endDateTime: today.endOf('day').format('YYYY-MM-DD HH:mm:ss'),
        };
      }

      const response = await receipt.getList(query);
      if (response.code === 200) {
        // 过滤掉已作废的账单
        const validReceipts = response.data.content.filter((receipt: ReceiptData) => 
          !receipt.voided || receipt.voided === 0
        );
        setData(transformData(validReceipts));
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('获取支付方式销售数据失败:', error);
      setData([]);
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

  // 根据财务用户权限过滤可显示的店铺
  const tabItems = useMemo(() => {
    const allTabs = [
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
              scroll={{ x: 'max-content' }}
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
              scroll={{ x: 'max-content' }}
            />
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
  }, [financeStoreAccess, t, data, loading, onQuery, dateTime]);

  // 当财务用户只能访问一个店铺时，自动设置activeTab
  useEffect(() => {
    if (financeStoreAccess !== null) {
      setActiveTab(financeStoreAccess.toString());
    }
  }, [financeStoreAccess]);

  return (
    <Drawer
      title={t('paymentMethodSales') || '支付方式销售统计'}
      placement="right"
      onClose={onClose}
      open={visible}
      width={1200}
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


'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, DatePicker, Drawer, Tabs, Card, Spin, Tag, Divider } from 'antd';
import { useTranslation } from 'react-i18next';
import { ReceiptData, ReceiptListRequest } from '@/lib/types';
import { receipt } from '@/lib/api';
import { usePermissions } from '@/lib/usePermissions';
import moment from 'moment';
import { paymentList } from '@/app/components/pages/bill/PrintReceipt';
import { t } from 'i18next';

interface PaymentMethodSaleDrawerProps {
  visible: boolean;
  onClose: () => void;
}

// 数字格式化函数：大于1000时添加千位分隔符
const formatNumberWithCommas = (num: number | string | null | undefined): string => {
  if (num === null || num === undefined) return '0.00';
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '0.00';
  
  const parts = numValue.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
};

// 排除 Slady Voucher 后的支付方式列表
const filteredPaymentList = paymentList.filter(payment => payment !== 'Slady Voucher');

// 转换数据 -> pivot 格式（按日期和支付方式）
function transformData(data: ReceiptData[]) {
  const grouped: any = {};

  data.forEach((receipt: ReceiptData) => {
    // 获取日期（格式化为 YYYY-MM-DD）
    const date = moment(receipt.receiptDate || receipt.createDate).format('YYYY-MM-DD');
    
    if (!grouped[date]) {
      grouped[date] = { date };
      // 初始化所有支付方式为 0（排除 Slady Voucher）
      filteredPaymentList.forEach(payment => (grouped[date][payment] = 0));
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
        
        // 如果支付方式在固定列表中且不是 Slady Voucher，累加金额
        if (payment && payment !== 'Slady Voucher' && filteredPaymentList.includes(payment)) {
          grouped[date][payment] = (grouped[date][payment] || 0) + amount;
        }
      });
    }
  });

  // 计算每行总计（只计算排除 Slady Voucher 后的支付方式）
  Object.values(grouped).forEach((row: any) => {
    const sum = filteredPaymentList.reduce((sum: number, payment: string) => sum + (row[payment] || 0), 0);
    row.total = parseFloat(sum.toFixed(2));
  });

  // 添加总计行（只统计排除 Slady Voucher 后的支付方式）
  const totalRow: any = { date: "total" };
  filteredPaymentList.forEach((payment: string) => {
    const sum = Object.values(grouped).reduce((sum: number, row: any) => {
      return sum + (row[payment] || 0);
    }, 0);
    totalRow[payment] = parseFloat(sum.toFixed(2));
  });
  const totalSum = filteredPaymentList.reduce((sum: number, payment: string) => sum + (totalRow[payment] || 0), 0);
  totalRow.total = parseFloat(totalSum.toFixed(2));

  // 按日期排序（除了总计行）
  const rows = Object.values(grouped) as any[];
  rows.sort((a, b) => {
    if (a.date === 'total' || b.date === 'total') return 0;
    return moment(a.date).valueOf() - moment(b.date).valueOf();
  });

  return [...rows, totalRow];
}

// 手机版卡片组件
const MobilePaymentMethodCard = ({ data }: { data: any[] }) => {
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
            
            {/* 支付方式数据 */}
            <div className="grid grid-cols-2 gap-3">
              {filteredPaymentList.map(payment => (
                <div key={payment} className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">{payment}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${formatNumberWithCommas(row[payment] || 0)}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 总计 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-blue-900">{t('total')}</span>
                <span className="text-xl font-bold text-blue-900">
                  ${formatNumberWithCommas(row.total || 0)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

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
    // 如果财务用户有限制，不允许切换到其他店铺
    if (financeStoreAccess && key !== financeStoreAccess.toString()) {
      return;
    }
    setActiveTab(key);
  };

  // 根据财务用户权限过滤可显示的店铺
  const tabItems = useMemo(() => {
    const allTabs = [
      {
        key: '1',
        label: t('Slady一店'),
        children: (
          <div className="p-4">
            <div className="mb-4">
              <DatePicker.RangePicker 
                placeholder={[t('startTime'), t('endTime')]} 
                onChange={(e) => setDateTime(e)}
                style={{ width: '100%', marginBottom: 12 }}
              />
              <Button type="primary" onClick={onQuery} loading={loading} block>
                {t('search')}
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">{t('loading')}</div>
              </div>
            ) : (
              <MobilePaymentMethodCard data={data} />
            )}
          </div>
        ),
      },
      {
        key: '2',
        label: t('SL二店'),
        children: (
          <div className="p-4">
            <div className="mb-4">
              <DatePicker.RangePicker 
                placeholder={[t('startTime'), t('endTime')]} 
                onChange={(e) => setDateTime(e)}
                style={{ width: '100%', marginBottom: 12 }}
              />
              <Button type="primary" onClick={onQuery} loading={loading} block>
                {t('search')}
              </Button>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">{t('loading')}</div>
              </div>
            ) : (
              <MobilePaymentMethodCard data={data} />
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
  }, [financeStoreAccess, t, data, loading, onQuery, dateTime]);

  // 当财务用户只能访问一个店铺时，自动设置activeTab
  useEffect(() => {
    if (financeStoreAccess !== null && visible) {
      setActiveTab(financeStoreAccess.toString());
    }
  }, [financeStoreAccess, visible]);

  return (
    <Drawer
      title={t('paymentMethodSales') || '支付方式销售统计'}
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


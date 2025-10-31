'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, DatePicker, Button, message, Pagination, Spin, Tag, Tabs, Space, Divider } from 'antd';
import { SearchOutlined, ReloadOutlined, PrinterOutlined, FileTextOutlined, DollarOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ReceiptData, ReceiptListRequest } from '@/lib/types';
import { receipt } from '@/lib/api';
import moment from 'moment';
import PrintReceipt from './PrintReceipt';
import PrintLabelDrawer from './PrintLabelDrawer';
import PrintDailyReportDrawer from './PrintDailyReportDrawer';
import DailySaleDrawer from './DailySaleDrawer';
import CashInOutDrawer from './CashInOutDrawer';
import OpeningClosingBalanceDrawer from './OpeningClosingBalanceDrawer';

export default function BillManagement() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [data, setData] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('2'); // 默认显示二店
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [currentView, setCurrentView] = useState<'list' | 'print'>('list');
  const [printLabelVisible, setPrintLabelVisible] = useState(false);
  const [printDailyReportVisible, setPrintDailyReportVisible] = useState(false);
  const [dailySaleVisible, setDailySaleVisible] = useState(false);
  const [cashInOutVisible, setCashInOutVisible] = useState(false);
  const [openingClosingBalanceVisible, setOpeningClosingBalanceVisible] = useState(false);

  // 获取数据
  const fetchData = async (page = 1, searchParams: any = {}) => {
    setLoading(true);
    setData([]);
    
    try {
      const formValues = form.getFieldsValue();
      const params: ReceiptListRequest = {
        searchPage: {
          desc: 1,
          page,
          pageSize: 20,
          sort: 'create_date'
        },
        store: parseInt(activeTab),
        ...formValues,
        ...searchParams
      };

      // 处理日期范围
      if (formValues.createDate && formValues.createDate.length === 2) {
        params.startDate = formValues.createDate[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
        params.endDate = formValues.createDate[1].endOf('day').format('YYYY-MM-DD HH:mm:ss');
        delete (params as any).createDate;
      }

      const response = await receipt.getList(params);
      if (response.code === 200) {
        setData(response.data.content);
        setPagination({
          current: response.data.number + 1,
          pageSize: response.data.size,
          total: response.data.totalElements,
        });
      } else {
        setData([]);
        setPagination({
          current: 1,
          pageSize: 20,
          total: 0,
        });
      }
    } catch (error) {
      console.error('获取账单数据失败:', error);
      message.error(t('获取账单数据失败'));
      setData([]);
      setPagination({
        current: 1,
        pageSize: 20,
        total: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true);
      fetchData();
    }
  }, [hasLoaded]);

  // Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setHasLoaded(false);
    setPagination({
      current: 1,
      pageSize: 20,
      total: 0,
    });
  };

  // 搜索
  const handleSearch = () => {
    fetchData(1);
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    fetchData(1);
  };

  // 分页变化
  const handleTableChange = (page: number) => {
    fetchData(page);
  };

  // 重新打印
  const handleReprint = async (id: number) => {
    try {
      await receipt.reprint(id);
      message.success(t('reprintSuccess'));
    } catch (error) {
      console.error('重新打印失败:', error);
      message.error(t('reprintFailed'));
    }
  };

  // 进入打印账单页面
  const handlePrintReceipt = () => {
    setCurrentView('print');
  };

  // 返回列表
  const handleBackToList = () => {
    setCurrentView('list');
  };

  // 解析商品列表
  const parseItemList = (value: any) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return [];
    }
  };

  // 渲染账单卡片
  const renderBillCard = (item: ReceiptData, index: number) => {
    const itemList = parseItemList(item.itemList);
    const totalAmount = itemList.reduce((sum: number, it: any) => sum + (Number(it.finalPrice ?? it.price) * it.qty), 0);

    return (
      <Card
        key={item.id}
        className="mb-3 hover:shadow-md transition-shadow duration-200"
        style={{ borderRadius: 12 }}
      >
        <div className="space-y-3">
          {/* 账单头部信息 */}
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileTextOutlined className="text-gray-500" />
            <span className="font-bold text-gray-900">#{item.id}</span>
          </div>

          </div>

          {/* REFNO */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">REFNO:</span>
            <span className="font-medium text-gray-900">{item.refNo}</span>
          </div>

          {/* 商品列表 */}
          <div className="space-y-2">
            <div className="text-sm text-gray-600">{t('itemDetails')}:</div>
            <div className="space-y-1">
              {itemList.map((it: any, idx: number) => (
                <div key={`${it.code}-${idx}`} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                  <div className="flex-1">
                    <span className="font-medium text-blue-600">{it.code}</span>
                    <span className="text-gray-500 ml-2">× {it.qty}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">
                      ${Number(it.finalPrice ?? it.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider className="my-3" />

          {/* 账单底部信息 */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-gray-500" />
              <span className="font-medium">{moment(item.receiptDate).format('YYYY-MM-DD')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserOutlined className="text-gray-500" />
              <span className="text-gray-600">{t('cashier')}:</span>
              <span className="font-medium">{item.cashier}</span>
            </div>
          </div>

          {/* 总金额 */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">{t('totalAmount')}:</span>
              <span className="text-xl font-bold text-blue-600">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end">
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleReprint(item.id)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t('reprint')}
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const tabItems = [
    {
      key: '1',
      label: t('store1'),
    },
    {
      key: '2',
      label: t('store2'),
    },
  ];

  if (currentView === 'print') {
    return (
      <PrintReceipt onBackToList={handleBackToList} />
    );
  }

  return (
    <div className="p-4">
      {/* 功能按钮区域 */}
      <Card className="mb-4" style={{ borderRadius: 12 }}>
        <div className="space-y-3">
          <div className="text-lg font-bold text-gray-900 mb-3">{t('billManagement')}</div>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              type="primary" 
              icon={<PrinterOutlined />} 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handlePrintReceipt}
            >
              {t('printReceipt')}
            </Button>
            <Button 
              icon={<FileTextOutlined />}
              onClick={() => setPrintLabelVisible(true)}
            >
              {t('printLabel')}
            </Button>
            <Button 
              icon={<CalendarOutlined />}
              onClick={() => setPrintDailyReportVisible(true)}
            >
              {t('printDailyReport')}
            </Button>
            <Button 
              icon={<DollarOutlined />}
              onClick={() => setDailySaleVisible(true)}
            >
              {t('dailySales')}
            </Button>
            <Button 
              icon={<DollarOutlined />}
              onClick={() => setCashInOutVisible(true)}
            >
              {t('cashInOut')}
            </Button>
            <Button 
              icon={<CalendarOutlined />}
              onClick={() => setOpeningClosingBalanceVisible(true)}
            >
              {t('openingClosingBalance')}
            </Button>
          </div>
        </div>
      </Card>

      {/* 搜索表单 */}
      <Card className="mb-4" style={{ borderRadius: 12 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
        >
          <div className="grid grid-cols-1">
            <Form.Item name="refNo" label={t('refNo')}>
              <Input placeholder={t('pleaseEnterRefNo')} />
            </Form.Item>
            <Form.Item name="createDate" label={t('createTime')}>
              <DatePicker.RangePicker 
                placeholder={[t('startTime'), t('endTime')]}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} className="flex-1">
              {t('search')}
            </Button>
            <Button onClick={handleReset} icon={<ReloadOutlined />} className="flex-1">
              {t('reset')}
            </Button>
          </div>
        </Form>
      </Card>

      {/* 店铺选择和数据列表 */}
      <Card style={{ borderRadius: 12 }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
          className="mb-4"
        />
        
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4 text-gray-500">{t('loading')}</div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4 text-gray-300">🧾</div>
            <div className="text-gray-500 text-lg">{t('noData')}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => renderBillCard(item, index))}
          </div>
        )}
        
        {/* 分页 */}
        {data.length > 0 && (
          <div className="mt-6 text-center">
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handleTableChange}
              showSizeChanger={false}
              showQuickJumper
              className="mobile-pagination"
            />
          </div>
        )}
      </Card>

      {/* Drawer组件 */}
      <PrintLabelDrawer 
        visible={printLabelVisible} 
        onClose={() => setPrintLabelVisible(false)} 
      />
      <PrintDailyReportDrawer 
        visible={printDailyReportVisible} 
        onClose={() => setPrintDailyReportVisible(false)} 
      />
      <DailySaleDrawer 
        visible={dailySaleVisible} 
        onClose={() => setDailySaleVisible(false)} 
      />
      <CashInOutDrawer 
        visible={cashInOutVisible} 
        onClose={() => setCashInOutVisible(false)} 
      />
      <OpeningClosingBalanceDrawer 
        visible={openingClosingBalanceVisible} 
        onClose={() => setOpeningClosingBalanceVisible(false)} 
      />
    </div>
  );
}

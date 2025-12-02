'use client';

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, DatePicker, Button, message, Pagination, Spin, Tag, Tabs, Space, Divider, Drawer } from 'antd';
import { SearchOutlined, ReloadOutlined, PrinterOutlined, FileTextOutlined, DollarOutlined, CalendarOutlined, UserOutlined, DeleteOutlined, ExclamationCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ReceiptData, ReceiptListRequest } from '@/lib/types';
import { receipt } from '@/lib/api';
import moment from 'moment';
import { usePermissions } from '@/lib/usePermissions';
import PrintReceipt from './PrintReceipt';
import PrintLabelDrawer from './PrintLabelDrawer';
import PrintDailyReportDrawer from './PrintDailyReportDrawer';
import DailySaleDrawer from './DailySaleDrawer';
import PaymentMethodSaleDrawer from './PaymentMethodSaleDrawer';
import CashInOutDrawer from './CashInOutDrawer';
import OpeningClosingBalanceDrawer from './OpeningClosingBalanceDrawer';

export default function BillManagement() {
  const { t } = useTranslation();
  const { canUseFeature, getFinanceStoreAccess, isFinance } = usePermissions();
  const [form] = Form.useForm();
  const [data, setData] = useState<ReceiptData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // 获取财务用户的店铺限制
  const financeStoreAccess = getFinanceStoreAccess();
  // 根据财务用户限制设置默认 tab
  const defaultTab = financeStoreAccess ? financeStoreAccess.toString() : '2';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [currentView, setCurrentView] = useState<'list' | 'print'>('list');
  const [printLabelVisible, setPrintLabelVisible] = useState(false);
  const [printDailyReportVisible, setPrintDailyReportVisible] = useState(false);
  const [dailySaleVisible, setDailySaleVisible] = useState(false);
  const [paymentMethodSaleVisible, setPaymentMethodSaleVisible] = useState(false);
  const [cashInOutVisible, setCashInOutVisible] = useState(false);
  const [openingClosingBalanceVisible, setOpeningClosingBalanceVisible] = useState(false);
  const [deleteDrawerVisible, setDeleteDrawerVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteReceiptId, setDeleteReceiptId] = useState<number | null>(null);
  const [voidDrawerVisible, setVoidDrawerVisible] = useState(false);
  const [voidLoading, setVoidLoading] = useState(false);
  const [voidReceiptId, setVoidReceiptId] = useState<number | null>(null);

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
        params.startDateTime = formValues.createDate[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
        params.endDateTime = formValues.createDate[1].endOf('day').format('YYYY-MM-DD HH:mm:ss');
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

  // 确保财务用户的 activeTab 符合限制
  useEffect(() => {
    if (financeStoreAccess && activeTab !== financeStoreAccess.toString()) {
      setActiveTab(financeStoreAccess.toString());
      setHasLoaded(false);
    }
  }, [financeStoreAccess]);

  // Tab切换
  const handleTabChange = (key: string) => {
    // 如果财务用户有限制，不允许切换到其他店铺
    if (financeStoreAccess && key !== financeStoreAccess.toString()) {
      return;
    }
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

  // 打开删除确认抽屉
  const handleDelete = (id: number) => {
    setDeleteReceiptId(id);
    setDeleteDrawerVisible(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deleteReceiptId) return;
    
    setDeleteLoading(true);
    try {
      await receipt.delete(deleteReceiptId);
      message.success(t('deleteSuccess'));
      setDeleteDrawerVisible(false);
      setDeleteReceiptId(null);
      // 刷新列表
      fetchData(pagination.current);
    } catch (error) {
      console.error('删除失败:', error);
      message.error(t('deleteFailed'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // 关闭删除确认抽屉
  const handleCloseDeleteDrawer = () => {
    setDeleteDrawerVisible(false);
    setDeleteReceiptId(null);
  };

  // 打开 void 确认抽屉
  const handleVoid = (id: number) => {
    setVoidReceiptId(id);
    setVoidDrawerVisible(true);
  };

  // 确认 void
  const handleConfirmVoid = async () => {
    if (!voidReceiptId) return;
    
    setVoidLoading(true);
    try {
      await receipt.modifyVoided(voidReceiptId, 1);
      message.success(t('voidSuccess') || 'Void成功');
      setVoidDrawerVisible(false);
      setVoidReceiptId(null);
      // 刷新列表
      fetchData(pagination.current);
    } catch (error) {
      console.error('Void失败:', error);
      message.error(t('voidFailed') || 'Void失败');
    } finally {
      setVoidLoading(false);
    }
  };

  // 关闭 void 确认抽屉
  const handleCloseVoidDrawer = () => {
    setVoidDrawerVisible(false);
    setVoidReceiptId(null);
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
      if (value === undefined || value === null) {
        return [];
      }
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // 解析支付列表
  const parsePaymentList = (value: any) => {
    try {
      if (value === undefined || value === null) {
        return [];
      }
      const parsed = typeof value === 'string' ? JSON.parse(value) : value;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  // 渲染账单卡片
  const renderBillCard = (item: ReceiptData, index: number) => {
    const itemList = parseItemList(item.itemList);
    const paymentList = parsePaymentList(item.paymentList);
    const totalAmount = (itemList || []).reduce((sum: number, it: any) => sum + (Number(it.finalPrice ?? it.price) * (it.qty || 0)), 0);

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
            {/* Void 状态 */}
            <Tag color={(item.voided ?? 0) === 0 ? 'green' : 'red'}>
              {(item.voided ?? 0) === 0 ? 'normal' : 'void'}
            </Tag>
          </div>

          {/* REFNO */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{t('itemCode')}:</span>
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

          {/* 支付方式列表 */}
          {paymentList && paymentList.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">{t('paymentMethod')}:</div>
              <div className="space-y-1">
                {paymentList.map((payment: any, idx: number) => (
                  <div key={`${payment.payment}-${idx}`} className="flex items-center justify-between bg-green-50 rounded-lg p-2">
                    <span className="font-medium text-gray-900">{payment.payment}</span>
                    <span className="font-bold text-green-600">
                      ${Number(payment.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* 操作按钮 - 财务用户不显示 */}
          {!isFinance() && (
            <div className="flex justify-end gap-2">
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleReprint(item.id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {t('reprint')}
              </Button>
              <Button 
                type="primary" 
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleVoid(item.id)}
              >
                void
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // 根据财务用户限制过滤 tab 项
  const allTabItems = [
    {
      key: '1',
      label: t('Slady一店'),
    },
    {
      key: '2',
      label: t('SL二店'),
    },
  ];

  // 如果财务用户有限制，只显示对应的 tab
  const tabItems = financeStoreAccess 
    ? allTabItems.filter(item => item.key === financeStoreAccess.toString())
    : allTabItems;

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
            {canUseFeature('printReceipt') && (
              <Button 
                type="primary" 
                icon={<PrinterOutlined />} 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handlePrintReceipt}
              >
                {t('printReceipt')}
              </Button>
            )}
            {canUseFeature('printLabel') && (
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => setPrintLabelVisible(true)}
              >
                {t('printLabel')}
              </Button>
            )}
            {canUseFeature('printDailyReport') && (
              <Button 
                icon={<CalendarOutlined />}
                onClick={() => setPrintDailyReportVisible(true)}
              >
                {t('printDailyReport')}
              </Button>
            )}
            {canUseFeature('dailySales') && (
              <Button 
                icon={<DollarOutlined />}
                onClick={() => setDailySaleVisible(true)}
              >
                {t('dailySales')}
              </Button>
            )}
            {canUseFeature('dailySales') && (
              <Button 
                icon={<DollarOutlined />}
                onClick={() => setPaymentMethodSaleVisible(true)}
              >
                {t('paymentMethodSales') || '支付方式销售统计'}
              </Button>
            )}
            {canUseFeature('cashInOut') && (
              <Button 
                icon={<DollarOutlined />}
                onClick={() => setCashInOutVisible(true)}
              >
                {t('cashInOut')}
              </Button>
            )}
            {canUseFeature('openingClosingBalance') && (
              <Button 
                icon={<CalendarOutlined />}
                onClick={() => setOpeningClosingBalanceVisible(true)}
              >
                {t('openingClosingBalance')}
              </Button>
            )}
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
            <Form.Item name="refNo" label={t('itemCode')}>
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
      <PaymentMethodSaleDrawer 
        visible={paymentMethodSaleVisible} 
        onClose={() => setPaymentMethodSaleVisible(false)} 
      />
      <CashInOutDrawer 
        visible={cashInOutVisible} 
        onClose={() => setCashInOutVisible(false)} 
      />
      <OpeningClosingBalanceDrawer 
        visible={openingClosingBalanceVisible} 
        onClose={() => setOpeningClosingBalanceVisible(false)} 
      />

      {/* 删除确认抽屉 */}
      <Drawer
        title={t('confirmDelete')}
        placement="bottom"
        onClose={handleCloseDeleteDrawer}
        open={deleteDrawerVisible}
        height={300}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button 
              onClick={handleCloseDeleteDrawer} 
              style={{ flex: 1 }}
              block
            >
              {t('cancel')}
            </Button>
            <Button 
              type="primary" 
              danger 
              loading={deleteLoading}
              onClick={handleConfirmDelete}
              style={{ flex: 1 }}
              block
            >
              {t('confirmDelete')}
            </Button>
          </div>
        }
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <ExclamationCircleOutlined style={{ fontSize: 24, color: '#ff4d4f', marginRight: 12 }} />
            <span style={{ fontSize: 16, fontWeight: 500 }}>{t('confirmDeleteReceipt')}</span>
          </div>
          <div style={{ color: '#666', lineHeight: 1.8 }}>
            <p>{t('deleteReceiptWarning')}</p>
            {deleteReceiptId && (
              <p style={{ marginTop: 8 }}>
                <strong>{t('receiptId')}：</strong>{deleteReceiptId}
              </p>
            )}
          </div>
        </div>
      </Drawer>

      {/* Void 确认抽屉 */}
      <Drawer
        title="Confirm Void"
        placement="bottom"
        onClose={handleCloseVoidDrawer}
        open={voidDrawerVisible}
        height={300}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button 
              onClick={handleCloseVoidDrawer} 
              style={{ flex: 1 }}
              block
            >
              {t('cancel')}
            </Button>
            <Button 
              type="primary" 
              danger 
              loading={voidLoading}
              onClick={handleConfirmVoid}
              style={{ flex: 1 }}
              block
            >
              Confirm Void
            </Button>
          </div>
        }
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <ExclamationCircleOutlined style={{ fontSize: 24, color: '#ff4d4f', marginRight: 12 }} />
            <span style={{ fontSize: 16, fontWeight: 500 }}>Confirm Void Receipt</span>
          </div>
          <div style={{ color: '#666', lineHeight: 1.8 }}>
            <p>Are you sure you want to void this receipt? This action cannot be undone.</p>
            {voidReceiptId && (
              <p style={{ marginTop: 8 }}>
                <strong>Receipt ID：</strong>{voidReceiptId}
              </p>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

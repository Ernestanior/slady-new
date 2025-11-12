'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Pagination, Form, Input, DatePicker, Tag, Tabs, Drawer } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, PrinterOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ReceiptData, ReceiptListRequest } from '@/lib/types';
import { receipt } from '@/lib/api';
import moment from 'moment';
import { usePermissions } from '@/lib/usePermissions';
import PrintReceipt from './PrintReceipt';
import PrintLabelDrawer from './PrintLabelDrawer';
import PrintDailyReportDrawer from './PrintDailyReportDrawer';
import DailySaleDrawer from './DailySaleDrawer';
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
  const [cashInOutVisible, setCashInOutVisible] = useState(false);
  const [openingClosingBalanceVisible, setOpeningClosingBalanceVisible] = useState(false);
  const [deleteDrawerVisible, setDeleteDrawerVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteReceiptId, setDeleteReceiptId] = useState<number | null>(null);

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
      message.success(t('重新打印成功'));
    } catch (error) {
      console.error('重新打印失败:', error);
      message.error(t('重新打印失败'));
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

  // 进入打印账单页面
  const handlePrintReceipt = () => {
    setCurrentView('print');
  };

  // 返回列表
  const handleBackToList = () => {
    setCurrentView('list');
  };

  // 表格列定义
  const baseColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'REFNO',
      dataIndex: 'refNo',
      key: 'refNo',
      width: 150,
    },
    {
      title: 'ITEM',
      dataIndex: 'itemList',
      key: 'itemList',
      width: 300,
      render: (value: any) => {
        // value 可能是 JSON 字符串，也可能已经是数组
        let arr: Array<{
          qty: number;
          code: string;
          price: number;
          discount: number;
          finalPrice: number;
          discountPercent: number;
        }> = [];
    
        try {
          arr = typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          return <span>-</span>;
        }
        if (!Array.isArray(arr)) return <span>-</span>;
    
  return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {arr.map((it, idx) => (
              <Tag key={`${it.code}-${idx}`}>
                <span style={{color:"#396293",fontWeight:"bold"}}>{it.code}</span> × {it.qty} | ${Number(it.finalPrice ?? it.price).toFixed(2)}
              </Tag>
            ))}
          </div>
        );
      }
    },
    {
      title: 'DATE',
      dataIndex: 'receiptDate',
      key: 'receiptDate',
      width: 150,
    },
    {
      title: 'CASHIER',
      dataIndex: 'cashier',
      key: 'cashier',
      width: 120,
    },
    {
      title: 'PAYMENT',
      dataIndex: 'paymentList',
      key: 'paymentList',
      width: 250,
      render: (value: any) => {
        // value 可能是 JSON 字符串，也可能已经是数组
        let arr: Array<{
          payment: string;
          amount: number;
        }> = [];
    
        try {
          arr = typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          return <span>-</span>;
        }
        if (!Array.isArray(arr) || arr.length === 0) return <span>-</span>;
    
        return (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {arr.map((it, idx) => (
              <Tag key={`${it.payment}-${idx}`} color="blue">
                {it.payment}: ${Number(it.amount).toFixed(2)}
              </Tag>
            ))}
          </div>
        );
      }
    },
  ];

  // 如果不是财务用户，添加 REPRINT 和操作列
  const columns = isFinance() 
    ? baseColumns 
    : [
        ...baseColumns,
        {
          title: 'REPRINT',
          dataIndex: 'id',
          key: 'reprint',
          width: 100,
          render: (id: number) => (
            <Button onClick={() => handleReprint(id)}>
              reprint
            </Button>
          ),
        },
        {
          title: t('operation'),
          key: 'action',
          width: 150,
          fixed: 'right' as const,
          render: (_: any, record: ReceiptData) => (
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            >
              {t('delete')}
            </Button>
          ),
        },
      ];

  if (currentView === 'print') {
    return (
      <PrintReceipt onBackToList={handleBackToList} />
    );
  }

  // 根据财务用户限制过滤 tab 项
  const allTabItems = [
    {
      key: '1',
      label: '一店',
      children: (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1350 }}
        />
      ),
    },
    {
      key: '2',
      label: '二店',
      children: (
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1350 }}
        />
      ),
    },
  ];

  // 如果财务用户有限制，只显示对应的 tab
  const tabItems = financeStoreAccess 
    ? allTabItems.filter(item => item.key === financeStoreAccess.toString())
    : allTabItems;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        flexDirection:"column",
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {canUseFeature('printReceipt') && (
            <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrintReceipt}>{t('printReceipt')}</Button>
          )}
          {canUseFeature('printLabel') && (
            <Button onClick={() => setPrintLabelVisible(true)}>
              {t('printLabel')}
            </Button>
          )}
          {canUseFeature('printDailyReport') && (
            <Button onClick={() => setPrintDailyReportVisible(true)}>
              {t('printDailyReport')}
            </Button>
          )}
          {canUseFeature('dailySales') && (
            <Button onClick={() => setDailySaleVisible(true)}>
              {t('dailySales')}
            </Button>
          )}
          {canUseFeature('cashInOut') && (
            <Button onClick={() => setCashInOutVisible(true)}>
              Cash In/Out
            </Button>
          )}
          {canUseFeature('openingClosingBalance') && (
            <Button onClick={() => setOpeningClosingBalanceVisible(true)}>
              Opening/Closing Balance
            </Button>
          )}
        </div>
      </div>
      
      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="refNo" label="REFNO">
            <Input placeholder={t('pleaseEnterRefNo')} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="createDate" label={t('createTime')}>
            <DatePicker.RangePicker 
              placeholder={[t('startTime'), t('endTime')]} 
              style={{ width: 300 }}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            {t('search')}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
            {t('reset')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="large"
        />
        
        {/* 分页 */}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handleTableChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
            }
          />
        </div>
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

      {/* 删除确认抽屉 */}
      <Drawer
        title={t('confirmDelete')}
        placement="right"
        onClose={handleCloseDeleteDrawer}
        open={deleteDrawerVisible}
        width={400}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={handleCloseDeleteDrawer} style={{ marginRight: 8 }}>
              {t('cancel')}
            </Button>
            <Button 
              type="primary" 
              danger 
              loading={deleteLoading}
              onClick={handleConfirmDelete}
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
    </div>
  );
}
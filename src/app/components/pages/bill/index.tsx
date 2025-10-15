'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Pagination, Collapse, Form, Input, DatePicker, Tag, Tabs } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, PrinterOutlined } from '@ant-design/icons';
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
      message.success(t('重新打印成功'));
    } catch (error) {
      console.error('重新打印失败:', error);
      message.error(t('重新打印失败'));
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

  // 表格列定义
  const columns = [
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
  ];

  if (currentView === 'print') {
    return (
      <PrintReceipt onBackToList={handleBackToList} />
    );
  }

  const tabItems = [
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
          scroll={{ x: 1000 }}
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
          scroll={{ x: 1000 }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{t('billManagement')}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrintReceipt}>{t('printReceipt')}</Button>
          <Button onClick={() => setPrintLabelVisible(true)}>
            {t('printLabel')}
          </Button>
          <Button onClick={() => setPrintDailyReportVisible(true)}>
            {t('printDailyReport')}
          </Button>
          <Button onClick={() => setDailySaleVisible(true)}>
            {t('dailySales')}
          </Button>
          <Button onClick={() => setCashInOutVisible(true)}>
            Cash In/Out
          </Button>
          <Button onClick={() => setOpeningClosingBalanceVisible(true)}>
            Opening/Closing Balance
          </Button>
        </div>
      </div>
      
      {/* 高级搜索 */}
      <Card style={{ marginBottom: 16 }}>
        <Collapse
          items={[
            {
              key: 'search',
              label: (
                <span>
                  <FilterOutlined style={{ marginRight: 8 }} />
                  {t('advancedSearch')}
                </span>
              ),
              children: (
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
              ),
            },
          ]}
        />
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
    </div>
  );
}
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Form, Input, InputNumber, Select, DatePicker, Drawer, Tabs, Modal, message, Card, Spin, Tag, Divider } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CashData, CashListRequest, CreateCashRequest } from '@/lib/types';
import { cashService } from '@/lib/api';
import moment from 'moment';
import { t } from 'i18next';

interface CashInOutDrawerProps {
  visible: boolean;
  onClose: () => void;
}

// 手机版现金流水卡片组件
const MobileCashCard = ({ data, onDelete }: { data: CashData[], onDelete: (record: CashData) => void }) => {
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <Card 
          key={item.id} 
          className="border border-gray-200"
          style={{ borderRadius: 12 }}
        >
          <div className="space-y-3">
            {/* 头部信息 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag color={item.type === 1 ? 'green' : 'red'} className="text-xs">
                  {item.type === 1 ? 'Cash In' : 'Cash Out'}
                </Tag>
                <span className="text-sm text-gray-500">ID: {item.id}</span>
              </div>
              <Button 
                type="link" 
                danger 
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onDelete(item)}
              >
                {t('delete')}
              </Button>
            </div>
            
            <Divider className="my-2" />
            
            {/* 金额显示 */}
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                item.type === 1 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(item.amount)}
              </div>
            </div>
            
            {/* 详细信息 */}
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">REMARK</div>
                <div className="text-gray-900">{item.remark}</div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">{t('createTime')}</div>
                <div className="text-gray-900">
                  {moment(item.createDate).format('YYYY-MM-DD HH:mm')}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default function CashInOutDrawer({ visible, onClose }: CashInOutDrawerProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [data, setData] = useState<CashData[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('2'); // 默认二店
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 获取数据
  const fetchData = async (page = 1, searchParams: any = {}) => {
    setLoading(true);
    setData([]);
    
    try {
      const formValues = form.getFieldsValue();
      const params: CashListRequest = {
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

      const response = await cashService.getList(params);
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
      console.error('获取现金流水失败:', error);
      message.error('获取现金流水失败');
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
    if (visible) {
      fetchData();
    }
  }, [visible, activeTab]);

  // Tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
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

  // 创建现金流水
  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      
      const params: CreateCashRequest = {
        type: values.type,
        amount: values.amount,
        remark: values.remark,
        store: parseInt(activeTab)
      };
      
      await cashService.create(params);
      message.success('创建成功');
      createForm.resetFields();
      setCreateModalVisible(false);
      fetchData(1);
    } catch (error) {
      console.error('创建失败:', error);
      message.error('创建失败');
    } finally {
      setCreateLoading(false);
    }
  };

  // 删除现金流水
  const handleDelete = async (record: CashData) => {
    console.log('删除按钮被点击', record);
    
    try {
      console.log('开始删除记录', record.id);
      await cashService.delete(record.id);
      message.success('删除成功');
      fetchData(1);
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };


  const tabItems = [
    {
      key: '1',
      label: '一店',
      children: (
        <div className="p-4">
          {/* 搜索表单 */}
          <Card className="mb-4" style={{ borderRadius: 12 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearch}
            >
              <div className="grid grid-cols-1">
                <Form.Item name="type" label={t('type')}>
                  <Select placeholder={t('pleaseSelectType')}>
                    <Select.Option value={1}>收入</Select.Option>
                    <Select.Option value={2}>支出</Select.Option>
                  </Select>
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

          {/* 数据表格 */}
          <Card style={{ borderRadius: 12 }}>
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">加载中...</div>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 text-gray-300">💰</div>
                <div className="text-gray-500 text-lg">暂无数据</div>
              </div>
            ) : (
              <MobileCashCard data={data} onDelete={handleDelete} />
            )}
            
            {/* 分页 */}
            {data.length > 0 && (
              <div className="mt-4 text-center">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                  className="w-full"
                >
                  Cash In/Out
                </Button>
              </div>
            )}
          </Card>
        </div>
      ),
    },
    {
      key: '2',
      label: '二店',
      children: (
        <div className="p-4">
          {/* 搜索表单 */}
          <Card className="mb-4" style={{ borderRadius: 12 }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSearch}
            >
              <div className="grid grid-cols-1">
                <Form.Item name="type" label={t('type')}>
                  <Select placeholder={t('pleaseSelectType')}>
                    <Select.Option value={1}>收入</Select.Option>
                    <Select.Option value={2}>支出</Select.Option>
                  </Select>
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

          {/* 数据表格 */}
          <Card style={{ borderRadius: 12 }}>
            {loading ? (
              <div className="text-center py-8">
                <Spin size="large" />
                <div className="mt-4 text-gray-500">加载中...</div>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 text-gray-300">💰</div>
                <div className="text-gray-500 text-lg">暂无数据</div>
              </div>
            ) : (
              <MobileCashCard data={data} onDelete={handleDelete} />
            )}
            
            {/* 分页 */}
            {data.length > 0 && (
              <div className="mt-4 text-center">
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalVisible(true)}
                  className="w-full"
                >
                  Cash In/Out
                </Button>
              </div>
            )}
          </Card>
        </div>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title="Cash In/Out"
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

      {/* 创建现金流水Modal */}
      <Modal
        title="Cash In/Out"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setCreateModalVisible(false)}>
            {t('cancel')}
          </Button>,
          <Button key="submit" type="primary" loading={createLoading} onClick={handleCreate}>
            {t('confirm')}
          </Button>,
        ]}
      >
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{ type: 1, amount: 0, remark: '' }}
        >
          <Form.Item
            name="type"
            label="Cash In/Out"
            rules={[{ required: true, message: t('pleaseSelectType') }]}
          >
            <Select placeholder={t('pleaseSelectType')} defaultValue={1}>
              <Select.Option value={1}>Cash In</Select.Option>
              <Select.Option value={2}>Cash Out</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="AMOUNT"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <InputNumber 
              placeholder="请输入金额" 
              min={0}
              style={{ width: '100%' }} 
            />
          </Form.Item>

          <Form.Item
            name="remark"
            label="REMARK"
            rules={[{ required: true, message: t('pleaseEnterRemark') }]}
          >
            <Input placeholder={t('pleaseEnterRemark')} />
          </Form.Item>

        </Form>
      </Modal>
    </>
  );
}

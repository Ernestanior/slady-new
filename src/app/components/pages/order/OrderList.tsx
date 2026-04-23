'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Table, Button, Modal, Drawer, Form, Input, InputNumber, Select, message, App, Dropdown, Space, DatePicker, Card, Pagination, Image, Spin } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, SendOutlined, CheckOutlined, ExclamationCircleOutlined, ReloadOutlined, CloseOutlined, PrinterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { OrderData, ModifyOrderRequest, colorList, sizeList, WAREHOUSE } from '@/lib/types';
import { order } from '@/lib/api';
import moment from 'moment';
import { useNotification } from '@/lib/notificationManager';

interface OrderListProps {
  warehouseName: string;
  onRefresh: () => void;
  onViewDesignDetail?: (designId: number) => void;
}

const dev_url = 'http://119.28.104.20';

const OrderList = forwardRef<any, OrderListProps>(({ warehouseName, onRefresh, onViewDesignDetail }, ref) => {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [sentForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const [data, setData] = useState<OrderData[]>([]);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [sentDrawerVisible, setSentDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const notification = useNotification();
  
  // 颜色翻译映射 - 支持中英文切换
  const getColorTranslation = (color: string) => {
    const colorMap: Record<string, string> = {
      'Black': t('colorBlack'),
      'White': t('colorWhite'),
      'Grey': t('colorGrey'),
      'Red': t('colorRed'),
      'Orange': t('colorOrange'),
      'Yellow': t('colorYellow'),
      'Green': t('colorGreen'),
      'Blue': t('colorBlue'),
      'Purple': t('colorPurple'),
      'Pink': t('colorPink'),
      'Brown': t('colorBrown'),
      'Beige': t('colorBeige'),
      'Khaki': t('colorKhaki'),
      'Stripes': t('colorStripes'),
      'Grid': t('colorGrid'),
      'Champagne': t('colorChampagne'),
      'Navy': t('colorNavy'),
      'Sky': t('colorSky'),
      'Mustard': t('colorMustard'),
      'Mint': t('colorMint'),
      'Peach': t('colorPeach'),
      'Cream': t('colorCream'),
      'Charcoal': t('colorCharcoal'),
      'Silver': t('colorSilver'),
      'Gold': t('colorGold'),
    };
    return colorMap[color] || color;
  };
  
  // 状态选项
  const statusOptions = [
    { value: "0", label: t('pending') },
    { value: "1", label: t('shipped') },
    { value: "2", label: t('completed') },
    { value: "3", label: t('outOfStock') },
    { value: "4", label: t('damaged') },
    { value: "5", label: t('void') },
  ];

  // 获取订单数据
  const fetchOrders = async (page = 1, searchParams: any = {}) => {
    console.log('fetchOrders called with page:', page, 'searchParams:', searchParams);
    setLoading(true);
    try {
      const formValues = searchForm.getFieldsValue();
      
      const params = {
        areaType: 1,
        warehouseName,
        searchPage: {
          desc: 1,
          page,
          pageSize: 20,
          sort: 'create_date'
        },
        ...formValues,
        ...searchParams
      };
      
      // 处理状态：如果为空则使用默认值
      if (!formValues.status || formValues.status.length === 0) {
        params.status = ['0', '1', '2', '3', '4'];
      }
      
      // 处理日期范围
      if (formValues.dateRange && formValues.dateRange.length === 2) {
        params.startDate = formValues.dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
        params.endDate = formValues.dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss');
        delete params.dateRange;
      }
      
      const response = await order.getPage(params);
      if (response.code === 200) {
        setData(response.data.content);
        setPagination({
          current: response.data.number + 1,
          pageSize: response.data.size,
          total: response.data.totalElements,
        });
      }
    } catch (error) {
      console.error('获取订单数据失败:', error);
      message.error('获取订单数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    refresh: () => {
      console.log('refresh called via ref');
      fetchOrders(1);
    }
  }));

  // 初始化数据
  useEffect(() => {
    console.log('useEffect triggered for warehouseName:', warehouseName);
    fetchOrders();
  }, [warehouseName]);

  // 搜索
  const handleSearch = () => {
    fetchOrders(1);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    fetchOrders(1);
  };

  // 打印/导出
  const handlePrint = async () => {
    if (printLoading) return;
    
    setPrintLoading(true);
    try {
      const formValues = searchForm.getFieldsValue();
      
      const params = {
        areaType: 1,
        warehouseName,
        searchPage: {
          desc: 1,
          page: 1,
          pageSize: 20,
          sort: 'create_date'
        },
        ...formValues
      };
      
      // 处理状态：如果为空则使用默认值
      if (!formValues.status || formValues.status.length === 0) {
        params.status = ['0', '1', '2', '3', '4'];
      }
      
      // 处理日期范围
      if (formValues.dateRange && formValues.dateRange.length === 2) {
        params.startDate = formValues.dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
        params.endDate = formValues.dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss');
        delete params.dateRange;
        const res = await order.export(params);
        console.log(res);
        if (res.code === 200) {
          window.open(dev_url + res.data);
          notification.success(t('exportSuccess') || '导出成功');
        } else {
          notification.error(res.msg);
        }
      } else {
        notification.error(t('pleaseEnterDate') || '请输入时间段');
      }
    } catch (error) {
      console.error('导出失败:', error);
      message.error(t('exportFailed') || '导出失败，请稍后重试');
    } finally {
      setPrintLoading(false);
    }
  };

  // 状态渲染
  const renderStatus = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      '0': { text: t('pending'), color: '#faad14' },
      '1': { text: t('shipped'), color: '#1890ff' },
      '2': { text: t('completed'), color: '#52c41a' },
      '3': { text: t('outOfStock'), color: '#ff4d4f' },
      '4': { text: t('damaged'), color: '#722ed1' },
      '5': { text: t('void'), color: '#8c8c8c' },
    };
    
    const statusInfo = statusMap[status] || { text: '未知', color: '#d9d9d9' };
    return <span style={{ color: statusInfo.color, fontWeight: 'bold' }}>{statusInfo.text}</span>;
  };

  // 修改订单
  const handleEdit = (orderData: OrderData) => {
    setSelectedOrder(orderData);
    form.setFieldsValue({
      size: orderData.size,
      color: orderData.color,
      remark: orderData.remark,
      amount: orderData.amount,
    });
    setEditDrawerVisible(true);
  };

  // 提交修改
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedOrder) {
        const modifyData: ModifyOrderRequest = {
          size: values.size,
          color: values.color,
          remark: values.remark,
          amount: values.amount,
          id: selectedOrder.id,
        };
        
        await order.modify(modifyData);
        message.success(t('modifySuccess') || '修改订单成功');
        setEditDrawerVisible(false);
        console.log('Calling onRefresh after modify order');
        onRefresh();
      }
    } catch (error) {
      console.error('修改订单失败:', error);
      message.error(t('modifyFailed') || '修改订单失败，请稍后重试');
    }
  };

  // Void订单（软删除）
  const handleVoid = (orderData: OrderData) => {
    modal.confirm({
      title: t('confirmVoid') || '确认作废',
      content: `确定要作废订单: ${orderData.design} ？`,
      icon: <ExclamationCircleOutlined />,
      okText: t('confirm') || '确认',
      cancelText: t('cancel') || '取消',
      onOk: async () => {
        try {
          await order.modify({
            ...orderData,
            status: '5',
            pendingDate: '',
          } as any);
          message.success(t('voidSuccess') || '订单已作废');
          onRefresh();
        } catch (error) {
          console.error('作废订单失败:', error);
          message.error(t('voidFailed') || '作废订单失败，请稍后重试');
        }
      },
    });
  };

  // 发货
  const handleSent = (orderData: OrderData) => {
    setSelectedOrder(orderData);
    sentForm.resetFields();
    setSentDrawerVisible(true);
  };

  // 提交发货
  const handleSentSubmit = async () => {
    try {
      const values = await sentForm.validateFields();
      if (selectedOrder) {
        await order.modify({
          id: selectedOrder.id,
          pendingDate: values.pendingDate,
          status: '1',
        });
        message.success(t('shippedSuccess') || '订单已发货');
        setSentDrawerVisible(false);
        onRefresh();
      }
    } catch (error) {
      console.error('发货失败:', error);
      message.error(t('shippedFailed') || '发货失败，请稍后重试');
    }
  };

  // 状态变更
  const handleStatusChange = (orderData: OrderData, status: string, statusText: string) => {
    modal.confirm({
      title: statusText,
      content: `确认${statusText}: ${orderData.design} ？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await order.modify({
            ...orderData,
            status,
            pendingDate: '',
          } as any);
          message.success(`${statusText}成功`);
          onRefresh();
        } catch (error) {
          console.error(`${statusText}失败:`, error);
          message.error(`${statusText}失败，请稍后重试`);
        }
      },
    });
  };

  // 重置状态
  const handleResetStatus = (orderData: OrderData) => {
    modal.confirm({
      title: '重置状态',
      content: `确认重置状态: ${orderData.design} ？`,
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await order.modify({
            ...orderData,
            status: '0',
            pendingDate: '',
          } as any);
          message.success('重置状态成功');
          onRefresh();
        } catch (error) {
          console.error('重置状态失败:', error);
          message.error('重置状态失败，请稍后重试');
        }
      },
    });
  };

  // 操作菜单
  const getActionMenu = (orderData: OrderData) => ({
    items: [
      {
        key: 'edit',
        label: t('modifyOrder'),
        icon: <EditOutlined />,
        onClick: () => handleEdit(orderData),
      },
      {
        key: 'void',
        label: t('void') || 'Void',
        icon: <CloseOutlined />,
        danger: true,
        onClick: () => handleVoid(orderData),
      },
      {
        key: 'sent',
        label: t('shipped'),
        icon: <SendOutlined />,
        onClick: () => handleSent(orderData),
      },
      {
        key: 'ok',
        label: t('completed'),
        icon: <CheckOutlined />,
        onClick: () => handleStatusChange(orderData, '2', t('completed')),
      },
      {
        key: 'out_of_stock',
        label: t('outOfStock'),
        icon: <ExclamationCircleOutlined />,
        onClick: () => handleStatusChange(orderData, '3', t('outOfStock')),
      },
      {
        key: 'damaged',
        label: t('damaged'),
        icon: <CloseOutlined />,
        onClick: () => handleStatusChange(orderData, '4', t('damaged')),
      },
      {
        key: 'reset',
        label: t('resetStatus'),
        icon: <ReloadOutlined />,
        onClick: () => handleResetStatus(orderData),
      },
    ],
  });

  // 桌面端表格列定义
  const columns = [
    {
      title: t('photo'),
      dataIndex: 'previewPhoto',
      width: 120,
      fixed: 'left' as const,
      render: (item: string, record: OrderData) => (
        <img 
          style={{ height: 100, width: 80, objectFit: 'cover', cursor: 'pointer' }} 
          alt="" 
          src={dev_url + item}
          onClick={() => {
            if (onViewDesignDetail) {
              const designId = (record as any).designId;
              onViewDesignDetail(designId);
            }
          }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.src.includes('placeholder-image.jpg') && !img.src.includes('data:image')) {
              img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
            }
          }}
        />
      ),
    },
    {
      title: t('orderCode'),
      dataIndex: 'design',
      key: 'design',
      width: 120,
      fixed: 'left' as const,
    },
    {
      title: t('orderPrice'),
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 100,
    },
    {
      title: t('orderColor'),
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => {
        const colorValue = Array.isArray(color) ? color[0] : color;
        return getColorTranslation(colorValue);
      },
    },
    {
      title: t('orderSize'),
      dataIndex: 'size',
      key: 'size',
      width: 80,
    },
    {
      title: t('orderAmount'),
      dataIndex: 'amount',
      key: 'amount',
      width: 80,
    },
    {
      title: t('time'),
      dataIndex: 'date',
      width: 110,
      render: (data: string) => moment(data).format('YYYY-MM-DD'),
    },
    {
      title: t('orderRemark'),
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
    },
    {
      title: t('status'),
      dataIndex: 'status',
      width: 130,
      render: (value: string) => renderStatus(value),
    },
    {
      title: t('shippingDate'),
      dataIndex: 'pendingDate',
      width: 110,
      render: (value: any) => value && <div>{value}</div>,
    },
    {
      title: t('operation'),
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: OrderData) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // 移动端卡片渲染
  const renderOrderCard = (order: OrderData) => (
    <Card key={order.id} size="small" className="mb-3">
      <div className="space-y-3">
        {/* 订单基本信息 */}
        <div className="flex gap-3">
          {/* 商品图片 */}
          <div className="flex-shrink-0">
            <Image
              src={dev_url + order.previewPhoto}
              alt={order.design}
              width={60}
              height={60}
              className="rounded object-cover"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </div>

          {/* 订单信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {order.design}
              </h3>
              <div className="text-right">
                {renderStatus(order.status)}
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center justify-between">
                <span>{t('orderPrice')}: ${order.salePrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('orderColor')}: {getColorTranslation(order.color)}</span>
                <span>{t('orderSize')}: {order.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('orderAmount')}: {order.amount}</span>
                <span>{t('time')}: {moment(order.date).format('MM-DD HH:mm')}</span>
              </div>
              {order.remark && (
                <div className="text-gray-500">
                  {t('orderRemark')}: {order.remark}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="small"
            type="primary"
            onClick={() => handleEdit(order)}
            className="flex-1"
            style={{ minHeight: '32px' }}
          >
            {t('modifyOrder')}
          </Button>
          <Button
            size="small"
            onClick={() => handleSent(order)}
            className="flex-1"
            style={{ minHeight: '32px' }}
          >
            {t('shipped')}
          </Button>
          <Button
            size="small"
            onClick={() => handleStatusChange(order, '2', t('completed'))}
            className="flex-1"
            style={{ minHeight: '32px' }}
          >
            {t('completed')}
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleVoid(order)}
            className="flex-1"
            style={{ minHeight: '32px' }}
          >
            {t('void') || 'Void'}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <>
      {/* 搜索表单 */}
      <Card className="mb-4">
        <Form
          form={searchForm}
          layout="vertical"
          onFinish={handleSearch}
          className="md:flex md:flex-wrap md:gap-4"
        >
          <Form.Item name="design" label={t('orderCode')} className="md:w-48 mb-4">
            <Input placeholder={t('pleaseEnterDesignCode')} />
          </Form.Item>
          
          <Form.Item name="remark" label={t('orderRemark')} className="md:w-48 mb-4">
            <Input placeholder={t('pleaseEnterRemark')} />
          </Form.Item>
          
          <Form.Item name="status" label={t('status')} className="md:w-48 mb-4">
            <Select
              mode="multiple"
              placeholder={t('pleaseSelectStatus')}
              options={statusOptions}
            />
          </Form.Item>
          
          <Form.Item name="dateRange" label={t('dateRange')} className="md:w-72 mb-4">
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item className="mb-4">
            <Space>
              <Button type="primary" htmlType="submit">
                {t('search')}
              </Button>
              <Button onClick={handleReset}>
                {t('reset')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 桌面端表格 */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: false,
            onChange: (page) => {
              fetchOrders(page);
            },
          }}
          scroll={{ x: 1200, y: 2000 }}
        />

        {/* 打印按钮 */}
        <div style={{ 
          marginTop: 16, 
          textAlign: 'center',
          padding: '16px 0',
          borderTop: '1px solid #f0f0f0'
        }}>
          <Button 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            loading={printLoading}
            disabled={printLoading}
            size="large"
          >
            {printLoading ? '打印中...' : '打印'}
          </Button>
        </div>
      </div>

      {/* 移动端卡片列表 */}
      <div className="md:hidden space-y-4">
        {/* 导出按钮 */}
        <div className="flex gap-2">
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            loading={printLoading}
            disabled={printLoading}
            className="flex-1"
          >
            {printLoading ? t('exporting') : t('export')}
          </Button>
        </div>

        {/* 订单列表 */}
        <div className="space-y-2">
          {data.length > 0 ? (
            data.map(order => renderOrderCard(order))
          ) : (
            <div className="text-center text-gray-500 py-8">
              {t('noOrderData') || '暂无订单数据'}
            </div>
          )}
        </div>

        {/* 分页 */}
        {data.length > 0 && (
          <div className="flex justify-center">
            <Spin spinning={loading}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={(page) => fetchOrders(page)}
                showSizeChanger={false}
                showQuickJumper={false}
              />
            </Spin>
          </div>
        )}
      </div>

      {/* 修改订单抽屉 - 响应式 */}
      <Drawer
        title={t('modifyOrder')}
        placement="right"
        open={editDrawerVisible}
        onClose={() => setEditDrawerVisible(false)}
        width={500}
        className="md:w-[500px] w-full"
        height="70%"
        footer={
          <div className="md:hidden flex gap-3">
            <Button block onClick={() => setEditDrawerVisible(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" block onClick={handleEditSubmit}>
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="size"
            label={t('orderSize')}
            rules={[{ required: true, message: '请选择尺寸' }]}
          >
            <Select
              placeholder={t('pleaseSelectSize')}
              options={sizeList.map(size => ({ label: size, value: size }))}
            />
          </Form.Item>
          
          <Form.Item
            name="color"
            label={t('orderColor')}
            rules={[{ required: true, message: '请选择颜色' }]}
          >
            <Select
              placeholder={t('pleaseSelectColor')}
              options={colorList.map(color => ({ label: color, value: color }))}
            />
          </Form.Item>
          
          <Form.Item
            name="remark"
            label={t('orderRemark')}
          >
            <Input placeholder={t('pleaseEnterRemark')} />
          </Form.Item>
          
          <Form.Item
            name="amount"
            label={t('orderAmount')}
            rules={[
              { required: true, message: '请输入数量' },
              { type: 'number', min: 1, message: '数量必须大于0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              precision={0}
              placeholder={t('pleaseEnterAmount')}
            />
          </Form.Item>
          
          <Form.Item className="hidden md:block">
            <Button type="primary" htmlType="submit" block>
              确认修改
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 发货抽屉 - 响应式 */}
      <Drawer
        title={t('sent')}
        placement="right"
        open={sentDrawerVisible}
        onClose={() => setSentDrawerVisible(false)}
        width={400}
        className="md:w-[400px] w-full"
        height="50%"
        footer={
          <div className="md:hidden flex gap-3">
            <Button block onClick={() => setSentDrawerVisible(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" block onClick={handleSentSubmit}>
              {t('confirmShipped') || '确认发货'}
            </Button>
          </div>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <p>订单: <strong>{selectedOrder?.design}</strong></p>
          <p>颜色: {selectedOrder?.color}</p>
          <p>尺寸: {selectedOrder?.size}</p>
          <p>数量: {selectedOrder?.amount}</p>
        </div>
        
        <Form
          form={sentForm}
          layout="vertical"
          onFinish={handleSentSubmit}
        >
          <Form.Item
            name="pendingDate"
            label={t('shippingDate')}
            rules={[
              { required: true, message: '请输入发货日期' }
            ]}
          >
            <Input placeholder={t('pleaseEnterShippingDate')} />
          </Form.Item>
          
          <Form.Item className="hidden md:block">
            <Button type="primary" htmlType="submit" block>
              确认发货
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
});

export default OrderList;

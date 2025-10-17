'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Drawer, Form, Input, InputNumber, Select, message, Space, DatePicker, Pagination, Image, Tag, Spin } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined, SendOutlined, CheckOutlined, ExclamationCircleOutlined, ReloadOutlined, CloseOutlined, PrinterOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { OrderData, ModifyOrderRequest, colorList, sizeList, WAREHOUSE } from '@/lib/types';
import { order } from '@/lib/api';
import moment from 'moment';
import { useNotification } from '@/lib/notificationManager';

interface OrderListProps {
  warehouseName: string;
  onRefresh: () => void;
}

const dev_url = 'http://119.28.104.20';

export default function OrderList({ warehouseName, onRefresh }: OrderListProps) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [sentForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const notification = useNotification();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [data, setData] = useState<OrderData[]>([]);
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [sentDrawerVisible, setSentDrawerVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

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
  ];

  // 获取订单数据
  const fetchOrders = async (page = 1, searchParams: any = {}) => {
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

  // 初始化数据
  useEffect(() => {
    fetchOrders();
  }, [warehouseName]);

  // 监听父组件刷新
  useEffect(() => {
    // 延迟执行，避免与初始化冲突
    const timer = setTimeout(() => {
      fetchOrders(pagination.current);
    }, 100);
    return () => clearTimeout(timer);
  }, [onRefresh]);

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
    if (exportLoading) return; // 防止重复点击
    
    setExportLoading(true);
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
          notification.success('导出成功');
        } else {
          notification.error(res.msg);
        }
      } else {        
        notification.error("请输入日期");
      }
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请稍后重试');
    } finally {
      setExportLoading(false);
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
        const updateData: ModifyOrderRequest = {
          id: selectedOrder.id,
          size: values.size,
          color: values.color,
          remark: values.remark,
          amount: values.amount,
        };
        
        await order.modify(updateData);
        message.success('修改成功');
        setEditDrawerVisible(false);
        fetchOrders(pagination.current);
      }
    } catch (error) {
      console.error('修改失败:', error);
      message.error('修改失败，请重试');
    }
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
        const updateData = {
          id: selectedOrder.id,
          pendingDate: values.pendingDate.format('YYYY-MM-DD'),
          status: '1',
        };
        
        await order.modify(updateData);
        message.success('发货成功');
        setSentDrawerVisible(false);
        fetchOrders(pagination.current);
      }
    } catch (error) {
      console.error('发货失败:', error);
      message.error('发货失败，请重试');
    }
  };

  // 删除订单状态
  const [deleteDrawerVisible, setDeleteDrawerVisible] = useState(false);
  const [deleteOrderData, setDeleteOrderData] = useState<OrderData | null>(null);

  // 删除订单
  const handleDelete = (orderData: OrderData) => {
    setDeleteOrderData(orderData);
    setDeleteDrawerVisible(true);
  };

  // 确认删除订单
  const handleConfirmDelete = async () => {
    if (!deleteOrderData) return;
    try {
      await order.delete([deleteOrderData.id]);
      message.success('删除成功');
      setDeleteDrawerVisible(false);
      setDeleteOrderData(null);
      fetchOrders(pagination.current);
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败，请重试');
    }
  };

  // 状态操作相关状态
  const [statusDrawerVisible, setStatusDrawerVisible] = useState(false);
  const [statusOrderData, setStatusOrderData] = useState<OrderData | null>(null);
  const [statusValue, setStatusValue] = useState<string>('');

  // 状态操作
  const handleStatusChange = (orderData: OrderData, status: string) => {
    setStatusOrderData(orderData);
    setStatusValue(status);
    setStatusDrawerVisible(true);
  };

  // 确认状态变更
  const handleConfirmStatusChange = async () => {
    if (!statusOrderData) return;
    const statusText = statusOptions.find(opt => opt.value === statusValue)?.label || statusValue;
    try {
      await order.modify({
        id: statusOrderData.id,
        status: statusValue,
        pendingDate: '',
      });
      message.success(`${statusText}成功`);
      setStatusDrawerVisible(false);
      setStatusOrderData(null);
      setStatusValue('');
      fetchOrders(pagination.current);
    } catch (error) {
      console.error('状态修改失败:', error);
      message.error('状态修改失败，请重试');
    }
  };

  // 渲染订单卡片
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
                <span>代码: {order.designCode}</span>
                <span className="text-orange-600 font-semibold">${order.salePrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>颜色: {getColorTranslation(order.color)}</span>
                <span>尺码: {order.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>数量: {order.amount}</span>
                <span>时间: {moment(order.date).format('MM-DD HH:mm')}</span>
              </div>
              {order.remark && (
                <div className="text-gray-500">
                  备注: {order.remark}
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
            onClick={() => handleStatusChange(order, '2')}
            className="flex-1"
            style={{ minHeight: '32px' }}
          >
            {t('completed')}
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDelete(order)}
            className="flex-1"
            style={{ minHeight: '32px' }}
          >
            {t('deleteOrder')}
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* 搜索和操作 */}
      <div className="space-y-3">
        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            loading={exportLoading}
            disabled={exportLoading}
            className="flex-1"
          >
            {exportLoading ? '导出中...' : '导出'}
          </Button>
        </div>

        {/* 搜索表单 */}
        <Form form={searchForm} layout="vertical" onFinish={handleSearch}>
          <div className="grid grid-cols-1 gap-3">
            <Form.Item name="design" label="商品代码">
              <Input placeholder="请输入商品代码" />
            </Form.Item>
                    
            <Form.Item name="remark" label="备注">
              <Input placeholder="请输入备注" />
            </Form.Item>
            
            <Form.Item name="status" label="状态">
              <Select
                mode="multiple"
                placeholder="请选择状态"
                options={statusOptions}
              />
            </Form.Item>
            
            <Form.Item name="dateRange" label="日期范围">
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button type="primary" htmlType="submit" className="flex-1">
              搜索
            </Button>
            <Button onClick={handleReset} className="flex-1">
              重置
            </Button>
          </div>
        </Form>
      </div>

      {/* 订单列表 */}
      <div className="space-y-2">
        {data.length > 0 ? (
          data.map(order => renderOrderCard(order))
        ) : (
          <div className="text-center text-gray-500 py-8">
            暂无订单数据
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
              showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
            />
          </Spin>
        </div>
      )}

      {/* 修改订单抽屉 */}
      <Drawer
        title="修改订单"
        placement="bottom"
        height="70%"
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setEditDrawerVisible(false)}>
              取消
            </Button>
            <Button type="primary" block onClick={handleEditSubmit}>
              确认
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="size"
            label="尺码"
            rules={[{ required: true, message: '请选择尺码' }]}
          >
            <Select size="large" placeholder="请选择尺码">
              {sizeList.map(size => (
                <Select.Option key={size} value={size}>
                  {size}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            label="颜色"
            rules={[{ required: true, message: '请选择颜色' }]}
          >
            <Select size="large" placeholder="请选择颜色">
              {colorList.map(color => (
                <Select.Option key={color} value={color}>
                  {color}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea size="large" placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 发货抽屉 */}
      <Drawer
        title="发货"
        placement="bottom"
        height="50%"
        onClose={() => setSentDrawerVisible(false)}
        open={sentDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setSentDrawerVisible(false)}>
              取消
            </Button>
            <Button type="primary" block onClick={handleSentSubmit}>
              确认发货
            </Button>
          </div>
        }
      >
        <Form form={sentForm} layout="vertical">
          <Form.Item
            name="pendingDate"
            label="发货日期"
            rules={[{ required: true, message: '请选择发货日期' }]}
          >
            <DatePicker size="large" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 删除订单确认抽屉 */}
      <Drawer
        title="确认删除"
        placement="bottom"
        height="40%"
        onClose={() => setDeleteDrawerVisible(false)}
        open={deleteDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setDeleteDrawerVisible(false)}>
              取消
            </Button>
            <Button type="primary" danger block onClick={handleConfirmDelete}>
              确认删除
            </Button>
          </div>
        }
      >
        <div className="text-center py-8">
          <DeleteOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
          <h3 className="text-lg font-semibold mb-2">确认删除订单</h3>
          <p className="text-gray-600 mb-4">
            确定要删除订单 <strong>"{deleteOrderData?.design}"</strong> 吗？
          </p>
          <p className="text-sm text-gray-500">
            删除后无法恢复，请谨慎操作
          </p>
        </div>
      </Drawer>

      {/* 状态变更确认抽屉 */}
      <Drawer
        title="确认状态变更"
        placement="bottom"
        height="40%"
        onClose={() => setStatusDrawerVisible(false)}
        open={statusDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setStatusDrawerVisible(false)}>
              取消
            </Button>
            <Button type="primary" block onClick={handleConfirmStatusChange}>
              确认变更
            </Button>
          </div>
        }
      >
        <div className="text-center py-8">
          <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
          <h3 className="text-lg font-semibold mb-2">确认状态变更</h3>
          <p className="text-gray-600 mb-4">
            确定要将订单 <strong>"{statusOrderData?.design}"</strong> 状态改为 
            <strong> {statusOptions.find(opt => opt.value === statusValue)?.label}</strong> 吗？
          </p>
          <p className="text-sm text-gray-500">
            状态变更后将影响订单流程
          </p>
        </div>
      </Drawer>
    </div>
  );
}

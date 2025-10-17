'use client';

import React, { useState, useRef } from 'react';
import { Table, Button, Modal, Drawer, Form, InputNumber, Input, message, App, Select, Space, Divider } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ShoppingOutlined, PlusCircleOutlined } from '@ant-design/icons';
import ColorSelect from '../../ColorSelect';
import { useTranslation } from 'react-i18next';
import { ItemData, CreateOrderRequest, CreateItemRequest, WAREHOUSE, colorList, sizeList } from '@/lib/types';
import { usePermissions } from '@/lib/usePermissions';
import { item, order } from '@/lib/api';

interface ItemTableProps {
  data: ItemData[];
  loading: boolean;
  warehouseName: string;
  designId: number;
  onRefresh: () => void;
}

export default function ItemTable({ data, loading, warehouseName, designId, onRefresh }: ItemTableProps) {
  const { t } = useTranslation();
  const { modal } = App.useApp();
  const { canUseFeature } = usePermissions();
  const [form] = Form.useForm();
  const [stockForm] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [createForm] = Form.useForm();
  
  const [stockDrawerVisible, setStockDrawerVisible] = useState(false);
  const [orderDrawerVisible, setOrderDrawerVisible] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [orderType, setOrderType] = useState<'store' | 'customer'>('store');
  const [currentItem, setCurrentItem] = useState<ItemData | null>(null);
  

  const warehouseOptions = [
    { label: WAREHOUSE.SLADY, value: WAREHOUSE.SLADY },
    { label: WAREHOUSE.SL, value: WAREHOUSE.SL },
    { label: WAREHOUSE.LIVE, value: WAREHOUSE.LIVE },
  ];

  const handleDelete = (itemData: ItemData) => {
    modal.confirm({
      title: t('confirmDelete'),
      content: t('confirmDeleteItem', { color: itemData.color, size: itemData.size }),
      icon: <DeleteOutlined />,
      okText: t('confirm'),
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          await item.delete(itemData.id);
          message.success(t('deleteSuccess'));
          onRefresh();
        } catch (error) {
          console.error('删除失败:', error);
          message.error(t('deleteFailedRetry'));
        }
      },
    });
  };

  const handleModifyStock = (itemData: ItemData) => {
    setCurrentItem(itemData);
    stockForm.setFieldsValue({ stock: itemData.stock });
    setStockDrawerVisible(true);
  };

  const handleStockSubmit = async () => {
    try {
      const values = await stockForm.validateFields();
      if (currentItem) {
        await item.modifyStock(currentItem.id, values.stock);
        message.success(t('stockModifySuccess'));
        setStockDrawerVisible(false);
        onRefresh();
      }
    } catch (error) {
      console.error('修改库存失败:', error);
      message.error(t('modifyStockFailedRetry'));
    }
  };

  const handleOrder = (itemData: ItemData, type: 'store' | 'customer') => {
    setCurrentItem(itemData);
    setOrderType(type);
    orderForm.resetFields();
    if (type === 'store') {
      orderForm.setFieldsValue({ remark: t('storeAdjustment') });
    }
    setOrderDrawerVisible(true);
  };

  const handleCreate = () => {
    createForm.resetFields();
    setCreateDrawerVisible(true);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const createData: CreateItemRequest = {
        designId,
        warehouseName: values.warehouseName,
        color: values.color,
        size: values.size,
        stock: values.stock,
      };
      
      await item.create(createData);
      message.success(t('addItemSuccess'));
      setCreateDrawerVisible(false);
      onRefresh();
    } catch (error) {
      console.error('新增商品失败:', error);
      message.error(t('addItemFailedRetry'));
    }
  };

  const handleOrderSubmit = async () => {
    try {
      const values = await orderForm.validateFields();
      if (currentItem) {
        const orderData: CreateOrderRequest = {
          itemId: currentItem.id,
          amount: values.amount,
          type: 0,
          remark: values.remark,
          paymentStatus: -1,
          status: '0',
        };
        
        await order.create(orderData);
        message.success(orderType === 'store' ? t('storeAdjustmentSuccess') : t('customerOrderSuccess'));
        setOrderDrawerVisible(false);
        onRefresh();
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      message.error(t('createOrderFailedRetry'));
    }
  };

  const columns = [
    {
      title: t('color'),
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: t('size'),
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: t('stock'),
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <span style={{ color: stock > 0 ? '#52c41a' : '#ff4d4f' }}>
          {stock}
        </span>
      ),
    },
    {
      title: t('operation'),
      key: 'action',
      render: (_: any, record: ItemData) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {canUseFeature('modifyStock') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleModifyStock(record)}
              size="small"
            >
              {t('modifyStock')}
            </Button>
          )}
          <Button
            type="link"
            icon={<PlusOutlined />}
            onClick={() => handleOrder(record, 'store')}
            size="small"
          >
            {t('storeAdjustment')}
          </Button>
          <Button
            type="link"
            icon={<ShoppingOutlined />}
            onClick={() => handleOrder(record, 'customer')}
            size="small"
          >
            {t('customerOrder')}
          </Button>
          {canUseFeature('deleteItem') && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
              size="small"
            >
              {t('delete')}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>{warehouseName} {t('stock')}</h4>
        {canUseFeature('createItem') && (
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={handleCreate}
          >
            {t('addItem')}
          </Button>
        )}
      </div>
      
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 400 }}
      />

      <Drawer
        title={t('modifyStock')}
        open={stockDrawerVisible}
        onClose={() => setStockDrawerVisible(false)}
        width={400}
      >
        <Form
          form={stockForm}
          layout="vertical"
          onFinish={handleStockSubmit}
        >
          <Form.Item
            label={t('stockQuantity')}
            name="stock"
            rules={[
              { required: true, message: t('pleaseEnter') + t('stockQuantity') },
              { type: 'number', min: 0, message: t('stockQuantity') + t('cannotBeLessThanZero') }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={0}
              placeholder={t('stockQuantity')}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('confirmModify')}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={orderType === 'store' ? t('storeAdjustment') : t('customerOrder')}
        open={orderDrawerVisible}
        onClose={() => setOrderDrawerVisible(false)}
        width={400}
      >
        <Form
          form={orderForm}
          layout="vertical"
          onFinish={handleOrderSubmit}
        >
          <Form.Item
            label={t('amount')}
            name="amount"
            rules={[
              { required: true, message: t('pleaseEnter') + t('amount') },
              { type: 'number', min: 1, message: t('amount') + t('mustBeGreaterThanZero') }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              precision={0}
              placeholder={t('amount')}
            />
          </Form.Item>
          
          <Form.Item
            label={t('remark')}
            name="remark"
            rules={[
              { required: true, message: t('pleaseEnter') + t('remark') },
              { whitespace: true, message: t('remark') + t('cannotBeEmpty') }
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder={t('remark')}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {orderType === 'store' ? t('confirmStoreAdjustment') : t('confirmCustomerOrder')}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title={t('addItem')}
        open={createDrawerVisible}
        onClose={() => setCreateDrawerVisible(false)}
        width={500}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Form.Item
            label={t('warehouse')}
            name="warehouseName"
            rules={[
              { required: true, message: t('pleaseSelect') + t('warehouse') },
              { type: 'array', min: 1, message: t('pleaseSelectAtLeastOne') + t('warehouse') }
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t('warehouse')}
              options={warehouseOptions}
            />
          </Form.Item>
          
          <Form.Item
            label={t('color')}
            name="color"
            rules={[
              { required: true, message: t('pleaseSelect') + t('color') },
              { type: 'array', min: 1, message: t('pleaseSelectAtLeastOne') + t('color') }
            ]}
          >
            <ColorSelect
              mode="multiple"
              placeholder={t('color')}
            />
          </Form.Item>
          
          <Form.Item
            label={t('size')}
            name="size"
            rules={[
              { required: true, message: t('pleaseSelect') + t('size') },
              { type: 'array', min: 1, message: t('pleaseSelectAtLeastOne') + t('size') }
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t('size')}
              options={sizeList.map(size => ({ label: size, value: size }))}
            />
          </Form.Item>
          
          <Form.Item
            label={t('stockQuantity')}
            name="stock"
            rules={[
              { required: true, message: t('pleaseEnter') + t('stockQuantity') },
              { type: 'number', min: 0, message: t('stockQuantity') + t('cannotBeLessThanZero') }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={0}
              placeholder={t('stockQuantity')}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {t('confirmAdd')}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
}

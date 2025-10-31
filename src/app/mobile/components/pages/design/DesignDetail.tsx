'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Card, Descriptions, Tag, Spin, Tabs, message, Image, Space, Divider, Drawer, Form, Input, InputNumber, Select, Modal, notification } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, ShoppingOutlined, PlusCircleOutlined } from '@ant-design/icons';
import ColorSelect from '@/app/components/ColorSelect';
import { useTranslation } from 'react-i18next';
import { DesignDetail as DesignDetailType, typeList, ItemData, CreateOrderRequest, CreateItemRequest, WAREHOUSE, colorList, sizeList } from '@/lib/types';
import { usePermissions } from '@/lib/usePermissions';
import { api, item, order } from '@/lib/api';

const dev_url = 'http://119.28.104.20';

interface DesignDetailProps {
  designId: number;
  onBackToList: () => void;
  onRefreshList?: () => void;
}

export default function DesignDetail({ designId, onBackToList, onRefreshList }: DesignDetailProps) {
  const { t } = useTranslation();
  const { canUseFeature } = usePermissions();
  
  // 详情数据状态
  const [detailData, setDetailData] = useState<DesignDetailType | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  
  // 库存相关状态
  const [itemsLoading, setItemsLoading] = useState(false);
  const [sladyItems, setSladyItems] = useState<ItemData[]>([]);
  const [sl2Items, setSl2Items] = useState<ItemData[]>([]);
  const [liveItems, setLiveItems] = useState<ItemData[]>([]);

  // 编辑相关状态
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [editForm] = Form.useForm();

  // 删除相关状态
  const [deleteDrawerVisible, setDeleteDrawerVisible] = useState(false);
  const [deleteItemDrawerVisible, setDeleteItemDrawerVisible] = useState(false);
  const [deleteItemData, setDeleteItemData] = useState<ItemData | null>(null);
  

  // 库存操作相关状态
  const [stockDrawerVisible, setStockDrawerVisible] = useState(false);
  const [stockForm] = Form.useForm();
  const [currentItem, setCurrentItem] = useState<ItemData | null>(null);

  // 订单操作相关状态
  const [orderDrawerVisible, setOrderDrawerVisible] = useState(false);
  const [orderForm] = Form.useForm();
  const [orderType, setOrderType] = useState<'store' | 'customer'>('store');

  // 新增Item相关状态
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [createForm] = Form.useForm();

  // 获取商品详情
  const fetchDesignDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const response = await api.design.getDetail(id);
      if (response.code === 200) {
        setDetailData(response.data);
      } else {
        message.error(t('fetchDesignDetailFailed'));
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      message.error(t('fetchDesignDetailFailed'));
    } finally {
      setDetailLoading(false);
    }
  };

  // 获取库存数据
  const fetchItems = async (designId: number) => {
    if (!designId) return;
    
    setItemsLoading(true);
    try {
      const searchPage = { desc: 1, page: 1, pageSize: 99, sort: '' };
      
      const [sladyResponse, sl2Response, liveResponse] = await Promise.all([
        item.getList({ designId, warehouseName: 'Slady一店', searchPage }),
        item.getList({ designId, warehouseName: 'SL二店', searchPage }),
        item.getList({ designId, warehouseName: 'Live直播间', searchPage }),
      ]);

      if (sladyResponse.code === 200) {
        setSladyItems(sladyResponse.data);
      }
      if (sl2Response.code === 200) {
        setSl2Items(sl2Response.data);
      }
      if (liveResponse.code === 200) {
        setLiveItems(liveResponse.data);
      }
    } catch (error) {
      console.error('获取库存数据失败:', error);
      message.error(t('fetchItemsFailed'));
    } finally {
      setItemsLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    if (designId) {
      fetchDesignDetail(designId);
      fetchItems(designId);
    }
  }, [designId]);

  // 刷新库存数据
  const handleRefreshItems = () => {
    if (designId) {
      fetchItems(designId);
    }
  };

  // 查看图片
  const handleViewImages = (images: string, coverPath: string) => {
    message.info(t('viewImagesFeatureDeveloping'));
  };

  // 编辑商品
  const handleEdit = () => {
    if (detailData) {
      editForm.setFieldsValue({
        design: detailData.design,
        type: detailData.type.split(','),
        purchasePrice: detailData.purchasePrice,
        salePrice: detailData.salePrice,
        remark: detailData.remark
      });
      setEditDrawerVisible(true);
    }
  };

  // 删除商品
  const handleDelete = () => {
    console.log('删除商品按钮被点击');
    setDeleteDrawerVisible(true);
  };

  // 确认删除商品
  const handleConfirmDelete = async () => {
    console.log('确认删除商品');
    try {
      const response = await api.design.delete([detailData?.id || 0]);
      if (response.code === 200) {
        message.success(t('deleteSuccess'));
        setDeleteDrawerVisible(false);
        // 通知父组件刷新列表
        if (onRefreshList) {
          onRefreshList();
        }
        onBackToList();
      } else {
        message.error(response.msg || t('deleteFailed'));
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error(t('deleteFailedRetry'));
    }
  };

  // 编辑提交
  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      const updateData = {
        ...values,
        type: values.type.join(','),
        id: detailData?.id
      };
      
      const response = await api.design.modify(updateData);
      if (response.code === 200) {
        message.success(t('modifySuccess'));
        setEditDrawerVisible(false);
        // 重新获取详情数据
        if (detailData?.id) {
          fetchDesignDetail(detailData.id);
        }
      } else {
        message.error(response.msg || t('modifyFailed'));
      }
    } catch (error) {
      console.error('修改失败:', error);
      message.error(t('modifyFailedRetry'));
    }
  };

  // 库存操作
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
        handleRefreshItems();
      }
    } catch (error) {
      console.error('修改库存失败:', error);
      message.error(t('stockModifyFailed'));
    }
  };

  // 订单操作
  const handleOrder = (itemData: ItemData, type: 'store' | 'customer') => {
    setCurrentItem(itemData);
    setOrderType(type);
    orderForm.resetFields();
    if (type === 'store') {
      orderForm.setFieldsValue({ remark: t('storeAdjustment') });
    }
    setOrderDrawerVisible(true);
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
        handleRefreshItems();
      }
    } catch (error) {
      console.error('创建订单失败:', error);
      message.error(t('createOrderFailed'));
    }
  };

  // 新增Item
  const handleCreateItem = () => {
    createForm.resetFields();
    setCreateDrawerVisible(true);
  };

  const handleCreateItemSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const createData: CreateItemRequest = {
        designId: designId,
        warehouseName: values.warehouseName,
        color: values.color,
        size: values.size,
        stock: values.stock,
      };
      
      await item.create(createData);
      message.success(t('addItemSuccess'));
      setCreateDrawerVisible(false);
      handleRefreshItems();
    } catch (error) {
      console.error('新增商品失败:', error);
      message.error(t('addItemFailedRetry'));
    }
  };

  // 删除Item
  const handleDeleteItem = (itemData: ItemData) => {
    console.log('删除库存按钮被点击', itemData);
    setDeleteItemData(itemData);
    setDeleteItemDrawerVisible(true);
  };

  // 确认删除Item
  const handleConfirmDeleteItem = async () => {
    if (!deleteItemData) return;
    console.log('确认删除库存');
    try {
      await item.delete(deleteItemData.id);
      message.success(t('deleteSuccess'));
      setDeleteItemDrawerVisible(false);
      setDeleteItemData(null);
      handleRefreshItems();
    } catch (error) {
      console.error('删除失败:', error);
      message.error(t('deleteFailedRetry'));
    }
  };

  if (detailLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="p-4">
        <Button icon={<ArrowLeftOutlined />} onClick={onBackToList} className="mb-4">
          {t('backToList')}
        </Button>
        <div className="text-center text-gray-500">{t('designNotExist')}</div>
      </div>
    );
  }

  // 渲染库存卡片
  const renderItemCard = (item: ItemData) => (
    <Card size="small" className="mb-2">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium">{item.color}</div>
            <div className="text-xs text-gray-500">{t('size')}: {item.size}</div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {t('stock')}: {item.stock}
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-2 flex-wrap">
          {canUseFeature('modifyStock') && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleModifyStock(item)}
              className="flex-1"
              style={{ minHeight: '32px' }}
            >
              {t('modifyStock')}
            </Button>
          )}
          <Button
            size="small"
            onClick={() => handleOrder(item, 'store')}
            className="flex-1"
            style={{ minHeight: '32px' }}
          >
            {t('storeAdjustment')}
          </Button>
          <Button
            size="small"
            onClick={() => handleOrder(item, 'customer')}
            className="flex-1"
            style={{ minHeight: '32px' }}
          >
            {t('customerOrder')}
          </Button>
          {canUseFeature('deleteItem') && (
            <Button
              size="small"
              danger
              onClick={() => handleDeleteItem(item)}
              className="flex-1"
              style={{ minHeight: '32px' }}
            >
              {t('delete')}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-4 pb-20">
      {/* 返回按钮 */}
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={onBackToList} 
        className="mb-4"
        block
      >
        {t('backToList')}
      </Button>

      {/* 操作按钮 */}
      <div className="flex gap-3 mb-4 mt-4">
        {canUseFeature('modifyDesign') && (
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={handleEdit}
            className="flex-1"
          >
            {t('edit')}
          </Button>
        )}
        {canUseFeature('deleteDesign') && (
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={handleDelete}
            className="flex-1"
            style={{ minHeight: '40px' }}
          >
            {t('delete')}
          </Button>
        )}
      </div>

      {/* 商品详情卡片 */}
      <Card className="mb-4">
        <div className="space-y-4">
          {/* 商品图片 */}
          <div className="text-center">
            <Image
              src={dev_url + detailData.previewPhoto}
              alt={detailData.design}
              width={200}
              height={200}
              className="rounded-lg shadow-md mx-auto"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              onClick={() => handleViewImages(detailData.photos, detailData.previewPhoto)}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* 商品信息 */}
          <div className="space-y-3">
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800 mb-2">
                {detailData.design}
              </h1>
              <div className="text-sm text-gray-500">ID: {detailData.id}</div>
            </div>

            <Divider />

            {/* 基本信息 */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('type')}:</span>
                <div className="flex flex-wrap gap-1">
                  {detailData.type.split(',').map((type, index) => (
                    <Tag color="blue" key={index}>
                      {typeList.find(t => t.value === type.trim())?.label || type}
                    </Tag>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">销售价格:</span>
                <span className="text-orange-600 font-bold text-lg">
                  ${detailData.salePrice}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">{t('purchasePrice')}:</span>
                <span className="text-gray-800 font-medium">
                  ${detailData.purchasePrice}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">{t('totalStock')}:</span>
                <span className={`font-bold ${detailData.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {detailData.stock}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">{t('hotness')}:</span>
                <span className="text-gray-800">{detailData.hot || 0}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">{t('fabric')}:</span>
                <span className="text-gray-800">{detailData.fabric}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">{t('color')}:</span>
                <div className="flex flex-wrap gap-1">
                  {detailData.color.map((color, index) => (
                    <Tag key={index}>{color}</Tag>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">{t('size')}:</span>
                <div className="flex flex-wrap gap-1">
                  {detailData.size.map((size, index) => (
                    <Tag key={index}>{size}</Tag>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">{t('createTime')}:</span>
                <span className="text-gray-800">{detailData.createDate}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 库存管理 */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t('stockManagement')}</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateItem}
            size="small"
          >
            {t('add')}
          </Button>
        </div>
        
        <Spin spinning={itemsLoading}>
          <Tabs
            defaultActiveKey="slady"
            items={[
              {
                key: 'slady',
                label: t('sladyStore1'),
                children: (
                  <div className="space-y-2">
                    {sladyItems.length > 0 ? (
                      sladyItems.map((item, index) => (
                        <div key={index}>
                          {renderItemCard(item)}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">{t('noStockData')}</div>
                    )}
                  </div>
                ),
              },
              {
                key: 'sl2',
                label: t('slStore2'),
                children: (
                  <div className="space-y-2">
                    {sl2Items.length > 0 ? (
                      sl2Items.map((item, index) => (
                        <div key={index}>
                          {renderItemCard(item)}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">{t('noStockData')}</div>
                    )}
                  </div>
                ),
              },
              {
                key: 'live',
                label: t('liveStream'),
                children: (
                  <div className="space-y-2">
                    {liveItems.length > 0 ? (
                      liveItems.map((item, index) => (
                        <div key={index}>
                          {renderItemCard(item)}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">{t('noStockData')}</div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </Spin>
      </Card>

      {/* 编辑商品抽屉 */}
      <Drawer
        title={t('editItem')}
        placement="bottom"
        height="90%"
        onClose={() => setEditDrawerVisible(false)}
        open={editDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setEditDrawerVisible(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" block onClick={handleEditSubmit}>
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="design"
            label={t('designCode')}
            rules={[{ required: true, message: t('pleaseEnterDesignCode') }]}
          >
            <Input size="large" placeholder={t('pleaseEnterDesignCode')} />
          </Form.Item>

          <Form.Item
            name="type"
            label={t('designType')}
            rules={[
              { required: true, message: t('pleaseSelectDesignType') },
              { type: 'array', min: 1, message: t('pleaseSelectAtLeastOneType') }
            ]}
          >
            <Select placeholder={t('pleaseSelectDesignType')} mode="multiple"
              
              size="large"
              options={typeList}
            />
          </Form.Item>

          <Form.Item
            name="purchasePrice"
            label={t('purchasePrice')}
            rules={[
              { required: true, message: t('pleaseEnterPurchasePrice') },
              { type: 'number', min: 0, message: t('purchasePriceMustBePositive') }
            ]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item
            name="salePrice"
            label={t('salePrice')}
            rules={[
              { required: true, message: t('pleaseEnterSalePrice') },
              { type: 'number', min: 0, message: t('salePriceMustBePositive') }
            ]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item
            name="remark"
            label={t('remark')}
          >
            <Input.TextArea size="large" placeholder={t('pleaseEnterRemark')} rows={3} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 修改库存抽屉 */}
      <Drawer
        title={t('modifyStock')}
        placement="bottom"
        height="50%"
        onClose={() => setStockDrawerVisible(false)}
        open={stockDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setStockDrawerVisible(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" block onClick={handleStockSubmit}>
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <Form form={stockForm} layout="vertical">
          <Form.Item
            name="stock"
            label={t('stockQuantity')}
            rules={[
              { required: true, message: t('pleaseEnterStockQuantity') },
              { type: 'number', min: 0, message: t('stockQuantityMustBePositive') }
            ]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 订单抽屉 */}
      <Drawer
        title={orderType === 'store' ? t('storeAdjustment') : t('customerOrder')}
        placement="bottom"
        height="60%"
        onClose={() => setOrderDrawerVisible(false)}
        open={orderDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setOrderDrawerVisible(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" block onClick={handleOrderSubmit}>
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <Form form={orderForm} layout="vertical">
          <Form.Item
            name="amount"
            label={t('quantity')}
            rules={[
              { required: true, message: t('pleaseEnterQuantity') },
              { type: 'number', min: 1, message: t('quantityMustBePositive') }
            ]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="remark"
            label={t('remark')}
            rules={[{ required: true, message: t('pleaseEnterRemark') }]}
          >
            <Input size="large" placeholder={t('pleaseEnterRemark')} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 新增Item抽屉 */}
      <Drawer
        title={t('addItem')}
        placement="bottom"
        height="80%"
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setCreateDrawerVisible(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" block onClick={handleCreateItemSubmit}>
              {t('confirm')}
            </Button>
          </div>
        }
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="warehouseName"
            label={t('warehouse')}
            rules={[
              { required: true, message: t('pleaseSelectWarehouse') },
              { type: 'array', min: 1, message: t('pleaseSelectAtLeastOneWarehouse') }
            ]}
          >
            <Select
              mode="multiple"
              size="large"
              placeholder={t('pleaseSelectWarehouse')}
              options={[
                { label: WAREHOUSE.SLADY, value: WAREHOUSE.SLADY },
                { label: WAREHOUSE.SL, value: WAREHOUSE.SL },
                { label: WAREHOUSE.LIVE, value: WAREHOUSE.LIVE },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="color"
            label={t('color')}
            rules={[
              { required: true, message: t('pleaseSelectColor') },
              { type: 'array', min: 1, message: t('pleaseSelectAtLeastOneColor') }
            ]}
          >
            <ColorSelect
              mode="multiple"
              size="large"
              placeholder={t('pleaseSelectColor')}
            />
          </Form.Item>

          <Form.Item
            name="size"
            label={t('size')}
            rules={[
              { required: true, message: t('pleaseSelectSize') },
              { type: 'array', min: 1, message: t('pleaseSelectAtLeastOneSize') }
            ]}
          >
            <Select
              mode="multiple"
              size="large"
              placeholder={t('pleaseSelectSize')}
              options={sizeList.map(size => ({ value: size, label: size }))}
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label={t('stockQuantity')}
            rules={[
              { required: true, message: t('pleaseEnterStockQuantity') },
              { type: 'number', min: 0, message: t('stockQuantityMustBePositive') }
            ]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 删除商品确认抽屉 */}
      <Drawer
        title={t('confirmDelete')}
        placement="bottom"
        height="40%"
        onClose={() => setDeleteDrawerVisible(false)}
        open={deleteDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setDeleteDrawerVisible(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" danger block onClick={handleConfirmDelete}>
              {t('confirmDelete')}
            </Button>
          </div>
        }
      >
        <div className="text-center py-8">
          <DeleteOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
          <h3 className="text-lg font-semibold mb-2">{t('confirmDeleteItem')}</h3>
          <p className="text-gray-600 mb-4">
            {t('confirmDeleteItemMessage')} <strong>"{detailData?.design}"</strong> {t('questionMark')}
          </p>
          <p className="text-sm text-gray-500">
            {t('deleteCannotBeUndone')}
          </p>
        </div>
      </Drawer>

      {/* 删除库存确认抽屉 */}
      <Drawer
        title={t('confirmDelete')}
        placement="bottom"
        height="40%"
        onClose={() => setDeleteItemDrawerVisible(false)}
        open={deleteItemDrawerVisible}
        footer={
          <div className="flex gap-3">
            <Button block onClick={() => setDeleteItemDrawerVisible(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" danger block onClick={handleConfirmDeleteItem}>
              {t('confirmDelete')}
            </Button>
          </div>
        }
      >
        <div className="text-center py-8">
          <DeleteOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
          <h3 className="text-lg font-semibold mb-2">{t('confirmDeleteStock')}</h3>
          <p className="text-gray-600 mb-4">
            {t('confirmDeleteStockMessage')} <strong>{deleteItemData?.color} {deleteItemData?.size}</strong> {t('stockQuestionMark')}
          </p>
          <p className="text-sm text-gray-500">
            {t('deleteCannotBeUndone')}
          </p>
        </div>
      </Drawer>
    </div>
  );
}

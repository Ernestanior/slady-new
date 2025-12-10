'use client';

import React, { useState, useEffect } from 'react';
import { Button, Descriptions, Tag, Drawer, Form, InputNumber, Select, message, Input, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DesignDetail as DesignDetailType, typeList, ItemData, CreateItemRequest, WAREHOUSE } from '@/lib/types';
import { usePermissions } from '@/lib/usePermissions';
import { item } from '@/lib/api';
import ItemTable from './ItemTable';
import ColorSelect from '../../ColorSelect';
import { sizeList } from '@/lib/types';

interface DesignDetailProps {
  detailData: DesignDetailType | null;
  detailLoading: boolean;
  onBackToList: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewImages: (images: string, coverPath: string) => void;
  editDrawerVisible: boolean;
  onEditDrawerClose: () => void;
  onEditSubmit: () => void;
  editForm: any;
}

export default function DesignDetail({
  detailData,
  detailLoading,
  onBackToList,
  onEdit,
  onDelete,
  onViewImages,
  editDrawerVisible,
  onEditDrawerClose,
  onEditSubmit,
  editForm
}: DesignDetailProps) {
  const { t } = useTranslation();
  const { isSaler, canUseFeature } = usePermissions();
  const dev_url = 'http://119.28.104.20';
  
  // 库存相关状态
  const [itemsLoading, setItemsLoading] = useState(false);
  const [sladyItems, setSladyItems] = useState<ItemData[]>([]);
  const [sl2Items, setSl2Items] = useState<ItemData[]>([]);
  const [liveItems, setLiveItems] = useState<ItemData[]>([]);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [createForm] = Form.useForm();
  
  const warehouseOptions = [
    { label: WAREHOUSE.SLADY, value: WAREHOUSE.SLADY },
    { label: WAREHOUSE.SL, value: WAREHOUSE.SL },
    { label: WAREHOUSE.LIVE, value: WAREHOUSE.LIVE },
  ];

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
      message.error(t('fetchStockDataFailed'));
    } finally {
      setItemsLoading(false);
    }
  };

  // 当详情数据变化时获取库存数据
  useEffect(() => {
    if (detailData?.id) {
      fetchItems(detailData.id);
    }
  }, [detailData?.id]);

  // 刷新库存数据
  const handleRefreshItems = () => {
    if (detailData?.id) {
      fetchItems(detailData.id);
    }
  };

  // 处理创建Item
  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      if (!detailData?.id) {
        message.error(t('productNotFound'));
        return;
      }
      
      const createData: CreateItemRequest = {
        designId: detailData.id,
        warehouseName: values.warehouseName,
        color: values.color,
        size: values.size,
        stock: values.stock,
      };
      
      await item.create(createData);
      message.success(t('addItemSuccess'));
      setCreateDrawerVisible(false);
      createForm.resetFields();
      // 刷新所有店铺的库存数据
      handleRefreshItems();
    } catch (error) {
      console.error('新增商品失败:', error);
      message.error(t('addItemFailedRetry'));
    }
  };

  if (detailLoading && !detailData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>{t('loading')}</div>
      </div>
    );
  }

  if (!detailData) {
    return (
      <div className="p-6">
        <Button icon={<ArrowLeftOutlined />} onClick={onBackToList} style={{ marginBottom: 16 }}>
          {t('backToList')}
        </Button>
        <div>{t('productNotFound')}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div style={{ marginBottom: 24, display: 'flex', gap: '12px' }}>
{/* 返回按钮 */}
<Button 
        icon={<ArrowLeftOutlined />} 
        onClick={onBackToList} 
        size="large"
        style={{ marginBottom: 24 }}
      >{t('backToList')}</Button>

      {/* 操作按钮 */}
      {!isSaler() && (

      <div >
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={onEdit}
            size="large"
            style={{marginRight:10}}
          >
            {t('edit')}
          </Button>
          
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={onDelete}
          size="large"
        >
          {t('deleteDesign')}
        </Button>
      </div>
        )}
      </div>
      

      {/* 商品详情 */}
      <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '40px', maxHeight: '400px' }}>
          {/* 左侧图片 */}
          <div style={{ flexShrink: 0 }}>
            <img 
              src={dev_url + detailData.previewPhoto}
              alt={detailData.design}
              style={{ 
                width: 200, 
                height: 200, 
                objectFit: 'cover',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
              onClick={() => onViewImages(detailData.photos, detailData.previewPhoto)}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                // 防止无限循环：如果已经是 placeholder 就不再设置
                if (!img.src.includes('placeholder-image.jpg') && !img.src.includes('data:image')) {
                  // 使用 data URI 作为占位符（透明 1x1 像素图片）
                  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
                }
              }}
            />
          </div>

          {/* 右侧详细信息 */}
          <div style={{ flex: 1, maxWidth: '600px', overflowY: 'auto' }}>
            <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
              {detailData.design}
            </h1>

            <Descriptions 
              column={2} 
              labelStyle={{ fontWeight: 600, width: 100 }}
              size="small"
            >
              <Descriptions.Item label={t('designId')}>
                {detailData.id}
              </Descriptions.Item>
              
              <Descriptions.Item label={t('type')}>
                {detailData.type.split(',').map((type, index) => (
                  <Tag color="blue" key={index} style={{ marginRight: 4, marginBottom: 4 }}>
                    {typeList.find(t => t.value === type.trim())?.label || type}
                  </Tag>
                ))}
              </Descriptions.Item>

              <Descriptions.Item label={t('salePrice')}>
                <span style={{ fontSize: 20, color: '#fa9829', fontWeight: 'bold' }}>
                  ${detailData.salePrice}
                </span>
              </Descriptions.Item>

              {!isSaler() && (
                <Descriptions.Item label={t('purchasePrice')}>
                  <span style={{ fontSize: 16, color: '#666' }}>
                    ${detailData.purchasePrice}
                  </span>
                </Descriptions.Item>
              )}

              <Descriptions.Item label={t('stock')}>
                <span style={{ fontSize: 16, color: detailData.stock > 0 ? '#52c41a' : '#ff4d4f' }}>
                  {detailData.stock}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label={t('hot')}>
                {detailData.hot || 0}
              </Descriptions.Item>

              <Descriptions.Item label={t('fabric')}>
                {detailData.fabric}
              </Descriptions.Item>

              <Descriptions.Item label={t('color')}>
                <div style={{ maxWidth: '200px' }}>
                  {detailData.color.map((color, index) => (
                    <Tag key={index} style={{ marginRight: 4, marginBottom: 4 }}>
                      {color}
                    </Tag>
                  ))}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label={t('size')}>
                <div style={{ maxWidth: '200px' }}>
                  {detailData.size.map((size, index) => (
                    <Tag key={index} style={{ marginRight: 4, marginBottom: 4 }}>
                      {size}
                    </Tag>
                  ))}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label={t('createTime')}>
                {detailData.createDate}
              </Descriptions.Item>

              <Descriptions.Item label={t('remark')}>
                {detailData.remark}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </div>

      {/* 库存管理 */}
      <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t('stockManagement')}</h3>
          {canUseFeature('createItem') && (
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => {
                createForm.resetFields();
                setCreateDrawerVisible(true);
              }}
            >
              {t('addItem')}
            </Button>
          )}
        </div>
        <Spin spinning={itemsLoading}>
          {/* 前两个表格在同一行 */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            {/* Slady一店 */}
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#333' }}>Slady一店</h4>
              <ItemTable
                data={sladyItems}
                loading={itemsLoading}
                warehouseName="Slady一店"
                designId={detailData?.id || 0}
                onRefresh={handleRefreshItems}
              />
            </div>
            
            {/* SL二店 */}
            <div style={{ flex: 1 }}>
              <h4 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#333' }}>SL二店</h4>
              <ItemTable
                data={sl2Items}
                loading={itemsLoading}
                warehouseName="SL二店"
                designId={detailData?.id || 0}
                onRefresh={handleRefreshItems}
              />
            </div>
          </div>
          
          {/* 第三个表格换行显示 */}
          <div>
            <h4 style={{ marginBottom: 12, fontSize: 16, fontWeight: 600, color: '#333' }}>Live直播间</h4>
            <ItemTable
              data={liveItems}
              loading={itemsLoading}
              warehouseName="Live直播间"
              designId={detailData?.id || 0}
              onRefresh={handleRefreshItems}
            />
          </div>
        </Spin>
      </div>

      {/* 编辑抽屉 */}
      <Drawer
        title={t('editDesign')}
        placement="right"
        width={500}
        onClose={onEditDrawerClose}
        open={editDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={onEditDrawerClose} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" onClick={onEditSubmit}>
              确认
            </Button>
          </div>
        }
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            label={t('designCode')}
            name="design"
            rules={[
              { required: true, message: '请输入商品编号' },
              { whitespace: true, message: '商品编号不能为空格' }
            ]}
          >
            <Input placeholder={t('designCode')} />
          </Form.Item>

          <Form.Item
            label={t('type')}
            name="type"
            rules={[
              { required: true, message: '请选择商品类型' },
              { type: 'array', min: 1, message: '至少选择一个商品类型' }
            ]}
          >
            <Select
              mode="multiple"
              placeholder={t('type')}
              options={typeList}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label={t('purchasePrice')}
            name="purchasePrice"
            rules={[
              { required: true, message: '请输入采购价格' },
            ]}
          >
            <Input
              placeholder={t('purchasePrice')}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label={t('salePrice')}
            name="salePrice"
            rules={[
              { required: true, message: '请输入销售价格' },
            ]}
          >
            <Input placeholder={t('salePrice')} />
          </Form.Item>

          <Form.Item
            label={t('remark')}
            name="remark"
          >
            <Input.TextArea 
              placeholder={t('remark')} 
              rows={4}
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 创建Item抽屉 */}
      <Drawer
        title={t('addItem')}
        open={createDrawerVisible}
        onClose={() => {
          setCreateDrawerVisible(false);
          createForm.resetFields();
        }}
        width={500}
        maskClosable={true}
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
    </div>
  );
}

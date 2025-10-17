'use client';

import React, { useState, useEffect } from 'react';
import { Button, Descriptions, Tag, Drawer, Form, InputNumber, Select, message, Input, Spin, Tabs } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { DesignDetail as DesignDetailType, typeList, ItemData } from '@/lib/types';
import { item } from '@/lib/api';
import ItemTable from './ItemTable';

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
  const dev_url = 'http://119.28.104.20';
  
  // 库存相关状态
  const [itemsLoading, setItemsLoading] = useState(false);
  const [sladyItems, setSladyItems] = useState<ItemData[]>([]);
  const [sl2Items, setSl2Items] = useState<ItemData[]>([]);
  const [liveItems, setLiveItems] = useState<ItemData[]>([]);

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
      {/* 返回按钮 */}
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={onBackToList} 
        size="large"
        style={{ marginBottom: 24 }}
      >{t('backToList')}</Button>

      {/* 操作按钮 */}
      <div style={{ marginBottom: 24, display: 'flex', gap: '12px' }}>
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          onClick={onEdit}
          size="large"
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
                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
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

              <Descriptions.Item label={t('purchasePrice')}>
                <span style={{ fontSize: 16, color: '#666' }}>
                  ${detailData.purchasePrice}
                </span>
              </Descriptions.Item>

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
            </Descriptions>
          </div>
        </div>
      </div>

      {/* 库存管理 */}
      <div style={{ backgroundColor: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: 24 }}>
        <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>{t('stockManagement')}</h3>
        <Spin spinning={itemsLoading}>
          <Tabs
            defaultActiveKey="slady"
            items={[
              {
                key: 'slady',
                label: 'Slady一店',
                children: (
                  <ItemTable
                    data={sladyItems}
                    loading={itemsLoading}
                    warehouseName="Slady一店"
                    designId={detailData?.id || 0}
                    onRefresh={handleRefreshItems}
                  />
                ),
              },
              {
                key: 'sl2',
                label: 'SL二店',
                children: (
                  <ItemTable
                    data={sl2Items}
                    loading={itemsLoading}
                    warehouseName="SL二店"
                    designId={detailData?.id || 0}
                    onRefresh={handleRefreshItems}
                  />
                ),
              },
              {
                key: 'live',
                label: 'Live直播间',
                children: (
                  <ItemTable
                    data={liveItems}
                    loading={itemsLoading}
                    warehouseName="Live直播间"
                    designId={detailData?.id || 0}
                    onRefresh={handleRefreshItems}
                  />
                ),
              },
            ]}
          />
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
              { type: 'number', min: 0, message: '采购价格必须大于等于0' }
            ]}
          >
            <InputNumber
              placeholder={t('purchasePrice')}
              style={{ width: '100%' }}
              min={0}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            label={t('salePrice')}
            name="salePrice"
            rules={[
              { required: true, message: '请输入销售价格' },
              { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入正确的价格格式（最多两位小数）' }
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
    </div>
  );
}

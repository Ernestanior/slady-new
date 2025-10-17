'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Input, message, Image, Tag, Select, Drawer, Form, InputNumber, Upload, Space, Divider, notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, SearchOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import ColorSelect from '@/app/components/ColorSelect';
import { api } from '@/lib/api';
import { DesignItem, DesignListRequest, typeList, colorList, sizeList, fabricList, WAREHOUSE } from '@/lib/types';
import MobileCardList from '../../MobileCardList';
import DesignDetail from './DesignDetail';
import type { RcFile } from 'antd/es/upload';

const dev_url = 'http://119.28.104.20';

export default function DesignManagement() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [designs, setDesigns] = useState<DesignItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [hasStock, setHasStock] = useState<number | null>(null);

  // 新增商品相关状态
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [createForm] = Form.useForm();
  
  const [newFabric, setNewFabric] = useState<string[]>([...fabricList]);
  const [fabric, setFabric] = useState('');
  const [imgCover, setImgCover] = useState<any[]>([]);
  const [createImgList, setCreateImgList] = useState<any[]>([]);

  // 详情页面状态
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedDesignId, setSelectedDesignId] = useState<number | null>(null);

  // 获取商品列表
  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const params: DesignListRequest = {
        typeList: selectedTypes,
        design: searchText,
        searchPage: {
          desc: 1,
          page: 1,
          pageSize: 20,
          sort: 'id'
        }
      };

      if (hasStock !== null) {
        params.hasStock = hasStock;
      }

      const response = await api.design.getList(params);
      if (response.code === 200 && response.data) {
        setDesigns(response.data.content || []);
      }
    } catch (error) {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, [selectedTypes, hasStock]);

  // 搜索
  const handleSearch = () => {
    fetchDesigns();
  };

  // 切换库存筛选
  const toggleHasStock = () => {
    setHasStock(hasStock === 1 ? 0 : 1);
  };

  // 新增商品
  const handleCreate = () => {
    createForm.resetFields();
    setCreateDrawerOpen(true);
  };

  // 添加面料
  const addFabric = () => {
    if (fabric && !newFabric.includes(fabric)) {
      setNewFabric([...newFabric, fabric]);
      setFabric('');
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const itemForm: any = await createForm.validateFields();

      // 验证封面图片
      if (!imgCover.length) {
        notification.error({
          message: '表单验证失败',
          description: '请上传封面图片',
          placement: 'topRight',
        });
        return;
      }

      // 验证商品图片
      if (!createImgList.length) {
        notification.error({
          message: '表单验证失败',
          description: '请上传商品图片',
          placement: 'topRight',
        });
        return;
      }

      // 处理面料数据
      const fabricStr = itemForm.fabricList?.reduce((total: any, current: any) =>
        total + current.fabric + (current.percent ? ': ' + current.percent + '%\n' : '\n'), ''
      );

      const { design, type, color, size } = itemForm;

      // 上传封面图片
      const coverFormData = new FormData();
      imgCover.forEach(img => {
        coverFormData.append('files', img.originFileObj as RcFile);
      });
      const uploadCoverResult = await api.file.upload(coverFormData);

      if (uploadCoverResult.code !== 200) {
        notification.error({
          message: '上传失败',
          description: '封面图片上传失败',
          placement: 'topRight',
        });
        return;
      }

      // 上传商品图片
      const imgFormData = new FormData();
      createImgList.forEach(img => {
        imgFormData.append('files', img.originFileObj as RcFile);
      });
      const uploadImgResult = await api.file.upload(imgFormData);

      if (uploadImgResult.code !== 200) {
        notification.error({
          message: '上传失败',
          description: '商品图片上传失败',
          placement: 'topRight',
        });
        return;
      }

      // 创建商品
      const createDesignData = {
        ...itemForm,
        type: type.join(','),
        fabric: fabricStr,
        photos: uploadImgResult.data,
        previewPhoto: uploadCoverResult.data
      };

      const designResult = await api.design.create(createDesignData);

      if (designResult.code === 200 && designResult.data) {
        // 创建Item
        const createItemData = {
          ...itemForm,
          designId: designResult.data.id,
          warehouseName: [WAREHOUSE.SLADY, WAREHOUSE.SL, WAREHOUSE.LIVE]
        };

        const itemResult = await api.item.create(createItemData);

        if (itemResult.code === 200) {
          message.success('创建成功');
          setCreateDrawerOpen(false);
          fetchDesigns();
        } else {
          notification.error({
            message: '创建失败',
            description: itemResult.msg || '创建Item失败',
            placement: 'topRight',
          });
        }
      } else {
        notification.error({
          message: '创建失败',
          description: designResult.msg || '创建商品失败',
          placement: 'topRight',
        });
      }
    } catch (error: any) {
      console.error('创建商品失败:', error);

      if (error.errorFields && error.errorFields.length > 0) {
        const firstError = error.errorFields[0];
        notification.error({
          message: '表单验证失败',
          description: firstError.errors[0] || '请检查必填字段',
          placement: 'topRight',
        });
      } else {
        notification.error({
          message: '创建失败',
          description: error.message || '创建商品失败，请重试',
          placement: 'topRight',
        });
      }
    }
  };

  // 查看详情
  const handleViewDetail = (item: DesignItem) => {
    setSelectedDesignId(item.id);
    setCurrentView('detail');
  };

  // 返回列表
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedDesignId(null);
  };

  // 渲染商品卡片
  const renderDesignCard = (item: DesignItem) => (
    <Card size="small" className="shadow-sm">
      <div className="flex gap-3">
        {/* 商品图片 */}
        <div className="flex-shrink-0">
          {item.previewPhoto ? (
            <Image
              src={dev_url + item.previewPhoto}
              alt={item.design}
              width={80}
              height={80}
              className="rounded object-cover"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">无图</span>
            </div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-600 space-y-1">
              <h3 className="text-sm font-semibold text-gray-800 truncate">
                {item.design}
              </h3>
              <div>类型: {item.type}</div>
              <div className="text-gray-400">库存: {item.stock || 0}</div>

              {item.salePrice && (
                <div className="text-orange-600 font-semibold">
                  ${item.salePrice}
                </div>
              )}
            </div>

            <Button
              type="primary"
              onClick={() => handleViewDetail(item)}
            >
              查看详情
            </Button>
          </div>


        </div>
      </div>
    </Card>
  );

  // 如果当前是详情页面，显示详情组件
  if (currentView === 'detail' && selectedDesignId) {
    return (
      <DesignDetail 
        designId={selectedDesignId} 
        onBackToList={handleBackToList}
        onRefreshList={fetchDesigns}
      />
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* 搜索和筛选 */}
      <div className="mb-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="搜索商品代码"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            size="large"
            allowClear
          />
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            搜索
          </Button>
        </div>

        {/* 类型筛选 */}
        <Select
          mode="multiple"
          placeholder="选择商品类型"
          value={selectedTypes}
          onChange={setSelectedTypes}
          size="large"
          allowClear
          style={{ width: '100%' }}
        >
          {typeList.map(type => (
            <Select.Option key={type.value} value={type.value}>
              {type.label}
            </Select.Option>
          ))}
        </Select>

        {/* 库存筛选按钮 */}
        <Button
          block
          size="large"
          type={hasStock === 1 ? 'primary' : 'default'}
          onClick={toggleHasStock}
          style={{marginTop:10,marginBottom:10}}
        >
          {hasStock === 1 ? '✓ ' : ''}有库存的商品
        </Button>

        {/* 新增商品按钮 */}
        <Button
          type="primary"
          block
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          新增商品
        </Button>
      </div>

      {/* 商品列表 */}
      <MobileCardList
        loading={loading}
        data={designs}
        renderCard={renderDesignCard}
        emptyText="暂无商品"
      />

      {/* 新增商品抽屉 */}
      <Drawer
        title="新增商品"
        placement="bottom"
        onClose={() => setCreateDrawerOpen(false)}
        open={createDrawerOpen}
        height="90%"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Form.Item
            name="design"
            label="商品代码"
            rules={[{ required: true, message: '请输入商品代码' }]}
          >
            <Input size="large" placeholder="请输入商品代码" />
          </Form.Item>

          <Form.Item
            name="type"
            label="商品类型"
            rules={[
              { required: true, message: '请选择商品类型' },
              { type: 'array', min: 1, message: '请至少选择一个类型' }
            ]}
          >
            <Select size="large" placeholder="请选择商品类型" mode="multiple">
              {typeList.map(type => (
                <Select.Option key={type.value} value={type.value}>
                  {type.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            label="颜色"
            rules={[
              { required: true, message: '请选择颜色' },
              { type: 'array', min: 1, message: '请至少选择一个颜色' }
            ]}
          >
            <ColorSelect
              mode="multiple"
              size="large"
              placeholder="选择颜色"
            />
          </Form.Item>

          <Form.Item
            name="size"
            label="尺码"
            rules={[
              { required: true, message: '请选择尺码' },
              { type: 'array', min: 1, message: '请至少选择一个尺码' }
            ]}
          >
            <Select
              mode="multiple"
              size="large"
              placeholder="选择尺码"
              options={sizeList.map(size => ({ value: size, label: size }))}
            />
          </Form.Item>

          <Form.List name="fabricList">
            {(fields, { add, remove }) => (
              <>
                <Form.Item label="面料">
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                    添加面料
                  </Button>
                </Form.Item>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'fabric']}
                      rules={[{ required: true, message: '请选择面料' }]}
                    >
                      <Select
                        style={{ width: 200 }}
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <Divider style={{ margin: '8px 0' }} />
                            <Space style={{ padding: '0 8px 4px' }}>
                              <Input
                                placeholder="面料"
                                value={fabric}
                                onChange={(e) => setFabric(e.target.value)}
                              />
                              <Button type="text" icon={<PlusOutlined />} onClick={addFabric}>
                                添加
                              </Button>
                            </Space>
                          </>
                        )}
                        options={newFabric.map(f => ({ label: f, value: f }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'percent']}
                    >
                      <InputNumber placeholder="百分比" min={0} max={100} style={{ width: 100 }} />
                    </Form.Item>
                    <Button onClick={() => remove(name)} danger>
                      删除
                    </Button>
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item
            name="purchasePrice"
            label="采购价格"
            rules={[
              { required: true, message: '请输入采购价格' },
              { type: 'number', min: 0, message: '采购价格必须大于等于0' }
            ]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item
            name="salePrice"
            label="销售价格"
            rules={[
              { required: true, message: '请输入销售价格' },
              { type: 'number', min: 0, message: '销售价格必须大于等于0' }
            ]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item
            name="remark"
            label="备注"
          >
            <Input size="large" placeholder="请输入备注" />
          </Form.Item>

          <div style={{ display: 'flex', marginBottom: 16 }}>
            上传封面：
            <Upload
              listType="picture-card"
              fileList={imgCover}
              onChange={({ fileList }) => setImgCover(fileList)}
              beforeUpload={() => false}
            >
              {imgCover.length >= 1 ? null : <div><UploadOutlined /><div>上传封面</div></div>}
            </Upload>
          </div>

          <div style={{ display: 'flex' }}>
            上传商品图片：
            <Upload
              listType="picture-card"
              fileList={createImgList}
              onChange={({ fileList }) => setCreateImgList(fileList)}
              beforeUpload={() => false}
              multiple
            >
              {createImgList.length >= 10 ? null : <div><UploadOutlined /><div>上传图片</div></div>}
            </Upload>
          </div>

          <div className="flex gap-4 mt-6">
            <Button block size="large" onClick={() => setCreateDrawerOpen(false)}>
              取消
            </Button>
            <Button type="primary" block size="large" onClick={handleCreateSubmit}>
              确认
            </Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}


'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Drawer, Form, InputNumber, Select, Space, Divider, App, notification, message, Input } from 'antd';
import { PlusOutlined, MinusCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ColorSelect from '../../ColorSelect';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { DesignItem, DesignListRequest, SearchPageParams, DesignDetail as DesignDetailType, ModifyDesignRequest, typeList, colorList, fabricList, sizeList, WAREHOUSE, CreateDesignRequest } from '@/lib/types';
import { usePermissions } from '@/lib/usePermissions';
import ImageUpload from '../../ImageUpload';
import DesignList from './DesignList';
import DesignDetail from './DesignDetail';
import ImageGallery from './ImageGallery';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';

export default function Design() {
  const { modal } = App.useApp();
  const { t } = useTranslation();
  const { canUseFeature } = usePermissions();
  
  // 视图状态：'list'、'detail' 或 'images'
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'images'>('list');
  const [selectedDesignId, setSelectedDesignId] = useState<number | null>(null);
  const [detailData, setDetailData] = useState<DesignDetailType | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // 列表相关状态
  const [loading, setLoading] = useState(false);
  const [displayData, setDisplayData] = useState<DesignItem[]>([]);
  const [allData, setAllData] = useState<DesignItem[]>([]);
  const [designSearch, setDesignSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [quickSelectType, setQuickSelectType] = useState<string | null>(null);
  const [hasStockActive, setHasStockActive] = useState(false);
  
  // 用于实际查询的状态（点击搜索按钮后才更新）
  const [searchQuery, setSearchQuery] = useState({
    design: '',
    typeList: [] as string[],
    hasStock: undefined as number | undefined
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  const [hasMore, setHasMore] = useState(true);
  
  // 编辑相关状态
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  
  // 创建商品相关状态
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [createForm] = Form.useForm();
  
  const [imgCover, setImgCover] = useState<UploadFile[]>([]);
  const [createImgList, setCreateImgList] = useState<UploadFile[]>([]);
  const [newFabric, setNewFabric] = useState<string[]>([...fabricList]);
  const [fabric, setFabric] = useState('');
  const fabricInputRef = useRef<any>(null);
  let fabricIndex = 0;
  
  // 图片浏览相关状态
  const [currentFolderPath, setCurrentFolderPath] = useState('');
  const [coverPath, setCoverPath] = useState('');
  
  const scrollListRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);
  const dev_url = 'http://119.28.104.20';

  // 获取商品列表数据
  const fetchDesignList = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      setLoading(true);
      
      const searchPage: SearchPageParams = {
        desc: 1,
        page: page,
        pageSize: 20,
        sort: 'id'
      };

      const requestParams: DesignListRequest = {
        typeList: searchQuery.typeList,
        design: searchQuery.design,
        searchPage: searchPage,
        ...(searchQuery.hasStock !== undefined && { hasStock: searchQuery.hasStock })
      };

      const response = await api.design.getList(requestParams);
      
      if (response.code === 200) {
        const newData = response.data.content;
        
        if (reset) {
          setDisplayData(newData);
          setAllData(newData);
        } else {
          setDisplayData(prev => [...prev, ...newData]);
          setAllData(prev => [...prev, ...newData]);
        }
        
        setPagination(prev => ({
          page: reset ? 1 : prev.page + 1,
          pageSize: response.data.size,
          total: response.data.totalElements,
          totalPages: response.data.totalPages
        }));
        
        setHasMore(response.data.number < response.data.totalPages - 1);
      }
    } catch (error) {
      console.error('获取商品列表失败:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery.typeList, searchQuery.design]);

  // 初始加载数据
  useEffect(() => {
    fetchDesignList(1, true);
  }, []);

  // 搜索查询变化时重新加载数据
  useEffect(() => {
    fetchDesignList(1, true);
  }, [searchQuery]);

  // 快速选择类型变化时更新多选并立即搜索
  useEffect(() => {
    if (quickSelectType !== null) {
      const newTypeList = quickSelectType ? [quickSelectType] : [];
      setSelectedTypes(newTypeList);
      setSearchQuery({
        design: designSearch,
        typeList: newTypeList,
        hasStock: undefined
      });
    }
  }, [quickSelectType, designSearch]);

  // 滚动加载更多
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loading) {
      fetchDesignList(pagination.page + 1, false);
    }
  }, [hasMore, loading, pagination.page, fetchDesignList]);

  // 获取商品详情
  const fetchDesignDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const response = await api.design.getDetail(id);
      if (response.code === 200) {
        setDetailData(response.data);
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
      message.error(t('fetchDesignDetailFailed'));
    } finally {
      setDetailLoading(false);
    }
  };

  // 跳转到详情页面
  const toDetail = (item: DesignItem) => {
    if (scrollListRef.current) {
      savedScrollPosition.current = scrollListRef.current.scrollTop;
    }
    
    setSelectedDesignId(item.id);
    setCurrentView('detail');
    fetchDesignDetail(item.id);
  };

  // 返回列表页面
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedDesignId(null);
    setDetailData(null);
    
    setTimeout(() => {
      if (scrollListRef.current && savedScrollPosition.current > 0) {
        scrollListRef.current.scrollTop = savedScrollPosition.current;
      }
    }, 0);
  };

  // 跳转到图片浏览页面
  const handleViewImages = (images: string, coverPath: string) => {
    setCurrentFolderPath(images);
    setCoverPath(coverPath);
    setCurrentView('images');
  };

  // 返回详情页面
  const handleBackToDetail = () => {
    setCurrentView('detail');
  };

  // 打开编辑抽屉
  const handleEdit = () => {
    if (detailData) {
      form.setFieldsValue({
        design: detailData.design,
        type: detailData.type.split(','),
        purchasePrice: detailData.purchasePrice,
        salePrice: detailData.salePrice,
        remark: ''
      });
      setEditDrawerVisible(true);
    }
  };

  // 提交修改
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const requestData: ModifyDesignRequest = {
        id: selectedDesignId!,
        design: values.design,
        type: Array.isArray(values.type) ? values.type.join(',') : values.type,
        purchasePrice: values.purchasePrice?.toString() || '',
        salePrice: values.salePrice || '',
        remark: values.remark
      };

      const response = await api.design.modify(requestData);
      if (response.code === 200) {
        message.success(t('modifySuccess'));
        setEditDrawerVisible(false);
        fetchDesignDetail(selectedDesignId!);
      } else {
        message.error(response.msg || t('modifyFailed'));
      }
    } catch (error: any) {
      console.error('修改商品失败:', error);
      
      if (error.errorFields && error.errorFields.length > 0) {
        const firstError = error.errorFields[0];
        notification.error({
          message: t('formValidationFailed'),
          description: firstError.errors[0] || t('pleaseCheckRequiredFields'),
          placement: 'topRight',
        });
      } else {
        notification.error({
          message: t('modifyFailed'),
          description: error.message || t('modifyDesignFailedRetry'),
          placement: 'topRight',
        });
      }
    }
  };

  // 删除商品
  const handleDelete = () => {
    modal.confirm({
      title: t('confirmDelete'),
      icon: <ExclamationCircleOutlined />,
      content: t('confirmDeleteDesign', { design: detailData?.design }),
      okText: t('confirmDelete'),
      okType: 'danger',
      cancelText: t('cancel'),
      onOk: async () => {
        try {
          const response = await api.design.delete([selectedDesignId!]);
          if (response.code === 200) {
            message.success(t('deleteSuccess'));
            handleBackToList();
            fetchDesignList(1, true);
          } else {
            message.error(response.msg || t('deleteFailed'));
          }
        } catch (error) {
          console.error('删除商品失败:', error);
          message.error(t('deleteDesignFailed'));
        }
      }
    });
  };

  // 点击搜索按钮处理
  const handleSearchClick = () => {
    setHasStockActive(false);
    setSearchQuery({
      design: designSearch,
      typeList: selectedTypes,
      hasStock: undefined
    });
  };

  // 有库存商品筛选
  const handleHasStockFilter = () => {
    const newHasStockActive = !hasStockActive;
    setHasStockActive(newHasStockActive);
    setSearchQuery({
      design: designSearch,
      typeList: selectedTypes,
      hasStock: newHasStockActive ? 1 : 0
    });
  };

  // 添加面料
  const addFabric = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    e.preventDefault();
    setNewFabric([...newFabric, fabric || `New item ${fabricIndex++}`]);
    setFabric('');
    setTimeout(() => {
      fabricInputRef.current?.focus();
    }, 0);
  };

  // 打开创建商品抽屉
  const handleOpenCreate = () => {
    createForm.resetFields();
    setImgCover([]);
    setCreateImgList([]);
    setNewFabric([...fabricList]);
    setCreateDrawerVisible(true);
  };

  // 提交创建商品
  const handleCreateSubmit = async () => {
    try {
      const itemForm: any = await createForm.validateFields();
      
      if (!imgCover.length) {
        notification.error({
          message: t('formValidationFailed'),
          description: t('pleaseUploadCoverImage'),
          placement: 'topRight',
        });
        return;
      }
      
      if (!createImgList.length) {
        notification.error({
          message: t('formValidationFailed'),
          description: t('pleaseUploadProductImages'),
          placement: 'topRight',
        });
        return;
      }
      
      const fabricStr = itemForm.fabricList?.reduce((total: any, current: any) => 
        total + current.fabric + (current.percent ? ': ' + current.percent + '%\n' : '\n'), ''
      );

      const { design, type, color, size } = itemForm;

      const coverFormData = new FormData();
      imgCover.forEach(img => {
        coverFormData.append('files', img.originFileObj as RcFile);
      });
      const uploadCoverResult = await api.file.upload(coverFormData);

      if (uploadCoverResult.code !== 200) {
        notification.error({
          message: t('uploadFailed'),
          description: t('coverImageUploadFailed'),
          placement: 'topRight',
        });
        return;
      }

      const imgFormData = new FormData();
      createImgList.forEach(img => {
        imgFormData.append('files', img.originFileObj as RcFile);
      });
      const uploadImgResult = await api.file.upload(imgFormData);

      if (uploadImgResult.code !== 200) {
        notification.error({
          message: t('uploadFailed'),
          description: t('productImagesUploadFailed'),
          placement: 'topRight',
        });
        return;
      }

      const createDesignData: CreateDesignRequest = {
        ...itemForm,
        type: type.join(','),
        fabric: fabricStr,
        photos: uploadImgResult.data,
        previewPhoto: uploadCoverResult.data
      };

      const designResult = await api.design.create(createDesignData);

      if (designResult.code === 200 && designResult.data) {
        const createItemData = {
          ...itemForm,
          designId: designResult.data.id,
          warehouseName: [WAREHOUSE.SLADY, WAREHOUSE.SL, WAREHOUSE.LIVE]
        };

        const itemResult = await api.item.create(createItemData);

        if (itemResult.code === 200) {
          message.success(t('createSuccess'));
          setCreateDrawerVisible(false);
          fetchDesignList(1, true);
        } else {
          notification.error({
            message: t('createFailed'),
            description: itemResult.msg || t('createItemFailed'),
            placement: 'topRight',
          });
        }
      } else {
        notification.error({
          message: '创建失败',
          description: designResult.msg || t('createDesignFailed'),
          placement: 'topRight',
        });
      }
    } catch (error: any) {
      console.error('创建商品失败:', error);
      
      if (error.errorFields && error.errorFields.length > 0) {
        const firstError = error.errorFields[0];
        notification.error({
          message: t('formValidationFailed'),
          description: firstError.errors[0] || t('pleaseCheckRequiredFields'),
          placement: 'topRight',
        });
      } else {
        notification.error({
          message: '创建失败',
          description: error.message || t('createDesignFailedRetry'),
          placement: 'topRight',
        });
      }
    }
  };

  // 图片修改处理
  const handleImageModify = async (formData: FormData) => {
    const response = await api.file.modify(formData);
    if (response.code === 200) {
      if (selectedDesignId) {
        fetchDesignDetail(selectedDesignId);
      }
    } else {
      throw new Error(response.msg || t('modifyImageFailed'));
    }
  };

  // 根据当前视图渲染对应内容
  return (
    <>
      <div style={{ display: currentView === 'list' ? 'block' : 'none' }}>
        <DesignList
          displayData={displayData}
          loading={loading}
          pagination={pagination}
          designSearch={designSearch}
          setDesignSearch={setDesignSearch}
          selectedTypes={selectedTypes}
          setSelectedTypes={setSelectedTypes}
          quickSelectType={quickSelectType}
          setQuickSelectType={setQuickSelectType}
          hasStockActive={hasStockActive}
          onSearchClick={handleSearchClick}
          onHasStockFilter={handleHasStockFilter}
          onOpenCreate={handleOpenCreate}
          onViewDetail={toDetail}
          onScroll={handleScroll}
          hasMore={hasMore}
        />
      </div>
      
      <div style={{ display: currentView === 'detail' ? 'block' : 'none' }}>
        <DesignDetail
          detailData={detailData}
          detailLoading={detailLoading}
          onBackToList={handleBackToList}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewImages={handleViewImages}
          editDrawerVisible={editDrawerVisible}
          onEditDrawerClose={() => setEditDrawerVisible(false)}
          onEditSubmit={handleEditSubmit}
          editForm={form}
        />
      </div>
      
      <div style={{ display: currentView === 'images' ? 'block' : 'none' }}>
        <ImageGallery
          currentFolderPath={currentFolderPath}
          coverPath={coverPath}
          designId={selectedDesignId || 0}
          onBackToDetail={handleBackToDetail}
          onImageModify={handleImageModify}
        />
      </div>

      {/* 创建商品抽屉 */}
      <Drawer
        title={t('createDesign')}
        placement="right"
        width={600}
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setCreateDrawerVisible(false)} style={{ marginRight: 8 }}>
              {t('cancel')}
            </Button>
            <Button type="primary" onClick={handleCreateSubmit}>
              {t('submit')}
            </Button>
          </div>
        }
      >
        <Form form={createForm} layout="vertical">
          <Form.Item 
            label={t('designCode')} 
            name="design" 
            rules={[
              { required: true, message: t('pleaseEnter') + t('designCode') },
              { whitespace: true, message: t('designCode') + t('cannotBeEmpty') }
            ]}
          >
            <Input placeholder={t('designCode')} />
          </Form.Item>

          <Form.Item 
            label={t('type')} 
            name="type" 
            rules={[
              { required: true, message: t('pleaseSelect') + t('type') },
              { type: 'array', min: 1, message: t('pleaseSelectAtLeastOne') + t('type') }
            ]}
          >
            <Select mode="multiple" placeholder={t('type')} options={typeList} />
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
            <Select mode="multiple" placeholder={t('size')} options={sizeList.map(s => ({ label: s, value: s }))} />
          </Form.Item>

          <Form.List name="fabricList">
            {(fields, { add, remove }) => (
              <>
                <Form.Item>
                  {t('fabric')}：
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    {t('addFabric')}
                  </Button>
                </Form.Item>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'fabric']}
                      rules={[{ required: true, message: t('pleaseSelectFabric') }]}
                    >
                      <Select
                        style={{ width: 300 }}
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <Divider style={{ margin: '8px 0' }} />
                            <Space style={{ padding: '0 8px 4px' }}>
                              <Input
                                placeholder={t('fabric')}
                                ref={fabricInputRef}
                                value={fabric}
                                onChange={(e) => setFabric(e.target.value)}
                              />
                              <Button type="text" icon={<PlusOutlined />} onClick={addFabric}>
                                {t('addFabric')}
                              </Button>
                            </Space>
                          </>
                        )}
                        options={newFabric.map((item) => ({ label: item, value: item }))}
                      />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, 'percent']}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <InputNumber placeholder={t('percentage')} min={0} />%
                      </div>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: 'red' }} />
                  </Space>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item 
            label={t('purchasePrice')} 
            name="purchasePrice" 
            rules={[
              { required: true, message: t('pleaseEnter') + t('purchasePrice') },
              { type: 'number', min: 0, message: t('purchasePrice') + t('mustBeGreaterThanOrEqualToZero') }
            ]}
          >
            <InputNumber placeholder={t('purchasePrice')} style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item 
            label={t('salePrice')} 
            name="salePrice" 
            rules={[
              { required: true, message: t('pleaseEnter') + t('salePrice') },
              { type: 'number', min: 0, message: t('salePrice') + t('mustBeGreaterThanOrEqualToZero') }
            ]}
          >
            <InputNumber placeholder={t('salePrice')} style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>

          <Form.Item label={t('remark')} name="remark">
            <Input.TextArea placeholder={t('remark')} rows={3} />
          </Form.Item>

          <div style={{ display: 'flex', marginBottom: 16 }}>
            {t('coverImage')}：
            <ImageUpload changePic={setImgCover} maxCount={1} value={imgCover} />
          </div>

          <div style={{ display: 'flex' }}>
            {t('productImages')}：
            <ImageUpload changePic={setCreateImgList} value={createImgList} />
          </div>
        </Form>
      </Drawer>
    </>
  );
}

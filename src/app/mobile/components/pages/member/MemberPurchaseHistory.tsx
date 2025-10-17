'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, message, Pagination, Space, Tag, Drawer, Form, Input, InputNumber, DatePicker, notification, Modal } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { MemberData, MemberPurchaseRecord, MemberPurchaseRequest, CreatePurchaseRecordRequest } from '@/lib/types';
import { usePermissions } from '@/lib/usePermissions';
import { member } from '@/lib/api';
import moment from 'moment';
import MobileCardList from '../../MobileCardList';

interface MemberPurchaseHistoryProps {
  memberData: MemberData;
  onBackToList: () => void;
}

export default function MemberPurchaseHistory({ memberData, onBackToList }: MemberPurchaseHistoryProps) {
  const { t } = useTranslation();
  const { canUseFeature } = usePermissions();
  const [form] = Form.useForm();
  const [data, setData] = useState<MemberPurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [refundDrawerVisible, setRefundDrawerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MemberPurchaseRecord | null>(null);

  // 获取购买记录
  const fetchPurchaseHistory = async (page = 1) => {
    setLoading(true);
    setData([]);
    
    try {
      const params: MemberPurchaseRequest = {
        memberId: memberData.id,
        searchPage: {
          desc: 1,
          page,
          pageSize: 20,
          sort: ''
        }
      };

      const response = await member.getPurchaseHistory(params);
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
      console.error('获取购买记录失败:', error);
      message.error(t('fetchPurchaseRecordsFailed'));
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
    fetchPurchaseHistory();
  }, [memberData.id]);

  // 分页变化
  const handleTableChange = (page: number) => {
    fetchPurchaseHistory(page);
  };

  // 新增购买记录
  const handleCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      subscription: [1]
    });
    setCreateDrawerVisible(true);
  };

  // 提交新增购买记录
  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 计算总金额
      const sum = values.designs.reduce((total: number, item: any) => {
        return total + (item.price || 0);
      }, 0);

      const params: CreatePurchaseRecordRequest = {
        purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
        designs: values.designs,
        saler: values.saler,
        remark: values.remark,
        memberId: memberData.id,
        sum: sum.toFixed(2),
      };

      await member.createPurchaseRecord(params);
      message.success(t('createPurchaseRecordSuccess'));
      setCreateDrawerVisible(false);
      fetchPurchaseHistory(pagination.current);
    } catch (error: any) {
      if (error.errorFields) {
        notification.error({
          message: t('pleaseFillComplete'),
          description: t('pleaseCheckRequiredFields'),
        });
      } else {
        console.error('新增购买记录失败:', error);
        message.error(t('createPurchaseRecordFailed'));
      }
    }
  };

  // 退还
  const handleRefund = () => {
    form.resetFields();
    form.setFieldsValue({
      status: 1,
      subscription: [1]
    });
    setRefundDrawerVisible(true);
  };

  // 提交退还
  const handleRefundSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 计算总金额（负数）
      const sum = values.designs.reduce((total: number, item: any) => {
        return total + (item.price || 0);
      }, 0);

      const params: CreatePurchaseRecordRequest = {
        purchaseDate: values.purchaseDate.format('YYYY-MM-DD'),
        designs: values.designs,
        saler: values.saler,
        remark: values.remark,
        memberId: memberData.id,
        sum: (-sum).toFixed(2), // 负数
      };

      await member.createPurchaseRecord(params);
      message.success(t('refundSuccess'));
      setRefundDrawerVisible(false);
      fetchPurchaseHistory(pagination.current);
    } catch (error: any) {
      if (error.errorFields) {
        notification.error({
          message: t('pleaseFillComplete'),
          description: t('pleaseCheckRequiredFields'),
        });
      } else {
        console.error('退还失败:', error);
        message.error(t('refundFailed'));
      }
    }
  };

  // 删除购买记录
  const handleDelete = (record: MemberPurchaseRecord) => {
    setSelectedRecord(record);
    setDeleteModalVisible(true);
  };

  // 确认删除
  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;
    
    try {
      await member.deletePurchaseRecord([selectedRecord.id]);
      message.success(t('deletePurchaseRecordSuccess'));
      setDeleteModalVisible(false);
      fetchPurchaseHistory(pagination.current);
    } catch (error) {
      console.error('删除购买记录失败:', error);
      message.error(t('deletePurchaseRecordFailed'));
    }
  };

  // 渲染购买记录卡片
  const renderPurchaseCard = (record: MemberPurchaseRecord) => {
    return (
      <Card size="small" className="shadow-sm mb-4">
        <div className="space-y-4">
          {/* 头部信息 */}
          <div className="flex justify-between items-start">
            <div className="text-sm text-gray-600">
              {moment(record.purchaseDate).format('YYYY-MM-DD')}
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                ${record.sum}
              </div>
              <div className="text-sm text-green-600">
                {t('memberBalance')}: ${record.memberRemainingAmount}
              </div>
            </div>
          </div>

          {/* 商品列表 */}
          {record.designList && record.designList.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-3">{t('products')}:</div>
              <Space wrap>
                {record.designList.map((item, idx) => (
                  <Tag key={idx} color="blue" className="mb-2">
                    {item?.designCode} - ${item?.price}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          {/* 其他信息 */}
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div>
              <span className="font-medium">{t('saler')}:</span> {record.saler}
            </div>
            {record.remark && (
              <div className="col-span-2">
                <span className="font-medium">{t('remark')}:</span> {record.remark}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          {canUseFeature('deletePurchaseRecord') && (
            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button 
                type="link" 
                danger 
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
              >
                {t('delete')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-4 pb-20">
      {/* 头部 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBackToList}
          >
            {t('backToList')}
          </Button>
          <h2 className="text-xl font-bold text-gray-800 flex-1 ml-6">
            {t('memberPurchaseHistory')}
          </h2>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mb-6">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreate}
            className="flex-1"
            size="large"
          >
            {t('add')}
          </Button>
          <Button 
            icon={<MinusCircleOutlined />} 
            onClick={handleRefund}
            className="flex-1"
            size="large"
          >
            {t('refund')}
          </Button>
        </div>
      </div>

      {/* 会员信息卡片 */}
      <Card className="mb-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">{t('name')}:</span>
            <span>{memberData?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">{t('phone')}:</span>
            <span>{memberData?.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">{t('registrationDate')}:</span>
            <span>{memberData?.registrationDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">{t('voucherNumber')}:</span>
            <span>{memberData?.voucherNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">{t('memberBalance')}:</span>
            <span className="text-green-600 font-bold">${memberData?.balance}</span>
          </div>
        </div>
      </Card>
      <div className='h-5'></div>
      {/* 购买记录列表 */}
      <MobileCardList
        loading={loading}
        data={data}
        renderCard={renderPurchaseCard}
        emptyText={t('noPurchaseRecords')}
      />

      {/* 分页 */}
      {data.length > 0 && (
        <div className="mt-6">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handleTableChange}
            showSizeChanger={false}
            showQuickJumper={false}
            showTotal={(total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
            }
            className="text-center"
          />
        </div>
      )}

      {/* 新增购买记录抽屉 */}
      <Drawer
        title={t('addPurchaseRecord')}
        placement="bottom"
        onClose={() => setCreateDrawerVisible(false)}
        open={createDrawerVisible}
        height="80%"
      >
        <Form form={form} layout="vertical" initialValues={{ status: 1, subscription: [1] }}>
          <Form.Item name="purchaseDate" label={t('purchaseDate')} rules={[{ required: true, message: t('pleaseSelectPurchaseDate') }]}>
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>
          
          <Form.List name="designs">
            {(fields, { add, remove }) => (
              <>
                <Form.Item>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-medium">{t('products')}:</span>
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
                      {t('addProduct')}
                    </Button>
                  </div>
                </Form.Item>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                    <Form.Item
                      {...restField}
                      name={[name, 'designCode']}
                      rules={[{ required: true, message: t('pleaseEnterProductCode') }]}
                      className="flex-1 mb-0"
                    >
                      <Input placeholder={t('productCode')} size="large" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: t('pleaseEnterPrice') }]}
                      className="flex-1 mb-0"
                    >
                      <InputNumber placeholder={t('price')} min={0} style={{ width: '100%' }} size="large" />
                    </Form.Item>
                    <Button 
                      type="text" 
                      danger 
                      icon={<MinusCircleOutlined />} 
                      onClick={() => remove(name)}
                      size="small"
                    />
                  </div>
                ))}
              </>
            )}
          </Form.List>
          
          <Form.Item name="saler" label={t('saler')} rules={[{ required: true, message: t('pleaseEnterSaler') }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="remark" label={t('paymentDetails')} rules={[{ required: true, message: t('pleaseEnterPaymentDetails') }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleCreateSubmit} block size="large">
              {t('confirm')}{t('add')}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 退还抽屉 */}
      <Drawer
        title={t('refund')}
        placement="bottom"
        onClose={() => setRefundDrawerVisible(false)}
        open={refundDrawerVisible}
        height="80%"
      >
        <Form form={form} layout="vertical" initialValues={{ status: 1, subscription: [1] }}>
          <Form.Item name="purchaseDate" label={t('purchaseDate')} rules={[{ required: true, message: t('pleaseSelectPurchaseDate') }]}>
            <DatePicker style={{ width: '100%' }} size="large" />
          </Form.Item>
          
          <Form.List name="designs">
            {(fields, { add, remove }) => (
              <>
                <Form.Item>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-medium">{t('products')}:</span>
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
                      {t('addProduct')}
                    </Button>
                  </div>
                </Form.Item>
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                    <Form.Item
                      {...restField}
                      name={[name, 'designCode']}
                      rules={[{ required: true, message: t('pleaseEnterProductCode') }]}
                      className="flex-1 mb-0"
                    >
                      <Input placeholder={t('productCode')} size="large" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: t('pleaseEnterPrice') }]}
                      className="flex-1 mb-0"
                    >
                      <InputNumber placeholder={t('price')} min={0} style={{ width: '100%' }} size="large" />
                    </Form.Item>
                    <Button 
                      type="text" 
                      danger 
                      icon={<MinusCircleOutlined />} 
                      onClick={() => remove(name)}
                      size="small"
                    />
                  </div>
                ))}
              </>
            )}
          </Form.List>
          
          <Form.Item name="saler" label={t('saler')} rules={[{ required: true, message: t('pleaseEnterSaler') }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="remark" label={t('refundReason')} rules={[{ required: true, message: t('pleaseEnterRefundReason') }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleRefundSubmit} block size="large">
              {t('confirm')}{t('refund')}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 删除确认弹窗 */}
      <Modal
        title={t('confirmDelete')}
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText={t('confirmDelete')}
        cancelText={t('cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('confirmDeletePurchaseRecord')}</p>
      </Modal>
    </div>
  );
}

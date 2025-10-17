'use client';

import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, Card, message, Pagination, Collapse, Modal, Drawer, InputNumber, DatePicker, notification, Space, Tag, Row, Dropdown, Menu } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined, EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { MemberData, MemberListRequest, ModifyMemberRequest, TopUpMemberRequest, MemberPurchaseRecord, MemberPurchaseRequest, CreateMemberRequest } from '@/lib/types';
import { usePermissions } from '@/lib/usePermissions';
import { member } from '@/lib/api';
import moment from 'moment';
import MemberPurchaseHistory from './MemberPurchaseHistory';
import AllMemberPurchaseHistory from './AllMemberPurchaseHistory';
import MemberTopUpHistory from './MemberTopUpHistory';

export default function MemberManagement() {
  const { t } = useTranslation();
  const { canUseFeature } = usePermissions();
  const [form] = Form.useForm();
  const [modifyForm] = Form.useForm();
  const [topUpForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [data, setData] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [modifyDrawerVisible, setModifyDrawerVisible] = useState(false);
  const [topUpDrawerVisible, setTopUpDrawerVisible] = useState(false);
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'purchase' | 'allPurchase' | 'topUp'>('list');

  // 获取数据
  const fetchData = async (page = 1, searchParams: any = {}) => {
    setLoading(true);
    setData([]);
    
    try {
      const formValues = form.getFieldsValue();
      const params: MemberListRequest = {
        searchPage: {
          desc: 1,
          page,
          pageSize: 20,
          sort: 'voucherNumber'
        },
        ...formValues,
        ...searchParams
      };

      const response = await member.getList(params);
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
      console.error('获取会员数据失败:', error);
      message.error(t('fetchMemberDataFailed'));
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
    if (!hasLoaded) {
      setHasLoaded(true);
      fetchData();
    }
  }, [hasLoaded]);

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

  // 修改会员
  const handleModify = (record: MemberData) => {
    setSelectedMember(record);
    modifyForm.setFieldsValue({
      name: record.name,
      phone: record.phone,
      registrationDate: moment(record.registrationDate),
      voucherNumber: record.voucherNumber,
      remark: record.remark,
    });
    setModifyDrawerVisible(true);
  };

  // 提交修改
  const handleModifySubmit = async () => {
    try {
      const values = await modifyForm.validateFields();
      if (!selectedMember) return;

      const params: ModifyMemberRequest = {
        id: selectedMember.id,
        name: values.name,
        phone: values.phone,
        registrationDate: values.registrationDate.format('YYYY-MM-DD'),
        voucherNumber: values.voucherNumber,
        remark: values.remark,
      };

      await member.modify(params);
      message.success(t('modifyMemberSuccess'));
      setModifyDrawerVisible(false);
      fetchData(pagination.current);
    } catch (error: any) {
      if (error.errorFields) {
        notification.error({
          message: t('pleaseFillComplete'),
          description: t('pleaseCheckRequiredFields'),
        });
      } else {
        console.error('修改会员信息失败:', error);
        message.error(t('modifyMemberFailed'));
      }
    }
  };

  // 充值
  const handleTopUp = (record: MemberData) => {
    setSelectedMember(record);
    topUpForm.resetFields();
    setTopUpDrawerVisible(true);
  };

  // 提交充值
  const handleTopUpSubmit = async () => {
    try {
      const values = await topUpForm.validateFields();
      if (!selectedMember) return;

      const params: TopUpMemberRequest = {
        id: selectedMember.id,
        saler: values.saler,
        balance: Math.floor(values.amount),
        remark: values.remark,
      };

      await member.topUp(params);
      message.success(t('topUpSuccess'));
      setTopUpDrawerVisible(false);
      fetchData(pagination.current);
    } catch (error: any) {
      if (error.errorFields) {
        notification.error({
          message: t('pleaseFillComplete'),
          description: t('pleaseCheckRequiredFields'),
        });
      } else {
        console.error('充值失败:', error);
        message.error(t('topUpFailed'));
      }
    }
  };

  // 删除
  const handleDelete = (record: MemberData) => {
    setSelectedMember(record);
    setDeleteModalVisible(true);
  };

  // 确认删除
  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;
    
    try {
      await member.delete([selectedMember.id]);
      message.success(t('deleteMemberSuccess'));
      setDeleteModalVisible(false);
      fetchData(pagination.current);
    } catch (error) {
      console.error('删除会员失败:', error);
      message.error(t('deleteMemberFailed'));
    }
  };

  // 查看购买记录
  const handleViewPurchase = (record: MemberData) => {
    setSelectedMember(record);
    setCurrentView('purchase');
  };

  // 返回列表
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedMember(null);
  };

  // 查看所有会员购买记录
  const handleViewAllPurchase = () => {
    setCurrentView('allPurchase');
  };

  // 查看会员充值记录
  const handleViewTopUp = () => {
    setCurrentView('topUp');
  };

  // 新增会员
  const handleCreate = () => {
    createForm.resetFields();
    setCreateDrawerVisible(true);
  };

  // 提交新增会员
  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();

      const params: CreateMemberRequest = {
        name: values.name,
        phone: values.phone,
        registrationDate: values.registrationDate.format('YYYY-MM-DD'),
        voucherNumber: values.voucherNumber,
        remark: values.remark,
        balance: 0,
        membershipPackageTotal: 0,
      };

      await member.create(params);
      message.success(t('createMemberSuccess'));
      setCreateDrawerVisible(false);
      fetchData(pagination.current);
    } catch (error: any) {
      if (error.errorFields) {
        notification.error({
          message: t('pleaseFillComplete'),
          description: t('pleaseCheckRequiredFields'),
        });
      } else {
        console.error('新增会员失败:', error);
        message.error(t('createMemberFailed'));
      }
    }
  };

  // 表格列定义
  const columns = [
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: t('phone'),
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: t('voucherNumber'),
      dataIndex: 'voucherNumber',
      key: 'voucherNumber',
      width: 100,
    },
    {
      title: t('registrationDate'),
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      width: 120,
      render: (value: string) => moment(value).format('YYYY-MM-DD'),
    },
    {
      title: t('memberBalance'),
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      render: (balance: number) => (
        <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
          ¥{balance}
        </div>
      ),
    },
    {
      title: t('operation'),
      key: 'action',
      width: 80,
      fixed: 'right' as const,
      render: (_: any, record: MemberData) => {
        const menuItems = [
          <Menu.Item key="modify" icon={<EditOutlined />} onClick={() => handleModify(record)}>
            {t('modify')}
          </Menu.Item>,
          <Menu.Item key="topUp" icon={<PlusOutlined />} onClick={() => handleTopUp(record)}>
            {t('topUp')}
          </Menu.Item>,
          <Menu.Item key="detail" icon={<EyeOutlined />} onClick={() => handleViewPurchase(record)}>
            {t('detailRecord')}
          </Menu.Item>,
        ];

        // 只有有删除权限的用户才能看到删除选项
        if (canUseFeature('deleteMember')) {
          menuItems.push(
            <Menu.Divider key="divider" />,
            <Menu.Item key="delete" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
              {t('delete')}
            </Menu.Item>
          );
        }

        const menu = <Menu>{menuItems}</Menu>;

        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="link" icon={<MoreOutlined />}>
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  if (currentView === 'purchase' && selectedMember) {
    return (
      <MemberPurchaseHistory
        memberData={selectedMember}
        onBackToList={handleBackToList}
      />
    );
  }

  if (currentView === 'allPurchase') {
    return (
      <AllMemberPurchaseHistory onBackToList={handleBackToList} />
    );
  }

  if (currentView === 'topUp') {
    return (
      <MemberTopUpHistory onBackToList={handleBackToList} />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{t('memberManagement')}</h2>
        <div>
          <Button icon={<EyeOutlined />} onClick={handleViewAllPurchase} style={{ marginRight: 8 }}>
            {t('memberPurchaseHistory')}
          </Button>
          <Button icon={<PlusOutlined />} onClick={handleViewTopUp} style={{ marginRight: 8 }}>
            {t('memberTopUpHistory')}
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {t('addMember')}
          </Button>
        </div>
      </div>
      
      {/* 高级搜索 */}
      <Card style={{ marginBottom: 16 }}>
        <Collapse
          items={[
            {
              key: 'search',
              label: (
                <span>
                  <FilterOutlined style={{ marginRight: 8 }} />
                  {t('advancedSearch')}
                </span>
              ),
              children: (
                <Form
                  form={form}
                  layout="inline"
                  onFinish={handleSearch}
                >
                  <Form.Item name="name" label={t('name')}>
                    <Input placeholder={t('pleaseEnterName')} style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item name="phone" label={t('phone')}>
                    <Input placeholder={t('pleaseEnterPhone')} style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                      {t('search')}
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button onClick={handleReset} icon={<ReloadOutlined />}>
                      {t('reset')}
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>

      {/* 数据表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />
        
        {/* 分页 */}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handleTableChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
            }
          />
        </div>
      </Card>

      {/* 修改会员抽屉 */}
      <Drawer
        title={t('modifyMemberInfo')}
        open={modifyDrawerVisible}
        onClose={() => setModifyDrawerVisible(false)}
        width={600}
      >
        <Form form={modifyForm} layout="vertical">
          <Form.Item name="name" label={t('name')} rules={[{ required: true, message: t('pleaseEnterName') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('phone')} rules={[{ required: true, message: t('pleaseEnterPhone') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="registrationDate" label={t('registrationDate')} rules={[{ required: true, message: t('pleaseSelectRegistrationDate') }]}>
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              placeholder={t('pleaseSelectRegistrationDate')}
            />
          </Form.Item>
          <Form.Item name="voucherNumber" label={t('voucherNumber')} rules={[{ required: true, message: t('pleaseEnterVoucherNumber') }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label={t('remark')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleModifySubmit} block>
              {t('confirmModify')}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 充值抽屉 */}
      <Drawer
        title={t('memberTopUp')}
        open={topUpDrawerVisible}
        onClose={() => setTopUpDrawerVisible(false)}
        width={600}
      >
        <Form form={topUpForm} layout="vertical">
          <Form.Item name="amount" label={t('memberAmount')} rules={[{ required: true, message: t('pleaseEnterTopUpAmount') }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="saler" label={t('saler')} rules={[{ required: true, message: t('pleaseEnterSaler') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="remark" label={t('paymentDetail')} rules={[{ required: true, message: t('pleaseEnterPaymentDetail') }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleTopUpSubmit} block>
              {t('confirmTopUp')}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 新增会员抽屉 */}
      <Drawer
        title={t('addMember')}
        open={createDrawerVisible}
        onClose={() => setCreateDrawerVisible(false)}
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="name" label={t('name')} rules={[{ required: true, message: t('pleaseEnterName') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label={t('phone')} rules={[{ required: true, message: t('pleaseEnterPhone') }]}>
            <Input />
          </Form.Item>
          <Form.Item name="registrationDate" label={t('registrationDate')} rules={[{ required: true, message: t('pleaseSelectRegistrationDate') }]}>
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              placeholder={t('pleaseSelectRegistrationDate')}
            />
          </Form.Item>
          <Form.Item name="voucherNumber" label={t('voucherNumber')} rules={[{ required: true, message: t('pleaseEnterVoucherNumber') }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label={t('remark')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleCreateSubmit} block>
              {t('confirmAdd')}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 删除确认弹窗 */}
      <Modal
        title={t('deleteConfirm')}
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModalVisible(false)}
        okText={t('confirmDelete')}
        cancelText={t('cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('confirmDeleteMember', { name: selectedMember?.name })}</p>
      </Modal>
    </div>
  );
}
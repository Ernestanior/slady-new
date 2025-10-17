'use client';

import { useState, useEffect } from 'react';
import { Card, Tag, Button, Drawer, Form, Input, InputNumber, DatePicker, message, Modal, Dropdown, Menu } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DollarOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { member } from '@/lib/api';
import { MemberData, MemberListRequest, ModifyMemberRequest, TopUpMemberRequest, CreateMemberRequest } from '@/lib/types';
import { usePermissions } from '@/lib/usePermissions';
import moment from 'moment';
import MobileCardList from '../../MobileCardList';
import MemberPurchaseHistory from './MemberPurchaseHistory';

export default function MemberManagement() {
  const { t } = useTranslation();
  const { canUseFeature } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [searchText, setSearchText] = useState('');
  
  // Drawer states
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [modifyDrawerOpen, setModifyDrawerOpen] = useState(false);
  const [topUpDrawerOpen, setTopUpDrawerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  
  // Modal states
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingMember, setDeletingMember] = useState<MemberData | null>(null);
  
  // View states
  const [currentView, setCurrentView] = useState<'list' | 'purchase'>('list');
  
  // Forms
  const [createForm] = Form.useForm();
  const [modifyForm] = Form.useForm();
  const [topUpForm] = Form.useForm();

  // 获取会员列表
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params: MemberListRequest = {
        searchPage: {
          desc: 1,
          page: 1,
          pageSize: 999,
          sort: 'voucherNumber'
        }
      };
      
      const response = await member.getList(params);
      if (response.code === 200 && response.data) {
        setMembers(response.data.content || []);
      }
    } catch (error) {
      message.error(t('fetchMemberDataFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 新增会员
  const handleCreate = () => {
    createForm.resetFields();
    setCreateDrawerOpen(true);
  };

  const handleCreateSubmit = async (values: any) => {
    try {
      const params: CreateMemberRequest = {
        name: values.name,
        phone: values.phone,
        registrationDate: values.registrationDate.format('YYYY-MM-DD'),
        voucherNumber: values.voucherNumber,
        remark: values.remark || '',
        balance: 0,
        membershipPackageTotal: 0,
      };

      const response = await member.create(params);
      if (response.code === 200) {
        message.success(t('createMemberSuccess'));
        setCreateDrawerOpen(false);
        fetchMembers();
      } else {
        message.error(response.msg || t('createMemberFailed'));
      }
    } catch (error) {
      message.error(t('createMemberFailed'));
    }
  };

  // 修改会员
  const handleModify = (memberData: MemberData) => {
    setSelectedMember(memberData);
    modifyForm.setFieldsValue({
      name: memberData.name,
      phone: memberData.phone,
      registrationDate: moment(memberData.registrationDate),
      voucherNumber: memberData.voucherNumber,
      remark: memberData.remark,
    });
    setModifyDrawerOpen(true);
  };

  const handleModifySubmit = async (values: any) => {
    if (!selectedMember) return;
    
    try {
      const params: ModifyMemberRequest = {
        id: selectedMember.id,
        name: values.name,
        phone: values.phone,
        registrationDate: values.registrationDate.format('YYYY-MM-DD'),
        voucherNumber: values.voucherNumber,
        remark: values.remark || '',
      };

      const response = await member.modify(params);
      if (response.code === 200) {
        message.success(t('modifyMemberSuccess'));
        setModifyDrawerOpen(false);
        fetchMembers();
      } else {
        message.error(response.msg || t('modifyMemberFailed'));
      }
    } catch (error) {
      message.error(t('modifyMemberFailed'));
    }
  };

  // 充值
  const handleTopUp = (memberData: MemberData) => {
    setSelectedMember(memberData);
    topUpForm.resetFields();
    setTopUpDrawerOpen(true);
  };

  const handleTopUpSubmit = async (values: any) => {
    if (!selectedMember) return;
    
    try {
      const params: TopUpMemberRequest = {
        id: selectedMember.id,
        saler: values.saler,
        balance: Math.floor(values.amount),
        remark: values.remark,
      };

      const response = await member.topUp(params);
      if (response.code === 200) {
        message.success(t('topUpSuccess'));
        setTopUpDrawerOpen(false);
        fetchMembers();
      } else {
        message.error(response.msg || t('topUpFailed'));
      }
    } catch (error) {
      message.error(t('topUpFailed'));
    }
  };

  // 删除
  const handleDelete = (memberData: MemberData) => {
    setDeletingMember(memberData);
    setDeleteModalVisible(true);
  };

  // 查看购买记录
  const handleViewPurchase = (memberData: MemberData) => {
    setSelectedMember(memberData);
    setCurrentView('purchase');
  };

  // 返回列表
  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedMember(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingMember) return;
    
    try {
      const response = await member.delete([deletingMember.id]);
      if (response.code === 200) {
        message.success(t('deleteMemberSuccess'));
        setDeleteModalVisible(false);
        setDeletingMember(null);
        fetchMembers();
      } else {
        message.error(response.msg || t('deleteMemberFailed'));
      }
    } catch (error) {
      message.error(t('deleteMemberFailed'));
    }
  };

  // 筛选数据
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchText.toLowerCase()) ||
    m.phone.includes(searchText)
  );

  // 渲染会员卡片
  const renderMemberCard = (memberData: MemberData) => {
    const menuItems = [
      {
        key: 'modify',
        icon: <EditOutlined />,
        label: t('modify'),
        onClick: () => handleModify(memberData),
      },
      {
        key: 'topUp',
        icon: <DollarOutlined />,
        label: t('topUp'),
        onClick: () => handleTopUp(memberData),
      },
      {
        key: 'detail',
        icon: <EyeOutlined />,
        label: t('detailRecord'),
        onClick: () => handleViewPurchase(memberData),
      },
      {
        key: 'divider',
        type: 'divider' as const,
      },
      ...(canUseFeature('deleteMember') ? [{
        key: 'delete',
        icon: <DeleteOutlined />,
        label: t('delete'),
        danger: true,
        onClick: () => handleDelete(memberData),
      }] : []),
    ];

    return (
      <Card size="small" className="shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base font-semibold text-gray-800">{memberData.name}</span>
              <Tag color="green">${memberData.balance}</Tag>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>📱 {memberData.phone}</div>
              <div>🎫 {t('voucherNumber')}: {memberData.voucherNumber}</div>
              <div className="text-xs text-gray-400">
                {moment(memberData.registrationDate).format('YYYY-MM-DD')}
              </div>
            </div>
          </div>
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </Card>
    );
  };

  // 如果是购买记录页面，显示MemberPurchaseHistory组件
  if (currentView === 'purchase' && selectedMember) {
    return (
      <MemberPurchaseHistory
        memberData={selectedMember}
        onBackToList={handleBackToList}
      />
    );
  }

  return (
    <div className="p-4 pb-20">
      {/* 搜索和新增 */}
      <div className="mb-4 space-y-3">
        <Input
          placeholder={t('searchNameOrPhone')}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          allowClear
        />
        <Button
          type="primary"
          block
          size="large"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          {t('addMember')}
        </Button>
      </div>

      {/* 会员列表 */}
      <MobileCardList
        loading={loading}
        data={filteredMembers}
        renderCard={renderMemberCard}
        emptyText={t('noMembers')}
      />

      {/* 新增会员抽屉 */}
      <Drawer
        title={t('addMember')}
        placement="bottom"
        onClose={() => setCreateDrawerOpen(false)}
        open={createDrawerOpen}
        height="80%"
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateSubmit}
        >
          <Form.Item
            name="name"
            label={t('name')}
            rules={[{ required: true, message: t('pleaseEnterName') }]}
          >
            <Input size="large" placeholder={t('pleaseEnterName')} />
          </Form.Item>

          <Form.Item
            name="phone"
            label={t('phone')}
            rules={[{ required: true, message: t('pleaseEnterPhone') }]}
          >
            <Input size="large" placeholder={t('pleaseEnterPhone')} />
          </Form.Item>

          <Form.Item
            name="registrationDate"
            label={t('registrationDate')}
            rules={[{ required: true, message: t('pleaseSelectRegistrationDate') }]}
          >
            <DatePicker 
              size="large" 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              placeholder={t('pleaseSelectRegistrationDate')}
            />
          </Form.Item>

          <Form.Item
            name="voucherNumber"
            label={t('voucherNumber')}
            rules={[{ required: true, message: t('pleaseEnterVoucherNumber') }]}
          >
            <InputNumber size="large" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="remark" label={t('remark')}>
            <Input size="large" placeholder={t('remark')} />
          </Form.Item>

          <div className="flex gap-3 mt-6">
            <Button block size="large" onClick={() => setCreateDrawerOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" block size="large" htmlType="submit">
              {t('confirm')}
            </Button>
          </div>
        </Form>
      </Drawer>

      {/* 修改会员抽屉 */}
      <Drawer
        title={t('modifyMemberInfo')}
        placement="bottom"
        onClose={() => setModifyDrawerOpen(false)}
        open={modifyDrawerOpen}
        height="80%"
      >
        <Form
          form={modifyForm}
          layout="vertical"
          onFinish={handleModifySubmit}
        >
          <Form.Item
            name="name"
            label={t('name')}
            rules={[{ required: true, message: t('pleaseEnterName') }]}
          >
            <Input size="large" placeholder={t('pleaseEnterName')} />
          </Form.Item>

          <Form.Item
            name="phone"
            label={t('phone')}
            rules={[{ required: true, message: t('pleaseEnterPhone') }]}
          >
            <Input size="large" placeholder={t('pleaseEnterPhone')} />
          </Form.Item>

          <Form.Item
            name="registrationDate"
            label={t('registrationDate')}
            rules={[{ required: true, message: t('pleaseSelectRegistrationDate') }]}
          >
            <DatePicker 
              size="large" 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD"
              placeholder={t('pleaseSelectRegistrationDate')}
            />
          </Form.Item>

          <Form.Item
            name="voucherNumber"
            label={t('voucherNumber')}
            rules={[{ required: true, message: t('pleaseEnterVoucherNumber') }]}
          >
            <InputNumber size="large" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="remark" label={t('remark')}>
            <Input size="large" placeholder={t('remark')} />
          </Form.Item>

          <div className="flex gap-3 mt-6">
            <Button block size="large" onClick={() => setModifyDrawerOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" block size="large" htmlType="submit">
              {t('confirm')}
            </Button>
          </div>
        </Form>
      </Drawer>

      {/* 充值抽屉 */}
      <Drawer
        title={t('memberTopUp')}
        placement="bottom"
        onClose={() => setTopUpDrawerOpen(false)}
        open={topUpDrawerOpen}
        height="70%"
      >
        <Form
          form={topUpForm}
          layout="vertical"
          onFinish={handleTopUpSubmit}
        >
          <Form.Item
            name="amount"
            label={t('memberAmount')}
            rules={[{ required: true, message: t('pleaseEnterTopUpAmount') }]}
          >
            <InputNumber size="large" style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="saler"
            label={t('saler')}
            rules={[{ required: true, message: t('pleaseEnterSaler') }]}
          >
            <Input size="large" placeholder={t('pleaseEnterSaler')} />
          </Form.Item>

          <Form.Item
            name="remark"
            label={t('paymentDetail')}
            rules={[{ required: true, message: t('pleaseEnterPaymentDetail') }]}
          >
            <Input size="large" placeholder={t('pleaseEnterPaymentDetail')} />
          </Form.Item>

          <div className="flex gap-3 mt-6">
            <Button block size="large" onClick={() => setTopUpDrawerOpen(false)}>
              {t('cancel')}
            </Button>
            <Button type="primary" block size="large" htmlType="submit">
              {t('confirm')}
            </Button>
          </div>
        </Form>
      </Drawer>

      {/* 删除确认弹窗 */}
      <Modal
        title={t('deleteConfirm')}
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText={t('confirmDelete')}
        cancelText={t('cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('confirmDeleteMember', { name: deletingMember?.name })}</p>
      </Modal>
    </div>
  );
}


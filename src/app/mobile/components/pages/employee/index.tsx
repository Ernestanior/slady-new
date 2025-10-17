'use client';

import { useState, useEffect } from 'react';
import { Card, Tag, Button, Drawer, Form, Input, Select, message, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import { USER_PERMISSIONS } from '@/lib/endpoints';
import MobileCardList from '../../MobileCardList';

interface Employee {
  id: number;
  name: string;
  account?: string;  // 账号
  type: string;
  createDate: string;
}

export default function EmployeeManagement() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // 获取员工列表
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await api.user.getList({
        searchPage: {
          desc: 1,
          page: 1,
          pageSize: 999,
          sort: ''
        },
        keyWord: ''
      });
      if (response.code === 200 && response.data) {
        setEmployees(response.data.content || []);
      }
    } catch (error) {
      message.error('获取失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 新增员工
  const handleAdd = () => {
    form.resetFields();
    setEditingEmployee(null);
    setEditDrawerOpen(true);
  };

  // 编辑员工
  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue(employee);
    setEditDrawerOpen(true);
  };

  // 删除员工
  const handleDelete = (employee: Employee) => {
    setDeletingEmployee(employee);
    setDeleteModalVisible(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingEmployee) return;
    
    try {
      const response = await api.user.delete([deletingEmployee.id]);
      if (response.code === 200) {
        message.success(t('deleteSuccess'));
        setDeleteModalVisible(false);
        setDeletingEmployee(null);
        fetchEmployees();
      } else {
        message.error(response.msg || t('deleteFailed'));
      }
    } catch (error) {
      message.error(t('deleteFailed'));
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      if (editingEmployee) {
        // 修改
        const response = await api.user.modify({ ...values, id: editingEmployee.id });
        if (response.code === 200) {
          message.success(t('modifySuccess'));
          setEditDrawerOpen(false);
          fetchEmployees();
        }
      } else {
        // 新增
        const response = await api.user.create(values);
        if (response.code === 200) {
          message.success(t('createSuccess'));
          setEditDrawerOpen(false);
          fetchEmployees();
        }
      }
    } catch (error) {
      message.error(t('operationFailed'));
    }
  };

  // 筛选数据
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (emp.account && emp.account.includes(searchText))
  );

  // 渲染员工卡片
  const renderEmployeeCard = (employee: Employee) => (
    <Card 
      size="small"
      className="shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-base font-semibold text-gray-800">{employee.name}</span>
            <Tag color="orange">{employee.type}</Tag>
          </div>
          {employee.account && (
            <div className="text-sm text-gray-600">
              👤 {employee.account}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(employee)}
          >
            {t('edit')}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(employee)}
          >
            {t('delete')}
          </Button>
        </div>
      </div>
    </Card>
  );

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
          onClick={handleAdd}
        >
          {t('addEmployee')}
        </Button>
      </div>

      {/* 员工列表 */}
      <MobileCardList
        loading={loading}
        data={filteredEmployees}
        renderCard={renderEmployeeCard}
        emptyText={t('noEmployees')}
      />

      {/* 新增/编辑抽屉 */}
      <Drawer
        title={editingEmployee ? t('editEmployee') : t('addEmployee')}
        placement="bottom"
        onClose={() => setEditDrawerOpen(false)}
        open={editDrawerOpen}
        height="80%"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label={t('name')}
            rules={[{ required: true, message: t('pleaseEnterName') }]}
          >
            <Input size="large" placeholder={t('pleaseEnterName')} />
          </Form.Item>

          <Form.Item
            name="type"
            label={t('permission')}
            rules={[{ required: true, message: t('pleaseSelectPermission') }]}
          >
            <Select size="large" placeholder={t('pleaseSelectPermission')}>
              {USER_PERMISSIONS.map(permission => (
                <Select.Option key={permission.value} value={permission.value}>
                  {permission.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {!editingEmployee && (
            <Form.Item
              name="password"
              label={t('password')}
              rules={[{ required: true, message: t('pleaseEnterPassword') }]}
            >
              <Input.Password size="large" placeholder={t('pleaseEnterPassword')} />
            </Form.Item>
          )}

          <div className="flex gap-3 mt-6">
            <Button block size="large" onClick={() => setEditDrawerOpen(false)}>
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
        title={t('delete')}
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText={t('confirm')}
        cancelText={t('cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('confirmDeleteUser')} {deletingEmployee?.name}{t('question')}</p>
      </Modal>
    </div>
  );
}


'use client';

import { useState, useEffect, useRef } from 'react';
import { Button, message, Form, Input, Select, InputNumber, notification } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api';
import { User, UserFormData } from '@/lib/types';
import { USER_PERMISSIONS } from '@/lib/endpoints';
import UniversalTable from '../../UniversalTable';
import { TableColumn, TableAction, AdvancedSearchConfig, DrawerConfig, DeleteConfig } from '@/lib/table-types';

const { Option } = Select;

export default function EmployeeManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const hasInitialized = useRef(false);

  // 获取用户列表
  const fetchUsers = async (searchParams?: any, pagination?: any) => {
    setLoading(true);
    try {
      const params = {
        searchPage: {
          desc: 1,
          page: pagination?.current || 1,
          pageSize: pagination?.pageSize || 20,
          sort: '',
        },
        keyWord: searchParams?.name || '',
      };
      
      const response = await api.user.getList(params);
        if (response.code === 200) {
          setUsers(response.data.content);
          // 更新分页信息
          if (pagination) {
            pagination.total = response.data.totalElements;
            pagination.current = response.data.number + 1;
          }
        } else {
          notification.error({
            message: t('fetchUserListFailed'),
            description: response.msg || t('unknownError'),
            duration: 4.5,
          });
        }
    } catch (error) {
      message.error(t('fetchUserListFailed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchUsers();
    }
  }, []);

  // 搜索处理
  const handleSearch = (values: any) => {
    fetchUsers(values);
  };

  // 分页处理
  const handlePaginationChange = (page: number, pageSize: number) => {
    fetchUsers(searchForm.getFieldsValue(), { current: page, pageSize });
  };

  // 打开添加用户drawer
  const handleAdd = () => {
    setEditingUser(null);
    editForm.resetFields();
    setDrawerVisible(true);
  };

  // 打开编辑用户drawer
  const handleEdit = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      name: user.name,
      type: user.type,
    });
    setDrawerVisible(true);
  };

  // 删除用户
  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setDeleteModalVisible(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    
    try {
      const response = await api.user.delete([deletingUser.id] );
        if (response.code === 200) {
          message.success(t('deleteSuccess'));
          setDeleteModalVisible(false);
          setDeletingUser(null);
          fetchUsers();
        } else {
          notification.error({
            message: t('deleteFailed'),
            description: response.msg || t('unknownError'),
            duration: 4.5,
          });
        }
    } catch (error) {
      message.error(t('deleteFailed'));
    }
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    console.log('handleSubmit被调用，表单提交的values:', values);
    try {
      if (editingUser) {
        // 编辑用户
        const modifyData = {
          id: editingUser.id,
          name: values.name,
          type: values.type,
        };
        console.log('修改用户参数:', modifyData);
        const response = await api.user.modify(modifyData);
        if (response.code === 200) {
          message.success(t('modifySuccess'));
          setDrawerVisible(false);
          editForm.resetFields();
          fetchUsers();
        } else {
          notification.error({
            message: t('modifyFailed'),
            description: response.msg || t('unknownError'),
            duration: 4.5,
          });
        }
      } else {
        // 创建用户
        const createData = {
          name: values.name,
          type: values.type,
          password: values.password,
        };
        console.log('创建用户参数:', createData);
        const response = await api.user.create(createData);
        if (response.code === 200) {
          message.success(t('createSuccess'));
          setDrawerVisible(false);
          editForm.resetFields();
          fetchUsers();
        } else {
          notification.error({
            message: t('createFailed'),
            description: response.msg || t('unknownError'),
            duration: 4.5,
          });
        }
      }
    } catch (error) {
      message.error(t('operationFailed'));
    }
  };

  // 表格列定义
  const columns: TableColumn[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: t('permission'),
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        const permission = USER_PERMISSIONS.find(p => p.value === type);
        return permission ? permission.label : type;
      },
    },
  ];

  // 操作配置
  const actions: TableAction[] = [
    {
      key: 'edit',
      label: t('edit'),
      icon: <EditOutlined />,
      onClick: handleEdit,
    },
    {
      key: 'delete',
      label: t('delete'),
      icon: <DeleteOutlined />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  // 高级搜索配置
  const advancedSearch: AdvancedSearchConfig = {
    visible: true,
    onToggle: () => {},
    form: searchForm,
    onSearch: handleSearch,
    onReset: () => {
      searchForm.resetFields();
      fetchUsers();
    },
    children: (
      <>
        <Form.Item label={t('name')} name="name">
          <Input placeholder={t('pleaseEnterName')} />
        </Form.Item>
        {/* <Form.Item label="权限" name="type">
          <Select placeholder="请选择权限" allowClear>
            {USER_PERMISSIONS.map(permission => (
              <Option key={permission.value} value={permission.value}>
                {permission.label}
              </Option>
            ))}
          </Select>
        </Form.Item> */}
      </>
    ),
  };

  // 编辑Drawer配置
  const editDrawer: DrawerConfig = {
    title: editingUser ? t('editEmployee') : t('addEmployee'),
    visible: drawerVisible,
    onClose: () => setDrawerVisible(false),
    onSubmit: handleSubmit,
    form: editForm,
    children: (
      <>
        <Form.Item
          label={t('account')}
          name="name"
          rules={[{ required: true, message: t('pleaseEnterAccount') }]}
        >
          <Input placeholder={t('pleaseEnterAccount')} />
        </Form.Item>

        {!editingUser && (
          <Form.Item
            label={t('password')}
            name="password"
            rules={[{ required: true, message: t('pleaseEnterPassword') }]}
          >
            <Input.Password placeholder={t('pleaseEnterPassword')} />
          </Form.Item>
        )}

        <Form.Item
          label={t('permission')}
          name="type"
          rules={[{ required: true, message: t('pleaseSelectPermission') }]}
        >
          <Select placeholder={t('pleaseSelectPermission')}>
            {USER_PERMISSIONS.map(permission => (
              <Option key={permission.value} value={permission.value}>
                {permission.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </>
    ),
  };

  // 删除Modal配置
  const deleteModal: DeleteConfig = {
    title: t('confirmDelete'),
    content: `${t('confirmDelete')} "${deletingUser?.name}" ${t('question')}`,
    visible: deleteModalVisible,
    onConfirm: handleConfirmDelete,
    onCancel: () => {
      setDeleteModalVisible(false);
      setDeletingUser(null);
    },
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('employeeManagement')}</h1>
        <p className="text-gray-900 mt-2">{t('manageEmployeeInfoAndPermissions')}</p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <UniversalTable
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => t('totalRecordsCount', { total }),
            onChange: handlePaginationChange,
          }}
          advancedSearch={advancedSearch}
          onAdd={handleAdd}
          addButtonText={t('addEmployee')}
          editDrawer={editDrawer}
          deleteModal={deleteModal}
          actions={actions}
          maxVisibleActions={2}
        />
      </div>
    </div>
  );
}

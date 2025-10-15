'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Drawer,
  Modal,
  Form,
  Card,
  Collapse,
  Dropdown,
  Menu,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { UniversalTableProps, TableAction } from '@/lib/table-types';
import { t } from 'i18next';

const { Panel } = Collapse;

export default function UniversalTable({
  columns,
  dataSource,
  loading = false,
  rowKey,
  pagination,
  advancedSearch,
  onAdd,
  addButtonText = '新增',
  addButtonIcon = <PlusOutlined />,
  editDrawer,
  deleteModal,
  actions = [],
  maxVisibleActions = 2,
  scroll,
  size = 'middle',
  bordered = true,
  className,
}: UniversalTableProps) {
  const [searchCollapsed, setSearchCollapsed] = useState(false);

  // 处理操作栏
  const handleActions = (record: any) => {
    if (actions.length <= maxVisibleActions) {
      // 直接显示所有操作
      return (
        <Space size="middle">
          {actions.map((action) => (
            <Button
              key={action.key}
              type="link"
              icon={action.icon}
              danger={action.danger}
              disabled={action.disabled}
              onClick={() => action.onClick(record)}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      );
    } else {
      // 显示部分操作 + 更多菜单
      const visibleActions = actions.slice(0, maxVisibleActions - 1);
      const hiddenActions = actions.slice(maxVisibleActions - 1);

      const menu = (
        <Menu>
          {hiddenActions.map((action) => (
            <Menu.Item
              key={action.key}
              icon={action.icon}
              danger={action.danger}
              disabled={action.disabled}
              onClick={() => action.onClick(record)}
            >
              {action.label}
            </Menu.Item>
          ))}
        </Menu>
      );

      return (
        <Space size="middle">
          {visibleActions.map((action) => (
            <Button
              key={action.key}
              type="link"
              icon={action.icon}
              danger={action.danger}
              disabled={action.disabled}
              onClick={() => action.onClick(record)}
            >
              {action.label}
            </Button>
          ))}
          <Dropdown overlay={menu} trigger={['click']}>
            <Button type="link" icon={<MoreOutlined />}>
              更多
            </Button>
          </Dropdown>
        </Space>
      );
    }
  };

  // 构建最终列配置
  const finalColumns = [
    ...columns.map((col, index) => ({
      ...col,
        fixed: index === 0 ? ('left' as const) : undefined,
    })),
    ...(actions.length > 0
      ? [
          {
            title: t('operation'),
            key: 'action',
            width: actions.length > maxVisibleActions ? 200 : 150,
            fixed: 'right' as const,
            render: (_: any, record: any) => handleActions(record),
          },
        ]
      : []),
  ];

  return (
    <div className={className}>
      {/* 高级搜索 */}
      {advancedSearch && (
        <Card className="mb-4" size="small">
          <Collapse
            activeKey={searchCollapsed ? [] : ['search']}
            onChange={(keys) => setSearchCollapsed(keys.length === 0)}
            ghost
          >
            <Panel
              header={
                <div className="flex items-center">
                  <span>{t('advancedSearch')}</span>
                </div>
              }
              key="search"
            >
              <Form 
                form={advancedSearch.form} 
                layout="inline"
                onFinish={advancedSearch.onSearch}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 8px', width: '100%' }}>
                  {advancedSearch.children}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Space>
                      <Button type="primary" htmlType="submit">
                        {t('search')}
                      </Button>
                      <Button
                        onClick={() => {
                          advancedSearch.form.resetFields();
                          advancedSearch.onReset?.();
                        }}
                      >
                        {t('reset')}
                      </Button>
                    </Space>
                  </Form.Item>
                </div>
              </Form>
            </Panel>
          </Collapse>
        </Card>
      )}

      {/* 表格工具栏 */}
      <div className="flex justify-end items-center mb-4">
        {onAdd && (
          <Button
            type="primary"
            icon={addButtonIcon}
            onClick={onAdd}
          >
            {addButtonText}
          </Button>
        )}
      </div>

      {/* 表格 */}
      <Table
        columns={finalColumns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        pagination={pagination}
        scroll={{
          x: 'max-content',
          y: 400,
          ...scroll,
        }}
        size={size}
        bordered={bordered}
      />

      {/* 编辑Drawer */}
      {editDrawer && (
        <Drawer
          title={editDrawer.title}
          width={400}
          open={editDrawer.visible}
          onClose={editDrawer.onClose}
          footer={
            <div className="flex justify-end space-x-2">
              <Button onClick={editDrawer.onClose}>
                取消
              </Button>
              <Button
                type="primary"
                loading={editDrawer.loading}
                onClick={() => {
                  console.log('确认按钮被点击');
                  editDrawer.form.submit();
                }}
              >
                确认
              </Button>
            </div>
          }
        >
          <Form
            form={editDrawer.form}
            layout="vertical"
            requiredMark={false}
            onFinish={editDrawer.onSubmit}
          >
            {editDrawer.children}
          </Form>
        </Drawer>
      )}

      {/* 删除确认Modal */}
      {deleteModal && (
        <Modal
          title={deleteModal.title}
          open={deleteModal.visible}
          onOk={deleteModal.onConfirm}
          onCancel={deleteModal.onCancel}
          confirmLoading={deleteModal.loading}
          okText="确认"
          cancelText="取消"
        >
          <p>{deleteModal.content}</p>
        </Modal>
      )}
    </div>
  );
}

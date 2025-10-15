'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Pagination, Collapse, Form, Input, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { EmployeeOperationLog, EmployeeOperationLogRequest } from '@/lib/types';
import { employeeOperationLog } from '@/lib/api';
import moment from 'moment';

export default function EmployeeHistory() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [data, setData] = useState<EmployeeOperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 获取数据
  const fetchData = async (page = 1, searchParams: any = {}) => {
    setLoading(true);
    setData([]);
    
    try {
      const formValues = form.getFieldsValue();
      const params: EmployeeOperationLogRequest = {
        searchPage: {
          desc: 1,
          page,
          pageSize: 20,
          sort: 'create_date'
        },
        ...formValues,
        ...searchParams
      };

      // 处理日期范围
      if (formValues.operateDate && formValues.operateDate.length === 2) {
        params.startDate = formValues.operateDate[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
        params.endDate = formValues.operateDate[1].endOf('day').format('YYYY-MM-DD HH:mm:ss');
        delete (params as any).operateDate;
      }

      const response = await employeeOperationLog.getList(params);
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
      console.error('获取员工操作历史记录失败:', error);
      message.error(t('fetchEmployeeHistoryFailed'));
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

  // 表格列定义
  const columns = [
    {
      title: t('operator'),
      dataIndex: 'userName',
      key: 'userName',
      fixed: 'left' as const,
      width: 100,
    },
    {
      title: t('uri'),
      dataIndex: 'uri',
      key: 'uri',
      fixed: 'left' as const,
      width: 200,
      render: (res: any) => res,
    },
    {
      title: t('details'),
      dataIndex: 'body',
      key: 'body',
      render: (value: any) => value,
    },
    {
      title: t('operationTime'),
      dataIndex: 'createDate',
      key: 'createDate',
      fixed: 'right' as const,
      width: 200,
      render: (value: string) => moment(value).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{t('employeeOperationHistory')}</h2>
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
                  <Form.Item name="userName" label={t('operator')}>
                    <Input placeholder={t('pleaseEnterOperatorName')} style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item name="uri" label={t('api')}>
                    <Input placeholder={t('pleaseEnterApiPath')} style={{ width: 200 }} />
                  </Form.Item>
                  <Form.Item name="operateDate" label={t('operationTime')}>
                    <DatePicker.RangePicker 
                      placeholder={[t('startTime'), t('endTime')]} 
                      style={{ width: 300 }}
                    />
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
          scroll={{ x: 1000 }}
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
    </div>
  );
}
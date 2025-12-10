'use client';

import React, { useState, useEffect } from 'react';
import { Table, Form, Input, DatePicker, Button, Card, message, Pagination } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { InventoryRecordItem, InventoryRecordRequest } from '@/lib/types';
import { inventoryRecord } from '@/lib/api';
import moment from 'moment';

const dev_url = 'http://119.28.104.20';

export default function InventoryRecords() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [data, setData] = useState<InventoryRecordItem[]>([]);
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
    // 立即清空数据，防止数据累加
    setData([]);
    
    try {
      const formValues = form.getFieldsValue();
      const params: InventoryRecordRequest = {
        searchPage: {
          desc: 1,
          page,
          pageSize: 20,
          sort: 'create_date'
        },
        uri: '/item/modify-stock',
        ...formValues,
        ...searchParams
      };

      // 处理日期范围
      if (formValues.operateDate && formValues.operateDate.length === 2) {
        params.startDate = formValues.operateDate[0].startOf('day').format('YYYY-MM-DD HH:mm:ss');
        params.endDate = formValues.operateDate[1].endOf('day').format('YYYY-MM-DD HH:mm:ss');
        delete (params as any).operateDate;
      }

      console.log('发送请求参数:', params); // 调试信息

      const response = await inventoryRecord.getList(params);
      if (response.code === 200) {
        console.log('接收到的数据:', response.data); // 调试信息
        
        // 解析 body 字段中的 JSON 数据
        const processedData = response.data.content.map(item => {
          try {
            const bodyData = JSON.parse(item.body);
            return {
              ...bodyData,
              ...item,

            };
          } catch (error) {
            console.error('解析 body 数据失败:', error);
            return item;
          }
        });
        
        console.log('处理后的数据:', processedData); // 调试信息
        
        // 确保数据被正确设置，即使是空数组
        setData(processedData);
        setPagination({
          current: response.data.number + 1,
          pageSize: response.data.size,
          total: response.data.totalElements,
        });
      } else {
        // 如果响应码不是200，也要清空数据
        setData([]);
        setPagination({
          current: 1,
          pageSize: 20,
          total: 0,
        });
      }
    } catch (error) {
      console.error('获取库存修改记录失败:', error);
      message.error(t('fetchInventoryRecordsFailed'));
      // 出错时也要清空数据
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

  // 初始化数据 - 防止重复调用
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
      title: t('productImage'),
      dataIndex: 'previewPhoto',
      key: 'previewPhoto',
      width: 120,
      fixed: 'left' as const,
      render: (photo: string) => (
        <img
          style={{ height: 100, width: 80, objectFit: 'cover' }}
          alt={t('productImage')}
          src={dev_url + photo}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            // 防止无限循环：如果已经是 placeholder 就不再设置
            if (!img.src.includes('placeholder-image.jpg') && !img.src.includes('data:image')) {
              // 使用 data URI 作为占位符（透明 1x1 像素图片）
              img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
            }
          }}
        />
      ),
    },
    {
      title: t('designCode'),
      dataIndex: 'design',
      key: 'design',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: t('color'),
      dataIndex: 'color',
      key: 'color',
      width: 100,
    },
    {
      title: t('size'),
      dataIndex: 'size',
      key: 'size',
      width: 80,
    },
    {
      title: t('warehouse'),
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 120,
    },
    {
      title: t('originalStock'),
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      render: (stock: number) => (
        <div style={{ fontWeight: 'bold', color: '#262626' }}>
          {stock}
        </div>
      ),
    },
    {
      title: t('newStock'),
      dataIndex: 'newStock',
      key: 'newStock',
      width: 100,
      render: (newStock: number) => (
        <div style={{ 
          fontWeight: 'bold',
          color: newStock > 0 ? '#52c41a' : '#ff4d4f'
        }}>
          {newStock}
        </div>
      ),
    },
    {
      title: t('operator'),
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
    },
    {
      title: t('operationTime'),
      dataIndex: 'createDate',
      key: 'createDate',
      width: 180,
      
    },
  ];

  return (
    <div style={{ padding: '24px' }}>

      
      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="body" label={t('designCode')}>
            <Input placeholder={t('pleaseEnterDesignCode')} style={{ width: 200,marginBottom:20  }} />
          </Form.Item>
          <Form.Item name="userName" label={t('operator')}>
            <Input placeholder={t('pleaseEnterOperator')} style={{ width: 200 }} />
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

'use client';

import React, { useState, useEffect } from 'react';
import { Table, Button, Card, message, Pagination, Space, Tag, Tabs } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { MemberPurchaseRecord, MemberPurchaseHistoryRequest } from '@/lib/types';
import { member } from '@/lib/api';

interface AllMemberPurchaseHistoryProps {
  onBackToList: () => void;
}

export default function AllMemberPurchaseHistory({ onBackToList }: AllMemberPurchaseHistoryProps) {
  const { t } = useTranslation();
  const [purchaseData, setPurchaseData] = useState<MemberPurchaseRecord[]>([]);
  const [refundData, setRefundData] = useState<MemberPurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('purchase');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 获取购买记录数据
  const fetchPurchaseData = async () => {
    setLoading(true);
    try {
      const params: MemberPurchaseHistoryRequest = {
        searchPage: {
          desc: 1,
          page: 1,
          pageSize: 20,
          sort: 'create_date'
        },
        refund: 2
      };

      const response = await member.getPurchaseHistoryList(params);
      if (response.code === 200) {
        setPurchaseData(response.data.content);
        setPagination({
          current: response.data.number + 1,
          pageSize: response.data.size,
          total: response.data.totalElements,
        });
      } else {
        setPurchaseData([]);
        setPagination({
          current: 1,
          pageSize: 20,
          total: 0,
        });
      }
    } catch (error) {
      console.error('获取购买记录失败:', error);
      message.error('获取购买记录失败');
      setPurchaseData([]);
    } finally {
      setLoading(false);
    }
  };

  // 获取退还记录数据
  const fetchRefundData = async () => {
    setLoading(true);
    try {
      const params: MemberPurchaseHistoryRequest = {
        searchPage: {
          desc: 1,
          page: 1,
          pageSize: 20,
          sort: 'create_date'
        },
        refund: 1
      };

      const response = await member.getPurchaseHistoryList(params);
      if (response.code === 200) {
        setRefundData(response.data.content);
      } else {
        setRefundData([]);
      }
    } catch (error) {
      console.error('获取退还记录失败:', error);
      message.error('获取退还记录失败');
      setRefundData([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    Promise.all([fetchPurchaseData(), fetchRefundData()]);
  }, []);

  // 表格列定义
  const columns = [
    {
      title: t('purchaseDate'),
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      fixed: 'left' as const,
      width: 150,
    },
    {
      title: t('saler'),
      dataIndex: 'saler',
      key: 'saler',
      width: 100,
    },
    {
      title: t('products'),
      dataIndex: 'designList',
      key: 'designList',
      width: 400,
      render: (value: any) => {
        if (!Array.isArray(value) || value.length === 0) return <span>-</span>;

        return (
          <Space wrap>
            {value.map((item, idx) => (
              <Tag key={idx} color="blue">
                {item.designCode} - ${item.price}
              </Tag>
            ))}
          </Space>
        );
      }
    },
    {
      title: t('member'),
      dataIndex: 'member',
      key: 'member',
      width: 200,
      render: (value: any, item: any) => (
        <div>
          <div>{item.memberName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{item.memberPhone}</div>
        </div>
      ),
    },
    {
      title: t('totalAmount'),
      dataIndex: 'sum',
      key: 'sum',
      width: 100,
      render: (sum: number) => (
        <div style={{ 
          fontWeight: 'bold', 
          color: sum < 0 ? '#ff4d4f' : '#52c41a' 
        }}>
          ${sum}
        </div>
      ),
    },
    {
      title: t('memberBalance'),
      dataIndex: 'memberRemainingAmount',
      key: 'memberRemainingAmount',
      width: 120,
      render: (amount: number) => (
        <div style={{ fontWeight: 'bold', color: '#52c41a' }}>
          ${amount}
        </div>
      ),
    },
    {
      title: t('paymentDetailOrRefundReason'),
      dataIndex: 'remark',
      key: 'remark',
      fixed: 'right' as const,
      width: 150,
    },
  ];

  const tabItems = [
    {
      key: 'purchase',
      label: t('memberPurchase'),
      children: (
        <Table
          columns={columns}
          dataSource={purchaseData}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
        />
      ),
    },
    {
      key: 'refund',
      label: t('memberRefund'),
      children: (
        <Table
          columns={columns}
          dataSource={refundData}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
        />
      ),
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBackToList}
            style={{ marginRight: 16 }}
          >
            返回列表
          </Button>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{t('allMemberPurchaseHistory')}</h2>
        </div>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
        
        {/* 分页 */}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page) => {
              setPagination(prev => ({ ...prev, current: page }));
            }}
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

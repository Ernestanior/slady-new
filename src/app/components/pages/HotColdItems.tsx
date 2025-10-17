'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tabs, Card, Spin, message } from 'antd';
import { FireOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { HotColdItem, HotColdListRequest } from '@/lib/types';
import { hotCold } from '@/lib/api';

const dev_url = 'http://119.28.104.20';

export default function HotColdItems() {
  const [activeTab, setActiveTab] = useState('hot');
  const [hotData, setHotData] = useState<HotColdItem[]>([]);
  const [coldData, setColdData] = useState<HotColdItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // 获取爆款数据
  const fetchHotData = async () => {
    try {
      const params: HotColdListRequest = {
        type: '',
        searchPage: {
          desc: 1, // 降序排列，热度高的在前
          page: 1,
          pageSize: 20,
          sort: 'hot'
        }
      };
      const response = await hotCold.getList(params);
      if (response.code === 200) {
        setHotData(response.data.content);
      }
    } catch (error) {
      console.error('获取爆款数据失败:', error);
      message.error('获取爆款数据失败');
    }
  };

  // 获取冷款数据
  const fetchColdData = async () => {
    try {
      const params: HotColdListRequest = {
        type: '',
        searchPage: {
          desc: 0, // 升序排列，热度低的在前
          page: 1,
          pageSize: 20,
          sort: 'hot'
        }
      };
      const response = await hotCold.getList(params);
      if (response.code === 200) {
        setColdData(response.data.content);
      }
    } catch (error) {
      console.error('获取冷款数据失败:', error);
      message.error('获取冷款数据失败');
    }
  };

  // 初始化数据 - 防止重复调用
  useEffect(() => {
    if (!hasLoaded) {
      setLoading(true);
      setHasLoaded(true);
      Promise.all([fetchHotData(), fetchColdData()])
        .finally(() => {
          setLoading(false);
        });
    }
  }, [hasLoaded]);

  // 表格列定义
  const columns = [
    {
      title: '排行',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '16px',
          color: activeTab === 'hot' ? '#ff4d4f' : '#1890ff'
        }}>
          #{index + 1}
        </div>
      ),
    },
    {
      title: '商品图片',
      dataIndex: 'previewPhoto',
      key: 'previewPhoto',
      width: 120,
      render: (photo: string) => (
        <img
          style={{ 
            height: 80, 
            width: 80, 
            objectFit: 'cover',
            borderRadius: '8px',
            border: '1px solid #f0f0f0'
          }}
          alt="商品图片"
          src={dev_url + photo}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
          }}
        />
      ),
    },
    {
      title: '商品代码',
      dataIndex: 'design',
      key: 'design',
      width: 150,
      render: (design: string) => (
        <div style={{ fontWeight: 'bold', color: '#262626' }}>
          {design}
        </div>
      ),
    },
    {
      title: '热度值',
      dataIndex: 'hot',
      key: 'hot',
      width: 100,
      render: (hot: number) => (
        <div style={{ 
          fontWeight: 'bold',
          color: activeTab === 'hot' ? '#ff4d4f' : '#1890ff',
          fontSize: '16px'
        }}>
          {hot || 0}
        </div>
      ),
    },
    {
      title: '商品类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <div style={{ color: '#595959' }}>
          {type}
        </div>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number) => (
        <div style={{ 
          color: stock > 0 ? '#52c41a' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {stock}
        </div>
      ),
    },
    {
      title: '售价',
      dataIndex: 'salePrice',
      key: 'salePrice',
      width: 100,
      render: (price: string) => (
        <div style={{ 
          fontWeight: 'bold',
          color: '#262626'
        }}>
          ${price}
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'hot',
      label: (
        <span>
          <FireOutlined style={{ color: '#ff4d4f' }} />
          爆款排行
        </span>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={hotData}
          rowKey="id"
          pagination={false}
          loading={loading}
          size="middle"
          style={{ marginTop: 16 }}
        />
      ),
    },
    {
      key: 'cold',
      label: (
        <span>
          <MinusCircleOutlined style={{ color: '#1890ff' }} />
          冷款排行
        </span>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={coldData}
          rowKey="id"
          pagination={false}
          loading={loading}
          size="middle"
          style={{ marginTop: 16 }}
        />
      ),
    },
  ];

  // 获取前三名商品数据
  const getTopThreeHot = () => hotData.slice(0, 3);
  const getTopThreeCold = () => coldData.slice(0, 3);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>爆/冷款分析</h2>
      </div>

      {/* 前三名商品展示模块 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">🔥 爆款商品</h3>
          <div className="space-y-3">
            {getTopThreeHot().map((item, index) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    style={{ 
                      height: 100, 
                      width: 100, 
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #f0f0f0'
                    }}
                    alt="商品图片"
                    src={dev_url + item.previewPhoto}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                  <div>
                    <p className="font-medium">{item.design}</p>
                    <p className="text-sm text-gray-900">热度: {item.hot || 0}</p>
                  </div>
                </div>
                <span className="text-red-600 font-bold">#{index + 1}</span>
              </div>
            ))}
            {getTopThreeHot().length === 0 && (
              <div className="text-center text-gray-500 py-4">暂无数据</div>
            )}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">❄️ 冷款商品</h3>
          <div className="space-y-3">
            {getTopThreeCold().map((item, index) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    style={{ 
                      height: 100, 
                      width: 100, 
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #f0f0f0'
                    }}
                    alt="商品图片"
                    src={dev_url + item.previewPhoto}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                    }}
                  />
                  <div>
                    <p className="font-medium">{item.design}</p>
                    <p className="text-sm text-gray-900">热度: {item.hot || 0}</p>
                  </div>
                </div>
                <span className="text-blue-600 font-bold">#{index + 1}</span>
              </div>
            ))}
            {getTopThreeCold().length === 0 && (
              <div className="text-center text-gray-500 py-4">暂无数据</div>
            )}
          </div>
        </div>
      </div>

      <Card 
        style={{ 
          borderRadius: 8, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ minHeight: 400 }}
        />
      </Card>
    </div>
  );
}

'use client';

import { Card, Spin, Empty } from 'antd';
import { ReactNode } from 'react';

interface MobileCardListProps {
  loading?: boolean;
  data: any[];
  renderCard: (item: any) => ReactNode;
  emptyText?: string;
}

export default function MobileCardList({ 
  loading = false, 
  data, 
  renderCard,
  emptyText = '暂无数据'
}: MobileCardListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-20">
        <Empty description={emptyText} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.id || index}>
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}


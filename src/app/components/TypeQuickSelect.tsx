'use client';

import React from 'react';
import { Button } from 'antd';
import { typeList } from '@/lib/types';

interface TypeQuickSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}

const TypeQuickSelect: React.FC<TypeQuickSelectProps> = ({
  value,
  onChange,
  style
}) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', ...style }}>
      <Button
        type={value === '' || value === null ? 'primary' : 'default'}
        onClick={() => onChange('')}
        style={{ marginBottom: '8px' }}
      >
        全部
      </Button>
      {typeList.map((item) => (
        <Button
          key={item.value}
          type={value === item.value ? 'primary' : 'default'}
          onClick={() => onChange(item.value)}
          style={{ marginBottom: '8px' }}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};

export default TypeQuickSelect;

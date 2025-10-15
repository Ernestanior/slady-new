'use client';

import React from 'react';
import { Select } from 'antd';
import { typeList } from '@/lib/types';

interface TypeMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

const TypeMultiSelect: React.FC<TypeMultiSelectProps> = ({
  value,
  onChange,
  placeholder = "选择商品类型",
  style
}) => {
  return (
    <Select
      mode="multiple"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ minWidth: 200, ...style }}
      options={typeList}
      maxTagCount="responsive"
      showSearch
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  );
};

export default TypeMultiSelect;

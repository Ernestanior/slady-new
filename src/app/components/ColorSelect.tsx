'use client';

import React, { useState, useRef } from 'react';
import { Select, Input, Button, Space, Divider } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useColorManager } from '@/lib/colorManager';

interface ColorSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  mode?: 'multiple' | 'tags';
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function ColorSelect({
  value,
  onChange,
  placeholder = '请选择颜色',
  size = 'middle',
  mode = 'multiple',
  disabled = false,
  style,
  className,
}: ColorSelectProps) {
  const { getAllColors, addColor } = useColorManager();
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<any>(null);

  // 添加新颜色
  const handleAddColor = () => {
    if (inputValue.trim() && !getAllColors().includes(inputValue.trim())) {
      addColor(inputValue.trim());
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // 处理回车键
  const handlePressEnter = () => {
    handleAddColor();
  };

  // 获取颜色选项
  const colorOptions = getAllColors().map(color => ({
    label: color,
    value: color,
  }));

  return (
    <Select
      mode={mode}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size={size}
      disabled={disabled}
      style={style}
      className={className}
      dropdownRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ padding: '0 8px 4px' }}>
            <Input
              placeholder="请输入新颜色"
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onPressEnter={handlePressEnter}
              size={size}
            />
            <Button 
              type="text" 
              icon={<PlusOutlined />} 
              onClick={handleAddColor}
              size={size}
            >
              添加颜色
            </Button>
          </Space>
        </>
      )}
      options={colorOptions}
    />
  );
}

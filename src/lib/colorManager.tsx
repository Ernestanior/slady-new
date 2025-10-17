'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { colorList } from './types';

interface ColorManagerContextType {
  // 获取所有颜色（包括原有的和新增的）
  getAllColors: () => string[];
  // 添加新颜色
  addColor: (color: string) => void;
  // 检查颜色是否存在
  hasColor: (color: string) => boolean;
  // 获取新增的颜色
  getNewColors: () => string[];
  // 清空新增的颜色
  clearNewColors: () => void;
}

const ColorManagerContext = createContext<ColorManagerContextType | undefined>(undefined);

interface ColorManagerProviderProps {
  children: ReactNode;
}

export function ColorManagerProvider({ children }: ColorManagerProviderProps) {
  // 新增的颜色列表
  const [newColors, setNewColors] = useState<string[]>([]);

  // 获取所有颜色（原有 + 新增）
  const getAllColors = useCallback(() => {
    return [...colorList, ...newColors];
  }, [newColors]);

  // 添加新颜色
  const addColor = useCallback((color: string) => {
    if (color && !colorList.includes(color) && !newColors.includes(color)) {
      setNewColors(prev => [...prev, color]);
    }
  }, []);

  // 检查颜色是否存在
  const hasColor = useCallback((color: string) => {
    return colorList.includes(color) || newColors.includes(color);
  }, [newColors]);

  // 获取新增的颜色
  const getNewColors = useCallback(() => {
    return newColors;
  }, [newColors]);

  // 清空新增的颜色
  const clearNewColors = useCallback(() => {
    setNewColors([]);
  }, []);

  const value: ColorManagerContextType = {
    getAllColors,
    addColor,
    hasColor,
    getNewColors,
    clearNewColors,
  };

  return (
    <ColorManagerContext.Provider value={value}>
      {children}
    </ColorManagerContext.Provider>
  );
}

// 自定义Hook
export function useColorManager() {
  const context = useContext(ColorManagerContext);
  if (context === undefined) {
    throw new Error('useColorManager must be used within a ColorManagerProvider');
  }
  return context;
}

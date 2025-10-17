'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { App } from 'antd';

interface NotificationManagerContextType {
  // 成功提示
  success: (message: string, description?: string) => void;
  // 错误提示
  error: (message: string, description?: string) => void;
  // 警告提示
  warning: (message: string, description?: string) => void;
  // 信息提示
  info: (message: string, description?: string) => void;
  // 自定义提示
  custom: (config: {
    message: string;
    description?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  }) => void;
  // 关闭所有提示
  destroy: () => void;
}

const NotificationManagerContext = createContext<NotificationManagerContextType | undefined>(undefined);

interface NotificationManagerProviderProps {
  children: ReactNode;
}

export function NotificationManagerProvider({ children }: NotificationManagerProviderProps) {
  const { notification } = App.useApp();

  // 成功提示
  const success = (message: string, description?: string) => {
    notification.success({
      message,
      description,
      duration: 4.5,
      placement: 'topRight',
    });
  };

  // 错误提示
  const error = (message: string, description?: string) => {
    notification.error({
      message,
      description,
      duration: 6,
      placement: 'topRight',
    });
  };

  // 警告提示
  const warning = (message: string, description?: string) => {
    notification.warning({
      message,
      description,
      duration: 4.5,
      placement: 'topRight',
    });
  };

  // 信息提示
  const info = (message: string, description?: string) => {
    notification.info({
      message,
      description,
      duration: 4.5,
      placement: 'topRight',
    });
  };

  // 自定义提示
  const custom = (config: {
    message: string;
    description?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  }) => {
    const { type = 'info', duration = 4.5, placement = 'topRight', ...rest } = config;
    
    notification[type]({
      ...rest,
      duration,
      placement,
    });
  };

  // 关闭所有提示
  const destroy = () => {
    notification.destroy();
  };

  const value: NotificationManagerContextType = {
    success,
    error,
    warning,
    info,
    custom,
    destroy,
  };

  return (
    <NotificationManagerContext.Provider value={value}>
      {children}
    </NotificationManagerContext.Provider>
  );
}

// 自定义Hook
export function useNotification() {
  const context = useContext(NotificationManagerContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationManagerProvider');
  }
  return context;
}

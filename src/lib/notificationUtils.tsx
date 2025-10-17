'use client';

import React from 'react';
import { App } from 'antd';

// 创建一个全局通知工具组件
export function NotificationUtils() {
  const { notification } = App.useApp();

  // 将notification实例挂载到全局对象上
  if (typeof window !== 'undefined') {
    (window as any).__globalNotification = notification;
  }

  return null;
}

// 全局通知工具类 - 兼容Ant Design 5.x
class GlobalNotification {
  // 获取全局notification实例
  private static getNotification() {
    if (typeof window !== 'undefined' && (window as any).__globalNotification) {
      return (window as any).__globalNotification;
    }
    console.warn('GlobalNotification: notification实例未初始化，请确保NotificationUtils组件已渲染');
    return null;
  }

  // 成功提示
  static success(message: string, description?: string) {
    const notification = this.getNotification();
    if (notification) {
      notification.success({
        message,
        description,
        duration: 4.5,
        placement: 'topRight',
      });
    }
  }

  // 错误提示
  static error(message: string, description?: string) {
    const notification = this.getNotification();
    if (notification) {
      notification.error({
        message,
        description,
        duration: 6,
        placement: 'topRight',
      });
    }
  }

  // 警告提示
  static warning(message: string, description?: string) {
    const notification = this.getNotification();
    if (notification) {
      notification.warning({
        message,
        description,
        duration: 4.5,
        placement: 'topRight',
      });
    }
  }

  // 信息提示
  static info(message: string, description?: string) {
    const notification = this.getNotification();
    if (notification) {
      notification.info({
        message,
        description,
        duration: 4.5,
        placement: 'topRight',
      });
    }
  }

  // 自定义提示
  static custom(config: {
    message: string;
    description?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  }) {
    const notification = this.getNotification();
    if (notification) {
      const { type = 'info', duration = 4.5, placement = 'topRight', ...rest } = config;
      
      notification[type]({
        ...rest,
        duration,
        placement,
      });
    }
  }

  // 关闭所有提示
  static destroy() {
    const notification = this.getNotification();
    if (notification) {
      notification.destroy();
    }
  }

  // 关闭指定提示
  static destroyByKey(key: string) {
    const notification = this.getNotification();
    if (notification) {
      notification.destroy(key);
    }
  }
}

export default GlobalNotification;

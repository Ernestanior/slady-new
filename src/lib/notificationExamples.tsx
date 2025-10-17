'use client';

import React from 'react';
import { Button, Space } from 'antd';
import { useNotification } from './notificationManager';
import GlobalNotification from './notificationUtils';

// 使用Hook方式的示例组件
export function NotificationHookExample() {
  const notification = useNotification();

  const handleSuccess = () => {
    notification.success('操作成功！', '数据已保存到数据库');
  };

  const handleError = () => {
    notification.error('操作失败！', '网络连接异常，请检查网络设置');
  };

  const handleWarning = () => {
    notification.warning('注意！', '此操作将删除所有数据，请谨慎操作');
  };

  const handleInfo = () => {
    notification.info('提示信息', '系统将在5分钟后进行维护');
  };

  const handleCustom = () => {
    notification.custom({
      message: '自定义通知',
      description: '这是一个自定义的通知消息',
      type: 'success',
      duration: 8,
      placement: 'bottomRight',
    });
  };

  const handleDestroy = () => {
    notification.destroy();
  };

  return (
    <Space wrap>
      <Button type="primary" onClick={handleSuccess}>
        成功提示
      </Button>
      <Button danger onClick={handleError}>
        错误提示
      </Button>
      <Button type="default" onClick={handleWarning}>
        警告提示
      </Button>
      <Button type="dashed" onClick={handleInfo}>
        信息提示
      </Button>
      <Button onClick={handleCustom}>
        自定义提示
      </Button>
      <Button onClick={handleDestroy}>
        关闭所有
      </Button>
    </Space>
  );
}

// 使用工具类方式的示例组件
export function NotificationToolExample() {
  const handleSuccess = () => {
    GlobalNotification.success('操作成功！', '数据已保存到数据库');
  };

  const handleError = () => {
    GlobalNotification.error('操作失败！', '网络连接异常，请检查网络设置');
  };

  const handleWarning = () => {
    GlobalNotification.warning('注意！', '此操作将删除所有数据，请谨慎操作');
  };

  const handleInfo = () => {
    GlobalNotification.info('提示信息', '系统将在5分钟后进行维护');
  };

  const handleCustom = () => {
    GlobalNotification.custom({
      message: '自定义通知',
      description: '这是一个自定义的通知消息',
      type: 'success',
      duration: 8,
      placement: 'bottomRight',
    });
  };

  const handleDestroy = () => {
    GlobalNotification.destroy();
  };

  return (
    <Space wrap>
      <Button type="primary" onClick={handleSuccess}>
        成功提示
      </Button>
      <Button danger onClick={handleError}>
        错误提示
      </Button>
      <Button type="default" onClick={handleWarning}>
        警告提示
      </Button>
      <Button type="dashed" onClick={handleInfo}>
        信息提示
      </Button>
      <Button onClick={handleCustom}>
        自定义提示
      </Button>
      <Button onClick={handleDestroy}>
        关闭所有
      </Button>
    </Space>
  );
}

// 使用说明
export const NotificationUsageGuide = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>全局通知使用指南</h2>
      
      <h3>方式一：使用Hook（推荐在React组件中使用）</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
{`import { useNotification } from '@/lib/notificationManager';

function MyComponent() {
  const notification = useNotification();
  
  const handleClick = () => {
    notification.success('操作成功！');
    notification.error('操作失败！');
    notification.warning('警告信息！');
    notification.info('提示信息！');
  };
}`}
      </pre>

      <h3>方式二：使用工具类（需要NotificationUtils组件支持）</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
{`import GlobalNotification from '@/lib/notificationUtils';

// 在任何地方都可以直接调用（需要NotificationUtils组件已渲染）
GlobalNotification.success('操作成功！');
GlobalNotification.error('操作失败！');
GlobalNotification.warning('警告信息！');
GlobalNotification.info('提示信息！');

// 自定义通知
GlobalNotification.custom({
  message: '自定义通知',
  description: '详细描述',
  type: 'success',
  duration: 8,
  placement: 'bottomRight'
});`}
      </pre>

      <h3>API说明</h3>
      <ul>
        <li><strong>success(message, description?)</strong> - 成功提示，绿色图标</li>
        <li><strong>error(message, description?)</strong> - 错误提示，红色图标</li>
        <li><strong>warning(message, description?)</strong> - 警告提示，黄色图标</li>
        <li><strong>info(message, description?)</strong> - 信息提示，蓝色图标</li>
        <li><strong>custom(config)</strong> - 自定义提示，可配置类型、位置、持续时间等</li>
        <li><strong>destroy()</strong> - 关闭所有通知</li>
      </ul>
    </div>
  );
};

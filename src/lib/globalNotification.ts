import { App } from 'antd';

// 全局通知工具类 - 兼容Ant Design 5.x
class GlobalNotification {
  private static getNotification() {
    // 在Ant Design 5.x中，需要通过App.useApp()获取notification实例
    // 这里我们创建一个临时的App实例来获取notification
    const { notification } = App.useApp();
    return notification;
  }

  // 成功提示
  static success(message: string, description?: string) {
    // 注意：在Ant Design 5.x中，静态方法调用notification需要特殊处理
    // 建议使用Hook方式或Context方式
    console.warn('GlobalNotification.success() 在Ant Design 5.x中需要App.useApp()支持，建议使用useNotification Hook');
  }

  // 错误提示
  static error(message: string, description?: string) {
    console.warn('GlobalNotification.error() 在Ant Design 5.x中需要App.useApp()支持，建议使用useNotification Hook');
  }

  // 警告提示
  static warning(message: string, description?: string) {
    console.warn('GlobalNotification.warning() 在Ant Design 5.x中需要App.useApp()支持，建议使用useNotification Hook');
  }

  // 信息提示
  static info(message: string, description?: string) {
    console.warn('GlobalNotification.info() 在Ant Design 5.x中需要App.useApp()支持，建议使用useNotification Hook');
  }

  // 自定义提示
  static custom(config: {
    message: string;
    description?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  }) {
    console.warn('GlobalNotification.custom() 在Ant Design 5.x中需要App.useApp()支持，建议使用useNotification Hook');
  }

  // 关闭所有提示
  static destroy() {
    console.warn('GlobalNotification.destroy() 在Ant Design 5.x中需要App.useApp()支持，建议使用useNotification Hook');
  }

  // 关闭指定提示
  static destroyByKey(key: string) {
    console.warn('GlobalNotification.destroyByKey() 在Ant Design 5.x中需要App.useApp()支持，建议使用useNotification Hook');
  }
}

export default GlobalNotification;

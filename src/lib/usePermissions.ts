'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, E_USER_TYPE } from '@/lib/types';

// 权限管理Hook
export function usePermissions() {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      const response = await api.user.getBasic();
      if (response.code === 200) {
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // 权限检查函数
  const hasPermission = (requiredTypes: string[]) => {
    if (!userInfo) return false;
    return requiredTypes.includes(userInfo.type);
  };

  // 检查是否为管理员
  const isAdmin = () => {
    return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN]);
  };

  // 检查是否为销售员
  const isSaler = () => {
    return hasPermission([E_USER_TYPE.SALER]);
  };

  // 检查是否为财务
  const isFinance = () => {
    return hasPermission([E_USER_TYPE.FINANCE]);
  };

  // 检查是否为物流
  const isLogistics = () => {
    return hasPermission([E_USER_TYPE.LOGISTICS]);
  };

  // 检查是否为产品管理
  const isProductManagement = () => {
    return hasPermission([E_USER_TYPE.PRODUCTMANAGEMENT]);
  };

  // 检查是否为超级管理员
  const isSuperAdmin = () => {
    return hasPermission([E_USER_TYPE.SUPERADMIN]);
  };

  // 根据用户类型获取可访问的页面
  const getAccessiblePages = () => {
    if (!userInfo) return [];

    switch (userInfo.type) {
      case E_USER_TYPE.SUPERADMIN:
        return ['employeeManagement'];
      
      case E_USER_TYPE.SALER:
        return [
          'designManagement',
          'orderManagement', 
          'hotColdItems',
          'inventoryRecords',
          'memberManagement',
          'billManagement'
        ];
      
      case E_USER_TYPE.LOGISTICS:
        return ['orderManagement'];
      
      case E_USER_TYPE.FINANCE:
        return ['billManagement'];
      
      case E_USER_TYPE.PRODUCTMANAGEMENT:
        return ['designManagement', 'hotColdItems'];
      
      case E_USER_TYPE.ADMIN:
      default:
        return [
          'employeeManagement',
          'designManagement',
          'orderManagement',
          'hotColdItems',
          'inventoryRecords',
          'employeeHistory',
          'memberManagement',
          'billManagement'
        ];
    }
  };

  // 检查页面是否可访问
  const canAccessPage = (pageName: string) => {
    const accessiblePages = getAccessiblePages();
    return accessiblePages.includes(pageName);
  };

  // 检查功能是否可用
  const canUseFeature = (feature: string) => {
    if (!userInfo) return false;

    switch (feature) {
      case 'createEmployee':
      case 'editEmployee':
      case 'deleteEmployee':
        return isAdmin();
      
      case 'createDesign':
      case 'editDesign':
      case 'deleteDesign':
        return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN, E_USER_TYPE.PRODUCTMANAGEMENT]);
      
      case 'modifyStock':
        return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN]);
      
      case 'createOrder':
      case 'editOrder':
      case 'deleteOrder':
        return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN, E_USER_TYPE.SALER, E_USER_TYPE.LOGISTICS]);
      
      case 'createMember':
      case 'editMember':
      case 'deleteMember':
        return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN]);
      
      case 'printReceipt':
      case 'printLabel':
      case 'printDailyReport':
        return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN, E_USER_TYPE.SALER]);
      
      case 'cashManagement':
      case 'balanceManagement':
        return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN, E_USER_TYPE.FINANCE]);
      
      case 'createItem':
      case 'modifyStock':
      case 'deleteItem':
        return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN, E_USER_TYPE.PRODUCTMANAGEMENT]);
      
      case 'deleteMember':
        return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN]);
      
      case 'deletePurchaseRecord':
        return hasPermission([E_USER_TYPE.ADMIN, E_USER_TYPE.SUPERADMIN]);
      
      default:
        return true;
    }
  };

  return {
    userInfo,
    loading,
    hasPermission,
    isAdmin,
    isSaler,
    isFinance,
    isLogistics,
    isProductManagement,
    isSuperAdmin,
    getAccessiblePages,
    canAccessPage,
    canUseFeature
  };
}

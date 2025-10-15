// 项目所有接口定义
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    VALIDATE: '/auth/validate',
  },
  
  // 用户管理
  USER: {
    LIST: '/user/list',
    CREATE: '/user/create',
    MODIFY: '/user/modify',
    DELETE: '/user/delete',
  },
  
  // 订单管理
  ORDER: {
    LOGISTICS: '/order/logistics',
    HISTORY: '/order/history',
  },
  
  // 商品管理
  PRODUCT: {
    HOT_COLD: '/product/hot-cold',
    INVENTORY: '/product/inventory',
    DESIGN: '/design/page',
    DESIGN_DETAIL: '/design/detail',
    DESIGN_MODIFY: '/design/modify',
    DESIGN_DELETE: '/design/delete',
    DESIGN_CREATE: '/design/create',
  },
  
  // 文件上传
  FILE: {
    UPLOAD: '/file/upload',
  },
  
  // Item管理
  ITEM: {
    CREATE: '/item/create',
  },
  
  // 反馈管理
  FEEDBACK: {
    KOREA: '/feedback/korea',
  },
  
  // 会员管理
  MEMBER: {
    LIST: '/member/list',
    CREATE: '/member/create',
    MODIFY: '/member/modify',
    DELETE: '/member/delete',
  },
  
  // 账单管理
  BILL: {
    LIST: '/bill/list',
    CREATE: '/bill/create',
    MODIFY: '/bill/modify',
    DELETE: '/bill/delete',
  },
} as const;

// 用户权限类型
export const USER_PERMISSIONS = [
  { value: 'ADMIN', label: 'BOSS' },
  { value: 'SALER', label: 'SALER' },
  { value: 'PRODUCTMANAGEMENT', label: 'PRODUCT_MANAGEMENT' },
  { value: 'FINANCE', label: 'FINANCIAL' },
  { value: 'LOGISTICS', label: 'KOREAN_LOGISTICS' },
] as const;

// 用户类型
export type UserPermission = typeof USER_PERMISSIONS[number]['value'];

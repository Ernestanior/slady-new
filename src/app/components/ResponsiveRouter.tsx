'use client';

import { useState, useEffect } from 'react';

interface ResponsiveRouterProps {
  children: React.ReactNode;
}

export default function ResponsiveRouter({ children }: ResponsiveRouterProps) {
  // 简化为仅检测设备类型，不再做路由跳转
  // 所有响应式逻辑由各组件内部的 Tailwind 断点处理
  
  return <>{children}</>;
}

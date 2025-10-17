import type { Metadata } from "next";
import { App as AntdApp } from 'antd';
import I18nProvider from '../components/I18nProvider';
import { ColorManagerProvider } from '@/lib/colorManager';
import { NotificationManagerProvider } from '@/lib/notificationManager';
import { NotificationUtils } from '@/lib/notificationUtils';

export const metadata: Metadata = {
  title: "Slady Mobile",
  description: "Slady 移动端管理系统",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function MobileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <I18nProvider>
        <ColorManagerProvider>
          <NotificationManagerProvider>
            <AntdApp>
              <NotificationUtils />
              {children}
            </AntdApp>
          </NotificationManagerProvider>
        </ColorManagerProvider>
      </I18nProvider>
  );
}


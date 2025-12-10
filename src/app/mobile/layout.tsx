import type { Metadata, Viewport } from "next";
import { App as AntdApp } from 'antd';
import I18nProvider from '../components/I18nProvider';
import { ColorManagerProvider } from '@/lib/colorManager';
import { NotificationManagerProvider } from '@/lib/notificationManager';
import { NotificationUtils } from '@/lib/notificationUtils';

export const metadata: Metadata = {
  title: "Slady Mobile",
  description: "Slady 移动端管理系统",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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


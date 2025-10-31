import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import 'antd/dist/reset.css';
import { App as AntdApp } from 'antd';
import I18nProvider from './components/I18nProvider';
import { ColorManagerProvider } from '@/lib/colorManager';
import { NotificationManagerProvider } from '@/lib/notificationManager';
import { NotificationUtils } from '@/lib/notificationUtils';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Slady 后台管理系统",
  description: "Slady 后台管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <I18nProvider>
          <ColorManagerProvider>
            <AntdApp>
              <NotificationManagerProvider>
                <NotificationUtils />
                {children}
              </NotificationManagerProvider>
            </AntdApp>
          </ColorManagerProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

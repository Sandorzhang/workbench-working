import { AuthProvider } from '@/lib/auth';
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DebugPanel } from '@/components/DebugPanel';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppLayout } from "@/components/app-layout";
import "./globals.css";
import React from 'react';
import { MSWInitializer } from '@/components/msw-initializer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "教育管理平台",
  description: "基于Next.js和Shadcn UI构建的教育管理平台",
};

// 服务器组件
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && <MSWInitializer />}
          <ErrorBoundary>
            <AppLayout>
              {children}
            </AppLayout>
          </ErrorBoundary>
          {process.env.NODE_ENV === 'development' && <DebugPanel />}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

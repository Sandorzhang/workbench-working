import { MswInitializer } from '@/components/MswInitializer';
import { AuthProvider } from '@/lib/auth';
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DebugPanel } from '@/components/DebugPanel';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppLayout } from "@/components/app-layout";
import "./globals.css";

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

// 检查是否启用MSW
const enableMsw = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';

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
        {enableMsw ? (
          <MswInitializer>
            <ErrorBoundary>
              <AuthProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </AuthProvider>
            </ErrorBoundary>
            {process.env.NODE_ENV === 'development' && <DebugPanel />}
          </MswInitializer>
        ) : (
          <ErrorBoundary>
            <AuthProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </AuthProvider>
            {process.env.NODE_ENV === 'development' && <DebugPanel />}
          </ErrorBoundary>
        )}
        <Toaster />
      </body>
    </html>
  );
}

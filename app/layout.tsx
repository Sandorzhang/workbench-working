import { MswInitializer } from "@/components/MswInitializer";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DebugPanel } from "@/components/DebugPanel";
import type { Metadata } from "next";
import { AppLayout } from "@/components/app-layout";
import "./globals.css";

export const metadata: Metadata = {
  title: "教育管理平台",
  description: "基于Next.js和Shadcn UI构建的教育管理平台",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600&display=swap"
        />
      </head>
      <body className="font-sans antialiased">
        <MswInitializer>
          <ErrorBoundary>
            <AuthProvider>
              <AppLayout>{children}</AppLayout>
            </AuthProvider>
          </ErrorBoundary>
          {process.env.NODE_ENV === "development" && <DebugPanel />}
        </MswInitializer>
        <Toaster />
      </body>
    </html>
  );
}

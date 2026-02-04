'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatbotWidget } from '@/components/chatbot';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <Header />
      <div className="flex-1 bg-gray-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </div>
      <Footer />
      <ChatbotWidget />
    </AuthGuard>
  );
}

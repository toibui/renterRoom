import type { Metadata } from 'next';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rental Manager Mobile',
  description: 'Quản lý nhà trọ tiện lợi trên thiết bị di động',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 min-h-screen pb-20 md:pb-0 text-slate-900 antialiased">
        <Header />
        <main className="max-w-4xl mx-auto">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}

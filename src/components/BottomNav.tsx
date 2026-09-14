'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  if (!pathname.startsWith('/admin')) return null;

  const navItems = [
    { label: 'Tổng quan', href: '/admin', icon: '🏠' },
    { label: 'Phòng', href: '/admin/rooms', icon: '🔑' },
    { label: 'Điện nước', href: '/admin/electric-water', icon: '⚡' },
    { label: 'Hóa đơn', href: '/admin/invoices', icon: '📄' },
    { label: 'Khách thuê', href: '/admin/tenants', icon: '👥' },
    { label: 'Nhà trọ', href: '/admin/property', icon: '🏡' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-200 md:hidden shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full text-[11px] font-medium transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="text-lg leading-none mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

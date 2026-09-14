'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === '/';
  const isAdminRoot = pathname === '/admin';
  const isAdmin = pathname.startsWith('/admin');

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isHome && !isAdminRoot && (
          <button
            onClick={() => router.back()}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 active:scale-95 transition text-sm font-bold"
            aria-label="Quay lại"
          >
            ←
          </button>
        )}
        <Link href="/" className="font-extrabold text-base md:text-lg text-blue-400 tracking-tight">
          Quản lý nhà trọ
        </Link>
      </div>

      <div className="flex items-center gap-2 text-xs">
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/30">
              Quản trị viên
            </span>
            {pathname !== '/admin/login' && (
              <button
                onClick={handleLogout}
                className="bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2.5 py-1 rounded-lg border border-red-500/30 transition font-semibold"
              >
                Thoát 🚪
              </button>
            )}
          </div>
        ) : (
          <Link
            href="/admin"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition"
          >
            Quản trị 🔒
          </Link>
        )}
      </div>
    </header>
  );
}
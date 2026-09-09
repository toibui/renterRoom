'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [tokenInput, setTokenInput] = useState('');

  const handleGoToRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      window.location.href = `/phong/${tokenInput.trim()}`;
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900">Rental Manager</h1>
          <p className="text-xs text-slate-500">Cổng Quản lý & Tra cứu Căn hộ Cho thuê</p>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Dành cho Khách thuê</h2>
          <form onSubmit={handleGoToRoom} className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập Mã phòng / Token..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="flex-1 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition">
              Tra cứu
            </button>
          </form>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-100 text-center">
          <h2 className="text-sm font-semibold text-slate-700">Dành cho Chủ nhà</h2>
          <Link href="/admin" className="block w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold text-sm transition shadow-sm">
            Truy cập Trang Quản Trị Admin
          </Link>
        </div>
      </div>
    </div>
  );
}

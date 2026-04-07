'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  User, 
  Phone, 
  Zap, 
  Trash2, 
  Edit3, 
  AlertTriangle,
  CheckCircle2,
  Home
} from 'lucide-react';

type Room = {
  id: string;
  roomNumber: string;
  tenantName: string | null;
  tenantPhone: string | null;
  tenantEmail: string | null;
  basePrice: number;
  isActive: boolean;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'no_bill';
  lastReading?: {
    electricNew: number;
    waterNew: number;
    createdAt: string;
  };
  needsReading: boolean;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xoá phòng này? Hệ thống sẽ chặn xoá nếu đã có hóa đơn.')) return;
    const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    if (res.ok) setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const filteredRooms = rooms.filter((r) => {
    const keyword = searchTerm.toLowerCase();
    return (
      r.roomNumber.toLowerCase().includes(keyword) ||
      r.tenantName?.toLowerCase().includes(keyword) ||
      r.tenantPhone?.includes(keyword)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER CỐ ĐỊNH */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">SƠ ĐỒ PHÒNG</h1>
            <div className="flex gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tổng: {rooms.length}</span>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Chưa chốt: {rooms.filter(r => r.needsReading).length}</span>
            </div>
          </div>
          <Link
            href="/rooms/new"
            className="w-10 h-10 md:w-auto md:px-5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} />
            <span className="hidden md:inline font-bold">Thêm phòng</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* THANH TÌM KIẾM */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm số phòng, khách thuê..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
            <p className="font-bold text-xs uppercase tracking-widest">Đang tải sơ đồ...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map((r) => (
              <div 
                key={r.id} 
                className={`relative bg-white rounded-3xl p-5 border-2 transition-all shadow-sm group ${
                  r.needsReading ? 'border-orange-200 ring-4 ring-orange-500/5' : 'border-transparent'
                }`}
              >
                {/* TRẠNG THÁI THANH TOÁN (BADGE) */}
                <div className="absolute top-4 right-4">
                  {r.paymentStatus === 'PAID' && <CheckCircle2 size={18} className="text-emerald-500" />}
                  {r.paymentStatus === 'PENDING' && <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />}
                  {r.paymentStatus === 'OVERDUE' && <AlertTriangle size={18} className="text-rose-500" />}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-xl shadow-inner ${
                    r.tenantName ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <span className="text-[8px] uppercase opacity-60">PHÒNG</span>
                    {r.roomNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-slate-900 truncate">
                      {r.tenantName || <span className="text-slate-300 italic font-normal">Phòng trống</span>}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                      <Phone size={10} />
                      <span className="truncate">{r.tenantPhone || '---'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Giá phòng</span>
                    <span className="text-sm font-black text-slate-700">{formatPrice(r.basePrice)}</span>
                  </div>
                  {r.lastReading && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                      <div className="flex gap-3">
                        <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                          <Zap size={10} fill="currentColor" /> {r.lastReading.electricNew}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                          💧 {r.lastReading.waterNew}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 italic">
                        {new Date(r.lastReading.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* THAO TÁC NHANH TRÊN MOBILE */}
                <div className="flex gap-2 pt-1">
                  <Link
                    href={`/meter-readings/new?roomId=${r.id}`}
                    className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-tighter flex items-center justify-center gap-2 transition-all ${
                      r.needsReading 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' 
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    <Zap size={14} fill={r.needsReading ? "white" : "none"} />
                    {r.needsReading ? 'Chốt số ngay' : 'Ghi số'}
                  </Link>
                  
                  <div className="flex gap-1">
                    <Link
                      href={`/rooms/${r.id}`}
                      className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      <Edit3 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* CẢNH BÁO NẾU PHÒNG NGƯNG HOẠT ĐỘNG */}
                {!r.isActive && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-3xl flex items-center justify-center">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Tạm ngưng</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
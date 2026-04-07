'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Search, Plus, Phone, Zap, Edit3, Trash2, 
  Power, PowerOff, MoreHorizontal 
} from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/rooms').then(res => res.json()).then(data => {
      setRooms(data || []);
      setLoading(false);
    });
  }, []);

  // HÀM TOGGLE ACTIVE/INACTIVE
  const toggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic UI: Cập nhật giao diện trước
    const originalRooms = [...rooms];
    setRooms(rooms.map(r => r.id === id ? { ...r, isActive: !currentStatus } : r));

    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      // Nếu lỗi thì trả lại dữ liệu cũ
      setRooms(originalRooms);
      alert("Không thể cập nhật trạng thái phòng.");
    }
  };

  // HÀM XÓA PHÒNG
  const handleDelete = async (id: string, roomNumber: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa phòng ${roomNumber}? Hành động này không thể hoàn tác.`)) return;

    try {
      const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRooms(rooms.filter(r => r.id !== id));
      } else {
        const error = await res.json();
        alert(error.message || "Không thể xóa phòng này.");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi khi xóa.");
    }
  };

  const filtered = rooms.filter(r => 
    r.roomNumber.includes(searchTerm) || r.tenantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">Sơ đồ phòng</h1>
          <div className="flex gap-2 mt-1">
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100 uppercase tracking-wider shadow-sm">Tổng: {rooms.length}</span>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md border border-rose-100 uppercase tracking-wider">Cần chốt: {rooms.filter(r => r.needsReading).length}</span>
          </div>
        </div>
        <Link href="/rooms/new" className="w-12 h-12 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center active-scale transition-all hover:bg-blue-700">
          <Plus size={24} />
        </Link>
      </div>

      {/* SEARCH */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Tìm phòng hoặc khách thuê..."
          className="w-full pl-12 pr-4 py-4.5 bg-white border-none rounded-2xl shadow-sm text-base font-semibold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500/20 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LIST */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] animate-pulse">Đang đồng bộ dữ liệu...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div 
              key={r.id} 
              className={`bg-white rounded-[2.5rem] p-6 border transition-all relative shadow-sm hover:shadow-md ${
                !r.isActive ? 'opacity-60 grayscale-[0.5]' : ''
              } ${r.needsReading && r.isActive ? 'border-amber-200 ring-4 ring-amber-500/5' : 'border-slate-100'}`}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-3xl shadow-inner transition-colors ${
                    !r.isActive ? 'bg-slate-200 text-slate-400' : r.tenantName ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'
                  }`}>
                    <span className="text-[9px] uppercase opacity-50 font-bold">P.</span>
                    {r.roomNumber}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className={`font-black text-lg italic truncate leading-none mb-1 ${!r.isActive ? 'text-slate-400' : 'text-slate-800'}`}>
                      {r.tenantName || <span className="text-slate-300 font-normal italic">Trống</span>}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                      <Phone size={12} /> {r.tenantPhone || '---'}
                    </div>
                  </div>
                </div>

                {/* NÚT TOGGLE ACTIVE - TOP RIGHT */}
                <button 
                  onClick={() => toggleActive(r.id, r.isActive)}
                  className={`p-2 rounded-xl transition-all active-scale ${
                    r.isActive ? 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                  }`}
                  title={r.isActive ? "Đang hoạt động" : "Đã ngưng"}
                >
                  {r.isActive ? <Power size={18} strokeWidth={3} /> : <PowerOff size={18} strokeWidth={3} />}
                </button>
              </div>

              {/* CHỈ SỐ */}
              <div className="bg-slate-50 p-4 rounded-3xl mb-5 flex justify-between items-center border border-slate-100/50">
                  <div className="flex gap-4">
                    <div className="flex flex-col"><span className="text-[8px] font-black text-slate-300 uppercase">Điện</span><span className="text-xs font-black text-amber-600">⚡ {r.lastReading?.electricNew || 0}</span></div>
                    <div className="flex flex-col"><span className="text-[8px] font-black text-slate-300 uppercase">Nước</span><span className="text-xs font-black text-blue-600">💧 {r.lastReading?.waterNew || 0}</span></div>
                  </div>
                  <div className="text-right"><span className="text-[8px] font-black text-slate-300 uppercase">Giá</span><p className="text-xs font-black text-slate-700">{(r.basePrice/1000).toLocaleString()}k</p></div>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2">
                <Link 
                  href={`/meter-readings/new?roomId=${r.id}`} 
                  className={`flex-[4] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center shadow-sm active-scale transition-all ${
                    !r.isActive ? 'bg-slate-100 text-slate-300 pointer-events-none' :
                    r.needsReading ? 'bg-slate-900 text-white shadow-slate-200 hover:bg-black' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {r.needsReading ? 'Chốt số ngay' : 'Ghi chỉ số'}
                </Link>
                
                <Link 
                  href={`/rooms/${r.id}`} 
                  className="flex-1 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center active-scale border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <Edit3 size={18} />
                </Link>

                <button 
                  onClick={() => handleDelete(r.id, r.roomNumber)}
                  className="flex-1 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center active-scale border border-rose-100 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* OVERLAY KHI INACTIVE */}
              {!r.isActive && (
                <div className="absolute top-2 left-6">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Ngưng hoạt động
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
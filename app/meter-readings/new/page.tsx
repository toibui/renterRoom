'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function SmartCreateReadingPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [fetchingOld, setFetchingOld] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    roomId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricOld: 0,
    electricNew: '',
    waterOld: 0,
    waterNew: ''
  });

  // 1. Load danh sách phòng hoạt động
  useEffect(() => {
    fetch('/api/rooms').then(res => res.json()).then(setRooms);
  }, []);

  // 2. Hàm lấy số cũ từ hệ thống
  const fetchLastIndex = useCallback(async (roomId: string, month: number, year: number) => {
    if (!roomId) return;
    setFetchingOld(true);
    try {
      const res = await fetch(`/api/meter-readings/last-index?roomId=${roomId}&month=${month}&year=${year}`);
      const data = await res.json();
      setForm(prev => ({
        ...prev,
        electricOld: data.electricOld,
        waterOld: data.waterOld,
        electricNew: '', // Reset để nhập mới
        waterNew: ''    // Reset để nhập mới
      }));
    } finally {
      setFetchingOld(false);
    }
  }, []);

  // Tự động load số cũ khi thay đổi Phòng/Tháng/Năm
  useEffect(() => {
    fetchLastIndex(form.roomId, form.month, form.year);
  }, [form.roomId, form.month, form.year, fetchLastIndex]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(form.electricNew) < form.electricOld || parseFloat(form.waterNew) < form.waterOld) {
      alert("Số mới không được nhỏ hơn số cũ!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/meter-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push('/meter-readings');
    } catch (err) {
      alert("Lỗi khi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const usageElectric = parseFloat(form.electricNew) - form.electricOld || 0;
  const usageWater = parseFloat(form.waterNew) - form.waterOld || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white">
          <h1 className="text-2xl font-black tracking-tight">GHI CHỈ SỐ ĐỊNH KỲ</h1>
          <p className="text-slate-400 text-sm">Hệ thống tự động đối soát số cũ từ tháng trước</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* Section 1: Thông tin chung */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Chọn Phòng</label>
              <select 
                className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 font-bold outline-none focus:border-blue-500 transition-all"
                value={form.roomId}
                onChange={e => setForm({...form, roomId: e.target.value})}
                required
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((r: any) => <option key={r.id} value={r.id}>Phòng {r.roomNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Tháng chốt</label>
              <input 
                type="number" min="1" max="12"
                className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 font-bold" 
                value={form.month}
                onChange={e => setForm({...form, month: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Năm</label>
              <input 
                type="number"
                className="w-full bg-white border-2 border-slate-200 rounded-xl p-3 font-bold" 
                value={form.year}
                onChange={e => setForm({...form, year: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* KHỐI ĐIỆN (Màu Vàng/Cam) */}
            <div className={`relative group p-6 rounded-3xl border-2 transition-all ${fetchingOld ? 'opacity-40' : 'opacity-100'} bg-amber-50/50 border-amber-100`}>
              <div className="flex items-center justify-between mb-6">
                <span className="bg-amber-500 text-white p-2 rounded-lg text-xl">⚡</span>
                <h2 className="font-black text-amber-800 tracking-tighter">CHỈ SỐ ĐIỆN</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-amber-200 pb-4">
                  <span className="text-xs font-bold text-amber-600 uppercase">Số cũ</span>
                  <span className="text-3xl font-black text-amber-900">{form.electricOld}</span>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-amber-600 uppercase mb-2">Số mới ghi được</label>
                  <input 
                    type="number" step="0.1" required
                    className="w-full bg-white border-2 border-amber-300 rounded-2xl p-4 text-2xl font-black text-amber-600 outline-none focus:ring-4 focus:ring-amber-200"
                    placeholder="000.0"
                    value={form.electricNew}
                    onChange={e => setForm({...form, electricNew: e.target.value})}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-medium text-amber-700">Tiêu thụ tháng này:</span>
                  <span className="px-3 py-1 bg-amber-200 rounded-full text-amber-800 font-bold">
                    + {usageElectric.toFixed(1)} kWh
                  </span>
                </div>
              </div>
            </div>

            {/* KHỐI NƯỚC (Màu Xanh Dương) */}
            <div className={`relative group p-6 rounded-3xl border-2 transition-all ${fetchingOld ? 'opacity-40' : 'opacity-100'} bg-blue-50/50 border-blue-100`}>
              <div className="flex items-center justify-between mb-6">
                <span className="bg-blue-500 text-white p-2 rounded-lg text-xl">💧</span>
                <h2 className="font-black text-blue-800 tracking-tighter">CHỈ SỐ NƯỚC</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-blue-200 pb-4">
                  <span className="text-xs font-bold text-blue-600 uppercase">Số cũ</span>
                  <span className="text-3xl font-black text-blue-900">{form.waterOld}</span>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-blue-600 uppercase mb-2">Số mới ghi được</label>
                  <input 
                    type="number" step="0.1" required
                    className="w-full bg-white border-2 border-blue-300 rounded-2xl p-4 text-2xl font-black text-blue-600 outline-none focus:ring-4 focus:ring-blue-200"
                    placeholder="000.0"
                    value={form.waterNew}
                    onChange={e => setForm({...form, waterNew: e.target.value})}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-medium text-blue-700">Tiêu thụ tháng này:</span>
                  <span className="px-3 py-1 bg-blue-200 rounded-full text-blue-800 font-bold">
                    + {usageWater.toFixed(1)} m³
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Nút tác vụ */}
          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="flex-1 px-8 py-4 text-slate-400 font-bold hover:bg-slate-100 rounded-2xl transition-all"
            >
              HỦY BỎ
            </button>
            <button 
              type="submit"
              disabled={fetchingOld || saving || !form.roomId}
              className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 hover:bg-black transition-all disabled:bg-slate-200"
            >
              {saving ? 'ĐANG LƯU DỮ LIỆU...' : 'XÁC NHẬN CHỐT SỐ & TẠO BILL'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
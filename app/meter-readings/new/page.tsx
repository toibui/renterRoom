'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// 1. Tách logic Form thành một Component riêng
function SmartCreateReadingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const roomIdFromQuery = searchParams.get('roomId');

  const [rooms, setRooms] = useState([]);
  const [fetchingOld, setFetchingOld] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    roomId: roomIdFromQuery || '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricOld: 0,
    electricNew: '',
    waterOld: 0,
    waterNew: ''
  });

  useEffect(() => {
    fetch('/api/rooms').then(res => res.json()).then(setRooms);
  }, []);

  const fetchLastIndex = useCallback(async (roomId: string, month: number, year: number) => {
    if (!roomId) return;
    setFetchingOld(true);
    try {
      const res = await fetch(`/api/meter-readings/last-index?roomId=${roomId}&month=${month}&year=${year}`);
      const data = await res.json();
      setForm(prev => ({
        ...prev,
        electricOld: data.electricOld || 0,
        waterOld: data.waterOld || 0,
        electricNew: '', 
        waterNew: ''    
      }));
    } finally {
      setFetchingOld(false);
    }
  }, []);

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
      
      if (res.ok) {
        alert("Ghi số thành công!");
        router.push('/meter-readings');
      }
    } catch (err) {
      alert("Lỗi khi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  const usageElectric = parseFloat(form.electricNew) - form.electricOld || 0;
  const usageWater = parseFloat(form.waterNew) - form.waterOld || 0;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header tối giản hơn */}
      <div className="bg-slate-900 p-6 text-white text-center">
        <h1 className="text-xl font-black tracking-tight uppercase">
          {roomIdFromQuery ? `Phòng ${rooms.find((r:any) => r.id === form.roomId)?.roomNumber || ''}` : 'Ghi chỉ số mới'}
        </h1>
        <p className="text-slate-400 text-xs mt-1">Tháng {form.month} / {form.year}</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* 1. Chọn nhanh bối cảnh (Nếu chưa có ID) */}
        {!roomIdFromQuery && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Chọn Phòng</label>
              <select 
                className="w-full border-2 border-slate-200 rounded-xl p-3 font-bold bg-white focus:border-blue-500 outline-none"
                value={form.roomId}
                onChange={e => setForm({...form, roomId: e.target.value})}
                required
              >
                <option value="">-- Click để chọn phòng --</option>
                {rooms.map((r: any) => <option key={r.id} value={r.id}>Phòng {r.roomNumber}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* 2. Khu vực nhập liệu chính - Thiết kế dạng Stack dọc */}
        <div className="space-y-4">
          
          {/* THẺ ĐIỆN */}
          <div className={`p-5 rounded-2xl border-2 transition-all ${fetchingOld ? 'opacity-50' : 'bg-amber-50/30 border-amber-100 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-100'}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-amber-500 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">⚡</span>
              <h2 className="font-black text-amber-900 uppercase text-sm tracking-wider">Chỉ số Điện (kWh)</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">Số cũ</p>
                <div className="text-2xl font-black text-slate-400 bg-white/50 rounded-xl p-3 border border-dashed border-amber-200">
                  {form.electricOld}
                </div>
              </div>

              <div className="text-2xl font-light text-slate-300 mt-5">→</div>

              <div className="flex-[1.5]">
                <p className="text-[10px] font-bold text-amber-600 uppercase mb-1 font-mono">Số mới</p>
                <input 
                  type="number" step="0.1" required
                  placeholder="Nhập số..."
                  className="w-full bg-white border-2 border-amber-200 rounded-xl p-3 text-2xl font-black text-amber-600 outline-none focus:border-amber-500"
                  value={form.electricNew}
                  onChange={e => setForm({...form, electricNew: e.target.value})}
                />
              </div>
            </div>

            {usageElectric > 0 && (
              <div className="mt-3 flex justify-end">
                <span className="text-xs font-bold text-amber-700 bg-amber-200/50 px-3 py-1 rounded-full">
                  Sử dụng: {usageElectric.toFixed(1)} kWh
                </span>
              </div>
            )}
          </div>

          {/* THẺ NƯỚC */}
          <div className={`p-5 rounded-2xl border-2 transition-all ${fetchingOld ? 'opacity-50' : 'bg-blue-50/30 border-blue-100 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100'}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">💧</span>
              <h2 className="font-black text-blue-900 uppercase text-sm tracking-wider">Chỉ số Nước (m³)</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Số cũ</p>
                <div className="text-2xl font-black text-slate-400 bg-white/50 rounded-xl p-3 border border-dashed border-blue-200">
                  {form.waterOld}
                </div>
              </div>

              <div className="text-2xl font-light text-slate-300 mt-5">→</div>

              <div className="flex-[1.5]">
                <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 font-mono">Số mới</p>
                <input 
                  type="number" step="0.1" required
                  placeholder="Nhập số..."
                  className="w-full bg-white border-2 border-blue-200 rounded-xl p-3 text-2xl font-black text-blue-600 outline-none focus:border-blue-500"
                  value={form.waterNew}
                  onChange={e => setForm({...form, waterNew: e.target.value})}
                />
              </div>
            </div>

            {usageWater > 0 && (
              <div className="mt-3 flex justify-end">
                <span className="text-xs font-bold text-blue-700 bg-blue-200/50 px-3 py-1 rounded-full">
                  Sử dụng: {usageWater.toFixed(1)} m³
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Nút hành động chính */}
        <div className="pt-4 space-y-3">
          <button 
            type="submit"
            disabled={fetchingOld || saving || !form.roomId}
            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-black active:scale-[0.98] transition-all disabled:bg-slate-200 text-lg uppercase tracking-widest"
          >
            {saving ? 'Đang lưu...' : 'Lưu & Xuất Hóa Đơn'}
          </button>
          <button 
            type="button" 
            onClick={() => router.back()}
            className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
          >
            Hủy bỏ
          </button>
        </div>
      </form>
    </div>
  );
}

// 2. Component chính bao bọc bởi Suspense
export default function SmartCreateReadingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Suspense fallback={
        <div className="max-w-4xl mx-auto flex items-center justify-center p-20 bg-white rounded-3xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          <span className="ml-4 font-bold text-slate-600">Đang chuẩn bị biểu mẫu...</span>
        </div>
      }>
        <SmartCreateReadingForm />
      </Suspense>
    </div>
  );
}
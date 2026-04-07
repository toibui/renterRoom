'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Zap, 
  Droplets, 
  ArrowLeft, 
  Save, 
  Loader2, 
  CheckCircle2,
  Calendar
} from 'lucide-react';

function SmartCreateReadingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const roomIdFromQuery = searchParams.get('roomId');

  const [rooms, setRooms] = useState([]);
  const [fetchingOld, setFetchingOld] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Khởi tạo ngày tháng hiện tại
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [form, setForm] = useState({
    roomId: roomIdFromQuery || '',
    month: currentMonth,
    year: currentYear,
    electricOld: 0,
    electricNew: '',
    waterOld: 0,
    waterNew: ''
  });

  // Tạo danh sách năm (từ năm ngoái đến 2 năm sau)
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

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
    const eNew = parseFloat(form.electricNew);
    const wNew = parseFloat(form.waterNew);

    if (eNew < form.electricOld || wNew < form.waterOld) {
      alert("⚠️ Số mới không được nhỏ hơn số cũ!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/meter-readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...form,
            month: parseInt(form.month.toString()),
            year: parseInt(form.year.toString()),
        }),
      });
      
      if (res.ok) {
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

  const selectedRoom = rooms.find((r: any) => r.id === form.roomId);

  return (
    <div className="max-w-xl mx-auto pb-20">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-black text-slate-900 tracking-tight">
          {roomIdFromQuery ? `P.${selectedRoom?.roomNumber || '...'}` : 'GHI SỐ MỚI'}
        </h1>
        <div className="w-10"></div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-5">
        
        {/* THÔNG TIN CHUNG & CHỈNH THÁNG/NĂM */}
        <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-slate-200">
          <div className="space-y-4">
            {/* Chọn phòng (Nếu chưa có roomId từ Query) */}
            {!roomIdFromQuery && (
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Chọn phòng</p>
                <select 
                  className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 ring-blue-500 outline-none"
                  value={form.roomId}
                  onChange={e => setForm({...form, roomId: e.target.value})}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((r: any) => <option key={r.id} value={r.id}>Phòng {r.roomNumber}</option>)}
                </select>
              </div>
            )}

            {/* Chọn Tháng / Năm */}
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Tháng</p>
                <select 
                  className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 ring-blue-500 outline-none"
                  value={form.month}
                  onChange={e => setForm({...form, month: parseInt(e.target.value)})}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Năm</p>
                <select 
                  className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 ring-blue-500 outline-none"
                  value={form.year}
                  onChange={e => setForm({...form, year: parseInt(e.target.value)})}
                >
                  {yearOptions.map(y => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ... GIỮ NGUYÊN CÁC PHẦN THẺ ĐIỆN, THẺ NƯỚC VÀ NÚT LƯU BÊN DƯỚI ... */}
        {/* ĐIỆN */}
        <div className={`relative group rounded-[2.5rem] p-6 border-2 transition-all duration-300 ${fetchingOld ? 'opacity-50' : 'bg-white border-slate-100 focus-within:border-amber-400 focus-within:shadow-2xl focus-within:shadow-amber-100'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-amber-200">
                    <Zap size={20} fill="currentColor" />
                </div>
                <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Chỉ số Điện (kWh)</span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase mb-2">Số cũ</p>
                    <div className="text-xl font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 italic">
                        {fetchingOld ? '...' : form.electricOld}
                    </div>
                </div>
                <div className="h-8 w-[2px] bg-slate-100 mt-6"></div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-amber-500 uppercase mb-2 ml-1">Số mới</p>
                    <input 
                        type="number" inputMode="decimal" step="0.1" required
                        placeholder="0.0"
                        className="w-full bg-amber-50 border-2 border-amber-100 rounded-2xl px-4 py-4 text-3xl font-black text-amber-600 outline-none focus:bg-white focus:border-amber-500 transition-all"
                        value={form.electricNew}
                        onChange={e => setForm({...form, electricNew: e.target.value})}
                    />
                </div>
            </div>
            {usageElectric > 0 && (
                <div className="mt-4 flex items-center gap-2 text-amber-700 font-bold bg-amber-100/50 w-fit px-4 py-1.5 rounded-full text-xs animate-in slide-in-from-left">
                    <CheckCircle2 size={14} /> Tiêu thụ: {usageElectric.toFixed(1)} kWh
                </div>
            )}
        </div>

        {/* NƯỚC */}
        <div className={`relative group rounded-[2.5rem] p-6 border-2 transition-all duration-300 ${fetchingOld ? 'opacity-50' : 'bg-white border-slate-100 focus-within:border-blue-400 focus-within:shadow-2xl focus-within:shadow-blue-100'}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-blue-200">
                    <Droplets size={20} fill="currentColor" />
                </div>
                <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Chỉ số Nước (m³)</span>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase mb-2">Số cũ</p>
                    <div className="text-xl font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 italic">
                        {fetchingOld ? '...' : form.waterOld}
                    </div>
                </div>
                <div className="h-8 w-[2px] bg-slate-100 mt-6"></div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-500 uppercase mb-2 ml-1">Số mới</p>
                    <input 
                        type="number" inputMode="decimal" step="0.1" required
                        placeholder="0.0"
                        className="w-full bg-blue-50 border-2 border-blue-100 rounded-2xl px-4 py-4 text-3xl font-black text-blue-600 outline-none focus:bg-white focus:border-blue-500 transition-all"
                        value={form.waterNew}
                        onChange={e => setForm({...form, waterNew: e.target.value})}
                    />
                </div>
            </div>
            {usageWater > 0 && (
                <div className="mt-4 flex items-center gap-2 text-blue-700 font-bold bg-blue-100/50 w-fit px-4 py-1.5 rounded-full text-xs animate-in slide-in-from-left">
                    <CheckCircle2 size={14} /> Tiêu thụ: {usageWater.toFixed(1)} m³
                </div>
            )}
        </div>

        {/* NÚT LƯU */}
        <div className="fixed bottom-6 left-4 right-4 z-40 md:static md:mt-10">
          <button 
            type="submit"
            disabled={fetchingOld || saving || !form.roomId}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-[0.95] transition-all disabled:bg-slate-200 disabled:shadow-none text-lg uppercase tracking-tighter"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
            {saving ? 'Đang lưu...' : 'Lưu & Xuất Hóa Đơn'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SmartCreateReadingPage() {
    return (
      <div className="min-h-screen bg-slate-50">
        <Suspense fallback={<div className="p-20 text-center font-bold">Đang tải...</div>}>
          <SmartCreateReadingForm />
        </Suspense>
      </div>
    );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Home, User, Phone, Mail, DollarSign, Loader2, Power } from 'lucide-react';

type RoomForm = {
  roomNumber: string;
  basePrice: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  isActive: boolean;
};

export default function EditRoomPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<RoomForm>({
    roomNumber: '',
    basePrice: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    isActive: true,
  });

  useEffect(() => {
    if (!id) return;
    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/rooms/${id}`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu phòng");
        const data = await res.json();
        setForm({
          roomNumber: data.roomNumber || '',
          basePrice: data.basePrice?.toString() || '',
          tenantName: data.tenantName || '',
          tenantPhone: data.tenantPhone || '',
          tenantEmail: data.tenantEmail || '',
          isActive: data.isActive ?? true,
        });
      } catch (error) {
        alert("Có lỗi khi tải thông tin phòng.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          basePrice: parseFloat(form.basePrice) || 0,
        }),
      });
      if (!res.ok) throw new Error();
      router.push('/rooms');
      router.refresh();
    } catch {
      alert('Có lỗi xảy ra khi cập nhật thông tin phòng.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải dữ liệu phòng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 md:pb-12">
      {/* HEADER MOBILE CỐ ĐỊNH - Căn giữa tiêu đề */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => router.push('/rooms')} className="p-2 text-slate-500">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Chỉnh sửa phòng</h1>
          <p className="text-[10px] text-blue-600 font-bold uppercase">P.{form.roomNumber}</p>
        </div>
        <div className="w-10"></div> {/* Để cân bằng với nút Back */}
      </div>

      {/* Container chính - Dùng max-w-md hoặc max-w-lg để nội dung không bị tràn ngang quá nhiều trên mobile */}
      <div className="max-w-md mx-auto p-4 md:pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: CỐ ĐỊNH THÔNG TIN CHÍNH - Căn giữa nội dung bên trong */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 p-6 opacity-5">
               <Home size={120} />
            </div>
            
            <div className="relative z-10 w-full space-y-6">
              <div className="space-y-4">
                <div className="w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Số / Tên phòng</label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={form.roomNumber}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-2xl font-black text-center focus:bg-white focus:text-slate-900 outline-none transition-all"
                  />
                </div>
                <div className="w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Giá thuê (VNĐ)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    name="basePrice"
                    value={form.basePrice}
                    onChange={handleChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-2xl font-black text-center focus:bg-white focus:text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: THÔNG TIN KHÁCH HÀNG */}
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <User size={16} className="text-blue-600" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chi tiết khách thuê</h2>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  name="tenantName"
                  value={form.tenantName}
                  onChange={handleChange}
                  placeholder="Họ tên người ở"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="tel"
                  inputMode="tel"
                  name="tenantPhone"
                  value={form.tenantPhone}
                  onChange={handleChange}
                  placeholder="Số điện thoại"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  name="tenantEmail"
                  value={form.tenantEmail}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-12 pr-4 py-4 text-slate-900 font-bold focus:border-blue-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: TRẠNG THÁI (TOGGLE) */}
          <div 
            onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
            className={`p-6 rounded-[2.5rem] border-2 flex items-center justify-between transition-all cursor-pointer ${
              form.isActive ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${form.isActive ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                <Power size={18} />
              </div>
              <div>
                <p className={`font-black text-[10px] uppercase tracking-widest ${form.isActive ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {form.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                </p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-all ${form.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
               <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${form.isActive ? 'left-[26px]' : 'left-[2px]'}`} />
            </div>
          </div>

          {/* NÚT LƯU - Căn giữa nút */}
          <div className="fixed bottom-6 left-0 right-0 px-6 z-40 md:static md:px-0">
            <button
              type="submit"
              disabled={saving}
              className="w-full max-w-md mx-auto bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-300 flex items-center justify-center gap-3 active:scale-[0.95] transition-all disabled:bg-slate-200"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
              {saving ? 'ĐANG CẬP NHẬT...' : 'LƯU THAY ĐỔI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
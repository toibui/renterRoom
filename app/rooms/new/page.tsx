'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Home, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  Save, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

type RoomForm = {
  roomNumber: string;
  basePrice: string;
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  isActive: boolean;
};

export default function CreateRoomPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<RoomForm>({
    roomNumber: '',
    basePrice: '',
    tenantName: '',
    tenantPhone: '',
    tenantEmail: '',
    isActive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          basePrice: parseFloat(form.basePrice) || 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Lỗi khi tạo phòng');
      }

      router.push('/rooms');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi tạo phòng.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      {/* MOBILE HEADER */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center gap-4">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">Thêm phòng mới</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 md:pt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* KHU VỰC 1: THÔNG TIN PHÒNG */}
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                <Home size={18} />
              </div>
              <h2 className="font-black text-slate-800 text-xs uppercase tracking-widest">Thông tin cơ bản</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 font-bold text-xs text-slate-500 uppercase ml-1">Số / Tên phòng *</label>
                <input
                  type="text"
                  name="roomNumber"
                  placeholder="Ví dụ: 101, P.202"
                  value={form.roomNumber}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-slate-900 font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-xs text-slate-500 uppercase ml-1">Giá phòng hàng tháng *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₫</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    name="basePrice"
                    placeholder="5,000,000"
                    value={form.basePrice}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-3.5 text-slate-900 font-bold focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* KHU VỰC 2: THÔNG TIN NGƯỜI THUÊ */}
          <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                <User size={18} />
              </div>
              <h2 className="font-black text-slate-800 text-xs uppercase tracking-widest">Khách thuê (Tùy chọn)</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  name="tenantName"
                  placeholder="Họ và tên người thuê"
                  value={form.tenantName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 font-medium focus:border-emerald-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="tel"
                  inputMode="tel"
                  name="tenantPhone"
                  placeholder="Số điện thoại liên lạc"
                  value={form.tenantPhone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 font-medium focus:border-emerald-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  name="tenantEmail"
                  placeholder="Email nhận hóa đơn"
                  value={form.tenantEmail}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 font-medium focus:border-emerald-500 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* TRẠNG THÁI */}
          <div 
            className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-sm active:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${form.isActive ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                {form.isActive && <CheckCircle2 size={16} className="text-white" />}
              </div>
              <span className="text-sm font-bold text-slate-700">Đang cho thuê / Hoạt động</span>
            </div>
            <div className={`w-2 h-2 rounded-full ${form.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>

          {/* NÚT LƯU - FLOATING TRÊN MOBILE */}
          <div className="fixed bottom-6 left-4 right-4 z-40 md:static">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-slate-900 text-white font-black py-4 md:py-5 rounded-[2rem] shadow-2xl shadow-slate-300 flex items-center justify-center gap-3 active:scale-[0.97] transition-all disabled:bg-slate-200"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              {saving ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN PHÒNG'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/rooms')}
              className="w-full py-3 mt-2 text-slate-400 font-bold text-xs uppercase tracking-widest md:hidden"
            >
              Quay lại danh sách
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
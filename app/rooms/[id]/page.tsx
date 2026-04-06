'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Home, User, Phone, Mail, DollarSign } from 'lucide-react';

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

  // 1. Fetch dữ liệu phòng từ API
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
          isActive: data.isActive ?? true, // Đảm bảo lấy giá trị từ DB hoặc mặc định true
        });
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi khi tải thông tin phòng.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  // 2. Xử lý thay đổi Input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 3. Gửi dữ liệu cập nhật
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
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Nút quay lại */}
      <button 
        onClick={() => router.push('/rooms')}
        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition mb-6"
      >
        <ArrowLeft size={20} />
        <span>Quay lại danh sách</span>
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Chỉnh sửa phòng {form.roomNumber}</h1>
              <p className="text-slate-400 text-sm mt-1">ID: {id}</p>
            </div>
            <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${form.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {form.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* PHẦN 1: THÔNG TIN PHÒNG & GIÁ */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Home size={16} className="text-blue-600" />
                Số phòng
              </label>
              <input
                type="text"
                name="roomNumber"
                value={form.roomNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <DollarSign size={16} className="text-blue-600" />
                Giá thuê hàng tháng (VNĐ)
              </label>
              <input
                type="number"
                name="basePrice"
                value={form.basePrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-semibold text-blue-600"
              />
            </div>
          </section>

          <hr className="border-slate-100" />

          {/* PHẦN 2: THÔNG TIN KHÁCH THUÊ */}
          <section className="space-y-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin khách thuê</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <User size={16} />
                Tên khách hàng
              </label>
              <input
                type="text"
                name="tenantName"
                value={form.tenantName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Phone size={16} />
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="tenantPhone"
                  value={form.tenantPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  name="tenantEmail"
                  value={form.tenantEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </section>

          {/* PHẦN 3: TRẠNG THÁI HOẠT ĐỘNG (TOGGLE) */}
          <section className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-bold text-blue-900">Trạng thái phòng</p>
              <p className="text-sm text-blue-700/70">Cho phép thực hiện chốt số và xuất hóa đơn</p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="isActive"
                checked={form.isActive} 
                onChange={handleChange}
                className="sr-only peer" 
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
            </label>
          </section>

          {/* NÚT BẤM */}
          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Đang lưu hệ thống...' : 'Cập nhật thay đổi'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/rooms')}
              className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
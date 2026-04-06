'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    
    // Xử lý riêng cho checkbox nếu có
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
          // Chuyển đổi giá tiền sang số thực trước khi gửi
          basePrice: parseFloat(form.basePrice) || 0,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Lỗi khi tạo phòng');
      }

      router.push('/rooms');
      router.refresh(); // Làm mới dữ liệu phía server
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi tạo phòng.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Thêm phòng mới
        </h1>
        <p className="text-gray-500 mb-8 text-sm">Thiết lập thông tin cơ bản cho phòng trọ mới.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* KHU VỰC 1: THÔNG TIN PHÒNG */}
          <div className="p-4 bg-indigo-50 rounded-lg space-y-4 border border-indigo-100">
            <p className="font-semibold text-indigo-700 text-xs uppercase tracking-wider">Thông tin phòng & Giá</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">Số phòng / Tên phòng *</label>
                <input
                  type="text"
                  name="roomNumber"
                  placeholder="Ví dụ: 101, P.202..."
                  value={form.roomNumber}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">Giá phòng hàng tháng (VND) *</label>
                <input
                  type="number"
                  name="basePrice"
                  placeholder="Ví dụ: 5000000"
                  value={form.basePrice}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* KHU VỰC 2: THÔNG TIN NGƯỜI THUÊ */}
          <div className="space-y-4">
            <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Thông tin khách thuê (Tùy chọn)</p>
            
            <div>
              <label className="block mb-1 font-medium text-sm text-gray-700">Họ và tên người thuê</label>
              <input
                type="text"
                name="tenantName"
                value={form.tenantName}
                onChange={handleChange}
                placeholder="Nhập tên khách đang ở"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">Số điện thoại</label>
                <input
                  type="text"
                  name="tenantPhone"
                  value={form.tenantPhone}
                  onChange={handleChange}
                  placeholder="Dùng để liên lạc"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-700">Email nhận hóa đơn</label>
                <input
                  type="email"
                  name="tenantEmail"
                  value={form.tenantEmail}
                  onChange={handleChange}
                  placeholder="abc@gmail.com"
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* TRẠNG THÁI HOẠT ĐỘNG */}
          <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
              Phòng đang hoạt động (Cho phép chốt số & xuất hóa đơn)
            </label>
          </div>

          {/* BUTTONS */}
          <div className="pt-6 flex justify-end space-x-3 border-t">
            <button
              type="button"
              onClick={() => router.push('/rooms')}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition font-medium"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-lg shadow-md disabled:opacity-50 transition font-semibold"
            >
              {saving ? 'Đang lưu...' : 'Lưu thông tin phòng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type PriceForm = {
  electricPrice: string;
  waterPrice: string;
  effectiveDate: string;
  isActive: boolean;
};

export default function CreatePriceConfigPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<PriceForm>({
    electricPrice: '',
    waterPrice: '',
    effectiveDate: new Date().toISOString().split('T')[0], // Mặc định là ngày hôm nay
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra nhanh
    if (parseFloat(form.electricPrice) <= 0 || parseFloat(form.waterPrice) <= 0) {
      alert('Đơn giá phải lớn hơn 0');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/price-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electricPrice: parseFloat(form.electricPrice),
          waterPrice: parseFloat(form.waterPrice),
          effectiveDate: form.effectiveDate,
          isActive: form.isActive,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Lỗi khi lưu cấu hình giá');
      }

      router.push('/price-configs');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* HEADER */}
        <div className="bg-emerald-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Thiết lập đơn giá mới</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Thay đổi đơn giá điện và nước áp dụng cho kỳ hóa đơn tới.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ĐƠN GIÁ ĐIỆN */}
          <div>
            <label className="block mb-2 font-bold text-gray-700 flex items-center">
              <span className="bg-amber-100 text-amber-600 p-1.5 rounded-md mr-2 text-xs">⚡</span>
              Đơn giá Điện (VND/kWh)
            </label>
            <div className="relative">
              <input
                type="number"
                name="electricPrice"
                placeholder="Ví dụ: 3500"
                value={form.electricPrice}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-0 outline-none transition-all text-lg font-semibold"
              />
              <span className="absolute right-4 top-3.5 text-gray-400 font-medium">đ/số</span>
            </div>
          </div>

          {/* ĐƠN GIÁ NƯỚC */}
          <div>
            <label className="block mb-2 font-bold text-gray-700 flex items-center">
              <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md mr-2 text-xs">💧</span>
              Đơn giá Nước (VND/m³)
            </label>
            <div className="relative">
              <input
                type="number"
                name="waterPrice"
                placeholder="Ví dụ: 15000"
                value={form.waterPrice}
                onChange={handleChange}
                required
                className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-0 outline-none transition-all text-lg font-semibold"
              />
              <span className="absolute right-4 top-3.5 text-gray-400 font-medium">đ/khối</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* NGÀY ÁP DỤNG */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-500">Ngày bắt đầu áp dụng</label>
              <input
                type="date"
                name="effectiveDate"
                value={form.effectiveDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* TRẠNG THÁI */}
            <div className="flex flex-col justify-end">
              <label className="relative inline-flex items-center cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[12px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                <span className="ml-3 text-sm font-bold text-gray-700">Kích hoạt ngay</span>
              </label>
            </div>
          </div>

          {/* CẢNH BÁO */}
          {form.isActive && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">⚠️</div>
                <div className="ml-3">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <b>Lưu ý:</b> Khi nhấn lưu, đơn giá này sẽ trở thành <b>mặc định</b>. 
                    Các đơn giá đang hoạt động trước đó sẽ tự động chuyển sang trạng thái "Hết hạn".
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/price-configs')}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-bold"
            >
              Quay lại
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-200 disabled:opacity-50 transition font-bold text-lg"
            >
              {saving ? 'Đang xử lý...' : 'Áp dụng giá mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
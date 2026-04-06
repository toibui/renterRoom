'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type PriceForm = {
  electricPrice: string;
  waterPrice: string;
  effectiveDate: string;
  isActive: boolean;
};

export default function EditPriceConfigPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<PriceForm>({
    electricPrice: '',
    waterPrice: '',
    effectiveDate: '',
    isActive: false,
  });

  useEffect(() => {
    if (!id) return;

    const fetchConfig = async () => {
      try {
        const res = await fetch(`/api/price-configs/${id}`);
        if (!res.ok) throw new Error("Không thể tải cấu hình giá");

        const data = await res.json();
        setForm({
          electricPrice: data.electricPrice?.toString() || '',
          waterPrice: data.waterPrice?.toString() || '',
          effectiveDate: data.effectiveDate ? data.effectiveDate.split('T')[0] : '',
          isActive: data.isActive ?? false,
        });
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi khi tải thông tin đơn giá.");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
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
      const res = await fetch(`/api/price-configs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electricPrice: parseFloat(form.electricPrice) || 0,
          waterPrice: parseFloat(form.waterPrice) || 0,
          effectiveDate: form.effectiveDate,
          isActive: form.isActive,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Lỗi khi cập nhật');
      }
      
      router.push('/price-configs');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi cập nhật cấu hình giá.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-medium text-emerald-600">Đang tải cấu hình giá...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-emerald-600 p-6">
          <h1 className="text-2xl font-bold text-white">Chỉnh sửa đơn giá</h1>
          <p className="text-emerald-100 text-sm mt-1">Cập nhật thông tin cho mốc giá ngày {new Date(form.effectiveDate).toLocaleDateString('vi-VN')}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* GIÁ ĐIỆN */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-700">Đơn giá Điện (VND/kWh)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-500 font-bold group-focus-within:scale-110 transition-transform">⚡</div>
              <input
                type="number"
                name="electricPrice"
                value={form.electricPrice}
                onChange={handleChange}
                required
                placeholder="0"
                className="w-full border-2 border-gray-100 rounded-xl pl-10 pr-4 py-3 focus:border-emerald-500 focus:ring-0 outline-none transition-all text-lg font-semibold bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* GIÁ NƯỚC */}
          <div className="space-y-2">
            <label className="block font-bold text-gray-700">Đơn giá Nước (VND/m³)</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500 font-bold group-focus-within:scale-110 transition-transform">💧</div>
              <input
                type="number"
                name="waterPrice"
                value={form.waterPrice}
                onChange={handleChange}
                required
                placeholder="0"
                className="w-full border-2 border-gray-100 rounded-xl pl-10 pr-4 py-3 focus:border-emerald-500 focus:ring-0 outline-none transition-all text-lg font-semibold bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* TOGGLE TRẠNG THÁI */}
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
                <span className="ml-3 text-sm font-bold text-gray-700">Đang áp dụng</span>
              </label>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-6 flex items-center justify-between border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.push('/price-configs')}
              className="text-gray-400 hover:text-emerald-600 font-medium transition flex items-center"
            >
              <span className="mr-1">←</span> Hủy thay đổi
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3 rounded-xl shadow-lg shadow-emerald-100 disabled:opacity-50 transition font-bold"
            >
              {saving ? 'Đang cập nhật...' : 'Cập nhật đơn giá'}
            </button>
          </div>
        </form>

        {/* Thông tin thêm */}
        <div className="bg-gray-50 p-4 text-[11px] text-gray-400 text-center uppercase tracking-widest border-t border-gray-100">
          ID cấu hình: {id}
        </div>
      </div>
    </div>
  );
}
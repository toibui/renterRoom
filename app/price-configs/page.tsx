'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type PriceConfig = {
  id: string;
  electricPrice: number;
  waterPrice: number;
  effectiveDate: string;
  isActive: boolean;
};

export default function PriceConfigsPage() {
  const [configs, setConfigs] = useState<PriceConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy toàn bộ lịch sử giá
    fetch('/api/price-configs?all=true')
      .then((res) => res.json())
      .then((data) => {
        setConfigs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy cấu hình giá:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string, isActive: boolean) => {
    if (isActive) {
      alert('Không thể xóa cấu hình đang hoạt động!');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa lịch sử giá này?')) return;

    const res = await fetch(`/api/price-configs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setConfigs((prev) => prev.filter((c) => c.id !== id));
    } else {
      const data = await res.json();
      alert(data.error || 'Lỗi khi xóa');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Cấu hình Đơn giá</h1>
          <p className="text-sm text-gray-500 mt-1">Thiết lập đơn giá điện, nước áp dụng cho toàn bộ nhà trọ</p>
        </div>

        <Link
          href="/price-configs/new"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center font-medium"
        >
          <span className="mr-2">+</span> Thiết lập giá mới
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Đang tải cấu hình giá...</div>
      ) : (
        <div className="grid gap-6">
          {/* BẢNG LỊCH SỬ GIÁ */}
          <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50">
              <h2 className="font-bold text-gray-700">Lịch sử thay đổi giá</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr className="uppercase text-[11px] font-semibold tracking-wider">
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-left">Ngày áp dụng</th>
                    <th className="p-4 text-left">Đơn giá Điện</th>
                    <th className="p-4 text-left">Đơn giá Nước</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {configs.map((c) => (
                    <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${c.isActive ? 'bg-emerald-50/30' : ''}`}>
                      <td className="p-4 whitespace-nowrap">
                        {c.isActive ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ring-1 ring-emerald-200">
                            Đang áp dụng
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                            Hết hạn
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-gray-600">
                        {new Date(c.effectiveDate).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 font-bold text-blue-700">
                        {formatCurrency(c.electricPrice)} <span className="text-[10px] text-gray-400 font-normal">/kWh</span>
                      </td>
                      <td className="p-4 font-bold text-cyan-700">
                        {formatCurrency(c.waterPrice)} <span className="text-[10px] text-gray-400 font-normal">/m³</span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-3">
                          <Link
                            href={`/price-configs/${c.id}`}
                            className="text-gray-400 hover:text-indigo-600 transition-colors text-lg"
                            title="Chỉnh sửa"
                          >
                            ✎
                          </Link>
                          {!c.isActive && (
                            <button
                              onClick={() => handleDelete(c.id, c.isActive)}
                              className="text-gray-400 hover:text-red-500 transition-colors text-lg"
                              title="Xóa lịch sử"
                            >
                              🗑
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BOX NHẮC NHỞ */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
            <span className="text-amber-500 text-xl">💡</span>
            <div>
              <h4 className="text-sm font-bold text-amber-800">Lưu ý quản lý giá:</h4>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Khi bạn tạo cấu hình giá mới và chọn <b>"Kích hoạt"</b>, hệ thống sẽ tự động sử dụng đơn giá đó để tính toán cho tất cả các hóa đơn được tạo từ thời điểm đó trở đi. Lịch sử giá cũ sẽ được giữ lại để đối soát hóa đơn cũ.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
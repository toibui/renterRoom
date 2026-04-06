'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MeterReadingsPage() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReadings = () => {
    setLoading(true);
    fetch('/api/meter-readings')
      .then(res => res.json())
      .then(data => {
        setReadings(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  // Hàm xử lý tạo lại Bill
  const handleRecreateBill = async (readingId: string) => {
    if (!confirm("Bạn có chắc chắn muốn tính toán lại hóa đơn cho kỳ này không? Bill cũ (nếu có) sẽ bị thay thế.")) return;

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId }),
      });

      if (res.ok) {
        alert("Đã tạo lại hóa đơn thành công!");
        fetchReadings(); // Load lại để cập nhật trạng thái "Đã xuất Bill"
      } else {
        const error = await res.json();
        alert("Lỗi: " + error.error);
      }
    } catch (err) {
      alert("Không thể kết nối máy chủ");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chốt số điện nước</h1>
          <p className="text-sm text-gray-500">Quản lý chỉ số tiêu thụ hàng tháng của các phòng</p>
        </div>
        <Link href="/meter-readings/new" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all">
          + Chốt số mới
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-medium">Đang tải dữ liệu...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="p-4 text-left">Phòng</th>
                <th className="p-4 text-left">Kỳ hóa đơn</th>
                <th className="p-4 text-left">Chỉ số Điện</th>
                <th className="p-4 text-left">Chỉ số Nước</th>
                <th className="p-4 text-left">Tiêu thụ</th>
                <th className="p-4 text-center">Trạng thái Bill</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {readings.map((r: any) => (
                <tr key={r.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 font-bold text-gray-700">{r.room.roomNumber}</td>
                  <td className="p-4 text-gray-600">Tháng {r.month}/{r.year}</td>
                  <td className="p-4">
                    <span className="text-gray-400 text-xs">{r.electricOld}</span> → <span className="font-semibold text-amber-600">{r.electricNew}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-400 text-xs">{r.waterOld}</span> → <span className="font-semibold text-blue-600">{r.waterNew}</span>
                  </td>
                  <td className="p-4 text-xs">
                    <div className="text-amber-700 font-medium">⚡ {r.electricNew - r.electricOld} kWh</div>
                    <div className="text-blue-700 font-medium">💧 {r.waterNew - r.waterOld} m³</div>
                  </td>
                  <td className="p-4 text-center">
                    {r.bill ? (
                      <Link href={`/bills/${r.bill.id}`} className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-[10px] font-bold uppercase hover:bg-emerald-100 transition-colors">
                        ✅ Xem Bill
                      </Link>
                    ) : (
                      <span className="text-gray-400 bg-gray-50 px-2 py-1 rounded text-[10px] font-bold uppercase">Chưa có Bill</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {/* Nút Sửa thông số */}
                    <Link 
                      href={`/meter-readings/${r.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all"
                      title="Sửa chỉ số"
                    >
                      ✏️
                    </Link>

                    {/* Nút Tạo lại Bill */}
                    <button 
                      onClick={() => handleRecreateBill(r.id)}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-600 transition-all"
                      title="Tính lại tiền hóa đơn"
                    >
                      🔄
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Room = {
  id: string;
  roomNumber: string;
  tenantName: string | null;
  tenantPhone: string | null;
  tenantEmail: string | null;
  basePrice: number;
  isActive: boolean;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'no_bill';
  lastReading?: {
    electricNew: number;
    waterNew: number;
    createdAt: string;
  };
  needsReading: boolean;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá phòng này? Hệ thống sẽ chặn xoá nếu đã có hóa đơn.')) return;
    
    const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    } else {
      alert(data.error || 'Không thể xóa phòng');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusBadge = (status: Room['paymentStatus']) => {
    const badges = {
      PAID: <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold">Đã thu</span>,
      PENDING: <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold">Chờ thu</span>,
      OVERDUE: <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">Quá hạn</span>,
      no_bill: <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs font-bold">Trống/Chưa chốt</span>,
    };
    return badges[status] || badges.no_bill;
  };

  const filteredRooms = rooms.filter((r) => {
    const keyword = searchTerm.toLowerCase();
    return (
      r.roomNumber.toLowerCase().includes(keyword) ||
      r.tenantName?.toLowerCase().includes(keyword) ||
      r.tenantPhone?.includes(keyword)
    );
  });

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Sơ đồ nhà trọ</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý chỉ số điện nước và trạng thái phòng</p>
        </div>

        <Link
          href="/rooms/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center"
        >
          <span className="mr-2">+</span> Thêm phòng mới
        </Link>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Tìm số phòng, tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <span className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600">
            Tổng: {rooms.length} phòng
          </span>
          <span className="bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600">
            Chưa chốt số: {rooms.filter(r => r.needsReading).length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">Đang tải dữ liệu nhà trọ...</div>
      ) : (
        <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 text-gray-600 border-b">
                <tr className="uppercase text-[11px] font-semibold tracking-wider">
                  <th className="p-4 text-left">Phòng</th>
                  <th className="p-4 text-left">Khách thuê</th>
                  <th className="p-4 text-left">Giá phòng</th>
                  <th className="p-4 text-left">Chỉ số mới nhất</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRooms.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-50/30 transition-colors group">
                    {/* ROOM NUMBER */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-black text-lg text-indigo-700">P.{r.roomNumber}</div>
                      {!r.isActive && <span className="text-[10px] text-gray-400 font-bold uppercase">Ngưng hoạt động</span>}
                    </td>

                    {/* TENANT INFO */}
                    <td className="p-4 whitespace-nowrap">
                      {r.tenantName ? (
                        <>
                          <div className="font-bold text-gray-900">{r.tenantName}</div>
                          <div className="text-xs text-gray-500">{r.tenantPhone || 'Không có SĐT'}</div>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Phòng trống</span>
                      )}
                    </td>

                    {/* BASE PRICE */}
                    <td className="p-4 font-semibold text-gray-700">
                      {formatPrice(r.basePrice)}
                    </td>

                    {/* LATEST READINGS */}
                    <td className="p-4">
                      {r.lastReading ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-blue-600 font-medium">⚡ Điện: {r.lastReading.electricNew}</span>
                          <span className="text-xs text-cyan-600 font-medium">💧 Nước: {r.lastReading.waterNew}</span>
                          <span className="text-[10px] text-gray-400 italic">Ngày ghi: {new Date(r.lastReading.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300">Chưa có dữ liệu</span>
                      )}
                    </td>

                    {/* PAYMENT STATUS */}
                    <td className="p-4 text-center">
                      {getStatusBadge(r.paymentStatus)}
                      {r.needsReading && (
                        <div className="mt-1">
                          <span className="text-[10px] font-bold text-orange-500 animate-bounce block">⚡ Cần chốt số</span>
                        </div>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/meter-readings/new?roomId=${r.id}`}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-all text-xs font-bold border border-blue-200"
                        >
                          Chốt số
                        </Link>
                        <Link
                          href={`/rooms/${r.id}`}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          ✎
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-md transition-colors"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
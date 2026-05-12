'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Zap,
  Droplets,
  RotateCcw,
  Edit3,
  FileText,
  Calendar
} from 'lucide-react';

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

  const handleRecreateBill = async (readingId: string) => {
    if (!confirm("Tính lại hóa đơn cho kỳ này? Bill cũ sẽ bị thay thế.")) return;

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId }),
      });

      if (res.ok) {
        alert("Đã tạo lại hóa đơn thành công!");
        fetchReadings();
      } else {
        const error = await res.json();
        alert("Lỗi: " + error.error);
      }
    } catch {
      alert("Không thể kết nối máy chủ");
    }
  };

  // =========================
  // BILL STATUS UI
  // =========================
  const getBillStatusUI = (status?: string) => {
    switch (status) {
      case 'PAID':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'PENDING':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'OVERDUE':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-400 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-20 md:pb-10">

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900">
              Chốt số điện nước
            </h1>
            <p className="text-xs text-slate-500 hidden md:block">
              Quản lý chỉ số tiêu thụ hàng tháng
            </p>
          </div>

          <Link
            href="/meter-readings/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg text-sm"
          >
            <Plus size={18} />
            Chốt số mới
          </Link>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4" />
            <p className="font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* ================= MOBILE ================= */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {readings.map((r: any) => (
                <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border">

                  {/* HEADER */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        Phòng {r.room.roomNumber}
                      </span>
                      <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                        <Calendar size={14} />
                        Tháng {r.month}/{r.year}
                      </div>
                    </div>

                    {/* BILL STATUS */}
                    {r.bill ? (
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getBillStatusUI(r.bill.status)}`}>
                          {r.bill.status}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {r.bill.totalAmount?.toLocaleString()} đ
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-xs font-bold">
                        Chưa có Bill
                      </span>
                    )}
                  </div>

                  {/* USAGE */}
                  <div className="grid grid-cols-2 gap-4 mb-4">

                    <div className="bg-amber-50 p-3 rounded-xl">
                      <div className="flex items-center gap-1 text-amber-700 text-xs font-bold">
                        <Zap size={14} /> ĐIỆN
                      </div>
                      <div className="text-lg font-black">
                        {r.electricNew - r.electricOld} kWh
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="flex items-center gap-1 text-blue-700 text-xs font-bold">
                        <Droplets size={14} /> NƯỚC
                      </div>
                      <div className="text-lg font-black">
                        {r.waterNew - r.waterOld} m³
                      </div>
                    </div>

                  </div>

                  {/* ACTION */}
                  <div className="flex gap-2 border-t pt-3">

                    <Link
                      href={`/meter-readings/${r.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 rounded-xl font-bold text-sm"
                    >
                      <Edit3 size={16} /> Sửa
                    </Link>

                    <button
                      onClick={() => handleRecreateBill(r.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-50 text-amber-600 rounded-xl font-bold text-sm"
                    >
                      <RotateCcw size={16} /> Bill
                    </button>

                  </div>
                </div>
              ))}
            </div>

            {/* ================= DESKTOP ================= */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border overflow-hidden">

              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="p-5 text-left">Phòng</th>
                    <th className="p-5 text-left">Kỳ</th>
                    <th className="p-5 text-left">Điện</th>
                    <th className="p-5 text-left">Nước</th>
                    <th className="p-5 text-center">Bill</th>
                    <th className="p-5 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody className="divide-y">

                  {readings.map((r: any) => (
                    <tr key={r.id} className="hover:bg-blue-50/20">

                      <td className="p-5 font-bold">
                        P.{r.room.roomNumber}
                      </td>

                      <td className="p-5">
                        {r.month}/{r.year}
                      </td>

                      <td className="p-5 text-amber-600 font-bold">
                        {r.electricNew - r.electricOld}
                      </td>

                      <td className="p-5 text-blue-600 font-bold">
                        {r.waterNew - r.waterOld}
                      </td>

                      {/* BILL STATUS */}
                      <td className="p-5 text-center">
                        {r.bill ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getBillStatusUI(r.bill.status)}`}>
                              {r.bill.status}
                            </span>

                            <span className="text-[10px] text-slate-400">
                              {r.bill.totalAmount?.toLocaleString()} đ
                            </span>

                            {r.bill.emailSent && (
                              <span className="text-[10px] text-blue-500">
                                📧 Sent
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">
                            CHỜ BILL
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="p-5 text-right space-x-2">

                        <Link
                          href={`/meter-readings/${r.id}`}
                          className="px-3 py-2 bg-slate-50 rounded-lg"
                        >
                          <Edit3 size={16} />
                        </Link>

                        <button
                          onClick={() => handleRecreateBill(r.id)}
                          className="px-3 py-2 bg-amber-50 text-amber-600 rounded-lg"
                        >
                          <RotateCcw size={16} />
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>

            </div>
          </>
        )}

      </div>
    </div>
  );
}
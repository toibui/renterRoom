'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Zap, 
  Droplets, 
  RotateCcw, 
  Edit3, 
  ChevronRight, 
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
    } catch (err) {
      alert("Không thể kết nối máy chủ");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-20 md:pb-10">
      {/* HEADER CỐ ĐỊNH TRÊN MOBILE */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900">Chốt số điện nước</h1>
            <p className="text-xs text-slate-500 hidden md:block">Quản lý chỉ số tiêu thụ hàng tháng</p>
          </div>
          <Link 
            href="/meter-readings/new" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all text-sm"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Chốt số mới</span>
            <span className="sm:hidden">Mới</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* GIAO DIỆN MOBILE: DẠNG CARD (Ẩn trên desktop) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {readings.map((r: any) => (
                <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">
                        Phòng {r.room.roomNumber}
                      </span>
                      <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                        <Calendar size={14} />
                        Tháng {r.month}/{r.year}
                      </div>
                    </div>
                    {r.bill ? (
                      <Link href={`/bills/${r.bill.id}`} className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-bold transition-active">
                        <FileText size={14} />
                        Xem Bill
                      </Link>
                    ) : (
                      <span className="text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full text-xs font-bold">
                        Chưa có Bill
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-1 text-amber-700 font-bold text-xs mb-1">
                        <Zap size={14} /> ĐIỆN
                      </div>
                      <div className="text-slate-700 font-black text-lg">
                        {r.electricNew - r.electricOld} <span className="text-[10px] font-normal text-slate-400">kWh</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{r.electricOld} → {r.electricNew}</div>
                    </div>

                    <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-1 text-blue-700 font-bold text-xs mb-1">
                        <Droplets size={14} /> NƯỚC
                      </div>
                      <div className="text-slate-700 font-black text-lg">
                        {r.waterNew - r.waterOld} <span className="text-[10px] font-normal text-slate-400">m³</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{r.waterOld} → {r.waterNew}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-50 pt-3">
                    <Link 
                      href={`/meter-readings/${r.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm"
                    >
                      <Edit3 size={16} /> Sửa
                    </Link>
                    <button 
                      onClick={() => handleRecreateBill(r.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 text-amber-600 rounded-xl font-bold text-sm"
                    >
                      <RotateCcw size={16} /> Tính lại tiền
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* GIAO DIỆN DESKTOP: DẠNG TABLE (Ẩn trên mobile) */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-5 text-left font-bold uppercase tracking-wider">Phòng</th>
                    <th className="p-5 text-left font-bold uppercase tracking-wider">Kỳ hóa đơn</th>
                    <th className="p-5 text-left font-bold uppercase tracking-wider">Điện (kWh)</th>
                    <th className="p-5 text-left font-bold uppercase tracking-wider">Nước (m³)</th>
                    <th className="p-5 text-center font-bold uppercase tracking-wider">Trạng thái</th>
                    <th className="p-5 text-right font-bold uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {readings.map((r: any) => (
                    <tr key={r.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="p-5 font-black text-slate-900">P.{r.room.roomNumber}</td>
                      <td className="p-5 font-medium text-slate-600">Tháng {r.month}/{r.year}</td>
                      <td className="p-5">
                        <div className="font-bold text-amber-600">{r.electricNew - r.electricOld}</div>
                        <div className="text-[10px] text-slate-400">{r.electricOld} → {r.electricNew}</div>
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-blue-600">{r.waterNew - r.waterOld}</div>
                        <div className="text-[10px] text-slate-400">{r.waterOld} → {r.waterNew}</div>
                      </td>
                      <td className="p-5 text-center">
                        {r.bill ? (
                          <Link href={`/bills/${r.bill.id}`} className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            <FileText size={12} /> Đã xuất bill
                          </Link>
                        ) : (
                          <span className="text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">Chờ xuất</span>
                        )}
                      </td>
                      <td className="p-5 text-right space-x-2">
                        <Link href={`/meter-readings/${r.id}`} className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                          <Edit3 size={16} />
                        </Link>
                        <button onClick={() => handleRecreateBill(r.id)} className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 text-slate-600 hover:bg-amber-500 hover:text-white transition-all shadow-sm">
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
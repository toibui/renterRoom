'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function BillDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bills/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBill(data);
        setLoading(false);
      });
  }, [id]);

  const handleTogglePaid = async () => {
    const newStatus = bill.status === 'PAID' ? 'PENDING' : 'PAID';
    const res = await fetch(`/api/bills/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: newStatus,
        paidAt: newStatus === 'PAID' ? new Date() : null 
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setBill({ ...bill, status: updated.status, paidAt: updated.paidAt });
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Đang tải hóa đơn...</div>;
  if (!bill) return <div className="p-10 text-center">Không tìm thấy dữ liệu.</div>;

  const electricUsage = bill.meterReading.electricNew - bill.meterReading.electricOld;
  const waterUsage = bill.meterReading.waterNew - bill.meterReading.waterOld;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12">
      {/* Thanh công cụ (Ẩn khi in) */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center no-print">
        <button onClick={() => router.back()} className="text-slate-500 font-bold flex items-center gap-2 hover:text-slate-800">
          ← Quay lại
        </button>
        <div className="flex gap-3">
          <button 
            onClick={handleTogglePaid}
            className={`px-6 py-2 rounded-full font-bold text-sm shadow-sm transition-all ${
              bill.status === 'PAID' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {bill.status === 'PAID' ? 'Chuyển thành Chưa trả' : 'Xác nhận Đã trả tiền'}
          </button>
          <button 
            onClick={() => window.print()}
            className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-black"
          >
            In Hóa đơn (PDF)
          </button>
        </div>
      </div>

      {/* Tờ Hóa Đơn */}
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-200" id="bill-content">
        <div className="p-12">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-slate-900">PHIẾU THU TIỀN NHÀ</h1>
              <p className="text-slate-500 mt-1 uppercase font-bold tracking-widest text-xs">
                Tháng {bill.meterReading.month} / Năm {bill.meterReading.year}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-4 py-1 rounded-md text-xs font-black mb-2 ${
                bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {bill.status === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHỜ THANH TOÁN'}
              </div>
              <p className="font-black text-xl text-slate-800">Phòng {bill.room.roomNumber}</p>
              <p className="text-slate-500 text-sm">{bill.room.tenantName || 'Khách thuê'}</p>
            </div>
          </div>

          {/* Bảng chi tiết */}
          <table className="w-full mb-8">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-black border-b">
                <th className="py-4 text-left">Nội dung thanh toán</th>
                <th className="py-4 text-right">Chỉ số</th>
                <th className="py-4 text-right">Đơn giá</th>
                <th className="py-4 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 font-medium divide-y divide-slate-100">
              <tr>
                <td className="py-5">Tiền thuê phòng</td>
                <td className="py-5 text-right">-</td>
                <td className="py-5 text-right">{bill.appliedBasePrice.toLocaleString()}</td>
                <td className="py-5 text-right font-bold text-slate-900">{bill.appliedBasePrice.toLocaleString()}đ</td>
              </tr>
              <tr>
                <td className="py-5">
                  <span>Tiền Điện</span>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                    Số mới: {bill.meterReading.electricNew} - Số cũ: {bill.meterReading.electricOld}
                  </div>
                </td>
                <td className="py-5 text-right">{electricUsage} kWh</td>
                <td className="py-5 text-right">{bill.appliedElectricPrice.toLocaleString()}</td>
                <td className="py-5 text-right font-bold text-slate-900">{(electricUsage * bill.appliedElectricPrice).toLocaleString()}đ</td>
              </tr>
              <tr>
                <td className="py-5">
                  <span>Tiền Nước</span>
                  <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                    Số mới: {bill.meterReading.waterNew} - Số cũ: {bill.meterReading.waterOld}
                  </div>
                </td>
                <td className="py-5 text-right">{waterUsage} m³</td>
                <td className="py-5 text-right">{bill.appliedWaterPrice.toLocaleString()}</td>
                <td className="py-5 text-right font-bold text-slate-900">{(waterUsage * bill.appliedWaterPrice).toLocaleString()}đ</td>
              </tr>
            </tbody>
          </table>

          {/* Tổng tiền */}
          <div className="bg-slate-50 p-8 rounded-xl flex justify-between items-center border border-slate-100">
            <div>
              <p className="text-xs font-black text-slate-400 uppercase">Tổng cộng tiền nhà</p>
              <p className="text-[10px] text-slate-400 italic font-medium mt-1">
                (Bằng chữ: Một triệu hai trăm nghìn đồng...)
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-indigo-600 leading-none">
                {bill.totalAmount.toLocaleString()}đ
              </span>
            </div>
          </div>

          {/* Ký tên */}
          <div className="grid grid-cols-2 gap-8 mt-12 text-center">
            <div className="space-y-16">
              <p className="text-xs font-bold uppercase text-slate-400">Người thuê</p>
              <div className="h-1 w-24 border-b border-slate-200 mx-auto opacity-50"></div>
            </div>
            <div className="space-y-16">
              <p className="text-xs font-bold uppercase text-slate-400">Người lập phiếu</p>
              <p className="font-black text-slate-800 uppercase tracking-tighter text-sm">Chủ nhà</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CSS dành riêng cho in ấn */}
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .max-w-3xl { max-width: 100% !important; border: none !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
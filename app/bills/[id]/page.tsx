'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, CheckCircle, XCircle, Share2, Trash2 } from 'lucide-react'; // Thêm Trash2

export default function BillDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // Trạng thái khi đang xóa

  useEffect(() => {
    fetch(`/api/bills/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBill(data);
        setLoading(false);
      });
  }, [id]);

  // --- LOGIC XÓA HÓA ĐƠN ---
  const handleDeleteBill = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa hóa đơn này không? Hành động này không thể hoàn tác.")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert("Đã xóa hóa đơn thành công.");
        router.push('/bills'); // Quay lại danh sách hóa đơn
        router.refresh();
      } else {
        alert("Lỗi khi xóa hóa đơn.");
      }
    } catch (error) {
      alert("Đã xảy ra lỗi kết nối.");
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium animate-pulse">Đang tải hóa đơn...</div>;
  if (!bill) return <div className="p-10 text-center text-rose-500 font-bold">Không tìm thấy dữ liệu.</div>;

  const electricUsage = bill.meterReading.electricNew - bill.meterReading.electricOld;
  const waterUsage = bill.meterReading.waterNew - bill.meterReading.waterOld;

  return (
    <div className="min-h-screen bg-slate-100 md:p-8 pb-20">
      {/* TOOLBAR MOBILE & DESKTOP */}
      <div className="max-w-2xl mx-auto mb-4 p-4 md:p-0 flex justify-between items-center no-print">
        <button onClick={() => router.back()} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-600">
          <ArrowLeft size={20} />
        </button>
        
        <div className="flex gap-2">
          {/* NÚT XÓA MỚI THÊM */}
          <button 
            onClick={handleDeleteBill}
            disabled={isDeleting}
            className="w-10 h-10 bg-white text-rose-500 rounded-xl flex items-center justify-center shadow-sm border border-rose-100 hover:bg-rose-50 transition-colors disabled:opacity-50"
            title="Xóa hóa đơn"
          >
            <Trash2 size={18} />
          </button>

          <button 
            onClick={handleTogglePaid}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-all ${
              bill.status === 'PAID' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {bill.status === 'PAID' ? <XCircle size={16}/> : <CheckCircle size={16}/>}
            <span className="hidden sm:inline">{bill.status === 'PAID' ? 'Hủy xác nhận' : 'Xác nhận thu'}</span>
          </button>
          
          <button 
            onClick={() => window.print()}
            className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md"
            title="In hóa đơn"
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* TỜ HÓA ĐƠN CHÍNH (Giữ nguyên phần dưới của bạn) */}
      <div className="max-w-2xl mx-auto bg-white shadow-xl md:rounded-2xl overflow-hidden border border-slate-200" id="bill-content">
        <div className="p-6 md:p-12">
          {/* ... các nội dung còn lại giữ nguyên ... */}
          <div className="text-center border-b-2 border-slate-100 pb-6 mb-6">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">PHIẾU THU TIỀN NHÀ</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
               <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                 Tháng {bill.meterReading.month} / {bill.meterReading.year}
               </span>
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {bill.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phòng</p>
              <p className="text-lg font-black text-slate-900">{bill.room.roomNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khách thuê</p>
              <p className="text-lg font-bold text-slate-900 truncate">{bill.room.tenantName || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
             <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <span className="text-xs font-bold text-slate-500 uppercase">Nội dung</span>
                <span className="text-xs font-bold text-slate-500 uppercase">Thành tiền</span>
             </div>
             <div className="flex justify-between items-start py-2">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Tiền thuê phòng</p>
                  <p className="text-[10px] text-slate-400">Giá gốc: {bill.appliedBasePrice.toLocaleString()}đ</p>
                </div>
                <p className="font-black text-slate-900">{bill.appliedBasePrice.toLocaleString()}đ</p>
             </div>
             <div className="flex justify-between items-start py-2">
                <div>
                  <p className="font-bold text-slate-800 text-sm italic">⚡ Tiền Điện</p>
                  <p className="text-[10px] text-slate-400">
                    ({bill.meterReading.electricNew} - {bill.meterReading.electricOld}) × {bill.appliedElectricPrice.toLocaleString()}đ
                  </p>
                </div>
                <p className="font-black text-slate-900">{(electricUsage * bill.appliedElectricPrice).toLocaleString()}đ</p>
             </div>
             <div className="flex justify-between items-start py-2">
                <div>
                  <p className="font-bold text-slate-800 text-sm italic">💧 Tiền Nước</p>
                  <p className="text-[10px] text-slate-400">
                    ({bill.meterReading.waterNew} - {bill.meterReading.waterOld}) × {bill.appliedWaterPrice.toLocaleString()}đ
                  </p>
                </div>
                <p className="font-black text-slate-900">{(waterUsage * bill.appliedWaterPrice).toLocaleString()}đ</p>
             </div>
          </div>

          <div className="bg-indigo-600 p-6 rounded-3xl text-white text-center shadow-lg shadow-indigo-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Tổng cộng cần thanh toán</p>
            <p className="text-3xl font-black leading-none">{bill.totalAmount.toLocaleString()}đ</p>
          </div>

          <div className="flex justify-between items-center mt-10 px-4">
             <div className="text-center flex-1">
                <div className="w-12 h-1 border-b border-slate-200 mx-auto mb-2 opacity-50"></div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Người thuê</p>
             </div>
             <div className="text-center flex-1">
                <p className="font-black text-slate-800 uppercase text-xs mb-1 italic">HOME MANAGER</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Người lập phiếu</p>
             </div>
          </div>
        </div>
      </div>
      
      {/* ... style và share button ... */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-white text-blue-600 rounded-full shadow-2xl flex items-center justify-center border border-slate-100 active:scale-90 transition-all no-print">
        <Share2 size={24} />
      </button>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .min-h-screen { min-height: auto !important; padding: 0 !important; }
          .max-w-2xl { max-width: 100% !important; border: none !important; box-shadow: none !important; }
          .rounded-2xl, .rounded-3xl { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
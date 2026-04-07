'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  CreditCard,
  RotateCcw,
  Receipt,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bills');
      const data = await res.json();
      setBills(data || []);
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PENDING' ? 'PAID' : 'PENDING';
    if (newStatus === 'PENDING' && !confirm("Chuyển về 'Chưa thanh toán'?")) return;

    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setBills((prev: any) => 
          prev.map((b: any) => b.id === id ? { 
            ...b, 
            status: newStatus, 
            paidAt: newStatus === 'PAID' ? new Date().toISOString() : null 
          } : b)
        );
      }
    } catch (error) {
      alert("Lỗi khi cập nhật");
    }
  };

  const filteredBills = useMemo(() => {
    return bills.filter((bill: any) => {
      const searchStr = `${bill.room.roomNumber} ${bill.room.tenantName || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' ? true : bill.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totalPending = bills.filter((b:any) => b.status === 'PENDING').reduce((acc, cur:any) => acc + cur.totalAmount, 0);
    const totalPaid = bills.filter((b:any) => b.status === 'PAID').reduce((acc, cur:any) => acc + cur.totalAmount, 0);
    return { totalPending, totalPaid };
  }, [bills]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* HEADER & STATS - Giảm bo góc từ 3rem xuống 2rem để tránh chèn chữ */}
      <div className="bg-white px-4 pt-8 pb-10 rounded-b-[2rem] shadow-sm border-b border-slate-200">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">HÓA ĐƠN</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quản lý thu tiền nhà</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Receipt size={20} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900 p-4 rounded-2xl shadow-lg relative overflow-hidden">
              <span className="text-[9px] font-bold text-amber-400 uppercase block mb-1">Cần thu</span>
              <p className="text-base font-black text-white">{stats.totalPending.toLocaleString()}đ</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 relative overflow-hidden">
              <span className="text-[9px] font-bold text-emerald-600 uppercase block mb-1">Đã thu</span>
              <p className="text-base font-black text-slate-900">{stats.totalPaid.toLocaleString()}đ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-5 space-y-5">
        {/* SEARCH & FILTER */}
        <div className="space-y-3">
          <div className="relative shadow-xl shadow-slate-200/50">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm phòng hoặc tên..."
              className="w-full pl-11 pr-4 py-4 bg-white border-none rounded-2xl text-sm font-medium outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-slate-200/50 p-1 rounded-xl backdrop-blur-sm">
            {['ALL', 'PENDING', 'PAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                  statusFilter === st ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Cần thu' : 'Xong'}
              </button>
            ))}
          </div>
        </div>

        {/* DANH SÁCH HÓA ĐƠN */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-300 font-bold text-xs uppercase tracking-widest">Không có dữ liệu</p>
            </div>
          ) : filteredBills.map((bill: any) => (
            <div 
              key={bill.id} 
              className={`bg-white rounded-3xl border transition-all ${
                bill.status === 'PAID' ? 'border-slate-100 opacity-70' : 'border-blue-200 shadow-md shadow-blue-50'
              }`}
            >
              <div className="p-5 flex items-center justify-between gap-4">
                {/* PHẦN BÊN TRÁI: TÊN PHÒNG & TRẠNG THÁI */}
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                        <span className="text-blue-600 text-lg mr-0.5">P.</span>
                        {bill.room.roomNumber}
                      </h2>
                      
                      {/* BIỂU TƯỢNG TRẠNG THÁI: V (Đã thu) | X (Chưa thu) */}
                      <div className="mt-1">
                        {bill.status === 'PAID' ? (
                          <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-sm border border-emerald-200">
                            <CheckCircle2 size={16} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-6 h-6 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-sm border border-rose-100 animate-pulse">
                            <AlertCircle size={16} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* TÊN KHÁCH & THÁNG (NHỎ LẠI) */}
                    <div className="flex flex-col mt-1">
                      <p className="text-sm font-bold text-slate-600 truncate max-w-[120px]">
                        {bill.room.tenantName || 'Phòng Trống'}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                        Kỳ: {bill.meterReading.month}/{bill.meterReading.year}
                      </p>
                    </div>
                  </div>
                </div>

                {/* PHẦN BÊN PHẢI: SỐ TIỀN IN ĐẬM */}
                <div className="text-right flex flex-col justify-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Thanh toán</p>
                  <div className="flex items-end justify-end gap-0.5">
                    <span className="text-2xl font-black text-slate-900 leading-none tracking-tighter">
                      {bill.totalAmount.toLocaleString()}
                    </span>
                    <span className="text-xs font-black text-slate-400 mb-0.5 underline">đ</span>
                  </div>
                </div>
              </div>

              {/* NÚT BẤM DƯỚI CÙNG (GIỮ NGUYÊN ĐỂ DỄ THAO TÁC) */}
              <div className="px-4 pb-4 flex gap-2">
                <button 
                  onClick={() => handleUpdateStatus(bill.id, bill.status)}
                  className={`flex-[3] flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 ${
                    bill.status === 'PENDING' 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {bill.status === 'PENDING' ? (
                    <><CreditCard size={14} /> Thu tiền</>
                  ) : (
                    <><RotateCcw size={14} /> Hoàn tác</>
                  )}
                </button>
                
                <Link 
                  href={`/bills/${bill.id}`}
                  className="flex-1 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 active:bg-blue-600 active:text-white transition-all shadow-sm"
                >
                  <FileText size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
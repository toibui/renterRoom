'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle2, 
  FileText, 
  Filter,
  CreditCard,
  CalendarDays,
  RotateCcw,
  LayoutDashboard,
  Receipt,
  User
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
      setBills(data);
    } catch (error) {
      console.error("Lỗi tải hóa đơn:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  // Logic Toggle trạng thái: Thu tiền <-> Hủy thu tiền
  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PENDING' ? 'PAID' : 'PENDING';
    
    // Xác nhận nếu là thao tác Hủy (Revert)
    if (newStatus === 'PENDING') {
      const confirmRevert = confirm("Bạn có chắc chắn muốn chuyển hóa đơn này về trạng thái 'Chưa thanh toán'?");
      if (!confirmRevert) return;
    }

    try {
      const res = await fetch(`/api/bills/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Cập nhật state tại chỗ để UI mượt mà không cần load lại trang
        setBills((prev: any) => 
          prev.map((b: any) => b.id === id ? { 
            ...b, 
            status: newStatus, 
            paidAt: newStatus === 'PAID' ? new Date().toISOString() : null 
          } : b)
        );
      }
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  // Filter dữ liệu
  const filteredBills = useMemo(() => {
    return bills.filter((bill: any) => {
      const searchStr = `${bill.room.roomNumber} ${bill.room.tenantName || ''}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' ? true : bill.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchTerm, statusFilter]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const totalPending = bills.filter((b:any) => b.status === 'PENDING').reduce((acc, cur:any) => acc + cur.totalAmount, 0);
    const totalPaid = bills.filter((b:any) => b.status === 'PAID').reduce((acc, cur:any) => acc + cur.totalAmount, 0);
    return { totalPending, totalPaid };
  }, [bills]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 md:pb-8">
      {/* Header & Stats Section */}
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Receipt className="text-blue-600" /> QUẢN LÝ HÓA ĐƠN
            </h1>
            <p className="text-sm text-slate-500 font-medium">Theo dõi thu chi phòng trọ</p>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
            <div className="bg-white border border-amber-100 p-3 rounded-2xl min-w-[140px] shadow-sm">
              <p className="text-[10px] font-bold text-amber-500 uppercase italic">Chưa thu</p>
              <p className="text-lg font-black text-slate-800">{stats.totalPending.toLocaleString()}đ</p>
            </div>
            <div className="bg-white border border-emerald-100 p-3 rounded-2xl min-w-[140px] shadow-sm">
              <p className="text-[10px] font-bold text-emerald-500 uppercase italic">Đã thu</p>
              <p className="text-lg font-black text-slate-800">{stats.totalPaid.toLocaleString()}đ</p>
            </div>
          </div>
        </header>

        {/* Filter Bar - Sticky on Mobile */}
        <div className="sticky top-2 z-30 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Số phòng hoặc tên khách..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {['ALL', 'PENDING', 'PAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  statusFilter === st ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Cần thu' : 'Xong'}
              </button>
            ))}
          </div>
        </div>

        {/* List Bills */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm animate-pulse">Đang tải danh sách...</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Không tìm thấy hóa đơn nào</p>
            </div>
          ) : filteredBills.map((bill: any) => (
            <div 
              key={bill.id} 
              className={`group bg-white rounded-2xl border transition-all duration-300 ${
                bill.status === 'PAID' 
                  ? 'border-slate-100 hover:border-emerald-200 shadow-sm opacity-90' 
                  : 'border-amber-200 shadow-md shadow-amber-50'
              }`}
            >
              <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
                {/* Info & Room Section */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-inner ${
                    bill.status === 'PAID' ? 'bg-slate-50 text-slate-400' : 'bg-blue-600 text-white'
                  }`}>
                    <span className="text-[8px] uppercase">Phòng</span>
                    <span className="text-xl leading-tight">{bill.room.roomNumber}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800">Tháng {bill.meterReading.month}/{bill.meterReading.year}</h3>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {bill.status === 'PAID' ? 'Đã thu' : 'Chưa thu'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                      <User size={12} />
                      <p className="text-xs font-medium truncate max-w-[120px]">{bill.room.tenantName || 'Trống'}</p>
                    </div>
                  </div>
                  <div className="md:hidden text-right">
                     <p className="text-[10px] font-bold text-slate-400 uppercase">Tổng cộng</p>
                     <p className="font-black text-slate-900 leading-tight">{bill.totalAmount.toLocaleString()}đ</p>
                  </div>
                </div>

                {/* Amount Detail (Hidden on small Mobile, shown on tablet/desktop) */}
                <div className="hidden md:grid grid-cols-2 gap-6 flex-1 px-6 border-l border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Tiền thuê</p>
                    <p className="font-bold text-slate-700">{bill.appliedBasePrice.toLocaleString()}đ</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest">Tổng tiền</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{bill.totalAmount.toLocaleString()}đ</p>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-50">
                  {bill.status === 'PENDING' ? (
                    <button 
                      onClick={() => handleUpdateStatus(bill.id, bill.status)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 md:py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95"
                    >
                      <CreditCard size={14} />
                      Xác nhận thu
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(bill.id, bill.status)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-3 md:py-2 rounded-xl border border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all group relative overflow-hidden"
                    >
                      <CheckCircle2 size={16} className="group-hover:hidden" />
                      <RotateCcw size={16} className="hidden group-hover:block animate-spin-reverse" />
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-black uppercase leading-none group-hover:hidden">Đã xong</p>
                        <p className="text-[10px] font-black uppercase leading-none hidden group-hover:block tracking-tighter">Hủy thu tiền?</p>
                        <p className="text-[9px] opacity-60 font-medium group-hover:hidden">
                           {bill.paidAt ? new Date(bill.paidAt).toLocaleDateString('vi-VN') : ''}
                        </p>
                      </div>
                    </button>
                  )}
                  
                  <Link 
                    href={`/bills/${bill.id}`}
                    className="p-3 md:p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all shadow-sm"
                  >
                    <FileText size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar for Mobile - Optional */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white border border-slate-200 rounded-2xl shadow-2xl flex items-center justify-around px-6 z-50">
         <button className="text-slate-400 p-2"><LayoutDashboard size={24}/></button>
         <button className="text-blue-600 p-2"><Receipt size={24}/></button>
         <button className="text-slate-400 p-2"><User size={24}/></button>
      </div>
    </div>
  );
}
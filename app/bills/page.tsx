'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ChevronRight, 
  Filter,
  CreditCard,
  CalendarDays
} from 'lucide-react';

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, PAID

  const fetchBills = () => {
    setLoading(true);
    fetch('/api/bills')
      .then(res => res.json())
      .then(data => {
        setBills(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchBills(); }, []);

  // Logic lọc dữ liệu
  const filteredBills = useMemo(() => {
    return bills.filter((bill: any) => {
      const matchesSearch = bill.room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (bill.room.tenantName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' ? true : bill.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bills, searchTerm, statusFilter]);

  // Tính toán tổng quan
  const stats = useMemo(() => {
    const totalPending = bills.filter((b:any) => b.status === 'PENDING').reduce((acc, cur:any) => acc + cur.totalAmount, 0);
    const totalPaid = bills.filter((b:any) => b.status === 'PAID').reduce((acc, cur:any) => acc + cur.totalAmount, 0);
    return { totalPending, totalPaid };
  }, [bills]);

  const updateStatus = async (id: string, status: string) => {
    if(!confirm('Xác nhận đã thu tiền cho hóa đơn này?')) return;
    
    await fetch(`/api/bills/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paidAt: status === 'PAID' ? new Date() : null })
    });
    fetchBills();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      {/* Header & Stats */}
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Sổ Hóa Đơn</h1>
            <p className="text-slate-500 mt-1">Quản lý thu chi và trạng thái đóng tiền của khách thuê</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chưa thu</p>
              <p className="text-xl font-black text-amber-600">{stats.totalPending.toLocaleString()}đ</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đã thu tháng này</p>
              <p className="text-xl font-black text-emerald-600">{stats.totalPaid.toLocaleString()}đ</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm số phòng hoặc tên khách..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            {['ALL', 'PENDING', 'PAID'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chưa thu' : 'Đã thu'}
              </button>
            ))}
          </div>
        </div>

        {/* Bills List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-slate-400">Đang tải dữ liệu...</div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
              Không tìm thấy hóa đơn nào phù hợp
            </div>
          ) : filteredBills.map((bill: any) => (
            <div 
              key={bill.id} 
              className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md flex flex-col md:flex-row items-center gap-6 ${
                bill.status === 'PAID' ? 'border-slate-100 opacity-80' : 'border-amber-200 bg-amber-50/10'
              }`}
            >
              {/* Room Info */}
              <div className="flex items-center gap-4 min-w-[180px]">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-sm ${
                  bill.status === 'PAID' ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white'
                }`}>
                  <span className="text-[9px] uppercase opacity-80">Phòng</span>
                  <span className="text-lg">{bill.room.roomNumber}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 flex items-center gap-1">
                    <CalendarDays size={14} className="text-slate-400" />
                    Tháng {bill.meterReading.month}/{bill.meterReading.year}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{bill.room.tenantName || 'N/A'}</p>
                </div>
              </div>

              {/* Amount Details */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
                <div className="px-4 border-l border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Tiền thuê</p>
                  <p className="font-semibold text-slate-700">{bill.appliedBasePrice.toLocaleString()}đ</p>
                </div>
                <div className="px-4 border-l border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Dịch vụ</p>
                  <p className="font-semibold text-slate-700">{(bill.totalAmount - bill.appliedBasePrice).toLocaleString()}đ</p>
                </div>
                <div className="px-4 border-l border-slate-100 col-span-2 md:col-span-1">
                  <p className="text-[10px] text-blue-500 uppercase font-bold">Tổng hóa đơn</p>
                  <p className="font-black text-xl text-slate-900 tracking-tight">{bill.totalAmount.toLocaleString()}đ</p>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                {bill.status === 'PENDING' ? (
                  <button 
                    onClick={() => updateStatus(bill.id, 'PAID')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-amber-200"
                  >
                    <CreditCard size={14} />
                    Xác nhận thu
                  </button>
                ) : (
                  <div className="flex-1 md:flex-none bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase leading-none">Đã thu</p>
                      <p className="text-[9px] opacity-70">{new Date(bill.paidAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                )}
                
                <Link 
                  href={`/bills/${bill.id}`}
                  className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all group"
                  title="Xem chi tiết & In"
                >
                  <FileText size={20} className="group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
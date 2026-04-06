'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = () => {
    fetch('/api/bills').then(res => res.json()).then(data => {
      setBills(data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchBills(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/bills/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paidAt: status === 'PAID' ? new Date() : null })
    });
    fetchBills();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Quản lý Hóa đơn</h1>
        <div className="flex gap-2">
          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Chờ: {bills.filter((b:any)=>b.status==='PENDING').length}</span>
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Đã thu: {bills.filter((b:any)=>b.status==='PAID').length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bills.map((bill: any) => (
          <div key={bill.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="bg-slate-900 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase opacity-60">Phòng</span>
                <span className="text-xl font-bold">{bill.room.roomNumber}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Tháng {bill.meterReading.month}/{bill.meterReading.year}</h3>
                <p className="text-sm text-slate-400">Khách: {bill.room.tenantName || 'Trống'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Tiền nhà</p>
                <p className="font-semibold">{bill.appliedBasePrice.toLocaleString()}đ</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Điện/Nước</p>
                <p className="font-semibold">{(bill.totalAmount - bill.appliedBasePrice).toLocaleString()}đ</p>
              </div>
              <div>
                <p className="text-[10px] text-indigo-500 uppercase font-bold">Tổng cộng</p>
                <p className="font-black text-indigo-600 text-xl">{bill.totalAmount.toLocaleString()}đ</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {bill.status === 'PENDING' ? (
                <button 
                  onClick={() => updateStatus(bill.id, 'PAID')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold text-sm transition-all"
                >
                  Xác nhận trả tiền
                </button>
              ) : (
                <div className="flex flex-col items-end">
                  <span className="text-emerald-500 font-bold flex items-center gap-1">
                    ✅ Đã thanh toán
                  </span>
                  <span className="text-[10px] text-slate-400">{new Date(bill.paidAt).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              <Link 
                href={`/bills/${bill.id}`}
                className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                📄
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  const fetchInvoices = async () => {
    const res = await fetch('/api/admin/invoices');
    const data = await res.json();
    setInvoices(data.invoices || []);
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleToggleStatus = async (invoiceId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    const res = await fetch('/api/admin/invoices', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId, status: nextStatus }),
    });

    if (res.ok) fetchInvoices();
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Quản lý hóa đơn</h1>
        <p className="text-xs text-slate-500">Xác nhận thu tiền hóa đơn chỉ với một chạm</p>
      </div>

      <div className="space-y-3">
        {invoices.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-white rounded-2xl border">Chưa có hóa đơn nào.</div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-bold text-slate-900">Phòng {inv.room?.roomNumber}</span>
                <span className="text-xs text-slate-500">Kỳ {inv.monthYear}</span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between gap-4"><span>Điện ({inv.oldElectric} → {inv.newElectric})</span><span className="text-right">{(inv.newElectric - inv.oldElectric).toLocaleString()} kWh × {inv.electricPrice.toLocaleString()}<br /><strong className="text-slate-800">{((inv.newElectric - inv.oldElectric) * inv.electricPrice).toLocaleString()} VNĐ</strong></span></div>
                <div className="flex justify-between gap-4"><span>Nước ({inv.oldWater} → {inv.newWater})</span><span className="text-right">{(inv.newWater - inv.oldWater).toLocaleString()} m³ × {inv.waterPrice.toLocaleString()}<br /><strong className="text-slate-800">{((inv.newWater - inv.oldWater) * inv.waterPrice).toLocaleString()} VNĐ</strong></span></div>
                <div className="flex justify-between font-bold text-sm text-slate-900 border-t pt-1">
                  <span>Tổng thu:</span>
                  <span className="text-blue-600">{inv.totalAmount.toLocaleString()} VNĐ</span>
                </div>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {inv.status === 'PAID' ? 'Đã thu' : 'Chưa thu'}
                </span>
                <button
                  onClick={() => handleToggleStatus(inv.id, inv.status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    inv.status === 'PAID' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {inv.status === 'PAID' ? 'Hủy xác nhận' : 'Xác nhận Đã Thu'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

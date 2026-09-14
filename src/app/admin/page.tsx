'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Droplets, FileText, Home, RefreshCw, Zap } from 'lucide-react';

type Room = {
  id: string;
  roomNumber: string;
  accessToken: string;
};

type Invoice = {
  id: string;
  roomId: string;
  monthYear: string;
  oldElectric: number;
  newElectric: number;
  oldWater: number;
  newWater: number;
  electricPrice: number;
  waterPrice: number;
  status: 'PAID' | 'UNPAID';
  totalAmount: number;
  room: { roomNumber: string; accessToken: string };
};

const formatNumber = (value: number) => value.toLocaleString('vi-VN');
const formatCurrency = (value: number) => `${formatNumber(value)} đ`;
const getCurrentMonth = () => {
  const now = new Date();
  return `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
};

const usage = (current: number, previous: number) => Math.max(0, current - previous);

export default function AdminDashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingInvoiceId, setUpdatingInvoiceId] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [roomsResponse, invoicesResponse] = await Promise.all([
        fetch('/api/admin/rooms'),
        fetch('/api/admin/invoices'),
      ]);
      const [roomsData, invoicesData] = await Promise.all([roomsResponse.json(), invoicesResponse.json()]);
      if (!roomsResponse.ok || !invoicesResponse.ok) throw new Error('Không thể tải dữ liệu tổng quan.');

      const loadedRooms = roomsData.rooms || [];
      const loadedInvoices = invoicesData.invoices || [];
      setRooms(loadedRooms);
      setInvoices(loadedInvoices);

      const months: string[] = Array.from(new Set(loadedInvoices.map((invoice: Invoice) => invoice.monthYear)));
      const preferredMonth = months.includes(getCurrentMonth()) ? getCurrentMonth() : months[0] || getCurrentMonth();
      setSelectedMonth((current) => current && months.includes(current) ? current : preferredMonth);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu tổng quan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const togglePaymentStatus = async (invoice: Invoice) => {
    setUpdatingInvoiceId(invoice.id);
    setError('');
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id, status: invoice.status === 'PAID' ? 'UNPAID' : 'PAID' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Không thể cập nhật trạng thái thanh toán.');
      await loadDashboard();
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Không thể cập nhật trạng thái thanh toán.');
    } finally {
      setUpdatingInvoiceId(null);
    }
  };

  const monthInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.monthYear === selectedMonth),
    [invoices, selectedMonth],
  );

  const summary = useMemo(() => monthInvoices.reduce((result, invoice) => ({
    electric: result.electric + usage(invoice.newElectric, invoice.oldElectric),
    water: result.water + usage(invoice.newWater, invoice.oldWater),
    electricAmount: result.electricAmount + usage(invoice.newElectric, invoice.oldElectric) * invoice.electricPrice,
    waterAmount: result.waterAmount + usage(invoice.newWater, invoice.oldWater) * invoice.waterPrice,
  }), { electric: 0, water: 0, electricAmount: 0, waterAmount: 0 }), [monthInvoices]);

  const months = useMemo(() => Array.from(new Set(invoices.map((invoice) => invoice.monthYear))), [invoices]);
  const invoiceByRoom = useMemo(() => new Map(monthInvoices.map((invoice) => [invoice.roomId, invoice])), [monthInvoices]);
  const closedCount = monthInvoices.length;
  const paidCount = monthInvoices.filter((invoice) => invoice.status === 'PAID').length;
  const unpaidCount = monthInvoices.filter((invoice) => invoice.status === 'UNPAID').length;

  return (
    <div className="space-y-5 p-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-600">Tổng quan vận hành</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Tổng quan nhà trọ</h1>
          <p className="mt-1 text-sm text-slate-500">Theo dõi chốt điện nước và mở nhanh hóa đơn từng phòng.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dashboard-month" className="text-xs font-semibold text-slate-500">Kỳ xem</label>
          <select
            id="dashboard-month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {months.length === 0 && <option value={selectedMonth}>{selectedMonth || getCurrentMonth()}</option>}
            {months.map((month) => <option key={month} value={month}>{month}</option>)}
          </select>
          <button
            type="button"
            onClick={loadDashboard}
            aria-label="Tải lại dữ liệu"
            title="Tải lại dữ liệu"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition hover:border-cyan-300 hover:text-cyan-600"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</div>}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Tổng tiêu thụ">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Tổng điện</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{formatNumber(summary.electric)} <span className="text-base font-bold text-amber-700">kWh</span></p>
              <p className="mt-1 text-xs text-slate-500">Tiền điện: {formatCurrency(summary.electricAmount)}</p>
            </div>
            <span className="rounded-xl bg-amber-500 p-2.5 text-white"><Zap size={20} /></span>
          </div>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-cyan-700">Tổng nước</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{formatNumber(summary.water)} <span className="text-base font-bold text-cyan-700">m³</span></p>
              <p className="mt-1 text-xs text-slate-500">Tiền nước: {formatCurrency(summary.waterAmount)}</p>
            </div>
            <span className="rounded-xl bg-cyan-500 p-2.5 text-white"><Droplets size={20} /></span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="font-black text-slate-900">Tình trạng chốt kỳ {selectedMonth}</h2>
            <p className="mt-0.5 text-xs text-slate-500">Đã chốt {closedCount}/{rooms.length} phòng · Đã thu {paidCount} · Chưa thu {unpaidCount}</p>
          </div>
          <Link href="/admin/electric-water" className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-100">
            <Zap size={14} /> Chốt số
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Đang tải dữ liệu...</div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Chưa có phòng nào. Hãy tạo phòng để bắt đầu.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rooms.map((room) => {
              const invoice = invoiceByRoom.get(room.id);
              return (
                <div key={room.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-slate-100 p-2 text-slate-600"><Home size={17} /></span>
                    <div>
                      <p className="font-bold text-slate-900">Phòng {room.roomNumber}</p>
                      {invoice ? (
                        <p className="text-xs text-slate-500">Điện {formatNumber(usage(invoice.newElectric, invoice.oldElectric))} kWh · Nước {formatNumber(usage(invoice.newWater, invoice.oldWater))} m³</p>
                      ) : <p className="text-xs text-slate-400">Chưa có chỉ số kỳ này</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-11 sm:pl-0">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${invoice ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {invoice ? 'Đã chốt' : 'Chưa chốt'}
                    </span>
                    {invoice && (
                      <button
                        type="button"
                        onClick={() => togglePaymentStatus(invoice)}
                        disabled={updatingInvoiceId === invoice.id}
                        title={invoice.status === 'PAID' ? 'Bấm để hủy xác nhận thanh toán' : 'Bấm để xác nhận đã thanh toán'}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition hover:opacity-80 disabled:cursor-wait disabled:opacity-60 ${invoice.status === 'PAID' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}
                      >
                        {invoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </button>
                    )}
                    {invoice ? (
                      <Link href={`/phong/${room.accessToken}?invoice=${invoice.id}`} target="_blank" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700">
                        <FileText size={14} /> Xem hóa đơn <ArrowUpRight size={13} />
                      </Link>
                    ) : (
                      <Link href={`/admin/electric-water?roomId=${room.id}&monthYear=${encodeURIComponent(selectedMonth)}`} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:border-teal-300 hover:text-teal-700">Nhập số</Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/admin/rooms" className="rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"><Home className="mx-auto mb-1 text-blue-600" size={18} />Quản lý phòng</Link>
        <Link href="/admin/invoices" className="rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-700"><FileText className="mx-auto mb-1 text-indigo-600" size={18} />Tất cả hóa đơn</Link>
        <Link href="/admin/property" className="rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"><Home className="mx-auto mb-1 text-emerald-600" size={18} />Thông tin nhà</Link>
        <Link href="/admin/tenants" className="rounded-xl border border-slate-200 bg-white p-3 text-center text-xs font-bold text-slate-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700"><FileText className="mx-auto mb-1 text-amber-600" size={18} />Nhân khẩu</Link>
      </section>
    </div>
  );
}

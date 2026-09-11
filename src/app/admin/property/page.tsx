'use client';
import { useEffect, useState } from 'react';

type PropertyForm = {
  landlordName: string;
  phone: string;
  houseNumber: string;
  address: string;
  bankId: string;
  accountNo: string;
  accountName: string;
  electricPrice: number;
  waterPrice: number;
};

const emptyForm: PropertyForm = { landlordName: '', phone: '', houseNumber: '', address: '', bankId: '', accountNo: '', accountName: '', electricPrice: 3500, waterPrice: 25000 };

export default function PropertyPage() {
  const [form, setForm] = useState<PropertyForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/admin/property')
      .then((res) => res.json())
      .then((data) => {
        if (data.property) setForm(data.property);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field: keyof PropertyForm, value: string) => {
    setForm((current) => ({ ...current, [field]: field === 'electricPrice' || field === 'waterPrice' ? Number(value) : value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    const res = await fetch('/api/admin/property', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setMessage({ text: data.error || 'Đã lưu thông tin nhà trọ.', success: res.ok });
  };

  if (loading) return <div className="p-4 text-sm text-slate-500">Đang tải thông tin...</div>;

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Thông tin nhà trọ</h1>
        <p className="text-xs text-slate-500">Thông tin này sẽ được hiển thị cho người thuê khi cần lập hợp đồng.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {message && <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${message.success ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{message.text}</div>}
        <label className="block text-xs font-semibold text-slate-600">Tên chủ nhà<input required value={form.landlordName} onChange={(e) => updateField('landlordName', e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ví dụ: Nguyễn Văn A" /></label>
        <label className="block text-xs font-semibold text-slate-600">Số điện thoại<input required type="tel" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ví dụ: 0901234567" /></label>
        <label className="block text-xs font-semibold text-slate-600">Số nhà<input required value={form.houseNumber} onChange={(e) => updateField('houseNumber', e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ví dụ: 12A" /></label>
        <label className="block text-xs font-semibold text-slate-600">Địa chỉ<input required value={form.address} onChange={(e) => updateField('address', e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-blue-500" placeholder="Đường, phường/xã, quận/huyện, tỉnh/thành phố" /></label>
        <fieldset className="space-y-3 rounded-xl border border-teal-100 bg-teal-50 p-3">
          <legend className="px-1 text-xs font-bold text-teal-800">Thông tin nhận chuyển khoản VietQR</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-600">Mã ngân hàng<input required value={form.bankId} onChange={(e) => updateField('bankId', e.target.value.toUpperCase())} className="mt-1 w-full rounded-xl border bg-white p-2.5 text-sm font-normal uppercase outline-none focus:ring-2 focus:ring-teal-500" placeholder="Ví dụ: MB" /></label>
            <label className="text-xs font-semibold text-slate-600">Số tài khoản<input required inputMode="numeric" value={form.accountNo} onChange={(e) => updateField('accountNo', e.target.value)} className="mt-1 w-full rounded-xl border bg-white p-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-teal-500" placeholder="Số tài khoản" /></label>
            <label className="text-xs font-semibold text-slate-600">Tên tài khoản<input required value={form.accountName} onChange={(e) => updateField('accountName', e.target.value.toUpperCase())} className="mt-1 w-full rounded-xl border bg-white p-2.5 text-sm font-normal uppercase outline-none focus:ring-2 focus:ring-teal-500" placeholder="Tên chủ tài khoản" /></label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-600">Giá điện (VNĐ/kWh)<input required min="0" type="number" value={form.electricPrice} onChange={(e) => updateField('electricPrice', e.target.value)} className="mt-1 w-full rounded-xl border bg-white p-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-teal-500" /></label>
            <label className="text-xs font-semibold text-slate-600">Giá nước (VNĐ/m³)<input required min="0" type="number" value={form.waterPrice} onChange={(e) => updateField('waterPrice', e.target.value)} className="mt-1 w-full rounded-xl border bg-white p-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-teal-500" /></label>
          </div>
          <p className="text-[11px] text-teal-700">Thông tin này được dùng để tạo mã QR thanh toán cho người thuê.</p>
        </fieldset>
        <button type="submit" className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Lưu thông tin nhà trọ</button>
      </form>
    </div>
  );
}
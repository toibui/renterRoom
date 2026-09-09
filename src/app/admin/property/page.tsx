'use client';
import { useEffect, useState } from 'react';

type PropertyForm = {
  landlordName: string;
  phone: string;
  houseNumber: string;
  address: string;
};

const emptyForm: PropertyForm = { landlordName: '', phone: '', houseNumber: '', address: '' };

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
    setForm((current) => ({ ...current, [field]: value }));
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
        <button type="submit" className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Lưu thông tin nhà trọ</button>
      </form>
    </div>
  );
}
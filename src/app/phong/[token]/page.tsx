'use client';
import { useState, useEffect } from 'react';

type Invoice = {
  id: string;
  monthYear: string;
  oldElectric: number;
  newElectric: number;
  oldWater: number;
  newWater: number;
  totalAmount: number;
  status: 'UNPAID' | 'PAID';
};

type Tenant = {
  id: string;
  fullName: string;
  phone: string;
  identityCard: string;
  isPrimary: boolean;
  isTemporaryReg: boolean;
};

type PropertyInfo = {
  landlordName: string;
  phone: string;
  houseNumber: string;
  address: string;
};

export default function TenantPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<{ roomNumber: string; rentPrice: number; invoices: Invoice[]; tenants: Tenant[] } | null>(null);
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'primary' | 'companion' | 'replace' | 'edit'>('primary');
  const [formMessage, setFormMessage] = useState('');
  const [formData, setFormData] = useState({ fullName: '', phone: '', identityCard: '' });

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const res = await fetch(`/api/tenant/${params.token}`);
        const result = await res.json();

        if (!res.ok || !result.room) {
          throw new Error(result.error || 'Không thể tải thông tin phòng.');
        }

        const room = {
          ...result.room,
          invoices: Array.isArray(result.room.invoices) ? result.room.invoices : [],
          tenants: Array.isArray(result.room.tenants) ? result.room.tenants : [],
        };
        setData(room);
        setProperty(result.property ?? null);
        setSelectedInvoiceId(room.invoices[0]?.id ?? '');
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Không thể tải thông tin phòng.');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [params.token]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage('');
    const activeTenants = data?.tenants ?? [];
    const isReplacing = formMode === 'replace' && activeTenants.length > 0;
    if (isReplacing && !window.confirm('Khách hiện tại sẽ được chuyển vào kho lưu trữ và không bị xóa. Bạn có muốn tiếp tục cho khách mới khai báo không?')) return;

    const res = await fetch(`/api/tenant/${params.token}`, {
      method: editingTenantId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTenantId
        ? { ...formData, tenantId: editingTenantId, isPrimary: formMode === 'primary' }
        : { ...formData, isPrimary: formMode !== 'companion', replaceExisting: isReplacing }),
    });
    if (res.ok) {
      setFormMessage(editingTenantId ? 'Đã cập nhật thông tin.' : formMode === 'companion' ? 'Đã thêm người đi kèm.' : 'Đã lưu chủ phòng mới.');
      setFormData({ fullName: '', phone: '', identityCard: '' });
      setEditingTenantId(null);
      setFormMode('primary');
      window.location.reload();
    } else {
      const result = await res.json();
      setFormMessage(result.error || 'Không thể lưu thông tin khách hàng.');
    }
  };

  const chooseFormMode = (mode: 'primary' | 'companion' | 'replace') => {
    setEditingTenantId(null);
    setFormMode(mode);
    setFormData({ fullName: '', phone: '', identityCard: '' });
    setFormMessage('');
  };

  const startEditing = (tenant: Tenant) => {
    setEditingTenantId(tenant.id);
    setFormMode(tenant.isPrimary ? 'primary' : 'companion');
    setFormData({ fullName: tenant.fullName, phone: tenant.phone, identityCard: tenant.identityCard });
    setFormMessage('');
  };

  const cancelEditing = () => {
    setEditingTenantId(null);
    setFormMode('primary');
    setFormData({ fullName: '', phone: '', identityCard: '' });
    setFormMessage('');
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Mã phòng không tồn tại.</div>;

  const invoice = data.invoices.find((item) => item.id === selectedInvoiceId) ?? data.invoices[0];
  const bankId = process.env.NEXT_PUBLIC_VIETQR_BANK_ID || 'MB';
  const accountNo = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '0987654321';
  const accountName = process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'CHUNHA';

  const qrUrl = invoice
    ? `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${invoice.totalAmount}&addInfo=P${data.roomNumber}%20T${invoice.monthYear}&accountName=${encodeURIComponent(accountName)}`
    : '';

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto">
      <header className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Cổng thông tin phòng trọ</p>
        <h1 className="mt-2 text-3xl font-black">Phòng {data.roomNumber}</h1>
        <p className="mt-1 text-sm text-slate-300">Theo dõi hóa đơn và quản lý thông tin khách thuê</p>
      </header>

      {property && (
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4" aria-labelledby="property-info-title">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Thông tin bên cho thuê</p>
          <h2 id="property-info-title" className="mt-1 text-lg font-black text-slate-900">Thông tin nhà trọ</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold">Chủ nhà:</span> {property.landlordName}</p>
            <p><span className="font-semibold">Số điện thoại:</span> {property.phone}</p>
            <p><span className="font-semibold">Địa chỉ:</span> {property.houseNumber}, {property.address}</p>
          </div>
          <p className="mt-3 text-xs text-indigo-700">Bạn có thể sử dụng các thông tin trên khi chuẩn bị hợp đồng thuê nhà.</p>
        </section>
      )}

      <section className="space-y-3" aria-labelledby="invoice-section-title">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">01 / Thanh toán</p>
            <h2 id="invoice-section-title" className="text-xl font-black text-slate-900">Hóa đơn theo tháng</h2>
          </div>
          {data.invoices.length > 0 && (
            <select aria-label="Chọn tháng hóa đơn" value={selectedInvoiceId} onChange={(e) => setSelectedInvoiceId(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
              {data.invoices.map((item) => <option key={item.id} value={item.id}>Tháng {item.monthYear}</option>)}
            </select>
          )}
        </div>

        {invoice ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
              <h3 className="text-sm font-bold text-slate-900">Chi tiết tháng {invoice.monthYear}</h3>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {invoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </span>
            </div>
            <div className="space-y-2 p-4 text-xs text-slate-600">
              <div className="flex justify-between"><span>Tiền phòng</span><span className="font-semibold">{data.rentPrice.toLocaleString()} VNĐ</span></div>
              <div className="flex justify-between"><span>Điện ({invoice.oldElectric} → {invoice.newElectric})</span><span>{(invoice.newElectric - invoice.oldElectric).toLocaleString()} kWh</span></div>
              <div className="flex justify-between"><span>Nước ({invoice.oldWater} → {invoice.newWater})</span><span>{(invoice.newWater - invoice.oldWater).toLocaleString()} m³</span></div>
              <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm font-black text-slate-900"><span>Tổng thanh toán</span><span className="text-cyan-600">{invoice.totalAmount.toLocaleString()} VNĐ</span></div>
            </div>
            {invoice.status === 'UNPAID' && (
              <div className="border-t border-slate-100 p-4 text-center">
                <p className="mb-2 text-[11px] text-slate-500">Quét mã VietQR để thanh toán</p>
                <img src={qrUrl} alt={`Mã QR thanh toán tháng ${invoice.monthYear}`} className="mx-auto h-44 w-44 rounded-xl border shadow-sm" />
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">Chưa có hóa đơn.</div>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="tenant-section-title">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">02 / Lưu trú</p>
          <h2 id="tenant-section-title" className="text-xl font-black text-slate-900">Thông tin khách hàng</h2>
        </div>
        {data.tenants.length > 0 && (
          <div className="space-y-2">
            {data.tenants.map((tenant) => (
              <div key={tenant.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-900">{tenant.fullName}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${tenant.isPrimary ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {tenant.isPrimary ? 'Chủ phòng' : 'Người đi kèm'}
                    </span>
                    <button type="button" onClick={() => startEditing(tenant)} className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">Sửa</button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">SĐT: {tenant.phone} · CCCD/CMND: {tenant.identityCard}</p>
              </div>
            ))}
          </div>
        )}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {!editingTenantId && data.tenants.length > 0 && (
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => chooseFormMode('companion')} className={`rounded-xl border px-3 py-2 text-xs font-bold ${formMode === 'companion' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600'}`}>+ Thêm người đi kèm</button>
              <button type="button" onClick={() => chooseFormMode('replace')} className={`rounded-xl border px-3 py-2 text-xs font-bold ${formMode === 'replace' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600'}`}>Đổi khách thuê mới</button>
            </div>
          )}
          <h3 className="mb-3 text-sm font-bold text-slate-800">
            {editingTenantId ? 'Cập nhật thông tin' : formMode === 'companion' ? 'Khai báo người đi kèm' : formMode === 'replace' ? 'Khai báo chủ phòng mới' : 'Khai báo chủ phòng'}
          </h3>
          {formMessage && <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">{formMessage}</p>}
          <form onSubmit={handleRegister} className="space-y-2">
          <input
            type="text"
            placeholder="Họ và Tên"
            required
            className="w-full border p-2.5 rounded-xl text-xs"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <input
            type="tel"
            placeholder="Số Điện thoại"
            required
            className="w-full border p-2.5 rounded-xl text-xs"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <input
            type="text"
            placeholder="Số CCCD / CMND"
            required
            className="w-full border p-2.5 rounded-xl text-xs"
            value={formData.identityCard}
            onChange={(e) => setFormData({ ...formData, identityCard: e.target.value })}
          />
            <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-sm">
              {editingTenantId ? 'Lưu thay đổi' : 'Gửi thông tin'}
            </button>
            {editingTenantId && <button type="button" onClick={cancelEditing} className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600">Hủy chỉnh sửa</button>}
          </form>
        </div>
      </section>
    </div>
  );
}

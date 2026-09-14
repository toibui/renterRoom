'use client';
import { useState, useEffect } from 'react';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetch('/api/admin/rooms')
      .then((res) => res.json())
      .then((d) => {
        const allTenants = (d.rooms || []).flatMap((r: any) =>
          (r.tenants || []).map((t: any) => ({ ...t, roomNumber: r.roomNumber }))
        );
        setTenants(allTenants);
      });
  }, []);

  const handleExportExcel = () => {
    window.open('/api/admin/tenants/export', '_blank');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý khách thuê</h1>
          <p className="text-xs text-slate-500">Khách thuê khai báo tạm trú</p>
        </div>
        <button onClick={handleExportExcel} className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-sm">
          📊 Excel
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button onClick={() => setShowArchived(false)} className={`rounded-lg py-2 text-xs font-bold ${!showArchived ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Đang ở</button>
        <button onClick={() => setShowArchived(true)} className={`rounded-lg py-2 text-xs font-bold ${showArchived ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Kho lưu trữ</button>
      </div>

      <div className="space-y-3">
        {tenants.filter((tenant) => Boolean(tenant.isArchived) === showArchived).length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-white rounded-2xl border">{showArchived ? 'Chưa có khách trong kho lưu trữ.' : 'Chưa có khách đang ở.'}</div>
        ) : (
          tenants.filter((tenant) => Boolean(tenant.isArchived) === showArchived).map((t) => (
            <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">{t.fullName}</span>
                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">P.{t.roomNumber}</span>
              </div>
              <p className={`text-[11px] font-semibold ${t.isPrimary ? 'text-indigo-600' : 'text-slate-500'}`}>{t.isPrimary ? 'Chủ phòng' : 'Người đi kèm'}</p>
              <p className="text-xs text-slate-600">📞 SĐT: {t.phone}</p>
              <p className="text-xs text-slate-600">🪪 CCCD: {t.identityCard}</p>
              {t.isArchived && <p className="text-[11px] font-semibold text-slate-400">Đã lưu trữ: {new Date(t.archivedAt).toLocaleDateString('vi-VN')}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

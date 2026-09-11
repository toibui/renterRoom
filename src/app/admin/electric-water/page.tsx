'use client';
import { useState, useEffect } from 'react';

type BulkReading = {
  roomId: string;
  roomNumber: string;
  selected: boolean;
  oldElectric: number;
  newElectric: number;
  oldWater: number;
  newWater: number;
};

export default function ElectricWaterPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [bulkRows, setBulkRows] = useState<BulkReading[]>([]);
  const [bulkMonthYear, setBulkMonthYear] = useState('09/2026');
  const [bulkElectricPrice, setBulkElectricPrice] = useState(3500);
  const [bulkWaterPrice, setBulkWaterPrice] = useState(25000);
  const [bulkMessage, setBulkMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [monthYear, setMonthYear] = useState('09/2026');
  const [oldElectric, setOldElectric] = useState(0);
  const [newElectric, setNewElectric] = useState(0);
  const [electricPrice, setElectricPrice] = useState(3500);
  const [oldWater, setOldWater] = useState(0);
  const [newWater, setNewWater] = useState(0);
  const [waterPrice, setWaterPrice] = useState(25000);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    Promise.all([fetch('/api/admin/rooms'), fetch('/api/admin/property')])
      .then(async ([roomsResponse, propertyResponse]) => [await roomsResponse.json(), await propertyResponse.json()])
      .then(([d, propertyData]) => {
        const loadedRooms = d.rooms || [];
        const property = propertyData.property;
        if (property) {
          setElectricPrice(property.electricPrice ?? 3500);
          setWaterPrice(property.waterPrice ?? 25000);
          setBulkElectricPrice(property.electricPrice ?? 3500);
          setBulkWaterPrice(property.waterPrice ?? 25000);
        }
        setRooms(loadedRooms);
        setBulkRows(loadedRooms.map((room: any) => ({
          roomId: room.id,
          roomNumber: room.roomNumber,
          selected: false,
          oldElectric: 0,
          newElectric: 0,
          oldWater: 0,
          newWater: 0,
        })));
      });
  }, []);

  const updateBulkRow = (roomId: string, field: keyof BulkReading, value: number | boolean) => {
    setBulkRows((currentRows) => currentRows.map((row) => row.roomId === roomId ? { ...row, [field]: value } : row));
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkMessage(null);
    const selectedRows = bulkRows.filter((row) => row.selected);
    if (selectedRows.length === 0) {
      setBulkMessage({ text: 'Hãy chọn ít nhất một phòng để nhập.', type: 'error' });
      return;
    }

    const res = await fetch('/api/admin/electric-water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthYear: bulkMonthYear,
        electricPrice: Number(bulkElectricPrice),
        waterPrice: Number(bulkWaterPrice),
        entries: selectedRows.map(({ roomId, oldElectric, newElectric, oldWater, newWater }) => ({ roomId, oldElectric, newElectric, oldWater, newWater })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBulkMessage({ text: data.error || 'Không thể lưu dữ liệu cũ.', type: 'error' });
      return;
    }

    setBulkRows((currentRows) => currentRows.map((row) => ({ ...row, selected: false })));
    setBulkMessage({ text: `Đã lưu ${data.count} phòng cho kỳ ${bulkMonthYear}.`, type: 'success' });
  };

  const handleRoomChange = async (roomId: string) => {
    setSelectedRoomId(roomId);
    if (!roomId) return;
    const res = await fetch(`/api/admin/electric-water/latest?roomId=${roomId}`);
    const data = await res.json();
    setOldElectric(data.oldElectric || 0);
    setNewElectric(data.oldElectric || 0);
    setOldWater(data.oldWater || 0);
    setNewWater(data.oldWater || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!selectedRoomId) {
      setMessage({ text: 'Vui lòng chọn phòng!', type: 'error' });
      return;
    }

    const res = await fetch('/api/admin/electric-water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: selectedRoomId,
        monthYear,
        oldElectric: Number(oldElectric),
        newElectric: Number(newElectric),
        electricPrice: Number(electricPrice),
        oldWater: Number(oldWater),
        newWater: Number(newWater),
        waterPrice: Number(waterPrice),
      }),
    });

    if (res.ok) {
      setMessage({ text: 'Đã lưu chỉ số và tạo hóa đơn.', type: 'success' });
    } else {
      const data = await res.json();
      setMessage({ text: data.error || 'Lỗi khi lưu chỉ số.', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!selectedRoomId) {
      setMessage({ text: 'Vui lòng chọn phòng trước.', type: 'error' });
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa hóa đơn kỳ ${monthYear}? Hành động này chỉ thực hiện được với hóa đơn chưa thanh toán.`,
    );
    if (!confirmed) return;

    setMessage(null);
    const res = await fetch('/api/admin/electric-water', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: selectedRoomId, monthYear }),
    });
    const data = await res.json();
    setMessage({
      text: data.error || 'Đã xóa hóa đơn.',
      type: res.ok ? 'success' : 'error',
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Chốt Điện Nước</h1>
        <p className="text-xs text-slate-500">Tự động lấy chỉ số cũ & tính tổng tiền</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {message && (
          <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${message.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {message.text}
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-600">Chọn Phòng</label>
            <select
              value={selectedRoomId}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full border p-2.5 rounded-xl text-sm bg-white mt-1 outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>Phòng {r.roomNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Tháng/Năm (MM/YYYY)</label>
            <input
              type="text"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="w-full border p-2.5 rounded-xl text-sm mt-1 outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
        </div>

        {/* Cụm Điện */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-2">
          <h3 className="font-bold text-amber-800 text-xs">⚡ Chỉ Số Điện (kWh)</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Số Cũ</span>
              <input type="number" value={oldElectric} onChange={(e) => setOldElectric(Number(e.target.value))} className="w-full border p-2 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Số Mới</span>
              <input type="number" value={newElectric} onChange={(e) => setNewElectric(Number(e.target.value))} className="w-full border p-2 rounded-lg text-sm bg-white" required />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Đơn Giá</span>
              <input type="number" value={electricPrice} onChange={(e) => setElectricPrice(Number(e.target.value))} className="w-full border p-2 rounded-lg text-sm bg-white" />
            </div>
          </div>
        </div>

        {/* Cụm Nước */}
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
          <h3 className="font-bold text-blue-800 text-xs">💧 Chỉ Số Nước (m³)</h3>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[10px] text-slate-500">Số Cũ</span>
              <input type="number" value={oldWater} onChange={(e) => setOldWater(Number(e.target.value))} className="w-full border p-2 rounded-lg text-sm bg-white" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Số Mới</span>
              <input type="number" value={newWater} onChange={(e) => setNewWater(Number(e.target.value))} className="w-full border p-2 rounded-lg text-sm bg-white" required />
            </div>
            <div>
              <span className="text-[10px] text-slate-500">Đơn Giá</span>
              <input type="number" value={waterPrice} onChange={(e) => setWaterPrice(Number(e.target.value))} className="w-full border p-2 rounded-lg text-sm bg-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition">
            Lưu Chỉ Số & Tạo Hóa Đơn
          </button>
          <button type="button" onClick={handleDelete} className="w-full rounded-xl border border-red-200 bg-red-50 py-3 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-100">
            Xóa kỳ chưa thanh toán
          </button>
        </div>
      </form>

      <details className="rounded-2xl border border-slate-200 bg-slate-50">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-bold text-slate-700">
          <span className="mr-2 text-slate-400">＋</span> Nhập nhanh dữ liệu điện nước cũ
          <span className="ml-2 text-xs font-normal text-slate-500">(dành cho nhập bổ sung, ít sử dụng)</span>
        </summary>
        <form onSubmit={handleBulkSubmit} className="border-t border-slate-200 p-4 space-y-4">
          {bulkMessage && (
            <div className={`rounded-xl border px-3 py-2 text-xs font-semibold ${bulkMessage.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {bulkMessage.text}
            </div>
          )}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="text-xs font-semibold text-slate-600">
              Kỳ dữ liệu (MM/YYYY)
              <input type="text" value={bulkMonthYear} onChange={(e) => setBulkMonthYear(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" required />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Giá điện (VNĐ/kWh)
              <input type="number" min="0" value={bulkElectricPrice} onChange={(e) => setBulkElectricPrice(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" required />
            </label>
            <label className="text-xs font-semibold text-slate-600">
              Giá nước (VNĐ/m³)
              <input type="number" min="0" value={bulkWaterPrice} onChange={(e) => setBulkWaterPrice(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500" required />
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] border-collapse text-xs">
              <thead className="bg-slate-100 text-left text-[11px] text-slate-500">
                <tr>
                  <th className="w-10 px-3 py-2"><span className="sr-only">Chọn</span></th>
                  <th className="px-3 py-2">Phòng</th>
                  <th className="px-3 py-2">Điện cũ</th>
                  <th className="px-3 py-2">Điện mới</th>
                  <th className="px-3 py-2">Nước cũ</th>
                  <th className="px-3 py-2">Nước mới</th>
                </tr>
              </thead>
              <tbody>
                {bulkRows.map((row) => (
                  <tr key={row.roomId} className="border-t border-slate-100">
                    <td className="px-3 py-2">
                      <input type="checkbox" checked={row.selected} onChange={(e) => updateBulkRow(row.roomId, 'selected', e.target.checked)} aria-label={`Chọn phòng ${row.roomNumber}`} className="h-4 w-4 accent-teal-600" />
                    </td>
                    <th className="whitespace-nowrap px-3 py-2 text-left font-bold text-slate-700">Phòng {row.roomNumber}</th>
                    {(['oldElectric', 'newElectric', 'oldWater', 'newWater'] as const).map((field) => (
                      <td key={field} className="px-2 py-2">
                        <input type="number" min="0" value={row[field]} onChange={(e) => updateBulkRow(row.roomId, field, Number(e.target.value))} className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-teal-500" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {bulkRows.length === 0 && <p className="p-6 text-center text-xs text-slate-400">Chưa có phòng để nhập.</p>}
          </div>

          <button type="submit" className="w-full rounded-xl bg-slate-800 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-900">
            Lưu các phòng đã chọn
          </button>
        </form>
      </details>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';

export default function AssetsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('Tốt');
  const [roomId, setRoomId] = useState('');

  const fetchRooms = async () => {
    const res = await fetch('/api/admin/rooms');
    const data = await res.json();
    setRooms(data.rooms || []);
  };

  const fetchAssets = async () => {
    const res = await fetch('/api/admin/assets');
    const data = await res.json();
    setAssets(data.assets || []);
  };

  useEffect(() => { fetchRooms(); fetchAssets(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !roomId) return alert('Vui lòng nhập đủ thông tin!');

    const res = await fetch('/api/admin/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code, status, roomId }),
    });

    if (res.ok) {
      setName(''); setCode(''); fetchAssets();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa tài sản này?')) return;
    const res = await fetch(`/api/admin/assets?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchAssets();
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Quản Lý Tài Sản</h1>
        <p className="text-xs text-slate-500">Kiểm kê thiết bị đồ đạc các phòng</p>
      </div>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Thêm Đồ Đạc</h2>
        <div className="space-y-2">
          <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full border p-2.5 rounded-xl text-sm bg-white" required>
            <option value="">-- Chọn phòng --</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>Phòng {r.roomNumber}</option>)}
          </select>
          <input type="text" placeholder="Tên tài sản (Tủ lạnh, Điều hòa...)" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2.5 rounded-xl text-sm" required />
          <div className="grid grid-cols-2 gap-2">
            <input type="text" placeholder="Mã / Serial (Tùy chọn)" value={code} onChange={(e) => setCode(e.target.value)} className="border p-2.5 rounded-xl text-sm" />
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2.5 rounded-xl text-sm bg-white">
              <option value="Tốt">Tốt</option>
              <option value="Bảo trì">Bảo trì</option>
              <option value="Hỏng">Hỏng</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full bg-amber-600 text-white py-2.5 rounded-xl text-sm font-bold">Thêm Tài Sản</button>
      </form>

      <div className="space-y-2">
        {assets.map((a) => (
          <div key={a.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm">{a.name}</span>
              <p className="text-slate-500">Phòng {a.room?.roomNumber} • Mã: {a.code || 'N/A'}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">{a.status}</span>
              <button onClick={() => handleDelete(a.id)} className="text-red-600 font-medium">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

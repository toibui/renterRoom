'use client';
import { useState, useEffect } from 'react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomNumber, setRoomNumber] = useState('');
  const [rentPrice, setRentPrice] = useState('');

  const fetchRooms = async () => {
    const res = await fetch('/api/admin/rooms');
    const data = await res.json();
    setRooms(data.rooms || []);
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomNumber, rentPrice }),
    });

    if (res.ok) {
      setRoomNumber('');
      setRentPrice('');
      fetchRooms();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phòng này?')) return;
    const res = await fetch(`/api/admin/rooms?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchRooms();
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/phong/${token}`;
    navigator.clipboard.writeText(url);
    alert(`Đã sao chép link gửi khách:\n${url}`);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Quản lý phòng</h1>
        <p className="text-xs text-slate-500">Tạo phòng và lấy link truy cập gửi khách</p>
      </div>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-800">Thêm phòng mới</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Số phòng (VD: P101)"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Giá thuê (VNĐ/Tháng)"
            value={rentPrice}
            onChange={(e) => setRentPrice(e.target.value)}
            className="border p-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold">
          Thêm phòng
        </button>
      </form>

      <div className="space-y-3">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-900">Phòng {room.roomNumber}</h3>
              <p className="text-xs text-blue-600 font-semibold">{room.rentPrice.toLocaleString()} VNĐ/tháng</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => copyLink(room.accessToken)} className="bg-slate-100 active:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-medium">
                📋 Sao chép liên kết
              </button>
              <button onClick={() => handleDelete(room.id)} className="bg-red-50 text-red-600 px-2.5 py-1.5 rounded-xl text-xs font-medium">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

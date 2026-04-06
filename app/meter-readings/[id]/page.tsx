'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrapping params
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    roomNumber: '',
    electricOld: 0,
    electricNew: '',
    waterOld: 0,
    waterNew: ''
  });

  // Load dữ liệu cũ lên form
  useEffect(() => {
    fetch(`/api/meter-readings/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          roomNumber: data.room.roomNumber,
          electricOld: data.electricOld,
          electricNew: data.electricNew,
          waterOld: data.waterOld,
          waterNew: data.waterNew
        });
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/meter-readings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        alert("Cập nhật thành công! Hãy nhớ bấm 'Tạo lại Bill' ở danh sách.");
        router.push('/meter-readings');
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
        <h1 className="text-xl font-bold mb-6">Chỉnh sửa chỉ số - Phòng {form.roomNumber}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
            <h2 className="col-span-2 font-bold text-amber-800 text-sm">⚡ ĐIỆN</h2>
            <div>
              <label className="block text-[10px] font-bold text-amber-600 uppercase">Số cũ</label>
              <input 
                type="number" 
                className="w-full bg-white border border-amber-200 rounded p-2 font-bold"
                value={form.electricOld}
                onChange={e => setForm({...form, electricOld: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-amber-600 uppercase">Số mới</label>
              <input 
                type="number" 
                className="w-full bg-white border border-amber-200 rounded p-2 font-bold"
                value={form.electricNew}
                onChange={e => setForm({...form, electricNew: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h2 className="col-span-2 font-bold text-blue-800 text-sm">💧 NƯỚC</h2>
            <div>
              <label className="block text-[10px] font-bold text-blue-600 uppercase">Số cũ</label>
              <input 
                type="number" 
                className="w-full bg-white border border-blue-200 rounded p-2 font-bold"
                value={form.waterOld}
                onChange={e => setForm({...form, waterOld: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-600 uppercase">Số mới</label>
              <input 
                type="number" 
                className="w-full bg-white border border-blue-200 rounded p-2 font-bold"
                value={form.waterNew}
                onChange={e => setForm({...form, waterNew: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="flex-1 py-3 font-bold text-gray-400 hover:bg-gray-100 rounded-xl"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300"
            >
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
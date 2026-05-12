'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function EditReadingPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sort] = useState<'asc' | 'desc'>('desc');

  const [form, setForm] = useState({
    roomNumber: '',
    electricOld: 0,
    electricNew: 0,
    waterOld: 0,
    waterNew: 0
  });

  // LOAD DATA
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

  // UPDATE
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
        alert("Cập nhật thành công!");
        router.push('/meter-readings');
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  // DELETE
  const handleDelete = async () => {
    const confirmDelete = confirm("Bạn có chắc muốn xóa bản ghi này?");
    if (!confirmDelete) return;

    setSaving(true);

    try {
      const res = await fetch(`/api/meter-readings/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert("Đã xóa thành công!");
        router.push('/meter-readings');
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-200">

        {/* HEADER + SORT INFO */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">
            Phòng {form.roomNumber}
          </h1>

          <span className="text-xs text-gray-400">
            Sort: {sort === 'desc' ? 'Mới → Cũ' : 'Cũ → Mới'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ELECTRIC */}
          <div className="grid grid-cols-2 gap-4 bg-amber-50 p-4 rounded-xl border border-amber-100">
            <h2 className="col-span-2 font-bold text-amber-800 text-sm">
              ⚡ ĐIỆN
            </h2>

            <div>
              <label className="block text-[10px] font-bold text-amber-600 uppercase">
                Số cũ
              </label>
              <input
                type="number"
                className="w-full bg-white border border-amber-200 rounded p-2 font-bold"
                value={form.electricOld}
                onChange={e =>
                  setForm({
                    ...form,
                    electricOld: Number(e.target.value)
                  })
                }
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-amber-600 uppercase">
                Số mới
              </label>
              <input
                type="number"
                className="w-full bg-white border border-amber-200 rounded p-2 font-bold"
                value={form.electricNew}
                onChange={e =>
                  setForm({
                    ...form,
                    electricNew: Number(e.target.value)
                  })
                }
              />
            </div>
          </div>

          {/* WATER */}
          <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h2 className="col-span-2 font-bold text-blue-800 text-sm">
              💧 NƯỚC
            </h2>

            <div>
              <label className="block text-[10px] font-bold text-blue-600 uppercase">
                Số cũ
              </label>
              <input
                type="number"
                className="w-full bg-white border border-blue-200 rounded p-2 font-bold"
                value={form.waterOld}
                onChange={e =>
                  setForm({
                    ...form,
                    waterOld: Number(e.target.value)
                  })
                }
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-blue-600 uppercase">
                Số mới
              </label>
              <input
                type="number"
                className="w-full bg-white border border-blue-200 rounded p-2 font-bold"
                value={form.waterNew}
                onChange={e =>
                  setForm({
                    ...form,
                    waterNew: Number(e.target.value)
                  })
                }
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300"
            >
              Xóa
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300"
            >
              {saving ? 'Đang lưu...' : 'Lưu'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
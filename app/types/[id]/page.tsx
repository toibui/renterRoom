'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditTypePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [name, setName] = useState('');
  const [price, setPrice] = useState(''); // thêm state price
  const [duration, setDuration] = useState(''); // thêm state duration
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lấy thông tin Type theo ID
  useEffect(() => {
    if (!id) return;

    fetch(`/api/types/${id}`)
      .then(res => res.json())
      .then(data => {
        setName(data.name || '');
        setPrice(data.price ? data.price.toString() : ''); // convert Decimal -> string
        setDuration(data.duration ? data.duration.toString() : ''); // convert Number -> string
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name,
          price: price ? parseFloat(price) : null, // convert string -> number
          duration: duration ? parseInt(duration) : null, // convert string -> number
        }),
      });

      if (!res.ok) throw new Error();

      router.push('/types');
    } catch {
      alert('Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">
          Cập nhật Type
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tên loại hợp đồng */}
          <div>
            <label className="block mb-1 font-medium">
              Tên loại hợp đồng *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Giá hợp đồng */}
          <div>
            <label className="block mb-1 font-medium">
              Giá hợp đồng *
            </label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              step="0.01"  // nếu muốn decimal
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          {/* Số năm */}
          <div>
            <label className="block mb-1 font-medium">
              Số năm *
            </label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              required
              step="1"  // nếu muốn number
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/types')}
              className="px-4 py-2 border rounded-lg"
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
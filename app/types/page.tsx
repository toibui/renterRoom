'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type TypeItem = {
  id: string;
  name: string;
  price: number;
  duration: number;
};

export default function TypesPage() {
  const router = useRouter();
  const [types, setTypes] = useState<TypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tất cả Types
  useEffect(() => {
    fetch('/api/types')
      .then(res => res.json())
      .then(data => {
        setTypes(data);
        setLoading(false);
      });
  }, []);

  // Xoá Type
  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xoá?')) return;

    await fetch(`/api/types/${id}`, {
      method: 'DELETE',
    });

    setTypes(prev => prev.filter(t => t.id !== id));
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
      <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Types
          </h1>

          <button
            onClick={() => router.push('/types/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            + Thêm mới
          </button>
        </div>

        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 border">Tên gói</th>
              <th className="p-3 border">Giá gói</th>
              <th className="p-3 border">Số năm</th>
              <th className="p-3 border w-40">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {types.map(type => (
              <tr key={type.id}>
                <td className="p-3 border">{type.name}</td>
                  <td className="p-3 border">
                    {type.price ? Number(type.price).toLocaleString('vi-VN') : ''}
                  </td>
                  <td className="p-3 border">
                    {type.duration}
                  </td>

                <td className="p-3 border space-x-2">
                  <button
                    onClick={() => router.push(`/types/${type.id}`)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded"
                  >
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDelete(type.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
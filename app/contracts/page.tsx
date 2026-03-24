'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Contract = {
  id: string;
  no?: string;
  promote?: number;
  price?: number;
  dateContract: string;

  customer: {
    id: string;
    fullName: string;
    phone: string;
    idno?: string;
    iddate?: string;
    idplace?: string;
  };

  type: {
    name: string;
    price: number;
  };
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => {
        setContracts(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá hợp đồng này?')) return;

    await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString('vi-VN') : '-';

  const formatMoney = (money?: number) =>
    money ? money.toLocaleString('vi-VN') + ' đ' : '-';

  const filteredContracts = contracts.filter((c) => {
    const keyword = searchTerm.toLowerCase();

    return (
      c.customer.fullName.toLowerCase().includes(keyword) ||
      c.customer.phone.includes(keyword) ||
      c.customer.idno?.includes(keyword) ||
      c.no?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Quản lý hợp đồng
        </h1>

        <Link
          href="/contracts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
        >
          + Thêm hợp đồng
        </Link>
      </div>

      {/* SEARCH */}
      <div className="mb-4 flex gap-3 items-center">
        <input
          placeholder="Tìm khách hàng, CCCD, SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded-lg w-80"
        />

        <span className="text-sm text-gray-500">
          {filteredContracts.length} hợp đồng
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          Đang tải...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">

          <div className="overflow-auto max-h-[70vh]">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600 text-xs uppercase sticky top-0">
                <tr>
                  <th className="p-4 text-left">Khách hàng</th>
                  <th className="p-4 text-left">Số HĐ</th>
                  <th className="p-4 text-left">Gói</th>
                  <th className="p-4 text-left">Giá thu</th>
                  <th className="p-4 text-left">Ngày</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody>

                {filteredContracts.map((c) => (

                  <tr key={c.id} className="border-t hover:bg-blue-50/50">

                    {/* CUSTOMER */}
                    <td className="p-4">

                      <Link href={`/customers/${c.customer.id}`}>
                        <div className="cursor-pointer">

                          <div className="font-bold text-gray-900">
                            {c.customer.fullName}
                          </div>

                          <div className="text-blue-600 text-sm">
                            {c.customer.phone}
                          </div>

                          {/* CCCD */}
                          <div className="text-xs text-gray-500 mt-1">
                            {c.customer.idno || '-'}
                          </div>

                          <div className="text-[11px] text-gray-400 italic">
                            {c.customer.iddate
                              ? formatDate(c.customer.iddate)
                              : ''}{' '}
                            {c.customer.idplace
                              ? ` tại ${c.customer.idplace}`
                              : ''}
                          </div>

                        </div>
                      </Link>

                    </td>

                    {/* CONTRACT NO */}
                    <td className="p-4">
                      {c.no || '-'}
                    </td>

                    {/* TYPE */}
                    <td className="p-4">
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                        {c.type.name}
                      </span>
                    </td>

                    {/* PRICE (MAIN) */}
                    <td className="p-4">

                      <div className="relative group w-fit">

                        <div className="font-semibold text-green-600 cursor-pointer">
                          {formatMoney(c.price)}
                        </div>

                        {/* TOOLTIP */}
                        <div className="absolute hidden group-hover:block bg-white border shadow-lg rounded-lg p-3 text-xs w-48 z-10">

                          <div className="flex justify-between">
                            <span>Giá gốc:</span>
                            <span>{formatMoney(c.type.price)}</span>
                          </div>

                          <div className="flex justify-between text-red-500">
                            <span>Khuyến mại:</span>
                            <span>-{formatMoney(c.promote)}</span>
                          </div>

                        </div>

                      </div>

                    </td>

                    {/* DATE */}
                    <td className="p-4">
                      {formatDate(c.dateContract)}
                    </td>

                    {/* ACTION */}
                    <td className="p-4 text-center space-x-2">

                      <Link
                        href={`/contracts/${c.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </Link>

                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-red-500 hover:underline"
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
      )}

    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Renew = {
  id: string;
  renewNo: number;
  price: number;
  startDate: string;
  endDate: string;

  contract: {
    id: string;
    no?: string;

    customer: {
      fullName: string;
      phone: string;
    };

    type: {
      name: string;
    };
  };
};

export default function RenewContractsPage() {
  const [renews, setRenews] = useState<Renew[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/renew-contract')
      .then(res => res.json())
      .then(data => {
        setRenews(data);
        setLoading(false);
      });
  }, []);

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString('vi-VN') : '-';

  const formatMoney = (money?: number) =>
    money ? money.toLocaleString('vi-VN') + ' đ' : '-';

  const filtered = renews.filter((r) => {
    const keyword = searchTerm.toLowerCase();

    return (
      r.contract.customer.fullName.toLowerCase().includes(keyword) ||
      r.contract.customer.phone.includes(keyword) ||
      r.contract.no?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Gia hạn hợp đồng
        </h1>

        <Link
          href="/renew-contract/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg"
        >
          + Thêm gia hạn
        </Link>
      </div>

      {/* SEARCH */}
      <div className="mb-4 flex gap-3 items-center">
        <input
          placeholder="Tìm khách hàng, SĐT, số HĐ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-4 py-2 rounded-lg w-80"
        />

        <span className="text-sm text-gray-500">
          {filtered.length} lần gia hạn
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
                  <th className="p-4 text-left">Lần</th>
                  <th className="p-4 text-left">Gói</th>
                  <th className="p-4 text-left">Giá</th>
                  <th className="p-4 text-left">Thời gian</th>
                  <th className="p-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody>

                {filtered.map((r) => (

                  <tr key={r.id} className="border-t hover:bg-green-50/50">

                    {/* CUSTOMER */}
                    <td className="p-4">
                      <div className="font-bold">
                        {r.contract.customer.fullName}
                      </div>
                      <div className="text-blue-600 text-sm">
                        {r.contract.customer.phone}
                      </div>
                    </td>

                    {/* CONTRACT */}
                    <td className="p-4">
                      <Link
                        href={`/contracts/${r.contract.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {r.contract.no || '-'}
                      </Link>
                    </td>

                    {/* RENEW NO */}
                    <td className="p-4">
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs">
                        #{r.renewNo}
                      </span>
                    </td>

                    {/* TYPE */}
                    <td className="p-4">
                      {r.contract.type.name}
                    </td>

                    {/* PRICE */}
                    <td className="p-4 font-semibold text-green-600">
                      {formatMoney(r.price)}
                    </td>

                    {/* TIME */}
                    <td className="p-4 text-xs">
                      <div>{formatDate(r.startDate)}</div>
                      <div className="text-gray-400">
                        → {formatDate(r.endDate)}
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="p-4 text-center space-x-2">

                      <Link
                        href={`/renew-contracts/${r.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Sửa
                      </Link>

                      <button
                        onClick={() =>
                          setRenews(prev => prev.filter(x => x.id !== r.id))
                        }
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
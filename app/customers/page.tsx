'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Customer = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  pid?: string;
  dateOfBirth?: string;
  edd?: string;
  idno?: string;
  iddate?: string;
  idplace?: string;
  consulting?: any[];
  contract?: any[];
  channelMarketing?: { name: string } | null;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá khách hàng này?')) return;

    await fetch(`/api/customers/${id}`, { method: 'DELETE' });

    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  /* SEARCH FILTER */
  const filteredCustomers = customers.filter((c) => {
    const keyword = searchTerm.toLowerCase();

    return (
      c.fullName?.toLowerCase().includes(keyword) ||
      c.phone?.toLowerCase().includes(keyword) ||
      c.pid?.toLowerCase().includes(keyword) ||
      c.email?.toLowerCase().includes(keyword) ||
      c.idno?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Quản lý khách hàng
        </h1>

        <Link
          href="/customers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center"
        >
          <span className="mr-2">+</span> Thêm khách hàng
        </Link>
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>

          <input
            type="text"
            placeholder="Tìm tên, phone, PID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <span className="text-sm text-gray-500">
          {filteredCustomers.length} khách hàng
        </span>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500 animate-pulse">
          Đang tải dữ liệu khách hàng...
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
          {/* SCROLL CONTAINER */}
          <div className="overflow-x-auto overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <table className="w-full text-sm border-collapse relative">
              {/* TABLE HEADER */}
              <thead className="bg-gray-50 text-gray-600 sticky top-0 z-20 shadow-sm">
                <tr className="uppercase text-[11px] font-semibold tracking-wider">
                  <th className="p-4 text-left sticky left-0 bg-gray-50 z-30 border-b">
                    Khách hàng
                  </th>

                  <th className="p-4 text-left border-b whitespace-nowrap">
                    Liên hệ
                  </th>

                  <th className="p-4 text-left border-b whitespace-nowrap">
                    Định danh (ID)
                  </th>

                  <th className="p-4 text-left border-b whitespace-nowrap">
                    Ngày sinh / Dự sinh
                  </th>

                  <th className="p-4 text-left border-b whitespace-nowrap">
                    PID / Nguồn
                  </th>

                  <th className="p-4 text-center border-b whitespace-nowrap">
                    Tư vấn
                  </th>

                  <th className="p-4 text-center border-b whitespace-nowrap">
                    Hợp đồng
                  </th>

                  <th className="p-4 text-left border-b whitespace-nowrap">
                    Địa chỉ / Email
                  </th>

                  <th className="p-4 text-center sticky right-0 bg-gray-50 z-30 border-b">
                    Thao tác
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/50 transition-colors group"
                  >
                    {/* NAME */}
                    <td className="p-4 sticky left-0 bg-white group-hover:bg-blue-50/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="font-bold text-gray-900 whitespace-nowrap">
                        {c.fullName}
                      </div>

                      <div className="text-[11px] text-gray-400">
                        ID: {c.id.slice(0, 8)}...
                      </div>
                    </td>

                    {/* PHONE */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="font-medium text-blue-600">
                        {c.phone}
                      </div>
                    </td>

                    {/* ID */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-gray-700">
                        {c.idno || '-'}
                      </div>

                      <div className="text-[11px] text-gray-400 italic">
                        {c.iddate ? formatDate(c.iddate) : ''}{' '}
                        {c.idplace ? ` tại ${c.idplace}` : ''}
                      </div>
                    </td>

                    {/* DOB */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-600">
                          🎂 {formatDate(c.dateOfBirth)}
                        </span>

                        {c.edd && (
                          <span className="text-[11px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded w-fit font-medium">
                            👶 Dự sinh: {formatDate(c.edd)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* PID */}
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-gray-700 font-medium">
                        {c.pid || '-'}
                      </div>

                      <div className="text-[11px] text-indigo-500">
                        {c.channelMarketing?.name || 'Không rõ nguồn'}
                      </div>
                    </td>

                    {/* CONSULTING */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-10 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {c.consulting?.length || 0}
                      </span>
                    </td>

                    {/* CONTRACT */}
                    <td className="p-4 whitespace-nowrap">
                      {c.contract && c.contract.length > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-green-600 font-semibold">
                            {c.contract[0].no}
                          </span>

                          <span className="text-[10px] text-gray-400">
                            ({formatDate(c.contract[0].dateContract)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>

                    {/* ADDRESS */}
                    <td className="p-4 max-w-[200px] truncate">
                      <div
                        className="truncate text-gray-600"
                        title={c.address}
                      >
                        {c.address || '-'}
                      </div>

                      <div className="text-[11px] text-gray-400 truncate">
                        {c.email || ''}
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="p-4 text-center sticky right-0 bg-white group-hover:bg-blue-50/50 z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/customers/${c.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          ✎ Sửa
                        </Link>

                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-10 text-gray-400"
                    >
                      Không tìm thấy khách hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCROLLBAR STYLE */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
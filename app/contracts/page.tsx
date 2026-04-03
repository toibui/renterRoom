'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Renew = {
  renewNo: number;
  startDate: string;
  endDate: string;
};

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
    email?: string;
  };

  type: {
    name: string;
    price: number;
    duration?: number;
  };

  renewContracts: Renew[];
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = () => {
    setLoading(true);
    fetch('/api/contracts')
      .then(res => res.json())
      .then(data => {
        setContracts(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString('vi-VN') : '-';

  const formatMoney = (money?: number) =>
    money ? money.toLocaleString('vi-VN') + ' đ' : '-';

  const getEndDate = (c: Contract) => {
    const latestRenew = c.renewContracts?.[0];

    if (latestRenew) {
      return new Date(latestRenew.endDate);
    }

    if (c.type.duration) {
      const d = new Date(c.dateContract);
      d.setFullYear(d.getFullYear() + c.type.duration);
      return d;
    }

    return null;
  };

  const getStatus = (endDate: Date | null) => {
    if (!endDate) return { text: '-', color: '' };

    const now = new Date();
    const diffMonths =
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (diffMonths <= 0) {
      return { text: 'Hết hạn', color: 'text-red-500' };
    }

    if (diffMonths <= 6) {
      return { text: 'Sắp hết hạn', color: 'text-orange-500' };
    }

    return { text: 'Còn hạn', color: 'text-green-600' };
  };

  // 🔥 XÓA CONTRACT
  const handleDelete = async (id: string) => {
    const confirmDelete = confirm('Bạn có chắc muốn xóa hợp đồng này?');

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('Xóa thành công');
        fetchContracts(); // reload lại list
      } else {
        alert('Xóa thất bại');
      }
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Quản lý hợp đồng
        </h1>

        <Link
          href="/contracts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Thêm hợp đồng
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Khách hàng</th>
              <th className="p-4">Số HĐ</th>
              <th className="p-4">Gói</th>
              <th className="p-4">Giá</th>
              <th className="p-4">Ngày ký</th>
              <th className="p-4">Hết hạn</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Gia hạn</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {contracts.map(c => {
              const endDate = getEndDate(c);
              const status = getStatus(endDate);
              const latestRenew = c.renewContracts?.[0];

              return (
                <tr key={c.id} className="border-t hover:bg-blue-50">

                  <td className="p-4">
                    <div className="font-bold">
                      {c.customer.fullName}
                    </div>
                    <div className="text-blue-600 text-sm">
                      {c.customer.phone}
                    </div>
                  </td>

                  <td className="p-4">{c.no || '-'}</td>

                  <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                      {c.type.name}
                    </span>
                  </td>

                  <td className="p-4 text-green-600 font-semibold">
                    {formatMoney(c.price)}
                  </td>

                  <td className="p-4">
                    {formatDate(c.dateContract)}
                  </td>

                  <td className="p-4">
                    {endDate ? formatDate(endDate.toISOString()) : '-'}
                  </td>

                  <td className={`p-4 font-semibold ${status.color}`}>
                    {status.text}
                  </td>

                  {/* RENEW */}
                  <td className="p-4 text-center">
                    {latestRenew && (
                      <div className="text-xs text-gray-500 mb-1">
                        Lần #{latestRenew.renewNo}
                      </div>
                    )}

                    {status.text !== 'Còn hạn' && (
                      <Link
                        href={`/renew-contract/new?contractId=${c.id}`}
                        className="text-green-600 hover:underline"
                      >
                        Gia hạn
                      </Link>
                    )}
                  </td>

                  {/* ACTION */}
                  <td className="p-4 text-center space-x-2">

                    {/* EDIT */}
                    <Link
                      href={`/contracts/${c.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </Link>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-600 hover:underline"
                    >
                      Xóa
                    </button>

                  </td>

                </tr>
              );
            })}
          </tbody>

        </table>

      </div>

    </div>
  );
}